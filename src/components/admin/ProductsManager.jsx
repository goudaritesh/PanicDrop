import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '../ui/button'

export default function ProductsManager() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Form State
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [images, setImages] = useState(['']) // Array of image URLs
  const [specifications, setSpecifications] = useState([]) // Array of { key: '', value: '' }
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedSubcategory, setSelectedSubcategory] = useState('')
  const [editingProductId, setEditingProductId] = useState(null)

  const resetForm = () => {
    setName('')
    setDescription('')
    setPrice('')
    setStock('')
    setImages([''])
    setSpecifications([])
    setSelectedCategory('')
    setSelectedSubcategory('')
    setEditingProductId(null)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    
    // Fetch Products
    const { data: prodData } = await supabase
      .from('products')
      .select('*, subcategories(name, categories(name))')
      .order('created_at', { ascending: false })
      
    // Fetch Categories with their nested Subcategories
    const { data: catData } = await supabase
      .from('categories')
      .select('*, subcategories(*)')
      .order('name', { ascending: true })

    if (prodData) setProducts(prodData)
    if (catData) setCategories(catData)
      
    setLoading(false)
  }

  const handleAddProduct = async (e) => {
    e.preventDefault()
    if (!name || !price || !selectedSubcategory) {
      alert("Please fill in the required fields (Name, Price, Subcategory)")
      return
    }

    const validImages = images.filter(url => url.trim() !== '')
    
    // Convert specifications array to JSON object
    const specsObj = specifications.reduce((acc, curr) => {
      if (curr.key.trim() && curr.value.trim()) {
        acc[curr.key.trim()] = curr.value.trim()
      }
      return acc
    }, {})

    if (editingProductId) {
      const { error } = await supabase.from('products').update({
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 0,
        image_url: validImages.length > 0 ? validImages[0] : null,
        images: validImages,
        specifications: specsObj,
        subcategory_id: selectedSubcategory
      }).eq('id', editingProductId)

      if (error) {
        alert("Error updating product: " + error.message)
      } else {
        resetForm()
        fetchData()
      }
    } else {
      // Auto-generate barcode (e.g. PD-123456789)
      const generatedBarcode = 'PD-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0')

      const { error } = await supabase.from('products').insert([{
        name,
        description,
        price: parseFloat(price),
        stock_quantity: parseInt(stock) || 0,
        barcode: generatedBarcode,
        image_url: validImages.length > 0 ? validImages[0] : null,
        images: validImages,
        specifications: specsObj,
        subcategory_id: selectedSubcategory
      }])

      if (error) {
        alert("Error adding product: " + error.message)
      } else {
        resetForm()
        fetchData()
      }
    }
  }

  const handleEditProduct = (p) => {
    setEditingProductId(p.id)
    setName(p.name)
    setDescription(p.description || '')
    setPrice(p.price.toString())
    setStock(p.stock_quantity.toString())
    setImages(p.images && p.images.length > 0 ? p.images : [''])
    
    const specsArray = []
    if (p.specifications) {
      for (const [key, value] of Object.entries(p.specifications)) {
        specsArray.push({ key, value })
      }
    }
    setSpecifications(specsArray)
    setSelectedCategory(p.subcategories?.category_id || '')
    setSelectedSubcategory(p.subcategory_id || '')
  }

  const handleAddImageField = () => {
    setImages([...images, ''])
  }

  const handleImageChange = (index, value) => {
    const newImages = [...images]
    newImages[index] = value
    setImages(newImages)
  }

  const handleRemoveImageField = (index) => {
    if (images.length === 1) {
      setImages([''])
      return
    }
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  const handleAddSpec = () => setSpecifications([...specifications, { key: '', value: '' }])
  
  const handleSpecChange = (index, field, val) => {
    const newSpecs = [...specifications]
    newSpecs[index][field] = val
    setSpecifications(newSpecs)
  }

  const handleRemoveSpec = (index) => {
    const newSpecs = specifications.filter((_, i) => i !== index)
    setSpecifications(newSpecs)
  }

  const handleDeleteProduct = async (id) => {
    if (confirm("Delete this product?")) {
      await supabase.from('products').delete().eq('id', id)
      fetchData()
    }
  }

  // Get subcategories for the currently selected category
  const activeSubcategories = categories.find(c => c.id === selectedCategory)?.subcategories || []

  if (loading) return <div className="p-8 text-white">Loading products...</div>

  return (
    <div className="p-8 space-y-8 relative z-10 text-white">
      <h2 className="text-2xl font-semibold tracking-tight mb-6">Manage Products</h2>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Add Product Form */}
        <div className="xl:col-span-1 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm h-fit">
          <h3 className="text-lg font-semibold mb-6 text-blue-300">
            {editingProductId ? 'Edit Product' : 'Register New Product'}
          </h3>
          
          <form onSubmit={handleAddProduct} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Product Name *</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Price (₹) *</label>
                <input type="number" step="0.01" required value={price} onChange={e => setPrice(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Stock</label>
                <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">External Image URLs (For Carousel)</label>
              <div className="space-y-3">
                {images.map((img, index) => (
                  <div key={index} className="flex gap-2">
                    <input 
                      type="url" 
                      value={img} 
                      onChange={e => handleImageChange(index, e.target.value)} 
                      placeholder={`Image URL ${index + 1}`} 
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" 
                    />
                    <button type="button" onClick={() => handleRemoveImageField(index)} className="px-3 py-2 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20 hover:bg-red-500/20">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
                <button type="button" onClick={handleAddImageField} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Add another image
                </button>
              </div>

              {/* Image Previews */}
              {images.some(url => url.trim() !== '') && (
                <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                  {images.filter(url => url.trim() !== '').map((url, i) => (
                    <div key={i} className="h-16 w-16 flex-shrink-0 rounded-lg overflow-hidden border border-slate-700 relative group">
                      <img src={url} alt={`Preview ${i}`} className="h-full w-full object-cover" onError={(e) => e.target.src = 'https://via.placeholder.com/150?text=Error'} />
                      <div className="absolute top-0 left-0 text-[10px] bg-black/60 text-white px-1">{i + 1}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-800">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Category *</label>
                <select 
                  required
                  value={selectedCategory} 
                  onChange={e => {
                    setSelectedCategory(e.target.value)
                    setSelectedSubcategory('') // Reset subcategory when category changes
                  }} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 [&>option]:bg-slate-900"
                >
                  <option value="">Select...</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Subcategory *</label>
                <select 
                  required
                  disabled={!selectedCategory}
                  value={selectedSubcategory} 
                  onChange={e => setSelectedSubcategory(e.target.value)} 
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 [&>option]:bg-slate-900 disabled:opacity-50"
                >
                  <option value="">Select...</option>
                  {activeSubcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <label className="block text-xs font-medium text-slate-400 mb-1">Description</label>
              <textarea rows="3" value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"></textarea>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className={`flex-1 ${editingProductId ? 'bg-amber-600 hover:bg-amber-500' : 'bg-blue-600 hover:bg-blue-500'}`}>
                {editingProductId ? 'Update Product' : 'Register Product'}
              </Button>
              {editingProductId && (
                <Button type="button" onClick={resetForm} variant="ghost" className="text-slate-400 hover:text-white border border-slate-700">
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Products List */}
        <div className="xl:col-span-2 bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold mb-6">Active Inventory</h3>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-400 uppercase bg-slate-800/50 border-b border-slate-700">
                <tr>
                  <th className="px-4 py-3 rounded-tl-lg">Product</th>
                  <th className="px-4 py-3">Barcode</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Stock</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 rounded-tr-lg">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.name} className="w-10 h-10 rounded bg-slate-800 object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-500 border border-slate-700">No Img</div>
                      )}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        {p.is_active ? <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">Active</span> : <span className="text-[10px] text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full">Inactive</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.barcode || 'N/A'}</td>
                    <td className="px-4 py-3">₹{p.price.toFixed(2)}</td>
                    <td className="px-4 py-3">{p.stock_quantity}</td>
                    <td className="px-4 py-3 text-slate-400">
                      {p.subcategories?.categories?.name} <span className="text-slate-600">&gt;</span> {p.subcategories?.name}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-2">
                      <button onClick={() => handleEditProduct(p)} className="text-blue-400 hover:text-blue-300 transition-colors">Edit</button>
                      <span className="text-slate-700">|</span>
                      <button onClick={() => handleDeleteProduct(p.id)} className="text-red-400 hover:text-red-300 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-slate-500">No products found. Register one to get started!</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
