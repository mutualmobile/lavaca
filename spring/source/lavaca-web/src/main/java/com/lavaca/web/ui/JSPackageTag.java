package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.JSPackage;
import com.lavaca.web.config.LavacaConfig;

public class JSPackageTag extends CodePackageTag {

	private static final long serialVersionUID = 1641459714851233770L;

	private static final String REFERENCE_ELEMENT = "<script type=\"text/javascript\" src=\"%s\"></script>";
	private static final String INLINE_ELEMENT = "<script type=\"text/javascript\">%s</script>";
	private static final String REFERENCE_URL = "/min.js?k=%s&d=%s";

	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, cp.getKey(), cp.getCreated()
				.getTime());
	}

	@Override
	protected String getReferenceElement(CodePackage cp, String url) {
		return String.format(REFERENCE_ELEMENT, url);
	}

	@Override
	protected String getInlineElement(CodePackage cp, Object code) {
		return String.format(INLINE_ELEMENT, code);
	}

	@Override
	protected CodePackage getCodePackage(String key) throws JspException {
		try {
			return JSPackage.get(this.pageContext.getServletContext(), key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getScriptKeys();
	}

}
