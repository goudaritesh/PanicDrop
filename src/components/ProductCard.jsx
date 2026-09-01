import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { formatINR } from '../lib/formatters';
import { Star, ShoppingBag, Heart, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [added, setAdded] = useState(false);

  const productId = product._id || product.id;
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock <= 0) return;

    addToCart(product, 1);
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setIsCartOpen(true);
    }, 400);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const imageUrl =
    Array.isArray(product.images) && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';

  return (
    <div className="group relative bg-white border border-gray-200 hover:border-gray-300 rounded-xl p-3 sm:p-4 flex flex-col justify-between transition-all duration-200 hover:shadow-md">
      
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full shadow-sm border transition-all ${
          isWishlisted
            ? 'bg-rose-50 border-rose-200 text-rose-500'
            : 'bg-white border-gray-200 text-gray-400 hover:text-rose-500'
        }`}
        title={isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
      >
        <Heart
          className={`w-4 h-4 transition-transform group-hover:scale-110 ${
            isWishlisted ? 'fill-rose-500' : ''
          }`}
        />
      </button>

      {/* Product Image */}
      <Link
        to={`/products/${productId}`}
        className="block relative aspect-square mb-2.5 overflow-hidden rounded-lg bg-gray-50 flex items-center justify-center p-2"
      >
        <img
          src={imageUrl}
          alt={product.name}
          className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {product.badge && (
          <span className="absolute bottom-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-indigo-600 text-white shadow-sm">
            {product.badge}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="flex flex-col flex-1 justify-between gap-2">
        <div>
          {/* Brand & Subcategory */}
          <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide truncate">
            {product.brand}
          </div>

          {/* Product Name */}
          <Link
            to={`/products/${productId}`}
            className="block text-xs sm:text-sm font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 leading-snug mt-0.5"
          >
            {product.name}
          </Link>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1">
            <span className="px-1.5 py-0.2 rounded bg-emerald-600 text-white text-[11px] font-bold flex items-center gap-0.5">
              {product.rating || 4.2} <Star className="w-2.5 h-2.5 fill-white" />
            </span>
            <span className="text-[11px] text-gray-400 font-medium">
              ({(product.numReviews || 120).toLocaleString()})
            </span>
            {product.stock <= 5 && product.stock > 0 && (
              <span className="text-[10px] font-bold text-amber-600 ml-auto">
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-2 border-t border-gray-100 mt-1">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-base sm:text-lg font-bold text-gray-900">
              {formatINR(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-gray-400 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
            {discountPercent && (
              <span className="text-xs font-bold text-emerald-600">
                {discountPercent}% off
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className={`mt-2.5 w-full py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              product.stock <= 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : added
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {product.stock <= 0 ? (
              'Out of Stock'
            ) : added ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" /> Add to Cart
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
