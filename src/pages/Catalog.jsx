import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Button } from '../components/ui/button'

export default function Catalog() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState(null)
  const [activeSubcategory, setActiveSubcategory] = useState(null)
  const [user, setUser] = useState(null)
  
  const navigate = useNavigate()

  useEffect(() => {
    // Check Auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch Categories for Sidebar
    const { data: catData } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('name', { ascending: true })

    if (catData) setCategories(catData)

    // Fetch Products (active only)
    const { data: prodData } = await supabase
      .from('products')
      .select('*, subcategories(name, category_id, categories(name))')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (prodData) setProducts(prodData)
      
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  // Filter products based on selected category/subcategory
  const filteredProducts = products.filter(p => {
    if (activeSubcategory) {
      return p.subcategory_id === activeSubcategory
    }
    if (activeCategory) {
      return p.subcategories?.category_id === activeCategory
    }
    return true
  })

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans flex flex-col">
      {/* Abstract Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 glass-nav flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-md border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-2xl font-bold tracking-tighter">PanicDrop</div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" className="relative group">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            <span className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">0</span>
          </Button>
          {user ? (
            <Button onClick={handleSignOut} variant="ghost" className="text-sm text-red-400 hover:text-red-300">Sign Out</Button>
          ) : (
            <Link to="/login">
              <Button variant="ghost" className="text-sm">Sign In</Button>
            </Link>
          )}
        </div>
      </nav>

      <div className="flex-1 flex max-w-7xl w-full mx-auto relative z-10">
        
        {/* Sidebar Filters */}
        <aside className="w-64 hidden md:block border-r border-white/5 p-6 h-[calc(100vh-73px)] sticky top-[73px] overflow-y-auto custom-scrollbar">
          <h3 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-6">Categories</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => { setActiveCategory(null); setActiveSubcategory(null); }}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!activeCategory && !activeSubcategory ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            >
              All Products
            </button>
            
            {categories.map(category => (
              <div key={category.id} className="space-y-1">
                <button 
                  onClick={() => { setActiveCategory(category.id); setActiveSubcategory(null); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeCategory === category.id && !activeSubcategory ? 'bg-blue-600/20 text-blue-400 font-medium' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                >
                  {category.name}
                </button>
                
                {/* Subcategories */}
                <div className="pl-4 space-y-1">
                  {category.subcategories?.map(sub => (
                    <button 
                      key={sub.id}
                      onClick={() => { setActiveCategory(category.id); setActiveSubcategory(sub.id); }}
                      className={`block w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors ${activeSubcategory === sub.id ? 'text-blue-400 font-medium' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="flex-1 p-6 md:p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold tracking-tight">
              {activeSubcategory 
                ? categories.find(c => c.id === activeCategory)?.subcategories.find(s => s.id === activeSubcategory)?.name 
                : activeCategory 
                  ? categories.find(c => c.id === activeCategory)?.name 
                  : 'All Products'}
            </h1>
            <p className="text-sm text-slate-500 font-medium">{filteredProducts.length} items</p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="group glass-card !p-0 rounded-2xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:-translate-y-1 bg-slate-900/40">
                  {/* Image Container with Hover effect */}
                  <div className="relative aspect-square overflow-hidden bg-slate-800">
                    <img 
                      src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'} 
                      alt={product.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Optional hover secondary image */}
                    {product.images && product.images.length > 1 && (
                      <img 
                        src={product.images[1]} 
                        alt={`${product.name} alternate`} 
                        className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                      />
                    )}
                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider text-slate-300 uppercase border border-white/10">
                      {product.subcategories?.name}
                    </div>
                  </div>
                  
                  {/* Details */}
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h3 className="font-semibold text-lg leading-tight line-clamp-2">{product.name}</h3>
                      <span className="font-bold text-blue-400 whitespace-nowrap">${product.price.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-sm text-slate-400 line-clamp-2 mb-4">{product.description || 'Premium quality product delivered at Panic Speed.'}</p>
                    
                    <Button className="w-full bg-white/5 hover:bg-blue-600 text-white border border-white/10 hover:border-blue-500 transition-colors py-5 rounded-xl flex items-center justify-center gap-2 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                      Add to Cart
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-24 glass-card border border-white/5 rounded-3xl">
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-slate-400">There are currently no products in this category.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
