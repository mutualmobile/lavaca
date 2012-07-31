package com.lavaca.web.compression;

/**
 * An item that exists within a code package, representing a single file
 */
public class CodePackageEntry {

	/**
	 * Constructs a new item
	 */
	public CodePackageEntry() {

	}

	/**
	 * Constructs a new item
	 * 
	 * @param key
	 *            The identifier for the entry
	 * @param path
	 *            The file path associated with the entry
	 */
	public CodePackageEntry(String key, String path) {
		this.setKey(key);
		this.setPath(path);
	}

	private String key;
	private String path;

	/**
	 * Gets the identifier associated with the entry
	 * 
	 * @return The entry's key
	 */
	public String getKey() {
		return key;
	}

	/**
	 * Sets the identifier associated with the entry
	 * 
	 * @param key
	 *            The entry's new key
	 */
	public void setKey(String key) {
		this.key = key;
	}

	/**
	 * Gets the file path associated with the entry
	 * 
	 * @return The entry's file path
	 */
	public String getPath() {
		return path;
	}

	/**
	 * Sets the file path associated with the entry
	 * 
	 * @param path
	 *            The entry's new file path
	 */
	public void setPath(String path) {
		this.path = path;
	}

}
