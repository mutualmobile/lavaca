package com.lavaca.web.compression;


public class ConfigPackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = 8576436237572952201L;

	private static final String CONTENT_TYPE = "application/json";

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
