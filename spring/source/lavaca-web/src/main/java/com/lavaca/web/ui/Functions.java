package com.lavaca.web.ui;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringEscapeUtils;

/**
 * JSTL helper functions
 */
public class Functions {

	/**
	 * Escapes a string for inclusion in raw JavaScript string code
	 * 
	 * @param str
	 *            The string to escape
	 * @return The escaped string
	 */
	public static String escapeJS(final String str) {
		return StringEscapeUtils.escapeEcmaScript(str);
	}

	/**
	 * Escapes a string for inclusion in raw HTML code
	 * 
	 * @param str
	 *            The string to escape
	 * @return The escaped string
	 */
	public static String escapeHTML(final String str) {
		return StringEscapeUtils.escapeHtml4(str);
	}

	/**
	 * Escapes a string for inclusion in a raw URL
	 * 
	 * @param str
	 *            The string to escape
	 * @return The escaped string
	 * @throws UnsupportedEncodingException
	 */
	public static String escapeURI(final String str)
			throws UnsupportedEncodingException {
		return URLEncoder.encode(str, "UTF-8");
	}

}
