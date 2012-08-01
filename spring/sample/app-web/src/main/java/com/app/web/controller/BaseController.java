package com.app.web.controller;

import java.io.IOException;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.JSONException;

import com.app.web.AppConfig;
import com.app.web.model.Page;
import com.lavaca.web.compression.ConfigPackage;

public abstract class BaseController extends com.lavaca.web.mvc.BaseController {

	protected Page getPageModel(HttpServletRequest request) {
		Page result = (Page) request.getAttribute("lv:page");
		if (null == result) {
			result = new Page();
			request.setAttribute("lv:page", result);
		}
		return result;
	}

	protected AppConfig getAppConfig() throws IOException, JSONException {
		return AppConfig.instance(this.getApplicationContext());
	}

	protected ConfigPackage getConfig() throws IOException {
		try {
			return ConfigPackage.get(this.getServletContext(), AppConfig
					.instance(this.getApplicationContext()).getTarget());
		} catch (Exception e) {
			throw new IOException(e);
		}
	}

	@Override
	protected String respondWithView(HttpServletRequest request,
			HttpServletResponse response, String templateName, Object model)
			throws Exception {
		request.setAttribute("page", this.getPageModel(request));
		request.setAttribute("app", this.getAppConfig());
		return super.respondWithView(request, response, templateName, model);
	}

	@Override
	protected String respondWithView(HttpServletRequest request,
			HttpServletResponse response, String viewName) throws Exception {
		return this.respondWithView(request, response, viewName, null);
	}

}
