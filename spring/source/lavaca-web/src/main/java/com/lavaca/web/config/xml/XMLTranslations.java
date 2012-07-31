package com.lavaca.web.config.xml;

import java.util.List;

import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "translations")
public class XMLTranslations {

	public static XMLTranslations parse(String path) throws JAXBException {
		return XMLParser.parse(XMLTranslations.class, path);
	}

	private List<XMLTranslation> translations;

	@XmlElements({ @XmlElement(name = "translation", type = XMLTranslation.class) })
	public List<XMLTranslation> getTranslations() {
		return translations;
	}

	public void setTranslations(List<XMLTranslation> translations) {
		this.translations = translations;
	}

}