package com.lavaca.web.compression;

import java.io.IOException;

import javax.servlet.ServletContext;

import com.google.javascript.jscomp.CheckLevel;
import com.google.javascript.jscomp.CompilationLevel;
import com.google.javascript.jscomp.Compiler;
import com.google.javascript.jscomp.CompilerOptions;
import com.google.javascript.jscomp.DiagnosticGroups;
import com.google.javascript.jscomp.JSSourceFile;
import com.lavaca.web.caching.JSPackageCache;

/**
 * Lavaca script file package
 */
public class JSPackage extends CodePackage {

	private static final long serialVersionUID = 7851760396047219079L;

	/**
	 * Retrieves a cached script file package
	 * 
	 * @param context
	 *            The current servlet context
	 * @param key
	 *            The identifier for the script file package
	 * @return The cached script file package
	 * @throws IOException
	 */
	public static CodePackage get(ServletContext context, String key)
			throws IOException {
		return CodePackage.get(JSPackage.class,
				JSPackageCache.instance(context), key);
	}

	/**
	 * Constructs a new script package
	 * 
	 * @param key
	 *            The identifier for that package
	 */
	public JSPackage(String key) {
		super(key);
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
	protected String compress(String code) {
		Compiler compiler = new Compiler();
		CompilerOptions options = new CompilerOptions();
		CompilationLevel.SIMPLE_OPTIMIZATIONS
				.setOptionsForCompilationLevel(options);
		options.setWarningLevel(DiagnosticGroups.FILEOVERVIEW_JSDOC,
				CheckLevel.OFF);
		options.setWarningLevel(DiagnosticGroups.NON_STANDARD_JSDOC,
				CheckLevel.OFF);
		JSSourceFile input = JSSourceFile.fromCode("input.js", code);
		compiler.compile(JSSourceFile.fromCode("externs.js", ""), input,
				options);
		return compiler.toSource();
	}

}
