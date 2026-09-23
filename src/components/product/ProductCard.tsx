import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, Eye, ShoppingBag, Star, Check } from 'lucide-react';
import { Product } from '../../types';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface ProductCardProps {
  product: Product;
  onSelect: (productId: string) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelect,
  onQuickView,
}) => {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { t, formatCurrency } = useLanguage();
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [quickAdded, setQuickAdded] = useState(false);

  const isSaved = isInWishlist(product._id);
  const displayImage = product.images[isHovered && product.images[1] ? 1 : 0] || product.images[0];

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Use first available Eur size
    const defaultSize = product.sizes[0] || 39;
    const defaultColor = product.colors[selectedColorIndex]?.name || 'Standard';

    addToCart({
      productId: product._id,
      name: product.name,
      image: product.images[0],
      price: product.discountPrice || product.price,
      size: defaultSize,
      color: defaultColor,
      maxStock: product.stock,
    }, 1);

    setQuickAdded(true);
    setTimeout(() => setQuickAdded(false), 1500);
  };

  return (
    <motion.div
      onClick={() => onSelect(product._id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative bg-[#0D0D0D] border border-neutral-800/80 hover:border-neutral-700 rounded-2xl p-4 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.8)] cursor-pointer"
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
          {product.stock <= 10 && product.stock > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-mono uppercase tracking-wider">
              {product.stock} Left
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

        {/* Hover Quick View & Quick Add Action Buttons */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0">
          <button
            onClick={e => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="flex-1 py-2 px-3 bg-neutral-900/90 hover:bg-neutral-800 backdrop-blur-md text-white text-[11px] font-mono uppercase tracking-wider rounded-lg border border-neutral-700 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {t('shop.quickView')}
          </button>
          <button
            onClick={handleQuickAdd}
            className="py-2 px-3 bg-white hover:bg-neutral-200 text-black text-[11px] font-mono uppercase tracking-wider rounded-lg font-bold flex items-center justify-center gap-1.5 transition-colors"
            title={t('product.addToBag')}
          >
            {quickAdded ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <ShoppingBag className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      </div>

      {/* Product Details Info */}
      <div className="mt-4 flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-mono text-neutral-400 mb-1">
            <span className="uppercase tracking-widest">{product.category}</span>
            <div className="flex items-center gap-1 text-amber-400">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-display font-bold text-base text-white group-hover:text-neutral-200 transition-colors truncate">
            {product.name}
          </h3>

          <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5 font-sans">
            {product.tagline}
          </p>
        </div>

        {/* Bottom Row: Color swatches & Price */}
        <div className="mt-4 pt-3 border-t border-neutral-900 flex items-center justify-between">
          {/* Colors */}
          <div className="flex items-center gap-1.5">
            {product.colors.map((color, idx) => (
              <span
                key={color.name}
                onClick={e => {
                  e.stopPropagation();
                  setSelectedColorIndex(idx);
                }}
                className={`w-3 h-3 rounded-full border transition-all ${
                  selectedColorIndex === idx
                    ? 'border-[#E50914] scale-125'
                    : 'border-neutral-700 hover:border-neutral-400'
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
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
      </div>
    </motion.div>
  );
};
