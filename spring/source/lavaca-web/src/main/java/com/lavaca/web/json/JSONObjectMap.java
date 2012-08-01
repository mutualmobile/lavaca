package com.lavaca.web.json;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.Collection;
import java.util.HashSet;
import java.util.Iterator;
import java.util.Map;
import java.util.Set;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Adapter to conform JSONObject to the Map interface
 * 
 * @see org.json.JSONObject
 * @see java.util.Map
 */
public class JSONObjectMap implements Map<String, Object>, Serializable {

	private static final long serialVersionUID = -9182841373363379110L;

	public class Entry implements java.util.Map.Entry<String, Object> {

		private String key;
		private Object value;

		public Entry(String key, Object value) {
			if (value instanceof JSONObject) {
				value = new JSONObjectMap((JSONObject) value);
			} else if (value instanceof JSONArray) {
				value = new JSONArrayList((JSONArray) value);
			}
			this.key = key;
			this.value = value;
		}

		public String getKey() {
			return this.key;
		}

		public Object getValue() {
			return this.value;
		}

		public Object setValue(Object value) {
			this.value = value;
			return this.value;
		}
	}

	private transient JSONObject obj;

	/**
	 * Constructs a JSONObjectMap
	 * 
	 * @param json
	 *            The JSON string
	 * @throws JSONException
	 */
	public JSONObjectMap(String json) throws JSONException {
		this.obj = new JSONObject(json);
	}

	/**
	 * Constructs a JSONObjectMap
	 * 
	 * @param json
	 *            The JSONObject object
	 */
	public JSONObjectMap(JSONObject json) {
		this.obj = json;
	}

	public void clear() {
		throw new UnsupportedOperationException();
	}

	public boolean containsKey(Object key) {
		return this.obj.has((String) key);
	}

	public boolean containsValue(Object arg0) {
		throw new UnsupportedOperationException();
	}

	public Set<java.util.Map.Entry<String, Object>> entrySet() {
		Set<java.util.Map.Entry<String, Object>> result = new HashSet<Map.Entry<String, Object>>();
		@SuppressWarnings("rawtypes")
		Iterator iter = this.obj.keys();
		while (iter.hasNext()) {
			String key = (String) iter.next();
			Object value = this.get(key);
			result.add(new Entry(key, value));
		}
		return result;
	}

	public Object get(Object key) {
		Object result = this.obj.opt((String) key);
		if (null == result || result.equals(null)) {
			return null;
		} else if (result instanceof JSONObject) {
			return new JSONObjectMap((JSONObject) result);
		} else if (result instanceof JSONArray) {
			return new JSONArrayList((JSONArray) result);
		} else {
			return result;
		}
	}

	public boolean isEmpty() {
		return !this.obj.keys().hasNext();
	}

	public Set<String> keySet() {
		Set<String> result = new HashSet<String>();
		@SuppressWarnings("rawtypes")
		Iterator iter = this.obj.keys();
		while (iter.hasNext()) {
			result.add((String) iter.next());
		}
		return result;
	}

	public Object put(String arg0, Object arg1) {
		throw new UnsupportedOperationException();
	}

	public void putAll(Map<? extends String, ? extends Object> arg0) {
		throw new UnsupportedOperationException();
	}

	public Object remove(Object arg0) {
		throw new UnsupportedOperationException();
	}

	public int size() {
		return this.keySet().size();
	}

	public Collection<Object> values() {
		throw new UnsupportedOperationException();
	}

	public boolean equals(Object other) {
		if (other instanceof JSONObjectMap) {
			return this.obj.equals(((JSONObjectMap) other).obj);
		} else if (other instanceof JSONObject) {
			return this.obj.equals(other);
		} else {
			return super.equals(other);
		}
	}

	public String toString() {
		return this.obj.toString();
	}

	private void writeObject(ObjectOutputStream oos) throws IOException {
		oos.defaultWriteObject();
		oos.writeObject(this.obj.toString());
	}

	private void readObject(ObjectInputStream ois)
			throws ClassNotFoundException, IOException {
		ois.defaultReadObject();
		try {
			this.obj = new JSONObject((String) ois.readObject());
		} catch (JSONException e) {
			throw new IllegalStateException(e);
		}
	}

}