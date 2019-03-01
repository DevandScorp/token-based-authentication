const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const request = require('superagent');
const auth = require('./routes/auth').router;
const user = require('./routes/user');
const facebook = require('./routes/facebook');
const github = require('./routes/github');
require('./passport');

const connect = mongoose.connect(process.env.MONGOLAB_URI, { useNewUrlParser: true });

connect.then(() => {
  console.log('Connected correctly to the database');
}, (err) => { console.log(err); });

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(cors());

app.use('/auth', auth);

app.use('/user', passport.authenticate('jwt', { session: false }), user);
app.use('/facebook', passport.authenticate('facebook-token', { session: false }), facebook);
app.use('/github', passport.authenticate('github-token', { session: false }), github);

app.get('/githubAuth/access_token', (req, res) => {
  const { query } = req;
  const { code } = query;
  request
    .post('https://github.com/login/oauth/access_token')
    .send({
      client_id: 'ed4f0f433db3e37aa087',
      client_secret: '377489269ee1f83d71e263473d157a16879ff6d8',
      code,
    })
    .set('Accept', 'application/json')
    .then((response) => {
      const data = response.body;
      const token = data.access_token;
      request.get(`${process.env.SERVER_URL}github/profile?access_token=${token}`)
        .then((githubResponse) => {
          res.json(githubResponse.body);
        })
        .catch(err => res.json({ status: 'danger', message: `${err}` }));
    })
    .catch(err => res.json({ status: 'danger', message: `${err}` }));
});
app.get('/githubAuth/return', (req, res) => {
  const { query } = req;
  const { code } = query;
  res.redirect(`https://devandscorp.github.io/passport-token/?code=${code}`);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Connected correctly to the server');
});
