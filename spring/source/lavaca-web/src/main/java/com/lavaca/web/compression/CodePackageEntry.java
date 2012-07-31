package com.lavaca.web.compression;

public class CodePackageEntry {

	public CodePackageEntry() {

	}

	public CodePackageEntry(String key, String path) {
		this.setKey(key);
		this.setPath(path);
	}

	private String key;
	private String path;

	public String getKey() {
		return key;
	}

	public void setKey(String key) {
		this.key = key;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}

}
