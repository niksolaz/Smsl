var express = require("express");
var http = require('http');

var app = express();

app.get('/',function(req,res){
   res.send('Hello on Show My Social Likes'); // message display
});
app.get('/message',function(req,res){
    res.send('This is message');
});
app.get('/account',function(req,res){
    res.send('This is account');
});
app.get('/show',function(req,res){
    res.send('This is show');
});

var port = process.env.PORT; //process port on cloud 9
var host = process.env.IP; //process host on cloud 9

http.createServer(app).listen(port,function(req,res){
    console.log('Server connected at http://%s:%s',host,port);
});
