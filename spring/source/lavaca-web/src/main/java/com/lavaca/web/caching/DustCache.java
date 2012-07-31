package com.lavaca.web.caching;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.heydanno.xdust.XDustTemplate;

public class DustCache extends Cache<String, XDustTemplate> {

	private final String CACHEKEY = "dust:::";

	public DustCache(String cacheName) {
		super(cacheName);
	}

	public static DustCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(DustCache.class);
	}

	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

}
