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

public class LavacaConfig {

	public static LavacaConfig instance(ApplicationContext context) {
		return context.getBean(LavacaConfig.class);
	}

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

	public String[] getConfigKeys() {
		return configKeys;
	}

	public String[] getScriptKeys() {
		return scriptKeys;
	}

	public String[] getStyleKeys() {
		return styleKeys;
	}

	public String[] getTemplateKeys() {
		return templateKeys;
	}

	public String[] getTranslationKeys() {
		return translationKeys;
	}

	public String getConfigsXmlPath() {
		return configsXmlPath;
	}

	public void setConfigsXmlPath(String configsXmlPath) {
		this.configsXmlPath = configsXmlPath;
	}

	public String getScriptsXmlPath() {
		return scriptsXmlPath;
	}

	public void setScriptsXmlPath(String scriptsXmlPath) {
		this.scriptsXmlPath = scriptsXmlPath;
	}

	public String getStylesXmlPath() {
		return stylesXmlPath;
	}

	public void setStylesXmlPath(String stylesXmlPath) {
		this.stylesXmlPath = stylesXmlPath;
	}

	public String getTemplatesXmlPath() {
		return templatesXmlPath;
	}

	public void setTemplatesXmlPath(String templatesXmlPath) {
		this.templatesXmlPath = templatesXmlPath;
	}

	public String getTranslationsXmlPath() {
		return translationsXmlPath;
	}

	public void setTranslationsXmlPath(String translationsXmlPath) {
		this.translationsXmlPath = translationsXmlPath;
	}

	public String getShellViewName() {
		return shellViewName;
	}

	public void setShellViewName(String shellViewName) {
		this.shellViewName = shellViewName;
	}

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
