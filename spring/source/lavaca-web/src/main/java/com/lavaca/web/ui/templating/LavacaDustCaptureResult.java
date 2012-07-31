package com.lavaca.web.ui.templating;

import com.heydanno.xdust.IXDustResult;

public class LavacaDustCaptureResult implements IXDustResult {

	private Exception error;
	private String output;

	public Exception getError() {
		return error;
	}

	public String getOutput() {
		return output;
	}

	public void call(Exception error, String output) {
		this.error = error;
		this.output = output;
	}

}
