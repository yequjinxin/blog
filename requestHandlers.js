var url = require('url');
var tpl = require('./lib/tpl');
var fs = require('fs');
var config = require('./config');

function get_post_list(type, post) {
    var md_dir = config.md_dir;
    var post_list = [];
    var content = fs.readFileSync(md_dir + '/' + type + '/post_list.txt').toString();
    if (!content) {
        return post_list;
    }
    var posts = [];
    var posts = content.replace(/^\n|\n$/, '').split('\n');

    posts.forEach(function (value) {
        var tmp = value.split('=>');
        post_list.push({
            name: tmp[0],
            time: tmp[1],
            active: post == tmp[0]
        });
    });
    return post_list;
}


function start(response, request) {
    var pathname = request.pathname;
    var query = url.parse(request.url).query;

    var type = pathname === '/' ? config.index_category : pathname.replace(/^\/|\/$/, '');
    var post = '';
    var post_path = '';
    if (query) {
        post = decodeURI(query);
        post_path = 'post/' + type + '/' + post + '.html';
    } else {
        post = 'welcome';
        post_path = 'post/' + type + '/welcome.html';
        if (!fs.existsSync(config.tpl_dir + '/' + post_path)) {
            post_path = 'welcome.html';
        }
    }
    var post_list = get_post_list(type, post);

    if (!fs.existsSync(config.tpl_dir + '/' + post_path)) {
        tpl.output(response, 'sorry your page was not found', 'text/plain', 404);
    }

    var type_list = [];
    var dir_list = fs.readdirSync(config.md_dir);
    dir_list.forEach(function (type) {
        var stat = fs.statSync(config.md_dir + '/' + type);
        if (stat.isDirectory()) {
            type_list.push(type);
        }
    });

    var params = {
        post_list: post_list,
        post_path: post_path,
        type: type,
        type_list: type_list,
        post: post,
        url: config.url,
        url_page: config.url + '/' + type + '?' + post,
        identifier: config.url + '/#!' + type + '?' + post,
    };

    var ret = tpl.display('index.html', params, function (err, data) {
        if (err) {
            console.error(err);
        } else {
            tpl.output(response, data);
        }
    });
}

function getPost(response, request) {
    var post = request.postData.post;
    var type = request.postData.type;
    if (typeof post === 'undefined') {
        post = 'welcome';
    }
    var path = config.tpl_dir + '/post/' + type + '/' + decodeURI(post) + '.html';
    if (!fs.existsSync(path)) {
        path = config.tpl_dir + '/' + 'welcome.html';
    }

    var content = fs.readFileSync(path);
    var data = {content: content.toString()};
    tpl.output(response, JSON.stringify(data), 'text/plain');
}

function getType(response, request) {
    var type = request.postData.type;
    var post_path = 'post/' + type + '/welcome.html';
    if (!fs.existsSync(config.tpl_dir + '/' + post_path)) {
        post_path = 'welcome.html';
    }

    var post_list = get_post_list(type, null);

    var content = fs.readFileSync(config.tpl_dir + '/' + post_path, 'utf8');
    var data = {
        post_list: post_list,
        content: content
    };
    tpl.output(response, JSON.stringify(data), 'text/plain');
}

/*
function test(response, request) {
    tpl.display('testmd.html', {}, function (err, data) {
        tpl.output(response, data);
    });
}
*/

exports.start = start;
exports.getPost = getPost;
exports.getType = getType;
