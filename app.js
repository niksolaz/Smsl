var express = require("express");
var http = require('http');

var app = express();

app.get('/',function(req,res){
   res.send('Hello on S.M.S.L'); // message display
});

var port = process.env.PORT; //process port on cloud 9
var host = process.env.IP; //process host on cloud 9

http.createServer(app).listen(port,function(req,res){
    console.log('Server connected at http://%s:%s',host,port);
});