package com.lavaca.web.ui;

/**
 * Wrapper tag for multiple JS tags
 */
public class CollectedJSPackagesTag extends JSPackageTag {

	private static final long serialVersionUID = 3371026664706288035L;

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
