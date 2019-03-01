/* eslint-disable no-underscore-dangle */
const express = require('express');

const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../models/user');

router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username,
    password: req.body.password,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
  });
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        res.json({ status: 'danger', message: `${err}` });
      }
      newUser.password = hash;
      newUser.save((err) => {
        if (err) {
          res.json({ status: 'danger', message: `${err}` });
        } else {
          res.json({ status: 'success', message: 'Successfully signed up' });
        }
      });
    });
  });
});
function getToken(user) {
  console.log(user);
  if (user) {
    return jwt.sign(user.toJSON(), process.env.SECRET_OR_KEY, { expiresIn: 3600 });
  }
}
module.exports.getToken = getToken;
router.post('/login', (req, res, next) => {
  passport.authenticate('local', { session: false }, (err, user, info) => {
    if (err || !user) {
      res.json({ status: 'danger', message: `${err}` });
    }
    req.login(user, { session: false }, (err) => {
      if (err) {
        res.json({ status: 'danger', message: `${err}` });
      }

      const token = getToken(user);
      res.json({
        status: 'success',
        message: 'Successfully logged in',
        token,
      });
    });
  })(req, res);
});
module.exports.router = router;
