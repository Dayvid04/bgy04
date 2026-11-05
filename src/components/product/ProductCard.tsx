import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'motion/react';
import { Heart, Eye, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { useProductSelection } from '../../context/ProductSelectionContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onQuickView: (product: Product) => void;
  onBuyNow: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickView,
  onBuyNow,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart, closeCart } = useCart();
  const { formatCurrency } = useLanguage();
  const { selectedSize, selectedColor, setSelectedSize, setSelectedSizes, setSelectedColor } = useProductSelection(product._id, product.colors[0]?.name || 'Standard');
  const [isHovered, setIsHovered] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const isSaved = isInWishlist(product._id);
  const displayImage = product.images[isHovered && product.images[1] ? 1 : 0] || product.images[0];

  const handlePurchase = (buyNow: boolean) => (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedSize) {
      onQuickView(product);
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
      onBuyNow();
      return;
    }

    setToastMessage(`Added to cart: ${product.name}, ${selectedColor}, EU ${selectedSize}`);
    window.setTimeout(() => setToastMessage(''), 2500);
  };

  return (
    <motion.div
      onClick={() => onSelect(product._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative min-w-0 bg-[#0D0D0D] border border-neutral-800/80 hover:border-neutral-700 rounded-xl sm:rounded-2xl p-2 sm:p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] cursor-pointer"
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      {/* Top Badges & Wishlist */}
      <div className="relative z-10 flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {product.newArrival && (
            <span className="px-2 py-0.5 rounded-full bg-white text-black text-[9px] font-mono font-extrabold uppercase tracking-widest">
              NEW
            </span>
          )}
          {product.discountPrice && (
            <span className="px-2 py-0.5 rounded-full bg-[#E50914] text-white text-[9px] font-mono font-bold uppercase tracking-widest">
              SALE
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={e => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className={`p-2 rounded-full transition-all duration-200 ${
            isSaved
              ? 'bg-[#E50914]/20 text-[#E50914]'
              : 'bg-neutral-900/80 text-neutral-400 hover:text-white hover:bg-neutral-800'
          }`}
          title={isSaved ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#E50914]' : ''}`} />
        </button>
      </div>

      {/* Main Shoe Image Stage */}
      <div className="relative w-full aspect-square bg-[#070707] rounded-xl overflow-hidden flex items-center justify-center p-4 border border-neutral-900 group-hover:border-neutral-800 transition-colors">
        <motion.img
          src={displayImage}
          alt={product.name}
          className="w-full h-full object-contain filter contrast-[1.05] transition-transform duration-500 ease-out group-hover:scale-105 group-hover:-rotate-2"
          loading="lazy"
        />

        <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute left-[5px] right-[5px] bottom-[5px] h-[42px] rounded-xl border border-white/10 bg-black/65 backdrop-blur-sm text-white text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-black/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
          >
            <Eye className="w-4 h-4" />
            <span>Quick view</span>
          </button>
      </div>

      {/* Product Details Info */}
      <div className="mt-2 sm:mt-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center text-[11px] font-mono text-neutral-400 mb-1">
            <span className="uppercase tracking-widest">{product.category}</span>
          </div>

          <h3 className="font-display font-bold text-xs sm:text-base text-white group-hover:text-neutral-200 transition-colors line-clamp-2 min-h-[2rem] sm:min-h-0">
            {product.name}
          </h3>

          <p className="hidden sm:block text-xs text-neutral-400 line-clamp-1 mt-0.5 font-sans">
            {product.tagline}
          </p>
        </div>

        {/* Bottom Row: Color swatches & Price */}
        <div className="mt-2 sm:mt-4 pt-2 sm:pt-3 border-t border-neutral-900 flex flex-wrap items-center justify-between gap-2">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
              {product.colors.map(color => (
              <button
                key={color.name}
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setSelectedColor(color.name);
                }}
                className={`w-4 h-4 rounded-full border transition-all ${
                  selectedColor === color.name
                    ? 'border-[#E50914] scale-125'
                    : 'border-neutral-700 hover:border-neutral-400'
                }`}
                style={{ backgroundColor: color.hex }}
                aria-label={color.name}
                aria-pressed={selectedColor === color.name}
              />
            ))}
          </div>

          {/* Pricing in RWF */}
          <div className="text-right">
            {product.discountPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-neutral-400 line-through font-mono">
                  {formatCurrency(product.price)}
                </span>
                <span className="text-sm font-bold font-mono text-[#E50914]">
                  {formatCurrency(product.discountPrice)}
                </span>
              </div>
            ) : (
              <span className="text-sm font-bold font-mono text-white">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mt-2 sm:mt-3">
          <button
            type="button"
            onClick={handlePurchase(false)}
            disabled={product.stock <= 0}
            aria-label="Add to cart"
            title="Add to cart"
            className="h-10 sm:h-[46px] rounded-lg bg-white text-black hover:bg-neutral-200 font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#E50914]"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handlePurchase(true)}
            disabled={product.stock <= 0}
            className="h-10 sm:h-[46px] rounded-lg bg-[#E50914] hover:bg-red-700 text-white font-display font-bold text-[10px] sm:text-xs uppercase tracking-widest flex items-center justify-center disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Buy now
          </button>
        </div>
      </div>

      {toastMessage && (
        createPortal(
          <div role="status" className="fixed z-[70] bottom-5 left-1/2 -translate-x-1/2 max-w-[calc(100vw-2rem)] px-4 py-3 rounded-xl bg-neutral-900 border border-neutral-700 text-white text-xs font-mono shadow-2xl">
            {toastMessage}
          </div>,
          document.body
        )
      )}
    </motion.div>
  );
};
