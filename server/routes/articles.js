var express = require('express')
var router = express.Router()
var { Article } = require('../models/index')
// 发布文章
router.post('/', (req, res, next) => {
  Article.create({
    ...req.body,
    author: req.auth.uid,
  })
    .then((r) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      res.json({
        code: 1,
        msg: '发布文章成功',
        data: r
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '发布文章失败',
      })
    })
})
// 获取全部列表
router.get('/all', (req, res) => {
  Article.find({})
    .populate('author', { password: 0 })
    .populate('sort')
    .populate('coms')
    .then((article) => {
      if (!article) {
        return res.status(404).json({
          code: 0,
          msg: '文章未找到',
        })
      }
      res.json({
        code: 1,
        msg: '获取文章成功',
        data: article
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '获取文章失败',
      })
    })
})
// 根据分类获取文章
router.get('/sorts/:sid', (req, res) => {
  Article.find({ Sort: req.params.aid })
    .populate('author', { password: 0 })
    .populate('coms')
    .then((articles) => {
      res.json({
        code: 1,
        msg: '获取文章成功',
        data: articles
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '获取文章失败',
      })
    })
})
// 首页分页数据获取
router.get('/page', async (req, res) => {
  try {
    const { page, pageSize, id } = req.query;
    const skip = (Number(page) - 1) * Number(pageSize);
    // 构建查询条件
    const sortId = id === '' ? {} : { sort: id };

    // 按观看量从多到少排序（1为升序，-1为降序）
    const sortOptions = { views: -1 };

    console.log('查询条件:', sortId);
    console.log('排序选项:', sortOptions);

    // 查文章总数和分页数据
    const total = await Article.countDocuments(sortId);
    const list = await Article.find(sortId)
      .sort(sortOptions)  // 添加排序
      .skip(skip)
      .limit(Number(pageSize))
      .populate('author', { password: 0 })
      .populate('sort'); // 关联 Sort 表

    res.json({
      code: 1,
      msg: '获取分页数据成功',
      data: { list, total }
    });
  } catch (error) {
    console.error('分页查询失败：', error);
    res.status(500).json({ code: 0, msg: '服务器内部错误' });
  }
});
// 根据文章id获取文章列表
router.get('/:aid', (req, res) => {
  Article.findByIdAndUpdate(
    req.params.aid,
    { $inc: { views: 1 } },
    { new: true, useFindAndModify: false }
  )
    .populate('author', { password: 0 }) // 文章作者信息
    .populate({
      path: 'coms', // 填充评论
      populate: {
        path: 'reply_id', // 填充评论的用户信息
        model: 'User',    // 指定关联的模型
        select: '-password' // 排除密码字段
      }
    })
    .populate('sort', { _id: 0 }) // 分类信息
    .then((article) => {
      if (!article) {
        return res.status(404).json({
          code: 0,
          msg: '文章未找到',
        });
      }
      res.json({
        code: 1,
        msg: '获取文章成功',
        data: article
      });
    })
    .catch((err) => {
      console.error('数据库错误:', err);
      res.status(500).json({
        code: 0,
        msg: '服务器内部错误',
      });
    });
});
// 根据用户id获取文章列表
router.get('/users/:uid', (req, res) => {
  Article.find({ author: req.params.uid })
    .populate('author', { password: 0 })
    .populate('coms')
    .then((articles) => {
      res.json({
        code: 1,
        msg: '获取文章成功',
        data: articles
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '获取文章失败',
      })
    })
})
// 删除文章
router.delete('/:aid', (req, res) => {
  Article.findByIdAndDelete(req.params.aid)
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
          msg: '文章未找到',
        })
      }
      res.json({
        code: 1,
        msg: '删除文章成功',
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '删除文章失败',
      })
    })
})
// 更新文章
router.put('/:aid', (req, res) => {
  Article.findByIdAndUpdate(req.params.aid, { ...req.body }, { new: true })
    .then((article) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      if (!article) {
        return res.status(404).json({
          code: 0,
          msg: '文章未找到',
        })
      }
      res.json({
        code: 1,
        msg: '更新文章成功',
        data: article
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '更新文章失败',
      })
    })
})


module.exports = router