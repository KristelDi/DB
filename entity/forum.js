var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');


router.post('/create/', function(req, res, next) {
 	var result = {};
	result.response = req.body;
	// console.log(req.body);
	connect.query("INSERT INTO Forums (name, short_name, user) VALUES (?, ?, ?);", 
		[req.body.name, req.body.short_name, req.body.user], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				result.response.id = data.insertId;
				result.code = 0;
				res.status(200).json(result);
			}
	});		
})


router.get('/details/', function(req, res, next) {
	var result = {};
	result.response = req.body;
	connect.query("SELECT * FROM Forums WHERE short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				console.log(data);
				result.response.id = data[0].insertId;
				if (req.query.related !== undefined){
					mod_func.get_user(data[0].user, function(data_user, httpreq){
						result.response.user = data_user;
						result.code = 0;
						res.status(200).json(result);
					});
				}
			}
	});		
})


router.get('/listPosts/', function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("SELECT * FROM Posts p JOIN Forums f ON p.forum_id = f.id WHERE f.short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				result.response = data;
				mod_func.get_forum(data.forum_id, function(forum_data, httpreq){
					mod_func.get_user(data.user_id, function(user_data,httpreq){
						mod_func.get_thread(data.thread, function(thread_data, httpreq){
							if (include(req.query.related,'forum')) {
								result.response.forum = forum_data;
							} else {
								result.response.forum = forum_data.short_name;
							}
							if (include(req.query.related,'user')) {
								result.response.user = user_data;
							} else {
								result.response.user = user_data.email;
							}
							if (include(req.query.related,'thread')) {
								result.response.thread = thread_data;
							} else {
								result.response.thread = thread_data.id;
							}
							result.code = 0;
							res.status(200).json(result);
						})
					})
				})
			}
	});		
})

router.get('/listThreads/', function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("SELECT * FROM Threads t JOIN Forums f ON t.forum_id = f.id WHERE f.short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				result.response = data;
				result.code = 0;
				res.status(200).json(result);
			}
	});		
})

router.get('/listUsers/', function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("SELECT * FROM Users u JOIN Forums f ON u.id = f.user_id WHERE f.short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				result.response = data;
				result.code = 0;
				res.status(200).json(result);
			}
	});		
})

function include(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
}

module.exports = router