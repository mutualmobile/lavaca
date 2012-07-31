package com.lavaca.web.ui.templating;

import java.util.ArrayList;
import java.util.List;

import com.heydanno.xdust.Context;
import com.heydanno.xdust.IXDustHelper;
import com.heydanno.xdust.RenderChain;
import com.heydanno.xdust.XDust;
import com.heydanno.xdust.XDustHelperNode;
import com.heydanno.xdust.XDustLogicNode;
import com.lavaca.web.caching.TranslationPackageCache;

/**
 * XDust helper extension that allows the inclusion of Lavaca translations
 */
public class LavacaDustTranslationHelper implements IXDustHelper {

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
		String name = node.renderBody(dust, XDustLogicNode.BLOCK, chain,
				context, model);
		List<Object> args = new ArrayList<Object>();
		for (int i = 0, j = node.getParameters().keySet().size(); i < j; i++) {
			String key = "p" + Integer.toString(i);
			if (context.getParameters().containsKey(key)) {
				try {
					args.add(node.getParameters().get(key)
							.render(dust, chain, context, model));
				} catch (Exception e) {
					throw new RuntimeException(e);
				}
			} else {
				break;
			}
		}
		return TranslationPackageCache.instance(lvDust.getServletContext())
				.getString(name, lvDust.getRequest().getLocale(),
						args.toArray());
	}

}
