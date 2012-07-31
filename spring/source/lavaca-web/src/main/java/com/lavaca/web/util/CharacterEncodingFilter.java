package com.lavaca.web.util;

import java.io.IOException;

import javax.servlet.Filter;
import javax.servlet.FilterChain;
import javax.servlet.FilterConfig;
import javax.servlet.ServletException;
import javax.servlet.ServletRequest;
import javax.servlet.ServletResponse;

public class CharacterEncodingFilter implements Filter {

	private static final String DEFAULT_ENCODING = "UTF-8";

	private String encoding;

	public void destroy() {
		// Do nothing
	}

	public void doFilter(ServletRequest request, ServletResponse response,
			FilterChain next) throws IOException, ServletException {
		if (null == request.getCharacterEncoding()) {
			request.setCharacterEncoding(this.encoding);
		}
		response.setCharacterEncoding(this.encoding);
		next.doFilter(request, response);
	}

	public void init(FilterConfig config) throws ServletException {
		this.encoding = config.getInitParameter("encoding");
		if (null == encoding) {
			this.encoding = DEFAULT_ENCODING;
		}
	}

}
