package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

public class TranslateArgTag extends TagSupport {

	private static final long serialVersionUID = 3885360281033262945L;

	private String value;

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}

	@Override
	public int doStartTag() throws JspException {
		TranslateTag parent = (TranslateTag) this.getParent();
		parent.getArgs().add(this.getValue());
		return SKIP_BODY;
	}

}
