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

/**
 * Base type for Lavaca code package JSP tags
 */
public abstract class CodePackageTag extends TagSupport {

	private static final long serialVersionUID = 8671389629133452706L;

	/**
	 * The unique identifier for the code package
	 */
	protected String key;
	/**
	 * Whether or not the code should be rendered directly into the parent page
	 */
	protected boolean inline;
	/**
	 * Whether or not the code should be compacted
	 */
	protected boolean compress;

	/**
	 * Determines the markup to use when the code is to be referenced externally
	 * 
	 * @param cp
	 *            The code package to reference
	 * @param url
	 *            The URL of the packaged code
	 * @return The HTML code required to reference the package
	 */
	protected abstract String getReferenceElement(CodePackage cp, String url);

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
	protected abstract String getInlineElement(CodePackage cp, Object code);

	/**
	 * Determines the URL needed to reference a code package
	 * 
	 * @param cp
	 *            The code package tor eference
	 * @return The URL used to access the code package
	 * @throws JspException
	 */
	protected abstract String getReferenceURL(CodePackage cp)
			throws JspException;

	/**
	 * Retrieves a code package, given its key
	 * 
	 * @param key
	 *            The identifier of the code package
	 * @return The code package
	 * @throws JspException
	 */
	protected abstract CodePackage getCodePackage(String key)
			throws JspException;

	/**
	 * Retrieves all keys associated with a code package
	 * 
	 * @return The keys included within that package
	 */
	protected abstract String[] getCollectedKeys();

	/**
	 * Determines whether or not a code package contains other code packages
	 * 
	 * @return True when the code package contains other code packages
	 */
	protected boolean isCollected() {
		return false;
	}

	/**
	 * Gets the unique identifier for this code package
	 * 
	 * @return The key
	 */
	public String getKey() {
		return this.key;
	}

	/**
	 * Sets the unique identifier for this code package
	 * 
	 * @param key
	 *            The key
	 */
	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * Gets whether or not the code package should be rendered inline
	 * 
	 * @return True when the code package should be rendered inline
	 */
	public boolean getInline() {
		return this.inline;
	}

	/**
	 * Sets whether or not the code package should be rendered inline
	 * 
	 * @param inline
	 *            Whether or not the code package should be rendered inline
	 */
	public void setInline(boolean inline) {
		this.inline = inline;
	}

	/**
	 * Gets whether or not the code should be compacted
	 * 
	 * @return True when the code should be compacted
	 */
	public boolean getCompress() {
		return this.compress;
	}

	/**
	 * Sets whether or not the code should be compacted
	 * 
	 * @param compress
	 *            Whether or not the code should be compacted
	 */
	public void setCompress(boolean compress) {
		this.compress = compress;
	}

	/**
	 * Gets all code packages associated with certain keyss
	 * 
	 * @param keys
	 *            The keys of those packages
	 * @return The associated code packages
	 * @throws JspException
	 */
	protected List<CodePackage> getCodePackages(String[] keys)
			throws JspException {
		List<CodePackage> cps = new ArrayList<CodePackage>();
		for (String key : keys) {
			cps.add(this.getCodePackage(key));
		}
		return cps;
	}

	/**
	 * Gets the parent of this code package, if this package has been collected
	 * into it
	 * 
	 * @return The parent code package collection
	 */
	protected CodePackageCollectionTag getParentCollection() {
		Tag parent = this.getParent();
		if (null != parent && parent instanceof CodePackageCollectionTag) {
			return (CodePackageCollectionTag) parent;
		}
		return null;
	}

	/**
	 * Inherits settings from a collection parent
	 * 
	 * @param parent
	 *            The parent code package collection
	 */
	protected void loadValuesFromParent(CodePackageCollectionTag parent) {
		this.setInline(parent.getInline());
		this.setCompress(parent.getCompress());
	}

	/**
	 * Determines whether or not a code package should be rendered
	 * 
	 * @param cp
	 *            The code package
	 * @return True when the code package should be rendered
	 */
	protected boolean shouldRender(CodePackage cp) {
		return true;
	}

	/**
	 * Prevents additional content from being added to a code package
	 * 
	 * @param codePackage
	 *            The code package to seal
	 */
	protected void sealPackage(CodePackage codePackage) {
		codePackage.seal();
	}

	/**
	 * Invoked when the JSP processor reaches the start tag
	 */
	@Override
	public int doStartTag() throws JspException {
		if (this.isCollected() || this.getCodePackage(this.getKey()).isSealed()) {
			return SKIP_BODY;
		} else {
			return EVAL_BODY_INCLUDE;
		}
	}

	/**
	 * Invoked when the JSP processor reaches the end tag
	 */
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
