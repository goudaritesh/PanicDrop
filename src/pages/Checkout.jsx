import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { formatINR, INDIAN_STATES } from '../lib/formatters';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ShoppingBag,
  MapPin,
  Lock,
  Smartphone,
  Building2,
  Banknote,
  ChevronRight
} from 'lucide-react';

export default function Checkout() {
  const {
    cartItems,
    getCartSubtotal,
    getDiscountAmount,
    getCartTotal,
    coupon,
    clearCart,
  } = useCart();

  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Form State with Indian Address Structure
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.name || 'Aarav Patel',
    address: user?.address?.street || 'Flat 402, Cyber Heights, Hitec City',
    city: user?.address?.city || 'Hyderabad',
    state: user?.address?.state || 'Telangana',
    postalCode: user?.address?.postalCode || '500081',
    country: 'India',
    phone: user?.phone || '+91 91234 56789',
    landmark: 'Near Tech Hub',
  });

  const [paymentMethod, setPaymentMethod] = useState('UPI (Google Pay / PhonePe / Paytm)');
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState(null);

  const handleInputChange = (e) => {
    setShippingAddress({
      ...shippingAddress,
      [e.target.name]: e.target.value,
    });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('Your cart is empty');
      return;
    }

    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.postalCode) {
      setError('Please fill in all mandatory shipping address fields including PIN Code.');
      return;
    }

    if (shippingAddress.postalCode.length !== 6 || isNaN(shippingAddress.postalCode)) {
      setError('Please enter a valid 6-digit Indian PIN Code.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id || item.id,
          name: item.name,
          image: Array.isArray(item.images) ? item.images[0] : item.image,
          price: Number(item.price),
          quantity: item.quantity,
        })),
        shippingAddress,
        paymentMethod: paymentMethod.startsWith('UPI') ? `UPI (${upiId})` : paymentMethod,
        itemsPrice: getCartSubtotal(),
        taxPrice: 0,
        shippingPrice: 0,
        totalAmount: getCartTotal(),
      };

      const res = await api.orders.create(orderData);
      if (res.success) {
        clearCart();
        setOrderSuccess(res.order);
      } else {
        setError(res.message || 'Failed to place order');
      }
    } catch (err) {
      setError(err.message || 'Error occurred while placing order');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-lg w-full bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 text-center space-y-6 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                ORDER CONFIRMED
              </span>
              <h1 className="text-2xl font-bold text-gray-900">Thank You! Order Placed</h1>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Order <span className="font-mono font-bold text-gray-800">#{orderSuccess._id.slice(-8).toUpperCase()}</span> has been confirmed. Confirmation details sent to registered email.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gray-50 border border-gray-200 text-left text-xs space-y-2">
              <div className="flex justify-between text-gray-600">
                <span>Tracking Number:</span>
                <span className="text-gray-900 font-bold font-mono">{orderSuccess.trackingNumber || 'BLUEDART-IND-77189'}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Total Amount:</span>
                <span className="text-indigo-700 font-bold font-mono">{formatINR(orderSuccess.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment Mode:</span>
                <span className="text-gray-900 font-medium">{orderSuccess.paymentMethod}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery Address:</span>
                <span className="text-gray-900 font-medium truncate max-w-[200px]">{orderSuccess.shippingAddress.city}, {orderSuccess.shippingAddress.state} - {orderSuccess.shippingAddress.postalCode}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/orders"
                className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-colors"
              >
                Track Your Order
              </Link>
              <Link
                to="/catalog"
                className="flex-1 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-xs transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/catalog" className="hover:text-indigo-600">Cart</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">Secure Checkout</span>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1">
        
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Address & Payment (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Delivery Address */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  1
                </div>
                <h2 className="text-base font-bold text-gray-900">Delivery Address in India</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="fullName"
                    value={shippingAddress.fullName}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Mobile Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={shippingAddress.phone}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">Flat / House No. / Building / Street *</label>
                  <input
                    type="text"
                    name="address"
                    value={shippingAddress.address}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">PIN Code (6 digits) *</label>
                  <input
                    type="text"
                    name="postalCode"
                    maxLength={6}
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">State *</label>
                  <select
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none bg-white"
                  >
                    {INDIAN_STATES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Landmark (Optional)</label>
                  <input
                    type="text"
                    name="landmark"
                    value={shippingAddress.landmark}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 focus:border-indigo-600 rounded-lg px-3 py-2 text-xs focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Payment Options */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">
                  2
                </div>
                <h2 className="text-base font-bold text-gray-900">Payment Options</h2>
              </div>

              <div className="space-y-3">
                
                {/* UPI */}
                <label className={`p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-colors ${
                  paymentMethod.startsWith('UPI') ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod.startsWith('UPI')}
                        onChange={() => setPaymentMethod('UPI (Google Pay / PhonePe / Paytm)')}
                        className="text-indigo-600 focus:ring-0"
                      />
                      <Smartphone className="w-4 h-4 text-indigo-600" />
                      <span className="text-xs font-bold text-gray-900">UPI Instant Payment (GPay / PhonePe / Paytm)</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">FASTEST</span>
                  </div>

                  {paymentMethod.startsWith('UPI') && (
                    <div className="pt-2 pl-6">
                      <input
                        type="text"
                        placeholder="Enter Virtual Payment Address (e.g. mobile@upi)"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full max-w-sm border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-indigo-600 font-mono bg-white"
                      />
                    </div>
                  )}
                </label>

                {/* Credit / Debit Cards */}
                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'Credit / Debit Cards' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Credit / Debit Cards'}
                      onChange={() => setPaymentMethod('Credit / Debit Cards')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <CreditCard className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-gray-900">Credit / Debit Cards (Visa, Mastercard, RuPay)</span>
                  </div>
                </label>

                {/* Net Banking */}
                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'Net Banking (All Major Indian Banks)' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Net Banking (All Major Indian Banks)'}
                      onChange={() => setPaymentMethod('Net Banking (All Major Indian Banks)')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <Building2 className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-gray-900">Net Banking (HDFC, ICICI, SBI, Axis, Kotak)</span>
                  </div>
                </label>

                {/* Cash on Delivery */}
                <label className={`p-4 rounded-xl border flex items-center justify-between cursor-pointer transition-colors ${
                  paymentMethod === 'Cash on Delivery (COD)' ? 'border-indigo-600 bg-indigo-50/50' : 'border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'Cash on Delivery (COD)'}
                      onChange={() => setPaymentMethod('Cash on Delivery (COD)')}
                      className="text-indigo-600 focus:ring-0"
                    />
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-gray-900">Cash on Delivery (Pay cash/UPI at doorstep)</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-medium">₹0 Extra Fee</span>
                </label>

              </div>
            </div>

          </div>

          {/* Right Column: Order Summary (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4 sticky top-20">
              <h3 className="text-base font-bold text-gray-900 pb-3 border-b border-gray-100">
                Order Summary ({cartItems.length} items)
              </h3>

              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div key={item._id || item.id} className="flex gap-2.5 text-xs items-center">
                    <img
                      src={Array.isArray(item.images) ? item.images[0] : item.image}
                      alt=""
                      className="w-10 h-10 object-contain rounded border border-gray-200 p-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-gray-500 text-[11px]">Qty: {item.quantity}</p>
                    </div>
                    <span className="font-bold text-gray-900 font-mono">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 pt-3 border-t border-gray-100 text-xs text-gray-600 font-medium">
                <div className="flex justify-between">
                  <span>Items Subtotal</span>
                  <span className="font-mono text-gray-900">{formatINR(getCartSubtotal())}</span>
                </div>
                {coupon && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Coupon ({coupon.code})</span>
                    <span className="font-mono">-{formatINR(getDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping & Delivery</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Amount</span>
                  <span className="text-base text-indigo-700 font-mono">{formatINR(getCartTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || cartItems.length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Processing Order...' : 'Place Order & Pay'}
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>256-Bit SSL Encrypted & Verified</span>
              </div>
            </div>
          </div>

        </form>
      </main>

      <Footer />
    </div>
  );
}
