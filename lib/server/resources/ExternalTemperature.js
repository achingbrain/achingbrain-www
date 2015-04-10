var Autowire = require('wantsit').Autowire
var util = require('util')

var ExternalTemperature = function() {
  this._config = Autowire
  this._database = Autowire
  this._lastTemperature = null
}

ExternalTemperature.prototype.retrieveAll = function(request, response) {
  this._database.query('SELECT date, temp FROM temp_external', function (error, result) {
    if(error) {
      return response(error)
    }

    response.json(result.rows)
  })
}

ExternalTemperature.prototype.create = function(request, response) {
  // so secure
  if (request.body.token !== this._config.meatmon.token) {
    return response.status(403)
  }

  this._lastTemperature = parseInt(request.body.celsius)

  var query = util.format('INSERT INTO temp_external(date, temp) values(%d, %d)', Date.now(), this._lastTemperature)

  this._database.query(query, function (error, result) {
    if(error) {
      console.error(error)
      return response.send(error)
    }

    response.status(201).json(result)
  })
}

ExternalTemperature.prototype.getLastTemperature = function() {
  return this._lastTemperature
}

module.exports = ExternalTemperature
