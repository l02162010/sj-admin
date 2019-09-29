const mongoose = require('mongoose')

const authSchema = new mongoose.Schema({
  acc: String,
  pwd: String
},{ timestamps: { createdAt: 'createdAt' }})

module.exports = mongoose.model('Auth', authSchema)