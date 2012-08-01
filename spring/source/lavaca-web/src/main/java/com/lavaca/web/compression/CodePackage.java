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

/**
 * Base type for Lavaca code packages that are used both client- and server-side
 */
public abstract class CodePackage implements Serializable {

	private static final long serialVersionUID = -7630076390118981687L;

	/**
	 * Finds a code package
	 * 
	 * @param C
	 *            The type of the code package
	 * @param cache
	 *            The cache in which to look
	 * @param key
	 *            The key of the code package
	 * @return The found code package
	 * @throws IOException
	 */
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

	/**
	 * Constructs a new code package
	 * 
	 * @param key
	 *            The key associated with the code package
	 */
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

	/**
	 * Determines whether or not the package is uneditable
	 * 
	 * @return True if data can no longer be added to the package
	 */
	public boolean isSealed() {
		return this.sealed;
	}

	/**
	 * Prevents data from being successively added to the package
	 */
	public void seal() {
		this.sealed = true;
	}

	/**
	 * Retrieves all items that make up the package
	 * 
	 * @return The items in the package
	 */
	public List<CodePackageEntry> getEntries() {
		if (null == this.entries) {
			this.entries = new ArrayList<CodePackageEntry>();
		}
		return this.entries;
	}

	/**
	 * Retrieves the key identifying this package
	 * 
	 * @return The key
	 */
	public String getKey() {
		return this.key;
	}

	/**
	 * Retrieves the date this package was created
	 * 
	 * @return The date the package was created
	 */
	public Date getCreated() {
		return this.created;
	}

	/**
	 * Retrieves the date this package was last compressed
	 * 
	 * @return The date this package was last compressed
	 */
	public Date getLastCompressed() {
		return this.lastCompressed;
	}

	/**
	 * Retrieves the date this package is no longer valid
	 * 
	 * @return The date this package is no longer valid
	 */
	public Date getExpires() {
		return this.expires;
	}

	/**
	 * Concatenates the items of the package
	 * 
	 * @param context
	 *            The current servlet context
	 * @return The concatenated data
	 * @throws IOException
	 */
	protected String combine(ServletContext context) throws IOException {
		StringWriter out = new StringWriter();
		for (CodePackageEntry entry : this.getEntries()) {
			FileUtils.read(context, entry.getPath(), FileUtils.UTF8, out);
		}
		return out.toString();
	}

	/**
	 * Processes the package's contents
	 * 
	 * @param context
	 *            The current servlet context
	 * @return The processed package data
	 * @throws IOException
	 */
	protected String render(ServletContext context) throws IOException {
		return this.compress(this.combine(context));
	}

	/**
	 * Compacts package data
	 * 
	 * @param code
	 *            The data to compact
	 * @return The compressed data
	 * @throws IOException
	 */
	protected abstract String compress(String code) throws IOException;

	private byte[] gzip(String str) throws IOException {
		ByteArrayOutputStream bytes = new ByteArrayOutputStream();
		GZIPOutputStream out = new GZIPOutputStream(bytes);
		out.write(str.getBytes("UTF-16"));
		out.finish();
		out.close();
		return bytes.toByteArray();
	}

	/**
	 * Gets the processed data of this package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param gzipped
	 *            Whether or not the output should have GZIP compression applied
	 * @return The processed data
	 * @throws IOException
	 */
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

	/**
	 * Resets the contents of this package
	 */
	public void reload() {
		this.output = null;
		this.gzipped = null;
		this.lastCompressed = null;
		this.expires = null;
	}

}
