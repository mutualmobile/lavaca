package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.TemplatePackageCache;

public class DustTemplatePackage extends TemplatePackage {

	private static final long serialVersionUID = 7342406127317054594L;

	private static final String TYPE = "text/x-dust-template";

	public static DustTemplatePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(DustTemplatePackage.class,
				TemplatePackageCache.instance(context), key);
	}

	public DustTemplatePackage(String key) {
		super(key);
	}

	@Override
	public String getType() {
		return TYPE;
	}

	@Override
	public String render(Object model) throws RuntimeException {
		throw new UnsupportedOperationException();
	}

}
