package com.lavaca.web.config;

import java.security.InvalidParameterException;
import java.util.ArrayList;
import java.util.List;

import javax.servlet.ServletContext;

import org.springframework.context.ApplicationContext;
import org.springframework.web.context.support.WebApplicationContextUtils;

import com.lavaca.web.compression.CSSPackage;
import com.lavaca.web.compression.CodePackage;
import com.lavaca.web.compression.CodePackageEntry;
import com.lavaca.web.compression.ConfigPackage;
import com.lavaca.web.compression.DustTemplatePackage;
import com.lavaca.web.compression.JSPackage;
import com.lavaca.web.compression.TranslationPackage;
import com.lavaca.web.config.xml.XMLConfigs;
import com.lavaca.web.config.xml.XMLEntry;
import com.lavaca.web.config.xml.XMLPackage;
import com.lavaca.web.config.xml.XMLScripts;
import com.lavaca.web.config.xml.XMLStyles;
import com.lavaca.web.config.xml.XMLTemplate;
import com.lavaca.web.config.xml.XMLTemplates;
import com.lavaca.web.config.xml.XMLTranslation;
import com.lavaca.web.config.xml.XMLTranslations;

/**
 * Utility for managing the Lavaca server-side configuration
 */
public class LavacaConfig {

	/**
	 * Gets an instance of the configuration
	 * 
	 * @param context
	 *            The current application context
	 * @return The config bean defined in the root-context.xml
	 */
	public static LavacaConfig instance(ApplicationContext context) {
		return context.getBean(LavacaConfig.class);
	}

	/**
	 * Gets an instance of the configuration
	 * 
	 * @param context
	 *            The current servlet context
	 * @return The config bean defined in the root-context.xml
	 */
	public static LavacaConfig instance(ServletContext context) {
		return instance(WebApplicationContextUtils
				.getWebApplicationContext(context));
	}

	private String configsXmlPath;
	private String scriptsXmlPath;
	private String stylesXmlPath;
	private String templatesXmlPath;
	private String translationsXmlPath;
	private String[] configKeys;
	private String[] scriptKeys;
	private String[] styleKeys;
	private String[] templateKeys;
	private String[] translationKeys;
	private String shellViewName;

	/**
	 * Get all keys available for Lavaca config files
	 * 
	 * @return The keys
	 */
	public String[] getConfigKeys() {
		return configKeys;
	}

	/**
	 * Get all keys available for Lavaca script files
	 * 
	 * @return The keys
	 */
	public String[] getScriptKeys() {
		return scriptKeys;
	}

	/**
	 * Get all keys available for Lavaca style files
	 * 
	 * @return The keys
	 */
	public String[] getStyleKeys() {
		return styleKeys;
	}

	/**
	 * Get all keys available for Lavaca template files
	 * 
	 * @return The keys
	 */
	public String[] getTemplateKeys() {
		return templateKeys;
	}

	/**
	 * Get all keys available for Lavaca translation files
	 * 
	 * @return The keys
	 */
	public String[] getTranslationKeys() {
		return translationKeys;
	}

	/**
	 * Gets the path associated with the Lavaca configs XML file
	 * 
	 * @return The file path
	 */
	public String getConfigsXmlPath() {
		return configsXmlPath;
	}

	/**
	 * Sets the path associated with the Lavaca configs XML file
	 * 
	 * @param configsXmlPath
	 *            The file path
	 */
	public void setConfigsXmlPath(String configsXmlPath) {
		this.configsXmlPath = configsXmlPath;
	}

	/**
	 * Gets the path associated with the Lavaca scripts XML file
	 * 
	 * @return The file path
	 */
	public String getScriptsXmlPath() {
		return scriptsXmlPath;
	}

	/**
	 * Sets the path associated with the Lavaca scripts XML file
	 * 
	 * @param scriptsXmlPath
	 *            The file path
	 */
	public void setScriptsXmlPath(String scriptsXmlPath) {
		this.scriptsXmlPath = scriptsXmlPath;
	}

	/**
	 * Gets the path associated with the Lavaca styles XML file
	 * 
	 * @return The file path
	 */
	public String getStylesXmlPath() {
		return stylesXmlPath;
	}

	/**
	 * Sets the path associated with the Lavaca styles XML file
	 * 
	 * @param stylesXmlPath
	 *            The file path
	 */
	public void setStylesXmlPath(String stylesXmlPath) {
		this.stylesXmlPath = stylesXmlPath;
	}

	/**
	 * Gets the path associated with the Lavaca templates XML file
	 * 
	 * @return The file path
	 */
	public String getTemplatesXmlPath() {
		return templatesXmlPath;
	}

