package com.app.web.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class AuthenticationController extends BaseController {

	@RequestMapping("/sign-in")
	public String signIn(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return this.respondWithView(request, response, "sign-in");
	}

	@RequestMapping("/sign-in/submit")
	public String signInSubmit(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return this.respondWithView(request, response, "welcome");
	}

	@RequestMapping("/sign-out")
	public String signOut(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return this.respondWithView(request, response, "home");
	}

	@RequestMapping("/welcome")
	public String welcome(HttpServletRequest request,
			HttpServletResponse response) throws Exception {
		return this.respondWithView(request, response, "welcome");
	}

}
