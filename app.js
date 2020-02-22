//引入express模块
const express = require('express');
//引入path系统模块
const path = require('path');
//引入body-parser模块
const bodyPaser = require('body-parser');
// 导入express-session模块
const session = require('express-session');
// 导入art-tempate模板引擎
const template = require('art-template');
// 导入dateformat第三方模块
const dateFormat = require('dateformat');
// 导入morgan这个第三方模块
const morgan = require('morgan');
// 导入config模块
const config = require('config');
//创建网站服务器
const app = express();
// 数据库连接
require('./model/connect');
require('./model/user');

//处理post请求参数
app.use(bodyPaser.urlencoded({extended: false}));
// 配置session
app.use(session({
	secret: 'secret key',
	saveUninitialized: false,
	cookie: {
		maxAge: 24 * 60 * 60 * 1000
	}
}));


// 告诉express框架模板所在的位置
app.set('views', path.join(__dirname, 'views'));
// 告诉express框架模板的默认后缀是什么
app.set('view engine', 'art');
// 当渲染后缀为art的模板时 所使用的模板引擎是什么
app.engine('art', require('express-art-template'));
// 向模板内部导入dateFormate变量
template.defaults.imports.dateFormat = dateFormat;
//开放静态资源文件
app.use(express.static(path.join(__dirname,'public')));

//导入路由模块
const home = require('./route/home');
const admin = require('./route/admin');

// 拦截请求 判断用户登录状态
app.use('/admin', require('./middleware/loginGuard'));

//拦截所有请求，为路由匹配请求路径
app.use('/',home);
app.use('/home',home);
app.use('/admin',admin);

//错误处理中间件，错误信息存储在err中
app.use((err, req, res, next) => {
	//错误处理代码优化
	//JSON.parse() 将字符串对象转换为对象类型
	const result = JSON.parse(err);
	// {path: '/admin/user-edit', message: '密码比对失败,不能进行用户信息的修改', id: id}
	let params = [];
	for (let attr in result) {
		if (attr != 'path') {
			params.push(attr + '=' + result[attr]);
		}
	}
	res.redirect(`${result.path}?${params.join('&')}`);
})
//设置监听端口80
app.listen(3000);
console.log('服务器启动成功');