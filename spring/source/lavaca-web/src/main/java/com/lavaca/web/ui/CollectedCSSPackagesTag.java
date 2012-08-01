package com.lavaca.web.ui;

/**
 * Wrapper tag for multiple CSS tags
 */
public class CollectedCSSPackagesTag extends CSSPackageTag {

	private static final long serialVersionUID = 8644169318252895989L;

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
