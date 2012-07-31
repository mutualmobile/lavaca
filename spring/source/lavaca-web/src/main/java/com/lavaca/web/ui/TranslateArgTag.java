package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

/**
 * JSP tag for supplying arguments to a translation string
 */
public class TranslateArgTag extends TagSupport {

	private static final long serialVersionUID = 3885360281033262945L;

	private String value;

	/**
	 * Gets the value of the argument
	 * 
	 * @return The value of the argument
	 */
	public String getValue() {
		return value;
	}

	/**
	 * Sets the value of the argument
	 * 
	 * @param value
	 *            The value of the argument
	 */
	public void setValue(String value) {
		this.value = value;
	}

	/**
	 * Invoked when the JSP processor reaches the start tag
	 */
	@Override
	public int doStartTag() throws JspException {
		TranslateTag parent = (TranslateTag) this.getParent();
		parent.getArgs().add(this.getValue());
		return SKIP_BODY;
	}

}
