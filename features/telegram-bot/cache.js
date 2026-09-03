const CACHE_TTL_MS = 60 * 1000;
const cache = new Map();

function buildKey(merchantId, key) {
  return `${merchantId}:${key}`;
}

function get(merchantId, key) {
  const fullKey = buildKey(merchantId, key);
  const entry = cache.get(fullKey);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    cache.delete(fullKey);
    return null;
  }
  return entry.data;
}

function set(merchantId, key, data) {
  const fullKey = buildKey(merchantId, key);
  cache.set(fullKey, { data, expiresAt: Date.now() + CACHE_TTL_MS });
}

function clearForMerchant(merchantId) {
  for (const k of cache.keys()) {
    if (k.startsWith(`${merchantId}:`)) {
      cache.delete(k);
    }
  }
}

module.exports = { get, set, clearForMerchant };