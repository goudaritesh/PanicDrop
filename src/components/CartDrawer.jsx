import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { Button } from './ui/button'

export default function CartDrawer() {
  const { isCartOpen, setIsCartOpen, cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart()
  const navigate = useNavigate()

  if (!isCartOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity"
        onClick={() => setIsCartOpen(false)}
      ></div>

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-slate-900 border-l border-white/10 shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-950">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            Your Cart
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-6">
          {cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center text-slate-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              </div>
              <div>
                <p className="text-lg font-medium text-white mb-1">Your cart is empty</p>
                <p className="text-sm text-slate-400">Looks like you haven't added anything yet.</p>
              </div>
              <Button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 bg-white/10 hover:bg-white/20 text-white border-0"
              >
                Continue Shopping
              </Button>
            </div>
          ) : (
            cartItems.map(item => (
              <div key={item.id} className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5 group">
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0">
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className="font-medium text-sm text-white line-clamp-2">{item.name}</h4>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                    <p className="text-blue-400 font-semibold text-sm">₹{item.price.toFixed(2)}</p>
                  </div>
                  
                  <div className="flex items-center gap-3 mt-3">
                    <div className="flex items-center bg-slate-950 rounded-lg border border-white/10">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-slate-950">
            <div className="flex items-center justify-between mb-4">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-xl font-bold text-white">₹{getCartTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-slate-500 mb-6 text-center">Shipping and taxes calculated at checkout.</p>
            <Button 
              onClick={() => {
                setIsCartOpen(false)
                navigate('/checkout')
              }}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 border-0 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all transform hover:-translate-y-1"
            >
              Proceed to Checkout
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
