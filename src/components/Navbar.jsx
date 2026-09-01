import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import {
  ShoppingBag,
  Search,
  User,
  ShieldAlert,
  LogOut,
  Package,
  Menu,
  X,
  Heart,
  ChevronDown,
  MapPin,
  Tag
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [selectedPincode, setSelectedPincode] = useState('560038');
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [tempPincode, setTempPincode] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const navCategories = [
    { name: 'All Products', path: '/catalog' },
    { name: 'Mobiles & 5G', path: '/catalog?category=Mobiles %26 Accessories' },
    { name: 'Electronics & Audio', path: '/catalog?category=Electronics %26 Audio' },
    { name: 'Smartwatches', path: '/catalog?category=Smart Wearables %26 Watches' },
    { name: 'Fashion & Clothing', path: '/catalog?category=Fashion %26 Lifestyle' },
    { name: 'Home & Kitchen', path: '/catalog?category=Home, Kitchen %26 Appliances' },
    { name: 'Sports & Beauty', path: '/catalog?category=Beauty, Toys %26 Sports' },
  ];

  const handlePincodeSave = (e) => {
    e.preventDefault();
    if (tempPincode.length === 6 && !isNaN(tempPincode)) {
      setSelectedPincode(tempPincode);
      setIsPincodeModalOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 text-gray-800 shadow-sm">
      
      {/* Top Banner */}
      <div className="bg-indigo-600 text-white text-xs py-1.5 px-4 text-center font-medium flex items-center justify-between">
        <div className="hidden sm:block text-indigo-100">
          🇮🇳 Free Delivery across India on orders above ₹499
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-1.5 font-semibold">
          <Tag className="w-3.5 h-3.5" />
          <span>Flat 20% Off with coupon: <span className="bg-white text-indigo-700 px-1.5 py-0.5 rounded font-bold">DESI20</span></span>
        </div>
        <div className="hidden md:block text-indigo-100">
          UPI &bull; Cards &bull; NetBanking &bull; Cash on Delivery
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-base shadow-sm group-hover:bg-indigo-700 transition-colors">
              P
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-extrabold tracking-tight text-gray-900">
                Panic<span className="text-indigo-600">Drop</span>
              </span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                .in
              </span>
            </div>
          </Link>

          {/* Delivery Location Pincode */}
          <button
            onClick={() => setIsPincodeModalOpen(true)}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-left text-xs transition-colors"
          >
            <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] text-gray-400">Deliver to</span>
              <span className="font-bold text-gray-800">{selectedPincode}</span>
            </div>
          </button>

          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-xl relative">
            <input
              type="text"
              placeholder="Search 10,000+ products (e.g. iPhone, boAt, Sony, Shoes, Kurtas...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:border-indigo-600 focus:bg-white rounded-lg py-2 pl-10 pr-16 text-xs sm:text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
            />
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-400" />
            {searchQuery && (
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-md transition-colors"
              >
                Search
              </button>
            )}
          </form>

          {/* Right Navigation */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs font-semibold">
            
            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              title="Wishlist"
            >
              <Heart className="w-4 h-4 text-gray-600" />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 transition-colors"
              title="Cart"
            >
              <ShoppingBag className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Cart</span>
              {getCartCount() > 0 && (
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {getCartCount()}
                </span>
              )}
            </button>

            {/* Admin Portal */}
            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className="hidden xl:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                <span>Admin</span>
              </Link>
            )}

            {/* User Account */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-800 transition-colors"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-gray-800 rounded-lg shadow-xl py-1 z-50 text-xs border border-gray-100">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-bold text-gray-900 truncate">{user.name}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email}</p>
                    </div>

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-indigo-600 font-semibold"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Dashboard
                      </Link>
                    )}

                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Package className="w-4 h-4 text-gray-500" /> My Orders
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <Heart className="w-4 h-4 text-gray-500" /> My Wishlist
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-gray-700"
                    >
                      <User className="w-4 h-4 text-gray-500" /> Account Settings
                    </Link>

                    <div className="border-t border-gray-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                        navigate('/');
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-rose-600 hover:bg-rose-50 font-semibold"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-sm"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Secondary Category Ribbon */}
        <div className="hidden lg:flex items-center space-x-6 py-2.5 border-t border-gray-100 text-xs font-semibold text-gray-600 overflow-x-auto whitespace-nowrap">
          {navCategories.map((cat) => {
            const isActive = location.pathname === cat.path || location.search.includes(cat.name);
            return (
              <Link
                key={cat.name}
                to={cat.path}
                className={`transition-colors py-0.5 ${
                  isActive ? 'text-indigo-600 font-bold' : 'hover:text-gray-900'
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

      </div>

      {/* Mobile Drawer */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white p-4 space-y-2 text-xs">
          {navCategories.map((cat) => (
            <Link
              key={cat.name}
              to={cat.path}
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-gray-700 hover:text-indigo-600 font-medium"
            >
              {cat.name}
            </Link>
          ))}
          {isAdmin && (
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-amber-600 font-bold"
            >
              Admin Dashboard
            </Link>
          )}
        </div>
      )}

      {/* Pincode Modal */}
      {isPincodeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl p-6 space-y-4 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                <span>Select Delivery Pincode</span>
              </h3>
              <button onClick={() => setIsPincodeModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Enter your 6-digit Indian PIN code to check delivery time and product availability.
            </p>
            <form onSubmit={handlePincodeSave} className="space-y-3">
              <input
                type="text"
                maxLength={6}
                placeholder="e.g. 560038, 400001, 110001"
                value={tempPincode}
                onChange={(e) => setTempPincode(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-indigo-600"
                required
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                >
                  Save Pincode
                </button>
                <button
                  type="button"
                  onClick={() => setIsPincodeModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 font-semibold text-xs rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </header>
  );
}
