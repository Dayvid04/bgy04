import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SlidersHorizontal, Search, X, RotateCcw, Check } from 'lucide-react';
import { Product } from '../types';
import { api } from '../services/api';
import { ProductCard } from '../components/product/ProductCard';
import { QuickViewModal } from '../components/product/QuickViewModal';
import { useLanguage } from '../context/LanguageContext';

interface ShopPageProps {
  onSelectProduct: (productId: string) => void;
  initialCategory?: string;
  initialSearch?: string;
  newArrivalsOnly?: boolean;
  initialGender?: 'men' | 'women';
}

const SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];
const COLORS = [
  { name: 'Black', hex: '#111111' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Grey', hex: '#6B7280' },
  { name: 'Red', hex: '#E50914' },
];


export const ShopPage: React.FC<ShopPageProps> = ({
  onSelectProduct,
  initialCategory = 'All',
  initialSearch = '',
  newArrivalsOnly = false,
  initialGender,
}) => {
  const [activeGender, setActiveGender] = useState<'men' | 'women'>(initialGender || 'men');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [search, setSearch] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedSize, setSelectedSize] = useState<number | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);

  useEffect(() => {
    if (initialCategory) setSelectedCategory(initialCategory);
    if (initialSearch) setSearch(initialSearch);
  }, [initialCategory, initialSearch]);

  // Sync gender if initialGender changes (e.g. navigating from home)
  useEffect(() => {
    if (initialGender) setActiveGender(initialGender);
  }, [initialGender]);

  // Reset category when switching gender
  useEffect(() => {
    setSelectedCategory('All');
  }, [activeGender]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = {
        gender: newArrivalsOnly ? undefined : activeGender,
        newArrival: newArrivalsOnly ? true : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: search.trim() || undefined,
        size: selectedSize || undefined,
        color: selectedColor || undefined,
      };
      const res = await api.getProducts(params);
      setProducts(res.products);
      // Build category list from all products of this gender
      const allRes = await api.getProducts(newArrivalsOnly ? {} : { gender: activeGender });
      const cats = Array.from(new Set(allRes.products.map((p: any) => p.category))) as string[];
      setCategories(['All', ...cats.sort()]);
    } catch (err) {
      console.error('Error loading shop products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [activeGender, selectedCategory, selectedSize, selectedColor]);

  useEffect(() => {
    const timer = setTimeout(fetchProducts, 250);
    return () => clearTimeout(timer);
  }, [search]);

  const resetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedSize(null);
    setSelectedColor(null);
  };

  const hasActiveFilters = search || selectedCategory !== 'All' || selectedSize !== null || selectedColor !== null;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="block text-xs font-mono uppercase tracking-wider text-neutral-400 mb-2">Search</label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search shoes..."
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-2.5 top-2.5 text-neutral-500 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Sizes */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-neutral-400 uppercase tracking-wider">Eur Size</span>
          {selectedSize && (
            <button onClick={() => setSelectedSize(null)} className="text-[10px] text-neutral-500 hover:text-white underline">Clear</button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {SIZES.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSize(selectedSize === s ? null : s)}
              className={`py-1.5 text-xs font-mono rounded-lg border transition-all ${
                selectedSize === s ? 'bg-white text-black font-bold border-white' : 'bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono mb-2">
          <span className="text-neutral-400 uppercase tracking-wider">Color</span>
          {selectedColor && (
            <button onClick={() => setSelectedColor(null)} className="text-[10px] text-neutral-500 hover:text-white underline">Clear</button>
          )}
        </div>
        <div className="flex gap-2">
          {COLORS.map(c => (
            <button
              key={c.name}
              onClick={() => setSelectedColor(selectedColor === c.name ? null : c.name)}
              className={`w-7 h-7 rounded-full border transition-all flex items-center justify-center ${
                selectedColor === c.name ? 'border-[#E50914] scale-110' : 'border-neutral-700 hover:border-neutral-400'
              }`}
              style={{ backgroundColor: c.hex }}
              title={c.name}
            >
              {selectedColor === c.name && <Check className={`w-3 h-3 ${c.name === 'White' ? 'text-black' : 'text-white'}`} />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-28 pb-20 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        {newArrivalsOnly ? (
          <div className="relative mb-8 overflow-hidden border-b border-neutral-900 pb-10 pt-4">
            <div className="absolute -right-20 -top-28 h-72 w-72 rounded-full border border-[#E50914]/10" />
            <div className="relative grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-end">
              <div className="lg:col-span-7">
                <span className="mb-4 block text-xs font-mono uppercase tracking-[0.25em] text-[#E50914]">BGY Footwear · Just Landed</span>
                <h1 className="font-display text-6xl font-black leading-[0.82] tracking-tighter text-white sm:text-7xl lg:text-8xl">
                  Fresh pairs.<br />
                  <span className="text-[#E50914]">New energy.</span>
                </h1>
              </div>
              <div className="lg:col-span-5 lg:pb-1">
                <p className="max-w-md text-sm leading-relaxed text-neutral-400">
                  The newest BGY releases, selected for movement, daily wear, and confident style across Rwanda.
                </p>
                <div className="mt-6 flex items-center gap-6 border-t border-neutral-800 pt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                  <span><strong className="text-white">{products.length}</strong> new pairs</span>
                  <span className="h-3 w-px bg-neutral-800" />
                  <span>Eur 35–45</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-8 grid grid-cols-1 lg:grid-cols-12 gap-8 border-b border-neutral-900 pb-8">
            <div className="lg:col-span-7">
              <span className="text-xs font-mono uppercase tracking-[0.25em] text-[#E50914] block mb-3">BGY Footwear · Full Collection</span>
              <h1 className="font-display font-black text-5xl sm:text-6xl lg:text-7xl tracking-tighter leading-[0.9] text-white">Every pair.<br /><span className="text-neutral-500">New vibe.</span></h1>
            </div>
            <div className="lg:col-span-5 lg:pt-5">
              <p className="max-w-md text-sm leading-relaxed text-neutral-400">Browse the complete BGY footwear catalog for men and women, with every available pair in one place.</p>
              <div className="mt-5 flex items-center gap-6 font-mono text-[10px] uppercase tracking-[0.2em] text-neutral-500">
                <span><strong className="text-white">{products.length}</strong> available pairs</span>
                <span className="h-3 w-px bg-neutral-800" />
                <span>Eur 35–45</span>
              </div>
            </div>
          </div>
        )}

        {/* MEN / WOMEN Gender Tabs */}
        {!newArrivalsOnly && <div className="flex items-center gap-2 mb-8">
          {(['men', 'women'] as const).map(g => (
            <button
              key={g}
              onClick={() => setActiveGender(g)}
              className={`relative px-8 py-3 rounded-xl text-sm font-display font-bold uppercase tracking-widest transition-all ${
                activeGender === g
                  ? 'bg-white text-black shadow-lg'
                  : 'bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800 hover:border-neutral-600'
              }`}
            >
              {g === 'men' ? "Men's" : "Women's"}
              {activeGender === g && (
                <motion.span
                  layoutId="genderUnderline"
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-[#E50914] rounded-full"
                />
              )}
            </button>
          ))}
        </div>}

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-mono uppercase tracking-widest transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-white text-black font-bold'
                  : 'bg-neutral-900/90 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results + Mobile Filter Row */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-mono text-neutral-500">{products.length} styles</span>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-neutral-900 border border-neutral-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#E50914]" />
              Filters
            </button>
            {hasActiveFilters && (
              <button onClick={resetFilters} className="hidden lg:flex items-center gap-1 text-xs font-mono text-[#E50914] hover:underline">
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
          </div>
        </div>

        {/* Main Layout */}
        <div className={`grid grid-cols-1 ${newArrivalsOnly ? '' : 'lg:grid-cols-4 gap-8'}`}>
          {/* Desktop Filter Sidebar */}
          {!newArrivalsOnly && <aside className="hidden lg:block lg:col-span-1">
            <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-neutral-800/80 sticky top-28">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#E50914]" />
                  <span className="font-mono text-xs uppercase tracking-widest text-white font-bold">Filter By</span>
                </div>
                {hasActiveFilters && (
                  <button onClick={resetFilters} className="text-[11px] font-mono text-[#E50914] hover:underline flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
              <FilterPanel />
            </div>
          </aside>}

          {/* Product Grid */}
          <main className={newArrivalsOnly ? '' : 'lg:col-span-3'}>
            {loading ? (
              <div className="py-32 text-center text-neutral-500 font-mono text-xs flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                Loading {activeGender === 'men' ? "Men's" : "Women's"} collection...
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(prod => (
                  <ProductCard key={prod._id} product={prod} onSelect={onSelectProduct} onQuickView={setQuickViewProduct} />
                ))}
              </div>
            ) : (
              <div className="py-24 text-center p-8 border border-dashed border-neutral-800 rounded-2xl">
                <p className="font-display font-bold text-lg text-white mb-2">No shoes found</p>
                <p className="text-xs text-neutral-400 max-w-sm mx-auto mb-6">
                  Try clearing some filters or browse the other collection.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase tracking-widest font-bold transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilterOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
            <motion.div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileFilterOpen(false)}
            />
            <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
              <motion.div
                className="w-screen max-w-sm bg-[#0a0a0a] border-l border-neutral-800 p-6 flex flex-col justify-between text-white"
                initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-neutral-800 mb-6">
                    <h3 className="font-display text-lg font-bold">Filter Shoes</h3>
                    <button onClick={() => setMobileFilterOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <FilterPanel />
                </div>
                <div className="pt-6 border-t border-neutral-800 flex gap-3">
                  <button onClick={resetFilters} className="flex-1 py-3 rounded-xl bg-neutral-900 text-xs font-mono uppercase tracking-widest text-neutral-300">
                    Reset
                  </button>
                  <button onClick={() => setMobileFilterOpen(false)} className="flex-1 py-3 rounded-xl bg-white text-black text-xs font-mono uppercase tracking-widest font-bold">
                    Apply
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <QuickViewModal product={quickViewProduct} onClose={() => setQuickViewProduct(null)} onViewFullDetails={onSelectProduct} />
    </div>
  );
};
