const gulp = require('gulp')
const config = require('../config')
const browserSync = require('browser-sync')

const reload = done => {
  browserSync.reload()
  done()
}

gulp.task('browser-sync', done => {
  browserSync.init({
    server: {
      baseDir: config.directories.dist.base,
      serveStaticOptions: {
        extensions: ['html']
      }
    },
    open: false,
    logConnections: true,
    logPrefix: 'Pixel2Html'
  })
  done()
})

gulp.task('watch', done => {
  //static files
  <% if(markupIntegration === 'jekyll'){ %>
    gulp.watch(config.directories.src.markup+'/**/*.html', gulp.series('jekyll:rebuild', reload))
    gulp.watch(config.directories.src.icons+'/**/*.svg', gulp.series( 'icons', reload ))
  <% } else if (markupLanguage === 'pug') { %>
    gulp.watch(config.directories.src.markup+'/**/*.<%=markupLanguage%>', gulp.series( 'markup', reload ))
    gulp.watch(config.directories.src.icons+'/**/*.svg', gulp.series( 'markup', reload ))
  <% } else { %>
    gulp.watch(config.directories.src.markup+'/**/*.<%=markupLanguage%>', gulp.series( 'markup', reload ))
    gulp.watch(config.directories.src.icons+'/**/*.svg', gulp.series( 'icons', reload ))
  <% } %>

  gulp.watch(config.directories.src.images+'/**/*', gulp.series( 'images', reload ))

  //scripts
  gulp.watch(config.directories.src.scripts+'/**/*.js', gulp.series( 'scripts', reload ))

  // Fonts
  gulp.watch(config.project.fontFiles, gulp.series('fonts', reload))

  //styles
  gulp.watch(config.directories.src.styles + '/**/*.scss', gulp.series('styles', reload))

  done()
})

<% if(markupIntegration=='jekyll'){ -%>
gulp.task('jekyll:rebuild', gulp.series('jekyll', reload))
<% } %>
