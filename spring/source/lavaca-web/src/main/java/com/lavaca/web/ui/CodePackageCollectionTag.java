package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

public class CodePackageCollectionTag extends TagSupport {

	private static final long serialVersionUID = -4026635860344001278L;

	private String key;
	private boolean compress;
	private boolean inline;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public boolean getCompress() {
		return compress;
	}

	public void setCompress(boolean compress) {
		this.compress = compress;
	}

	public boolean getInline() {
		return inline;
	}

	public void setInline(boolean inline) {
		this.inline = inline;
	}

	public boolean shouldRender(CodePackageTag cpt) {
		return null == this.getKey() || this.getKey().equals(cpt.getKey());
	}

	@Override
	public int doStartTag() throws JspException {
		return EVAL_BODY_INCLUDE;
	}

	@Override
	public int doEndTag() throws JspException {
		return EVAL_PAGE;
	}

}
