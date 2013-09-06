// bootstrap.js
//
// the bootloader for the BitWeb proxy

var http = require('http');

CACHEROOT = '/Users/jasongullickson/.bitweb/cache/'

var hostcache = ['bitwebblog.gullicksonlaboratories.com', 'www.fargo.com'];

http.createServer(function(request, response) {

  var requestHost = request.headers['host'];

  // debug
  console.log(requestHost);

  // if the host is in the cache, direct request to local copy
  if(hostcache.indexOf(requestHost) != -1){

    // try to connect
    console.log('attempting to connect to local copy of ' + request.headers['host']);

    var options = {
      hostname: 'localhost',
      port: 8888,
      path: '/index.html', //request.url,
      method: request.method
    };

    console.log(options);

    var childconn = http.request(options, function(res){
      res.on('data', function(chunk){
        response.write(chunk,'binary');
      });
    });

    // if we can't connect, try to start and then connect
    childconn.on('error', function(e){

      console.log('cant reach child site, attempting start');

      var childpath = '/Users/jasongullickson/development/BitWebBlog/server.js'; //CACHEROOT + request.headers['host'] + '/server.js';

      console.log('starting ' + childpath);
      var childproc = require('child_process').fork(childpath);

      childproc.on('message',function(m){

        console.log('got message from child: ' + m);

        // try again
        var options = {
          hostname: 'localhost',
          port: 8888,
          path: request.url,
          method: request.method
        };

        console.log(options);

        var childconn = http.request(options, function(res){
          res.on('data', function(chunk){
            response.write(chunk,'binary');
          });
        });
      })
      
      // if we can't start, give up
      childproc.on('error', function(e){
        console.log('can\'t start ' + childpath + ', giving up');
      });
    });

  } else {

    console.log('proxy passthrough request for ' + request.headers['host']);

    var proxy = http.createClient(80, request.headers['host'])
    var proxy_request = proxy.request(request.method, request.url, request.headers);

    proxy_request.addListener('response', function (proxy_response) {
      proxy_response.addListener('data', function(chunk) {
        response.write(chunk, 'binary');
      });
      proxy_response.addListener('end', function() {
        response.end();
      });
      response.writeHead(proxy_response.statusCode, proxy_response.headers);
    });

    request.addListener('data', function(chunk) {
      proxy_request.write(chunk, 'binary');
    });

    request.addListener('end', function() {
      proxy_request.end();
    });

  }

}).listen(8080);


// *** NOTES ***
// start listening for incoming connections

// handle incoming request

// if host is in the cache, make sure it's started and hand-off the request

// if the host isn't in the cache, try to find a namecoin and DNS entry

// hand the request off to whichever comes back first

// if the host is found on namecoin, setup a local cached copy