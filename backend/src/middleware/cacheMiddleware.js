import { productCache, categoryCache, adminStatsCache } from '../utils/lruCache.js';

/**
 * Normalizes an Express request URL into a deterministic, canonical cache key.
 * Sorts query parameters alphabetically so '?limit=24&page=1' and '?page=1&limit=24'
 * hit the identical cache entry.
 */
export const generateCacheKey = (req, prefix = '') => {
  const urlPath = req.baseUrl ? `${req.baseUrl}${req.path}` : req.path;
  const queryKeys = Object.keys(req.query).sort();
  
  if (queryKeys.length === 0) {
    return `${prefix}${urlPath}`;
  }

  const sortedQuery = queryKeys
    .filter((k) => k !== 'nocache')
    .map((k) => `${k}=${req.query[k]}`)
    .join('&');

  return `${prefix}${urlPath}?${sortedQuery}`;
};

/**
 * High-performance Express response caching middleware backed by LRU Cache.
 *
 * @param {import('../utils/lruCache.js').LRUCache} cacheInstance - LRUCache instance to use
 * @param {Object} [options]
 * @param {number} [options.ttlMs] - Custom TTL in milliseconds
 * @param {string} [options.prefix=''] - Prefix for cache keys
 */
export const cacheResponse = (cacheInstance, options = {}) => {
  const { ttlMs, prefix = '' } = options;

  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Allow cache bypass via header or query parameter
    if (
      req.headers['cache-control'] === 'no-cache' ||
      req.query.nocache === 'true' ||
      req.query.nocache === '1'
    ) {
      res.setHeader('X-Cache', 'BYPASS');
      return next();
    }

    const key = generateCacheKey(req, prefix);
    const start = process.hrtime();

    const cachedData = cacheInstance.get(key);

    if (cachedData !== null) {
      const diff = process.hrtime(start);
      const timeMs = (diff[0] * 1000 + diff[1] / 1e6).toFixed(2);

      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-Lookup-Time', `${timeMs}ms`);
      res.setHeader('X-Cache-Key', key);
      return res.json(cachedData);
    }

    // Cache MISS: intercept res.json to store the response
    res.setHeader('X-Cache', 'MISS');
    const originalJson = res.json.bind(res);

    res.json = (body) => {
      // Only cache successful 2xx responses
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cacheInstance.set(key, body, ttlMs);
      }
      return originalJson(body);
    };

    next();
  };
};

/**
 * Cache invalidation helper. Purges relevant cache prefixes whenever data changes.
 */
export const invalidateProductCaches = () => {
  const productsCleared = productCache.clearPrefix('');
  const categoriesCleared = categoryCache.clearPrefix('');
  const statsCleared = adminStatsCache.clearPrefix('');
  return { productsCleared, categoriesCleared, statsCleared };
};

export const invalidateOrderCaches = () => {
  const statsCleared = adminStatsCache.clearPrefix('');
  const productsCleared = productCache.clearPrefix('');
  return { statsCleared, productsCleared };
};
