package com.lavaca.web.compression;

import java.io.IOException;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Locale;
import java.util.TimeZone;

import javax.servlet.ServletConfig;
import javax.servlet.ServletContext;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Base type for servlets that deliver Lavaca code files
 */
public abstract class CodePackageServlet extends HttpServlet {

	private static final long serialVersionUID = 2455598676706133913L;

	private static final String HTTP_DATE = "EEE, dd MMM yyyy HH:mm:ss z";
	private static final String HEADER_IF_MOD_SINCE = "If-Modified-Since";
	private static final String HEADER_LAST_MOD = "Last-Modified";
	private static final String HEADER_ACCEPT_ENCODING = "Accept-Encoding";
	private static final String HEADER_EXPIRES = "Expires";
	private static final String HEADER_CONTENT_ENCODING = "Content-Encoding";
	private static final String HEADER_CACHE_CONTROL = "Cache-Control";
	private static final String CACHE_AGE = "max-age=31536000";
	private static final String ENCODING_GZIP = "gzip";
	private static final String PARAMETER_KEY = "k";
	private static final String TZ_GMT = "GMT";

	/**
	 * Get the MIME type associated with the code package type
	 * 
	 * @return The MIME type
	 */
	protected abstract String getContentType();

	/**
	 * Get a code package associated with a key
	 * 
	 * @param key
	 *            The identifier of the code package
	 * @return The code package
	 */
	protected abstract CodePackage getCodePackage(String key);

	/**
	 * Prepares an error
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param errorCode
	 *            The error code
	 * @throws IOException
	 */
	protected void sendError(HttpServletRequest request,
			HttpServletResponse response, int errorCode) throws IOException {
		request.setAttribute("originatingURL", request.getPathInfo());
		response.setStatus(errorCode);
	}

	/**
	 * The current servlet context
	 */
	protected ServletContext context;

	/**
	 * Initializes the servlet
	 * 
	 * @param config
	 *            The servlet configuration
	 */
	@Override
	public void init(ServletConfig config) {
		this.context = config.getServletContext();
	}

	/**
	 * Handles a GET request to the servlet for a specific code package.
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 */
	@Override
	protected void doGet(HttpServletRequest request,
			HttpServletResponse response) throws ServletException, IOException {
		String key = request.getParameter(PARAMETER_KEY);
		if (null == key) {
			this.sendError(request, response, 404);
		} else {
			CodePackage codePackage = this.getCodePackage(key);
			if (null == codePackage) {
				this.sendError(request, response, 404);
			} else {
				SimpleDateFormat sdf = new SimpleDateFormat(HTTP_DATE,
						Locale.US);
				sdf.setTimeZone(TimeZone.getTimeZone(TZ_GMT));
				String ifModSinceHeader = request
						.getHeader(HEADER_IF_MOD_SINCE);
				Long ifModSince = 0L;
				if (null != ifModSinceHeader) {
					try {
						ifModSince = sdf.parse(ifModSinceHeader).getTime();
					} catch (ParseException e) {
						// Do nothing
					}
				}
				if (null != codePackage.getLastCompressed()
						&& ifModSince >= codePackage.getLastCompressed()
								.getTime() % 1000) {
					response.setStatus(304);
				} else {
					String encodings = request
							.getHeader(HEADER_ACCEPT_ENCODING);
					boolean gzipped = encodings.contains(ENCODING_GZIP);
					Object responseData = codePackage.getOutput(this.context,
							gzipped);
					response.setStatus(200);
					response.setContentType(this.getContentType());
					response.setHeader(HEADER_LAST_MOD,
							sdf.format(codePackage.getLastCompressed()));
					response.setHeader(HEADER_EXPIRES,
							sdf.format(codePackage.getExpires()));
					response.setHeader(HEADER_CACHE_CONTROL, CACHE_AGE);
					if (gzipped) {
						response.setHeader(HEADER_CONTENT_ENCODING,
								ENCODING_GZIP);
						response.getOutputStream().write((byte[]) responseData);
					} else {
						response.getWriter().write((String) responseData);
					}
				}
			}
		}
	}

}