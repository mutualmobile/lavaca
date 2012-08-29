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
		HashMap<String, Object> model = new HashMap<String, Object>();
		this.setInit(request, this.getRequestPath(request),
				this.translate("home_headline", request, new Object[] {}), model, null);
		return this.respond(request, response, "home", model);
	}

	@RequestMapping("/example/{variable}")
	public String example(HttpServletRequest request,
			HttpServletResponse response,
			@PathVariable("variable") String variable) throws Exception {
		String fruit = this.translate(variable, request);
		HashMap<String, Object> model = new HashMap<String, Object>();
		model.put("fruit", fruit);
		String bg;
		if ("cherry".equals(variable)) {
			bg = "rgba(255,0,0,.1)";
		} else if ("banana".equals(variable)) {
			bg = "rgba(255,255,0,.1)";
		} else {
			bg = "rgba(0,255,0,.1)";
		}
		model.put("bg", bg);
		this.setInit(request, this.getRequestPath(request),
				this.translate("hello", request, fruit), model, null);
		return this.respond(request, response, "example", model);
	}

	@RequestMapping("/lang")
	public String lang(HttpServletRequest request,
			HttpServletResponse response,
			@RequestParam(value = "locale", required = true) String locale)
			throws Exception {
		if (this.getRequestType(request).equals(RequestType.JSON)) {
			HashMap<String, Object> model = new HashMap<String, Object>();
			model.put("success", true);
			model.put("redirect", this.url("/?lang=%s", locale));
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
