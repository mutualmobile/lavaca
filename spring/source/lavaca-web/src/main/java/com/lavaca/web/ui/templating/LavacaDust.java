package com.lavaca.web.ui.templating;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.heydanno.xdust.XDust;
import com.lavaca.web.caching.DustCache;
import com.lavaca.web.compression.DustTemplatePackage;
import com.lavaca.web.config.LavacaConfig;

/**
 * Instance of the XDust templating engine for use with Lavaca's templating
 * system
 */
public class LavacaDust extends XDust {

	/**
	 * Loads all templates into the cache
	 * 
	 * @param sc
	 *            The current servlet context
	 */
	public static void load(ServletContext sc) {
		new LavacaDust(sc, null, null);
	}

	/**
	 * Creates a new instance of the templating engine
	 * 
	 * @param sc
	 *            The current servlet context
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 */
	public LavacaDust(ServletContext sc, HttpServletRequest request,
			HttpServletResponse response) {
		super();
		this.servletContext = sc;
		this.request = request;
		this.response = response;
		this.prepare();
	}

	private ServletContext servletContext;
	private HttpServletRequest request;
	private HttpServletResponse response;

	/**
	 * Gets the current servlet context
	 * 
	 * @return The current servlet context
	 */
	public ServletContext getServletContext() {
		return servletContext;
	}

	/**
	 * Gets the current HTTP request
	 * 
	 * @return The current HTTP request
	 */
	public HttpServletRequest getRequest() {
		return request;
	}

	/**
	 * Gets the current HTTP response
	 * 
	 * @return The current HTTP response
	 */
	public HttpServletResponse getResponse() {
		return response;
	}

	/**
	 * Readies the engine for use
	 */
	public void prepare() {
		this.getHelpers().put("msg", new LavacaDustTranslationHelper());
		this.getHelpers().put("include", new LavacaDustIncludeHelper());
		DustCache cache = DustCache.instance(this.getServletContext());
		if (!cache.isPopulated()) {
			synchronized ("dust") {
				if (!cache.isPopulated()) {
					for (String key : LavacaConfig.instance(
							this.getServletContext()).getTemplateKeys()) {
						DustTemplatePackage cp;
						try {
							cp = DustTemplatePackage.get(
									this.getServletContext(), key);
							this.compile(
									(String) cp.getOutput(
											this.getServletContext(), false),
									key, null);
						} catch (IOException e) {
							throw new RuntimeException(e);
						}
						cache.put(key, this.getTemplates().get(key));
					}
				}
			}
		} else {
			for (String key : LavacaConfig.instance(this.getServletContext())
					.getTemplateKeys()) {
				this.getTemplates().put(key, cache.get(key));
			}
		}
	}

}
