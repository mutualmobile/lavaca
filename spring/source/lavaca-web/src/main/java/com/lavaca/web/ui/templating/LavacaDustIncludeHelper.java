package com.lavaca.web.ui.templating;

import com.heydanno.xdust.Context;
import com.heydanno.xdust.IXDustHelper;
import com.heydanno.xdust.RenderChain;
import com.heydanno.xdust.XDust;
import com.heydanno.xdust.XDustHelperNode;
import com.lavaca.web.caching.DustCache;

/**
 * XDust helper extension that allows the inclusion of other templates
 */
public class LavacaDustIncludeHelper implements IXDustHelper {

	/**
	 * Renders the helper node
	 * 
	 * @param dust
	 *            The current rendering engine instance
	 * @param chain
	 *            The current node chain being rendered
	 * @param context
	 *            The data context chain
	 * @param model
	 *            The data model
	 */
	public String render(XDust dust, RenderChain chain, Context context,
			Object model) {
		LavacaDust lvDust = (LavacaDust) dust;
		XDustHelperNode node = (XDustHelperNode) chain.getTail();
		String name = node.getParameters().get("name")
				.render(lvDust, chain, context, model);
		try {
			return DustCache.instance(lvDust.getServletContext()).get(name)
					.render(lvDust, chain, context, model);
		} catch (Exception e) {
			throw new RuntimeException(e);
		}
	}

}
