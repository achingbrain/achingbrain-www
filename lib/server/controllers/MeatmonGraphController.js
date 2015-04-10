var Autowire = require('wantsit').Autowire

var MeatmonGraphController = function() {
  this._config = Autowire
  this._database = Autowire;
  this._internalTemperatureResource = Autowire;
  this._externalTemperatureResource = Autowire;
}

MeatmonGraphController.prototype.get = function(request, response) {
  var targetTemperature = 80
  var sampleSize = 50
  var ready

  this._database.query('SELECT date, temp FROM temp_internal', function(error, result) {

    if(result.rowCount < sampleSize) {
      ready = "Not enough data yet.."
    } else {
      var start = result.rows[result.rows.length - sampleSize]
      var current = result.rows[result.rows.length - 1]

      var seconds = (current.date - start.date) / 1000
      var temperatureDiff = current.temp - start.temp
      var increasePerSeconds = temperatureDiff/seconds
      var requiredDiff = targetTemperature - current.temp
      var readyInSeconds = requiredDiff/increasePerSeconds
      ready = new Date(Date.now() + (readyInSeconds * 1000))

      if(ready.getTime() < Date.now()) {
        ready = "Now!"
      }
    }

    response.render('meatmongraph', {
      internalTemperature: this._internalTemperatureResource.getLastTemperature(),
      externalTemperature: this._externalTemperatureResource.getLastTemperature(),
      ready: ready
    })
  }.bind(this))
}

module.exports = MeatmonGraphController
