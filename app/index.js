const Generator = require('yeoman-generator')
const chalk = require('chalk')
const mkdirp = require('mkdirp')
const _ = require('underscore')
const fs = require('fs-extra')
const moment = require('moment')
const updateNotifier = require('update-notifier')
const pkg = require('../package.json')

class PixelGenerator extends Generator {
  constructor (args, options) {
    super(args, options)
    this.paths = {
      src: {
        gulp: 'gulp',
        gulp_tasks: 'gulp/tasks',
        fonts: 'src/assets/fonts',
        icons: 'src/assets/icons',
        images: 'src/assets/images',
        scripts: 'src/assets/js',
        styles: 'src/assets/styles',
        markup: 'src',
        base: 'src'
      },
      dist: {
        assets: 'dist/assets',
        fonts: 'dist/assets/fonts',
        icons: 'dist/assets/icons',
        images: 'dist/assets/images',
        scripts: 'dist/assets/js',
        styles: 'dist/assets/css',
        base: 'dist',
        markup: 'dist'
      },
      releases: {
        base: 'dist/releases'
      }
    }

    this.option('projectName', {
      desc: 'Sets the Project Name',
      type: String,
      required: false
    })

    this.option('qtyScreens', {
      desc: 'Sets the quantity of screens have the project i.e. 5 (1 homepage, 4 inners)',
      type: Number,
      required: false
    })

    this.option('markupLanguage', {
      desc: 'Sets the Markup Language [html, pug]',
      type: String,
      required: false
    })

    this.option('markupIntegration', {
      desc: 'Sets the Markup Integration',
      type: String,
      required: false
    })

    this.option('frontEndFramework', {
      desc: 'Sets the framework of choice [bootstrap, foundation]',
      type: String,
      required: false
    })

    this.option('jQuery', {
      desc: 'Sets de the usage of jQuery',
      type: String,
      required: false
    })
  }

  notify () {
    updateNotifier({pkg}).notify()
  }

  readConfigFile () {
    return fs.readJson('./.project.conf')
      .then(config => {
        this.options.projectName = config.projectName
        this.options.qtyScreens = config.qtyScreens
        this.options.markupLanguage = config.markupLanguage
        this.options.markupIntegration = config.markupIntegration
        this.options.frontEndFramework = config.frontEndFramework
        this.options.jQuery = config.jQuery
      })
      .catch(err => {
        let okayError = err.toString() !== "Error: ENOENT: no such file or directory, open './.project.conf'"
        if (okayError) {
          this.log(chalk.cyan('There was an issue:') + '\n')
          this.log(chalk.white(err) + '\n')
        }
      })
  }

  welcome () {
    if (!this.options['skip-welcome-message']) {
      this.log('')
      this.log(chalk.cyan(' ****************************************************') + '\n')
      this.log(chalk.cyan('  Welcome to'), chalk.white.bold(' Pixel2HTML Generator '))
      this.log(chalk.white('  A Yeoman generator for scaffolding web projects') + '\n')
      this.log(chalk.cyan(' ****************************************************') + '\n')
    }
  }

  askForProjectName () {
    return this.options.projectName
      ? true
      : this.prompt(
        [{
          type: 'input',
          name: 'projectName',
          required: true,
          message: 'Give me the Project Name!'
        }]
      )
      .then(props => {
        this.options.projectName = props.projectName
      })
  }

  askForQtyScreens () {
    return this.options.qtyScreens
      ? true
      : this.prompt(
        [{
          type: 'input',
          name: 'qtyScreens',
          message: 'How many screens do you need to code?',
          default: 1
        }]
      )
      .then(props => {
        this.options.qtyScreens = parseInt(props.qtyScreens)
      })
  }

  askForMarkupLanguage () {
    return this.options.markupLanguage
      ? true
      : this.prompt([
        {
          type: 'list',
          name: 'markupLanguage',
          message: 'What markup lenguage/integration would you like to use? Pick one',
          choices: [
            {
              name: 'HTML',
              value: 'html'
            },
            {
              name: 'pug/jade',
              value: 'pug'
            }
          ]
        }]
      )
      .then(props => {
        this.options.markupLanguage = props.markupLanguage
      })
  }

