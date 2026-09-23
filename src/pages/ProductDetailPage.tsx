import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  ShoppingBag,
  Zap,
  ShieldCheck,
  Truck,
  RotateCcw,
  Ruler,
  Check,
  Sparkles,
  ArrowLeft,
  Eye,
} from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage } from '../context/LanguageContext';
import { Shoe3DViewer } from '../components/common/Shoe3DViewer';

interface ProductDetailPageProps {
  productId: string;
  onNavigate: (route: string) => void;
  onSelectProduct: (productId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onNavigate,
  onSelectProduct,
}) => {
  const { t, formatCurrency, language } = useLanguage();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'gallery' | '3d'>('gallery');

  // Interactive selection state
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  const { addToCart, openCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const prod = await api.getProductById(productId);
        setProduct(prod);
        setSelectedImageIndex(0);
        setSelectedColor(prod.colors[0]?.name || 'Standard');
        setSelectedSize(prod.sizes[0] || null);
      } catch (err) {
        console.error('Error fetching product details:', err);
      } finally {
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
    loadProduct();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-mono text-xs">
        <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping mr-3" />
        Retrieving BGY footwear architecture...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center pt-24 pb-16 px-4">
        <p className="text-lg font-display font-bold mb-4">Footwear Silhouette Not Found</p>
        <button
          onClick={() => onNavigate('shop')}
          className="px-6 py-2.5 rounded-full bg-white text-black font-mono text-xs uppercase tracking-widest font-bold"
        >
          Return to Shop
        </button>
      </div>
    );
  }

  const isSaved = isInWishlist(product._id);
  const finalPrice = product.discountPrice || product.price;

  const handleAddToCart = () => {
    if (!selectedSize) return;

    addToCart(
      {
        productId: product._id,
        name: product.name,
        image: product.images[0],
        price: finalPrice,
        size: selectedSize,
        color: selectedColor,
        maxStock: product.stock,
      },
      1
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    openCart();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-24 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back breadcrumb */}
        <button
          onClick={() => onNavigate('shop')}
          className="mb-8 flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Collection
        </button>

        {/* Added to Bag Floating Notification */}
        <AnimatePresence>
          {addedToast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed top-20 right-6 z-50 bg-[#0d0d0d] border border-[#E50914] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-6 h-6 rounded-full bg-[#E50914] flex items-center justify-center">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <p className="text-xs font-mono font-bold">Added to Shopping Bag</p>
                <p className="text-[11px] text-neutral-400">
                  {product.name} — Size {selectedSize}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Product Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Visual Presentation (Gallery or 3D Viewer) */}
          <div className="lg:col-span-7 space-y-4">
            {/* View Mode Toggle: Photo Gallery vs Real-Time 3D */}
            <div className="flex items-center justify-between bg-neutral-900/80 border border-neutral-800 p-1.5 rounded-xl">
              <span className="text-[11px] font-mono uppercase tracking-widest text-neutral-400 px-3">
                Presentation Engine
              </span>
              <div className="flex gap-1">
                <button
                  onClick={() => setViewMode('gallery')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    viewMode === 'gallery'
                      ? 'bg-white text-black font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Eye className="w-3.5 h-3.5" /> High-Res View
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                    viewMode === '3d'
                      ? 'bg-[#E50914] text-white font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" /> 3D Orbit
                </button>
              </div>
            </div>

            {viewMode === 'gallery' ? (
              <div className="space-y-4">
                {/* Main Featured Photo */}
                <div className="relative aspect-square bg-[#0a0a0a] border border-neutral-800 rounded-2xl overflow-hidden p-8 flex items-center justify-center group">
                  <img
                    src={product.images[selectedImageIndex] || product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-contain filter contrast-[1.08] transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Subtle Red BGY Watermark */}
                  <div className="absolute bottom-6 right-6 font-display font-extrabold text-3xl text-neutral-800/40 select-none pointer-events-none">
                    BGY
                  </div>
                </div>

                {/* Thumbnails */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-3">
                    {product.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedImageIndex(idx)}
                        className={`aspect-square rounded-xl overflow-hidden bg-[#0a0a0a] border p-2 transition-all ${
                          selectedImageIndex === idx
                            ? 'border-[#E50914] ring-1 ring-[#E50914]'
                            : 'border-neutral-800 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="" className="w-full h-full object-contain" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <Shoe3DViewer
                  shoeName={product.name}
                  colorHex={product.colors[0]?.hex || '#111111'}
                  accentHex="#E50914"
                />
              </div>
            )}


          </div>

          {/* Right Column: Product Info & Purchase Controls */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category & Wishlist */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914]">
                  {product.category}
                </span>
                <button
                  onClick={() => toggleWishlist(product._id)}
                  className={`p-2 rounded-full transition-colors ${
                    isSaved
                      ? 'bg-[#E50914]/20 text-[#E50914]'
                      : 'bg-neutral-900 text-neutral-400 hover:text-white'
                  }`}
                  title={isSaved ? 'In Wishlist' : 'Add to Wishlist'}
                >
                  <Heart className={`w-4 h-4 ${isSaved ? 'fill-[#E50914]' : ''}`} />
                </button>
              </div>

              {/* Title & Tagline */}
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                {product.name}
              </h1>
              <p className="text-sm text-neutral-400 mt-1 font-sans">{product.tagline}</p>

              {/* Pricing */}
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-3xl font-mono font-extrabold text-white">
                  {formatCurrency(finalPrice)}
                </span>
                {product.discountPrice && (
                  <>
                    <span className="text-lg font-mono text-neutral-500 line-through">
                      {formatCurrency(product.price)}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-[#E50914]/20 border border-[#E50914]/30 text-xs font-mono text-[#E50914]">
                      {language === 'fr' ? 'Économisez' : 'Save'} {formatCurrency(product.price - product.discountPrice)}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-sans border-y border-neutral-900 py-4">
              {product.description}
            </p>

            {/* Color Selector */}
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-neutral-400 block mb-2">
                {language === 'fr' ? 'Couleur' : 'Colorway'}: <strong className="text-white">{selectedColor}</strong>
              </span>
              <div className="flex gap-2.5">
                {product.colors.map(col => (
                  <button
                    key={col.name}
                    onClick={() => setSelectedColor(col.name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono flex items-center gap-2 border transition-all ${
                      selectedColor === col.name
                        ? 'border-[#E50914] bg-neutral-900 text-white'
                        : 'border-neutral-800 text-neutral-400 hover:border-neutral-700'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-neutral-700"
                      style={{ backgroundColor: col.hex }}
                    />
                    {col.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Size Selector + Size Chart Modal Button */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs font-mono">
                <span className="uppercase tracking-wider text-neutral-400">
                  {t('product.selectSize')}
                </span>
                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="text-neutral-400 hover:text-white flex items-center gap-1 underline underline-offset-2"
                >
                  <Ruler className="w-3 h-3 text-[#E50914]" />
                  {t('product.sizeGuide')}
                </button>
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                {product.sizes.map(sz => (
                  <button
                    key={sz}
                    onClick={() => setSelectedSize(sz)}
                    className={`py-2.5 text-xs font-mono font-bold rounded-xl border transition-all ${
                      selectedSize === sz
                        ? 'bg-white text-black border-white shadow-lg'
                        : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Availability */}
            <div className="flex items-center gap-2 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  product.stock > 0 ? 'bg-emerald-500' : 'bg-red-500'
                }`}
              />
              <span className="text-neutral-300">
                {product.stock > 0
                  ? (language === 'fr' ? `En stock (${product.stock} paires disponibles pour expédition)` : `In Stock (${product.stock} pairs available for immediate dispatch)`)
                  : (language === 'fr' ? 'Rupture de stock' : 'Sold Out')}
              </span>
            </div>

            {/* Add to Cart & Buy Now Buttons */}
            <div className="space-y-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={!selectedSize || product.stock === 0}
                className="w-full py-4 rounded-xl bg-white text-black hover:bg-neutral-200 font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Bag
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!selectedSize || product.stock === 0}
                className="w-full py-3.5 rounded-xl bg-[#E50914] text-white hover:bg-red-700 font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-40 shadow-lg shadow-[#E50914]/20"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {/* Guarantees */}
            <div className="pt-4 border-t border-neutral-900 space-y-2 text-xs font-sans text-neutral-400">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#E50914]" />
                <span>{language === 'fr' ? 'Rubavu et Kigali : livraison mercredi et samedi avec de petits frais de transport. Autres provinces : coursier en transport public aux risques de l’acheteur.' : 'Rubavu and Kigali: Wednesday and Saturday delivery for a small transport fee. Other provinces: public-transport courier delivery at the buyer’s risk.'}</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-[#E50914]" />
                <span>{language === 'fr' ? 'Échange sous 30 jours' : '30-day exchange & effortless returns'}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#E50914]" />
                <span>{language === 'fr' ? 'Certificat d’authenticité BGY Rwanda inclus' : '100% Serialized BGY Authenticity Certificate included'}</span>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Size Chart Modal */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSizeGuide(false)}
            />
            <motion.div
              className="relative w-full max-w-lg bg-[#0a0a0a] border border-neutral-800 rounded-2xl p-6 text-white z-10"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <h3 className="font-display text-lg font-bold mb-1">BGY Footwear Sizing Matrix</h3>
              <p className="text-xs text-neutral-400 mb-4">
                BGY silhouettes are built to true-to-size athletic standard.
              </p>

              <div className="border border-neutral-800 rounded-xl overflow-hidden text-xs font-mono">
                <table className="w-full text-left">
                  <thead className="bg-neutral-900 text-neutral-400 uppercase text-[10px]">
                    <tr>
                      <th className="p-2.5">Eur</th>
                      <th className="p-2.5">US Men</th>
                      <th className="p-2.5">US Women</th>
                      <th className="p-2.5">UK</th>
                      <th className="p-2.5">CM</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-900">
                    <tr><td className="p-2.5">35</td><td className="p-2.5">4.5</td><td className="p-2.5">5.5</td><td className="p-2.5">2.5</td><td className="p-2.5">22.5</td></tr>
                    <tr><td className="p-2.5">36</td><td className="p-2.5">5.0</td><td className="p-2.5">6.0</td><td className="p-2.5">3.5</td><td className="p-2.5">23.0</td></tr>
                    <tr><td className="p-2.5">37</td><td className="p-2.5">6.0</td><td className="p-2.5">7.0</td><td className="p-2.5">4.5</td><td className="p-2.5">23.5</td></tr>
                    <tr><td className="p-2.5">38</td><td className="p-2.5">6.5</td><td className="p-2.5">7.5</td><td className="p-2.5">5.5</td><td className="p-2.5">24.0</td></tr>
                    <tr><td className="p-2.5">39</td><td className="p-2.5">7.0</td><td className="p-2.5">8.0</td><td className="p-2.5">6.0</td><td className="p-2.5">24.5</td></tr>
                    <tr><td className="p-2.5">40</td><td className="p-2.5">7.5</td><td className="p-2.5">8.5</td><td className="p-2.5">6.5</td><td className="p-2.5">25.5</td></tr>
                    <tr><td className="p-2.5">41</td><td className="p-2.5">8.0</td><td className="p-2.5">9.0</td><td className="p-2.5">7.0</td><td className="p-2.5">26.0</td></tr>
                    <tr><td className="p-2.5">42</td><td className="p-2.5">8.5</td><td className="p-2.5">9.5</td><td className="p-2.5">7.5</td><td className="p-2.5">26.5</td></tr>
                    <tr><td className="p-2.5">43</td><td className="p-2.5">9.0</td><td className="p-2.5">10.0</td><td className="p-2.5">8.0</td><td className="p-2.5">27.5</td></tr>
                    <tr><td className="p-2.5">44</td><td className="p-2.5">9.5</td><td className="p-2.5">10.5</td><td className="p-2.5">8.5</td><td className="p-2.5">28.0</td></tr>
                    <tr><td className="p-2.5">45</td><td className="p-2.5">10.5</td><td className="p-2.5">11.5</td><td className="p-2.5">9.5</td><td className="p-2.5">29.0</td></tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full mt-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-xs font-mono uppercase tracking-widest text-white border border-neutral-800"
              >
                Close Sizing Guide
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
