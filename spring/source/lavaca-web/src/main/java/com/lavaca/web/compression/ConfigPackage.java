package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.ConfigPackageCache;

public class ConfigPackage extends JSONPackage {

	private static final long serialVersionUID = 8477300422245604132L;

	public static ConfigPackage get(ServletContext context, String key)
			throws IOException {
		try {
			return CodePackage.get(ConfigPackage.class,
					ConfigPackageCache.instance(context), key);
		} catch (Exception e) {
			throw new IOException(e);
		}
	}

	public ConfigPackage(String key) {
		super(key);
	}
}
