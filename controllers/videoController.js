const Video = require('../models/video')
const boom = require('@hapi/boom')

exports.getVideos = async (req, reply) => {
  try {
    const videos = await Video.find()
    return videos
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.addVideo = async (data, reply) => {
  if(!data.title) return
  if(!data.imgId) return
  if(!data.youtubeId) return
  try {
    const video = new Video(data)
    const {title} = data
    let res = await Video.findOne({title})
    if(res){
      return { code: 10001, message: '註冊失敗'}
    } else {
      let res2 = await video.save()
      return { code: 0, message: '註冊成功', _id: res2._id}
    }
  } catch (err) {
    throw boom.boomify(err)
  }
}

exports.delVideo = async (data, reply) => {
  if(!data.id) return
  try {
    const {id} = data
    let res = await Video.findByIdAndDelete(id)
    if(res){
      return { code: 10002, message: '刪除失敗'}
    } else {
      return { code: 0, message: '刪除成功', _id: res._id}
    }
  } catch (err) {
    throw boom.boomify(err)
  }
}