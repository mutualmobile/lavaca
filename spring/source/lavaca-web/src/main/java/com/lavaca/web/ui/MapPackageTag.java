package com.lavaca.web.ui;

import com.lavaca.web.compression.CodePackage;

/**
 * Base tag type for working with Lavaca map types
 */
public abstract class MapPackageTag extends CodePackageTag {

	private static final long serialVersionUID = -7164151841028947661L;

	/**
	 * The file path associated with the package
	 */
	protected String path;
	/**
	 * Whether or not this package is the default one of its type
	 */
	protected boolean def;

	/**
	 * Gets the file path associated with the map
	 * 
	 * @return The path
	 */
	public String getPath() {
		return path;
	}

	/**
	 * Sets the file path associated with the map
	 * 
	 * @param path
	 *            The path
	 */
	public void setPath(String path) {
		this.path = path;
	}

	/**
	 * Gets whether or not this package is the default one of its type
	 * 
	 * @return True if the map is default
	 */
	public boolean getDef() {
		return def;
	}

	/**
	 * Sets whether or not this package is the default one of its type
	 * 
	 * @param def
	 *            Whether or not this package is default
	 */
	public void setDef(boolean def) {
		this.def = def;
	}

	/**
	 * Determines whether or not a package is the default one of its type
	 * 
	 * @param cp
	 *            The code package to check
	 * @return True if the package is default
	 */
	public abstract boolean isDefault(CodePackage cp);

	/**
	 * Gets the MIME type of a code package
	 * 
	 * @param cp
	 *            The code package
	 * @return The MIME type of that package
	 */
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

	/**
	 * Determines the markup to use when the code is to be referenced externally
	 * 
	 * @param cp
	 *            The code package to reference
	 * @param url
	 *            The URL of the packaged code
	 * @return The HTML code required to reference the package
	 */
	@Override
	protected String getReferenceElement(CodePackage cp, String url) {
		return this.draw(cp, url, null);
	}

	/**
	 * Determines the markup to use when the code is to be written inline
	 * 
	 * @param cp
	 *            The code package to inline
	 * @param code
	 *            The code to inline
	 * @return The HTML code required to include the code directly in the host
	 *         page
	 */
	@Override
	protected String getInlineElement(CodePackage cp, Object code) {
		return this.draw(cp, null, code);
	}

}
