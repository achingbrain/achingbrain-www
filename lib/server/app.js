var config = require('rc')('achingbrain', {
    www: {
      port: process.env.PORT || 16000,
      host: '0.0.0.0'
    },
    articles: {
      path: __dirname + '/../../articles'
    }
  }),
  Container = require('wantsit').Container,
  winston = require('winston'),
  Express = require('express'),
  expressHbs = require('express3-handlebars'),
  http = require('http'),
  marked = require('marked'),
  moment = require('moment')

var AchingBrain = function() {

  // set up logging
  var logger = new winston.Logger({
    transports: [
      new (winston.transports.Console)({
        timestamp: true,
        colorize: true
      })
    ]
  })

  // create container
  this._container = new Container({
    logger: logger
  })

  this._container.register('logger',logger)

    // parse configuration
  this._container.register('config', config)

  // web controllers
  this._container.createAndRegisterAll(__dirname + '/components')
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
  var port = config.www.port

  var express = Express()
  express.set('port', port)
  express.engine('handlebars', expressHbs({
    partialsDir: __dirname + '/views/partials',
    helpers: {
      dateToYear: function(date) {
        return date.getFullYear()
      },
      articleDate: function(date) {
        return moment(date).fromNow()
      },
      markdown: function(text) {
        //return ghfmd.parse(text)
        return marked(text)
      }
    }
  }))
  express.set('view engine', 'handlebars')
  express.set('views', __dirname + '/views')

  // create routes
  this._route(express, 'homeController', '/', 'get')
  this._route(express, 'archiveController', '/archive', 'get')
  this._route(express, 'contactController', '/contact', 'get')
  this._route(express, 'articleController', '/:slug', 'get')

  express.use(Express.static(__dirname + '/../../public'))
  express.use('/lib/bootstrap',  Express.static(__dirname + '/../../bower_components/bootstrap/dist'))
  express.use('/lib/jquery',  Express.static(__dirname + '/../../bower_components/jquery/dist'))
  express.use('/lib/color',  Express.static(__dirname + '/../../bower_components/color'))

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
