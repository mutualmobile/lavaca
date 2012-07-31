package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.TemplatePackageCache;

/**
 * Lavaca dust template file package
 */
public class DustTemplatePackage extends TemplatePackage {

	private static final long serialVersionUID = 7342406127317054594L;

	private static final String TYPE = "text/x-dust-template";

	/**
	 * Retrieves a cached dust file package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier for the dust file package
	 * @return The cached dust file package
	 * @throws IOException
	 */
	public static DustTemplatePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(DustTemplatePackage.class,
				TemplatePackageCache.instance(context), key);
	}

	/**
	 * Constructs a new dust template package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public DustTemplatePackage(String key) {
		super(key);
	}

	/**
	 * Gets the type associated with the template
	 * 
	 * @return The type
	 */
	@Override
	public String getType() {
		return TYPE;
	}

	/**
	 * Renders the template to string
	 * 
	 * @param model
	 *            The data to pass to the template
	 * @return The rendered output
	 * @throws RuntimeException
	 */
	@Override
	public String render(Object model) throws RuntimeException {
		throw new UnsupportedOperationException();
	}

}
