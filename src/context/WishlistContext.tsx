import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { Product } from '../types';

interface WishlistContextType {
  wishlistIds: string[];
  wishlistProducts: Product[];
  toggleWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  wishlistCount: number;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('bgy_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);

  const refreshWishlist = async () => {
    if (isAuthenticated && user) {
      try {
        const res = await api.getWishlist();
        if (res?.ids) {
          setWishlistIds(res.ids);
          setWishlistProducts(res.products || []);
          return;
        }
      } catch (err) {
        console.warn('Unable to sync server wishlist, falling back to local list:', err);
      }
    }

    // Guest or unauthenticated fallback
    if (wishlistIds.length > 0) {
      try {
        const res = await api.getProducts();
        const filtered = res.products.filter(p => wishlistIds.includes(p._id));
        setWishlistProducts(filtered);
      } catch {
        // ignore
      }
    } else {
      setWishlistProducts([]);
    }
  };

  useEffect(() => {
    let isMounted = true;
    refreshWishlist().catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user?._id]);

  useEffect(() => {
    try {
      localStorage.setItem('bgy_wishlist', JSON.stringify(wishlistIds));
    } catch {
      // ignore
    }
  }, [wishlistIds]);

  const toggleWishlist = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const res = await api.toggleWishlist(productId);
        setWishlistIds(res.ids);
        await refreshWishlist();
        return;
      } catch (e) {
        console.error('Error toggling wishlist on server:', e);
      }
    }

    // Local fallback
    setWishlistIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const removeFromWishlist = async (productId: string) => {
    if (isInWishlist(productId)) {
      await toggleWishlist(productId);
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistProducts,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        wishlistCount: wishlistIds.length,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
