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