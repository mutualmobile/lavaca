package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

/**
 * Utility for working with cached Lavaca scripts
 */
public class JSPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "js:::";

	/**
	 * Constructs a new JS cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the JS cache
	 */
	public JSPackageCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the JS cache that's associated with the application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The JS cache bean configured in the root-context.xml
	 */
	public static JSPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(JSPackageCache.class);
	}

	/**
	 * Transforms the cache key
	 * 
	 * @param key
	 *            The base cache key
	 * @return The final cache key
	 */
	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

}
