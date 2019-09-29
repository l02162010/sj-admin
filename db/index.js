const mongoose = require('mongoose');
mongoose.connect('mongodb://an:aa1234@ds147684.mlab.com:47684/sj', {useNewUrlParser: true});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log(`we're connected!`)
});