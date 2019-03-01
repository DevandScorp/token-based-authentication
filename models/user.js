/* eslint-disable prefer-destructuring */
const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const User = new Schema({
  username: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  firstname: {
    type: String,
    default: '',
  },
  lastname: {
    type: String,
    default: '',
  },
  facebookId: {
    type: String,
  },
  githubId: {
    type: String,
  },
  admin: {
    type: Boolean,
    default: false,
  },
  imageURL: {
    type: String,
    default: 'https://avatars2.githubusercontent.com/u/38842788?v=4',
  },
});
module.exports = mongoose.model('TokenUser', User);
