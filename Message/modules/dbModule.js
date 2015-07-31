//Database Mongodb connect with Mongoose
var mongoose = require('mongoose');

var mongoAddress = process.env.MONGO_ADDRESS; // e.g. 127.0.0.1
var mongoAddressPort = process.env.MONGO_ADDRESS_PORT || 27017; // e.g. 27017
var mongoColletion = process.env.MONGO_COLLECTION; // e.g. msgGlobal/msgs
var mongoAddressScheme = "mongodb://"
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
	user_id: String,
	user_fb_id: String,
	message: String,
	tweet_id: String,
	fb_id: String
});

var MSG = mongoose.model('MSG',msgSchema);

database.get = function(callback){
					db.collection('msgs').findOne({'_id':msg_id},function(err,file){
						if(err) return callback(err);
						console.log('From DB: '+file.message);
						callback(null,file);
					});
};

database.post = function(tweet,fbStatus,callback){
					var msgSocial = new MSG({
						user_tw_id: userTweet,
						user_fb_id: userfb,
						message: msg, 
						tweet_id: tweet.id_str, 
						fb_id: fbStatus.id
					});
					console.log(msgSocial.user_tw_id, msgSocial.user_fb_id, msgSocial.message, msgSocial.tweet_id, msgSocial.fb_id);
					msgSocial.save(function(err,file){  
						if(err) {
							callback(true,'Error saving the user in MongoDB');
							return;
						}
						console.log('User saved successfully!')
						callback(null,file);	
					});
			
};

module.exports = database;