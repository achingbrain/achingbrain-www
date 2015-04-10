var config = require('rc')('achingbrain', {
    www: {
      port: Number(process.env.PORT || 16000),
      host: '0.0.0.0'
    },
    articles: {
      path: __dirname + '/../../articles'
    },
    database: {
      url: process.env.DATABASE_URL || 'postgres://localhost:5432/meatmon_db'
    },
    meatmon: {
      token: process.env.MEATMON_TOKEN || 'securelolz'
    }
  })
var Container = require('wantsit').Container
var Express = require('express')
var expressHbs = require('express3-handlebars')
var http = require('http')
var marked = require('marked')
var moment = require('moment')
var logfmt = require('logfmt')
var Columbo = require('columbo')
var bodyParser = require('body-parser')

var AchingBrain = function() {

  this._logger = console
  this._logger.debug = function() {}

  // create container
  this._container = new Container({
    logger: this._logger
  })

  this._container.register('logger', this._logger)

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
    this._logger.error('AchingBrain', 'Uncaught exception', exception && exception.stack ? exception.stack : 'No stack trace available')

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
      this._logger.info('Express server listening on ' + this._server.address().address + ':' + this._server.address().port);
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
  this._route(express, 'meatmonGraphController', '/meatmon/graph', 'get')

  var columbo = new Columbo({
    resourceDirectory: __dirname + '/resources',
    resourceCreator: function(resource, name, callback) {
      this._container.createAndRegister(name + 'Resource', resource, callback);
    }.bind(this),
    idFormatter: function(id) {
      return ":" + id;
    },
    optionsSender: function (options, request, response) {
      response.json(options);
    }
  });
  columbo.discover(function(error, routes) {
    routes.forEach(function(resource) {
      express[resource.method.toLowerCase()]('/meatmon/api' + resource.path, resource.handler);
    });
  })

  express.use(logfmt.requestLogger())
  express.use(bodyParser.json())
  express.use(Express.static(__dirname + '/../../public'))

  express.use('/lib/bootstrap',  Express.static(__dirname + '/../../bower_components/bootstrap/dist'))
  express.use('/lib/jquery.js',  Express.static(__dirname + '/../../bower_components/jquery/dist/jquery.min.js'))
  express.use('/lib/jquery.min.map',  Express.static(__dirname + '/../../bower_components/jquery/dist/jquery.min.map'))
  express.use('/lib/color.js',  Express.static(__dirname + '/../../bower_components/color/one-color.js'))
  express.use('/lib/highcharts.js',  Express.static(__dirname + '/../../bower_components/highcharts-release/highcharts.js'))
  express.use('/lib/async.js',  Express.static(__dirname + '/../../bower_components/async/lib/async.js'))

  return express;
}

AchingBrain.prototype._route = function(express, controller, url, method) {
  var component = this._container.find(controller)

  express[method](url, component[method].bind(component))
}

AchingBrain.prototype.stop = function() {
  this._logger.info('AchingBrain', 'Shutting down Express')

  this._server.close(function() {
    this._logger.info('AchingBrain', 'Express shut down.')
    process.exit(0)
  }.bind(this))

  setTimeout(function() {
    process.exit(0)
  }, 1000)
}

module.exports = AchingBrain;
