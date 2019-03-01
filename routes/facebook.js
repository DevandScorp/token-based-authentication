const express = require('express');
const { getToken } = require('./auth');

const router = express.Router();


/* GET users listing. */
router.get('/', (req, res, next) => {
  res.send('respond with a resource');
});

/* GET user profile. */
router.get('/profile', (req, res, next) => {
  const token = getToken(req.user);
  res.json({
    status: 'success',
    message: 'Successfully logged in',
    token,
  });
});

module.exports = router;
