package com.lavaca.web.ui;

import java.util.Locale;

import javax.servlet.jsp.JspException;

import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.TranslationPackage;
import com.lavaca.web.config.LavacaConfig;

/**
 * Tag for including Lavaca translation in a page
 */
public class TranslationPackageTag extends MapPackageTag {

	private static final long serialVersionUID = 3691332965285051152L;

	private static final String REFERENCE_URL = "/min.i18n?k=%s&d=%s";
	private static final String TYPE = "text/x-translation";

	private String language;
	private String country;

	/**
	 * Gets the language associated with this translation
	 * 
	 * @return The language code
	 */
	public String getLanguage() {
		return language;
	}

	/**
	 * Sets the language associated with this translation
	 * 
	 * @param language
	 *            The language code
	 */
	public void setLanguage(String language) {
		this.language = language;
	}

	/**
	 * Gets the country associated with this translation
	 * 
	 * @return The country code
	 */
	public String getCountry() {
		return country;
	}

	/**
	 * Sets the country associated with this translation
	 * 
	 * @param country
	 *            The country code
	 */
	public void setCountry(String country) {
		this.country = country;
	}

	/**
	 * Gets the locale associated with this translation
	 * 
	 * @return The locale
	 */
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

	/**
	 * Gets the unique identifier for this code package
	 * 
	 * @return The key
	 */
	@Override
	public String getKey() {
		return this.getLocale().toString();
	}

	/**
	 * Sets the unique identifier for this code package
	 * 
	 * @param key
	 *            The key
	 */
	@Override
	public void setKey(String key) {
		throw new IllegalStateException();
	}

	/**
	 * Inherits settings from a collection parent
	 * 
	 * @param parent
	 *            The parent code package collection
	 */
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

	/**
	 * Determines the URL needed to reference a code package
	 * 
	 * @param cp
	 *            The code package tor eference
	 * @return The URL used to access the code package
	 * @throws JspException
	 */
	@Override
	protected String getReferenceURL(CodePackage cp) throws JspException {
		return String.format(REFERENCE_URL, this.getKey(), cp.getCreated()
				.getTime());
	}

	/**
	 * Gets the MIME type of a code package
	 * 
	 * @param cp
	 *            The code package
	 * @return The MIME type of that package
	 */
	@Override
	protected String getMimeType(CodePackage cp) {
		return TYPE;
	}

	/**
	 * Determines whether or not a package is the default one of its type
	 * 
	 * @param cp
	 *            The code package to check
	 * @return True if the package is default
	 */
	@Override
	public boolean isDefault(CodePackage cp) {
		return this.getDef();
	}

	/**
	 * Retrieves a code package, given its key
	 * 
	 * @param key
	 *            The identifier of the code package
	 * @return The code package
	 * @throws JspException
	 */
	@Override
	protected CodePackage getCodePackage(String key) throws JspException {
		try {
			return TranslationPackage.get(this.pageContext.getServletContext(),
					key);
		} catch (Exception e) {
			throw new JspException(e);
		}
	}

	/**
	 * Retrieves all keys associated with a code package
	 * 
	 * @return The keys included within that package
	 */
	@Override
	protected String[] getCollectedKeys() {
		return LavacaConfig.instance(this.pageContext.getServletContext())
				.getTranslationKeys();
	}

}
