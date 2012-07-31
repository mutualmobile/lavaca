package com.lavaca.web.ui;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.jsp.JspException;
import javax.servlet.jsp.JspWriter;
import javax.servlet.jsp.tagext.Tag;
import javax.servlet.jsp.tagext.TagSupport;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.CodePackageEntry;

public abstract class CodePackageTag extends TagSupport {

	private static final long serialVersionUID = 8671389629133452706L;

	protected String key;
	protected boolean inline;
	protected boolean compress;

	protected abstract String getReferenceElement(CodePackage cp, String url);

	protected abstract String getInlineElement(CodePackage cp, Object code);

	protected abstract String getReferenceURL(CodePackage cp)
			throws JspException;

	protected abstract CodePackage getCodePackage(String key)
			throws JspException;

	protected abstract String[] getCollectedKeys();

	protected boolean isCollected() {
		return false;
	}

	public String getKey() {
		return this.key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public boolean getInline() {
		return this.inline;
	}

	public void setInline(boolean inline) {
		this.inline = inline;
	}

	public boolean getCompress() {
		return this.compress;
	}

	public void setCompress(boolean compress) {
		this.compress = compress;
	}

	protected List<CodePackage> getCodePackages(String[] keys)
			throws JspException {
		List<CodePackage> cps = new ArrayList<CodePackage>();
		for (String key : keys) {
			cps.add(this.getCodePackage(key));
		}
		return cps;
	}

	protected CodePackageCollectionTag getParentCollection() {
		Tag parent = this.getParent();
		if (null != parent && parent instanceof CodePackageCollectionTag) {
			return (CodePackageCollectionTag) parent;
		}
		return null;
	}

	protected void loadValuesFromParent(CodePackageCollectionTag parent) {
		this.setInline(parent.getInline());
		this.setCompress(parent.getCompress());
	}

	protected boolean shouldRender(CodePackage cp) {
		return true;
	}

	protected void sealPackage(CodePackage codePackage) {
		codePackage.seal();
	}

	@Override
	public int doStartTag() throws JspException {
		if (this.isCollected() || this.getCodePackage(this.getKey()).isSealed()) {
			return SKIP_BODY;
		} else {
			return EVAL_BODY_INCLUDE;
		}
	}

	@Override
	public int doEndTag() throws JspException {
		CodePackageCollectionTag parent = this.getParentCollection();
		if (null == parent || parent.shouldRender(this)) {
			if (null != parent) {
				this.loadValuesFromParent(parent);
			}
			String[] keys = this.isCollected() ? this.getCollectedKeys()
					: new String[] { this.getKey() };
			List<CodePackage> codePackages = this.getCodePackages(keys);
			for (CodePackage cp : codePackages) {
				if (this.shouldRender(cp)) {
					try {
						JspWriter out = this.pageContext.getOut();
						if (!this.getCompress()) {
							for (CodePackageEntry entry : cp.getEntries()) {
								out.write(this.getReferenceElement(cp,
										entry.getPath()));
								out.write('\n');
							}
						} else if (this.getInline()) {
							out.write(this.getInlineElement(cp,
									cp.getOutput(this.pageContext
											.getServletContext(), false)));
						} else {
							String url = this.getReferenceURL(cp);
							out.write(this.getReferenceElement(cp, url));
						}
					} catch (IOException e) {
						throw new JspException(e);
					}
				}
			}
		}
		return EVAL_PAGE;
	}

}
