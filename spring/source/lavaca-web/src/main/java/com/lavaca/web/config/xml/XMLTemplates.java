package com.lavaca.web.config.xml;

import java.util.List;

import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "templates")
public class XMLTemplates {

	public static XMLTemplates parse(String path) throws JAXBException {
		return XMLParser.parse(XMLTemplates.class, path);
	}

	private List<XMLTemplate> templates;

	@XmlElements({ @XmlElement(name = "template", type = XMLTemplate.class) })
	public List<XMLTemplate> getTemplates() {
		return templates;
	}

	public void setTemplates(List<XMLTemplate> templates) {
		this.templates = templates;
	}

}