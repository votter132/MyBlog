const express = require('express')
const router = express.Router()
const { Photo } = require('../models/index')
const { model } = require('mongoose')
// 获得全部相片
router.get('/', (req, res) => {
  Photo.find({})
    .then((r) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      res.json({
        code: 1,
        msg: '图片获取成功',
        data: r
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '图片获取失败',
        err: r
      })
    })
})
// 提交图片
router.post('/add', (req, res) => {
  console.log(req.body);

  if (req.auth.power === 'user') {
    res.json({
      code: 0,
      msg: '你的权限不足'
    })
    return
  }
  else {
    Photo.create(req.body)
      .then((r) => {
        res.json({
          code: 1,
          msg: '图片添加成功',
          data: r
        })
      })
      .catch((r) => {
        res.json({
          code: 0,
          msg: '添加图片失败',
          err: r
        })
      })
  }
})

module.exports = router