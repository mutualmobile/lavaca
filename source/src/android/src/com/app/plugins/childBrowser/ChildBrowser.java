/*
 * PhoneGap is available under *either* the terms of the modified BSD license *or* the
 * MIT License (2008). See http://opensource.org/licenses/alphabetical for full text.
 *
 * Copyright (c) 2005-2011, Nitobi Software Inc.
 * Copyright (c) 2010-2011, IBM Corporation
 */
package com.app.plugins.childBrowser;

import java.io.IOException;
import java.io.InputStream;

import org.apache.cordova.DroidGap;
import org.apache.cordova.api.CordovaInterface;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.R;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Typeface;
import android.net.Uri;
import android.util.Log;
import android.view.Gravity;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.view.WindowManager.LayoutParams;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.TextView;

import org.apache.cordova.api.Plugin;
import org.apache.cordova.api.PluginResult;

public class ChildBrowser extends Plugin {
    
    protected static final String LOG_TAG = "ChildBrowser";
    private static int CLOSE_EVENT = 0;
    private static int LOCATION_CHANGED_EVENT = 1;

    private String browserCallbackId = null;

    private Dialog dialog;
    private WebView childWebView;
    //private EditText edittext; 
    private boolean showLocationBar = true;
    
    private void onClose() {
    	this.webView.loadUrl("javascript:window.plugins.childBrowser.trigger('close')");
    }
    /*
    
    private void onOpenInBrowser() {
    	this.webView.loadUrl("javascript:window.plugins.childBrowser.trigger('open')");
    }
    
    private void onChildLocationChange(String newLoc) {
    	this.webView.loadUrl("javascript:window.plugins.childBrowser.trigger('change',{url:'" + newLoc + "'})");
    }
    */

    /**
     * Executes the request and returns PluginResult.
     *
     * @param action        The action to execute.
     * @param args          JSONArry of arguments for the plugin.
     * @param callbackId    The callback id used when calling back into JavaScript.
     * @return              A PluginResult object with a status and message.
     */
    public PluginResult execute(String action, JSONArray args, String callbackId) {
        PluginResult.Status status = PluginResult.Status.OK;
        String result = "";

        try {
            if (action.equals("showWebPage")) {
                this.browserCallbackId = callbackId;
                
                // If the ChildBrowser is already open then throw an error
                if (dialog != null && dialog.isShowing()) {
                    return new PluginResult(PluginResult.Status.ERROR, "ChildBrowser is already open");
                }
                
                result = this.showWebPage(args.getString(0), args.optJSONObject(1));
                
                if (result.length() > 0) {
                    status = PluginResult.Status.ERROR;
                    return new PluginResult(status, result);
                } else {
                    PluginResult pluginResult = new PluginResult(status, result);
                    pluginResult.setKeepCallback(true);
                    return pluginResult;
                }
            }
            else if (action.equals("close")) {
                closeDialog();
                
                JSONObject obj = new JSONObject();
                obj.put("type", CLOSE_EVENT);
                
                this.onClose();
                
                PluginResult pluginResult = new PluginResult(status, obj);
                pluginResult.setKeepCallback(false);
                return pluginResult;
            }
            else if (action.equals("openExternal")) {
                result = this.openExternal(args.getString(0), args.optBoolean(1));
                if (result.length() > 0) {
                    status = PluginResult.Status.ERROR;
                }
            }
            else {
                status = PluginResult.Status.INVALID_ACTION;
            }
            return new PluginResult(status, result);
        } catch (JSONException e) {
            return new PluginResult(PluginResult.Status.JSON_EXCEPTION);
        }
    }

    /**
     * Display a new browser with the specified URL.
     *
     * @param url           The url to load.
     * @param usePhoneGap   Load url in PhoneGap webview
     * @return              "" if ok, or error message.
     */
    public String openExternal(String url, boolean usePhoneGap) {
        try {
            Intent intent = null;
            if (usePhoneGap) {
                intent = new Intent().setClass(this.cordova.getActivity(), DroidGap.class);
                intent.setData(Uri.parse(url)); // This line will be removed in future.
                intent.putExtra("url", url);

                // Timeout parameter: 60 sec max - May be less if http device timeout is less.
                intent.putExtra("loadUrlTimeoutValue", 60000);

                // These parameters can be configured if you want to show the loading dialog
                intent.putExtra("loadingDialog", "Wait,Loading web page...");   // show loading dialog
                intent.putExtra("hideLoadingDialogOnPageLoad", true);           // hide it once page has completely loaded
            }
            else {
                intent = new Intent(Intent.ACTION_VIEW);
                intent.setData(Uri.parse(url));
            }
            this.cordova.getActivity().startActivity(intent);
            return "";
        } catch (android.content.ActivityNotFoundException e) {
            Log.d(LOG_TAG, "ChildBrowser: Error loading url "+url+":"+ e.toString());
            return e.toString();
        }
    }

