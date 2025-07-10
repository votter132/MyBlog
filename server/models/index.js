let mongoose = require('mongoose')
mongoose
  .connect("mongodb://127.0.0.1/blog")
  .then((res) => {
    console.log("链接成功");

  })
  .catch((err) => {
    console.log("链接失败");
  })
let Schema = mongoose.Schema

// 定义分类表
let SortSchema = new Schema(
  {
    sort: String, // 分类名称
  },
  {
    timestamps: true
  }
)
let Sort = mongoose.model('Sort', SortSchema)
// 定义弹幕表
let DanmuSchema = new Schema(
  {
    content: String
  },
  {
    timestamps: true
  }
)
let Danmu = mongoose.model('Danmu', DanmuSchema)

// 定义文章表结构
let ArticleSchema = new Schema(
  {
    title: String, // 标题
    content: String,// 内容
    // 文章表 作者id 关联了 用户表中的id
    author: { type: Schema.Types.ObjectId, ref: "User" },
    // 文章表 关联了 分类表的 id
    sort: { type: Schema.Types.ObjectId, ref: 'Sort' },
    // 文章标签
    tag: String,
    imgUrl: String,
    // 观看量
    views: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true  // 自动添加创建时间和更新时间
  }
)
ArticleSchema.virtual('coms', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article_id',
  justOne: false // 关联多个评论
})

ArticleSchema.set('toObject', { virtuals: true })
ArticleSchema.set('toJSON', { virtuals: true })

let Article = mongoose.model("Article", ArticleSchema)

// 定义用户表结构
let UserSchema = new Schema(
  {
    // 用户名
    username: {
      type: String,
      unique: true,
      required: true
    },
    // 密码
    password: String,
    // 昵称
    nickname: String,
    // 头像
    headImgUrl: {
      type: String,
      default: ''
    },
    power: {
      type: String,
      default: 'user'
    },
    // 个人简介
    bio: {
      type: String,
      default: ''
    },
  },
  {
    timestamps: true
  }
)

let User = mongoose.model('User', UserSchema)

// 评论表设计
let CommentSchema = new Schema(
  {
    content: String,
    article_id: { type: Schema.Types.ObjectId, ref: "Article" },
    reply_id: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
)
let Comment = mongoose.model("Comment", CommentSchema)

// 相册表设计
let PhotoSchema = new Schema(
  {
    content: String,
    imgUrl: String,
    upload_id: { type: Schema.Types.ObjectId, ref: "User" }
  },
  {
    timestamps: true
  }
)
let Photo = mongoose.model("Photo", PhotoSchema)
// User.create({
//   username: "lisi",
//   password: "123456",
//   headImgUrl: "http://aaa/aa.png",
//   nickname: "我是mt",
// })
module.exports = { Article, User, Comment, Sort, Danmu, Photo }