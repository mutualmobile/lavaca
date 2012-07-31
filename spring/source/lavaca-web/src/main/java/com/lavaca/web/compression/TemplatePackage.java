package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.googlecode.htmlcompressor.compressor.HtmlCompressor;
import com.lavaca.web.caching.TemplatePackageCache;

public abstract class TemplatePackage extends CodePackage {

	private static final long serialVersionUID = 6921940239813607729L;

	public static TemplatePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(TemplatePackage.class,
				TemplatePackageCache.instance(context), key);
	}

	public static String render(ServletContext context, String key, Object model)
			throws RuntimeException, IOException {
		return get(context, key).render(model);
	}

	public TemplatePackage(String key) {
		super(key);
	}

	@Override
	protected String compress(String code) {
		HtmlCompressor compressor = new HtmlCompressor();
		return compressor.compress(code);
	}

	public abstract String getType();

	public abstract String render(Object model) throws RuntimeException;

}
