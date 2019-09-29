const Auth = require('../models/auth')
const boom = require('@hapi/boom')


exports.login = async (data, reply) => {
  try {
    const {acc, pwd} = data
    const user = await Auth.find({acc, pwd})
    return user
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.checkLogin = async (req, res, next) => {
  try {
    if(!!req.signedCookies && req.signedCookies.session && req.signedCookies.session !== 'undefined'){
      const user = await Auth.find({acc: req.signedCookies.session})
      if (user) {
        next();
      } else {
        res.redirect('/login');
      } 
    } else {
      res.redirect('/login');
    }
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.addUser = async (data, reply) => {
  try {
    const auth = new Auth(data)
    let res = await auth.save()
    return { code: 0, message: 'add user success', _id: res._id}
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.changePwd = async (data, reply) => {
  let {id, pwd} = data
  try {
    const auth = await Auth.findByIdAndUpdate(id, { pwd })
    return auth
  } catch (err) {
    throw boom.boomify(err)
  }
}

