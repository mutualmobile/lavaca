package com.lavaca.web.ui;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

import com.lavaca.web.caching.TranslationPackageCache;

public class TranslateTag extends TagSupport {

	private static final long serialVersionUID = -8493794281424991655L;

	private String key;
	private List<String> args;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public List<String> getArgs() {
		if (null == this.args) {
			this.args = new ArrayList<String>();
		}
		return args;
	}

	@Override
	public int doStartTag() {
		return EVAL_BODY_INCLUDE;
	}

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
