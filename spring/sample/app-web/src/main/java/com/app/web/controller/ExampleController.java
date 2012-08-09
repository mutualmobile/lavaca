package com.app.web.controller;

import java.util.HashMap;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ExampleController extends BaseController {

	@RequestMapping("/")
	public String home(HttpServletRequest request, HttpServletResponse response)
			throws Exception {
		return this.respondWithView(request, response, "home");
	}

	@RequestMapping("/example/{variable}")
	public String example(HttpServletRequest request,
			HttpServletResponse response,
			@PathVariable("variable") String variable) throws Exception {
		String fruit = this.translate(variable, request);
		HashMap<String, Object> model = new HashMap<String, Object>();
		model.put("fruit", fruit);
		String bg;
		int column;
		if ("cherry".equals(variable)) {
			bg = "rgba(255,0,0,.1)";
			column = 3;
		} else if ("banana".equals(variable)) {
			bg = "rgba(255,255,0,.1)";
			column = 2;
		} else {
			bg = "rgba(0,255,0,.1)";
			column = 1;
		}
		model.put("bg", bg);
		model.put("column", column);
		if (this.getRequestType(request).equals(RequestType.JSON)) {
			return this.respondWithJSON(request, response, model);
		} else {
			this.setInitRoute(request, this.url("/example/%s", variable));
			this.setInitState(request, this.translate("hello", request, fruit),
					model);
			return this.respondWithView(request, response, "example", model);
		}
	}

	@RequestMapping("/lang")
	public String lang(HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(value = "locale", required = true) String locale)
			throws Exception {
		if (this.getRequestType(request).equals(RequestType.JSON)) {
			HashMap<String, Object> model = new HashMap<String, Object>();
			model.put("success", true);
			Cookie cookie = new Cookie("app-lang", locale);
			cookie.setMaxAge(Integer.MAX_VALUE);
			response.addCookie(cookie);
			return this.respondWithJSON(request, response, model);
		} else {
			return this.respondWithRedirect(request, response,
					this.url("/?lang=%s", locale));
		}
	}

}
