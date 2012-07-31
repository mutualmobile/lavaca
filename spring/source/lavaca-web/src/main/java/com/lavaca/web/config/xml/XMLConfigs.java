package com.lavaca.web.config.xml;

import java.util.List;

import javax.xml.bind.JAXBException;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlElements;
import javax.xml.bind.annotation.XmlRootElement;

@XmlRootElement(name = "configs")
public class XMLConfigs {

	public static XMLConfigs parse(String path) throws JAXBException {
		return XMLParser.parse(XMLConfigs.class, path);
	}

	private List<XMLEntry> configs;

	@XmlElements({ @XmlElement(name = "config", type = XMLEntry.class) })
	public List<XMLEntry> getConfigs() {
		return configs;
	}

	public void setConfigs(List<XMLEntry> configs) {
		this.configs = configs;
	}

}