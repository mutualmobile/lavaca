define(function(require) {

  var log = require('lavaca/util/log');
  log('WARNING: PageView is deprecated. You can now use the normal View class in place of PageView.');

  var View = require('./View');
  return View;

});
