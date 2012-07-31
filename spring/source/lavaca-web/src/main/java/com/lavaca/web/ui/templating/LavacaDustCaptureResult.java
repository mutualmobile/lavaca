package com.lavaca.web.ui.templating;

import com.heydanno.xdust.IXDustResult;

/**
 * Type used for capturing rendered template output
 */
public class LavacaDustCaptureResult implements IXDustResult {

	private Exception error;
	private String output;

	/**
	 * Gets an error caused by the rendering operation (if any)
	 * 
	 * @return The error or null
	 */
	public Exception getError() {
		return error;
	}

	/**
	 * Gets the string output from the rendering operation (if any)
	 * 
	 * @return The string output
	 */
	public String getOutput() {
		return output;
	}

	/**
	 * Captures the result of a rendering operation
	 * 
	 * @param error
	 *            An error that occurred during rendering
	 * @param output
	 *            The string output of the rendering operation
	 */
	public void call(Exception error, String output) {
		this.error = error;
		this.output = output;
	}

}
