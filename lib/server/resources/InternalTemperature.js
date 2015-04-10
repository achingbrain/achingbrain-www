var Autowire = require('wantsit').Autowire
var util = require('util')

var InternalTemperature = function() {
  this._config = Autowire
  this._database = Autowire
  this._lastTemperature = null
}

InternalTemperature.prototype.retrieveAll = function(request, response) {
  this._database.query('SELECT date, temp FROM temp_internal', function (error, result) {
    if(error) {
      return response.send(error)
    }

    response.send(result.rows)
  })
}

InternalTemperature.prototype.create = function(request, response) {
  // so secure
  if (request.body.token !== this._config.meatmon.token) {
    return response.status(403)
  }

  this._lastTemperature = parseInt(request.body.celsius)

  var query = util.format('INSERT INTO temp_internal(date, temp), values(%d, %d)', Date.now(), this._lastTemperature)

  this._database.query(query, function (error, result) {
    if(error) {
      return response.send(error)
    }

    response.status(201).send(result)
  })
}

InternalTemperature.prototype.getLastTemperature = function() {
  return this._lastTemperature
}

module.exports = InternalTemperature
