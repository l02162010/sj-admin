const Image = require('../models/image')
const boom = require('@hapi/boom')

exports.getImages = async (req, reply) => {
  try {
    const images = await Image.find()
    return images
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.getImageById = async (data, reply) => {
  try {
    const image = await Image.findById(data.id)
    return image
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.addImage = async (data, reply) => {
  try {
    const image = new Image(data)
    let res = await image.save()
    return { code: 0, message: 'add image success', _id: res._id}
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.delImage = async (data, reply) => {
  try {
    const {id} = data
    let res = await Image.findByIdAndRemove(id)
    return { code: 0, message: 'delete image success', _id: res._id}
  } catch (err) {
    throw boom.boomify(err)
  }
}