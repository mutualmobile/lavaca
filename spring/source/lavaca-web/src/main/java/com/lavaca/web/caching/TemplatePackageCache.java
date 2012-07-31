package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

/**
 * Utility for working with cached Lavaca templates
 */
public class TemplatePackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "tmpl:::";

	/**
	 * Constructs a new template cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the template cache
	 */
	public TemplatePackageCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the template cache that's associated with the
	 * application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The template cache bean configured in the root-context.xml
	 */
	public static TemplatePackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(TemplatePackageCache.class);
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
