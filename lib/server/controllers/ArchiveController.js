var Autowire = require('wantsit').Autowire,
  pkg = require(__dirname + '/../../../package.json')

var ArchiveController = function() {
  this._config = Autowire
}

ArchiveController.prototype.get = function(request, response){
  response.render('archive', {
    version: pkg.version
  })
}

module.exports = ArchiveController
