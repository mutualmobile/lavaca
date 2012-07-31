package com.lavaca.web.ui;

import com.lavaca.web.compression.CodePackage;

public abstract class MapPackageTag extends CodePackageTag {

	private static final long serialVersionUID = -7164151841028947661L;

	protected String path;
	protected boolean def;

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public boolean getDef() {
		return def;
	}

	public void setDef(boolean def) {
		this.def = def;
	}

	public abstract boolean isDefault(CodePackage cp);

	protected abstract String getMimeType(CodePackage cp);

	private String draw(CodePackage cp, String url, Object code) {
		StringBuilder out = new StringBuilder();
		out.append("<script type=\"").append(this.getMimeType(cp))
				.append("\" data-name=\"").append(cp.getKey()).append("\"");
		if (this.isDefault(cp)) {
			out.append(" data-default");
		}
		if (null != url) {
			out.append(" data-src=\"").append(url).append("\"");
		}
		out.append(">");
		if (null != code) {
			out.append(code);
		}
		out.append("</script>");
		return out.toString();
	}

	@Override
	protected String getReferenceElement(CodePackage cp, String url) {
		return this.draw(cp, url, null);
	}

	@Override
	protected String getInlineElement(CodePackage cp, Object code) {
		return this.draw(cp, null, code);
	}

}
