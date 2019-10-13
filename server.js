/*
var express = require('express');
var route = require('./routes/route');
var tweets = require('./routes/tweets');
require('./db/mongoose');

// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(route);
app.use(tweets);

app.listen(process.env['PORT'] || 8080);

*/

require('dotenv').config();

var express = require('express');
var passport = require('passport');
var Strategy = require('passport-twitter').Strategy;


var trustProxy = false;
if (process.env.DYNO) {
  trustProxy = true;
}

passport.use(new Strategy({
    consumerKey: 'gXPyrnjJjgoCRFgSmYqddTWJn',
    consumerSecret: 'bgZNCMCRxh9H1JWD81LszldLpYy9ark3SI6cH6cwWkU8eY5BQH',
    callbackURL: '/oauth/callback',
    proxy: trustProxy
  },
  function(token, tokenSecret, profile, cb) {
    return cb(null, profile);
  }));


passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});


// Create a new Express application.
var app = express();

// Configure view engine to render EJS templates.
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// logging, parsing, and session handling.
app.use(require('morgan')('combined'));
app.use(require('body-parser').urlencoded({ extended: true }));
app.use(require('express-session')({ secret: 'keyboard cat', resave: true, saveUninitialized: true }));

// Initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize());
app.use(passport.session());


// Define routes.
app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
  });

app.get('/login',
  function(req, res){
    console.log('ENV');
    console.log(process.env);
    console.log('Headers:');
    console.log(req.headers)
    res.render('login');
  });

app.get('/login/twitter',
  passport.authenticate('twitter'));

app.get('/oauth/callback',
  passport.authenticate('twitter', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });

  app.get('/tweets', 
    require('connect-ensure-login').ensureLoggedIn(),
    (req, res) => {
      client.get('search/tweets', {q: '#ios #swift'}, function(error, tweets, response) {
        res.render('tweets', { tweets: tweets.statuses });
        //res.send({tweets: tweets.statuses});
     });
      
    }
    
);

app.get('/logout',
  function(req, res){
    req.session.destroy(function (err) {
      res.redirect('/');
    });
  });

app.listen(process.env['PORT'] || 8080);
