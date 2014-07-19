var Autowire = require('wantsit').Autowire,
  fs = require('fs'),
  async = require('async'),
  yaml = require('js-yaml')

var ArticleRepository = function() {
  this._config = Autowire
  this._logger = Autowire
  this._articlesBySlug = {}
  this._articlesByDate = []
}

ArticleRepository.prototype.afterPropertiesSet = function() {
  fs.readdir(this._config.articles.path, function(error, files) {
    if(error) return this._logger.error(error)

    var tasks = []

    files.forEach(function(file) {
      if(file.substring(0, 1) == '.' || file.substring(file.length - 3, file.length) != '.md') {
        return;
      }

      var path = this._config.articles.path + '/' + file

      tasks.push(function(done) {
        fs.readFile(path, function(error, contents) {
          if(error) return done(error)

          var parts = contents.toString().split(/\r?\n(\s+)?\r?\n/)
          var meta = yaml.safeLoad(parts[0]).meta
          meta.file = path
          meta.slug = file.slice(0, -3)

          done(null, meta)
        }.bind(this))
      }.bind(this))
    }.bind(this))

    async.parallelLimit(tasks, 10, function(error, results) {
      if(error) return this._logger.error(error)

      results.forEach(function(meta) {
        if(meta.draft) {
          // skip draft articles
          return
        }

        this._articlesBySlug[meta.slug] = meta
        this._articlesByDate.push(meta)
      }.bind(this))

      this._articlesByDate.sort(function(a, b) {
        return a.date.getTime() > b.date.getTime()
      })

      for(var i = 0;i < this._articlesByDate.length; i++) {
        if(i > 0) {
          this._articlesByDate[i].previous = this._articlesByDate[i - 1]
        }

        if(i < (this._articlesByDate.length - 1)) {
          this._articlesByDate[i].next = this._articlesByDate[i + 1]
        }
      }
    }.bind(this))
  }.bind(this))
}

ArticleRepository.prototype.findBySlug = function(slug) {
  return this._articlesBySlug[slug]
}

ArticleRepository.prototype.firstByDate = function() {
  return this._articlesByDate[this._articlesByDate.length - 1];
}

ArticleRepository.prototype.getArticleText = function(meta, callback) {
  if(!meta.slug || !this.findBySlug(meta.slug)) {
    return callback(new Error('Invalid article'))
  }

  var file = this._config.articles.path + '/' + meta.slug + '.md'

  fs.readFile(file, function(error, contents) {
    if(error) return callback(error)

    var parts = contents.toString().split(/\r?\n(\s+)?\r?\n/)
    parts.splice(0, 1)

    callback(null, parts.join("\r\n").trim())
  }.bind(this))
}

module.exports = ArticleRepository
