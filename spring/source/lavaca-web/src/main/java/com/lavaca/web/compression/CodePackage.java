package com.lavaca.web.compression;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.Serializable;
import java.io.StringWriter;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.GregorianCalendar;
import java.util.List;
import java.util.zip.GZIPOutputStream;

import javax.servlet.ServletContext;

import com.lavaca.web.caching.Cache;
import com.lavaca.web.util.FileUtils;

public abstract class CodePackage implements Serializable {

	private static final long serialVersionUID = -7630076390118981687L;

	@SuppressWarnings("unchecked")
	public static <T extends CodePackage, H extends Cache<String, CodePackage>> T get(
			Class<T> C, H cache, String key) throws IOException {
		try {
			CodePackage cp = cache.get(key);
			if (cp == null) {
				cp = C.getConstructor(String.class).newInstance(key);
				cache.put(key, cp);
			}
			return (T) cp;
		} catch (Exception e) {
			throw new IOException(e);
		}
	}

	public CodePackage(String key) {
		this.key = key;
		this.created = GregorianCalendar.getInstance().getTime();
	}

	private List<CodePackageEntry> entries;
	private String output;
	private byte[] gzipped;
	private String key;
	private Date created;
	private Date lastCompressed;
	private Date expires;
	private boolean sealed;

	public boolean isSealed() {
		return this.sealed;
	}

	public void seal() {
		this.sealed = true;
	}

	public List<CodePackageEntry> getEntries() {
		if (null == this.entries) {
			this.entries = new ArrayList<CodePackageEntry>();
		}
		return this.entries;
	}

	public String getKey() {
		return this.key;
	}

	public Date getCreated() {
		return this.created;
	}

	public Date getLastCompressed() {
		return this.lastCompressed;
	}

	public Date getExpires() {
		return this.expires;
	}

	protected String combine(ServletContext context) throws IOException {
		StringWriter out = new StringWriter();
		for (CodePackageEntry entry : this.getEntries()) {
			FileUtils.read(context, entry.getPath(), FileUtils.UTF8, out);
		}
		return out.toString();
	}

	protected String render(ServletContext context) throws IOException {
		return this.compress(this.combine(context));
	}

	protected abstract String compress(String code) throws IOException;

	private byte[] gzip(String str) throws IOException {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		GZIPOutputStream out = new GZIPOutputStream(bytes);
		out.write(str.getBytes("UTF-16"));
		out.finish();
		out.close();
		return bytes.toByteArray();
	}

	public Object getOutput(ServletContext context, boolean gzipped)
			throws IOException {
		if (null == this.output) {
			synchronized ("output") {
				if (null == this.output) {
					this.seal();
					this.output = this.render(context);
					this.gzipped = this.gzip(this.output);
					this.lastCompressed = GregorianCalendar.getInstance()
							.getTime();
					Calendar expires = GregorianCalendar.getInstance();
					expires.set(Calendar.YEAR, expires.get(Calendar.YEAR) + 2);
					this.expires = expires.getTime();
				}
			}
		}
		return gzipped ? this.gzipped : this.output;
	}

	public void reload() {
		this.output = null;
		this.gzipped = null;
		this.lastCompressed = null;
		this.expires = null;
	}

}
