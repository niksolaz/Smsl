
//Database Mongodb connect with Mongoose
var mongoose = require('mongoose');

var mongoAddress = process.env.MONGO_ADDRESS; // e.g. 127.0.0.1
var mongoAddressPort = process.env.MONGO_ADDRESS_PORT || 27017; // e.g. 27017
var mongoColletion = process.env.MONGO_COLLECTION; // e.g. msgGlobal/msgs
var mongoAddressScheme = "mongodb://";
var mongoURI = mongoAddressScheme + mongoAddress + ":" + mongoAddressPort + "/" + mongoColletion;

console.log("Connecting to MongoDB at the uri: ", mongoURI);
mongoose.connect(mongoURI);

var db = mongoose.connection;
db.on('error',console.error.bind(console,'connection error: '));
db.once('connected',function(){
	console.log('Connected to the database');
});

// Example Schema 
var msgSchema = mongoose.Schema({
	user_tw_id: String,
	user_fb_id: String,
	message: String,
	tweet_id: String,
	fb_id: String
});

var MSG = mongoose.model('MSG',msgSchema);
//method GET
module.exports.get = function( databaseId, moduleCallback ){
	
	var result = {
		success: true, 
		data: null,
		error: null
	};
	
	var dbId = mongoose.Types.ObjectId(databaseId); //To specify a type of ObjectId
	db.collection('msgs').findOne(
		{
			'_id':dbId // ObjectId from collection db
		},
		//call file from database
		function(err,file){
			if(err){  
				console.log('Error read Database...');
				result.success = false;
				result.error = err;
				moduleCallback(result);
				return; 
			}
			console.log('From Database: '+ JSON.stringify(file)); // convert value file in string
			result.success = true;
			result.data = file;
			moduleCallback( result );
		}
	);
};

module.exports.post = function( databaseMessage, moduleCallback ){
	var result = {
		success: true,
		data: null,
		error: null
	};
	
	var msgSocial = new MSG({
		user_tw_id: process.env.USER_TW_ID,
		user_fb_id: process.env.USER_FB_ID,
		message: databaseMessage.message, 
		tweet_id: databaseMessage.id_str, 
		fb_id: databaseMessage.id   
	});
	
	console.log( msgSocial);
	
	msgSocial.save( function( err, file ){  
		if( err ) {
			console.log( "(Database) Error saving the user in Database" );
			result.success = false;
			result.error = err;
			moduleCallback( result );
			return;
		}
		console.log( "(Database) User saved successfully"+ JSON.stringify(file));
		result.success = true;
		result.data = file;
		moduleCallback( result );	
	});
			
};

