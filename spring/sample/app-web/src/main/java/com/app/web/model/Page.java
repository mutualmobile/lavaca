package com.app.web.model;

public class Page {

	public Page() {

	}

	private String title;
	private Meta meta;

	public String getTitle() {
		return this.title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public Meta getMeta() {
		if (null == this.meta) {
			this.meta = new Meta();
		}
		return this.meta;
	}

}
