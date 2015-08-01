var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Twitter = require('twitter');
var FB = require('fb');
var async = require('async');
var mongoose = require('mongoose');

var DatabaseModel = require('./modules/dbModule');
var TwitterModel = require('./modules/twModule');
var FacebookModel = require('./modules/fbModule');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));


app.post('/message',function(req,res){
	var msg = req.body.message;
	console.log('message',msg);

	console.log('PROGRAM START');

	async.waterfall([
		function(callback){
			console.log(DatabaseModel,TwitterModel,FacebookModel);
			callback(null,DatabaseModel,TwitterModel,FacebookModel);
		}
		], function(err,result){
				if(err){
					res.json({'error':result});
				}else{
					console.log('Main callback: '+ result);
			 		res.json(result);
				}
			}
	);
	console.log('END PROGRAM');
});
	

app.get('/message/:message_id',function(req,res){
	var msg_id = mongoose.Types.ObjectId(req.params.message_id);

	console.log('PROGRAM START');

	async.waterfall([
		function(callback){
			console.log(DatabaseModel,TwitterModel,FacebookModel);
			callback(null,DatabaseModel,TwitterModel,FacebookModel);
		},
		function(DatabaseModel,TwitterModel,FacebookModel,callback){
				var theResult = {
					db: DatabaseModel,
					twitter: TwitterModel,
					facebook: FacebookModel
				};
				callback(null,theResult);
		}
		],function(err,result){
			if(err) return err;
				console.log('Main callback: '+ result);
				res.json(result);
			}
	);
	console.log('END PROGRAM');
});

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});