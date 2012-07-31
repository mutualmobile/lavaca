package com.lavaca.web.ui;

import java.util.List;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.tagext.TagSupport;

import com.lavaca.web.compression.CodePackageEntry;

public class CodePackageEntryTag extends TagSupport {

	private static final long serialVersionUID = 5450194758273586855L;

	protected String key;
	protected String path;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getPath() {
		return this.path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	@Override
	public int doEndTag() throws JspException {
		CodePackageTag parent = (CodePackageTag) this.getParent();
		List<CodePackageEntry> files = parent.getCodePackage(parent.getKey())
				.getEntries();
		files.add(new CodePackageEntry(null, this.getPath()));
		return EVAL_PAGE;
	}
}
