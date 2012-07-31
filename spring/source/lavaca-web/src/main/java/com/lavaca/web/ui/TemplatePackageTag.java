package com.lavaca.web.ui;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.DustTemplatePackage;
import com.lavaca.web.compression.TemplatePackage;
import com.lavaca.web.config.LavacaConfig;

public class TemplatePackageTag extends MapPackageTag {

	private static final long serialVersionUID = -7586672408836229431L;

	private static final String REFERENCE_URL = "/min.tmpl?k=%s&d=%s";

	private String type;

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

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

	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getTemplateKeys();
	}

	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, cp.getKey(), cp.getCreated()
				.getTime());
	}

	@Override
	public boolean isDefault(CodePackage cp) {
		return false;
	}

	@Override
	protected String getMimeType(CodePackage cp) {
		return ((TemplatePackage) cp).getType();
	}

}