/**
 * PanicDrop High-Performance LRU (Least Recently Used) Cache
 *
 * Implemented using a Doubly Linked List + Hash Map to guarantee O(1) time
 * complexity for get, set, and eviction operations.
 *
 * Features:
 * - O(1) get, set, delete, and eviction
 * - Automatic Time-To-Live (TTL) expiration per item
 * - Bounded memory footprint with configurable maximum capacity
 * - Namespace / Prefix-based invalidation (e.g. clearPrefix('products:'))
 * - Real-time telemetry: hits, misses, evictions, hit-rate percentage
 */

class CacheNode {
  constructor(key, value, expiresAt) {
    this.key = key;
    this.value = value;
    this.expiresAt = expiresAt;
    this.prev = null;
    this.next = null;
  }
}

export class LRUCache {
  /**
   * @param {Object} options
   * @param {number} [options.capacity=1000] - Maximum number of items before LRU eviction
   * @param {number} [options.defaultTTL=60000] - Default TTL in milliseconds (default: 60s)
   * @param {string} [options.name='default'] - Identifier for logging and telemetry
   */
  constructor({ capacity = 1000, defaultTTL = 60000, name = 'default' } = {}) {
    this.capacity = Math.max(1, capacity);
    this.defaultTTL = defaultTTL;
    this.name = name;

    this.cache = new Map();

    // Sentinel dummy nodes to eliminate edge-case branching
    this.head = new CacheNode(null, null, null);
    this.tail = new CacheNode(null, null, null);
    this.head.next = this.tail;
    this.tail.prev = this.head;

    // Telemetry metrics
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.sets = 0;
  }

  // --- Doubly Linked List O(1) Primitives ---

  _addNode(node) {
    node.prev = this.head;
    node.next = this.head.next;
    this.head.next.prev = node;
    this.head.next = node;
  }

  _removeNode(node) {
    const prev = node.prev;
    const next = node.next;
    prev.next = next;
    next.prev = prev;
    node.prev = null;
    node.next = null;
  }

  _moveToHead(node) {
    this._removeNode(node);
    this._addNode(node);
  }

  _popTail() {
    const lastNode = this.tail.prev;
    if (lastNode === this.head) return null;
    this._removeNode(lastNode);
    return lastNode;
  }

  // --- Public Cache API ---

  /**
   * Retrieve an item from the cache.
   * If found and not expired, moves the item to the head (most recently used).
   * @param {string} key
   * @returns {*|null}
   */
  get(key) {
    const node = this.cache.get(key);
    if (!node) {
      this.misses++;
      return null;
    }

    // Check expiration
    if (node.expiresAt && Date.now() > node.expiresAt) {
      this._removeNode(node);
      this.cache.delete(key);
      this.misses++;
      return null;
    }

    // Refresh LRU position
    this._moveToHead(node);
    this.hits++;
    return node.value;
  }

  /**
   * Insert or update an item in the cache.
   * If capacity is exceeded, evicts the least recently used item (tail).
   * @param {string} key
   * @param {*} value
   * @param {number} [ttlMs] - Optional custom TTL for this key
   */
  set(key, value, ttlMs) {
    const ttl = ttlMs !== undefined ? ttlMs : this.defaultTTL;
    const expiresAt = ttl > 0 ? Date.now() + ttl : null;

    const existingNode = this.cache.get(key);
    if (existingNode) {
      existingNode.value = value;
      existingNode.expiresAt = expiresAt;
      this._moveToHead(existingNode);
      this.sets++;
      return;
    }

    const newNode = new CacheNode(key, value, expiresAt);
    this.cache.set(key, newNode);
    this._addNode(newNode);
    this.sets++;

    // Evict oldest if capacity exceeded
    if (this.cache.size > this.capacity) {
      const evicted = this._popTail();
      if (evicted) {
        this.cache.delete(evicted.key);
        this.evictions++;
      }
    }
  }

  /**
   * Check if a valid, non-expired key exists in cache.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    const node = this.cache.get(key);
    if (!node) return false;
    if (node.expiresAt && Date.now() > node.expiresAt) {
      this._removeNode(node);
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  /**
   * Delete a specific key from the cache.
   * @param {string} key
   * @returns {boolean}
   */
  del(key) {
    const node = this.cache.get(key);
    if (!node) return false;
    this._removeNode(node);
    this.cache.delete(key);
    return true;
  }

  /**
   * Delete all keys starting with a specific prefix.
   * Useful for invalidating related queries (e.g. 'products:').
   * @param {string} prefix
   * @returns {number} count of invalidated keys
   */
  clearPrefix(prefix) {
    let count = 0;
    for (const [key, node] of this.cache.entries()) {
      if (key.startsWith(prefix)) {
        this._removeNode(node);
        this.cache.delete(key);
        count++;
      }
    }
    return count;
  }

  /**
   * Clear the entire cache.
   */
  clear() {
    this.cache.clear();
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  /**
   * Return size and hit-rate telemetry statistics.
   * @returns {Object}
   */
  getStats() {
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? ((this.hits / totalRequests) * 100).toFixed(1) + '%' : '0.0%';

    return {
      name: this.name,
      size: this.cache.size,
      capacity: this.capacity,
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      sets: this.sets,
      hitRate,
    };
  }
}

// Global Specialized Cache Instances
export const productCache = new LRUCache({
  name: 'products',
  capacity: 1000,
  defaultTTL: 60 * 1000, // 60 seconds
});

export const categoryCache = new LRUCache({
  name: 'categories',
  capacity: 100,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
});

export const adminStatsCache = new LRUCache({
  name: 'admin-stats',
  capacity: 50,
  defaultTTL: 30 * 1000, // 30 seconds
});
