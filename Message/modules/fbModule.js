
var express = require('express');
var FB = require('fb');
var database = require('./dbModule');


facebook.userfb = function(){
	var userfb =process.env.USER_FB_ID;
	console.log('USER_FB_ID',userfb);
	return userfb;
};

module.exports = facebook;