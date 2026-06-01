class MemCache {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = 3600) {
    this.store.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
      setAt: Date.now(),
    });
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  // Returns stale value even if expired (for "show outdated" banner)
  getStale(key) {
    const entry = this.store.get(key);
    return entry ? entry.value : null;
  }

  isStale(key) {
    const entry = this.store.get(key);
    if (!entry) return true;
    return Date.now() > entry.expiry;
  }

  getAge(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    return Math.floor((Date.now() - entry.setAt) / 1000);
  }

  has(key) {
    return this.get(key) !== null;
  }

  delete(key) {
    this.store.delete(key);
  }

  clear() {
    this.store.clear();
  }
}

module.exports = new MemCache();
