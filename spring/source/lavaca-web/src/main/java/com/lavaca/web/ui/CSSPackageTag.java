package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CSSPackage;
import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.config.LavacaConfig;

public class CSSPackageTag extends CodePackageTag {

	private static final long serialVersionUID = -1987410030587083232L;

	private static final String REFERENCE_ELEMENT = "<link rel=\"stylesheet\" href=\"%s\">";
	private static final String INLINE_ELEMENT = "<style>%s</style>";
	private static final String REFERENCE_URL = "/min.css?k=%s&d=%s";

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
			return CSSPackage.get(this.pageContext.getServletContext(), key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getStyleKeys();
	}

}
