package com.lavaca.web.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.Writer;

import javax.servlet.ServletContext;

public final class FileUtils {

	public static final String UTF8 = "UTF-8";

	public static void read(ServletContext context, String path,
			String encoding, Writer out) throws IOException {
		FileInputStream fis = new FileInputStream(null == context ? path
				: context.getRealPath(path));
		InputStreamReader in = new InputStreamReader(fis,
				encoding == null ? UTF8 : encoding);
		char[] buffer = new char[1024];
		int length;
		while ((length = in.read(buffer)) != -1) {
			out.write(buffer, 0, length);
			buffer = new char[1024];
		}
		in.close();
	}

	public static String read(ServletContext context, String path,
			String encoding) throws IOException {
		StringWriter out = new StringWriter();
		read(context, path, encoding, out);
		return out.toString();
	}

	public static String read(ServletContext context, String path)
			throws IOException {
		return read(context, path, null);
	}

	public static String read(String path, String encoding) throws IOException {
		return read(null, path, encoding);
	}

	public static String read(String path) throws IOException {
		return read(path, null);
	}

}
