import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import { api } from '../services/api';
import { formatINR, calculateEMI } from '../lib/formatters';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  ShoppingBag,
  Zap,
  Heart,
  ShieldCheck,
  Truck,
  RotateCcw,
  MapPin,
  Tag,
  ChevronRight,
  CheckCircle2,
  Check
} from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, setIsCartOpen } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdded, setIsAdded] = useState(false);

  // Pincode state
  const [checkPincode, setCheckPincode] = useState('560038');
  const [pincodeStatus, setPincodeStatus] = useState({
    checked: true,
    estimatedDate: 'Tomorrow, by 5:00 PM',
  });

  // Review Form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.products.getById(id);
        if (res.success && res.product) {
          setProduct(res.product);
          setRelatedProducts(res.relatedProducts || []);
          setSelectedImage(0);
        } else {
          setError('Product not found');
        }
      } catch (err) {
        setError(err.message || 'Failed to load product');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const productId = product?._id || product?.id;
  const isWishlisted = isInWishlist(productId);

  const handleAddToCart = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
      setIsCartOpen(true);
    }, 400);
  };

  const handleBuyNow = () => {
    if (!product || product.stock <= 0) return;
    addToCart(product, 1);
    navigate('/checkout');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (checkPincode.length === 6 && !isNaN(checkPincode)) {
      setPincodeStatus({
        checked: true,
        estimatedDate: checkPincode.startsWith('56') ? 'Tomorrow, by 2:00 PM' : 'In 2-3 Business Days',
      });
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setReviewSubmitting(true);
    setReviewMessage(null);
    try {
      const res = await api.products.addReview(product._id, {
        rating: reviewRating,
        comment: reviewComment,
      });
      if (res.success) {
        setReviewMessage({ type: 'success', text: 'Thank you! Your verified review has been submitted.' });
        setReviewComment('');
        const updated = await api.products.getById(id);
        if (updated.success) setProduct(updated.product);
      }
    } catch (err) {
      setReviewMessage({ type: 'error', text: err.message });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-12">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-12 text-center space-y-3">
          <h2 className="text-xl font-bold text-gray-800">Product Not Found</h2>
          <p className="text-xs text-gray-500">The product you requested does not exist or has been removed.</p>
          <Link to="/catalog" className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold text-xs">
            Back to Products
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const images = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

  const discountPercent =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-2.5 px-4 sm:px-6 lg:px-8 text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 font-medium truncate">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/catalog" className="hover:text-indigo-600">Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to={`/catalog?category=${encodeURIComponent(product.category)}`} className="hover:text-indigo-600">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold truncate max-w-xs">{product.name}</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Gallery & Action Buttons (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square border border-gray-200 rounded-xl p-4 bg-gray-50 flex items-center justify-center">
              <img
                src={images[selectedImage] || images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain"
              />
              
              {/* Wishlist Button */}
              <button
                onClick={() => toggleWishlist(product)}
                className={`absolute top-3 right-3 p-2 rounded-full shadow-sm border transition-all ${
                  isWishlisted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-white border-gray-200 text-gray-400 hover:text-rose-500'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
              </button>
            </div>

            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-16 h-16 rounded-lg border-2 p-1 bg-white ${
                      selectedImage === idx ? 'border-indigo-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-600" />
                <span>{isAdded ? 'ADDED' : 'ADD TO CART'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={product.stock <= 0}
                className="py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors disabled:opacity-40 flex items-center justify-center gap-1.5"
              >
                <Zap className="w-4 h-4" />
                <span>BUY NOW</span>
              </button>
            </div>
          </div>

          {/* Right Column: Title, Ratings, Pricing, Offers & Specs (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            <div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {product.brand} &bull; {product.category}
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mt-1 leading-snug">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-2 mt-2">
                <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-bold text-xs flex items-center gap-1">
                  {product.rating || 4.2} <Star className="w-3 h-3 fill-white" />
                </span>
                <span className="text-xs text-gray-500 font-medium">
                  {(product.numReviews || 120).toLocaleString()} Verified Ratings
                </span>
                {product.badge && (
                  <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[11px] font-semibold rounded-full">
                    {product.badge}
                  </span>
                )}
              </div>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                  {formatINR(product.price)}
                </span>
                {product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatINR(product.originalPrice)}
                  </span>
                )}
                {discountPercent && (
                  <span className="text-sm font-bold text-emerald-600">
                    {discountPercent}% OFF
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">Inclusive of all taxes &bull; Free delivery on orders above ₹499</p>
            </div>

            {/* Bank Offers Box */}
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 space-y-2 text-xs">
              <span className="font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" /> Available Offers
              </span>
              <ul className="space-y-1.5 text-gray-700 text-xs">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Bank Offer:</strong> Flat 10% instant discount on HDFC, ICICI & SBI Cards on orders above ₹4,999.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Promo Code:</strong> Apply coupon <strong>DESI20</strong> in cart for 20% discount.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span><strong>No Cost EMI:</strong> Available starting from <strong>{formatINR(calculateEMI(product.price))}/month</strong>.</span>
                </li>
              </ul>
            </div>

            {/* PIN Code Delivery Checker */}
            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-indigo-600" /> Check Delivery to Pincode
                </span>
                {pincodeStatus.checked && (
                  <span className="text-emerald-700 font-bold">
                    Delivery by {pincodeStatus.estimatedDate} | FREE
                  </span>
                )}
              </div>
              <form onSubmit={handlePincodeCheck} className="flex gap-2">
                <input
                  type="text"
                  maxLength={6}
                  value={checkPincode}
                  onChange={(e) => setCheckPincode(e.target.value)}
                  placeholder="Enter 6-digit Pincode"
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-gray-800 hover:bg-gray-900 text-white font-bold rounded-lg text-xs"
                >
                  Check
                </button>
              </form>
            </div>

            {/* Description & Specs Table */}
            <div className="space-y-3 pt-2">
              <h3 className="font-bold text-sm text-gray-900">Product Highlights</h3>
              <p className="text-xs text-gray-600 leading-relaxed font-light">{product.description}</p>
              
              {product.specs && Object.keys(product.specs).length > 0 && (
                <div className="border border-gray-200 rounded-xl overflow-hidden mt-3">
                  <table className="w-full text-left text-xs">
                    <tbody className="divide-y divide-gray-100">
                      {Object.entries(product.specs).map(([key, val]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="p-2.5 font-semibold text-gray-500 w-1/3 bg-gray-50/70">{key}</td>
                          <td className="p-2.5 text-gray-800">{val}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Customer Reviews Form */}
            <div className="pt-4 border-t border-gray-100 space-y-3">
              <h3 className="font-bold text-base text-gray-900">Customer Reviews</h3>
              
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <h4 className="font-bold text-xs text-gray-800">Submit Your Review</h4>
                  {reviewMessage && (
                    <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold">
                      {reviewMessage.text}
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setReviewRating(s)}
                        className="text-amber-400"
                      >
                        <Star className={`w-4 h-4 ${s <= reviewRating ? 'fill-amber-400' : 'text-gray-300'}`} />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Share feedback on product quality, features, and delivery speed..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2 text-xs text-gray-900 focus:outline-none focus:border-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Post Review'}
                  </button>
                </form>
              ) : (
                <div className="text-xs text-gray-500 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <Link to="/login" className="text-indigo-600 font-bold underline">Login</Link> to write a verified customer review.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mt-6 shadow-sm">
            <h3 className="font-bold text-base text-gray-900 mb-4">Frequently Viewed Together</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedProducts.map((rel) => (
                <ProductCard key={rel._id || rel.id} product={rel} />
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
