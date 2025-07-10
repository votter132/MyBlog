let express = require('express');
let router = express.Router();

let multer = require('multer');
let path = require('path')
// 配置上传图片的路径
var storage = multer.diskStorage({
  //路径
  destination: function (req, file, cb) {
    //public/images/upload --- public路径下得存在 这个文件夹，否则会报错
    cb(null, "public/images");
  },
  filename: function (req, file, cb) {
    //path.extname(file.originalname) 获取前端上传图片的 后缀名
    //文件名字 以上传的时间戳为文件的名字
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
var upload = multer({ storage: storage }).single("file");
// 上传文件的路由
router.post('/', upload, (req, res) => {
  let file = req.file; //图片对象
  let imgUrl = "/images/" + file.filename; //图片的访问路径
  // 返回给前端
  res.json({
    code: 1,
    msg: '文件上传成功',
    data: imgUrl
  })
})

module.exports = router;