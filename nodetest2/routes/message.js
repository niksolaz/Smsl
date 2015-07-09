var express = require('express');
var router = express.Router();


router.get('/',function(req,res,next){
	res.render('message',{ title: 'Show My Social Likes' });
	next();
});

module.exports = router;