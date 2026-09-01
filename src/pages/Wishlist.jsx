import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatINR } from '../lib/formatters';
import { Heart, Trash2, ShoppingBag, ChevronRight, Star } from 'lucide-react';

export default function Wishlist() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, setIsCartOpen } = useCart();
  const navigate = useNavigate();

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id || product.id);
    setIsCartOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">My Wishlist ({wishlistItems.length})</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
              <span>My Wishlist ({wishlistItems.length})</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Saved items you plan to purchase.</p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Your Wishlist is Empty</h3>
              <p className="text-xs text-gray-500 mt-1">
                Explore our 10,000+ products and tap the heart icon on any product to save it here.
              </p>
            </div>
            <Link
              to="/catalog"
              className="inline-block px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => {
              const image = Array.isArray(item.images) ? item.images[0] : item.image || '';
              const discount = item.originalPrice && item.originalPrice > item.price
                ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
                : null;

              return (
                <div
                  key={item._id || item.id}
                  className="bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-4 flex flex-col justify-between transition-all hover:shadow-md"
                >
                  <div className="relative aspect-square rounded-lg bg-gray-50 p-2 flex items-center justify-center mb-3">
                    <img
                      src={image}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                    />
                    <button
                      onClick={() => removeFromWishlist(item._id || item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-white border border-gray-200 text-gray-400 hover:text-rose-500 shadow-sm"
                      title="Remove"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[11px] font-semibold text-gray-500 uppercase mb-0.5">
                        {item.brand}
                      </div>
                      <Link
                        to={`/products/${item._id || item.id}`}
                        className="text-xs sm:text-sm font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 leading-snug"
                      >
                        {item.name}
                      </Link>
                    </div>

                    <div className="pt-2 border-t border-gray-100">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-base font-bold text-gray-900">
                          {formatINR(item.price)}
                        </span>
                        {item.originalPrice && (
                          <span className="text-xs text-gray-400 line-through">
                            {formatINR(item.originalPrice)}
                          </span>
                        )}
                        {discount && (
                          <span className="text-xs font-bold text-emerald-600">
                            {discount}% off
                          </span>
                        )}
                      </div>

                      <button
                        onClick={() => handleMoveToCart(item)}
                        className="mt-3 w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" /> Move to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
