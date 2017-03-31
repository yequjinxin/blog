var server = require('./server');
var router = require('./router');
var requestHandlers = require('./requestHandlers');
var fs = require('fs');
var config = require('./config');


var handle = {};
handle['/'] = requestHandlers.start;
var type_list = fs.readdirSync(config.md_dir);
type_list.forEach(function (type) {
    console.log(type);
    var stat = fs.statSync(config.md_dir + '/' + type);
    if (stat.isDirectory()) {
        handle['/' + type] = requestHandlers.start;
    }
});

handle['/getPost'] = requestHandlers.getPost;
handle['/getType'] = requestHandlers.getType;
// handle['/test'] = requestHandlers.test;

server.start(router.route, handle);

// 如何获取 get post数据
// http://www.runoob.com/nodejs/node-js-get-post.html
