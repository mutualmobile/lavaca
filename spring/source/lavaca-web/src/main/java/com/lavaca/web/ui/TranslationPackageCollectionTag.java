package com.lavaca.web.ui;

import java.util.Locale;

public class TranslationPackageCollectionTag extends CodePackageCollectionTag {

	private static final long serialVersionUID = -8354779919941534700L;

	private Locale locale;

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

	public Locale getLocale() {
		return this.locale;
	}

}
