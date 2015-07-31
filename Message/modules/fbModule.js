
var express = require('express');
var FB = require('fb');
var database = require('./dbModule');


facebook.userfb = function(){
	var userfb =process.env.USER_FB_ID;
	console.log('USER_FB_ID',userfb);
	return userfb;
};

facebook.get = function(mongoObj,tweets,callback){
					FB.setAccessToken(process.env.ACCESS_TOKEN);
					FB.api(mongoObj.fb_id,{posts:[{'id':mongoObj.fb_id}],accessToken:process.env.ACCESS_TOKEN}, function (res) {
	  					if(!res || res.error) {
	   						console.log(!res ? 'error occurred' : res.error);
	   						console.log('Error posting Facebook');
	    					callback(true,res.error);
	   						return;
	  					}
	  					console.log('From Facebook: '+res);
	  					callback(null,mongoObj,tweets,res);
					});
};

facebook.post = function(tweet,callback){
			
					FB.setAccessToken(process.env.ACCESS_TOKEN);
					FB.api('me/feed', 'post',{message:msg}, function (res) {
						if(!res || res.error) {
							console.log(!res ? 'error occurred' : res.error);
		    				console.log('Error posting Facebook');
		    				callback(true,res.error);
		    				return;
		  				}  					
		  				console.log('Post Id: ' + res.id);
		  				callback(null,tweet,res)
					});
};

module.exports = facebook;