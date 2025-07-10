// http错误中间件
var createError = require('http-errors');
var express = require('express');
// 生成路径
var path = require('path');
// 解析cookie中间件
var cookieParser = require('cookie-parser');
// 日志
var logger = require('morgan');
var { expressjwt } = require("express-jwt");
// 路由配置
var articlesRouter = require('./routes/articles')
var sortsRouter = require('./routes/sorts')
var usersRouter = require('./routes/users');
var uploadRouter = require('./routes/upload');
var danmuRouter = require('./routes/danmu');
var commentRouter = require('./routes/comments');
var photoRouter = require('./routes/photos')

var app = express();
//设置跨域访问
app.all("*", function (req, res, next) {
  //设置允许跨域的域名，*代表允许任意域名跨域
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  //允许的header类型
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  // //跨域允许的请求方式
  res.header(
    "Access-Control-Allow-Methods",
    "PATCH,PUT,POST,GET,DELETE,OPTIONS"
  );
  // 可以带cookies
  res.header("Access-Control-Allow-Credentials", true);
  if (req.method == "OPTIONS") {
    res.sendStatus(200).end();
  } else {
    next();
  }
});
// view engine setup 视图（模板）引擎，在views文件夹中查询html模板
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// 日志中间件
app.use(logger('dev'));
// 解析 json 中间件
app.use(express.json());
// 解析 请求体 中间件
app.use(express.urlencoded({ extended: false }));
// 解析 cookie 中间件
app.use(cookieParser());
// 静态资源中间件，设置静态资源根目录
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  expressjwt({
    secret: "test123456",      // JWT 签名密钥，用于验证令牌的有效性
    algorithms: ["HS256"],    // 指定使用的哈希算法为 HMAC-SHA256
  }).unless({                // 配置不需要进行 JWT 验证的路径
    path: [
      "/api/users",           // 完全匹配的路径，不需要验证
      '/api/articles/page',
      // '/api/articles/:aid',
      /^\/api\/articles\/\w+$/,  // 正则匹配：/api/articles/users/后面跟任意字母数字
      '/api/danmu',
      '/api/sorts',
      '/api/photos'
      // {
      //   url: /^\/api\/articles\/\w+$/,  // 正则匹配：/api/articles/后面跟任意字母数字
      //   methods: ["GET"],               // 仅对 GET 方法生效
      // },
    ],
  })
);
// 挂载路由
app.use('/api/articles', articlesRouter);
app.use('/api/users', usersRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/sorts', sortsRouter);
app.use('/api/danmu', danmuRouter);
app.use('/api/comments', commentRouter);
app.use('/api/photos', photoRouter);

app.use(function (err, req, res, next) {
  if (err.name === "UnauthorizedError") {
    res.status(401).json({ code: 0, msg: "请完成登录" });
  } else {
    next(err);
  }
});
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});
// 错误处理
// error handler

app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  // 渲染 error 模板
  res.render('error');
});

module.exports = app;
