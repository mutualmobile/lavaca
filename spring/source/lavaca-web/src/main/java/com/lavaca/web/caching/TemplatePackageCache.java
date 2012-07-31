package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;

public class TemplatePackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "tmpl:::";

	public TemplatePackageCache(String cacheName) {
		super(cacheName);
	}

	public static TemplatePackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(TemplatePackageCache.class);
	}

	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

}
