var express = require('express')
var router = express.Router()

let { User } = require('../models/index')

// npm install jsonwebtoken
let jwt = require("jsonwebtoken");

// 登录请求
router.get("/", function (req, res, next) {
  let { username, password } = req.query;
  // console.log(username, password);
  User.findOne({ username, password })
    .then((r) => {
      if (r == null) {
        res.json({
          code: 0,
          msg: "登录失败，用户名或密码错误",
        })
      }
      else {
        console.log(r);
        let token = jwt.sign({ username: username, uid: r._id, power: r.power }, "test123456", {
          expiresIn: "2d",
          algorithm: "HS256",
        });
        res.json({
          code: 1,
          msg: "登录成功",
          nickname: r.nickname, // 返回用户昵称
          token: token, // 返回生成的 JWT
          power: r.power,
          _id: r._id,
          headImgUrl: r.headImgUrl
        });
      }
    })
})

// 注册请求
// 要求填写用户名，密码，昵称
router.post('/', (req, res) => {
  console.log(req.body)
  User.create(req.body)
    .then((r) => {
      res.json({
        code: 1,
        msg: '注册成功',
        data: r
      })
    })
    .catch((err) => {
      res.json({
        code: 0,
        msg: '注册失败-用户已经存在',
        err
      })
    })
})

// 查询全部用户
router.get('/all', (req, res) => {
  User.find({})
    .then((r) => {
      res.json({
        code: 1,
        msg: '获取全部用户成功',
        data: r
      })
    })
    .catch((r) => {
      res.json({
        code: 0,
        msg: '获取全部用户失败',
        err: r
      })
    })
})

// 更改用户信息
router.put('/:uid', (req, res) => {
  console.log(req.body);
  console.log(req.params.uid);

  User.findByIdAndUpdate(req.params.uid, { ...req.body }, { new: true })
    .then((r) => {
      if (req.auth.power === 'user') {
        return res.json({
          code: 0,
          msg: '您的权限不足'
        })
      }
      if (!r) {
        return res.status(404).json({
          code: 0,
          msg: '用户未找到',
        })
      }
      res.json({
        code: 1,
        msg: '更新用户成功',
        data: r
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '更新用户失败',
      })
    })
})

// 删除用户信息
router.delete('/:uid', (req, res) => {
  User.findByIdAndDelete(req.params.uid)
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
          msg: '用户未找到',
        })
      }
      res.json({
        code: 1,
        msg: '删除用户成功',
      })
    })
    .catch((err) => {
      res.status(500).json({
        code: 0,
        msg: '删除用户失败',
      })
    })
})
module.exports = router