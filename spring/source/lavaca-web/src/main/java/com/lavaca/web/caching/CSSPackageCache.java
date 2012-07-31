package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

/**
 * Utility for working with cached Lavaca stylesheets
 */
public class CSSPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "css:::";

	/**
	 * Constructs a new CSS cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the CSS cache
	 */
	public CSSPackageCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the CSS cache that's associated with the application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The CSS cache bean configured in the root-context.xml
	 */
	public static CSSPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(CSSPackageCache.class);
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
