import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { api } from '../services/api';
import { formatINR } from '../lib/formatters';
import { useAuth } from '../context/AuthContext';
import {
  Package,
  Clock,
  CheckCircle,
  Truck,
  ChevronRight,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const res = await api.orders.getMyOrders();
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Delivered
          </span>
        );
      case 'shipped':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" /> Out for Delivery
          </span>
        );
      case 'processing':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Processing & Packed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-rose-100 text-rose-800">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-gray-100 text-gray-800">
            Order Placed
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col font-sans">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-500 font-medium">
          <Link to="/" className="hover:text-indigo-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-bold">My Orders</span>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Orders & Shipments</h1>
          <p className="text-xs text-gray-500 mt-0.5">Track your packages, download invoices, and manage past orders.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 rounded-2xl bg-white border border-gray-200 animate-pulse p-4" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
              <p className="text-xs text-gray-500 mt-1">
                Explore our 10,000+ products catalog with free delivery across India.
              </p>
            </div>
            <Link
              to="/catalog"
              className="inline-block px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-2xl p-6 space-y-5 shadow-sm"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-gray-900 font-mono">
                        ORDER #{order._id.slice(-8).toUpperCase()}
                      </span>
                      {getStatusBadge(order.orderStatus)}
                    </div>
                    <p className="text-xs text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} &bull; GST Invoice Ready
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Total Paid</div>
                      <div className="text-base font-bold text-gray-900 font-mono">
                        {formatINR(order.totalAmount)}
                      </div>
                    </div>
                    <div className="px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 text-xs font-mono text-gray-700">
                      Tracking: <strong className="text-indigo-600">{order.trackingNumber || 'DELHIVERY-77189'}</strong>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="grid grid-cols-4 gap-2 text-center relative">
                    {[
                      { title: 'Order Placed', done: true },
                      { title: 'Packed in Hub', done: ['processing', 'shipped', 'delivered'].includes(order.orderStatus) },
                      { title: 'Out for Delivery', done: ['shipped', 'delivered'].includes(order.orderStatus) },
                      { title: 'Delivered', done: order.orderStatus === 'delivered' },
                    ].map((step, idx) => (
                      <div key={step.title} className="flex flex-col items-center gap-1.5 z-10">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono ${
                            step.done
                              ? 'bg-indigo-600 text-white shadow-sm'
                              : 'bg-gray-200 text-gray-500'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <span className={`text-[11px] ${step.done ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                          {step.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Items in Delivery */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-gray-700 uppercase">Items in this Order:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {order.orderItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-gray-50 rounded-xl border border-gray-200 flex gap-3 items-center"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=100&q=80'}
                          alt=""
                          className="w-12 h-12 rounded-lg object-contain bg-white border border-gray-200 p-1 flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-semibold text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-600 font-mono mt-0.5">
                            {item.quantity} × {formatINR(item.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer address */}
                <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row justify-between text-xs text-gray-500 gap-2">
                  <div>
                    <strong>Shipping Address:</strong> {order.shippingAddress.fullName}, {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}
                  </div>
                  <div className="text-gray-700 font-medium">
                    Payment Method: {order.paymentMethod}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
