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