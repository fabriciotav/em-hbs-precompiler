var basename, fileExtensions, fs, path, vm;

/**
 * Node modules
 */
fs = require('fs');
path = require('path');
basename = path.basename;
vm = require('vm');

/**
 * If you need something else, just add it to the regex.
 */
fileExtensions = /\.handlebars$|\.hbs$/;

/**
 * Process each template file
 */
exports.processTemplate = function processTemplate(template, root, opts, output) {
  var context, data, element, jQuery, sandbox, stat;

  stat = fs.statSync(template);

  if (stat.isDirectory()) {
    fs.readdirSync(template).map(function(file) {
      var path = template + '/' + file;

      if (fileExtensions.test(path) || fs.statSync(path).isDirectory()) {
        processTemplate(path, root || template, opts, output);
      }
    });
  } else {
    data = fs.readFileSync(template, 'utf8');

    // set the template name
    if (!root) {
      template = basename(template);
    } else if (template.indexOf(root) === 0) template = template.substring(root.length + 1);

    template = template.replace(fileExtensions, '');

    //dummy jQuery
    jQuery = function() { return jQuery; };
    jQuery.ready = function() { return jQuery; };
    jQuery.inArray = function() { return jQuery; };
    jQuery.jquery = "1.9.1";
    jQuery.event = { fixHooks: {} };

    //dummy DOM element
    element = {
      firstChild: function () { return element; },
      innerHTML: function () { return element; }
    };

    sandbox = {
      // DOM
      document: {
        createRange: false,
        createElement: function() { return element; }
      },

      // Console
      console: console,

      // jQuery
      jQuery: jQuery,
      $: jQuery,

      // handlebars template to compile
      template: data,

      // compiled handlebars template
      templatejs: null
    };

    // window
    sandbox.window = sandbox;

    // create a context for the vm using the sandbox data
    context = vm.createContext(sandbox);

    // load Ember into the sandbox
    vm.runInContext(opts.handlebars_data, context, 'handlebars.js');
    vm.runInContext(opts.emberjs_data, context, 'ember.js');

    //compile the handlebars template inside the vm context
    vm.runInContext('templatejs = Ember.Handlebars.precompile(template).toString();', context);

    output.push('\ntemplates[\'' + template + '\'] = template(' + context.templatejs + ');\n');
  }
};
