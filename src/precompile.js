var colors, fs, lib, path, processTemplate;
/**
 * Node modules
 */
fs = require('fs');
path = require('path');
processTemplate = require('./template').processTemplate;
colors = require('../src/colors').colors;

/**
 * Required libraries
 */
lib = {
  emberjs: path.dirname(__dirname) + '/lib/ember/ember-1.0.0-rc.4.js',
  handlebars: path.dirname(__dirname) + '/lib/handlebars/handlebars-1.0.0-rc.4.js'
};

exports.precompile = function(opts) {
  // Load libraries
  opts.handlebars_data = fs.readFileSync(lib.handlebars, 'utf8');
  opts.emberjs_data = fs.readFileSync(lib.emberjs, 'utf8');

  var output = [];
  output.push('(function() {\n  var template = Ember.Handlebars.template, templates = Ember.TEMPLATES = Ember.TEMPLATES || {};\n');

  processTemplate(opts.src, null, opts, output);

  // Output the content
  output.push('})();');
  output = output.join('');

  if (opts.output) fs.writeFileSync(opts.output, output, 'utf8');

  console.log(colors[2] + '    created:    ' + colors[0] + opts.output);

  return output;
}
