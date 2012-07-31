package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.TranslationPackageCache;

public class TranslationPackage extends JSONPackage {

	private static final long serialVersionUID = 3668436298381886470L;

	public static CodePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(TranslationPackage.class,
				TranslationPackageCache.instance(context), key);
	}

	public TranslationPackage(String key) {
		super(key);
	}

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
