package com.lavaca.web.caching;

import net.sf.ehcache.CacheManager;
import net.sf.ehcache.Element;

public class Cache<K, V> implements CacheWrapper<K, V> {

	private final String cacheName;
	private final CacheManager cacheManager;
	private boolean isPopulated;

	public Cache(final String cacheName) {
		this.cacheName = cacheName;
		this.cacheManager = CacheManager.getInstance();
	}

	@SuppressWarnings("unchecked")
	public V get(K key) {
		Element element = getCache().get(this.getCacheKey(key));
		if (null != element) {
			return (V) element.getValue();
		} else {
			return null;
		}
	}

	public void put(K key, V value) {
		if (null != value) {
			this.isPopulated = true;
		}
		getCache().put(new Element(this.getCacheKey(key), value));
	}

	private net.sf.ehcache.Cache getCache() {
		return this.cacheManager.getCache(this.cacheName);
	}

	protected K getCacheKey(K key) {
		return key;
	}

	public boolean isPopulated() {
		return this.isPopulated;
	}

}
