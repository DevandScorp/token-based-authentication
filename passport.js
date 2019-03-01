/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const passport = require('passport');
const passportJWT = require('passport-jwt');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const FacebookTokenStrategy = require('passport-facebook-token');
const GitHubTokenStrategy = require('passport-github-token');
const User = require('./models/user');


const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;

passport.use(new FacebookTokenStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
}, ((accessToken, refreshToken, profile, cb) => {
  User.findOne({ facebookId: profile.id }, (err, user) => {
    if (err) {
      return cb(err, false);
    }
    if (!err && user !== null) {
      return cb(null, user);
    }
    user = new User({ username: profile.displayName });
    user.facebookId = profile.id;
    if (profile.photos[0]) {
      user.imageURL = profile.photos[0].value;
    }
    user.save((error, userCreated) => {
      if (error) {
        return cb(error, false);
      }
      return cb(null, userCreated);
    });
  });
})));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.SECRET_OR_KEY,
}, (jwtPayload, cb) => {
  User.findOne({ _id: jwtPayload._id }, (err, user) => {
    if (err) {
      return cb(err, false);
    }
    if (user) {
      return cb(null, user);
    }

    return cb(null, false);
  });
}));
passport.use(new GitHubTokenStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  passReqToCallback: true,
}, ((req, accessToken, refreshToken, profile, cb) => {
  User.findOne({ githubId: profile.id }, (err, user) => {
    if (err) {
      return cb(err, false);
    }
    if (!err && user !== null) {
      return cb(null, user);
    }
    user = new User({
      username: profile.username,
      githubId: profile.id,
      imageURL: profile._json.avatar_url,
    });
    user.save((error, userCreated) => {
      if (error) {
        return cb(error, false);
      }
      return cb(null, userCreated);
    });
  });
})));
passport.use(new LocalStrategy(((username, password, done) => {
  const query = { username };
  User.findOne(query, (err, user) => {
    if (err) throw err;
    if (!user) {
      return done(null, false, { message: 'No user found' });
    }

    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      }
      return done(null, false, { message: 'Wrong password' });
    });
  });
})));
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});
