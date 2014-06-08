var Autowire = require('wantsit').Autowire,
  pkg = require(__dirname + '/../../../package.json')

var ArticleController = function() {
  this._config = Autowire
}

ArticleController.prototype.get = function(request, response){
  response.render('article', {
    version: pkg.version
  })
}

module.exports = ArticleController
