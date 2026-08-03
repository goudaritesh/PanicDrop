import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useCart } from '../context/CartContext'
import { Button } from '../components/ui/button'

export default function Checkout() {
  const { cartItems, getCartTotal, clearCart } = useCart()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  
  const [address, setAddress] = useState('')
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
  }, [])

  // If cart is empty, redirect back to catalog
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigate('/catalog')
    }
  }, [cartItems, navigate, loading])

  const handlePlaceOrder = async (e) => {
    e.preventDefault()
    
    if (!user) {
      setErrorMsg("You must be logged in to place an order.")
      return
    }

    setLoading(true)
    setErrorMsg('')

    try {
      // 1. Create the order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert([{
          user_id: user.id,
          total_amount: getCartTotal(),
          shipping_address: address,
          delivery_instructions: instructions,
          status: 'pending'
        }])
        .select()
        .single()

      if (orderError) throw orderError

      // 2. Insert order items
      const orderItems = cartItems.map(item => ({
        order_id: orderData.id,
        product_id: item.id,
        quantity: item.quantity,
        price_at_time: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      // 3. Success! Clear cart and redirect
      clearCart()
      alert("Order placed successfully! Check the Admin Dashboard to see it.")
      navigate('/')
      
    } catch (error) {
      setErrorMsg(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex items-center justify-center p-6">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 relative z-10">
        
        {/* Left Side: Order Form */}
        <div className="glass-card !p-8">
          <Link to="/catalog" className="inline-flex items-center text-sm font-medium text-slate-400 hover:text-white mb-8 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Cart
          </Link>

          <h2 className="text-3xl font-bold mb-6">Checkout</h2>
          
          {!user && (
            <div className="mb-6 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-start gap-3 text-blue-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-sm">
                <span className="font-semibold block mb-1">Hold up! You're not logged in.</span>
                Please <Link to="/login" className="underline font-bold text-blue-400 hover:text-blue-300">Sign In</Link> to place this order.
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="mb-6 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handlePlaceOrder} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Shipping Address</label>
              <textarea 
                required
                rows="3"
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                placeholder="123 PanicDrop Ave&#10;Speed City, NY 10001"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Delivery Instructions (Optional)</label>
              <input 
                type="text"
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:bg-white/10 transition-all"
                placeholder="Leave at the front door"
              />
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading || !user}
                className="w-full bg-white text-black hover:bg-slate-200 font-bold py-6 rounded-xl border-0 shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all transform hover:-translate-y-0.5 text-lg"
              >
                {loading ? "Processing..." : `Pay $${getCartTotal().toFixed(2)}`}
              </Button>
              <p className="text-center text-xs text-slate-500 mt-4">
                This is a demo checkout. No actual payment will be processed.
              </p>
            </div>
          </form>
        </div>

        {/* Right Side: Order Summary */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col h-full max-h-[80vh] overflow-hidden">
          <h3 className="text-xl font-semibold mb-6">Order Summary</h3>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4 mb-6">
            {cartItems.map(item => (
              <div key={item.id} className="flex gap-4 items-center">
                <div className="relative">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-800 border border-white/10">
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <span className="absolute -top-2 -right-2 bg-slate-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border border-slate-900">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-sm text-white line-clamp-1">{item.name}</h4>
                  <p className="text-slate-500 text-xs mt-1">{item.subcategories?.name}</p>
                </div>
                <div className="font-semibold text-sm">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t border-white/10 pt-4 space-y-3">
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Subtotal</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-400 text-sm">
              <span>Shipping</span>
              <span className="text-blue-400">Free Panic Delivery</span>
            </div>
            <div className="border-t border-white/10 pt-4 mt-2 flex justify-between text-white font-bold text-xl">
              <span>Total</span>
              <span>${getCartTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
