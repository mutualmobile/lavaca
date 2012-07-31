package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

/**
 * Base type for Lavaca code package collection tag
 */
public class CodePackageCollectionTag extends TagSupport {

	private static final long serialVersionUID = -4026635860344001278L;

	/**
	 * The unique identifier for the code package
	 */
	protected String key;
	/**
	 * Whether or not the code should be rendered directly into the parent page
	 */
	protected boolean inline;
	/**
	 * Whether or not the code should be compacted
	 */
	protected boolean compress;

	/**
	 * Gets the unique identifier for this code package
	 * 
	 * @return The key
	 */
	public String getKey() {
		return this.key;
	}

	/**
	 * Sets the unique identifier for this code package
	 * 
	 * @param key
	 *            The key
	 */
	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * Gets whether or not the code package should be rendered inline
	 * 
	 * @return True when the code package should be rendered inline
	 */
	public boolean getInline() {
		return this.inline;
	}

	/**
	 * Sets whether or not the code package should be rendered inline
	 * 
	 * @param inline
	 *            Whether or not the code package should be rendered inline
	 */
	public void setInline(boolean inline) {
		this.inline = inline;
	}

	/**
	 * Gets whether or not the code should be compacted
	 * 
	 * @return True when the code should be compacted
	 */
	public boolean getCompress() {
		return this.compress;
	}

	/**
	 * Sets whether or not the code should be compacted
	 * 
	 * @param compress
	 *            Whether or not the code should be compacted
	 */
	public void setCompress(boolean compress) {
		this.compress = compress;
	}

	/**
	 * Determines whether or not a code package should be rendered
	 * 
	 * @param cp
	 *            The code package
	 * @return True when the code package should be rendered
	 */
	public boolean shouldRender(CodePackageTag cpt) {
		return null == this.getKey() || this.getKey().equals(cpt.getKey());
	}

	/**
	 * Invoked when the JSP processor reaches the start tag
	 */
	@Override
	public int doStartTag() throws JspException {
		return EVAL_BODY_INCLUDE;
	}

	/**
	 * Invoked when the JSP processor reaches the end tag
	 */
	@Override
	public int doEndTag() throws JspException {
		return EVAL_PAGE;
	}

}
