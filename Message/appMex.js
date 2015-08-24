
var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var async = require('async'); //Asincronous Waterfall
var mongoose = require('mongoose');

// modules of twitter , facebook and db
var DatabaseModule = require('./modules/dbModule'); //require module of database
var TwitterModule = require('./modules/twModule');  //require module of twitter
var FacebookModule = require('./modules/fbModule'); //require module of facebook

var app = express(); //main application
 
app.use(bodyParser.json());    //return middleware that only parses json (req.body)
app.use(bodyParser.urlencoded({ extended: true })); //return middleware that only parses urlencoded( UTF-8 )
app.use(express.static(__dirname + '/public'));

console.log('Start check problem'); // search block by console.log

//method POST of the app at the path "/message"
app.post('/message',function(req,res,next){

	var msg = req.body.message; //contains the key-value of the body-parsing
	console.log('message',msg); // see object msg

	console.log('PROGRAM START'); // starting voice of  async waterfall

	// Waterfall
	async.waterfall([    //runs an array of functions in series, each passing their results to the next in the array
		// Create Twitter message
		function ( next ){
			console.log( "(App Mex) message by Twitter" );
			TwitterModule.post( msg, function twitterCallback( resultData ){ //method post by module Twitter
				//data error
				if ( resultData.success === false ){ //if the result is false than return error
					next( true, resultData.error ); 
					return;  
				}
				//data twitter is success
				var twitterId = resultData.data ? resultData.data.id_str : null; // if data isn't false use id_str otherwise null
				console.log('Twitter..........'+ twitterId); //output data twitterId 
				next( null, resultData.data ); // passed data at next array with argument twitterId
			});
		},
		// Create Facebook message
		function ( twitterId, next){ //take value resultData.data in arg1
			if( !twitterId ){ //if twitterID is false  return error data
				next( true,"(App Mex) Error retrieving twitter data...");
				return;
			}
			// data facebook is success
			FacebookModule.post( msg, function facebookCallback( resultData ){ //method post by module Facebook
				if(resultData.success === false){ //if the result is false than return error
					next( true, resultData.error);
					return;
				}
			
				var facebookId = resultData.data ? resultData.data.id : null; // if data isn't false use id_str otherwise null
				console.log('Facebook........'+ facebookId); // output data FacebookId
				next(null, twitterId, facebookId); // passed data at next array with two arguments
			});
		},
		//Save Message in DB with Mongoose
		function (twitterId, facebookId, next){ //take two arguments
			if( !facebookId ) { //if facebookId is false return error data
				next( true,"(App Mex) Error retrieving facebook data..");
				return;
			}
			//Key-value JSON
			var dataToSave = {
				user_tw_id: process.env.USER_TW_ID, //use value of user id from twitter 
				user_fb_id: process.env.USER_FB_ID, //use value of user id from facebook
				message: msg,  //body of the message
				tweet_id: twitterId, //use value of message id from twitter
				fb_id: facebookId  //use value of message id from facebook
			};
			
			DatabaseModule.post(dataToSave, function databaseCallback( resultData,next){ //method post by module database
				if(resultData.success === false){ //if the result is false than return error
					next( true, resultData.error);
					return;
				}
				var databaseResult = resultData.data ? resultData.data.id: null;// if data isn't false use id_str otherwise null
				next( null, databaseResult);
			});
		}
		], function(err,result){ //json result 
				if(err){
					res.json({'error':result}); //show error json result 
				}else{
					console.log('Main callback: '+ result); 
			 		res.json(result); //show json result 
				}
			}
	);   
	console.log('END PROGRAM'); // ending voice of  async waterfall
});
	

//method GET of the app at the path "../:message_id --> ObjectId("1234567890")"
app.get('/message/:message_id',function(req,res,next){
	var messageId = req.params.message_id; //request at the 'message_id' property
	console.log('PROGRAM START'); // start the async waterfall

	async.waterfall([
		function(next){
			// Database call
			console.log("(AppMex) Fetching a database record by ID");
			DatabaseModule.get(messageId, function databaseCallback( resultData ){
				if ( resultData.success === false){
					// Error calling the database
					next( true, resultData.error );
					return;
				}
				
				next(null, resultData.data); // <- Result from the database "resultData.data"
			});
		},
		function(databaseResult, next){
			// Twitter call
			if ( !databaseResult || !databaseResult.tweet_id ){
				next(true, "(App Mex) Error retrieving the tweet_id from the database...");
				return;
			} 
			
			var tweet_id = databaseResult.tweet_id;
			TwitterModule.get(tweet_id, function twitterCallback( resultData ){ 
				if ( resultData.success === false){ // Error retrieving the tweet from Twitter
					// Error calling the database
					next( true, resultData.error );
					return;
				}
				
				var twitterResult = resultData.data;
				next(null, databaseResult, twitterResult);
			});
		},
		function(databaseResult, twitterResult, next){
			/// TODO: Facebook call
			if ( !databaseResult || !databaseResult.fb_id ){
				next( true, "(App Mex) Error retrieving the fb_id from the database...");
				return;
			}
			
			var fb_id = databaseResult.fb_id;
			console.log("The facebook id is ", fb_id);
			console.log(JSON.stringify(databaseResult));
			FacebookModule.get(fb_id, function facebookCallback( resultData ){
				if( resultData.success === false){ //Error retrieving the tweet from Facebook
					// Error calling the database
					next( true, resultData.error);
					return;
				}
				
				var facebookResult = resultData.data;
				next(null,databaseResult, twitterResult, facebookResult);
			});
		},
		function(databaseResult, twitterResult, facebookResult, next){
			var finalResult = {
				db: databaseResult, 
				twitter: twitterResult,
				facebook: facebookResult
			};
			next(null, finalResult);
		}],
		function(err,result){ //<- Final function. It will return the result to the client
			if(err){
				res.json({ is_error: err, error: result});
				return;
			}
				
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