package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.ConfigPackage;
import com.lavaca.web.config.LavacaConfig;

/**
 * Tag for including Lavaca config in a page
 */
public class ConfigPackageTag extends MapPackageTag {

	private static final long serialVersionUID = 3691332965285051152L;

	private static final String REFERENCE_URL = "/min.conf?k=%s&d=%s";
	private static final String TYPE = "text/x-config";

	/**
	 * Determines the URL needed to reference a code package
	 * 
	 * @param cp
	 *            The code package tor eference
	 * @return The URL used to access the code package
	 * @throws JspException
	 */
	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, this.getKey(), cp.getCreated()
				.getTime());
	}

	/**
	 * Gets the MIME type of a code package
	 * 
	 * @param cp
	 *            The code package
	 * @return The MIME type of that package
	 */
	@Override
	protected String getMimeType(CodePackage cp) {
		return TYPE;
	}

	/**
	 * Determines whether or not a package is the default one of its type
	 * 
	 * @param cp
	 *            The code package to check
	 * @return True if the package is default
	 */
	@Override
	public boolean isDefault(CodePackage cp) {
		return cp.getKey().equals(System.getProperty("target"));
	}

	/**
	 * Retrieves a code package, given its key
	 * 
	 * @param key
	 *            The identifier of the code package
	 * @return The code package
	 * @throws JspException
	 */
	@Override
	protected CodePackage getCodePackage(String key) throws JspException {
		try {
			return ConfigPackage.get(this.pageContext.getServletContext(), key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	/**
	 * Retrieves all keys associated with a code package
	 * 
	 * @return The keys included within that package
	 */
	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getConfigKeys();
	}

	/**
	 * Determines whether or not a code package should be rendered
	 * 
	 * @param cp
	 *            The code package
	 * @return True when the code package should be rendered
	 */
	@Override
	protected boolean shouldRender(CodePackage cp) {
		return this.isDefault(cp);
	}

}
