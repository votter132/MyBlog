var express = require('express')
var router = express.Router()
var { Danmu } = require('../models/index')

// 获取全部弹幕
router.get('/', (req, res, next) => {
  Danmu.find({})
    .then((r) => {
      res.json({
        code: 1,
        data: r,
        msg: '获取弹幕成功'
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '获取分类失败',
        err: r
      })
    })
});
// 添加弹幕
router.post('/', (req, res) => {
  console.log(req.body);

  Danmu.create(req.body)
    .then((r) => {
      res.json({
        code: 1,
        msg: '弹幕添加成功'
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '分类创建失败',
        err: r
      })
    })
})
module.exports = router