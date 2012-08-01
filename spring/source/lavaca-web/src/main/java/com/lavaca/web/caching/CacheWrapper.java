package com.lavaca.web.caching;

/**
 * An interface describing a cache abstraction
 * 
 * @param <K>
 *            The type of the cache entry keys
 * @param <V>
 *            The type of the cache entry values
 */
public interface CacheWrapper<K, V> {

	/**
	 * Retrieves a value from the cache
	 * 
	 * @param key
	 *            The key under which the value is stored
	 * @return The cached value
	 */
	V get(K key);

	/**
	 * Adds a value to the cache
	 * 
	 * @param key
	 *            The key under which to store the value
	 * @param value
	 *            The value to store
	 */
	void put(K key, V value);

}
