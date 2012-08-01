package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.googlecode.htmlcompressor.compressor.HtmlCompressor;
import com.lavaca.web.caching.TemplatePackageCache;

/**
 * Base type for Lavaca template file packages
 */
public abstract class TemplatePackage extends CodePackage {

	private static final long serialVersionUID = 6921940239813607729L;

	/**
	 * Retrieves a cached template file package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier for the template file package
	 * @return The cached template file package
	 * @throws IOException
	 */
	public static TemplatePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(TemplatePackage.class,
				TemplatePackageCache.instance(context), key);
	}

	/**
	 * Renders a template to string
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier of the template to render
	 * @param model
	 *            The data to pass to the template
	 * @return The rendered output
	 * @throws RuntimeException
	 * @throws IOException
	 */
	public static String render(ServletContext context, String key, Object model)
			throws RuntimeException, IOException {
		return get(context, key).render(model);
	}

	/**
	 * Constructs a new template package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public TemplatePackage(String key) {
		super(key);
	}

	/**
	 * Compacts package data
	 * 
	 * @param code
	 *            The data to compact
	 * @return The compressed data
	 * @throws IOException
	 */
	@Override
	protected String compress(String code) {
		HtmlCompressor compressor = new HtmlCompressor();
		return compressor.compress(code);
	}

	/**
	 * Gets the type associated with the template
	 * @return The type
	 */
	public abstract String getType();

	/**
	 * Renders the template to string
	 * @param model The data to pass to the template
	 * @return The rendered output
	 * @throws RuntimeException
	 */
	public abstract String render(Object model) throws RuntimeException;

}
