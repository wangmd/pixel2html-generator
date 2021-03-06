import helpers from 'yeoman-test'
import assert from 'yeoman-assert'
import path from 'path'

describe('jQuery features', function () {
  beforeEach(function () {
    return helpers.run(path.join(__dirname, '../app'))
      .withOptions({
        'skip-install': true
      })
      .withPrompts({
        projectName: 'Pixel2HTML',
        qtyScreens: 3,
        markupLanguage: 'html',
        frontEndFramework: 'bootstrap',
        jQuery: true
      })
      .toPromise()
  })

  it('should list dependencies in package.json', function () {
    assert.fileContent('package.json', /"jquery"/)
  })

  it('should import jQuery', function () {
    assert.fileContent('src/assets/js/general/index.js', /import '.\/jquery'/)
  })

  it('should be a jquery file', function () {
    assert.file([
      'src/assets/js/general/jquery.js'
    ])
  })

  it('should exists a gulp routine', function () {
    assert.file([
      'gulp/tasks/scripts.js'
    ])
  })
})
