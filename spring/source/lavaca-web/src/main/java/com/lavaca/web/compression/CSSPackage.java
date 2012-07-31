package com.lavaca.web.compression;

import java.io.IOException;
import java.io.StringReader;
import java.io.StringWriter;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.CSSPackageCache;
import com.yahoo.platform.yui.compressor.CssCompressor;

public class CSSPackage extends CodePackage {

	private static final long serialVersionUID = -9112696045815304636L;

	public static CodePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(CSSPackage.class,
				CSSPackageCache.instance(context), key);
	}

	public CSSPackage(String key) {
		super(key);
	}

	@Override
	protected String compress(String code) {
		StringReader in = new StringReader(code);
		StringWriter out = new StringWriter(code.length());
		try {
			CssCompressor compressor = new CssCompressor(in);
			compressor.compress(out, -1);
		} catch (IOException e) {
			System.out.println(e.getStackTrace());
		}
		return out.toString();
	}

}
