package com.lavaca.web.ui;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

import com.lavaca.web.caching.TranslationPackageCache;

/**
 * JSP tag for exposing a Lavaca-translated string message
 */
public class TranslateTag extends TagSupport {

	private static final long serialVersionUID = -8493794281424991655L;

	private String key;
	private List<String> args;

	/**
	 * Gets the key under which the message is stored
	 * 
	 * @return The key under which the message is stored
	 */
	public String getKey() {
		return key;
	}

	/**
	 * Sets the key under which the message is stored
	 * 
	 * @param key
	 *            The key under which the message is stored
	 */
	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * Gets a list of arguments to substitute into the message
	 * 
	 * @return The arguments
	 */
	public List<String> getArgs() {
		if (null == this.args) {
			this.args = new ArrayList<String>();
		}
		return args;
	}

	/**
	 * Invoked when the JSP processor reaches the start tag
	 */
	@Override
	public int doStartTag() {
		return EVAL_BODY_INCLUDE;
	}

	/**
	 * Invoked when the JSP processor reaches the end tag
	 */
	@Override
	public int doEndTag() throws JspException {
		String output = TranslationPackageCache.instance(
				this.pageContext.getServletContext()).getString(
				this.getKey(),
				((HttpServletRequest) this.pageContext.getRequest())
						.getLocale(), this.getArgs().toArray());
		if (null != output) {
			try {
				this.pageContext.getOut().write(output);
			} catch (IOException e) {
				throw new JspException(e);
			}
		}
		return SKIP_BODY;
	}

}
