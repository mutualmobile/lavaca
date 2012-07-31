package com.lavaca.web.ui;

import java.util.Locale;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.TranslationPackage;
import com.lavaca.web.config.LavacaConfig;

public class TranslationPackageTag extends MapPackageTag {

	private static final long serialVersionUID = 3691332965285051152L;

	private static final String REFERENCE_URL = "/min.i18n?k=%s&d=%s";
	private static final String TYPE = "text/x-translation";

	private String language;
	private String country;

	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	public Locale getLocale() {
		if (null == this.getLanguage()) {
			return new Locale("en");
		} else if (null == this.getCountry()) {
			return new Locale(this.getLanguage());
		} else {
			return new Locale(this.getLanguage(), this.getCountry());
		}
	}

	private boolean matchesLocale(Locale other) {
		Locale myLocale = this.getLocale();
		if (null != myLocale && null != other) {
			return myLocale.getLanguage().equals(other.getLanguage())
					&& (myLocale.getCountry().length() == 0
							|| other.getCountry().length() == 0 || myLocale
							.getCountry().equals(other.getCountry()));
		} else {
			return false;
		}
	}

	@Override
	public String getKey() {
		return this.getLocale().toString();
	}

	@Override
	public void setKey(String key) {
		throw new IllegalStateException();
	}

	@Override
	protected void loadValuesFromParent(CodePackageCollectionTag parent) {
		super.loadValuesFromParent(parent);
		if (parent instanceof TranslationPackageCollectionTag) {
			Locale parentLocale = ((TranslationPackageCollectionTag) parent)
					.getLocale();
			if (this.matchesLocale(parentLocale)) {
				this.setDef(true);
			} else {
				this.setDef(false);
				this.setInline(false);
			}
		}
	}

	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, this.getKey(), cp.getCreated()
				.getTime());
	}

	@Override
	protected String getMimeType(CodePackage cp) {
		return TYPE;
	}

	@Override
	public boolean isDefault(CodePackage cp) {
		return this.getDef();
	}

	@Override
	protected CodePackage getCodePackage(String key) throws JspException {
		try {
			return TranslationPackage.get(this.pageContext.getServletContext(),
					key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getTranslationKeys();
	}

}
