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

/**
 * Base type for all server-side controllers
 */
public abstract class BaseController extends AbstractController {

	/**
	 * Logging utility
	 */
	protected static final Logger logger = LoggerFactory
			.getLogger(BaseController.class);

	/**
	 * Types of requests supported by the controller
	 */
	protected enum RequestType {
		/**
		 * HTML request
		 */
		HTML("html"),
		/**
		 * JSON request
		 */
		JSON("json"),
		/**
		 * XML request
		 */
		XML("xml");

		private String type;

		private RequestType(String type) {
			this.type = type;
		}

		/**
		 * Serializes the request type to string
		 */
		public String toString() {
			return this.type;
		}
	}

	/**
	 * Gets the current request context path
	 * 
	 * @param request
	 *            The HTTP request
	 * @return The context path
	 */
	protected String getRequestContext(HttpServletRequest request) {
		return request.getContextPath();
	}

	/**
	 * Gets the current request path, without context
	 * 
	 * @param request
	 *            The HTTP request
	 * @return The current request path
	 */
	protected String getRequestPath(HttpServletRequest request) {
		String url = request.getRequestURI();
		String context = request.getContextPath();
		if (null == url) {
			url = context;
		}
		return url.substring(context.length());
	}

	/**
	 * Gets the type of request being made
	 * 
	 * @param request
	 *            The HTTP request
	 * @return The type of the request
	 */
	protected RequestType getRequestType(HttpServletRequest request) {
		String url = (String) request.getAttribute("originatingURL");
		if (null == url) {
			url = this.getRequestPath(request);
		}
		return this.getRequestType(url);
	}

	/**
	 * Gets the type of request being made
	 * 
	 * @param path
	 *            The path of the request
	 * @return The type of the request
	 */
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

	/**
	 * Responds to a request by rendering a view
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param templateName
	 *            The name of the view template to render
	 * @param model
	 *            The data to pass to the template
	 * @return An action response
	 * @throws Exception
	 */
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

	/**
	 * Responds to a request by rendering a view
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param viewName
	 *            The name of the view template to render
	 * @return An action response
	 * @throws Exception
	 */
	protected String respondWithView(HttpServletRequest request,
			HttpServletResponse response, String viewName) throws Exception {
		return this.respondWithView(request, response, viewName, null);
	}

	/**
	 * Responds to a request by rendering the model to JSON
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param model
	 *            The data model to serialize
	 * @return An action response
	 * @throws Exception
	 */
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

	/**
	 * Responds to a request by rendering XML
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param model
	 *            The data model to serialize
	 * @return An action response
	 * @throws Exception
	 */
	protected String respondWithXML(HttpServletRequest request,
			HttpServletResponse response, Object model) throws Exception {
		throw new UnsupportedOperationException();
	}

	/**
	 * Responds to a request by either rendering a view (for HTML), serializing
	 * the model to JSON (for JSON) or serializing the model to XML (for XML)
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param viewName
	 *            The name of the view template to render
	 * @param model
	 *            The data to pass to the template
	 * @return An action response
	 * @throws Exception
	 */
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

	/**
	 * Responds to a request by sending a redirect
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param url
	 *            The URL to which to redirect the user
	 * @return An action response
	 * @throws Exception
	 */
	protected String respondWithRedirect(HttpServletRequest request,
			HttpServletResponse response, String url) throws Exception {
		response.sendRedirect(url);
		return "redirect:" + url;
	}

	/**
	 * Responds to a request by sending a cacheable, permanent redirect
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param url
	 *            The URL to which to redirect the user
	 * @return An action response
	 * @throws Exception
	 */
	protected String respondWithPermanentRedirect(HttpServletRequest request,
			HttpServletResponse response, String url) throws Exception {
		response.setStatus(301);
		return this.respondWithRedirect(request, response, url);
	}

	/**
	 * Responds to a request by sending an error
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param errorCode
	 *            The HTTP status code
	 * @return An action response
	 * @throws Exception
	 */
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

	/**
	 * Responds to a request by passing the request to another action (without
	 * sending a redirect back to the client)
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param url
	 *            The URL of the other action
	 * @return An action response
	 * @throws Exception
	 */
	protected String forward(HttpServletRequest request,
			HttpServletResponse response, String url) throws ServletException,
			IOException {
		request.getRequestDispatcher(url).forward(request, response);
		return "";
	}

