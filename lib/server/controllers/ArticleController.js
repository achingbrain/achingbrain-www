var Autowire = require('wantsit').Autowire,
  pkg = require(__dirname + '/../../../package.json')

var ArticleController = function() {
  this._config = Autowire
  this._articleRepository = Autowire
  this._logger = Autowire
}

ArticleController.prototype.get = function(request, response) {
  var meta;

  if(request.params.slug) {
    meta = this._articleRepository.findBySlug(request.params.slug)
  }

  if(!meta) {
    response.status(404)
    response.render('404', {
      now: new Date()
    })
    return
  }

  this._articleRepository.getArticleText(meta, function(error, article) {
    if(error) {
      this._logger.error("Could not get article text", error)

      return response.status(500)
    }

    response.render('article', {
      version: pkg.version,
      title: meta.title,
      meta: meta,
      article: article,
      now: new Date(),
      next: meta.next,
      previous: meta.previous
    })
  }.bind(this))
}

module.exports = ArticleController
