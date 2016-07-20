import express from 'express';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import mongoose from 'mongoose';
import User from './models/user';
import StackData from './models/stackdata';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcrypt-nodejs';
import jwt from 'jwt-simple';
import secret from './secret';
import passportAuth from './passport/passport';
import localAuth from './passport/local';
import github from './passport/github';
import passport from 'passport';
import logout from 'express-passport-logout';
import React from 'react';
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
var routes = require('./compiled/src/bundle').default;

var app = express();

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/compiled')));


// Mongoose Connection (Refactor into Separate File)
var databaseURL = process.env.MONGOLABS ||'mongodb://localhost:27017/stack-salaries'

mongoose.connect(databaseURL);

// Helper Methods (Refactor into Separate File)
function generateToken(user){
  // Add issued at timestamp and subject
  // Based on the JWT convention
  var timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, secret.secret);
}

// Set to false since tokens are being used
// This is Passport Authentication setup
// Github auth will be added here as well
var requireAuth = passport.authenticate('jwt', { session: false } );
var requireSignIn = passport.authenticate('local', { session: false });
var githubAuth = passport.authenticate('github', { session: false, successRedirect: '/', failureRedirect: '/login'});

// Allow all headers
app.all('*', function(req, res, next) { 
  res.header('Access-Control-Allow-Origin', '*'); 
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS'); 
  res.header('Access-Control-Allow-Headers', 'Content-Type'); 
  next(); 
});

// Get all Stack Entries
app.get('/stackdata', function(req, res, next){
  // StackData.find({}, function(err, entries){
  //   if(!err) {
  //     res.send(200, entries);
  //   } else {
  //     throw err;
  //   }
  // });
})

// Add a Stack Entry
app.post('/stackentry', function(req, res, next){

});

// app.get('/auth/github', githubAuth, function(req, res){
// });

// app.get('/auth/github/callback', githubAuth, function(req, res) {
//     res.redirect('/dashboard');
// });


// app.get(['/dashboard'], function(req, res) {
//   /* Use React Router */

//   match({routes: Router, location: req.url}, function(error, redirectLocation, renderProps) {
//     /* Send response */
//   });
// });

// GET all users
app.get('/users', function(req, res, next){
  User.find({}, function(err, users){
    if(!err) {
      res.send(200, users);
    } else {
      throw err;
    }
  });
});

app.get('/users/:id', function(req, res, next){
  var id = req.params.id;

  // A friendly error to display if no user matches the id
  var err = "No such user with the given id";

   User.findOne({ id: id}, function(err, existingUser){
    if(err) {
      res.send(err);
    } else {
      res.json(existingUser);
    }
   });
});

// The middleware will verify credentials
// If successful, hand a token
app.post('/signin', requireSignIn, function(req, res, next){
  var userToken = generateToken(req.user);

  res.send({token: userToken });
});

app.post('/signup', function(req, res, next){
  var name = req.body.name;
  var email = req.body.email;
  var password = req.body.password;

  // Validation to check if all the fields were being passed
  if(!email || !password || !name){
    return res.send(422, {error: "Please fill out all the fields"});
  }

  // Check email already exists
  User.findOne({ email: email}, function(err, existingUser){

    if(err) { return next(err); }

    // If it does, return "existing account" message
    if(existingUser){
      // Return unprocessable entity
      return res.send(422, { error: 'Email is in use' });
    }

    // If not, create and save user
    var user = new User({
      name: name,
      email: email,
      password: password,
    });

    user.save(function(err){
      if (err) { return next(err); }

      // Send user back a JWT upon successful account creation
      res.json({ token: generateToken(user)});
    });

  });

});

app.get('/logout', logout(), function(req, res, next){
  res.redirect('/login');
});

// Root Path
app.get('*', function(req, res, next) {
  match({ routes, location: req.url }, (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      // You can also check renderProps.components or renderProps.routes for
      // your "not found" component or route respectively, and send a 404 as
      // below, if you're using a catch-all route.
      res.status(200).send(renderToString(<RouterContext {...renderProps} />))
    } else {
      res.status(404).send('Not found')
    }
  })
});

var port = process.env.PORT || 3000;

app.listen(port);
console.log('Server now listening on port ' + port);

module.exports = app;