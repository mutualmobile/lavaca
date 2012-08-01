package com.app.web;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;

public final class AppConfig {

	private AppConfig() {

	}

	@Autowired
	private Environment env;

	@Value("${app.debug}")
	private Boolean debug;

	@Value("${app.compress}")
	private Boolean compress;

	@Value("${app.inline}")
	private Boolean inline;

	@Value("${target}")
	private String target;

	public static AppConfig instance(ApplicationContext context) {
		return context.getBean(AppConfig.class);
	}

	public boolean isDebug() {
		return null != this.debug && this.debug.booleanValue();
	}

	public boolean isCompress() {
		return !this.isDebug() && null != this.compress
				&& this.compress.booleanValue();
	}

	public boolean isInline() {
		return !this.isDebug() && null != this.inline
				&& this.inline.booleanValue();
	}

	public String getTarget() {
		return this.target;
	}

	public <T> T getProperty(String name, Class<T> C) {
		return this.env.getProperty(name, C);
	}

	public boolean getBooleanProperty(String name) {
		Boolean value = this.getProperty(name, Boolean.class);
		if (null == value) {
			return false;
		} else {
			return value.booleanValue();
		}
	}

	public double getDoubleProperty(String name) {
		Double value = this.getProperty(name, Double.class);
		if (null == value) {
			return 0;
		} else {
			return value.doubleValue();
		}
	}

	public int getIntegerProperty(String name) {
		Integer value = this.getProperty(name, Integer.class);
		if (null == value) {
			return 0;
		} else {
			return value.intValue();
		}
	}

	public long getLongProperty(String name) {
		Long value = this.getProperty(name, Long.class);
		if (null == value) {
			return 0L;
		} else {
			return value.longValue();
		}
	}

	public String getStringProperty(String name) {
		return this.getProperty(name, String.class);
	}

}
