import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, ArrowRight, Clock3 } from 'lucide-react';
import { api } from '../../services/api';
import { Product } from '../../types';
import { pluralize } from '../../utils/pluralize';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (productId: string) => void;
  onViewAllResults: (query: string) => void;
}

const SEARCH_HISTORY_KEY = 'bgy_search_history';
const MAX_SEARCH_HISTORY = 6;

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onViewAllResults,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      const parsed: unknown = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.filter((term): term is string => typeof term === 'string').slice(0, MAX_SEARCH_HISTORY)
        : [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef<HTMLInputElement>(null);

  const rememberSearch = (term: string) => {
    const normalized = term.trim();
    if (!normalized) return;
    setSearchHistory(current => [
      normalized,
      ...current.filter(item => item.toLowerCase() !== normalized.toLowerCase()),
    ].slice(0, MAX_SEARCH_HISTORY));
  };

  useEffect(() => {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory));
  }, [searchHistory]);

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
      <div className="fixed inset-0 z-50 flex items-start justify-center px-4" style={{ paddingTop: 'max(4rem, env(safe-area-inset-top, 0px) + 4rem)' }}>
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
              placeholder="Search shoes..."
              className="flex-1 bg-transparent text-lg text-white placeholder-neutral-500 focus:outline-none font-sans"
              onKeyDown={e => {
                if (e.key === 'Enter' && query.trim()) {
                  rememberSearch(query);
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
          </div>

          {/* Recent search history */}
          {!query && searchHistory.length > 0 && (
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs uppercase font-mono tracking-[0.2em] text-neutral-500">
                  Search History
                </span>
                <button
                  onClick={() => setSearchHistory([])}
                  className="text-[10px] uppercase font-mono tracking-wider text-neutral-500 hover:text-white"
                >
                  Clear
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {searchHistory.map(term => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 rounded-full bg-neutral-800/60 hover:bg-neutral-800 text-neutral-300 hover:text-white text-xs font-sans tracking-wide transition-colors flex items-center gap-1.5 border border-neutral-800"
                  >
                    <Clock3 className="w-3 h-3 text-neutral-500" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Live Search Results */}
          {query && (
            <div className="p-4 overflow-y-auto" style={{ maxHeight: 'min(60dvh, 420px)' }}>
              {isLoading ? (
                <div className="py-12 text-center text-neutral-400 text-sm font-mono flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-[#E50914] animate-ping" />
                  Searching BGY catalog...
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                  <div className="px-3 py-1.5 flex justify-between items-center text-[11px] font-mono uppercase tracking-widest text-neutral-500">
                    <span>{pluralize(results.length, 'product')}</span>
                    <button
                      onClick={() => {
                        rememberSearch(query);
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
                        rememberSearch(query);
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
