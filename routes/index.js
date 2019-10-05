const express = require('express');
const router = express.Router();
const multer = require('multer')
const fs = require('fs');
const upload = multer({ dest: __dirname +'/new/'});
const type = upload.single('recfile');
const videoController = require('../controllers/videoController')
const imageController = require('../controllers/imageController')
const googleAPIKey = require('../config/google_api.json')
const {google} = require('googleapis');
const opn = require('open');


const title = 'SJ-02 ADMIN'

router.get('/', function(req, res, next) {
  res.render('index', { title });
});

router.get('/logout', async (req, res, next) => {
  res.clearCookie('session');
  return res.redirect('/login')
});
let googleToken = ''
router.get('/video', async (req, res) => {
  console.log(req.query)
  const oauth2Client = new google.auth.OAuth2(
    googleAPIKey.web.client_id,
    'lJhnRCT7gZbEyAGwHiG6Bd1-',
    'http://localhost:3002/video'
  );
  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/youtube'
  ];
  let youtubeList = []
  if(!req.query.code){
    const url = oauth2Client.generateAuthUrl({
      // 'online' (default) or 'offline' (gets refresh_token)
      access_type: 'offline',
      // If you only need one scope you can pass it as a string
      scope: scopes
    });
    opn(url, {wait: false}).then(cp => cp.unref());
  }else if(!googleToken){
    const {tokens} = await oauth2Client.getToken(req.query.code)
    googleToken = tokens
    oauth2Client.on('tokens',async(tokens) => {
      if (tokens.refresh_token) {
        // store the refresh_token in my database!
        // 記得存啊
        oauth2Client.setCredentials({
          refresh_token: tokens.refresh_token
        });
      }
    });
  }
  if(googleToken){
    oauth2Client.setCredentials(googleToken);
    const youtube = google.youtube({
      version: 'v3',
      auth: oauth2Client
    });
    const params = {
      "part": "snippet",
      "forMine": true,
      "type": "video",
      "maxResults": 50
    };
    // get the youtube details
    const res = await youtube.search.list(params)
    youtubeList = res.data.items.map(d => {
      return {
        id: d.id.videoId,
        title: d.snippet.title,
        imgUrl_small: d.snippet.thumbnails.default.url,
        imgUrl_big: d.snippet.thumbnails.high.url,
      }
    })
  }
 

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
  res.render('video', { title, pageTitle: '影片設定', list, youtubeList });
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

let getAuth = () => {
  const oauth2Client = new google.auth.OAuth2(
    googleAPIKey.web.client_id,
    'lJhnRCT7gZbEyAGwHiG6Bd1-',
    'http://localhost:3002/video'
  );
  
  // generate a url that asks permissions for Blogger and Google Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/youtube'
  ];
  const url = oauth2Client.generateAuthUrl({
    // 'online' (default) or 'offline' (gets refresh_token)
    access_type: 'offline',
  
    // If you only need one scope you can pass it as a string
    scope: scopes
  });
  opn(url, {wait: false}).then(cp => cp.unref());
}

module.exports = router;
