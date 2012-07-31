package com.lavaca.web;

import javax.servlet.ServletContext;
import javax.servlet.ServletContextEvent;
import javax.servlet.ServletContextListener;

import com.lavaca.web.config.LavacaConfig;
import com.lavaca.web.ui.templating.LavacaDust;

public class StartupListener implements ServletContextListener {

	public void contextDestroyed(ServletContextEvent e) {
		// TODO Auto-generated method stub

	}

	public void contextInitialized(ServletContextEvent e) {
		ServletContext sc = e.getServletContext();
		LavacaConfig.instance(sc).load(sc);
		LavacaDust.load(sc);
	}

}
