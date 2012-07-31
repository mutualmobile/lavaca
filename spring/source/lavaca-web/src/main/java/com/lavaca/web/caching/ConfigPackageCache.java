package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

/**
 * Utility for working with cached Lavaca configs
 */
public class ConfigPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "cfg:::";

	/**
	 * Constructs a new config cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the configs cache
	 */
	public ConfigPackageCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the config cache that's associated with the
	 * application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The config cache bean configured in the root-context.xml
	 */
	public static ConfigPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(ConfigPackageCache.class);
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
