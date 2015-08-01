var express = require('express');

var module = express.Router();

module.get('/',function(req,res,next){
	console.log('Index');
});

module.exports = module;