  askForMarkupIntegration () {
    return this.options.markupIntegration
      ? true
      : this.prompt([{
        type: 'list',
        name: 'markupIntegration',
        message: 'What Markup Integration do you like to use?',
        choices: [
          {
            name: 'None',
            value: false
          }, {
            name: 'Jekyll',
            value: 'jekyll'
          }]
      }])
      .then(props => {
        this.options.markupIntegration = props.markupIntegration
      })
  }

  askForFrontEndFramework () {
    return this.options.frontEndFramework
      ? true
      : this.prompt([{
        type: 'list',
        name: 'frontEndFramework',
        message: 'What FrontEnd Framework do you like to include?',
        choices: [
          {
            name: 'None',
            value: false
          }, {
            name: 'Bootstrap',
            value: 'bootstrap'
          }, {
            name: 'Foundation',
            value: 'foundation'
          }]
      }])
      .then(props => {
        this.options.frontEndFramework = props.frontEndFramework
      })
  }

  askForjQuery () {
    return this.options.jQuery
      ? true
      : this.prompt([{
        type: 'confirm',
        name: 'jQuery',
        message: 'Would you like to use jQuery? \n http://youmightnotneedjquery.com/ \n http://youmightnotneedjqueryplugins.com/',
        default: false
      }])
      .then(props => {
        this.options.jQuery = props.jQuery
      })
  }

  writeProjectFiles () {
    this.log(chalk.yellow('Copying package.json file and adding dependencies.'))
    this.fs.copyTpl(
      this.templatePath('base/_package.json'),
      this.destinationPath('package.json'), {
        projectName: this.options.projectName,
        markupLanguage: this.options.markupLanguage,
        markupIntegration: this.options.markupIntegration,
        frontEndFramework: this.options.frontEndFramework,
        jQuery: this.options.jQuery
      }
    )

    this.log(chalk.yellow('Copying editorconfig file.'))
    this.fs.copy(
      this.templatePath('base/editorconfig'),
      this.destinationPath('.editorconfig')
    )

    this.log(chalk.yellow('Copying babelrc file'))
    this.fs.copy(
      this.templatePath('base/babelrc'),
      this.destinationPath('.babelrc')
    )

    this.log(chalk.yellow('Copying browserlistrc file'))
    this.fs.copy(
      this.templatePath('base/browserlistrc'),
      this.destinationPath('.browserlistrc')
    )

    this.log(chalk.yellow('Copying MIT License'))
    this.fs.copy(
      this.templatePath('base/LICENSE'),
      this.destinationPath('LICENSE')
    )

    this.log(chalk.yellow('Copying git files.'))
    this.fs.copyTpl(
      this.templatePath('git/gitignore'),
      this.destinationPath('.gitignore'), {
        paths: this.paths
      }
    )

    this.fs.copy(
      this.templatePath('git/gitattributes'),
      this.destinationPath('.gitattributes')
    )

    this.log(chalk.yellow('Copying README file.'))
    this.fs.copyTpl(
      this.templatePath('base/README.md'),
      this.destinationPath('README.md'), {
        paths: this.paths,
        projectName: this.options.projectName,
        frontEndFramework: this.options.frontEndFramework,
        markupIntegration: this.options.markupIntegration,
        jQuery: this.options.jQuery,
        qtyScreens: this.options.qtyScreens,
        markupLanguage: this.options.markupLanguage,
        now: moment().format(),
        version: pkg.version
      }
    )
  }

  createFolders () {
    this.log(chalk.yellow('Creating directories.'))

    // make src paths
    _.each(this.paths.src, function (path) {
      mkdirp(path)
    })
    _.each(this.paths.releases, function (path) {
      mkdirp(path)
    })
  }

