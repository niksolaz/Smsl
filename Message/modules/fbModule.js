var FB = require('fb');

// Access token
var accessToken = process.env.ACCESS_TOKEN;

module.exports.userfb = function(){
	
	var userfb =process.env.USER_FB_ID;
	
	console.log('(Facebook) UserId: ', userfb );
	return userfb;
};

module.exports.get = function( facebookId, moduleCallback){
	// Result that will be sent back
	var result = {
		success: false, 
		data: null,
		error: null
	};
	
	FB.setAccessToken(accessToken);
	
	FB.api(
		facebookId,
		{
			posts:[ {'id':facebookId} ],
			accessToken:accessToken
			
		}, 
		function (res) {
	  		if(!res || res.error) {
	   			console.log("(Facebook) An error has occurred. Error: ", res.error);
	   			result.success = false;
	   			result.error = res.error;
	   			moduleCallback(result);
	   			return;
	  		}
  			console.log('(Facebook) Facebook result: ', JSON.stringify(res) );
  			result.success = true;
  			result.data = res;
  			moduleCallback(result);
		}
	);
};

module.exports.post = function ( facebookStatus, moduleCallback ){
	// Result that will be sent back
	var result = {
		success: false, 
		data: null,
		error: null
	};
			
	FB.setAccessToken(accessToken);
	
	FB.api('me/feed', 'post', 
	{
		posts:[{ message:facebookStatus },{id:facebookStatus.id}]
		
	}, function ( res ) {
		
		if( !res || res.error ) {
   			console.log("(Facebook) An error has occurred while posting to Facebook. Error: ", res.error);
   			result.success = false;
   			result.error = res.error;
   			moduleCallback(result);
   			return;
  		}					
  		console.log('(Facebook) Returning Facebook: ' + JSON.stringify(res) );
  		
  		// Format successful data
  		result.success = true;
  		result.data = {
  			fb_data:res.data, 
  			fb_id:res.id
  		};
  		moduleCallback(result);
	});
};
