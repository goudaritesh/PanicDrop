import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

// @desc    Get admin dashboard stats & business KPIs in INR
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const totalProducts = await Product.countDocuments({ isActive: true });
    const totalOrders = await Order.countDocuments();

    // Sales calculation
    const paidOrders = await Order.find({ isPaid: true });
    const totalRevenue = paidOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);

    // Orders status breakdown
    const pendingOrders = await Order.countDocuments({ orderStatus: 'pending' });
    const processingOrders = await Order.countDocuments({ orderStatus: 'processing' });
    const shippedOrders = await Order.countDocuments({ orderStatus: 'shipped' });
    const deliveredOrders = await Order.countDocuments({ orderStatus: 'delivered' });
    const cancelledOrders = await Order.countDocuments({ orderStatus: 'cancelled' });

    // Low stock inventory alerts (stock <= 5)
    const lowStockProducts = await Product.find({ stock: { $lte: 5 }, isActive: true })
      .select('name price stock category images')
      .limit(10);

    // Out of stock count
    const outOfStockCount = await Product.countDocuments({ stock: 0, isActive: true });

    // Recent 5 orders
    const recentOrders = await Order.find()
      .populate('user', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(5);

    // Top selling categories
    const categorySales = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
        },
      },
    ]);

    // Monthly sales simulation in Lakhs of INR
    const monthlySales = [
      { month: 'Jan', sales: 480000, orders: 120 },
      { month: 'Feb', sales: 620000, orders: 154 },
      { month: 'Mar', sales: 790000, orders: 185 },
      { month: 'Apr', sales: 690000, orders: 160 },
      { month: 'May', sales: 980000, orders: 230 },
      { month: 'Jun', sales: 1250000, orders: 310 },
      { month: 'Jul', sales: totalRevenue > 0 ? Math.round(totalRevenue) : 1580000, orders: totalOrders || 380 },
    ];

    res.json({
      success: true,
      currency: 'INR',
      stats: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        totalOrders,
        totalCustomers,
        totalUsers,
        totalProducts,
        outOfStockCount,
        orderStatusCounts: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders,
        },
        lowStockProducts,
        recentOrders,
        categorySales,
        monthlySales,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
