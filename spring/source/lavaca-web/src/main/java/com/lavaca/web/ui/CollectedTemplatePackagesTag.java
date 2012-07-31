package com.lavaca.web.ui;

/**
 * Wrapper tag for multiple template tags
 */
public class CollectedTemplatePackagesTag extends TemplatePackageTag {

	private static final long serialVersionUID = -1531534733731478143L;

	/**
	 * Determines whether or not a code package contains other code packages
	 * 
	 * @return True when the code package contains other code packages
	 */
	@Override
	protected boolean isCollected() {
		return true;
	}

}
