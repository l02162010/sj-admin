const mongoose = require('mongoose')

const imageSchema = new mongoose.Schema({
  source: Buffer,
  contentType: String
},{ timestamps: { createdAt: 'createdAt' }})

module.exports = mongoose.model('Image', imageSchema)