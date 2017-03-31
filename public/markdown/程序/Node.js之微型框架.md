### Node.js之微型框架
#### Hello World
先了解一下官网对Node.js的介绍
> Node.js® is a JavaScript runtime built on Chrome's V8 JavaScript engine. Node.js uses an event-driven, non-blocking I/O model that makes it lightweight and efficient. Node.js' package ecosystem, npm, is the largest ecosystem of open source libraries in the world.

安装node需要去[官网](https://nodejs.org/en/download/)下载，如果你下载了源码，安装步骤如下，我们假定下载的压缩包为`node-v6.10.0.tar.gz`
```bash
tar -zxvf node-v6.10.0.tar.gz
cd node-v6.10.0
./configure --prefix=/usr/local/node
make && make install
```

如果你已经安装node，更新即可
```bash
npm install –g n
n stable
```
注：n latest最新的；n stable稳定的。

安装完node我们需要安装pm2，pm2是Nodejs的一个进程管理器。
```bash
npm install pm2@latest -g
```

如果已经安装node，我们更新一下即可
```bash
npm update -g
```

接着我们启动一个简单的Node.js应用
```bash
pm2 start app.js
```
app.js代码如下
```javascript
var http = require('http');
http.createServer(function (request, response) {
    response.writeHead(200, {
        'Content-Type': 'text/plain' // 输出类型
    });
    response.write('Hello World'); // 页面输出
    response.end();
}).listen(8100); // 监听端口号
console.log('nodejs start listen 8102 port!');
```
访问`http://localhost:8102`，页面出现`Hello World`

因为npm服务在国内极不稳定，我们可以选择[淘宝镜像](https://npm.taobao.org/)
安装cnpm
```bash
 npm install -g cnpm --registry=https://registry.npm.taobao.org
```
`cnpm`支持`npm`除了publish之外的所有命令

#### 全副武装的Hello World
我们现在要设计一个基于Node.js的web应用，需要具备以下功能：
1. http服务器
2. 路由
3. 需要一个控制器
4. 为控制器封装post，get数据
5. 视图

项目的目录结构如下
```bash
- index.js # 入口文件，启动服务，配置路由
- server.js # http服务器，为控制器生成pathname,post,get参数
- router.js # 路由
- requestHandlers.js # 控制器
- config.js # 配置文件
- lib # 存放一些第三方类库
  - tpl.js
- public # 资源文件目录
  - css
  - img
  - js
  - lib
  - template
    - testmd.html
```

我们先封装一下前面的`hello world`的demo
创建一个server.js的文件
```javascript
var http = require("http");
var url = require("url");
var querystring = require("querystring");

function start(route, handle) {
    function onRequest(request, response) {
        var urlInfo = url.parse(request.url, true);
        var pathname = decodeURI(urlInfo.pathname);
        var getData = urlInfo.query;
        request.pathname = pathname;
        request.getData = getData;

        var postData = '';
        request.setEncoding('utf8');
        request.addListener('data', function(postDataChunk) {
            postData += postDataChunk;
        });

        request.addListener('end', function() {
            request.postData = querystring.parse(postData);
            route(handle, pathname, response, request);
        });
    }

    http.createServer(onRequest).listen(8888);
    console.log("Server has started.");
}

exports.start = start;
// 如何获取 get post数据
// http://www.runoob.com/nodejs/node-js-get-post.html
```
这里加工了`get`和`post`数据，node并不会解析post数据，post数据在http请求体中，需要手动来解析，否则在上传文件时会消耗服务器大量资源。

然后需要一个入口文件开启服务，并配置路由
创建index.js文件
```javascript
var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');

var handle = {};
handle['/'] = requestHandlers.start;
handle['/test'] = requestHandlers.test;

server.start(router.route, handle);
```
我们在入口文件内执行`server.start`开启了`Node.js`服务，这里用变量`handle`设定了控制器中功能函数和路由的对应关系，路由方法通过参数`handle`和`pathname`完成执行逻辑。

实现路由逻辑
创建router.js
```javascript
var fs = require('fs');
var path = require('path');
var config = require('./config');

var type_map = config.type_map;
var public_dir = config.public_dir;

function processStaticFile(pathname, callback) {
    var pathname = pathname.replace(/^\/|\/$/, '');
    var paths = pathname.split('/');

    if (paths[0] === public_dir) {
        // 是静态资源
        fs.readFile(pathname, (err, fd) => {
            if (err) {
                callback(err);
            } else {
                callback(null, fd); // fd不可以toString处理
            }
        });
        return true;
    } else {
        return false;
    }
}


function route(handle, pathname, response, request) {

    var is_static = processStaticFile(pathname, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            var ext = path.extname(pathname).replace(/^\.|\.$/, '');
            response.writeHead(200, {"Content-Type": type_map[ext]});
            response.write(data);
            response.end();
        }
    })

    if (is_static) {
        // 静态资源结束执行
        return;
    }

    if (typeof handle[pathname] === 'function') {
        handle[pathname](response, request);
    } else {
        response.writeHead(404, {"Content-Type": "text/plain"});
        response.write("404 Not found");
        response.end();
    }
}

exports.route = route;
```
为了方便修改，我们将一些变量放入配置文件中
创建配置文件config.js
```javascript
var type_map = {
    'css': 'text/css',
    'js': 'application/x-javascript',
    'png': 'image/png',
    'jpg': 'image/jpeg',
};
var public_dir = 'public';

module.exports = {
    type_map: type_map,
    public_dir: public_dir,
};
```
这里面涉及到了静态资源的加载，静态资源是不会路由到控制器的方法的。函数`processStaticFile`判断请求的是否是静态资源，如果是则读取文件内容，设置返回码以及文件类型，并将返回的内容发送HTTP消息给客户端。
如果不是静态资源则执行路由方法，路由方法不存在则返回404。

接下来创建路由文件requestHandles.js
```javascript
function start() {
	// ...
}
function test(response, request) {
	// ...
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('hello world');
    response.end();
}

exports.start = start;
exports.test = test;
```
然后访问`http://localhost:8888/test` 就能看到`hello world`了，我们也可以在入口文件index.js中设定更多的路由，然后在控制器中实现，控制器中的函数也可以从参数`request`中直接拿到`get`和`post`对象，分别是`request.getData`和`request.postData`。

最后一步我们加入一个模板引擎
安装`ejs`
```bash
npm install ejs -g
```
创建lib/tpl.js文件（先创建lib目录，在创建tpl.js文件）
```javascript
var fs = require('fs');
var ejs = require('ejs');
var config = require('../config');


function display(tpl, params, callback) {
    fs.readFile('./public/template/' + tpl, function (err, data) {
        if (err) {
            callback(err);
        } else {
            data = data.toString();
            params.filename = config.tpl_dir + '/tmp.ejs';
            
            data = ejs.render(data, params);
            callback(null, data);
        }
    });
}

function output(response, data, type = "text/html", code = 200) {
    response.writeHead(code, {"Content-Type": type});
    response.write(data);
    response.end();
}

exports.display = display;
exports.output = output;
```

然后路由文件可以这样写
```javascript
var tpl = require('./lib/tpl');

function start() {
	// ...
}
function test(response, request) {
	/*
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('hello world');
    response.end();
    */
    tpl.display('testmd.html', {}, function (err, data) {
        tpl.output(response, data);
    });
}

exports.start = start;
exports.test = test;
```

为我们的Node.js项目创建`package.json`文件
```javascript
{
  "name": "blog",
  "main": "./index.js",
  "dependencies": {
    "ejs": "^2.5.5"
  }
}
```
因为我们的模板引擎依赖ejs模块，需要配置`dependencies`属性，也可以在安装时使用命令`npm install ejs –save`自动写入该属性。
部署项目时，无需拷贝`node_modules`文件夹，只需在项目根目录运行`npm install --production`即可，进行开发部署执行`npm install --dev`，不加参数默认两种都安装。
`-save`参数是更新生产环境依赖属性值`dependencies`，而`-save-dev`则更新开发环境的依赖属性值`devDependencies`。
设置环境变量：`export NODE_ENV=production`
读取环境变量：`process.env.NODE_ENV`
环境变量参考判定逻辑
```javascript
var env = process.env.NODE_ENV || 'production';
env = env.toLowerCase();
```


参考资料：
[1] [Node入门](http://www.nodebeginner.org/index-zh-cn.html#a-full-blown-web-application-with-nodejs)
