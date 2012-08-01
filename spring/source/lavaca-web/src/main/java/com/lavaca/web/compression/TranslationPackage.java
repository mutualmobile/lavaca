package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.TranslationPackageCache;

/**
 * Lavaca translation file package
 */
public class TranslationPackage extends JSONPackage {

	private static final long serialVersionUID = 3668436298381886470L;

	/**
	 * Retrieves a cached translation file package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier for the translation file package
	 * @return The cached translation file package
	 * @throws IOException
	 */
	public static CodePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(TranslationPackage.class,
				TranslationPackageCache.instance(context), key);
	}

	/**
	 * Constructs a new translation package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public TranslationPackage(String key) {
		super(key);
	}

	/**
	 * Gets a translated string
	 * 
	 * @param name
	 *            The key under which the string is stored in the translation
	 *            tables
	 * @param args
	 *            Values to be substituted into the string
	 * @return The translated string or null if no such string exists
	 */
	public String getString(String name, Object... args) {
		String result = this.getString(name);
		if (null != result) {
			for (int i = 0; i < args.length; i++) {
				result = result.replace(String.format("{%s}", i),
						String.valueOf(args[i]));
			}
		}
		return result;
	}

}
