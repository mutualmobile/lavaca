package com.lavaca.web.util;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.io.Writer;

import javax.servlet.ServletContext;

/**
 * Utility for working with files
 */
public final class FileUtils {

	/**
	 * UTF-8 encoding type string
	 */
	public static final String UTF8 = "UTF-8";

	/**
	 * Reads a file to a buffer
	 * 
	 * @param context
	 *            The current servlet context
	 * @param path
	 *            The path to the file
	 * @param encoding
	 *            The encoding type of the type
	 * @param out
	 *            The buffer to which to write the file's data
	 * @throws IOException
	 */
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

	/**
	 * Reads a file to a string
	 * 
	 * @param context
	 *            The current servlet context
	 * @param path
	 *            The path to the file
	 * @param encoding
	 *            The encoding type of the type
	 * @throws IOException
	 */
	public static String read(ServletContext context, String path,
			String encoding) throws IOException {
		StringWriter out = new StringWriter();
		read(context, path, encoding, out);
		return out.toString();
	}

	/**
	 * Reads a file to a string
	 * 
	 * @param context
	 *            The current servlet context
	 * @param path
	 *            The path to the file
	 * @throws IOException
	 */
	public static String read(ServletContext context, String path)
			throws IOException {
		return read(context, path, null);
	}

	/**
	 * Reads a file to a string
	 * 
	 * @param path
	 *            The path to the file
	 * @param encoding
	 *            The encoding type of the type
	 * @throws IOException
	 */
	public static String read(String path, String encoding) throws IOException {
		return read(null, path, encoding);
	}

	/**
	 * Reads a file to a string
	 * 
	 * @param path
	 *            The path to the file
	 * @throws IOException
	 */
	public static String read(String path) throws IOException {
		return read(path, null);
	}

}
