package com.lavaca.web.ui;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.ConfigPackage;
import com.lavaca.web.config.LavacaConfig;

public class ConfigPackageTag extends MapPackageTag {

	private static final long serialVersionUID = 3691332965285051152L;

	private static final String REFERENCE_URL = "/min.conf?k=%s&d=%s";
	private static final String TYPE = "text/x-config";

	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, this.getKey(), cp.getCreated()
				.getTime());
	}

	@Override
	protected String getMimeType(CodePackage cp) {
		return TYPE;
	}

	@Override
	public boolean isDefault(CodePackage cp) {
		return cp.getKey().equals(System.getProperty("target"));
	}

	@Override
	protected CodePackage getCodePackage(String key) throws JspException {
		try {
			return ConfigPackage.get(this.pageContext.getServletContext(), key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getConfigKeys();
	}

	@Override
	protected boolean shouldRender(CodePackage cp) {
		return this.isDefault(cp);
	}

}
