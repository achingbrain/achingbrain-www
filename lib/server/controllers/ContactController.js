var Autowire = require('wantsit').Autowire,
  pkg = require(__dirname + '/../../../package.json')

var ContactController = function() {
  this._config = Autowire
}

ContactController.prototype.get = function(request, response){
  response.render('contact', {
    version: pkg.version
  })
}

module.exports = ContactController
