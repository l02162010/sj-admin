const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs');
const upload = multer({ dest: __dirname +'/new/'});
const type = upload.single('recfile');
const videoController = require('../controllers/videoController')
const imageController = require('../controllers/imageController')


const title = 'SJ-02 ADMIN'

router.get('/', function(req, res, next) {
  res.render('index', { title });
});

router.get('/logout', async (req, res, next) => {
  res.clearCookie('session');
  return res.redirect('/login')
});

router.get('/video', async (req, res) => {
  let featchRes = await videoController.getVideos()
  const list = featchRes.map(f => {
    return {
      id: f._id,
      title: f.title,
      youtubeId: f.youtubeId,
      createdAt: f.createdAt,
      imgId: f.imgId,
      imgUrl: `https://${req.hostname}/image/${f.imgId}`
    }
  })
  res.render('video', { title, pageTitle: '影片設定', list });
});

router.post('/video', type, async (req, res) => {
  let data = {
    ...req.body,
  }
  
  if(req.file){
    let imgData = {
      source: fs.readFileSync(req.file.path),
      contentType: req.file.mimetype
    }
    let imageRes = await imageController.addImage(imgData)
    if(imageRes){
      data.imgId = imageRes._id
      fs.unlinkSync(req.file.path)
    }
    // let file = path.join(__dirname, '../public/img/') + req.file.filename;
    // fs.rename(req.file.path, file, function(err) {
    //   if (err) {
    //     console.log(err);
    //     res.send(500);
    //   }
    // });
  }
  await videoController.addVideo(data)
  res.redirect('/video');
});

router.post('/video/del', type, async (req, res) => {
  let videoData = {
    id: req.body.id
  }
  await videoController.delVideo(videoData)
  let imgData = {
    id: req.body.imgId
  }
  await imageController.delImage(imgData)
  res.redirect('/video');
});

router.get('/image/:imgId',async (req, res) => {
  let data = {
    id: req.params.imgId
  }
  let imageRes = await imageController.getImageById(data)
  if(imageRes){
    res.set('Content-Security-Policy', 'upgrade-insecure-requests');
    res.contentType(imageRes.contentType);
    res.send(imageRes.source);
  }else{
    // TODO預覽圖
    res.statusCode(404);
  }
});

module.exports = router;
