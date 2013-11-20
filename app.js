
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var httpProxy = require('http-proxy');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/users', user.list);

var server = httpProxy.createServer(function(req, res, proxy) {
  //if (req.headers["X-Howl-Sid"] === null) {
    // curl https://login.salesforce.com/services/oauth2/token 
    // -d "grant_type=password" 
    // -d 'client_id=3MVG9QDx8IX8nP5SFJKf4fpPHVMwt.HN4JWdanXhf.ipMW11xdJyeHFScCK_VCq.OSU0gPXFAl1wHazLqGIc.' 
    // -d 'client_secret=6325945293227652987' 
    // -d 'username=sumeet_rohatgi@hotmail.com' 
    // -d 'password=test123442Fx59RN27Z00NBDfdbcuOSv'
    /*req.write("grant_type=password&" + 
      "client_id=3MVG9QDx8IX8nP5SFJKf4fpPHVMwt.HN4JWdanXhf.ipMW11xdJyeHFScCK_VCq.OSU0gPXFAl1wHazLqGIc.&" + 
      "client_secret=6325945293227652987" + 
      "username=sumeet_rohatgi@hotmail.com" + 
      "password=test123442Fx59RN27Z00NBDfdbcuOSv"
      );*/
    //req.write('');
    //req.end();
    proxy.proxyRequest(req, res, { host: 'login.salesforce.com', port: 443 });
  //}
});

server.proxy.on('end', function(req,res) {
  res.header("Access-Control-Allow-Origin", "*");
});

server.listen(3030);
console.log('Express server listening on port ' + 3030);

