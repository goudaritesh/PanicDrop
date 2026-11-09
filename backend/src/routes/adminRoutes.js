import express from 'express';
import { getAdminStats } from '../controllers/adminController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import { adminStatsCache, productCache, categoryCache } from '../utils/lruCache.js';
import { cacheResponse, invalidateProductCaches } from '../middleware/cacheMiddleware.js';

const router = express.Router();

router.use(protect, adminOnly);

router.get(
  '/stats',
  cacheResponse(adminStatsCache, { ttlMs: 30 * 1000, prefix: 'admin-stats:' }),
  getAdminStats
);

// Admin Cache Management & Telemetry
router.get('/cache/telemetry', (req, res) => {
  res.json({
    success: true,
    telemetry: {
      products: productCache.getStats(),
      categories: categoryCache.getStats(),
      adminStats: adminStatsCache.getStats(),
    },
  });
});

router.post('/cache/purge', (req, res) => {
  const result = invalidateProductCaches();
  res.json({
    success: true,
    message: 'All LRU caches purged successfully',
    invalidations: result,
  });
});

export default router;
