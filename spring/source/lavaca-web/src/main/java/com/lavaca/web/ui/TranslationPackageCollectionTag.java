package com.lavaca.web.ui;

import java.util.Locale;

/**
 * Tag for including a collection of Lavaca translations in a page
 */
public class TranslationPackageCollectionTag extends CodePackageCollectionTag {

	private static final long serialVersionUID = -8354779919941534700L;

	private Locale locale;

	/**
	 * Sets the unique identifier for this code package
	 * 
	 * @param key
	 *            The key
	 */
	@Override
	public void setKey(String key) {
		super.setKey(key);
		if (null != key) {
			String[] parts = key.split("_");
			if (parts.length > 0) {
				this.locale = new Locale(parts[0], parts[1]);
			} else {
				this.locale = new Locale(parts[0]);
			}
		}
	}

	/**
	 * Gets the default locale associated with this translation collection
	 * 
	 * @return The locale
	 */
	public Locale getLocale() {
		return this.locale;
	}

}
