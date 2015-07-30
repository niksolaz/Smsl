var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var Twitter = require('twitter');
var FB = require('fb');
var async = require('async');
var mongoose = require('mongoose');

var database = require('./modules/dbModule');
var facebook = require('./modules/fbModule');
var twitter = require('./modules/twModule');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.post();

app.get();

var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});