  copyGitKeepFiles () {
    this.fs.copy(
      this.templatePath('base/gitkeep'),
      this.destinationPath(this.paths.releases.base + '/.gitkeep')
    )
    this.fs.copy(
      this.templatePath('base/gitkeep'),
      this.destinationPath(this.paths.src.fonts + '/.gitkeep')
    )
    this.fs.copy(
      this.templatePath('base/gitkeep'),
      this.destinationPath(this.paths.src.icons + '/.gitkeep')
    )
    this.fs.copy(
      this.templatePath('base/gitkeep'),
      this.destinationPath(this.paths.src.images + '/.gitkeep')
    )
  }

  copySampleSvg () {
    this.fs.copy(
      this.templatePath('assets/icons/react.svg'),
      this.destinationPath(this.paths.src.icons + '/react.svg')
    )
  }

  writeHtmlFiles () {
    let usingHtml = this.options.markupLanguage === 'html'
    if (!this.options.markupIntegration && usingHtml) {
      for (var i = 1; i < this.options.qtyScreens + 1; i++) {
        this.fs.copyTpl(
          this.templatePath('markup/_screen.' + this.options.markupLanguage),
          this.destinationPath(this.paths.src.markup + '/screen-' + i + '.' + this.options.markupLanguage),
          {
            screenNumber: i,
            projectName: this.options.projectName,
            frontEndFramework: this.options.frontEndFramework,
            jQuery: this.options.jQuery
          }
        )
      }
    }
  }

  writePugFiles () {
    let usingPug = this.options.markupLanguage === 'pug'
    if (!this.options.markupIntegration && usingPug) {
      for (var i = 1; i < this.options.qtyScreens + 1; i++) {
        this.fs.copyTpl(
          this.templatePath('markup/pug/_screen.' + this.options.markupLanguage),
          this.destinationPath(this.paths.src.markup + '/pug/screen-' + i + '.' + this.options.markupLanguage),
          {
            screenNumber: i,
            projectName: this.options.projectName,
            frontEndFramework: this.options.frontEndFramework,
            jQuery: this.options.jQuery
          }
        )
      }
      this.fs.copyTpl(
        this.templatePath('markup/pug/layouts/layout-primary.pug'),
        this.destinationPath(this.paths.src.markup + '/pug/layouts/layout-primary.pug'),
        {
          screenNumber: i,
          projectName: this.options.projectName,
          frontEndFramework: this.options.frontEndFramework,
          jQuery: this.options.jQuery
        }
      )
      this.fs.copy(
        this.templatePath('markup/pug/layouts/general/**/*'),
        this.destinationPath(this.paths.src.markup + '/pug/layouts/general')
      )
      this.fs.copy(
        this.templatePath('markup/pug/layouts/includes/**/*'),
        this.destinationPath(this.paths.src.markup + '/pug/layouts/includes')
      )
    }
  }

  writeBaseStyles () {
    this.fs.copyTpl(
      this.templatePath('styles/main.scss'),
      this.destinationPath(this.paths.src.styles + '/main.scss'), {
        projectName: this.options.projectName,
        qtyScreens: this.options.qtyScreens
      }
    )

    this.fs.copyTpl(
      this.templatePath('styles/vendor.scss'),
      this.destinationPath(this.paths.src.styles + '/vendor.scss'), {
        projectName: this.options.projectName,
        frontEndFramework: this.options.frontEndFramework
      }
    )

    this.fs.copy(
      this.templatePath('styles/_variables.scss'),
      this.destinationPath(this.paths.src.styles + '/_variables.scss')
    )
    this.fs.copy(
      this.templatePath('styles/_mixins.scss'),
      this.destinationPath(this.paths.src.styles + '/_mixins.scss')
    )
    this.fs.copy(
      this.templatePath('styles/_reset.scss'),
      this.destinationPath(this.paths.src.styles + '/_reset.scss')
    )
    this.fs.copy(
      this.templatePath('styles/screens/_base.scss'),
      this.destinationPath(this.paths.src.styles + '/screens/_base.scss')
    )
    this.fs.copy(
      this.templatePath('styles/components/_header.scss'),
      this.destinationPath(this.paths.src.styles + '/components/_header.scss')
    )
    this.fs.copy(
      this.templatePath('styles/components/_footer.scss'),
      this.destinationPath(this.paths.src.styles + '/components/_footer.scss')
    )
    this.fs.copy(
      this.templatePath('styles/components/_nav.scss'),
      this.destinationPath(this.paths.src.styles + '/components/_nav.scss')
    )
    this.fs.copy(
      this.templatePath('styles/components/_forms.scss'),
      this.destinationPath(this.paths.src.styles + '/components/_forms.scss')
    )
    this.fs.copy(
      this.templatePath('styles/components/_buttons.scss'),
      this.destinationPath(this.paths.src.styles + '/components/_buttons.scss')
    )

    for (var i = 1; i < this.options.qtyScreens + 1; i++) {
      this.fs.copyTpl(
        this.templatePath('styles/screens/_screen.scss'),
        this.destinationPath(this.paths.src.styles + '/screens/screen_' + i + '.scss'), {
          screenNumber: i,
          projectName: this.options.projectName
        }
      )
    }
  }