    /**
     * Closes the dialog
     */
    private void closeDialog() {
        if (dialog != null) {
            dialog.dismiss();
        }
    }

    /**
     * Checks to see if it is possible to go back one page in history, then does so.
     */
    /*
    private void goBack() {
        if (this.childWebView.canGoBack()) {
            this.childWebView.goBack();
        }
    }
    */

    /**
     * Checks to see if it is possible to go forward one page in history, then does so.
     */
    /*
    private void goForward() {
        if (this.childWebView.canGoForward()) {
            this.childWebView.goForward();
        }
    }
    */

    /**
     * Navigate to the new page
     * 
     * @param url to load
     */
    /*
    private void navigate(String url) {        
        InputMethodManager imm = (InputMethodManager)this.ctx.getSystemService(Context.INPUT_METHOD_SERVICE);
        //imm.hideSoftInputFromWindow(edittext.getWindowToken(), 0);
        
        if (!url.startsWith("http")) {
        	url = "http://" + url;
        }

        this.childWebView.loadUrl(url);
        this.childWebView.requestFocus();
        
        this.onChildLocationChange(url);
    }
    */


    /**
     * Should we show the location bar?
     * 
     * @return boolean
     */
    private boolean getShowLocationBar() {
        return this.showLocationBar;
    }

    /**
     * Display a new browser with the specified URL.
     *
     * @param url           The url to load.
     * @param jsonObject 
     */
    public String showWebPage(final String url, JSONObject options) {
        // Determine if we should hide the location bar.
        if (options != null) {
            showLocationBar = options.optBoolean("showLocationBar", false);
        }
        
        final WebView parent = this.webView;
        
        // Create dialog in new thread 
        Runnable runnable = new Runnable() {
            public void run() {
                dialog = new Dialog(cordova.getActivity(), android.R.style.Theme_Black_NoTitleBar_Fullscreen);

                dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
                dialog.setCancelable(true);
                dialog.setOnDismissListener(new DialogInterface.OnDismissListener() {
                        public void onDismiss(DialogInterface dialog) {
                            try {
                                JSONObject obj = new JSONObject();
                                obj.put("type", CLOSE_EVENT);
                                
                                sendUpdate(obj, false);
                            } catch (JSONException e) {
                                Log.d(LOG_TAG, "Should never happen");
                            }
                        }
                });

                //LinearLayout.LayoutParams backParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT);
                //LinearLayout.LayoutParams forwardParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT);
                //LinearLayout.LayoutParams editParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT, 1.0f);
                LinearLayout.LayoutParams closeParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT,LayoutParams.WRAP_CONTENT);
                LinearLayout.LayoutParams wvParams = new LinearLayout.LayoutParams(LayoutParams.FILL_PARENT, LayoutParams.FILL_PARENT);
                
                LinearLayout main = new LinearLayout(cordova.getActivity());
                main.setOrientation(LinearLayout.VERTICAL);
                
                LinearLayout toolbar = new LinearLayout(cordova.getActivity());
                toolbar.setOrientation(LinearLayout.HORIZONTAL);
                
                /*
                ImageButton back = new ImageButton((Context) ctx);
                back.getBackground().setAlpha(0);
                back.setOnClickListener(new View.OnClickListener() {
                    public void onClick(View v) {
                        goBack();
                    }
                });
                back.setId(1);
                try {
                    back.setImageBitmap(loadDrawable("plugins/childbrowser/icon_arrow_left.png"));
                } catch (IOException e) {
                    Log.e(LOG_TAG, e.getMessage(), e);
                }
                back.setLayoutParams(backParams);

                ImageButton forward = new ImageButton((Context) ctx);
                forward.getBackground().setAlpha(0);
                forward.setOnClickListener(new View.OnClickListener() {
                    public void onClick(View v) {
                        goForward();
                    }
                });
                forward.setId(2);
                try {
                    forward.setImageBitmap(loadDrawable("plugins/childbrowser/icon_arrow_right.png"));
                } catch (IOException e) {
                    Log.e(LOG_TAG, e.getMessage(), e);
                }               
                forward.setLayoutParams(forwardParams);
                */
                
                /*
                edittext = new EditText((Context) ctx);
                edittext.setOnKeyListener(new View.OnKeyListener() {
                    public boolean onKey(View v, int keyCode, KeyEvent event) {
                        // If the event is a key-down event on the "enter" button
                        if ((event.getAction() == KeyEvent.ACTION_DOWN) && (keyCode == KeyEvent.KEYCODE_ENTER)) {
                          navigate(edittext.getText().toString());
                          return true;
                        }
                        return false;
                    }
                });
                edittext.setId(3);
                edittext.setSingleLine(true);
                edittext.setText(url);
                edittext.setLayoutParams(editParams);
                */
                //edittext = new EditText((Context) ctx);
                //edittext.setVisibility(View.GONE);
                
                LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.FILL_PARENT, 1.0f);
                TextView title = new TextView(cordova.getActivity());
                title.setId(1);
                title.setLayoutParams(titleParams);
                title.setGravity(Gravity.CENTER_VERTICAL);
                title.setTypeface(null, Typeface.BOLD);
                
                ImageButton close = new ImageButton(cordova.getActivity());
                close.getBackground().setAlpha(0);
                close.setOnClickListener(new View.OnClickListener() {
                    public void onClick(View v) {
                        closeDialog();
                    }
                });
                close.setId(4);
                try {
                    close.setImageBitmap(loadDrawable("plugins/childbrowser/icon_close.png"));
                } catch (IOException e) {
                    Log.e(LOG_TAG, e.getMessage(), e);
                }
                close.setLayoutParams(closeParams);
                                
                childWebView = new WebView(cordova.getActivity());
                childWebView.getSettings().setJavaScriptEnabled(true);
                childWebView.getSettings().setBuiltInZoomControls(true);
                WebViewClient client = new ChildBrowserClient(parent, ctx, title/*, edittext*/);
                childWebView.setWebViewClient(client);                
                childWebView.loadUrl(url);
                childWebView.setId(5);
                childWebView.setInitialScale(0);
                childWebView.setLayoutParams(wvParams);
                childWebView.requestFocus();
                childWebView.requestFocusFromTouch();
                
                //toolbar.addView(back);
                //toolbar.addView(forward);
                //toolbar.addView(edittext);
                toolbar.addView(close);
                toolbar.addView(title);
                
                if (getShowLocationBar()) {
                    main.addView(toolbar);
                }
                main.addView(childWebView);

                WindowManager.LayoutParams lp = new WindowManager.LayoutParams();
                lp.copyFrom(dialog.getWindow().getAttributes());
                lp.width = WindowManager.LayoutParams.FILL_PARENT;
                lp.height = WindowManager.LayoutParams.FILL_PARENT;
                lp.verticalMargin = 0f;
                lp.horizontalMargin = 0f;
                
                dialog.setContentView(main);
                dialog.show();
                dialog.getWindow().setAttributes(lp);
            }
            
