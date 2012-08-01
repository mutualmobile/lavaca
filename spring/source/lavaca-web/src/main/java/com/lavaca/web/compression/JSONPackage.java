package com.lavaca.web.compression;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Base type for JSON-based Lavaca packages
 */
public abstract class JSONPackage extends CodePackage {

	private static final long serialVersionUID = -7219737997075224389L;

	/**
	 * Constructs a new JSON package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public JSONPackage(String key) {
		super(key);
	}

	private JSONObject data;

	/**
	 * Gets the data associated with the package
	 * 
	 * @return The JSON data
	 */
	public JSONObject getData() {
		return data;
	}

	/**
	 * Sets the data associated with the package
	 * 
	 * @param data
	 *            The new data
	 */
	public void setData(JSONObject data) {
		this.data = data;
	}

	/**
	 * Compacts package data
	 * 
	 * @param code
	 *            The data to compact
	 * @return The compressed data
	 * @throws IOException
	 */
	@Override
	protected String compress(String code) throws IOException {
		try {
			this.data = new JSONObject(code);
		} catch (JSONException e) {
			throw new IOException(e);
		}
		return this.data.toString();
	}

	/**
	 * Gets a value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or null if no such value exists)
	 */
	public Object get(String name) {
		return this.getData().opt(name);
	}

	/**
	 * Gets a string value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or null if no such value exists)
	 */
	public String getString(String name) {
		return this.getData().optString(name);
	}

	/**
	 * Gets a boolean value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or false if no such value exists)
	 */
	public boolean getBoolean(String name) {
		return this.getData().optBoolean(name);
	}

	/**
	 * Gets an integer value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or 0 if no such value exists)
	 */
	public int getInt(String name) {
		return this.getData().optInt(name);
	}

	/**
	 * Gets a long value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or 0L if no such value exists)
	 */
	public long getLong(String name) {
		return this.getData().optLong(name);
	}

	/**
	 * Gets a double value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or 0d if no such value exists)
	 */
	public double getDouble(String name) {
		return this.getData().optDouble(name);
	}

	/**
	 * Gets an array value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or null if no such value exists)
	 */
	public JSONArray getArray(String name) {
		return this.getData().optJSONArray(name);
	}

	/**
	 * Gets an object value from the data
	 * 
	 * @param name
	 *            The key under which the value is stored
	 * @return The value (or null if no such value exists)
	 */
	public JSONObject getObject(String name) {
		return this.getData().optJSONObject(name);
	}

	/**
	 * Serializes the package to JSON
	 * 
	 * @return The JSON string
	 */
	@Override
	public String toString() {
		return this.getData().toString();
	}

}
