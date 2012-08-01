package com.lavaca.web.config.xml;

import javax.xml.bind.annotation.XmlElement;

public class XMLTemplate extends XMLEntry {

	private String type;

	@XmlElement(name = "type")
	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

}