  writeBaseScriptsFiles () {
    this.log(chalk.yellow('Copying js main file.'))
    this.fs.copyTpl(
      this.templatePath('scripts/main.js'),
      this.destinationPath(this.paths.src.scripts + '/main.js'), {
        projectName: this.options.projectName,
        frontEndFramework: this.options.frontEndFramework
      }
    )
    this.fs.copyTpl(
      this.templatePath('scripts/general/index.js'),
      this.destinationPath(this.paths.src.scripts + '/general/index.js'), {
        projectName: this.options.projectName,
        frontEndFramework: this.options.frontEndFramework,
        jQuery: this.options.jQuery
      }
    )

    if (this.options.jQuery) {
      this.fs.copyTpl(
        this.templatePath('scripts/general/jquery.js'),
        this.destinationPath(this.paths.src.scripts + '/general/jquery.js'), {
          projectName: this.options.projectName,
          frontEndFramework: this.options.frontEndFramework,
          jQuery: this.options.jQuery
        }
      )
    }

    if (this.options.frontEndFramework === 'bootstrap') {
      this.fs.copyTpl(
        this.templatePath('scripts/general/bootstrap.js'),
        this.destinationPath(this.paths.src.scripts + '/general/bootstrap.js'), {
          projectName: this.options.projectName,
          frontEndFramework: this.options.frontEndFramework,
          jQuery: this.options.jQuery
        }
      )
    }

    if (this.options.frontEndFramework === 'foundation') {
      this.fs.copyTpl(
        this.templatePath('scripts/general/foundation.js'),
        this.destinationPath(this.paths.src.scripts + '/general/foundation.js'), {
          projectName: this.options.projectName,
          frontEndFramework: this.options.frontEndFramework,
          jQuery: this.options.jQuery
        }
      )
    }
  }

