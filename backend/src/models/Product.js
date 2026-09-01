import mongoose from 'mongoose';
import { MemoryProduct } from '../config/store.js';

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, lowercase: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0, default: 0 },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, default: 'General', trim: true },
    brand: { type: String, default: 'PanicDrop', trim: true },
    stock: { type: Number, required: true, min: 0, default: 10 },
    images: [{ type: String, required: true }],
    rating: { type: Number, default: 4.8, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    featured: { type: Boolean, default: false },
    badge: { type: String, default: '' },
    specs: { type: Map, of: String, default: {} },
    tags: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

const MongooseProduct = mongoose.models.Product || mongoose.model('Product', productSchema);

const ProductProxy = new Proxy(MongooseProduct, {
  get(target, prop) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return target[prop];
    }
    return MemoryProduct[prop] !== undefined ? MemoryProduct[prop] : target[prop];
  },
  construct(target, args) {
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      return new target(...args);
    }
    return new MemoryProduct(...args);
  },
});

export default ProductProxy;
