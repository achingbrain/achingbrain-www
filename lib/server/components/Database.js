var Autowire = require('wantsit').Autowire
var pg = require('pg')

var Database = function() {
  this._config = Autowire
}

Database.prototype.afterPropertiesSet = function(done) {
  pg.connect(this._config.database.url, function(error, client) {
    if (error) {
      return done(error)
    }

    this._client = client

    done()
  }.bind(this))
}

Database.prototype.query = function(string, callback) {
  this._client.query(string, callback)
}

module.exports = Database