	/**
	 * Sets the path associated with the Lavaca templates XML file
	 * 
	 * @param templatesXmlPath
	 *            The file path
	 */
	public void setTemplatesXmlPath(String templatesXmlPath) {
		this.templatesXmlPath = templatesXmlPath;
	}

	/**
	 * Gets the path associated with the Lavaca translations XML file
	 * 
	 * @return The file path
	 */
	public String getTranslationsXmlPath() {
		return translationsXmlPath;
	}

	/**
	 * Sets the path associated with the Lavaca translations XML file
	 * 
	 * @param translationsXmlPath
	 *            The file path
	 */
	public void setTranslationsXmlPath(String translationsXmlPath) {
		this.translationsXmlPath = translationsXmlPath;
	}

	/**
	 * Gets the name of the wrapper JSP used by Lavaca
	 * 
	 * @return The name of the wrapper JSP
	 */
	public String getShellViewName() {
		return shellViewName;
	}

	/**
	 * Gets the name of the wrapper JSP used by Lavaca
	 * 
	 * @param shellViewName
	 *            The name of the wrapper JSP
	 */
	public void setShellViewName(String shellViewName) {
		this.shellViewName = shellViewName;
	}

	/**
	 * Loads the Lavaca application and code packages
	 * 
	 * @param context
	 *            The current servlet context
	 */
	public void load(ServletContext context) {
		try {
			List<String> keys;
			XMLConfigs configsXml = XMLConfigs.parse(context.getRealPath(this
					.getConfigsXmlPath()));
			keys = new ArrayList<String>();
			for (XMLEntry entry : configsXml.getConfigs()) {
				System.out.printf("Loading config %s...\n", entry.getName());
				CodePackage cp = ConfigPackage.get(context, entry.getName());
				cp.getEntries()
						.add(new CodePackageEntry(null, entry.getPath()));
				cp.getOutput(context, false);
				keys.add(entry.getName());
			}
			this.configKeys = keys.toArray(new String[] {});
			XMLScripts scriptsXml = XMLScripts.parse(context.getRealPath(this
					.getScriptsXmlPath()));
			keys = new ArrayList<String>();
			for (XMLPackage entry : scriptsXml.getPackages()) {
				System.out.printf("Loading script bundle %s...\n",
						entry.getName());
				CodePackage cp = JSPackage.get(context, entry.getName());
				for (String file : entry.getFiles()) {
					cp.getEntries().add(new CodePackageEntry(null, file));
				}
				cp.getOutput(context, false);
				keys.add(entry.getName());
			}
			this.scriptKeys = keys.toArray(new String[] {});
			XMLStyles stylesXml = XMLStyles.parse(context.getRealPath(this
					.getStylesXmlPath()));
			keys = new ArrayList<String>();
			for (XMLPackage entry : stylesXml.getPackages()) {
				System.out.printf("Loading style bundle %s...\n",
						entry.getName());
				CodePackage cp = CSSPackage.get(context, entry.getName());
				for (String file : entry.getFiles()) {
					cp.getEntries().add(new CodePackageEntry(null, file));
				}
				cp.getOutput(context, false);
				keys.add(entry.getName());
			}
			this.styleKeys = keys.toArray(new String[] {});
			XMLTemplates templatesXml = XMLTemplates.parse(context
					.getRealPath(this.getTemplatesXmlPath()));
			keys = new ArrayList<String>();
			for (XMLTemplate template : templatesXml.getTemplates()) {
				System.out.printf("Loading template %s...\n",
						template.getName());
				CodePackage cp;
				if ("dust".equals(template.getType())) {
					cp = DustTemplatePackage.get(context, template.getName());
				} else {
					throw new InvalidParameterException();
				}
				cp.getEntries().add(
						new CodePackageEntry(null, template.getPath()));
				cp.getOutput(context, false);
				keys.add(template.getName());
			}
			this.templateKeys = keys.toArray(new String[] {});
			XMLTranslations translationsXml = XMLTranslations.parse(context
					.getRealPath(this.getTranslationsXmlPath()));
			keys = new ArrayList<String>();
			for (XMLTranslation translation : translationsXml.getTranslations()) {
				String key = translation.getLocale().toString();
				System.out.printf("Loading translation %s...\n", key);
				CodePackage cp = TranslationPackage.get(context, key);
				cp.getEntries().add(
						new CodePackageEntry(null, translation.getPath()));
				cp.getOutput(context, false);
				keys.add(key);
			}
			this.translationKeys = keys.toArray(new String[] {});
		} catch (Exception e) {
			throw new IllegalStateException(e);
		}
	}
}
