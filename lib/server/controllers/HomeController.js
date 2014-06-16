var Autowire = require('wantsit').Autowire

var HomeController = function() {
  this._config = Autowire
  this._articleRepository = Autowire
}

HomeController.prototype.get = function(request, response){
  var meta = this._articleRepository.firstByDate()

  response.redirect(302, '/' + meta.slug)
}

module.exports = HomeController
