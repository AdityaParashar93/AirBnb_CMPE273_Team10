
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var home = require('./routes/home');
var LocalStrategy = require("passport-local").Strategy;
var passport = require('passport');
require('./routes/passportj')(passport);

//URL for the sessions collections in mongoDB
var mongoSessionConnectURL = "mongodb://localhost:27017/AirbnbDatabaseMongoDB";
var expressSession = require("express-session");
var mongoStore = require("connect-mongo/es5")(expressSession);
var mongo = require("./routes/mongo");

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.favicon("public/images/favicon.png"));
app.use(express.logger('dev'));
app.use(express.methodOverride());
app.use(express.json());
app.use(express.urlencoded());

app.use(expressSession({
	secret : 'cmpe273_AIRBNB_SECRET_STRING',
	resave : false, // don't save session if unmodified
	saveUninitialized : false, // don't create session until something stored
	duration : 30 * 60 * 1000,
	activeDuration : 5 * 60 * 1000,
	store : new mongoStore({
		url : mongoSessionConnectURL
	})
}));

app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.use(passport.initialize());
app.use(passport.session());

//POST
app.post('/registerNewUser', home.registerNewUser);
app.post('/signin', function(req, res, next) {
	console.log("INSIDE POST METHOD signin");
	console.log(req.body);
	passport.authenticate('signin', function(err, user) {
		if (err) {
			console.log(err);
		}
		if (user) {
			req.session.username = user.username;
			console.log(req.session.username);
			
			console.log('BEFORE SENDING');
			console.log(user);
			res.send({
				'statusCode' : 200
			});
		} else {
			res.send({
				'statusCode' : 401
			});
		}

		console.log("SESSION STARTED IN PASSPORT");
	})(req, res, next);
});
app.post('/logout', home.logout);

//GET
app.get('/', home.land);
app.get('/successLogin', home.redirectToHomepage);



mongo.connect(mongoSessionConnectURL, function() {
	console.log('Connected to mongo at: ' + mongoSessionConnectURL);
	http.createServer(app).listen(app.get('port'), function() {
		console.log('Express server listening on port ' + app.get('port'));
	});
});