	/**
	 * Gets a Java message
	 * 
	 * @param request
	 *            The HTTP request
	 * @param key
	 *            The key under which the the message is stored
	 * @param args
	 *            Arguments to substitute into the message
	 * @return The message
	 */
	protected String getMessage(HttpServletRequest request, String key,
			Object... args) {
		return this.getApplicationContext().getMessage(key, args,
				request.getLocale());
	}

	/**
	 * Gets a Java message
	 * 
	 * @param request
	 *            The HTTP request
	 * @param key
	 *            The key under which the the message is stored
	 * @param keyArgs
	 *            Arguments to substitute into the key
	 * @param args
	 *            Arguments to substitute into the message
	 * @return The message
	 */
	protected String getMessage(HttpServletRequest request, String key,
			Object[] keyArgs, Object... args) {
		return this.getMessage(request, String.format(key, keyArgs), args);
	}

	/**
	 * Handles errors that occur during the request/response lifecycle
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param e
	 *            The exception that occurred
	 * @return An action response
	 */
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

	/**
	 * Formats a URL
	 * 
	 * @param basis
	 *            The base of the URL
	 * @param args
	 *            Unescaped arguments to substitute into the basis
	 * @return The formatted URL
	 * @throws UnsupportedEncodingException
	 */
	protected String url(String basis, String... args)
			throws UnsupportedEncodingException {
		Object[] clean = new String[args.length];
		for (int i = 0; i < args.length; i++) {
			clean[i] = URLEncoder.encode(args[i], "utf-8");
		}
		return String.format(basis, clean);
	}

	/**
	 * Sets the Lavaca intitialization parameters
	 * 
	 * @param request
	 *            The HTTP request
	 * @param route
	 *            The initial route
	 * @param title
	 *            The initial page title
	 * @param state
	 *            The initial Lavaca history state
	 * @param params
	 *            Initial parameters for the route
	 */
	protected void setInit(HttpServletRequest request, String route,
			String title, Map<String, ?> state, Map<String, ?> params) {
		this.setInitRoute(request, route);
		this.setInitState(request, title, state);
		this.setInitParams(request, params);
	}

	/**
	 * Sets the initial Lavaca route
	 * 
	 * @param request
	 *            The HTTP request
	 * @param value
	 *            The route
	 */
	protected void setInitRoute(HttpServletRequest request, String value) {
		request.setAttribute("initRoute", value);
	}

	/**
	 * Sets the initial Lavaca history state
	 * 
	 * @param request
	 *            The HTTP request
	 * @param title
	 *            The page title
	 * @param value
	 *            The data model
	 */
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

	/**
	 * Sets the initial Lavaca route parameters
	 * 
	 * @param request
	 *            The HTTP request
	 * @param value
	 *            The parameters
	 */
	protected void setInitParams(HttpServletRequest request,
			Map<String, ?> value) {
		request.setAttribute("initParams", JSONObject.toJSONString(value));
	}

	/**
	 * Obsolete (required for AbstractController)
	 */
	@Override
	protected ModelAndView handleRequestInternal(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return null;
	}

	/**
	 * Gets a translation from the Lavaca translation tables
	 * 
	 * @param key
	 *            The key under which the translated message is stored
	 * @param locale
	 *            The locale of the translation table to use
	 * @param args
	 *            Arguments to substitute into the message
	 * @return The translated message
	 */
	protected String translate(String key, Locale locale, Object... args) {
		return TranslationPackageCache.instance(this.getServletContext())
				.getString(key, locale, args);
	}

	/**
	 * Gets a translation from the Lavaca translation tables
	 * 
	 * @param key
	 *            The key under which the translated message is stored
	 * @param args
	 *            Arguments to substitute into the message
	 * @return The translated message
	 */
	protected String translate(String key, HttpServletRequest request,
			Object... args) {
		return this.translate(key, request.getLocale(), args);
	}

	/**
	 * Renders a template
	 * 
	 * @param request
	 *            The HTTP request
	 * @param response
	 *            The HTTP response
	 * @param templateName
	 *            The name of the template to render
	 * @param model
	 *            The data model to pass to the template
	 * @return The rendered output
	 */
	protected String render(HttpServletRequest request,
			HttpServletResponse response, String templateName, Object model) {
		LavacaDust dust = new LavacaDust(this.getServletContext(), request,
				response);
		LavacaDustCaptureResult result = new LavacaDustCaptureResult();
		dust.render(templateName, model, result);
		if (null != result.getError()) {
			throw new RuntimeException(result.getError());
		} else {
			return result.getOutput();
		}
	}

}
