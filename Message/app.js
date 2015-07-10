var express = require('express');
var app = express();

var message = {
	'sms':{
		'id':101,
		'user':'Mario Rossi',
		'textM':[],
		'social':{
			'social_id':['Twitter','Google+','Facebook']
		}

	}
};

app.use(express.static(__dirname + '/public'));

app.get('/',function(req,res){
	res.send(message[req.param.message]);
	console.log(message);
});

app.get('/:sms',function(req,res){
	res.send(message[req.param.sms]);
	console.log(message.sms);
});

app.get('/sms/:id',function(req,res){
	res.send(message[req.param.id]);
	console.log(message.sms.id);
});

app.get('/sms/:user',function(req,res){
	res.send(message[req.param.user]);
	console.log(message.sms.user);
});

app.get('/sms/:text',function(req,res){
	res.send(message[req.param.textM]);
	console.log(message.sms.textM);
});

app.get('/sms/:social',function(req,res){
	res.send(message[req.param.social]);
	console.log(message.sms.social);
});

app.get('/sms/social/social_id',function(req,res){
	res.send(message[req.param.social_id]);
	console.log(message.sms.social.social_id);
});

app.listen(3000);