            private Bitmap loadDrawable(String filename) throws java.io.IOException {
                InputStream input = cordova.getActivity().getAssets().open(filename);    
                return BitmapFactory.decodeStream(input);
            }
        };
        this.cordova.getActivity().runOnUiThread(runnable);
        return "";
    }
    
    /**
     * Create a new plugin result and send it back to JavaScript
     * 
     * @param obj a JSONObject contain event payload information
     */
    private void sendUpdate(JSONObject obj, boolean keepCallback) {
        if (this.browserCallbackId != null) {
            PluginResult result = new PluginResult(PluginResult.Status.OK, obj);
            result.setKeepCallback(keepCallback);
            this.success(result, this.browserCallbackId);
        }
    }

    /**
     * The webview client receives notifications about appView
     */
    public class ChildBrowserClient extends WebViewClient {
    	CordovaInterface ctx;
        //EditText edittext;
        WebView parent;
        TextView title;

        /**
         * Constructor.
         * 
         * @param mContext
         * @param edittext 
         */
        public ChildBrowserClient(WebView parent, CordovaInterface mContext, TextView title/*, EditText mEditText*/) {
            this.ctx = mContext;
            //this.edittext = mEditText;
            this.parent = parent;
            this.title = title;
            Context context = (Context) this.ctx;
            Resources res = context.getResources();
            int id = res.getIdentifier("loading", "string", context.getPackageName());
            this.title.setText(context.getString(id));
        }
        
        public void onPageFinished(WebView view, String url) {
        	this.title.setText(view.getTitle());
        }

        /**
         * Notify the host application that a page has started loading.
         * 
         * @param view          The webview initiating the callback.
         * @param url           The url of the page.
         */
        @Override
        public void onPageStarted(WebView view, String url,  Bitmap favicon) {
            super.onPageStarted(view, url, favicon);            
            String newloc;
            if (url.startsWith("http:")) {
                newloc = url;
            } else {
                newloc = "http://" + url;
            }
            
            /*if (!newloc.equals(edittext.getText().toString())) {           
                edittext.setText(newloc);
            }*/
            
            try {
                JSONObject obj = new JSONObject();
                obj.put("type", LOCATION_CHANGED_EVENT);
                obj.put("location", url);
                
                sendUpdate(obj, true);
                
                Context context = (Context) this.ctx;
                Resources res = context.getResources();
                int id = res.getIdentifier("loading", "string", context.getPackageName());
                this.title.setText(context.getString(id));

            	this.parent.loadUrl("javascript:window.plugins.childBrowser.trigger('change',{url:'" + url + "'})");
            } catch (JSONException e) {
                Log.d("ChildBrowser", "This should never happen");
            }
        }
    }
}