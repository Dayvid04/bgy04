import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Heart, ShoppingBag, User as UserIcon,
  Menu, X, Shield, LogOut, Sun, Moon,
} from 'lucide-react';
import { BgyLogo } from './BgyLogo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { pluralize } from '../../utils/pluralize';
import { useSiteContent } from '../../context/SiteContentContext';

interface NavbarProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
  onOpenSearch: () => void;
}

// ─── single source of truth for nav links ────────────────────────────────────
// Consumed by both the desktop inline nav and the mobile drawer.
// ─────────────────────────────────────────────────────────────────────────────

const MOBILE_MENU_ID = 'bgy-mobile-menu';

export const Navbar: React.FC<NavbarProps> = ({
  currentRoute,
  onNavigate,
  onOpenSearch,
}) => {
  const { user, isAuthenticated, isAdmin, openAuthModal, logout } = useAuth();
  const { openCart, itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { t } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const { content } = useSiteContent();

  const [isScrolled, setIsScrolled]       = useState(false);
  const [menuOpen, setMenuOpen]           = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const hamburgerRef  = useRef<HTMLButtonElement>(null);
  const menuRef       = useRef<HTMLElement>(null);
  const dropdownRef   = useRef<HTMLDivElement>(null);

  // ── single source of truth ──────────────────────────────────────────────
  const navLinks = [
    { id: 'shop',    label: content.navShop || t('nav.shop')    },
    { id: 'new-in',  label: content.navNewIn || t('nav.newIn')   },
    { id: 'about',   label: content.navAbout || t('nav.about')   },
    { id: 'contact', label: content.navContact || t('nav.contact') },
  ];

  // ── scroll detection ────────────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── close everything on route change ───────────────────────────────────
  useEffect(() => {
    closeMenu();
    setUserDropdownOpen(false);
  }, [currentRoute]);

  // ── close user dropdown on outside click ───────────────────────────────
  useEffect(() => {
    if (!userDropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [userDropdownOpen]);

  // ── close menu when viewport grows past the measured fit width ─────────
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const handler = (e: MediaQueryListEvent) => { if (e.matches) closeMenu(); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── body-scroll lock (no layout jump) ──────────────────────────────────
  useEffect(() => {
    if (!menuOpen) return;
    const scrollY = window.scrollY;
    const prev = document.body.style.cssText;
    document.body.style.cssText =
      `position:fixed;top:-${scrollY}px;left:0;right:0;overflow-y:scroll;`;
    return () => {
      document.body.style.cssText = prev;
      window.scrollTo(0, scrollY);
    };
  }, [menuOpen]);

  // ── focus trap inside open menu ────────────────────────────────────────
  useEffect(() => {
    if (!menuOpen || !menuRef.current) return;

    // Move focus into the menu on open
    const firstFocusable = menuRef.current.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    firstFocusable?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { closeMenu(); return; }
      if (e.key !== 'Tab') return;

      const focusable = Array.from(
        menuRef.current!.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter(el => !el.closest('[hidden]'));

      if (focusable.length === 0) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last)  { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', trap);
    return () => document.removeEventListener('keydown', trap);
  }, [menuOpen]);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    // Return focus to hamburger after paint
    requestAnimationFrame(() => hamburgerRef.current?.focus());
  }, []);

  const handleNavClick = (id: string) => {
    closeMenu();
    onNavigate(id);
  };

  // ── reduced-motion preference ───────────────────────────────────────────
  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const drawerVariants = {
    hidden:  { opacity: 0, y: prefersReduced ? 0 : -8 },
    visible: { opacity: 1, y: 0 },
    exit:    { opacity: 0, y: prefersReduced ? 0 : -8 },
  };

  // ── shared button style helpers ─────────────────────────────────────────
  const iconBtn =
    'touch-target rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]';

  const menuItemBase = (active: boolean) =>
    `flex items-center justify-between rounded-xl border px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-mono min-h-[44px] transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914] ${
      active
        ? isDark
          ? 'border-white/20 bg-white text-black'
          : 'border-black/20 bg-neutral-200 text-neutral-950'
        : isDark
          ? 'border-white/10 bg-white/[0.03] text-white hover:bg-white/[0.07]'
          : 'border-black/10 bg-black/[0.02] text-neutral-950 hover:bg-black/[0.06]'
    }`;

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════════════
          HEADER BAR
      ═══════════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled
            ? 'bg-black/85 backdrop-blur-xl border-b border-neutral-800/80 shadow-lg'
            : 'bg-black/35 backdrop-blur-sm border-b border-transparent'
        }`}
        style={{
          paddingLeft: 'env(safe-area-inset-left, 0px)',
          paddingRight: 'env(safe-area-inset-right, 0px)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
            <button
              onClick={() => onNavigate('home')}
              className="shrink-0 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
              aria-label="BGY — go to home"
            >
              <BgyLogo size="md" />
            </button>

            <nav className="hidden md:flex flex-1 items-center justify-center gap-5 xl:gap-7" aria-label="Main navigation">
              {navLinks.map(link => {
                const isActive = currentRoute === link.id;
                return (
                  <button
                    key={link.id}
                    onClick={() => onNavigate(link.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative text-[10px] uppercase tracking-[0.2em] font-mono transition-all duration-200 rounded-full px-2 py-2 min-h-[40px] flex items-center justify-center ${
                      isActive ? 'text-white' : 'text-neutral-400 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="navIndicator"
                        className="absolute -bottom-1 left-1/2 h-[2px] w-7 -translate-x-1/2 bg-[#E50914] rounded-full"
                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                      />
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <button
                onClick={onOpenSearch}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors"
                aria-label={t('nav.search')}
              >
                <Search className="w-4 h-4" />
              </button>

              <button
                onClick={toggleTheme}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors"
                aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                onClick={() => onNavigate('wishlist')}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white relative transition-colors"
                aria-label={`${t('nav.wishlist')}${wishlistCount > 0 ? `, ${pluralize(wishlistCount, 'item')}` : ''}`}
              >
                <Heart className={`w-4 h-4 ${wishlistCount > 0 ? 'fill-[#E50914] text-[#E50914]' : ''}`} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-[#E50914] px-1 text-[9px] font-mono font-bold text-white">
                    {wishlistCount > 9 ? '9+' : wishlistCount}
                  </span>
                )}
              </button>

              <button
                onClick={openCart}
                className="hidden md:flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white relative transition-colors"
                aria-label={`${t('nav.cart')}${itemCount > 0 ? `, ${pluralize(itemCount, 'item')}` : ''}`}
              >
                <ShoppingBag className="w-4 h-4" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-white px-1 text-[9px] font-mono font-bold text-black">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserDropdownOpen(v => !v)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors"
                  aria-label="User menu"
                  aria-expanded={userDropdownOpen}
                  aria-haspopup="menu"
                >
                  {isAuthenticated ? (
                    <span className="relative flex h-5 min-w-5 items-center justify-center text-[10px] font-mono font-bold text-white">
                      {user?.name?.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase() || <UserIcon className="w-4 h-4" />}
                      <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-neutral-900" aria-label="Signed in" />
                    </span>
                  ) : <UserIcon className="w-4 h-4" />}
                </button>

                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      role="menu"
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-2rem)] bg-neutral-900 border border-neutral-800 rounded-xl shadow-xl py-2 z-50 text-xs font-sans text-neutral-300"
                    >
                      {isAuthenticated ? (
                        <>
                          <div className="px-4 py-2 border-b border-neutral-800 font-mono text-[11px] text-neutral-400">
                            {t('nav.signedInAs')}<br />
                            <span className="text-white font-bold truncate block max-w-[180px]">{user?.email}</span>
                          </div>
                          {isAdmin && (
                            <button
                              role="menuitem"
                              onClick={() => { setUserDropdownOpen(false); onNavigate('admin'); }}
                              className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 hover:text-white flex items-center gap-2 text-[#E50914] font-mono font-bold min-h-[44px]"
                            >
                              <Shield className="w-3.5 h-3.5 shrink-0" />
                              {t('nav.adminConsole')}
                            </button>
                          )}
                          <button
                            role="menuitem"
                            onClick={() => { setUserDropdownOpen(false); onNavigate('account'); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 hover:text-white flex items-center gap-2 min-h-[44px]"
                          >
                            <UserIcon className="w-3.5 h-3.5 shrink-0" />
                            {t('nav.myAccount')}
                          </button>
                          <button
                            role="menuitem"
                            onClick={() => { setUserDropdownOpen(false); logout(); }}
                            className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 hover:text-red-400 flex items-center gap-2 border-t border-neutral-800/80 mt-1 min-h-[44px]"
                          >
                            <LogOut className="w-3.5 h-3.5 shrink-0" />
                            {t('nav.signOut')}
                          </button>
                        </>
                      ) : (
                        <button
                          role="menuitem"
                          onClick={() => { setUserDropdownOpen(false); openAuthModal('login'); }}
                          className="w-full px-4 py-2.5 text-left hover:bg-neutral-800 hover:text-white min-h-[44px] flex items-center"
                        >
                          {t('nav.signIn')}
                        </button>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                ref={hamburgerRef}
                onClick={() => setMenuOpen(v => !v)}
                className="md:hidden flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 text-neutral-200 hover:border-neutral-500 hover:text-white transition-colors"
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
                aria-controls={MOBILE_MENU_ID}
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="pb-3 md:hidden">
            <button
              onClick={onOpenSearch}
              className="flex h-11 w-full items-center gap-3 rounded-full border border-neutral-700 bg-neutral-900/80 px-4 text-left text-sm text-neutral-300 transition-colors hover:border-neutral-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
              aria-label={t('nav.search')}
            >
              <Search className="h-4 w-4 shrink-0 text-neutral-400" aria-hidden="true" />
              <span className="truncate">Search shoes...</span>
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════════════════════
          MOBILE MENU OVERLAY + DRAWER  (< 768 px only)
          – rendered in a portal-like position above the header content
          – hidden from assistive tech when closed via aria-hidden
      ═══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 md:hidden"
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReduced ? 0 : 0.18 }}
              onClick={closeMenu}
              aria-hidden="true"
            />

            {/* Drawer panel */}
            <motion.nav
              key="drawer"
              id={MOBILE_MENU_ID}
              ref={menuRef}
              aria-label="Mobile navigation"
              role="dialog"
              aria-modal="true"
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: prefersReduced ? 0 : 0.22, ease: 'easeOut' }}
              className={`fixed inset-x-3 z-[60] md:hidden rounded-[24px] border backdrop-blur-2xl overflow-y-auto ${
                isDark
                  ? 'border-white/10 bg-[#050505]/96 shadow-[0_24px_64px_rgba(0,0,0,0.7)]'
                  : 'border-black/10 bg-white/96 shadow-[0_24px_64px_rgba(15,23,42,0.14)]'
              }`}
              style={{
                top: 'calc(var(--header-height, 72px) + 8px)',
                maxHeight: 'calc(100dvh - var(--header-height, 72px) - 24px)',
                paddingBottom: 'env(safe-area-inset-bottom, 12px)',
              }}
            >
              <div className="flex flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">

                {/* ── Page nav links (same array as desktop) ─────────── */}
                {navLinks.map(link => {
                  const isActive = currentRoute === link.id;
                  return (
                    <button
                      key={link.id}
                      onClick={() => handleNavClick(link.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={menuItemBase(isActive)}
                    >
                      <span>{link.label}</span>
                      {isActive && (
                        <span
                          aria-hidden="true"
                          className="w-1.5 h-1.5 rounded-full bg-[#E50914] shrink-0"
                        />
                      )}
                    </button>
                  );
                })}

                {/* ── Divider ─────────────────────────────────────────── */}
                <div
                  aria-hidden="true"
                  className={`h-px mx-2 my-0.5 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
                />

                {/* ── Utility: Search ─────────────────────────────────── */}
                <button
                  onClick={() => { closeMenu(); onOpenSearch(); }}
                  className={menuItemBase(false)}
                >
                  <span>{t('nav.search')}</span>
                  <Search className="w-4 h-4 shrink-0" aria-hidden="true" />
                </button>

                {/* ── Utility: Wishlist ───────────────────────────────── */}
                <button
                  onClick={() => handleNavClick('wishlist')}
                  className={menuItemBase(currentRoute === 'wishlist')}
                >
                  <span>
                    {t('nav.wishlist')}
                    {wishlistCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#E50914] text-white text-[9px] font-mono font-bold">
                        {wishlistCount}
                      </span>
                    )}
                  </span>
                  <Heart className={`w-4 h-4 shrink-0 ${wishlistCount > 0 ? 'fill-[#E50914] text-[#E50914]' : ''}`} aria-hidden="true" />
                </button>

                {/* ── Utility: Theme toggle ───────────────────────────── */}
                <button
                  onClick={() => { closeMenu(); toggleTheme(); }}
                  className={menuItemBase(false)}
                >
                  <span>{isDark ? t('nav.lightMode') : t('nav.darkMode')}</span>
                  {isDark
                    ? <Sun  className="w-4 h-4 text-yellow-400 shrink-0" aria-hidden="true" />
                    : <Moon className="w-4 h-4 text-blue-500  shrink-0" aria-hidden="true" />
                  }
                </button>

                {/* ── Divider ─────────────────────────────────────────── */}
                <div
                  aria-hidden="true"
                  className={`h-px mx-2 my-0.5 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}
                />

                {/* ── Account section ─────────────────────────────────── */}
                {isAuthenticated ? (
                  <>
                    {isAdmin && (
                      <button
                        onClick={() => handleNavClick('admin')}
                        className="flex items-center justify-between rounded-xl border border-[#E50914]/30 bg-[#E50914]/10 px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-mono text-[#E50914] min-h-[44px] transition-all hover:bg-[#E50914]/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
                      >
                        <span>{t('nav.adminConsole')}</span>
                        <Shield className="w-4 h-4 shrink-0" aria-hidden="true" />
                      </button>
                    )}
                    <button
                      onClick={() => handleNavClick('account')}
                      className={menuItemBase(currentRoute === 'account')}
                    >
                      <span>{t('nav.myAccount')}</span>
                      <UserIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                    <button
                      onClick={() => { closeMenu(); logout(); }}
                      className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-mono text-red-400 min-h-[44px] transition-all hover:bg-red-500/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
                    >
                      <span>{t('nav.signOut')}</span>
                      <LogOut className="w-4 h-4 shrink-0" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => { closeMenu(); openAuthModal('login'); }}
                    className={`flex items-center justify-between rounded-xl bg-[#E50914] px-3 py-2 text-left text-[10px] uppercase tracking-[0.18em] font-mono min-h-[44px] transition-all hover:bg-red-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${isDark ? 'text-white' : 'text-neutral-950'}`}
                  >
                    <span>{t('nav.signIn')}</span>
                    <UserIcon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  </button>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
