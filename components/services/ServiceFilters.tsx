'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown } from 'lucide-react';
import { SERVICE_CATEGORIES } from './ServiceCatalog';

interface ServiceFiltersProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: 'price' | 'popular' | 'name';
  onSortChange: (sort: 'price' | 'popular' | 'name') => void;
  serviceCount: number;
}

export default function ServiceFilters({
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  serviceCount,
}: ServiceFiltersProps) {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const sortOptions = [
    { value: 'popular', label: 'Najpopularnije' },
    { value: 'price', label: 'Cijena (najniža)' },
    { value: 'name', label: 'Naziv (A-Ž)' },
  ];

  const currentSortLabel = sortOptions.find(opt => opt.value === sortBy)?.label || 'Sortiraj';

  return (
    <div className="mb-8">
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
          className="flex items-center gap-2 text-gray-700 font-medium"
        >
          <Filter className="w-5 h-5" />
          Filteri
          {(selectedCategory !== 'all' || searchQuery) && (
            <span className="bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {(selectedCategory !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Desktop filters / Mobile drawer */}
      <AnimatePresence>
        <motion.div
          initial={false}
          animate={mobileFiltersOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          className="overflow-hidden md:!h-auto md:!opacity-100 md:overflow-visible"
        >
            <div className="space-y-4 pb-4 md:pb-0">
              {/* Search bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Traži usluge..."
                  className="w-full pl-10 pr-10 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Categories and Sort */}
              <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(SERVICE_CATEGORIES).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => onCategoryChange(key)}
                      className={`
                        px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${selectedCategory === key
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }
                      `}
                    >
                      {label}
                      {key === 'all' && serviceCount > 0 && (
                        <span className="ml-1 opacity-60">({serviceCount})</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Sort dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    {currentSortLabel}
                    <ChevronDown className={`w-4 h-4 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {sortDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20"
                      >
                        {sortOptions.map(option => (
                          <button
                            key={option.value}
                            onClick={() => {
                              onSortChange(option.value as 'price' | 'popular' | 'name');
                              setSortDropdownOpen(false);
                            }}
                            className={`
                              w-full text-left px-4 py-2 text-sm hover:bg-gray-50
                              ${sortBy === option.value ? 'text-green-600 font-semibold' : 'text-gray-700'}
                            `}
                          >
                            {option.label}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Active filters summary */}
              {(selectedCategory !== 'all' || searchQuery) && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">Aktivni filteri:</span>
                  {selectedCategory !== 'all' && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                      {SERVICE_CATEGORIES[selectedCategory as keyof typeof SERVICE_CATEGORIES]}
                      <button
                        onClick={() => onCategoryChange('all')}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded">
                      "{searchQuery}"
                      <button
                        onClick={() => onSearchChange('')}
                        className="ml-1 hover:text-green-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}

              {/* Results count */}
              <div className="text-sm text-gray-600">
                Prikazano <span className="font-semibold">{serviceCount}</span> usluga
              </div>
            </div>
          </motion.div>
      </AnimatePresence>

      {/* Click outside to close on mobile */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-25 z-10 md:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        />
      )}

      {/* Click outside to close sort dropdown */}
      {sortDropdownOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setSortDropdownOpen(false)}
        />
      )}
    </div>
  );
}