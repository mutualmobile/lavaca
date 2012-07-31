package com.lavaca.web.json;

import java.io.IOException;
import java.io.ObjectInputStream;
import java.io.ObjectOutputStream;
import java.io.Serializable;
import java.util.Collection;
import java.util.Iterator;
import java.util.List;
import java.util.ListIterator;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

/**
 * Adapter to conform JSONArray to the List interface
 * 
 * @see org.json.JSONArray
 * @see java.util.List
 */
public class JSONArrayList implements List<Object>, Serializable {

	private static final long serialVersionUID = -7211232865041169646L;

	public class JSONArrayIterator implements ListIterator<Object> {

		private int current = 0;
		private JSONArrayList array;

		public JSONArrayIterator(JSONArrayList array) {
			this.array = array;
		}

		public JSONArrayIterator(JSONArrayList array, int offset) {
			this.array = array;
			this.current = offset;
		}

		public boolean hasNext() {
			return this.current < this.array.size();
		}

		public Object next() {
			return this.array.get(this.current++);
		}

		public void remove() {
			throw new UnsupportedOperationException();
		}

		public void add(Object arg0) {
			throw new UnsupportedOperationException();
		}

		public boolean hasPrevious() {
			return this.current != 0;
		}

		public int nextIndex() {
			return this.current + 1;
		}

		public Object previous() {
			return this.array.get(this.current - 1);
		}

		public int previousIndex() {
			return this.current - 1;
		}

		public void set(Object arg0) {
			throw new UnsupportedOperationException();
		}

	}

	private transient JSONArray obj;

	/**
	 * Constructs a JSONArrayList
	 * @param json The JSON string
	 * @throws JSONException
	 */
	public JSONArrayList(String json) throws JSONException {
		this.obj = new JSONArray(json);
	}

	/**
	 * Constructs a JSONArrayList
	 * @param json The JSONArray object
	 */
	public JSONArrayList(JSONArray json) {
		this.obj = json;
	}

	public boolean add(Object arg0) {
		throw new UnsupportedOperationException();
	}

	public boolean addAll(Collection<? extends Object> arg0) {
		throw new UnsupportedOperationException();
	}

	public void clear() {
		throw new UnsupportedOperationException();
	}

	public boolean contains(Object arg0) {
		for (int i = 0, j = this.obj.length(); i < j; i++) {
			Object value = this.get(i);
			if ((null == value && null == arg0)
					|| (null != value && value.equals(arg0))) {
				return true;
			}
		}
		return false;
	}

	public boolean containsAll(Collection<?> arg0) {
		for (Object item : arg0) {
			if (!this.contains(item)) {
				return false;
			}
		}
		return true;
	}

	public boolean isEmpty() {
		return this.obj.length() == 0;
	}

	public Iterator<Object> iterator() {
		return new JSONArrayIterator(this);
	}

	public boolean remove(Object arg0) {
		throw new UnsupportedOperationException();
	}

	public boolean removeAll(Collection<?> arg0) {
		throw new UnsupportedOperationException();
	}

	public boolean retainAll(Collection<?> arg0) {
		throw new UnsupportedOperationException();
	}

	public int size() {
		return this.obj.length();
	}

	public Object[] toArray() {
		Object[] result = new Object[this.obj.length()];
		for (int i = 0, j = this.obj.length(); i < j; i++) {
			result[i] = this.get(i);
		}
		return result;
	}

	@SuppressWarnings("unchecked")
	public <T> T[] toArray(T[] arg0) {
		return (T[]) this.toArray();
	}

	public void add(int arg0, Object arg1) {
		throw new UnsupportedOperationException();
	}

	public boolean addAll(int arg0, Collection<? extends Object> arg1) {
		throw new UnsupportedOperationException();
	}

	public Object get(int arg0) {
		Object result = this.obj.opt(arg0);
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

	public int indexOf(Object arg0) {
		for (int i = 0, j = this.size(); i < j; i++) {
			Object value = this.get(i);
			if ((null != value && value.equals(arg0))
					|| (null == value && null == arg0)) {
				return i;
			}
		}
		return -1;
	}

	public int lastIndexOf(Object arg0) {
		for (int i = this.size() - 1; i > -1; i--) {
			Object value = this.get(i);
			if ((null != value && value.equals(arg0))
					|| (null == value && null == arg0)) {
				return i;
			}
		}
		return -1;
	}

	public ListIterator<Object> listIterator() {
		return new JSONArrayIterator(this);
	}

	public ListIterator<Object> listIterator(int arg0) {
		return new JSONArrayIterator(this, arg0);
	}

	public Object remove(int arg0) {
		throw new UnsupportedOperationException();
	}

	public Object set(int arg0, Object arg1) {
		throw new UnsupportedOperationException();
	}

	public List<Object> subList(int arg0, int arg1) {
		throw new UnsupportedOperationException();
	}

	public boolean equals(Object other) {
		if (other instanceof JSONArrayList) {
			return this.obj.equals(((JSONArrayList) other).obj);
		} else if (other instanceof JSONArray) {
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
			this.obj = new JSONArray((String) ois.readObject());
		} catch (JSONException e) {
			throw new IllegalStateException(e);
		}
	}

}
