import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Button } from '../ui/button'

export default function CategoriesManager() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [loading, setLoading] = useState(true)

  // Forms state
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategorySlug, setNewCategorySlug] = useState('')
  const [newSubcategoryName, setNewSubcategoryName] = useState('')
  const [newSubcategorySlug, setNewSubcategorySlug] = useState('')
  const [selectedParentCategory, setSelectedParentCategory] = useState('')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    const { data: catData } = await supabase.from('categories').select('*').order('created_at', { ascending: true })
    const { data: subData } = await supabase.from('subcategories').select('*, categories(name)').order('created_at', { ascending: true })
    
    if (catData) setCategories(catData)
    if (subData) setSubcategories(subData)
    setLoading(false)
  }

  const handleAddCategory = async (e) => {
    e.preventDefault()
    if (!newCategoryName || !newCategorySlug) return
    const { error } = await supabase.from('categories').insert([{ name: newCategoryName, slug: newCategorySlug }])
    if (error) alert(error.message)
    else {
      setNewCategoryName('')
      setNewCategorySlug('')
      fetchData()
    }
  }

  const handleAddSubcategory = async (e) => {
    e.preventDefault()
    if (!newSubcategoryName || !newSubcategorySlug || !selectedParentCategory) return
    const { error } = await supabase.from('subcategories').insert([{ name: newSubcategoryName, slug: newSubcategorySlug, category_id: selectedParentCategory }])
    if (error) alert(error.message)
    else {
      setNewSubcategoryName('')
      setNewSubcategorySlug('')
      fetchData()
    }
  }

  const handleDeleteCategory = async (id) => {
    if (confirm('Are you sure? This will delete all subcategories inside it.')) {
      await supabase.from('categories').delete().eq('id', id)
      fetchData()
    }
  }

  const handleDeleteSubcategory = async (id) => {
    if (confirm('Delete this subcategory?')) {
      await supabase.from('subcategories').delete().eq('id', id)
      fetchData()
    }
  }

  if (loading) return <div className="p-8 text-white">Loading categories...</div>

  return (
    <div className="p-8 space-y-8 relative z-10 text-white">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight mb-6">Manage Categories</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Main Categories Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-purple-300">Main Categories</h3>
            
            <form onSubmit={handleAddCategory} className="flex gap-2 mb-6">
              <input 
                type="text" 
                placeholder="Name (e.g. Electronics)" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={newCategoryName}
                onChange={e => setNewCategoryName(e.target.value)}
              />
              <input 
                type="text" 
                placeholder="Slug (e.g. electronics)" 
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                value={newCategorySlug}
                onChange={e => setNewCategorySlug(e.target.value)}
              />
              <Button type="submit" className="bg-purple-600 hover:bg-purple-500">Add</Button>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {categories.map(c => (
                <div key={c.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="font-medium text-sm">{c.name}</p>
                    <p className="text-xs text-slate-400">/{c.slug}</p>
                  </div>
                  <button onClick={() => handleDeleteCategory(c.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              ))}
              {categories.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No categories found.</p>}
            </div>
          </div>

          {/* Subcategories Section */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4 text-blue-300">Subcategories</h3>
            
            <form onSubmit={handleAddSubcategory} className="space-y-3 mb-6">
              <select 
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 [&>option]:bg-slate-900"
                value={selectedParentCategory}
                onChange={e => setSelectedParentCategory(e.target.value)}
              >
                <option value="">Select Parent Category...</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Name (e.g. Mobiles)" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newSubcategoryName}
                  onChange={e => setNewSubcategoryName(e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Slug (e.g. mobiles)" 
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={newSubcategorySlug}
                  onChange={e => setNewSubcategorySlug(e.target.value)}
                />
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500">Add</Button>
              </div>
            </form>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {subcategories.map(s => (
                <div key={s.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  <div>
                    <p className="font-medium text-sm">{s.name}</p>
                    <p className="text-xs text-slate-400">/{s.slug} <span className="text-blue-400 ml-2">in {s.categories?.name}</span></p>
                  </div>
                  <button onClick={() => handleDeleteSubcategory(s.id)} className="text-red-400 hover:text-red-300 text-sm">Delete</button>
                </div>
              ))}
              {subcategories.length === 0 && <p className="text-sm text-slate-500 text-center py-4">No subcategories found.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
