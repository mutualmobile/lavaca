package com.lavaca.web.ui;

import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;

import org.apache.commons.lang3.StringEscapeUtils;

public class Functions {

	public static String escapeJS(final String str) {
		return StringEscapeUtils.escapeEcmaScript(str);
	}

	public static String escapeHTML(final String str) {
		return StringEscapeUtils.escapeHtml4(str);
	}

	public static String escapeURI(final String str)
			throws UnsupportedEncodingException {
		return URLEncoder.encode(str, "UTF-8");
	}

}
