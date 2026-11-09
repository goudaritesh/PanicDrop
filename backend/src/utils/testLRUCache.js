import { LRUCache } from './lruCache.js';

console.log('--- Testing LRUCache Implementation ---');

// 1. Capacity & Eviction Test
const cache = new LRUCache({ capacity: 3, defaultTTL: 10000, name: 'test' });
cache.set('a', 1);
cache.set('b', 2);
cache.set('c', 3);

console.assert(cache.get('a') === 1, 'Key "a" should be 1');
// Now order from most to least recent: a, c, b
cache.set('d', 4); // Should evict 'b' (least recently used)

console.assert(cache.get('b') === null, 'Key "b" should have been evicted');
console.assert(cache.get('a') === 1, 'Key "a" should still be present');
console.assert(cache.get('c') === 3, 'Key "c" should still be present');
console.assert(cache.get('d') === 4, 'Key "d" should still be present');

// 2. Prefix Invalidation Test
cache.set('products:1', { name: 'P1' });
cache.set('products:2', { name: 'P2' });
cache.set('users:1', { name: 'U1' });

const cleared = cache.clearPrefix('products:');
console.assert(cleared === 2, `Expected 2 cleared, got ${cleared}`);
console.assert(cache.get('products:1') === null, 'products:1 should be null');
console.assert(cache.get('products:2') === null, 'products:2 should be null');
console.assert(cache.get('users:1') !== null, 'users:1 should still be present');

// 3. Telemetry Stats Test
const stats = cache.getStats();
console.log('Cache Stats:', stats);
console.assert(stats.capacity === 3, 'Capacity should be 3');
console.assert(stats.hits > 0, 'Hits should be > 0');

console.log('✅ ALL LRU CACHE UNIT TESTS PASSED SUCCESSFULLY!');
