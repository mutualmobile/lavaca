package com.lavaca.web.mvc;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.servlet.ModelAndView;
import org.springframework.web.servlet.mvc.AbstractController;

import com.lavaca.web.caching.DustCache;
import com.lavaca.web.caching.TranslationPackageCache;
import com.lavaca.web.config.LavacaConfig;
import com.lavaca.web.ui.templating.LavacaDust;
import com.lavaca.web.ui.templating.LavacaDustCaptureResult;

public abstract class BaseController extends AbstractController {

	protected static final Logger logger = LoggerFactory
			.getLogger(BaseController.class);

	protected enum RequestType {
		HTML("html"), JSON("json"), XML("xml");

		private String type;

		private RequestType(String type) {
			this.type = type;
		}

		public String toString() {
			return this.type;
		}
	}

	protected String getRequestContext(HttpServletRequest request) {
		return request.getContextPath();
	}

	protected String getRequestPath(HttpServletRequest request) {
		String url = request.getRequestURI();
		String context = request.getContextPath();
		if (null == url) {
			url = context;
		}
		return url.substring(context.length());
	}

	protected RequestType getRequestType(HttpServletRequest request) {
		String url = (String) request.getAttribute("originatingURL");
		if (null == url) {
			url = this.getRequestPath(request);
		}
		return this.getRequestType(url);
	}

	protected RequestType getRequestType(String path) {
		String url = path.toLowerCase();
		if (url.contains(".json")) {
			return RequestType.JSON;
		} else if (url.endsWith(".xml")) {
			return RequestType.XML;
		} else {
			return RequestType.HTML;
		}
	}

	protected String respondWithView(HttpServletRequest request,
			HttpServletResponse response, String templateName, Object model)
			throws Exception {
		request.setAttribute("model", model);
		request.setAttribute("locale", request.getLocale());
		if (null != templateName) {
			String content = this
					.render(request, response, templateName, model);
			request.setAttribute("content", content);
			return LavacaConfig.instance(this.getServletContext())
					.getShellViewName();
		} else {
			return this.respondWithRedirect(request, response, "/");
		}
	}

	protected String respondWithView(HttpServletRequest request,
			HttpServletResponse response, String viewName) throws Exception {
		return this.respondWithView(request, response, viewName, null);
	}

	protected String respondWithJSON(HttpServletRequest request,
			HttpServletResponse response, Object model) throws Exception {
		response.setContentType("application/json");
		String out;
		if (null == model) {
			out = "null";
		} else {
			Class<?> C = model.getClass();
			if (C.isPrimitive() || model instanceof Number
					|| C.equals(String.class)) {
				out = String.valueOf(model);
			} else if (C.isArray()) {
				out = JSONArray.toJSONString(Arrays.asList(model));
			} else if (model instanceof List) {
				out = JSONArray.toJSONString((List<?>) model);
			} else if (model instanceof Map<?, ?>) {
				out = JSONObject.toJSONString((Map<?, ?>) model);
			} else {
				throw new IllegalArgumentException();
			}
		}
		response.getWriter().write(out);
		response.flushBuffer();
		return null;
	}

	protected String respondWithXML(HttpServletRequest request,
			HttpServletResponse response, Object model) throws Exception {
		throw new UnsupportedOperationException();
	}

	protected String respond(HttpServletRequest request,
			HttpServletResponse response, String viewName, Object model)
			throws Exception {
		switch (this.getRequestType(request)) {
		case XML:
			return this.respondWithXML(request, response, model);
		case JSON:
			return this.respondWithJSON(request, response, model);
		case HTML:
		default:
			return this.respondWithView(request, response, viewName, model);
		}
	}

	protected String respondWithRedirect(HttpServletRequest request,
			HttpServletResponse response, String url) throws Exception {
		response.sendRedirect(url);
		return "redirect:" + url;
	}

	protected String respondWithPermanentRedirect(HttpServletRequest request,
			HttpServletResponse response, String url) throws Exception {
		response.setStatus(301);
		return this.respondWithRedirect(request, response, url);
	}

	protected String respondWithError(HttpServletRequest request,
			HttpServletResponse response, int errorCode) throws IOException {
		request.setAttribute("originatingURL", this.getRequestPath(request));
		if (this.getRequestType(request).equals(RequestType.HTML)) {
			response.sendError(errorCode);
		} else {
			response.setStatus(errorCode);
		}
		return null;
	}

	protected String forward(HttpServletRequest request,
			HttpServletResponse response, String url) throws ServletException,
			IOException {
		request.getRequestDispatcher(url).forward(request, response);
		return "";
	}

	protected String getMessage(HttpServletRequest request, String key,
			Object... args) {
		return this.getApplicationContext().getMessage(key, args,
				request.getLocale());
	}

	protected String getMessage(HttpServletRequest request, String key,
			Object[] keyArgs, Object... args) {
		return this.getMessage(request, String.format(key, keyArgs), args);
	}

	@ExceptionHandler(Exception.class)
	public String handleError(HttpServletRequest request,
			HttpServletResponse response, Exception e) {
		if (null != DustCache.instance(this.getServletContext()).get("error")) {
			try {
				return this.respondWithView(request, response, "error");
			} catch (Exception e1) {
				return this.handleErrorWithoutView(request, response, e1);
			}
		} else {
			return this.handleErrorWithoutView(request, response, e);
		}
	}

	private String handleErrorWithoutView(HttpServletRequest request,
			HttpServletResponse response, Exception e) {
		response.setStatus(500);
		e.printStackTrace();
		return null;
	}

	protected String url(String basis, String... args)
			throws UnsupportedEncodingException {
		Object[] clean = new String[args.length];
		for (int i = 0; i < args.length; i++) {
			clean[i] = URLEncoder.encode(args[i], "utf-8");
		}
		return String.format(basis, clean);
	}

	protected void setInit(HttpServletRequest request, String route,
			String title, Map<String, ?> state, Map<String, ?> params) {
		this.setInitRoute(request, route);
		this.setInitState(request, title, state);
		this.setInitParams(request, params);
	}

	protected void setInitRoute(HttpServletRequest request, String value) {
		request.setAttribute("initRoute", value);
	}

	protected void setInitState(HttpServletRequest request, String title,
			Map<String, ?> value) {
		if (null != value) {
			HashMap<String, Object> wrapper = new HashMap<String, Object>();
			wrapper.put("title", title);
			wrapper.put("url", request.getRequestURI());
			wrapper.put("state", value);
			value = wrapper;
		}
		request.setAttribute("initState", JSONObject.toJSONString(value));
	}

	protected void setInitParams(HttpServletRequest request,
			Map<String, ?> value) {
		request.setAttribute("initParams", JSONObject.toJSONString(value));
	}

	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return null;
	}

	protected String translate(String key, Locale locale, Object... args) {
		return TranslationPackageCache.instance(this.getServletContext())
				.getString(key, locale, args);
	}

	protected String translate(String key, HttpServletRequest request,
			Object... args) {
		return this.translate(key, request.getLocale(), args);
	}

	protected String render(HttpServletRequest request,
			HttpServletResponse response, String templateName, Object model) {
		LavacaDust dust = new LavacaDust(this.getServletContext(), request, response);
		LavacaDustCaptureResult result = new LavacaDustCaptureResult();
		dust.render(templateName, model, result);
		if (null != result.getError()) {
			throw new RuntimeException(result.getError());
		} else {
			return result.getOutput();
		}
	}

}
