'use strict'

var requireDir = require('require-dir')
var gulp    = require('gulp')
var config  = require('./gulp/config')
var browserSync = require('browser-sync')


// Add all the tasks and files, boom!
requireDir('<%= paths.src.gulp %>', {
  recurse: true
})

gulp.task('build', gulp.series(
  'clean',
  'main:static',
  'main:scripts',
  'vendor:scripts',
  'main:fonts',
  <% if(markupIntegration=='jekyll'){ %>'jekyll:build'
  <% } else { %>'main:markup'<% } %>,
  'vendor:styles',
  'main:styles'
))


function reload(done) {
  browserSync.reload()
  done()
}

gulp.task('browser-sync', () => {
  return browserSync.init({
    server : {
      baseDir : config.directories.dist.base,
      serveStaticOptions : {
        extensions : ['html']
      }
    },
    open : false,
    logConnections : true
  })
})

gulp.task('watch', done => {
  //static files
  <% if(markupIntegration == 'jekyll'){ %>
    gulp.watch(config.directories.src.markup+'/**/*.html', gulp.series('jekyll:rebuild', reload))
    gulp.watch(config.directories.src.icons+'/**/*', gulp.series( 'main:icons', reload ))
  <% } else { %>
    gulp.watch(config.directories.src.markup+'/**/*.<%=markupLanguage%>', gulp.series( 'main:markup', reload ))
    gulp.watch(config.directories.src.icons+'/**/*', gulp.series( 'main:icons', reload ))
  <% } %>

  gulp.watch(config.directories.src.images+'/**/*', gulp.series( 'main:images', reload ))
  gulp.watch(config.project.fontFiles, gulp.series( 'main:fonts', reload ))

  //scripts
  gulp.watch(config.directories.src.scripts+'/**/*.js', gulp.series( 'main:scripts', reload ))

  //styles
  gulp.watch([
    config.directories.src.styles+'/**/*.<%=cssProcessor%>',
    '!<%= paths.src.frontendframework %>/**/*',
  ], gulp.series( 'main:styles', reload ))

  done()
})

gulp.task('serve', gulp.parallel('browser-sync', 'watch'))

gulp.task('release', gulp.series('build', 'zip'))

gulp.task('default', gulp.series('build', 'serve'))
