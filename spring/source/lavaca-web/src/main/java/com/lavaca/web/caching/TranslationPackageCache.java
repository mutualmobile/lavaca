package com.lavaca.web.caching;

import java.util.Locale;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.TranslationPackage;

public class TranslationPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "i18n:::";
	private String first;

	public TranslationPackageCache(String cacheName) {
		super(cacheName);
	}

	public static TranslationPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(TranslationPackageCache.class);
	}

	@Override
	protected String getCacheKey(String key) {
		return CACHEKEY + key;
	}

	@Override
	public void put(String key, CodePackage value) {
		if (null == first) {
			first = key;
		}
		super.put(key, value);
	}

	public String getString(String name, Locale locale, Object... args) {
		TranslationPackage translations = (TranslationPackage) this.get(locale
				.toString());
		if (null == translations) {
			translations = (TranslationPackage) this.get(locale.getLanguage());
		}
		if (null == translations && null != first) {
			translations = (TranslationPackage) this.get(first);
		}
		if (null != translations) {
			return translations.getString(name, args);
		} else {
			return null;
		}
	}

}
