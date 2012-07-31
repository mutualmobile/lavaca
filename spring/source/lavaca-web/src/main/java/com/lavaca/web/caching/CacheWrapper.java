package com.lavaca.web.caching;

public interface CacheWrapper<K, V> {

	V get(K key);

	void put(K key, V value);

}
