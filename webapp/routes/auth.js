
var express = require('express');
var router = express.Router();

const passport = require('passport');

router.post('/signup', 
passport.authenticate('signup', { failureRedirect: '/login' }),
  function(req, res) {
    res.send({ redirectUrl: '/' });
});

router.post('/login', 
passport.authenticate('login', { failureRedirect: '/login' }),
  function(req, res) {
    res.send({ redirectUrl: '/' });
});

module.exports = router;