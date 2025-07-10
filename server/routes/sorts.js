const express = require('express')
const router = express.Router()
const { Sort } = require('../models/index')
// 获取全部分类
router.get('/', (req, res, next) => {
  Sort.find({})
    .then((r) => {
      res.json({
        code: 1,
        data: r,
        msg: '获取分类成功'
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
// 添加分类
router.post('/', (req, res) => {
  Sort.create(req.body)
    .then((r) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      res.json({
        code: 1,
        msg: '分类创建成功'
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
// 删除分类
router.delete('/:sid', (req, res) => {
  Sort.findByIdAndDelete(req.params.sid)
    .then((result) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      if (!result) {
        return res.status(404).json({
          code: 0,
          msg: '分类未找到',
        })
      }
      res.json({
        code: 1,
        msg: '删除分类成功',
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '删除分类失败',
      })
    })
})
module.exports = router