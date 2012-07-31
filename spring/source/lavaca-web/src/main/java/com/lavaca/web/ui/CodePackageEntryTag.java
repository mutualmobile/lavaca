package com.lavaca.web.ui;

import java.util.List;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

import com.lavaca.web.compression.CodePackageEntry;

/**
 * Base type for files tags that are included as part of code packages
 */
public class CodePackageEntryTag extends TagSupport {

	private static final long serialVersionUID = 5450194758273586855L;

	/**
	 * Unique identifier of the entry
	 */
	protected String key;
	/**
	 * The file path for the entry
	 */
	protected String path;

	/**
	 * Gets the unique identifier of the entry
	 * 
	 * @return The key
	 */
	public String getKey() {
		return key;
	}

	/**
	 * Sets the unique identifier of the entry
	 * 
	 * @param key
	 *            The key
	 */
	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * Gets the file path for the entry
	 * 
	 * @return The file path
	 */
	public String getPath() {
		return this.path;
	}

	/**
	 * Sets the file path for the entry
	 * 
	 * @param path
	 *            The file path
	 */
	public void setPath(String path) {
		this.path = path;
	}

	/**
	 * Invoked when the JSP processor reaches the end tag
	 */
	@Override
	public int doEndTag() throws JspException {
		CodePackageTag parent = (CodePackageTag) this.getParent();
		List<CodePackageEntry> files = parent.getCodePackage(parent.getKey())
				.getEntries();
		files.add(new CodePackageEntry(null, this.getPath()));
		return EVAL_PAGE;
	}
}
