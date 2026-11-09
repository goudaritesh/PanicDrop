import express from 'express';
import {
  getProducts,
  getProductById,
  createProductReview,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategorySummary,
} from '../controllers/productController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { productCache, categoryCache } from '../utils/lruCache.js';
import { cacheResponse, invalidateProductCaches } from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Invalidation middleware for mutation routes
const handleProductInvalidation = (req, res, next) => {
  res.on('finish', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      invalidateProductCaches();
    }
  });
  next();
};

router.route('/')
  .get(cacheResponse(productCache, { ttlMs: 60 * 1000, prefix: 'products:' }), getProducts)
  .post(protect, adminOnly, handleProductInvalidation, createProduct);

router.get(
  '/categories/all',
  cacheResponse(categoryCache, { ttlMs: 5 * 60 * 1000, prefix: 'categories:' }),
  getCategorySummary
);

router.route('/:id')
  .get(cacheResponse(productCache, { ttlMs: 2 * 60 * 1000, prefix: 'product-item:' }), getProductById)
  .put(protect, adminOnly, handleProductInvalidation, updateProduct)
  .delete(protect, adminOnly, handleProductInvalidation, deleteProduct);

router.post('/:id/reviews', protect, handleProductInvalidation, createProductReview);

export default router;
