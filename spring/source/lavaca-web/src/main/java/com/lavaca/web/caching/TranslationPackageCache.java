package com.lavaca.web.caching;

import java.util.Locale;

import javax.servlet.ServletContext;

import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.TranslationPackage;

/**
 * Utility for working with cached Lavaca translations
 */
public class TranslationPackageCache extends Cache<String, CodePackage> {

	private final String CACHEKEY = "i18n:::";
	private String first;

	/**
	 * Constructs a new translation cache abstraction
	 * 
	 * @param cacheName
	 *            The name of the translation cache
	 */
	public TranslationPackageCache(String cacheName) {
		super(cacheName);
	}

	/**
	 * Gets an instance of the translation cache that's associated with the
	 * application
	 * 
	 * @param context
	 *            The servlet context
	 * @return The translation cache bean configured in the root-context.xml
	 */
	public static TranslationPackageCache instance(ServletContext context) {
		return WebApplicationContextUtils.getWebApplicationContext(context)
				.getBean(TranslationPackageCache.class);
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

	/**
	 * Adds a value to the cache
	 * 
	 * @param key
	 *            The key under which to store the value
	 * @param value
	 *            The value to store
	 */
	@Override
	public void put(String key, CodePackage value) {
		if (null == first) {
			first = key;
		}
		super.put(key, value);
	}

	/**
	 * Gets a translated string
	 * 
	 * @param name
	 *            The key under which the string is stored in the translation
	 *            tables
	 * @param locale
	 *            The locale associated with the table from which to get the
	 *            string
	 * @param args
	 *            Values to be substituted into the string
	 * @return The translated string or null if no such string exists
	 */
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
