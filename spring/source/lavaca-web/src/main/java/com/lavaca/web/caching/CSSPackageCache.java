package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

public class CSSPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "css:::";

	public CSSPackageCache(String cacheName) {
		super(cacheName);
	}

	public static CSSPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(CSSPackageCache.class);
	}

	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

}
