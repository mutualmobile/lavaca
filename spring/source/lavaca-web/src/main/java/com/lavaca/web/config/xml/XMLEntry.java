package com.lavaca.web.config.xml;

import javax.xml.bind.annotation.XmlElement;

public class XMLEntry {

	private String name;
	private String path;

	@XmlElement(name = "name")
	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@XmlElement(name = "path")
	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

}
