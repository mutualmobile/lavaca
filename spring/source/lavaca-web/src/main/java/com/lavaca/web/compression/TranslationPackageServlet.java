package com.lavaca.web.compression;


public class TranslationPackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = -8867267552207638723L;

	private static final String CONTENT_TYPE = "application/json";

	@Override
	protected String getContentType() {
		return CONTENT_TYPE;
	}

	@Override
	protected CodePackage getCodePackage(String key) {
		try {
			return TranslationPackage.get(this.context, key);
		} catch (Exception e) {
			return null;
		}
	}

}
