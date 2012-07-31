package com.lavaca.web.compression;

import java.io.IOException;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public abstract class JSONPackage extends CodePackage {

	private static final long serialVersionUID = -7219737997075224389L;

	public JSONPackage(String key) {
		super(key);
	}

	private JSONObject data;

	public JSONObject getData() {
		return data;
	}

	public void setData(JSONObject data) {
		this.data = data;
	}

	@Override
	protected String compress(String code) throws IOException {
		try {
			this.data = new JSONObject(code);
		} catch (JSONException e) {
			throw new IOException(e);
		}
		return this.data.toString();
	}

	public Object get(String name) {
		return this.getData().opt(name);
	}

	public String getString(String name) {
		return this.getData().optString(name);
	}

	public boolean getBoolean(String name) {
		return this.getData().optBoolean(name);
	}

	public int getInt(String name) {
		return this.getData().optInt(name);
	}

	public long getLong(String name) {
		return this.getData().optLong(name);
	}

	public double getDouble(String name) {
		return this.getData().optDouble(name);
	}

	public JSONArray getArray(String name) {
		return this.getData().optJSONArray(name);
	}

	public JSONObject getObject(String name) {
		return this.getData().optJSONObject(name);
	}

	@Override
	public String toString() {
		return this.getData().toString();
	}

}
