package com.lavaca.web.ui.templating;

import java.io.IOException;

import javax.servlet.ServletContext;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.heydanno.xdust.XDust;
import com.lavaca.web.caching.DustCache;
import com.lavaca.web.compression.DustTemplatePackage;
import com.lavaca.web.config.LavacaConfig;

public class LavacaDust extends XDust {

	public static void load(ServletContext sc) {
		new LavacaDust(sc, null, null);
	}

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

	public ServletContext getServletContext() {
		return servletContext;
	}

	public HttpServletRequest getRequest() {
		return request;
	}

	public HttpServletResponse getResponse() {
		return response;
	}

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
