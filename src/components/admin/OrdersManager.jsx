import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function OrdersManager() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrder, setExpandedOrder] = useState(null)
  const [orderItems, setOrderItems] = useState([])
  const [itemsLoading, setItemsLoading] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('orders')
      .select('*, profiles(email, full_name)')
      .order('created_at', { ascending: false })
    
    if (data) setOrders(data)
    setLoading(false)
  }

  const fetchOrderItems = async (orderId) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null)
      return
    }
    
    setExpandedOrder(orderId)
    setItemsLoading(true)
    
    const { data, error } = await supabase
      .from('order_items')
      .select('*, products(name, image_url, barcode)')
      .eq('order_id', orderId)
    
    if (data) setOrderItems(data)
    setItemsLoading(false)
  }

  const updateOrderStatus = async (orderId, newStatus) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId)
      
    if (!error) {
      setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o))
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
      case 'out_for_delivery': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
      case 'delivered': return 'bg-green-500/20 text-green-400 border-green-500/50'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/50'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    }
  }

  return (
    <div className="bg-slate-900/50 rounded-2xl border border-white/5 p-6 backdrop-blur-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Orders Management</h2>
        <button onClick={fetchOrders} className="text-sm text-slate-400 hover:text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Refresh
        </button>
      </div>

      <div className="overflow-x-auto custom-scrollbar rounded-xl border border-white/10">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="text-xs uppercase bg-slate-800/50 text-slate-400">
            <tr>
              <th className="px-6 py-4 rounded-tl-xl">Order ID</th>
              <th className="px-6 py-4">Customer</th>
              <th className="px-6 py-4">Date</th>
              <th className="px-6 py-4">Total</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right rounded-tr-xl">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {orders.length === 0 && !loading && (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-slate-500">
                  No orders found.
                </td>
              </tr>
            )}
            
            {orders.map((order) => (
              <React.Fragment key={order.id}>
                <tr className="hover:bg-white/5 transition-colors group cursor-pointer" onClick={() => fetchOrderItems(order.id)}>
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">
                    {order.id.split('-')[0]}...
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{order.profiles?.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-slate-500">{order.profiles?.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-semibold text-blue-400">
                    ₹{order.total_amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={order.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => updateOrderStatus(order.id, e.target.value)}
                      className={`text-xs font-bold px-2 py-1 rounded-md border appearance-none outline-none cursor-pointer ${getStatusColor(order.status)}`}
                    >
                      <option value="pending" className="bg-slate-900 text-white">Pending</option>
                      <option value="processing" className="bg-slate-900 text-white">Processing</option>
                      <option value="out_for_delivery" className="bg-slate-900 text-white">Out for Delivery</option>
                      <option value="delivered" className="bg-slate-900 text-white">Delivered</option>
                      <option value="cancelled" className="bg-slate-900 text-white">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 group-hover:text-white transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transform transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </td>
                </tr>

                {/* Expanded Details Row */}
                {expandedOrder === order.id && (
                  <tr className="bg-slate-900/80 border-b border-white/5 shadow-inner">
                    <td colSpan="6" className="px-6 py-6">
                      <div className="grid md:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider text-slate-400">Order Items</h4>
                          {itemsLoading ? (
                            <div className="text-sm text-slate-500">Loading items...</div>
                          ) : (
                            <div className="space-y-3">
                              {orderItems.map(item => (
                                <div key={item.id} className="flex items-center gap-3 bg-slate-800/50 p-2 rounded-lg border border-white/5">
                                  <img src={item.products?.image_url} alt={item.products?.name} className="w-10 h-10 rounded object-cover" />
                                  <div className="flex-1">
                                    <div className="text-sm font-medium text-white line-clamp-1">{item.products?.name}</div>
                                    <div className="text-xs text-slate-400">Barcode: {item.products?.barcode}</div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-sm text-white">{item.quantity}x <span className="text-blue-400 font-semibold">₹{item.price_at_time}</span></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider text-slate-400">Shipping Details</h4>
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-white/5 text-sm whitespace-pre-wrap">
                              {order.shipping_address}
                            </div>
                          </div>
                          
                          {order.delivery_instructions && (
                            <div>
                              <h4 className="text-sm font-semibold text-white mb-2 uppercase tracking-wider text-slate-400">Instructions</h4>
                              <div className="bg-yellow-500/10 text-yellow-200/80 p-3 rounded-lg border border-yellow-500/20 text-sm">
                                {order.delivery_instructions}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
