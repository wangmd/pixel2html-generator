'use strict';

var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var mkdirp = require('mkdirp');
var _s = require('underscore.string');
var _ = require('underscore');
var util = require('util');
var path = require('path');

var Generator = module.exports = function Generator(args, options) {

  yeoman.generators.Base.apply(this, arguments);

  this.paths = {
    src: 'assets/src',
    srcFonts: 'assets/src/fonts',
    srcIcons: 'assets/src/icons',
    srcImages: 'assets/src/images',
    srcVendors: 'assets/src/vendor',
    srcJs: 'assets/src/js'
  };


  this.destinationRoot('demo');

  //Options to set thru CLI
   this.option('projectName', {
     desc: 'Sets the project name i.e.: 3845',
     type: String,
     required: false
   });

   this.option('qtyPages', {
     desc: 'Sets the quantity of pages have the project i.e. 5 (1 homepage, 4 inners)',
     type: Number,
     required: false
   });

   this.option('projectType', {
     desc: 'Sets the type of project [desktop, responsive, mobile]',
     type: String,
     required: false
   });

   this.option('cssProcessor', {
     desc: 'Sets the CSS Preprocessor [sass, less, stylus]',
     type: String,
     required: false
   });

   this.option('cssFramework', {
     desc: 'Sets the framework of choice [basscss, bootstrap, foundation]',
     type: String,
     required: false
   });
};

util.inherits(Generator, yeoman.generators.Base);

Generator.prototype.welcome = function welcome() {
  if (!this.options['skip-welcome-message']) {
    this.log(
      chalk.white.bgRed.bold(
        'Welcome to Pixel2HTML Boilerplate Generator'
      )
    );
  }
};

Generator.prototype.askForProjectName = function askForProjectName() {

  var cb = this.async();

  if(this.options['projectName']){
    return;
  }

  this.prompt(
    [{
      type: 'input',
      name: 'projectName',
      required: true,
      message: 'Give me the Project Name!'
    }],
    function(props) {
      this.projectName = props.projectName;

      cb();
    }.bind(this)
  );
};

Generator.prototype.askForQtyPages = function askForQtyPages() {

  var cb = this.async();

  this.prompt(
    [{
      type: 'input',
      name: 'qtyPages',
      message: 'How many pages to will code?'
    }],
    function(props) {
      this.qtyPages = props.qtyPages;

      cb();
    }.bind(this)
  );
};

Generator.prototype.projectType = function projectType() {

  var cb = this.async();

  this.prompt([{
      type: 'list',
      name: 'projectType',
      message: 'What type of page you will code? Pick one',
      choices: [{
        name: 'Desktop',
        value: 'desktop',
      }, {
        name: 'Responsive',
        value: 'responsive',
      }, {
        name: 'Mobile',
        value: 'mobile',
      }]
    }],
    function(props) {
      this.projectType = props.projectType;
      cb();
    }.bind(this));
};

Generator.prototype.askForCssPreprocessor = function askForCssPreprocessor() {

  var cb = this.async();

  this.prompt([{
      type: 'list',
      name: 'cssProcessor',
      message: 'What preprocessor would you like to use? Pick one',
      choices: [{
        name: 'Sass',
        value: 'sass',
      }, {
        name: 'Less',
        value: 'less',
      }, {
        name: 'Stylus',
        value: 'stylus',
      }]
    }],
    function(props) {
      this.cssProcessor = props.cssProcessor;
      cb();
    }.bind(this));
};

Generator.prototype.askForFramework = function askForFramework() {

  var cb = this.async();

  this.prompt([{
      type: 'list',
      name: 'cssFramework',
      message: 'What CSS Framework do you like to include?',
      choices: [{
        name: 'BassCss',
        value: 'basscss',
      }, {
        name: 'Bootstrap',
        value: 'bootstrap',
      }, {
        name: 'Foundation',
        value: 'foundation',
      }, {
        name: 'None',
        value: false,
      }]
    }],
    function(props) {
      this.cssFramework = props.cssFramework;
      cb();
    }.bind(this));
};

Generator.prototype.askForjQuery = function askForjQuery() {
  var cb = this.async();
  var cssFramework = this.cssFramework;

  this.prompt([{
    type: 'confirm',
    name: 'jquery',
    message: 'Would you like to use jQuery?',
    default: true,
    when: function() {
      return !cssFramework;
    }
  }], function(props) {
    this.jquery = props.jquery;
    cb();
  }.bind(this));
};

Generator.prototype.askForJsModules = function askForJsModules() {
  var cb = this.async();
  var jquery = this.jquery;

  var prompts = [{
    type: 'checkbox',
    name: 'jsModules',
    message: 'Which modules would you like to include?',
    choices: [{
      value: 'parsleyjs',
      name: 'Form validation with Parsley.js',
      checked: true
    }, {
      value: 'slider',
      name: 'Slider.js',
      checked: false
    }, {
      value: 'tabs',
      name: 'tabs.js',
      checked: false
    }],
    when: function(jquery) {
      return jquery;
    }
  }];

  this.prompt(prompts, function(props) {

    var hasMod = function(mod) {
      return _.contains(props.jsModules, mod);
    };

    this.parsleyjs = hasMod('parsleyjs');
    this.slider = hasMod('slider');
    this.tabs = hasMod('tabs');

    cb();
  }.bind(this));
};

Generator.prototype.packageFiles = function packageFiles() {
  console.log(this);

  this.log(chalk.yellow('Copying package.json file and adding dependencies.'));
  this.fs.copyTpl(
    this.templatePath('base/_package.json'),
    this.destinationPath('package.json'), {
      projectName: this.projectName,
      cssPreprocessor: this.cssPreprocessor
    }
  );

  this.log(chalk.yellow('Copying jshintrc file.'));
  this.fs.copy(
    this.templatePath('base/jshintrc'),
    this.destinationPath('.jshintrc')
  );

  this.log(chalk.yellow('Copying git files.'));
  this.fs.copy(
    this.templatePath('git/gitignore'),
    this.destinationPath('.gitignore')
  );

  this.fs.copy(
    this.templatePath('git/gitattributes'),
    this.destinationPath('.gitattributes')
  );
};

Generator.prototype.gulpFiles = function gulpFiles() {

  this.log(chalk.yellow('Copying gulpfile.'));
  this.fs.copyTpl(
    this.templatePath('gulp/_gulpfile.js'),
    this.destinationPath('gulpfile.js')
  );

}

Generator.prototype.createFolder = function createFolder() {
  this.log(chalk.yellow('Creating directories.'));

  mkdirp('assets');

  _.each(this.paths, function(path) {
    mkdirp(path);
  });

}
