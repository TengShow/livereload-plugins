/*!
 * Stylus - CSS to Stylus conversion
 * Copyright(c) 2010 LearnBoost <dev@learnboost.com>
 * MIT Licensed
 */

/**
 * Convert the given `css` to Stylus source.
 *
 * @param {String} css
 * @return {String}
 * @api public
 */

module.exports = function(css){
  return new Converter(css).stylus();
};

/**
 * Initialize a new `Converter` with the given `css`.
 *
 * @param {String} css
 * @api private
 */

function Converter(css) {
  var parse = require('css-parse');
  this.css = css;
  this.root = parse(css, { position: false });
  this.indents = 0;
}

/**
 * Convert to Stylus.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.stylus = function(){
  return this.visitRules(this.root.stylesheet.rules);
};

/**
 * Return indent string.
 *
 * @return {String}
 * @api private
 */

Converter.prototype.__defineGetter__('indent', function(){
  return Array(this.indents + 1).join('  ');
});

/**
 * Visit `node`.
 *
 * @param {*} node
 * @return {String}
 * @api private
 */

Converter.prototype.visit = function(node){
  switch (node.type) {
    case 'rule':
    case 'comment':
    case 'charset':
    case 'media':
    case 'import':
    case 'document':
    case 'keyframes':
    case 'page':
      var name = node.type[0].toUpperCase() + node.type.slice(1);
      return this['visit' + name](node);
  }
};

/**
 * Visit the rules on `node`.
 *
 * @param {Array} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRules = function(node){
  var buf = '';
  for (var i = 0, len = node.length; i < len; ++i) {
    buf += this.visit(node[i]);
  }
  return buf;
};

/**
 * Visit Media `node`.
 *
 * @param {Media} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitMedia = function(node){
  var buf = this.indent + '@media ' + node.media;
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Visit Declaration `node`.
 *
 * @param {Declaration} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitDeclaration = function(node){
  if ('comment' == node.type) {
    return this.visitComment(node);
  } else {
    var buf = this.indent + node.property + ': ' + node.value + '\n';
    return buf;
  }
};

/**
 * Visit Rule `node`.`
 *
 * @param {Rule} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitRule = function(node){
  var buf = this.indent + node.selectors.join(',\n') + '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf + '\n';
};

/**
 * Visit Comment `node`.`
 *
 * @param {Comment} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitComment = function(node){
  var buf = this.indent + '/*' + node.comment + '*/';
  return buf + '\n';
};

/**
 * Visit Charset `node`.`
 *
 * @param {Charset} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitCharset = function(node){
  var buf = this.indent + '@charset ' + node.charset;
  return buf + '\n';
};

/**
 * Visit Import `node`.`
 *
 * @param {Import} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitImport = function(node){
  var buf = this.indent + '@import ' + node.import;
  return buf + '\n';
};

/**
 * Visit Document `node`.`
 *
 * @param {Document} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitDocument = function(node){
  var buf = this.indent + '@' + node.vendor + 'document ' + node.document;
  buf += '\n';
  ++this.indents;
  buf += this.visitRules(node.rules);
  --this.indents;
  return buf;
};

/**
 * Visit Keyframes `node`.`
 *
 * @param {Keyframes} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitKeyframes = function(node){
  var buf = this.indent + '@keyframes ' + node.name;
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.keyframes.length; i < len; ++i) {
    buf += this.visitKeyframe(node.keyframes[i]);
  }
  --this.indents;
  return buf;
};

/**
 * Visit Keyframe `node`.`
 *
 * @param {Keyframe} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitKeyframe = function(node){
  var buf = this.indent + node.values.join('\n,');
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf;
};

/**
 * Visit Page `node`.`
 *
 * @param {Page} node
 * @return {String}
 * @api private
 */

Converter.prototype.visitPage = function(node){
  var buf = this.indent + '@page' + (node.selectors.length ? ' ' + node.selectors.join(', ') : '');
  buf += '\n';
  ++this.indents;
  for (var i = 0, len = node.declarations.length; i < len; ++i) {
    buf += this.visitDeclaration(node.declarations[i]);
  }
  --this.indents;
  return buf;
};
