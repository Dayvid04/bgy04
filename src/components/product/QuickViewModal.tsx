import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProductSelection } from '../../context/ProductSelectionContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (productId: string) => void;
  onBuyNow: () => void;
}

const EU_SIZES = Array.from({ length: 11 }, (_, index) => index + 35);

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails,
  onBuyNow,
}) => {
  const { addToCart, closeCart } = useCart();
  const { formatCurrency } = useLanguage();
  const { selectedSize, selectedColor, setSelectedSize, setSelectedSizes, setSelectedColor } = useProductSelection(
    product?._id || '',
    product?.colors[0]?.name || 'Standard'
  );
  const [activeImage, setActiveImage] = useState('');
  const [error, setError] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    if (!product) return;

    setActiveImage(product.images[0] || '');
    setError(selectedSize ? '' : 'Pick a size to continue.');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [product]);

  const handlePurchase = (buyNow: boolean) => {
    if (!product) return;
    if (!selectedSize) {
      setError('Pick a size to continue.');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      price: product.discountPrice || product.price,
      size: selectedSize,
      color: selectedColor,
      maxStock: product.stock,
    }, 1);
    closeCart();

    if (buyNow) {
      onClose();
      onBuyNow();
      return;
    }

    setToastMessage(`Added to cart: ${product.name}, ${selectedColor}, EU ${selectedSize}`);
    window.setTimeout(() => setToastMessage(''), 2500);
    onClose();
  };

  return (
    <>
      {toastMessage && !product && (
        <div role="status" className="fixed z-[70] bottom-5 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono shadow-2xl">
          {toastMessage}
        </div>
      )}
      <AnimatePresence>
        {product && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 max-[820px]:items-end max-[820px]:p-0" onClick={onClose}>
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="quick-view-title"
              onClick={event => event.stopPropagation()}
              className="relative z-10 w-full max-w-4xl max-h-[92dvh] overflow-y-auto bg-[#0D0D0D] border border-neutral-800 rounded-2xl shadow-2xl text-white max-[820px]:max-w-none max-[820px]:rounded-b-none max-[820px]:rounded-t-2xl max-[820px]:border-b-0"
              initial={{ opacity: 0, scale: 0.96, y: 14 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 14 }}
              transition={{ duration: 0.18 }}
            >
              <button
                type="button"
                onClick={onClose}
                aria-label="Close quick view"
                className="absolute top-3 right-3 z-20 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 sm:p-7">
                <div>
                  <div className="aspect-square bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-4 flex items-center justify-center">
                    <img src={activeImage || product.images[0]} alt={product.name} className="w-full h-full object-contain" />
                  </div>
                  {product.images.length > 1 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                      {product.images.map((image, index) => (
                        <button
                          key={`${image}-${index}`}
                          type="button"
                          onClick={() => setActiveImage(image)}
                          aria-label={`View product image ${index + 1}`}
                          aria-pressed={activeImage === image}
                          className={`w-14 h-14 rounded-lg overflow-hidden border transition-all shrink-0 bg-neutral-950 p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914] ${
                            activeImage === image ? 'border-[#E50914]' : 'border-neutral-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={image} alt="" className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">BGY</p>
                    <h2 id="quick-view-title" className="font-display text-2xl font-bold text-white">{product.name}</h2>
                    <p className="text-xs text-neutral-400 mt-1">{product.tagline}</p>
                    <div className="mt-3 flex items-baseline gap-2">
                      <span className="text-xl font-bold font-mono text-white">{formatCurrency(product.discountPrice || product.price)}</span>
                      {product.discountPrice && <span className="text-sm font-mono text-neutral-500 line-through">{formatCurrency(product.price)}</span>}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                      Color: <strong className="text-white">{selectedColor}</strong>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map(color => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setSelectedColor(color.name)}
                          aria-pressed={selectedColor === color.name}
                          className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-2 border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914] ${
                            selectedColor === color.name ? 'border-[#E50914] bg-neutral-800 text-white' : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                          }`}
                        >
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color.hex }} />
                          {color.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 text-xs font-mono uppercase tracking-wider text-neutral-400">EU size</div>
                    <div className="grid grid-cols-6 gap-1.5">
                      {EU_SIZES.map(size => {
                        const available = product.stock > 0 && product.sizes.includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            disabled={!available}
                            onClick={() => {
                              setSelectedSize(size);
                              setSelectedSizes({ [size]: 1 });
                              setError('');
                            }}
                            aria-pressed={selectedSize === size}
                            className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914] disabled:opacity-45 disabled:line-through disabled:cursor-not-allowed ${
                              selectedSize === size
                                ? 'bg-white text-black border-white'
                                : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <p aria-live="polite" className="min-h-4 text-xs text-[#E50914]">{error}</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handlePurchase(false)}
                      disabled={product.stock <= 0}
                      className="h-[46px] rounded-lg bg-white text-black hover:bg-neutral-200 font-display font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
                    >
                      <ShoppingBag className="w-4 h-4" /> Add to cart
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePurchase(true)}
                      disabled={product.stock <= 0}
                      className="h-[46px] rounded-lg bg-[#E50914] hover:bg-red-700 text-white font-display font-bold text-xs uppercase tracking-widest disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      Buy now
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onViewFullDetails(product._id);
                    }}
                    className="w-full py-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
                  >
                    View full details <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
