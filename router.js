var express = require('express');
var router = express.Router();


router.post('/user/create/',function(req, res, next) {
	res.send('user.create')
})

router.get('/user/details/:user', function(req, res, next) {
	res.send('user.details' + req.params);
})

router.post('/user/follow/',function(req, res, next) {
	res.send('user.follow')
})

router.get('/user/listFollowers/',function(req, res, next) {
	res.send('user.listFollowers')
})

router.get('/user/listFollowing/',function(req, res, next) {
	res.send('user.listFollowing')
})

router.get('/user/listPosts/',function(req, res, next) {
	res.send('user.listPosts')
})

router.post('/user/unfollow/',function(req, res, next) {
	res.send('user.unfollow')
})

router.post('/user/updateProfile/',function(req, res, next) {
	res.send('user.updateProfile')
})


module.exports = router