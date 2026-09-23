import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (productId: string, size: number, color: string) => void;
  updateQuantity: (productId: string, size: number, color: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  itemCount: number;
  promoCode: string;
  appliedPromo: string | null;
  setPromoCode: (code: string) => void;
  applyPromo: () => boolean;
  removePromo: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('bgy_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(() => {
    return localStorage.getItem('bgy_promo') || null;
  });

  useEffect(() => {
    localStorage.setItem('bgy_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (appliedPromo) {
      localStorage.setItem('bgy_promo', appliedPromo);
    } else {
      localStorage.removeItem('bgy_promo');
    }
  }, [appliedPromo]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setCart(prev => {
      const existingIndex = prev.findIndex(
        i => i.productId === item.productId && i.size === item.size && i.color === item.color
      );

      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(next[existingIndex].quantity + quantity, item.maxStock || 10);
        next[existingIndex] = { ...next[existingIndex], quantity: newQty };
        return next;
      }

      return [...prev, { ...item, quantity: Math.min(quantity, item.maxStock || 10) }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, size: number, color: string) => {
    setCart(prev => prev.filter(i => !(i.productId === productId && i.size === size && i.color === color)));
  };

  const updateQuantity = (productId: string, size: number, color: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, size, color);
      return;
    }
    setCart(prev =>
      prev.map(i => {
        if (i.productId === productId && i.size === size && i.color === color) {
          return { ...i, quantity: Math.min(quantity, i.maxStock || 10) };
        }
        return i;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedPromo(null);
  };

  const applyPromo = (): boolean => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'BGY10' || code === 'FIRSTBGY' || code === 'SNEAKERHEAD') {
      setAppliedPromo(code);
      setPromoCode('');
      return true;
    }
    return false;
  };

  const removePromo = () => {
    setAppliedPromo(null);
  };

  const subtotal = cart.reduce((acc, curr) => acc + curr.price * curr.quantity, 0);
  const shipping = subtotal === 0 ? 0 : 3000;
  const discount = appliedPromo ? Math.round(subtotal * 0.1) : 0;
  const total = Math.max(0, subtotal + shipping - discount);
  const itemCount = cart.reduce((acc, curr) => acc + curr.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        subtotal,
        shipping,
        discount,
        total,
        itemCount,
        promoCode,
        appliedPromo,
        setPromoCode,
        applyPromo,
        removePromo,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
