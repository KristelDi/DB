var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');

router.post('/create/',function(req, res, next) {
	var result = {};
	result.response = req.body;
	if (req.body.isDeleted != undefined) {
		req.body.isDeleted = false;
	}
	connect.query("INSERT INTO Threads (forum, title, isClosed, user, date, message, slug, isDeleted) VALUES (?, ?, ?, ?, ?, ?, ?, ?);", 
		[req.body.forum, req.body.title, req.body.isClosed, req.body.user, req.body.date, req.body.message, req.body.slug, req.body.isDeleted], 
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
		connect.query("SELECT * FROM Threads WHERE user=?;", 
			[req.query.user], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(400).json(result);
				} else {
						console.log(data);
						result.response = data;
						result.code = 0;
						res.status(200).json(result);
				}
			});		
	} else {
		if (req.query.forum !== undefined) {
			connect.query("SELECT * FROM Threads WHERE forum=?;", 
				[req.query.forum], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(400).json(result);
					} else {
							console.log(data);
							result.response = data;
							result.code = 0;
							res.status(200).json(result);
					}
				});
		}
	}
})

router.get('/listPosts/',function(req, res, next) {
	var result = {};
	result.response = {};
	var str_since = "";
	var str_limit = ";";
	if (req.query.since) {
		str_since = " AND p.date > '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = "LIMIT " + req.query.limit + ";";

	if (!req.query.sort)
		req.query.sort = 'flat';
	if (!req.query.order)
		req.query.order = 'DESC';

	if (req.query.sort === 'flat') {
		sqlStr = "SELECT * FROM Posts p JOIN Forums f ON p.forum_id=f.id WHERE f.short_name='"+req.query.forum+"'"+ str_since + " ORDER BY " + " date " +req.query.order+ str_limit;
	}
	console.log('qstr = ' + sqlStr);
	// sqlStr = "SELECT * FROM Posts p WHERE p.thread_id="+req.query.thread + str_since + " ORDER BY "+req.query.order + str_limit;

	connect.query(sqlStr, function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
					console.log(data);
					result.response = data;
					result.code = 0;
					res.status(200).json(result);
			}
		});		
})

router.post('/open/',function(req, res, next) {
	result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isClosed=false WHERE id=?;", 
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

router.post('/close/',function(req, res, next) {
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
	var result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isDeleted=true WHERE id=?;", 
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

router.post('/restore/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isDeleted=false WHERE id=?;", 
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

router.post('/subscribe/',function(req, res, next) {
	var result = {};
	result.response = req.body;
	mod_func.get_user(req.body.user, function(user_data, httpreq) {	
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			connect.query("INSERT INTO Subscribers (user_id, thread_id) VALUES (?, ?);", 
					[user_data.id, req.body.thread], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(400).json(result);
						} else {
							//result.response = data;
							result.code = 0;
							res.status(200).json(result);
						}
				});		
		}
	})
})


router.post('/unsubscribe/',function(req, res, next) {
	var result = {};
	result.response = req.body;
	mod_func.get_user(req.body.user, function(user_data, httpreq) {	
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			connect.query("DELETE FROM Subscribers WHERE user_id=? AND thread_id=?;", 
					[user_data.id, req.body.thread], 
					function(err, data) {
						if (err) {
							console.log(err);
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(400).json(result);
						} else {
							//result.response = data;
							result.code = 0;
							res.status(200).json(result);
						}
				});		
		}
	})})


router.post('/update/',function(req, res, next) {
	var result = {};
	result.response = {};
	console.log("UPDATE Threads SET message=?, slug=? WHERE id="+req.body.thread);
	connect.query("UPDATE Threads SET message=?, slug=? WHERE id=?;", 
		[req.body.message, req.body.slug, req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_thread(req.body.thread, function(thread_data, httpreq) {	
					if (httpreq === 400) {
						res.status(httpreq).json(thread_data);
					} else {
						result.response = thread_data;
						result.code = 0;
						res.status(200).json(result);
					}
				})
			}
	});		
})


router.post('/vote/',function(req, res, next) {
	var result = {};
	result.response = {};
	console.log((req.body.vote > 0));
	connect.query("UPDATE Threads SET likes=likes+?, dislikes=dislikes+? WHERE id =?;", 
		[(req.body.vote > 0), (req.body.vote < 0), req.body.thread], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_thread(req.body.thread, function(thread_data, httpreq) {	
					if (httpreq === 400) {
						res.status(httpreq).json(thread_data);
					} else {
						result.response = thread_data;
						result.code = 0;
						res.status(200).json(result);
					}
				})
			}
	});		

})


module.exports = router