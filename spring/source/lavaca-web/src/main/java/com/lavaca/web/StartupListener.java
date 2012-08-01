package com.lavaca.web;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.lavaca.web.config.LavacaConfig;
import com.lavaca.web.ui.templating.LavacaDust;

/**
 * Class responsible for setting up the application when it is started
 */
public class StartupListener implements ServletContextListener {

	/**
	 * Executed when the application is stopped
	 * 
	 * @param e
	 *            The servlet context event
	 */
	public void contextDestroyed(ServletContextEvent e) {
		// Do nothing
	}

	/**
	 * Executed when the application is started
	 * 
	 * @param e
	 *            The servlet context event
	 */
	public void contextInitialized(ServletContextEvent e) {
		ServletContext sc = e.getServletContext();
		LavacaConfig.instance(sc).load(sc);
		LavacaDust.load(sc);
	}

}
