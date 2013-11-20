
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var https = require('https');
var path = require('path');
var util = require('util');

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
app.use(function(req,res,next) {
  // add CORS support for any site
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if ("OPTIONS" === req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/login', function(req, res) {
  var options = {
      host: 'login.salesforce.com'
    , port: 443
    , path: '/services/oauth2/token'
    , method: 'POST'
    , headers: { 
      "Content-Type": "application/x-www-form-urlencoded"
    }
  };

  var apireq = https.request(options, function(apires) {
    var body = '';
    console.log('STATUS: ' + apires.statusCode);
    console.log('HEADERS: ' + JSON.stringify(apires.headers));
    apires.setEncoding('utf8');
    apires.on('data', function(d) { body += d; });
    apires.on('end', function() { res.send(body); });
  });

  apireq.on('error', function(err) { console.log("error calling!" + err); });
  
  var data = "grant_type=password&" + 
      "client_id=" + process.env['sfdc_client_id'] + "&" +
      "client_secret=" + process.env['sfdc_client_secret'] + "&" +
      "username=" + process.env['sfdc_username'] + "&" + 
      "password=" + process.env['sfdc_password'];

  console.log(data);
  apireq.write(data);
  apireq.end();

});

app.get('/search', function(req, res) {
  var server = req.query.server;
  var access_token = req.query.token;
  // var search_query = 'SELECT+Name,ProductCode+FROM+Product2'
  var query = req.query.search_query;
  var soql = 'SELECT+Name,ProductCode+FROM+Product2';

  if (query != null) {
    soql += "+where+Name+like+%27%25" + query + "%25%27";
  }

  var path = '/services/data/v29.0/query/' + '?q=' + soql;
  console.log("calling: " + path); 

  var options = {
      host: server.substring("https://".length)
    , port: 443
    , path: path
    , method: 'GET'
    , headers: { 
        "Content-Type": "application/x-www-form-urlencoded"
      , "Authorization": "Bearer " + access_token
    }
  };

  var apireq = https.request(options, function(apires) {
    var body = '';
    //console.log('STATUS: ' + apires.statusCode);
    //console.log('HEADERS: ' + JSON.stringify(apires.headers));
    apires.setEncoding('utf8');
    apires.on('data', function(d) { body += d; });
    apires.on('end', function() { res.send(body); });
  });

  apireq.on('error', function(err) { console.log("error calling!" + err); });
  
  apireq.end();  
});

    // curl https://login.salesforce.com/services/oauth2/token 
    // -d "grant_type=password" 
    // -d 'client_id=3MVG9QDx8IX8nP5SFJKf4fpPHVMwt.HN4JWdanXhf.ipMW11xdJyeHFScCK_VCq.OSU0gPXFAl1wHazLqGIc.' 
    // -d 'client_secret=6325945293227652987' 
    // -d 'username=' 
    // -d 'password='
    /*req.write("grant_type=password&" + 
      "client_id=3MVG9QDx8IX8nP5SFJKf4fpPHVMwt.HN4JWdanXhf.ipMW11xdJyeHFScCK_VCq.OSU0gPXFAl1wHazLqGIc.&" + 
      "client_secret=6325945293227652987" + 
      "username=" + 
      "password="
      );*/
    //req.end();
    //console.log(util.inspect(req));
    //console.log("req url:" + req.url);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Express server listening on port ' + app.get('port'));
});
