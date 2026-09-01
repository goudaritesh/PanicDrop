import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { formatINR } from '../lib/formatters';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Star,
  Filter,
  X,
  SlidersHorizontal
} from 'lucide-react';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // URL Params
  const search = searchParams.get('search') || '';
  const selectedCategory = searchParams.get('category') || 'All';
  const selectedBrand = searchParams.get('brand') || '';
  const selectedSort = searchParams.get('sort') || 'popular';
  const inStockOnly = searchParams.get('inStock') === 'true';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const minRating = searchParams.get('minRating') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Inputs
  const [searchInput, setSearchInput] = useState(search);
  const [minPriceInput, setMinPriceInput] = useState(minPrice);
  const [maxPriceInput, setMaxPriceInput] = useState(maxPrice);

  const POPULAR_BRANDS = [
    'Apple', 'Samsung', 'OnePlus', 'boAt', 'Sony', 'Noise', 'ASUS', 'HP', 'Puma', 'Nike', 'Philips', 'Xiaomi', 'Zebronics', 'Logitech', 'Fire-Boltt', 'Realme'
  ];

  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.products.getCategories();
        if (res.success) {
          setCategories(res.categories || []);
        }
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const queryParams = {
          search,
          category: selectedCategory !== 'All' ? selectedCategory : undefined,
          brand: selectedBrand || undefined,
          sort: selectedSort,
          inStock: inStockOnly ? 'true' : undefined,
          minPrice: minPrice || undefined,
          maxPrice: maxPrice || undefined,
          minRating: minRating || undefined,
          page,
          limit: 24,
        };

        const res = await api.products.getAll(queryParams);
        if (res.success) {
          setProducts(res.products || []);
          setTotalProducts(res.total || 0);
          setTotalPages(res.totalPages || 1);
        }
      } catch (err) {
        console.error('Failed to fetch catalog:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [search, selectedCategory, selectedBrand, selectedSort, inStockOnly, minPrice, maxPrice, minRating, page]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'All' || value === false) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParam('search', searchInput.trim());
  };

  const handlePriceApply = (e) => {
    e.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (minPriceInput) next.set('minPrice', minPriceInput);
    else next.delete('minPrice');
    if (maxPriceInput) next.set('maxPrice', maxPriceInput);
    else next.delete('maxPrice');
    next.delete('page');
    setSearchParams(next);
  };

  const handleResetFilters = () => {
    setSearchInput('');
    setMinPriceInput('');
    setMaxPriceInput('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters =
    Boolean(search) ||
    (selectedCategory && selectedCategory !== 'All') ||
    Boolean(selectedBrand) ||
    selectedSort !== 'popular' ||
    inStockOnly ||
    Boolean(minPrice) ||
    Boolean(maxPrice) ||
    Boolean(minRating);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Header bar */}
      <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              All Products
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Showing {products.length > 0 ? (page - 1) * 24 + 1 : 0} - {Math.min(page * 24, totalProducts)} of {totalProducts.toLocaleString()} items
            </p>
          </div>

          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden px-3.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 flex items-center gap-1.5 self-start"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex gap-6">
          
          {/* Left Simple Filter Sidebar */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-5 sticky top-20 shadow-sm text-xs">
              
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <span className="font-bold text-gray-900 uppercase text-[11px] tracking-wide">
                  FILTERS
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-xs font-semibold text-indigo-600 hover:underline"
                  >
                    Reset
                  </button>
                )}
              </div>

              {/* Categories */}
              <div>
                <span className="font-bold text-gray-800 uppercase tracking-wide block mb-2 text-[10px]">
                  CATEGORIES
                </span>
                <div className="space-y-1">
                  <button
                    onClick={() => updateParam('category', 'All')}
                    className={`w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === 'All'
                        ? 'bg-indigo-50 text-indigo-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    All Categories
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => updateParam('category', c.name)}
                      className={`w-full text-left py-1.5 px-2 rounded-lg font-medium transition-colors flex items-center justify-between ${
                        selectedCategory === c.name
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <span className="truncate max-w-[130px]">{c.name}</span>
                      <span className="text-[10px] text-gray-400 font-mono">({c.count})</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-800 uppercase tracking-wide block mb-2 text-[10px]">
                  PRICE RANGE (₹)
                </span>
                <form onSubmit={handlePriceApply} className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPriceInput}
                      onChange={(e) => setMinPriceInput(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-600 font-mono"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPriceInput}
                      onChange={(e) => setMaxPriceInput(e.target.value)}
                      className="w-1/2 border border-gray-300 rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-600 font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-lg text-xs"
                  >
                    Apply
                  </button>
                </form>
              </div>

              {/* Brands */}
              <div className="pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-800 uppercase tracking-wide block mb-2 text-[10px]">
                  BRAND
                </span>
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {POPULAR_BRANDS.map((b) => {
                    const isChecked = selectedBrand.toLowerCase() === b.toLowerCase();
                    return (
                      <label key={b} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-indigo-600">
                        <input
                          type="radio"
                          name="brand"
                          checked={isChecked}
                          onChange={() => updateParam('brand', isChecked ? '' : b)}
                          className="rounded text-indigo-600 focus:ring-0"
                        />
                        <span className="text-xs">{b}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Ratings */}
              <div className="pt-3 border-t border-gray-100">
                <span className="font-bold text-gray-800 uppercase tracking-wide block mb-2 text-[10px]">
                  MINIMUM RATING
                </span>
                <div className="space-y-1">
                  {[4, 3].map((star) => (
                    <button
                      key={star}
                      onClick={() => updateParam('minRating', minRating === String(star) ? '' : String(star))}
                      className={`w-full text-left py-1 px-2 rounded-lg font-medium flex items-center gap-1.5 ${
                        minRating === String(star)
                          ? 'bg-indigo-50 text-indigo-700 font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{star} Stars & Above</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* In Stock */}
              <div className="pt-3 border-t border-gray-100">
                <label className="flex items-center gap-2 cursor-pointer text-gray-700">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => updateParam('inStock', e.target.checked ? 'true' : null)}
                    className="rounded text-indigo-600 focus:ring-0"
                  />
                  <span className="font-semibold text-xs">In Stock Only</span>
                </label>
              </div>

            </div>
          </aside>

          {/* Right Product Grid */}
          <main className="flex-1 space-y-4">
            
            {/* Sort Toolbar */}
            <div className="bg-white rounded-xl border border-gray-200 p-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <span className="font-semibold">Sort by:</span>
                {[
                  { id: 'popular', label: 'Popular' },
                  { id: 'price-asc', label: 'Price: Low to High' },
                  { id: 'price-desc', label: 'Price: High to Low' },
                  { id: 'rating', label: 'Customer Rating' },
                  { id: 'newest', label: 'Newest' },
                ].map((s) => (
                  <button
                    key={s.id}
                    onClick={() => updateParam('sort', s.id)}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      selectedSort === s.id
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <div key={n} className="h-72 bg-white rounded-xl border border-gray-200 animate-pulse p-4" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-sm space-y-3">
                <Search className="w-10 h-10 text-gray-400 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No products match your filters</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto">
                  Try checking your search term or clearing filters to view all 10,000+ items.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-lg hover:bg-indigo-700"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.map((p) => (
                  <ProductCard key={p._id || p.id} product={p} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm font-medium">
                <div className="text-gray-500">
                  Page <strong className="text-gray-900">{page}</strong> of <strong className="text-gray-900">{totalPages.toLocaleString()}</strong>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => updateParam('page', page - 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  {[Math.max(1, page - 2), Math.max(1, page - 1), page, Math.min(totalPages, page + 1), Math.min(totalPages, page + 2)]
                    .filter((v, i, a) => a.indexOf(v) === i)
                    .map((pNum) => (
                      <button
                        key={pNum}
                        onClick={() => updateParam('page', pNum)}
                        className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold ${
                          pNum === page
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {pNum}
                      </button>
                    ))}

                  <button
                    disabled={page >= totalPages}
                    onClick={() => updateParam('page', page + 1)}
                    className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 font-semibold"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

          </main>

        </div>
      </div>

      <Footer />
    </div>
  );
}
