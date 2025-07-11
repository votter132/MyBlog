const express = require('express')
const router = express.Router()
const { Comment } = require('../models/index')

router.post('/', (req, res) => {
  console.log(req.body)
  console.log(req.auth.uid)
  Comment.create({
    ...req.body,
    reply_id: req.auth.uid
  })
    .then((r) => {
      if (!req.auth.power) {
        return res.json({
          code: 0,
          msg: '请先进行登录'
        })
      }
      res.json({
        code: 1,
        msg: '评论添加成功'
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '评论添加失败'
      })
    })
})

module.exports = router