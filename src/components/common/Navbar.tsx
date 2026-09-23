import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Heart, ShoppingBag, User as UserIcon, Menu, X, Shield, LogOut, Sun, Moon } from 'lucide-react';
import { BgyLogo } from './BgyLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { openCart, itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { id: 'shop', label: t('nav.shop') },
    { id: 'new-in', label: t('nav.newIn') },
    { id: 'about', label: t('nav.about') },
    { id: 'contact', label: t('nav.contact') },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'py-3.5 bg-black/85 backdrop-blur-xl border-b border-neutral-800/80 shadow-lg'
            : 'py-5 bg-transparent border-b border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Left: BGY Animated Logo */}
          <div
            onClick={() => onNavigate('home')}
            className="cursor-pointer group flex items-center"
          >
            <BgyLogo size="md" />
          </div>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(link => {
              const isActive = currentRoute === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onNavigate(link.id)}
                  className={`text-xs uppercase tracking-[0.2em] font-mono transition-all duration-200 relative py-1 ${
                    isActive ? 'text-white font-bold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E50914]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            {/* Language Switcher (EN | FR) */}
            <div
              className="flex items-center bg-neutral-900/90 border border-neutral-800 rounded-full px-1 py-0.5 text-[11px] font-mono font-bold tracking-wider"
              role="group"
              aria-label="Language selection"
            >
              <button
                type="button"
                onClick={() => setLanguage('en')}
                className={`px-2 py-1 rounded-full transition-all duration-200 ${
                  language === 'en'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="English"
              >
                EN
              </button>
              <span className="text-neutral-700 px-0.5 select-none text-[10px]">|</span>
              <button
                type="button"
                onClick={() => setLanguage('fr')}
                className={`px-2 py-1 rounded-full transition-all duration-200 ${
                  language === 'fr'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-neutral-400 hover:text-white'
                }`}
                title="Français"
              >
                FR
              </button>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full border border-neutral-800 bg-neutral-900/90 text-neutral-300 hover:text-white hover:border-neutral-600 transition-all duration-200"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Search */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-full transition-colors"
              title={t('nav.search')}
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Wishlist */}
            <button
              onClick={() => onNavigate('wishlist')}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-full transition-colors relative"
              title={t('nav.wishlist')}
            >
              <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${wishlistCount > 0 ? 'fill-[#E50914] text-[#E50914]' : ''}`} />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#E50914] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Shopping Cart */}
            <button
              onClick={openCart}
              className="p-2 text-neutral-300 hover:text-white hover:bg-neutral-800/60 rounded-full transition-colors relative"
              title={t('nav.cart')}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              {itemCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white text-black text-[10px] font-mono font-bold flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Account / User Menu */}
            <div className="relative">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 p-1.5 sm:px-3 sm:py-1.5 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-700 text-xs font-mono text-white transition-colors"
                  >
                    <div className="w-5 h-5 rounded-full bg-[#E50914] flex items-center justify-center text-white text-[10px] font-bold">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline-block max-w-[90px] truncate">{user?.name}</span>
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {userDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-48 bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl py-2 z-50 text-xs font-sans text-neutral-300"
                      >
                        <div className="px-4 py-2 border-b border-neutral-800 font-mono text-[11px] text-neutral-400">
                          {t('nav.signedInAs')} <br />
                          <span className="text-white font-bold truncate block">{user?.email}</span>
                        </div>

                        {isAdmin && (
                          <button
                            onClick={() => {
                              setUserDropdownOpen(false);
                              onNavigate('admin');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-neutral-800 hover:text-white flex items-center gap-2 text-[#E50914] font-mono font-bold"
                          >
                            <Shield className="w-3.5 h-3.5" />
                            {t('nav.adminConsole')}
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            onNavigate('account');
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-800 hover:text-white flex items-center gap-2"
                        >
                          <UserIcon className="w-3.5 h-3.5" />
                          {t('nav.myAccount')}
                        </button>

                        <button
                          onClick={() => {
                            setUserDropdownOpen(false);
                            logout();
                          }}
                          className="w-full px-4 py-2 text-left hover:bg-neutral-800 hover:text-red-400 flex items-center gap-2 border-t border-neutral-800/80 mt-1"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          {t('nav.signOut')}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-3.5 py-1.5 rounded-full border border-neutral-700 hover:border-white text-xs font-mono uppercase tracking-wider text-neutral-200 hover:text-white transition-all duration-200"
                >
                  {t('nav.signIn')}
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-300 hover:text-white rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="fixed top-[65px] left-0 right-0 z-30 bg-black/95 backdrop-blur-2xl border-b border-neutral-800 p-6 md:hidden"
          >
            <div className="flex flex-col space-y-4">
              {/* Mobile Language Switcher */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">Language / Langue</span>
                <div className="flex items-center bg-neutral-900 border border-neutral-800 rounded-full p-0.5 text-xs font-mono font-bold">
                  <button
                    onClick={() => setLanguage('en')}
                    className={`px-3 py-1 rounded-full ${
                      language === 'en' ? 'bg-white text-black' : 'text-neutral-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage('fr')}
                    className={`px-3 py-1 rounded-full ${
                      language === 'fr' ? 'bg-white text-black' : 'text-neutral-400'
                    }`}
                  >
                    Français
                  </button>
                </div>
              </div>

              {/* Mobile Theme Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400">
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-xs font-mono text-white"
                >
                  {isDark ? <Sun className="w-3.5 h-3.5 text-yellow-400" /> : <Moon className="w-3.5 h-3.5 text-blue-400" />}
                  {isDark ? 'Light' : 'Dark'}
                </button>
              </div>

              {navLinks.map(link => (
                <button
                  key={link.id}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate(link.id);
                  }}
                  className={`text-left text-sm uppercase font-mono tracking-widest py-2 border-b border-neutral-900 ${
                    currentRoute === link.id ? 'text-[#E50914] font-bold' : 'text-neutral-300'
                  }`}
                >
                  {link.label}
                </button>
              ))}

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigate('admin');
                  }}
                  className="text-left text-sm uppercase font-mono tracking-widest py-2 text-[#E50914] flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" /> {t('nav.adminConsole')}
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('account');
                }}
                className="text-left text-sm uppercase font-mono tracking-widest py-2 text-neutral-300 flex items-center gap-2"
              >
                <UserIcon className="w-4 h-4" /> {t('nav.myAccount')}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
