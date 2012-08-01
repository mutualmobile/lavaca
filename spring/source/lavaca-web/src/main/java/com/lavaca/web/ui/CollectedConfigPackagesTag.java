package com.lavaca.web.ui;

/**
 * Wrapper tag for multiple config tags
 */
public class CollectedConfigPackagesTag extends ConfigPackageTag {

	private static final long serialVersionUID = 2531539128425625534L;

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
