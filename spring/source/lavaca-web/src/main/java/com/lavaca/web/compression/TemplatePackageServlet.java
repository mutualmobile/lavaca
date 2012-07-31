package com.lavaca.web.compression;

/**
 * Servlet that delivers Lavaca templates
 */
public class TemplatePackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = -2704356220466127265L;

	private static final String CONTENT_TYPE = "text/text";

	/**
	 * Get the MIME type associated with the code package type
	 * 
	 * @return The MIME type
	 */
	@Override
	protected String getContentType() {
		return CONTENT_TYPE;
	}

	/**
	 * Get a code package associated with a key
	 * 
	 * @param key
	 *            The identifier of the code package
	 * @return The code package
	 */
	@Override
	protected CodePackage getCodePackage(String key) {
		try {
			return TemplatePackage.get(this.context, key);
		} catch (Exception e) {
			return null;
		}
	}

}
