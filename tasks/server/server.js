module.exports = function(grunt) {
  'use strict';

  /* server.js */
  var express = require('express'),
  util = require('util'),
  http = require('http'),
  jsonlint = require('json-lint');

  var startServer = function(config) {
    config = config || {};
    var server = express();
    var hourMs = config.hourMs || 0*60*60,
    vhost = config.vhost || 'localhost',
    base = config.base,
    port = config.port,
    host = config.host,
    apiURL = config.apiURL || '/api*',
    routes = config.routes,
    apiRoutes = config.apiRoutes,
    basicAuth = config.basicAuth;

    function proxyRequest(request, response) {
      var postData = request.body;
      var options = {
        host: host,
        port: '80',
        method: request.method,
        path: request.originalUrl,
        headers: {}
      };
      options.headers.host = host;
      if (basicAuth) {
        options.headers.Authorization = "Basic " + new Buffer(basicAuth.username + ":" + basicAuth.password).toString("base64");
      }
      if ('POST' === request.method && typeof postData === 'object') {
        postData = JSON.stringify(postData);
      }
      var req = http.request(options, function(res) {
        var output = '';
        console.log(options.method + ' @ ' + options.host + options.path + ' Code: '+ res.statusCode);
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          output += chunk;
        });
        res.on('end', function() {
          var lint = jsonlint(output);
          response
          .status(res.statusCode);
          if (lint.error) {
            response.send(output);
          } else {
            response.json(JSON.parse(output));
          }
        });
      });

      req.on('error', function(e) {
        console.log('problem with request: ' + e.message);
      });

      if ('POST' === request.method) {
        req.write(postData);
      }

      req.end();
    }

    server.use(express['static'](base, {maxAge: 0}));
    server.use(express.directory(base, {icons: true}));
    server.use(express.bodyParser());
    server.use(express.errorHandler({dumpExceptions: true, showStack: true}));

    routes.forEach(function(route) {
      server.get(route, function(req, res) {
        res.redirect(util.format('/#%s#', req.originalUrl));
      });
    });

    server.all(apiURL, proxyRequest);

    server.listen(port);
    return server;
  };


  grunt.registerMultiTask('server', 'Runs a static web and proxy server', function() {
    var options = this.options({
    });
    var server = startServer({
        host: '',
        hourMs: 0*60*60,
        vhost: options.vhost,
        base: options.base,
        port: options.port,
        apiURL: options.apiURL,
        routes: [],
        apiRoutes: []
    }),
    args = this.args,
    done = args[args.length-1] === 'watch' ? function() {} : this.async();

    server.on('close', done);

    console.log('Express server running at %s:%d', options.vhost, options.port);
  });

};
