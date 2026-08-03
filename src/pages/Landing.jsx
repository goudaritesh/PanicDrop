import React from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop')] bg-cover bg-center bg-fixed text-white font-sans selection:bg-purple-500/30">
      <div className="min-h-screen bg-black/50 pt-4">
        {/* Navigation */}
        <nav className="glass-nav flex items-center justify-between px-4 md:px-8 py-3 md:py-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="text-xl md:text-2xl font-bold tracking-tighter text-white">
              PanicDrop
            </div>
          </div>
          
          <div className="hidden md:flex space-x-10 text-sm font-medium text-gray-300">
            <Link to="/" className="hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Home</Link>
            <Link to="#" className="hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Catalog</Link>
            <Link to="#" className="hover:text-white hover:shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all">Track Order</Link>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <Link to="/login">
              <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white rounded-full px-3 md:px-6 text-xs md:text-sm whitespace-nowrap">Sign In</Button>
            </Link>
            <Button className="glass-button border-0 text-xs md:text-sm font-semibold h-8 md:h-10 px-4 md:px-8 whitespace-nowrap">Get Started</Button>
          </div>
        </nav>

        {/* Hero Section */}
        <main className="mx-auto max-w-7xl px-6 py-32 flex flex-col items-center justify-center text-center">
          <div className="inline-block glass rounded-full px-4 py-1.5 mb-8 border-white/20">
            <span className="text-xs font-semibold tracking-wider text-purple-200">At least we don't reschedule your delivery 3 times like some f-karts 📦💨</span>
          </div>
          
          <h1 className="text-7xl md:text-8xl font-extrabold tracking-tight mb-8 leading-tight">
            Delivery at <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              Panic Speed.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl font-light leading-relaxed">
            Order anything. We'll drop it at your door before panic sets in. Premium goods, unbelievable delivery times, all tracked in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 mb-32">
            <Button className="bg-white text-black hover:bg-gray-200 text-lg px-10 py-7 h-auto rounded-full font-semibold shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all hover:scale-105">
              Shop Now
            </Button>
            <Button className="glass-button text-lg px-10 py-7 h-auto">
              Track Package
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl text-left">
            <div className="glass-card">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500/30 to-blue-600/10 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Lightning Fast</h3>
              <p className="text-gray-400 leading-relaxed">Our proprietary logistics network is optimized for unprecedented speed, ensuring your drops happen almost instantly.</p>
            </div>
            
            <div className="glass-card">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Secure Drops</h3>
              <p className="text-gray-400 leading-relaxed">Every package is insured and tracked with millimeter precision in real-time. Your items are safe with PanicDrop.</p>
            </div>
            
            <div className="glass-card">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500/30 to-pink-600/10 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20 shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold mb-3 text-white">Premium Catalog</h3>
              <p className="text-gray-400 leading-relaxed">Access exclusive products curated for high-end quality and aesthetic appeal, delivered without the wait.</p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
