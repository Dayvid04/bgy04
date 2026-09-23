import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullDetails: (productId: string) => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onViewFullDetails,
}) => {
  const { addToCart } = useCart();
  const { t, formatCurrency, language } = useLanguage();
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImage, setActiveImage] = useState<string>('');
  const [added, setAdded] = useState(false);

  React.useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes[0] || null);
      setSelectedColor(product.colors[0]?.name || 'Standard');
      setActiveImage(product.images[0]);
      setAdded(false);
    }
  }, [product]);

  if (!product) return null;

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addToCart(
      {
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: product.discountPrice || product.price,
        size: selectedSize,
        color: selectedColor,
        maxStock: product.stock,
      },
      1
    );

    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
        {/* Backdrop */}
        <motion.div
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          className="relative w-full max-w-3xl bg-[#0D0D0D] border border-neutral-800 rounded-2xl shadow-2xl p-6 sm:p-8 text-white z-10 overflow-hidden"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Left: Image & Thumbnails */}
            <div>
              <div className="aspect-square bg-neutral-950 rounded-xl overflow-hidden border border-neutral-800 p-4 flex items-center justify-center">
                <img
                  src={activeImage || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-contain filter contrast-105"
                />
              </div>

              {product.images.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-14 h-14 rounded-lg overflow-hidden border transition-all shrink-0 bg-neutral-950 p-1 ${
                        activeImage === img ? 'border-[#E50914]' : 'border-neutral-800 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-neutral-400 mb-1">
                  <span>{product.category}</span>
                  <span>•</span>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{product.rating.toFixed(1)} ({product.numReviews})</span>
                  </div>
                </div>

                <h2 className="font-display text-2xl font-bold tracking-tight text-white">
                  {product.name}
                </h2>
                <p className="text-xs text-neutral-400 mt-1">{product.tagline}</p>

                {/* Price in RWF */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-xl font-bold font-mono text-white">
                    {formatCurrency(product.discountPrice || product.price)}
                  </span>
                  {product.discountPrice && (
                    <span className="text-sm font-mono text-neutral-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                  )}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                  {language === 'fr' ? 'Couleur' : 'Color'}: <strong className="text-white">{selectedColor}</strong>
                </span>
                <div className="flex gap-2">
                  {product.colors.map(col => (
                    <button
                      key={col.name}
                      onClick={() => setSelectedColor(col.name)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono flex items-center gap-2 border transition-all ${
                        selectedColor === col.name
                          ? 'border-[#E50914] bg-neutral-800 text-white'
                          : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.hex }} />
                      {col.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Size Selection */}
              <div>
                <div className="flex justify-between items-center mb-2 text-xs font-mono">
                  <span className="uppercase tracking-wider text-neutral-400">
                    {t('product.selectSize')}
                  </span>
                  <span className="text-[#E50914]">
                    {product.stock} {language === 'fr' ? 'En stock' : 'In Stock'}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                        selectedSize === size
                          ? 'bg-white text-black border-white'
                          : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  onClick={handleAddToCart}
                  disabled={!selectedSize || added}
                  className="w-full py-3.5 rounded-xl bg-[#E50914] text-white hover:bg-red-700 font-display font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4" /> {language === 'fr' ? 'Ajouté au panier' : 'Added to Bag'}
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" /> {t('product.addToBag')} — {formatCurrency(product.discountPrice || product.price)}
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onViewFullDetails(product._id);
                  }}
                  className="w-full py-2 text-xs font-mono uppercase tracking-widest text-neutral-400 hover:text-white flex items-center justify-center gap-1.5 transition-colors"
                >
                  {language === 'fr' ? 'Voir tous les détails du modèle' : 'View Full Silhouette Details'} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
