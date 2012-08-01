package com.app.web.controller;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ErrorController extends BaseController {

	@RequestMapping("/error/{errorCode}")
	public String error(HttpServletRequest request,
			HttpServletResponse response,
			@PathVariable("errorCode") int errorCode) throws Exception {
		String errorMessage = this.getMessage(request,
				"error." + Integer.toString(errorCode), errorCode);
		if (null == errorMessage || "".equals(errorMessage)) {
			errorMessage = this.getMessage(request, "error.catchcall",
					errorCode);
		}
		request.setAttribute("errorCode", errorCode);
		request.setAttribute("errorMessage", errorMessage);
		response.setStatus(errorCode);
		if (this.getRequestType(request).equals(RequestType.HTML)) {
			return this.respondWithView(request, response, "home");
		} else {
			return null;
		}
	}

}
