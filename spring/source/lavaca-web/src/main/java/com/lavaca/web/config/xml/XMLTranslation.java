package com.lavaca.web.config.xml;

import java.util.Locale;

import javax.xml.bind.annotation.XmlElement;

public class XMLTranslation {

	private String language;
	private String country;
	private String path;

	@XmlElement(name = "language")
	public String getLanguage() {
		return language;
	}

	public void setLanguage(String language) {
		this.language = language;
	}

	@XmlElement(name = "country")
	public String getCountry() {
		return country;
	}

	public void setCountry(String country) {
		this.country = country;
	}

	@XmlElement(name = "path")
	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

	public Locale getLocale() {
		if (null == this.getCountry()) {
			return new Locale(this.getLanguage());
		} else {
			return new Locale(this.getLanguage(), this.getCountry());
		}
	}

}
