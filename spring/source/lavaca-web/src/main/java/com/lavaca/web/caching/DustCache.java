package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.heydanno.xdust.XDustTemplate;

/**
 * Utility for working with cached dust templates
 */
public class DustCache extends Cache<String, XDustTemplate> {

	private final String CACHEKEY = "dust:::";

	/**
	 * Constructs a new dust cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the dust cache
	 */
	public DustCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the dust cache that's associated with the application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The dust cache bean configured in the root-context.xml
	 */
	public static DustCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(DustCache.class);
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
