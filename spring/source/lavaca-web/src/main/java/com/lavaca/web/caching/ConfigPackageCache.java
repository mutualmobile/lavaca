package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

public class ConfigPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "cfg:::";

	public ConfigPackageCache(String cacheName) {
		super(cacheName);
	}

	public static ConfigPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(ConfigPackageCache.class);
	}

	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

}
