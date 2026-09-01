import mongoose from 'mongoose';
import { MemoryOrder } from '../config/store.js';

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderItems: [orderItemSchema],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true, default: 'USA' },
      phone: { type: String, required: true },
    },
    paymentMethod: { type: String, required: true, default: 'Credit Card' },
    itemsPrice: { type: Number, required: true, default: 0.0 },
    taxPrice: { type: Number, required: true, default: 0.0 },
    shippingPrice: { type: Number, required: true, default: 0.0 },
    totalAmount: { type: Number, required: true, default: 0.0 },
    isPaid: { type: Boolean, required: true, default: true },
    paidAt: { type: Date, default: Date.now },
    orderStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'processing' },
    trackingNumber: { type: String, default: () => 'TRK-' + Math.random().toString(36).substring(2, 9).toUpperCase() },
    deliveredAt: { type: Date },
  },
  { timestamps: true }
);

const MongooseOrder = mongoose.models.Order || mongoose.model('Order', orderSchema);

const OrderProxy = new Proxy(MongooseOrder, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryOrder[prop] !== undefined ? MemoryOrder[prop] : target[prop];
  },
  construct(target, args) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    return new MemoryOrder(...args);
  },
});

export default OrderProxy;
