package com.lavaca.web.compression;

public class CSSPackageServlet extends CodePackageServlet {

	private static final long serialVersionUID = -1799975133746213953L;

	private static final String CONTENT_TYPE = "text/css";

	@Override
	protected String getContentType() {
		return CONTENT_TYPE;
	}

	@Override
	protected CodePackage getCodePackage(String key) {
		try {
			return CSSPackage.get(this.context, key);
		} catch (Exception e) {
			return null;
		}
	}

}
