import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { ThemeProvider } from './context/ThemeContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { SearchModal } from './components/common/SearchModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';

import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AccountPage } from './pages/AccountPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { AdminPage } from './pages/AdminPage';
import { useAuth } from './context/AuthContext';

type Route = 'home' | 'shop' | 'new-in' | 'product' | 'checkout' | 'account' | 'about' | 'contact' | 'admin' | 'wishlist';

export function AppContent() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [currentRoute, setCurrentRoute] = useState<Route>('home');
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_bgy_aero_1');
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [shopCategory, setShopCategory] = useState('All');
  const [shopSearch, setShopSearch] = useState('');
  const [shopGender, setShopGender] = useState<'men' | 'women' | undefined>(undefined);

  useEffect(() => {
    if (!authLoading && isAdmin) {
      setCurrentRoute('admin');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [authLoading, isAdmin]);

  const navigateTo = (route: string, gender?: 'men' | 'women') => {
    if (route === 'wishlist') {
      setCurrentRoute('account');
      return;
    }
    if (route === 'shop' && gender) {
      setShopGender(gender);
    } else if (route === 'shop') {
      setShopGender(undefined);
    }
    setCurrentRoute(route as Route);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentRoute('product');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewAllSearchResults = (query: string) => {
    setShopSearch(query);
    setShopCategory('All');
    setCurrentRoute('shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#E50914] selection:text-white">
      {currentRoute !== 'admin' && (
        <Navbar
          currentRoute={currentRoute}
          onNavigate={navigateTo}
          onOpenSearch={() => setSearchModalOpen(true)}
        />
      )}

      {/* 3. Global Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectProduct={handleSelectProduct}
        onViewAllResults={handleViewAllSearchResults}
      />

      {/* 4. Slide-Out Cart Drawer */}
      <CartDrawer
        onNavigateToCheckout={() => navigateTo('checkout')}
        onNavigateToShop={() => navigateTo('shop')}
      />

      {/* 5. User Sign-In / Register Modal */}
      <AuthModal />

      {/* 6. Active Page Content with Route Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentRoute + (currentRoute === 'product' ? selectedProductId : '')}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            {currentRoute === 'home' && (
              <HomePage
                onNavigate={navigateTo}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentRoute === 'shop' && (
              <ShopPage
                onSelectProduct={handleSelectProduct}
                initialCategory={shopCategory}
                initialSearch={shopSearch}
                initialGender={shopGender}
              />
            )}

            {currentRoute === 'new-in' && (
              <ShopPage
                onSelectProduct={handleSelectProduct}
                initialCategory="All"
                newArrivalsOnly
              />
            )}

            {currentRoute === 'product' && (
              <ProductDetailPage
                productId={selectedProductId}
                onNavigate={navigateTo}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentRoute === 'checkout' && (
              <CheckoutPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'account' && (
              <AccountPage
                onNavigate={navigateTo}
                onSelectProduct={handleSelectProduct}
              />
            )}

            {currentRoute === 'about' && (
              <AboutPage onNavigate={navigateTo} />
            )}

            {currentRoute === 'contact' && (
              <ContactPage />
            )}

            {currentRoute === 'admin' && (
              <AdminPage onNavigate={navigateTo} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {currentRoute !== 'admin' && <Footer onNavigate={navigateTo} />}
    </div>
  );
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('BGY ErrorBoundary intercepted an unhandled error:', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('bgy_token');
    } catch {
      // ignore
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="max-w-md w-full p-8 border border-neutral-800 bg-[#0C0C0C] rounded-2xl shadow-2xl">
            <span className="inline-block px-3 py-1 rounded-full bg-[#E50914]/10 text-[#E50914] text-xs font-mono uppercase tracking-widest mb-4">
              Storefront Recovery
            </span>
            <h1 className="font-display font-black text-2xl tracking-tight mb-2">
              Session Resynchronized
            </h1>
            <p className="text-xs font-mono text-neutral-400 leading-relaxed mb-6">
              A temporary initialization or authentication state discrepancy was safely intercepted. Your bag and local preferences remain intact.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-3.5 rounded-full bg-white text-black hover:bg-neutral-200 font-mono text-xs uppercase tracking-widest font-bold transition-all"
            >
              Resume Storefront
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <AppContent />
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
