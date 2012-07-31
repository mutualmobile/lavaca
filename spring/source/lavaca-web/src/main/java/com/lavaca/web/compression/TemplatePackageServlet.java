package com.lavaca.web.compression;


public class TemplatePackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = -2704356220466127265L;

	private static final String CONTENT_TYPE = "text/text";

	@Override
	protected String getContentType() {
		return CONTENT_TYPE;
	}

	@Override
	protected CodePackage getCodePackage(String key) {
		try {
			return TemplatePackage.get(this.context, key);
		} catch (Exception e) {
			return null;
		}
	}

}
