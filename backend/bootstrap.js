// bootstrap.js
//
// the bootloader for the BitWeb proxy

var http = require('http');

CACHROOT = '~/.bitweb/cache/'

var hostcache = ['bitwebblog.gullicksonlaboratories.com', 'www.fargo.com'];

http.createServer(function(request, response) {

  var requestHost = request.headers['host'];

  // debug
  console.log(requestHost);

  // if the host is in the cache, direct request to local copy
  if(hostcache.indexOf(requestHost) != -1){

    // TODO: start server (if necissary)

    // TODO: redirect request

  }

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
  
}).listen(8080);


// *** NOTES ***
// start listening for incoming connections

// handle incoming request

// if host is in the cache, make sure it's started and hand-off the request

// if the host isn't in the cache, try to find a namecoin and DNS entry

// hand the request off to whichever comes back first

// if the host is found on namecoin, setup a local cached copy