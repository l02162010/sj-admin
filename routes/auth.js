var express = require('express');
var router = express.Router();
const authController = require('../controllers/authController')


router.get('/', function(req, res, next) {
  res.render('login');
});

var expiryDate = new Date( Date.now() + 60 * 60 * 1000 ); // 1 hour

router.post('/', async (req, res, next) => {
  let {acc, pwd} = req.body
  if(acc === "" || pwd === "" ) return res.redirect('/login')
  let data = {
    acc,
    pwd
  }
  let auth = await authController.login(data)
  if(auth){
    res.cookie('session', acc, { signed: true, expires:expiryDate});  //set cookie
    return res.redirect('/')
  }else{
    return res.redirect('/login')
  }
});


router.get('/add', async (req, res, next) => {
  req.query.acc
  let data = {
    acc: req.query.acc,
    pwd: req.query.pwd
  }
  await authController.addUser(data)
  return res.redirect('/login')
});

module.exports = router;
