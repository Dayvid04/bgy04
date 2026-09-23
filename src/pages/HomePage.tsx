import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Truck, RotateCcw, BadgeCheck } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { BgyLogo } from '../components/common/BgyLogo';
import { useTheme } from '../context/ThemeContext';

interface HomePageProps {
  onNavigate: (route: string, gender?: 'men' | 'women') => void;
  onSelectProduct: (productId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectProduct }) => {
  const { isDark } = useTheme();
  const [mensProducts, setMensProducts] = useState<Product[]>([]);
  const [womensProducts, setWomensProducts] = useState<Product[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const [mens, womens] = await Promise.all([
          api.getProducts({ gender: 'men', featured: true }),
          api.getProducts({ gender: 'women', featured: true }),
        ]);
        setMensProducts(mens.products.slice(0, 4));
        setWomensProducts(womens.products.slice(0, 4));
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="relative bg-[#050505] text-white overflow-hidden">

      {/* HERO */}
      <section className="relative min-h-[78vh] flex items-center justify-center pt-28 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-neutral-900">
        <div className="relative max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          <motion.div
            className="lg:col-span-6 z-10 text-center lg:text-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            <div className="inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.28em] text-[#E50914] mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E50914] animate-pulse" />
              <span>RWANDA FOOTWEAR COLLECTION</span>
            </div>

            <h1 className="font-display font-extrabold text-5xl sm:text-6xl md:text-7xl lg:text-[5.4rem] tracking-tighter leading-[0.88] text-white max-w-xl">
              STEP INTO <br />
              <span className="text-white relative inline-block">
                BGY
                <span className="absolute -bottom-1 left-0 right-0 h-1.5 bg-[#E50914]" />
              </span>
            </h1>

            <p className="mt-6 text-sm sm:text-base text-neutral-400 font-sans max-w-md mx-auto lg:mx-0 leading-relaxed">
              Premium footwear for men and women — modern movement, daily wear, and confident style.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => onNavigate('shop')}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-white text-black hover:bg-neutral-200 font-display font-bold text-xs uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 group"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => document.getElementById('mens-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full sm:w-auto px-7 py-3.5 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 text-neutral-200 border border-neutral-800 hover:border-neutral-600 font-mono text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
              >
                Explore Collection
              </button>
            </div>

            {/* Gender Quick Nav */}
            <div className="mt-8 flex items-center justify-center lg:justify-start gap-3">
              <button
                onClick={() => document.getElementById('mens-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2 rounded-full bg-neutral-900 border border-neutral-700 hover:border-white text-[10px] font-mono uppercase tracking-widest text-white transition-colors"
              >
                Men's Shoes
              </button>
              <button
                onClick={() => document.getElementById('womens-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-5 py-2 rounded-full bg-neutral-900 border border-neutral-700 hover:border-white text-[10px] font-mono uppercase tracking-widest text-white transition-colors"
              >
                Women's Shoes
              </button>
            </div>
          </motion.div>

          <motion.div
            className="lg:col-span-6 relative flex flex-col items-center justify-center"
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <div
              className="relative w-full max-w-[680px] aspect-[1.15] flex items-center justify-center overflow-hidden transition-colors duration-300"
              style={{ backgroundColor: isDark ? '#000000' : '#f5f5f5' }}
            >
              <motion.img
                src="/nike.jpeg"
                alt="Nike sneaker product image"
                className="relative z-10 w-full max-h-[470px] object-contain cursor-pointer bg-transparent"
                style={{ filter: isDark ? 'brightness(0.95) contrast(1.15)' : 'none' }}
                animate={{ y: [-8, 8, -8], rotate: [-3, 1, -3] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                onClick={() => onSelectProduct('prod_bgy_aero_1')}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* SHOPPING BENEFITS */}
      <section className="border-b border-neutral-900 bg-[#080808]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-neutral-900 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 px-2 py-5 sm:px-6">
            <BadgeCheck className="w-6 h-6 text-[#E50914] shrink-0" />
            <div>
              <p className="text-sm font-display font-bold text-white">Curated footwear</p>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">Premium styles selected by BGY</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 py-5 sm:px-6">
            <Truck className="w-6 h-6 text-[#E50914] shrink-0" />
            <div>
              <p className="text-sm font-display font-bold text-white">Rwanda delivery</p>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">Rubavu & Kigali: Wed/Sat</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-2 py-5 sm:px-6">
            <RotateCcw className="w-6 h-6 text-[#E50914] shrink-0" />
            <div>
              <p className="text-sm font-display font-bold text-white">30-day returns</p>
              <p className="mt-1 text-[11px] font-mono uppercase tracking-wider text-neutral-500">Shop with confidence</p>
            </div>
          </div>
        </div>
      </section>

      {/* MEN'S SHOES — All Sneakers */}
      <section id="mens-section" className="py-16 sm:py-20 border-t border-neutral-900 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-2">Men's Collection</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                All Sneakers
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-md">
                Explore every men’s sneaker selected by BGY for everyday confidence.
              </p>
            </div>
            <button
              onClick={() => onNavigate('shop', 'men')}
              className="mt-6 sm:mt-0 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xs font-mono uppercase tracking-widest text-white transition-colors flex items-center gap-2"
            >
              Shop Men's <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {mensProducts.map(prod => (
                <ProductCard key={prod._id} product={prod} onSelect={onSelectProduct} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* WOMEN'S SHOES — Women's Sneakers */}
      <section id="womens-section" className="py-16 sm:py-20 border-t border-neutral-900 bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-2">Women's Collection</span>
              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                All Collection
              </h2>
              <p className="text-sm text-neutral-400 mt-2 max-w-md">
                Explore every women’s sneaker selected for comfort, style, and daily movement.
              </p>
            </div>
            <button
              onClick={() => onNavigate('shop', 'women')}
              className="mt-6 sm:mt-0 px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-neutral-600 text-xs font-mono uppercase tracking-widest text-white transition-colors flex items-center gap-2"
            >
              Shop Women's <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {loading ? (
            <div className="py-24 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
              Loading...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {womensProducts.map(prod => (
                <ProductCard key={prod._id} product={prod} onSelect={onSelectProduct} onQuickView={setQuickViewProduct} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* BRAND MANIFESTO */}
      <section className="py-28 border-t border-neutral-900 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="mb-6 flex justify-center">
            <BgyLogo size="lg" />
          </div>
          <span className="text-xs font-mono uppercase tracking-[0.3em] text-[#E50914] block mb-4">
            Movement. Identity. Modern Footwear.
          </span>
          <blockquote className="font-display font-extrabold text-2xl sm:text-4xl md:text-5xl text-white tracking-tight leading-tight">
            "The best footwear balances performance, comfort, and style."
          </blockquote>
          <p className="mt-6 text-sm text-neutral-400 font-sans max-w-xl mx-auto leading-relaxed">
            BGY curates premium footwear for men and women that feels right, looks polished, and serves real life in Rwanda and beyond.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => onNavigate('about')}
              className="px-6 py-3 rounded-full bg-neutral-900 border border-neutral-800 hover:border-white text-xs font-mono uppercase tracking-widest text-white transition-colors"
            >
              Learn About BGY
            </button>
          </div>
        </div>
      </section>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onViewFullDetails={onSelectProduct} />
    </div>
  );
};
