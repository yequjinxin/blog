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