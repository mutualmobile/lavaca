package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.ConfigPackageCache;

/**
 * Lavaca config file package
 */
public class ConfigPackage extends JSONPackage {

	private static final long serialVersionUID = 8477300422245604132L;

	/**
	 * Retrieves a cached config file package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier for the config file package
	 * @return The cached config file package
	 * @throws IOException
	 */
	public static ConfigPackage get(ServletContext context, String key)
			throws IOException {
		try {
			return CodePackage.get(ConfigPackage.class,
					ConfigPackageCache.instance(context), key);
		} catch (Exception e) {
			throw new IOException(e);
		}
	}

	/**
	 * Constructs a new config package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public ConfigPackage(String key) {
		super(key);
	}
}
