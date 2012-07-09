(function() {
  var elems = ['article', 'aside', 'footer', 'header', 'hgroup', 'menu', 'nav', 'section'],
      elem,
      i = -1;
  while (elem = elems[++i]) {
    document.createElement(elem);
  }
})();