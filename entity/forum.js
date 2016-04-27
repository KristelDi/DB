var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');


router.post('/create/', function(req, res, next) {
 	var result = {};
	result.response = req.body;
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
	result.response = req.query;
	console.log(req.query);
	connect.query("SELECT * FROM Forums WHERE short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				console.log(data);
				result.response = data[0];
				console.log('result');
				console.log(result);
				mod_func.get_user(data[0].user, function(user_data, httpreq){
					console.log('user data');
					console.log(user_data);
					if (req.query.related !== undefined){
						result.response.user = user_data;						
						result.code = 0;
						console.log('yes response');
						console.log(result.response);
						res.status(200).json(result);
					} else {
						result.code = 0;
						console.log('no response');
						console.log(result.response);
						res.status(200).json(result);
					}
				});	
			}
	});		
})

router.get('/listPosts/', function(req, res, next) {
	var result = {};
	result.response = {};
	// if (include(req.query.related,'forum')) {
	// 	sqlForum = ", f.id, f.shor"
	// } else {
	// }

	connect.query("SELECT * FROM Posts p JOIN Forums f ON p.forum=f.short_name JOIN Users u ON p.user=u.email JOIN Threads t ON p.thread_id=t.id  WHERE f.short_name=?;", 
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

				// mod_func.get_forum(data.forum_id, function(forum_data, httpreq){
				// 	mod_func.get_user(data.user_id, function(user_data,httpreq){
				// 		mod_func.get_thread(data.thread, function(thread_data, httpreq){
							
				// 			console.log(forum_data);

				// 			result.response.forum = {};
				// 			if (include(req.query.related,'forum')) {
				// 				result.response.forum = forum_data;
				// 				result.response.forum.test = 'yes';
				// 			} else {
				// 				result.response.forum = forum_data.short_name;
				// 			}

				// 			result.response.user = {};
				// 			if (include(req.query.related,'user')) {
				// 				result.response.user = user_data;
				// 				result.response.user.test = 'yes';
				// 			} else {
				// 				result.response.user = user_data.email;
				// 			}

				// 			result.response.thread = {};
				// 			if (include(req.query.related,'thread')) {
				// 				result.response.thread = thread_data;
				// 				result.response.thread.test = 'yes';
				// 			} else {
				// 				result.response.thread = thread_data.id;
				// 			}

				// 			result.code = 0;
				// 			res.status(200).json(result);
				// 		})
				// 	})
				// })




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