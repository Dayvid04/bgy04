import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Tag, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onViewAllResults: (query: string) => void;
}

const POPULAR_SEARCHES = ['Aero-1', 'Phantom Low', 'Carbon', 'High-Tops', 'Monochrome', 'Runners'];

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.getProducts({ search: query.trim() });
        setResults(res.products.slice(0, 6));
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
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
          className="relative w-full max-w-2xl bg-neutral-900 border border-neutral-800 rounded-2xl shadow-2xl overflow-hidden z-10"
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {/* Search Header Bar */}
          <div className="flex items-center px-6 py-5 border-b border-neutral-800 gap-4">
            <Search className="w-5 h-5 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search BGY silhouettes, tech, or categories..."
              className="flex-1 bg-transparent text-lg text-white placeholder-neutral-500 focus:outline-none font-sans"
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  onViewAllResults(query);
                  onClose();
                }
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="text-neutral-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-xs uppercase font-mono tracking-widest text-neutral-400 hover:text-white px-2.5 py-1 border border-neutral-800 hover:border-neutral-600 rounded-md transition-colors"
            >
              ESC
            </button>
          </div>

          {/* Quick Trends & Suggestions */}
          {!query && (
            <div className="p-6">
              <span className="text-xs uppercase font-mono tracking-[0.2em] text-neutral-500 block mb-3">
                Trending Silhouettes
              </span>
              <div className="flex flex-wrap gap-2">
                {POPULAR_SEARCHES.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-sans tracking-wide transition-colors flex items-center gap-1.5 border border-neutral-800"
                  >
                    <Tag className="w-3 h-3 text-[#E50914]" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {query && (
            <div className="p-4 max-h-[420px] overflow-y-auto">
              {isLoading ? (
                <div className="py-12 text-center text-neutral-400 text-sm font-mono flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                  Searching BGY catalog...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 flex justify-between items-center text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                    <span>Products ({results.length})</span>
                    <button
                      onClick={() => {
                        onViewAllResults(query);
                        onClose();
                      }}
                      className="text-[#E50914] hover:underline flex items-center gap-1"
                    >
                      View All <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                  {results.map(prod => (
                    <div
                      key={prod._id}
                      onClick={() => {
                        onSelectProduct(prod._id);
                        onClose();
                      }}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-neutral-800/70 cursor-pointer transition-colors group"
                    >
                      <img
                        src={prod.images[0]}
                        alt={prod.name}
                        className="w-14 h-14 object-cover rounded-lg bg-neutral-950 border border-neutral-800 group-hover:border-neutral-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-white truncate group-hover:text-[#E50914] transition-colors">
                            {prod.name}
                          </h4>
                          {prod.newArrival && (
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 bg-[#E50914]/20 text-[#E50914] rounded">
                              New
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 truncate">{prod.tagline}</p>
                        <span className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                          {prod.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-white font-mono">
                          {(prod.discountPrice || prod.price).toLocaleString('en-US')} RWF
                        </span>
                        {prod.discountPrice && (
                          <span className="text-xs text-neutral-500 line-through block font-mono">
                            {prod.price.toLocaleString('en-US')} RWF
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center text-neutral-400">
                  <p className="text-sm">No footwear matching "{query}"</p>
                  <p className="text-xs text-neutral-400 mt-1">
                    Try searching for "Aero", "Runners", or "Black"
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
