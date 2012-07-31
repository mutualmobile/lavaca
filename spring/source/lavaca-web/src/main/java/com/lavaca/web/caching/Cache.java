package com.lavaca.web.caching;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;

/**
 * A typed caching abstraction for ehcache
 * 
 * @param <K>
 *            The type of the cache entry keys
 * @param <V>
 *            The type of the cache entry values
 */
public class Cache<K, V> implements CacheWrapper<K, V> {

	private final String cacheName;
	private final CacheManager cacheManager;
	private boolean isPopulated;

	/**
	 * Creates a new cache
	 * 
	 * @param cacheName
	 *            The name of the configured ehcache
	 */
	public Cache(final String cacheName) {
		this.cacheName = cacheName;
		this.cacheManager = CacheManager.getInstance();
	}

	/**
	 * Retrieves a value from the cache
	 * 
	 * @param key
	 *            The key under which the value is stored
	 * @return The cached value, or null if no value is cached under that key
	 */
	@SuppressWarnings("unchecked")
	public V get(K key) {
		Element element = getCache().get(this.getCacheKey(key));
		if (null != element) {
			return (V) element.getValue();
		} else {
			return null;
		}
	}

	/**
	 * Adds a value to the cache
	 * 
	 * @param key
	 *            The key under which to store the value
	 * @param value
	 *            The value to store
	 */
	public void put(K key, V value) {
		if (null != value) {
			this.isPopulated = true;
		}
		getCache().put(new Element(this.getCacheKey(key), value));
	}

	/**
	 * Retrieve the cache itself
	 * 
	 * @return The ehcache instance used by this abstraction
	 */
	private net.sf.ehcache.Cache getCache() {
		return this.cacheManager.getCache(this.cacheName);
	}

	/**
	 * Transforms the cache key
	 * 
	 * @param key
	 *            The base cache key
	 * @return The final cache key
	 */
	protected K getCacheKey(K key) {
		return key;
	}

	/**
	 * Determines whether or not the cache has entries
	 * 
	 * @return True when the cache has entries
	 */
	public boolean isPopulated() {
		return this.isPopulated;
	}

}
