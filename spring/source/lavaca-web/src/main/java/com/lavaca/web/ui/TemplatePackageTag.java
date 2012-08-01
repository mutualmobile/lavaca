package com.lavaca.web.ui;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.DustTemplatePackage;
import com.lavaca.web.compression.TemplatePackage;
import com.lavaca.web.config.LavacaConfig;

/**
 * Tag for including Lavaca template in a page
 */
public class TemplatePackageTag extends MapPackageTag {

	private static final long serialVersionUID = -7586672408836229431L;

	private static final String REFERENCE_URL = "/min.tmpl?k=%s&d=%s";

	private String type;

	/**
	 * Gets the MIME type of the template
	 * 
	 * @return The MIME type of the template
	 */
	public String getType() {
		return type;
	}

	/**
	 * Sets the MIME type of the template
	 * 
	 * @param type
	 *            The MIME type of the template
	 */
	public void setType(String type) {
		this.type = type;
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
		ServletContext sc = this.pageContext.getServletContext();
		try {
			if ("dust".equals(this.getType())) {
				return DustTemplatePackage.get(sc, key);
			} else {
				return TemplatePackage.get(sc, key);
			}
		} catch (IOException e) {
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
				.getTemplateKeys();
	}

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
		return String.format(REFERENCE_URL, cp.getKey(), cp.getCreated()
				.getTime());
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
		return false;
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
		return ((TemplatePackage) cp).getType();
	}

}