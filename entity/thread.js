var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');

router.post('/close/',function(req, res, next) {
	res.send('user.create')
})

router.post('/create/',function(req, res, next) {
	var result = {};
	result.response = req.body;
	if (req.body.isDeleted != undefined) {
		req.body.isDeleted = false;
	}
	mod_func.get_user(req.query.user, function(user_data, httpreq) {	
		console.log("get user = ", httpreq);
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			mod_func.get_forum(req.query.forum, function(forum_data, httpreq) {	
				console.log("get forum = ", httpreq);
				if (httpreq === 400) {
					res.status(httpreq).json(forum_data);
				} else {
					connect.query("INSERT INTO Threads (forum_id, title, isClosed, user_id, date, message, slug, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", 
						[forum_data.id, req.body.title, req.body.isClosed, user_data.id, req.body.date, req.body.message, req.body.slug, req.body.isDeleted], 
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
				}
			});
		}
	});
})

router.get('/details/',function(req, res, next) {
	var result = {};
	mod_func.get_thread(req.query.thread, function(thread_data, httpreq) {	
		if (httpreq === 400) {
			res.status(httpreq).json(thread_data);
		} else {
			result.response = thread_data;
			result.code = 0;
			res.status(200).json(result);
		}
	})
})

router.get('/list/',function(req, res, next) {
	var result = {};
	if (req.query.user !== undefined) {
		connect.query("SELECT * FROM Threads t JOIN Users u ON t.user_if=u.id WHERE u.email=?;", 
			[req.body.user], 
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
	} else {
		if (req.query.forum !== undefined) {
			connect.query("SELECT * FROM Threads t JOIN Forums f ON t.forum_id=f.id WHERE f.short_name=?;", 
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
		}
	}
})

router.get('/listPosts/',function(req, res, next) {
	result = {};

	connect.query("SELECT * FROM Posts WHERE thread_id=?;", 
		[req.query.thread], 
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

router.post('/open/',function(req, res, next) {
	result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isClosed=true WHERE id=?;", 
		[req.query.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
					result.response.thread = req.query.thread;
					result.code = 0;
					res.status(200).json(result);
			}
		});		
})


router.post('/remove/',function(req, res, next) {
	res.send('user.create')
})

router.post('/restore/',function(req, res, next) {
	res.send('user.create')
})

router.get('/subscribe/',function(req, res, next) {
	res.send('user.create')
})


router.get('/unsubscribe/',function(req, res, next) {
	res.send('user.create')
})


router.post('/update/',function(req, res, next) {
	result = {};
	qStr = 'UPDATE Threads SET message='+req.body.message+', slug='+req.body.slug+' WHERE id='+req.body.thread+';';
	mod_func.execute_sql(qStr, function(data){
		mod_func.get_thread(req.body.thread, function(thread_data){
			result.response = thread_data;
			result.code = 0;
			res.status(200).json(result);
		});		
	});
})

router.post('/vote/',function(req, res, next) {
	result = {};
	if (req.body.vote === 1) {
		qStr = 'UPDATE Threads SET likes = likes + 1 WHERE id =' +req.body.thread+ ';';
	}
	if (req.body.vote === -1) {
		qStr = 'UPDATE Threads SET dislikes = dislikes + 1 WHERE id =' +req.body.thread+ ';';
	}
	mod_func.execute_sql(qStr, function(data){
		mod_func.get_thread(req.body.thread, function(thread_data){
			result.response = thread_data;
			result.code = 0;
			res.status(200).json(result);
		});
	});

})


module.exports = router