<%@ page pageEncoding="UTF-8" contentType="text/html; charset=UTF-8"
%><%@ include file="/WEB-INF/includes/libs.jsp"
%><c:set var="inline" value="true"/><compress:html enabled="${app.compress}">
<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
    <meta name="format-detection" content="telephone=no">
    <meta name="mobileoptimized" content="0">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=0">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black">
    <c:if test="${not empty requestScope.page.title}">
      <title>${fn:escapeXml(requestScope.page.title)}</title>
    </c:if>
    <c:if test="${not empty requestScope.page.meta.description}">
      <meta name="description" content="${fn:escapeXml(requestScope.page.meta.description)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.author}">
      <meta name="author" content="${fn:escapeXml(requestScope.page.meta.author)}">
    </c:if>
    <%--google:verification--%>
    <c:if test="${not empty requestScope.page.meta.googleSiteVerification}">
      <meta name="google-site-verification" content="${fn:escapeXml(requestScope.page.meta.googleSiteVerification)}">
    </c:if>
    <%--/google:verification--%>
    <%--fb:insights--%>
    <c:if test="${not empty requestScope.page.meta.fbAdmins}">
      <meta name="fb:admins" content="${fn:escapeXml(requestScope.page.meta.fbAdmins)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.fbAppId}">
      <meta name="fb:app_id" content="${fn:escapeXml(requestScope.page.meta.fbAppId)}">
    </c:if>
    <%--/fb:insights--%>
    <%--fb:open-graph--%>
    <c:if test="${not empty requestScope.page.meta.ogImage}">
      <meta name="og:image" content="${fn:escapeXml(requestScope.page.meta.ogImage)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogVideo}">
      <meta name="og:video" content="${fn:escapeXml(requestScope.page.meta.ogVideo)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogTitle}">
      <meta name="og:title" content="${fn:escapeXml(requestScope.page.meta.ogTitle)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogDescription}">
      <meta name="og:description" content="${fn:escapeXml(requestScope.page.meta.ogDescription)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogURL}">
      <meta name="og:url" content="${fn:escapeXml(requestScope.page.meta.ogURL)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogSiteName}">
      <meta name="og:site_name" content="${fn:escapeXml(requestScope.page.meta.ogSiteName)}">
    </c:if>
    <c:if test="${not empty requestScope.page.meta.ogLocale}">
      <meta name="og:locale" content="${fn:escapeXml(requestScope.page.meta.ogLocale)}">
    </c:if>
    <%--/fb:open-graph--%>
    <%--favicon--%>
    <link rel="icon" href="/img/favicon.png">
    <%--/favicon--%>
    <%--apple:icon--%>
    <link rel="apple-touch-icon" href="/img/icon-57x57.png">
    <link rel="apple-touch-icon" sizes="72x72" href="/img/icon-72x72.png">
    <link rel="apple-touch-icon" sizes="114x114" href="/img/icon-114x114.png">
    <link rel="apple-touch-icon" sizes="144x144" href="/img/icon-144x144.png">
    <link rel="apple-touch-startup-image" href="/img/splash-320x460.png">
    <link rel="apple-touch-startup-image" sizes="640x960" href="/img/splash-640x960.png">
    <link rel="apple-touch-startup-image" sizes="768x1004" href="/img/splash-768x1004.png">
    <link rel="apple-touch-startup-image" sizes="1024x748" href="/img/splash-1024x748.png">
    <link rel="apple-touch-startup-image" sizes="1536x2008" href="/img/splash-1536x2008.png">
    <%--/apple:icon--%>
    <lv:styles compress="${app.compress}" inline="${app.inline}"/>
  </head>
  <body>
    <c:if test="${not empty requestScope.content}">
      <noscript>${requestScope.content}</noscript>
    </c:if>
    <%--TODO--%>
    <%--Customize this area with your application's code--%>
    <header id="nav-header">
      <h1 class="logo">Lavaca</h1>
    </header>
    <ul id="nav-tabs"></ul>
    <div id="view-root"></div>
    <%--/TODO--%>
    <lv:scripts compress="${app.compress}" inline="${app.inline}"/>
    <c:if test="${not empty requestScope.initRoute}">
	    <script type="text/javascript">app.initRoute='${lv:escapeJS(requestScope.initRoute)}';</script>
    </c:if>
    <c:if test="${not empty requestScope.initState}">
      <script type="text/javascript">app.initState=${requestScope.initState};</script>
    </c:if>
    <c:if test="${not empty requestScope.initParams}">
      <script type="text/javascript">app.initParams=${requestScope.initParams};</script>
    </c:if>
    <lv:configs compress="${app.compress}" inline="${app.inline}"/>
    <lv:translations compress="${app.compress}" inline="${app.inline}"/>
    <lv:templates compress="${app.compress}" inline="${app.inline}"/>
    <c:if test="${not empty requestScope.errorMessage}">
      <script type="text/javascript">alert('${lv:escapeJS(requestScope.errorMessage)}');</script>
    </c:if>
  </body>
</html>
</compress:html>