var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Twitter = require('twitter');
var FB = require('fb');
var async = require('async');
var mongoose = require('mongoose');

var modules = require('/modules');
var DatabaseModel = require('./modules/dbModule');
var TwitterModel = require('./modules/twModule');
var FacebookModel = require('./modules/fbModule');

var app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use('/dbModule',DatabaseModel);
app.use('/twModule',TwitterModel),
app.use('/fbModule',FacebookModel);

app.post('/message',function(req,res){
	var msg = req.body.message;
	console.log('message',msg);

	console.log('PROGRAM START');

	async.waterfall([
		function(callback){
			console.log(TwitterModel.post);
			callback(null,tweet);
		},
		function(tweet,callback){
			console.log(FacebookModel.post);
			callback(null,tweet,res);
		},
		function(tweet,fbStatus,callback){
			console.log(DatabaseModel.post);
			callback(null,file);
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
			console.log(DatabaseModel.get);
			callback(null,file);
		},
		function(msg1,callback){
			console.log(TwitterModel.get);
			callback(null,mongoObj,tweets,res);
		},
		function(mongoObj,tweets,callback){
			console.log(FacebookModel.get);
			callback(null,theResult);
		},
		function(mongoResult,twitterResult,facebookResult,callback){
				var theResult = {
					db: mongoResult,
					twitter: twitterResult,
					facebook: facebookResult
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