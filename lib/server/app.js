var config = require('rc')('achingbrain', {
    www: {
      port: 15000,
      host: '0.0.0.0'
    }
  }),
  Container = require('wantsit').Container,
  winston = require('winston'),
  Express = require('express'),
  expressHbs = require('express3-handlebars'),
  http = require('http')

var AchingBrain = function() {
  // create container
  this._container = new Container()

  // set up logging
  var logger = this._container.createAndRegister('logger', winston.Logger, {
    transports: [
      new (winston.transports.Console)({
        timestamp: true,
        colorize: true
      })
    ]
  })

  // parse configuration
  this._container.register('config', config)

  // web controllers
  this._container.createAndRegisterAll(__dirname + '/controllers')

  // create express
  this._express = this._createExpress()
  this._server = http.createServer(this._express)

  // make errors a little more descriptive
  process.on('uncaughtException', function (exception) {
    logger.error('AchingBrain', 'Uncaught exception', exception && exception.stack ? exception.stack : 'No stack trace available')

    throw exception
  }.bind(this))

  // make sure we shut down cleanly
  process.on('SIGINT', this.stop.bind(this))

  // make sure we shut down cleanly
  process.on('message', function(message) {
    if (message == 'shutdown') {
      this.stop()
    }
  })

  // make sure we shut down cleanly
  //process.on('exit', this.stop.bind(this, 'exit'))

  process.nextTick(function() {
    this._server.listen(this._express.get('port'), config.www.address, function() {
      logger.info('Express server listening on ' + this._server.address().address + ':' + this._server.address().port);
    }.bind(this));
  }.bind(this));
}

AchingBrain.prototype._createExpress = function() {
  var port = process.env.PORT || config.www.port

  var express = Express()
  express.set('port', port)
  express.engine('handlebars', expressHbs({extname:'handlebars'}))
  express.set('view engine', 'handlebars')
  express.set('views', __dirname + '/views')

  // create routes
  this._route(express, 'homeController', '/', 'get')
  this._route(express, 'archiveController', '/archive', 'get')
  this._route(express, 'contactController', '/contact', 'get')
  this._route(express, 'articleController', '/:article', 'get')

  express.use(Express.static(__dirname + '/public'))

  return express;
}

AchingBrain.prototype._route = function(express, controller, url, method) {
  var component = this._container.find(controller)

  express[method](url, component[method].bind(component))
}

AchingBrain.prototype.stop = function() {
  var logger = this._container.find('logger');
  logger.info('AchingBrain', 'Shutting down Express')

  this._server.close(function() {
    logger.info('AchingBrain', 'Express shut down.')
  })
}

module.exports = AchingBrain;
