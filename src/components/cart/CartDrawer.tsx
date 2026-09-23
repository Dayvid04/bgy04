import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Plus, Minus, Trash2, ArrowRight, ShoppingBag, Sparkles } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
}) => {
  const {
    cart,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    discount,
    total,
    promoCode,
    setPromoCode,
    appliedPromo,
    applyPromo,
    removePromo,
    itemCount,
  } = useCart();
  const { t, formatCurrency } = useLanguage();

  if (!isCartOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden select-none">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeCart}
        />

        {/* Drawer Panel */}
        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            className="w-screen max-w-md bg-[#0a0a0a] border-l border-neutral-800 text-white flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
          >
            {/* Top Header */}
            <div className="p-6 border-b border-neutral-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#E50914]" />
                <h3 className="font-display text-lg font-bold tracking-tight">{t('cart.title')}</h3>
                <span className="text-xs font-mono bg-neutral-800 px-2 py-0.5 rounded-full text-neutral-400">
                  {itemCount}
                </span>
              </div>
              <button
                onClick={closeCart}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Delivery policy */}
            <div className="px-6 py-3 bg-neutral-900/60 border-b border-neutral-800 text-xs">
              <span className="text-neutral-300 font-mono">Wednesday & Saturday delivery in Rubavu and Kigali for a small transport fee. Other provinces use public-transport courier delivery at the buyer's risk.</span>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="w-16 h-16 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4">
                    <ShoppingBag className="w-8 h-8 text-neutral-500" />
                  </div>
                  <h4 className="font-display text-base font-bold text-white mb-1">{t('cart.emptyTitle')}</h4>
                  <p className="text-xs text-neutral-400 max-w-[240px] mb-6">
                    {t('cart.emptySubtitle')}
                  </p>
                  <button
                    onClick={() => {
                      closeCart();
                      onNavigateToShop();
                    }}
                    className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase tracking-widest font-bold transition-colors flex items-center gap-2"
                  >
                    {t('cart.returnToShop')} <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                cart.map(item => (
                  <div
                    key={`${item.productId}-${item.size}-${item.color}`}
                    className="flex gap-4 p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800/80 group"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-black border border-neutral-800 shrink-0"
                    />
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-white truncate pr-2">{item.name}</h4>
                          <button
                            onClick={() => removeFromCart(item.productId, item.size, item.color)}
                            className="text-neutral-500 hover:text-[#E50914] transition-colors p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-neutral-400">
                          <span className="px-1.5 py-0.5 bg-neutral-800 rounded">Eur {item.size}</span>
                          <span>{item.color}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Quantity Stepper */}
                        <div className="flex items-center border border-neutral-700 rounded-lg bg-black/40">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity - 1)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-mono font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.color, item.quantity + 1)}
                            className="p-1 text-neutral-400 hover:text-white transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <span className="text-xs font-bold font-mono text-white">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Promo Code & Summary Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-800 bg-[#080808]">
                {/* Promo input */}
                <div className="mb-4">
                  {appliedPromo ? (
                    <div className="flex items-center justify-between p-2 rounded-lg bg-[#E50914]/10 border border-[#E50914]/30 text-xs font-mono">
                      <div className="flex items-center gap-2 text-[#E50914]">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{t('cart.promoApplied', { code: appliedPromo })}</span>
                      </div>
                      <button
                        onClick={removePromo}
                        className="text-neutral-400 hover:text-white text-[11px] underline"
                      >
                        {t('cart.promoRemove')}
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        placeholder={t('cart.promoPlaceholder')}
                        className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 font-mono focus:outline-none focus:border-neutral-600 uppercase"
                      />
                      <button
                        onClick={applyPromo}
                        className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-xs font-mono uppercase tracking-wider text-white rounded-lg transition-colors"
                      >
                        {t('cart.promoApply')}
                      </button>
                    </div>
                  )}
                </div>

                {/* Subtotals */}
                <div className="space-y-1.5 text-xs font-mono text-neutral-400 mb-4">
                  <div className="flex justify-between">
                    <span>{t('cart.subtotal')}</span>
                    <span className="text-white">{formatCurrency(subtotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-[#E50914]">
                      <span>{t('cart.discount')} (10%)</span>
                      <span>-{formatCurrency(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>{t('cart.shipping')}</span>
                    <span className="text-white">{shipping === 0 ? t('cart.free') : formatCurrency(shipping)}</span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-white pt-2 border-t border-neutral-800">
                    <span className="font-display">{t('cart.total')}</span>
                    <span className="font-mono text-[#E50914]">{formatCurrency(total)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={() => {
                    closeCart();
                    onNavigateToCheckout();
                  }}
                  className="w-full py-3.5 rounded-xl bg-white text-black hover:bg-neutral-200 font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
                >
                  {t('cart.proceedCheckout')}
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>

                <p className="text-[10px] text-center font-mono text-neutral-400 mt-3 uppercase tracking-wider">
                  {t('cart.guarantee')}
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
