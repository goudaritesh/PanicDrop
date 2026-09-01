import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import {
  Smartphone,
  Laptop,
  Headphones,
  Watch,
  Shirt,
  Home,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  ArrowRight
} from 'lucide-react';

export default function Landing() {
  const [deals, setDeals] = useState([]);
  const [mobiles, setMobiles] = useState([]);
  const [electronics, setElectronics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [dealsRes, mobilesRes, electronicsRes] = await Promise.all([
          api.products.getAll({ limit: 4, sort: 'popular' }),
          api.products.getAll({ category: 'Mobiles & Accessories', limit: 4 }),
          api.products.getAll({ category: 'Electronics & Audio', limit: 4 }),
        ]);

        if (dealsRes.success) setDeals(dealsRes.products || []);
        if (mobilesRes.success) setMobiles(mobilesRes.products || []);
        if (electronicsRes.success) setElectronics(electronicsRes.products || []);
      } catch (err) {
        console.error('Failed to load landing data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const CATEGORIES = [
    { name: 'Mobiles & 5G', icon: Smartphone, path: '/catalog?category=Mobiles %26 Accessories' },
    { name: 'Laptops & PCs', icon: Laptop, path: '/catalog?category=Electronics %26 Audio' },
    { name: 'Audio & Earbuds', icon: Headphones, path: '/catalog?category=Electronics %26 Audio' },
    { name: 'Smartwatches', icon: Watch, path: '/catalog?category=Smart Wearables %26 Watches' },
    { name: 'Fashion & Wear', icon: Shirt, path: '/catalog?category=Fashion %26 Lifestyle' },
    { name: 'Home & Kitchen', icon: Home, path: '/catalog?category=Home, Kitchen %26 Appliances' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* 1. Category Icons Bar */}
      <section className="bg-white border-b border-gray-200 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  to={cat.path}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold text-gray-800 group-hover:text-indigo-600">
                    {cat.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* 2. Clean Hero Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 w-full">
        <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 text-white p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full uppercase tracking-wider">
              🇮🇳 India&apos;s Curated Tech Store
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              10,000+ Products at Best Indian Prices
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed font-light">
              Explore smartphones, laptops, audio, smartwatches, and fashion. Get flat 20% off with code <strong>DESI20</strong>.
            </p>
            <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
              <Link
                to="/catalog"
                className="px-6 py-3 bg-white hover:bg-gray-100 text-indigo-700 font-bold text-xs rounded-xl shadow transition-all flex items-center gap-2"
              >
                <span>Shop 10,000+ Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/wishlist"
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl border border-white/20"
              >
                View Wishlist
              </Link>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3 w-64 text-center text-xs">
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <div className="text-xl font-bold text-white">10,000+</div>
              <div className="text-indigo-100 text-[11px]">Total Items</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <div className="text-xl font-bold text-white">417</div>
              <div className="text-indigo-100 text-[11px]">Catalog Pages</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <div className="text-xl font-bold text-white">UPI / COD</div>
              <div className="text-indigo-100 text-[11px]">Zero Fee</div>
            </div>
            <div className="bg-white/10 p-3.5 rounded-xl border border-white/20">
              <div className="text-xl font-bold text-white">7 Days</div>
              <div className="text-indigo-100 text-[11px]">Replacement</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Shelves */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
        
        {/* Shelf 1: Trending Deals */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Trending Deals & Popular Picks</h2>
              <p className="text-xs text-gray-500">Top selling items with exclusive discounts</p>
            </div>
            <Link
              to="/catalog"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {deals.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Shelf 2: Mobiles */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Mobiles & 5G Smartphones</h2>
              <p className="text-xs text-gray-500">Apple, Samsung, OnePlus, Realme, Xiaomi</p>
            </div>
            <Link
              to="/catalog?category=Mobiles %26 Accessories"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All Mobiles</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {mobiles.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>

        {/* Shelf 3: Electronics */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">Laptops, Headphones & Audio</h2>
              <p className="text-xs text-gray-500">ASUS ROG, MacBooks, Sony ANC, boAt Earbuds</p>
            </div>
            <Link
              to="/catalog?category=Electronics %26 Audio"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All Electronics</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {electronics.map((p) => (
              <ProductCard key={p._id || p.id} product={p} />
            ))}
          </div>
        </div>

      </section>

      {/* 4. Trust Banner */}
      <section className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">Free Express Delivery</h4>
              <p className="text-[11px] text-gray-500">On all orders above ₹499</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">100% Genuine Products</h4>
              <p className="text-[11px] text-gray-500">Official brand warranties</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">7 Days Easy Return</h4>
              <p className="text-[11px] text-gray-500">Hassle-free replacement</p>
            </div>
            <div className="space-y-1">
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Tag className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-xs text-gray-900">Best Price Guarantee</h4>
              <p className="text-[11px] text-gray-500">UPI, NetBanking & COD</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
