import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Truck, RotateCcw, Zap, Heart, MapPin, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-600 font-sans text-xs mt-auto">
      
      {/* 4 Trust Highlights */}
      <div className="border-b border-gray-100 py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold">10,000+ Products</h4>
              <p className="text-[11px] text-gray-500">100% Genuine with Warranty</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold">Quality Assured</h4>
              <p className="text-[11px] text-gray-500">Inspected & Safe Packaging</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold">7 Days Easy Returns</h4>
              <p className="text-[11px] text-gray-500">Doorstep replacement guarantee</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-gray-900 font-bold">Pan-India Express</h4>
              <p className="text-[11px] text-gray-500">Free delivery above ₹499</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          
          <div>
            <h4 className="text-gray-900 font-bold uppercase tracking-wider text-[11px] mb-3">About PanicDrop</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link to="/catalog" className="hover:text-indigo-600">About Us</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Careers</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Press & Media</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Corporate Information</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold uppercase tracking-wider text-[11px] mb-3">Customer Support</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link to="/orders" className="hover:text-indigo-600">Payment Methods</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-600">Shipping & Delivery</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-600">Cancellation & Returns</Link></li>
              <li><Link to="/orders" className="hover:text-indigo-600">Track Orders</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-gray-900 font-bold uppercase tracking-wider text-[11px] mb-3">Consumer Policy</h4>
            <ul className="space-y-2 text-gray-500">
              <li><Link to="/catalog" className="hover:text-indigo-600">Terms of Use</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Privacy Policy</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Security & Encryption</Link></li>
              <li><Link to="/catalog" className="hover:text-indigo-600">Grievance Redressal</Link></li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-gray-900 font-bold uppercase tracking-wider text-[11px] mb-3">Registered Office</h4>
            <p className="text-gray-500 leading-relaxed text-[11px]">
              PanicDrop Internet Private Limited,<br />
              Embassy Tech Village, Outer Ring Road,<br />
              Bengaluru, 560103, Karnataka, India<br />
              CIN: U51109KA2026PTC088210
            </p>
            <div className="pt-2 text-indigo-600 font-bold text-[11px]">
              UPI &bull; NetBanking &bull; Cards &bull; COD &bull; No Cost EMI
            </div>
          </div>

        </div>

        {/* Bottom copyright */}
        <div className="border-t border-gray-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-gray-400 text-xs gap-3">
          <p>© 2026 PanicDrop.in. All rights reserved.</p>
          <div className="flex items-center gap-4 text-gray-600">
            <Link to="/admin/dashboard" className="text-amber-600 hover:underline font-bold">Admin Portal</Link>
            <Link to="/wishlist" className="hover:text-indigo-600">Wishlist</Link>
            <Link to="/orders" className="hover:text-indigo-600">Orders</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
