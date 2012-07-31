package com.lavaca.web.compression;

/**
 * Servlet that delivers Lavaca configs
 */
public class ConfigPackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = 8576436237572952201L;

	private static final String CONTENT_TYPE = "application/json";

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
			return ConfigPackage.get(this.context, key);
		} catch (Exception e) {
			return null;
		}
	}

}