  writeBaseGulpFiles () {
    this.log(chalk.yellow('Copying gulpfile.'))
    this.fs.copyTpl(
      this.templatePath('gulp/_gulpfile.js'),
      this.destinationPath('gulpfile.js'), {
        paths: this.paths,
        frontEndFramework: this.options.frontEndFramework,
        jQuery: this.options.jQuery,
        markupLanguage: this.options.markupLanguage,
        markupIntegration: this.options.markupIntegration
      }
    )

    this.log(chalk.yellow('Copying gulpfile config file.'))
    this.fs.copyTpl(
      this.templatePath('gulp/_config.js'),
      this.destinationPath(this.paths.src.gulp + '/config.js'), {
        paths: this.paths,
        markupLanguage: this.options.markupLanguage,
        frontEndFramework: this.options.frontEndFramework,
        jQuery: this.options.jQuery
      }
    )

    this.log(chalk.yellow('Copying webpack config file.'))
    this.fs.copyTpl(
      this.templatePath('gulp/webpack.config.js'),
      this.destinationPath(this.paths.src.gulp + '/webpack.config.js')
    )

    // fonts
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/fonts.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/fonts.js'), {
        paths: this.paths
      }
    )

    // FTP
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/ftp.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/ftp.js'), {
        paths: this.paths
      }
    )

    // markup
    if (!this.options.markupIntegration) {
      this.fs.copyTpl(
        this.templatePath('gulp/tasks/markup.js'),
        this.destinationPath(this.paths.src.gulp_tasks + '/markup.js'), {
          paths: this.paths,
          markupLanguage: this.options.markupLanguage,
          clientId: this.options.clientId,
          projectId: this.options.projectId
        }
      )
    }

    // scripts
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/scripts.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/scripts.js'), {
        paths: this.paths
      }
    )

    // Serve
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/serve.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/serve.js'), {
        paths: this.paths,
        frontEndFramework: this.options.frontEndFramework,
        jQuery: this.options.jQuery,
        markupLanguage: this.options.markupLanguage,
        markupIntegration: this.options.markupIntegration
      }
    )

    // static
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/static.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/static.js'), {
        paths: this.paths,
        markupLanguage: this.options.markupLanguage,
        markupIntegration: this.options.markupIntegration
      }
    )

    // styles
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/styles.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/styles.js'), {
        frontEndFramework: this.options.frontEndFramework,
        paths: this.paths
      }
    )

    // zip
    this.fs.copyTpl(
      this.templatePath('gulp/tasks/zip.js'),
      this.destinationPath(this.paths.src.gulp_tasks + '/zip.js'), {
        paths: this.paths
      }
    )
  }

  writeMarkupIntegrationFiles () {
    if (this.options.markupIntegration === 'jekyll') {
      this.log(chalk.yellow('Copying Jekyll main files.'))
      this.fs.copyTpl(
        this.templatePath('markup/jekyll/_Gemfile'),
        this.destinationPath('Gemfile'), {
        }
      )

      this.fs.copyTpl(
        this.templatePath('markup/jekyll/_config.yml'),
        this.destinationPath('_config.yml'), {
          projectName: this.options.projectName
        }
      )

      this.fs.copyTpl(
        this.templatePath('gulp/tasks/jekyll.js'),
        this.destinationPath(this.paths.src.gulp_tasks + '/jekyll.js'), {
          paths: this.paths
        }
      )

      for (var i = 1; i < this.options.qtyScreens + 1; i++) {
        this.fs.copyTpl(
          this.templatePath('markup/jekyll/_screen.html'),
          this.destinationPath(this.paths.src.markup + '/screen-' + i + '.html'), {
            screenNumber: i,
            projectName: this.options.projectName,
            frontEndFramework: this.options.frontEndFramework,
            jQuery: this.options.jQuery
          }
        )
      }

      this.fs.copyTpl(
        this.templatePath('markup/jekyll/_includes/shared/head.html'),
        this.destinationPath(this.paths.src.markup + '/_includes/shared/head.html'), {
          frontEndFramework: this.options.frontEndFramework
        }
      )
      this.fs.copyTpl(
        this.templatePath('markup/jekyll/_includes/shared/foot.html'),
        this.destinationPath(this.paths.src.markup + '/_includes/shared/foot.html'), {
          frontEndFramework: this.options.frontEndFramework,
          jQuery: this.options.jQuery
        }
      )
      this.fs.copyTpl(
        this.templatePath('markup/jekyll/_layouts/default.html'),
        this.destinationPath(this.paths.src.markup + '/_layouts/default.html'), {
        }
      )
    }
  }

  writeProjectConfigFile () {
    var configJson = {
      'projectName': this.options.projectName,
      'qtyScreens': this.options.qtyScreens,
      'markupLanguage': this.options.markupLanguage,
      'markupIntegration': this.options.markupIntegration,
      'frontEndFramework': this.options.frontEndFramework,
      'jQuery': this.options.jQuery,
      'generatedBy': 'Pixel2HTML',
      'generatorVersion': pkg.version,
      'generatedAt': moment().format()
    }

    this.fs.writeJSON('./.project.conf', configJson)
  }
}

module.exports = PixelGenerator
