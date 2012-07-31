package com.lavaca.web.config.xml;

import java.io.File;

import javax.xml.bind.JAXBContext;
import javax.xml.bind.JAXBException;
import javax.xml.bind.Unmarshaller;

public final class XMLParser {

	@SuppressWarnings("unchecked")
	public static <T> T parse(Class<T> C, String path) throws JAXBException {
		JAXBContext context = JAXBContext.newInstance(C);
		Unmarshaller unmarsh = context.createUnmarshaller();
		return (T) unmarsh.unmarshal(new File(path));
	}

}