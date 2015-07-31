var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Twitter = require('twitter');
var FB = require('fb');
var async = require('async');
var mongoose = require('mongoose');

var DatabaseModel = require('./modules/dbModule');
var FacebookModel = require('./modules/fbModule');
var TwitterModel = require('./modules/twModule');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

var app = express();

app.post('/message',function(req,res){
	var msg = req.body.message;
	console.log('message',msg);

	console.log('PROGRAM START');
	async.waterfall([]);
	console.log('END PROGRAM');
});
	

app.get('/message/:message_id',function(req,res){
	var msg_id = mongoose.Types.ObjectId(req.params.message_id);
	console.log('PROGRAM START');
	async.waterfall([]);
	console.log('END PROGRAM');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});