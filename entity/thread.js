var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');
var moment = require('moment');


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
			console.log(err);
			err = mod_func.mysqlErr(err.errno);
			result = err;
			res.status(200).json(result);
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
			res.status(200).json(thread_data);
		} else {
			result.response = thread_data;
			if (thread_data.isDeleted === 1)
				thread_data.posts = 0;
			//console.log("thread data = " + thread_data);
			mod_func.get_forum(thread_data.forum, function(forum_data, httpreq){
				mod_func.get_user(thread_data.user, function(user_data,httpreq){
					if (mod_func.include(req.query.related,'forum')) {
						result.response.forum = forum_data;
					} 
					if (mod_func.include(req.query.related,'user')) {
						result.response.user = user_data;
					}
					if (mod_func.include(req.query.related,'thread')) {
						result.code = 3;
						result.response = "two many args";
						res.status(200).json(result);	
					} else {
						result.code = 0;
						res.status(200).json(result);
					}
				})
			})
		}
	})
})

router.get('/list/',function(req, res, next) {
	var result = {};
	var str_since = "";
	var str_limit = ";";
	var str_order = "";

	if (req.query.since) {
		var newdate = moment(req.query.since);
		req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
		str_since = " AND date >= '" + req.query.since + "'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit;
	if (req.query.order)
		str_order = " ORDER BY date " + req.query.order;

	if (req.query.user !== undefined) {
		connect.query("SELECT * FROM Threads WHERE user=?" + str_since + str_order + str_limit + ";", 
			[req.query.user], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(200).json(result);
				} else {
						result.response = mod_func.format_dates(data);
						result.code = 0;
						res.status(200).json(result);
				}
			});		
	} else {
		if (req.query.forum !== undefined) {
			connect.query("SELECT * FROM Threads WHERE forum=?" + str_since + str_order + str_limit + ";", 
				[req.query.forum], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(200).json(result);
					} else {
							//console.log(data);
							result.response = mod_func.format_dates(data);
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
	var str_sort = "";
	var str_order = "";
	var str_limit = ";";
	console.log(req.query);
	if (req.query.since) {
		var newdate = moment(req.query.since);
		req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
		str_since = " AND date >= '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.sort === "flat" || !req.query.sort)
		str_sort = " ORDER BY date";
	if (req.query.order)
		str_order = " "+ req.query.order;
	if(req.query.sort === "tree") {
		str_sort = " ORDER BY path ASC ";
		if (req.query.order === "desc") {
			str_sort = ' ORDER BY LPAD(path, 2, "") DESC, path ASC';
		}		
		str_order = "";
	}
	if(req.query.sort === "parent_tree") {
		if (req.query.order === "asc" || !req.query.order) {
			var tmp = String( req.query.limit);
			while (tmp.length < 2) tmp = '0' + tmp;
			str_sort = ' AND (path < "' + tmp + '") ';
			str_sort += ' ORDER BY path ASC';
			str_limit='';
		}

		if (req.query.order === "desc" || !req.query.order) {
			var tmp = String( req.query.limit);
			while (tmp.length < 2) tmp = '0' + tmp;
			str_sort = ' AND (path < "' + tmp + '") ';
			str_sort += ' order by LPAD(path, 2, "") DESC, path ASC';
			str_limit='';
		}
		str_order = "";
	}

	 console.log("SELECT * FROM Posts p JOIN Threads t ON p.thread=t.id WHERE t.id=?" + str_since + str_sort + str_order + str_limit + ";");

	mod_func.get_thread(req.query.thread, function(thread_data, httpreq) {	
		if (httpreq === 400) {
			res.status(200).json(thread_data);
		} else {
			console.log(thread_data);
			connect.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.thread=?" + str_since + str_sort + str_order + str_limit + ";", 
				[req.query.thread], 	
				function(err, data) {
					if (err) {
						console.log(err);
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(200).json(result);
					} else {
							console.log(data);
							result.response = mod_func.format_dates(data);
							if (thread_data.isDeleted === 1) {
								for(var i=0; i<data.length; i++) {
    								data[i].isDeleted = 1;
    							}
							}
							result.code = 0;
							res.status(200).json(result);
					}
				});		
		}
	})

})

router.post('/open/',function(req, res, next) {
	result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isClosed=false WHERE id=?;", 
		[req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
					result.response.thread = req.body.thread;
					result.code = 0;
					res.status(200).json(result);
			}
		});		
})

router.post('/close/',function(req, res, next) {
	result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isClosed=true WHERE id=?;", 
		[req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
					result.response.thread = req.body.thread;
					result.code = 0;
					res.status(200).json(result);
			}
		});		
})

router.post('/remove/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Threads SET isDeleted=true WHERE id=?;", 
		[req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
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
		[req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
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
	connect.query("INSERT INTO Subscribers (user, thread) VALUES (?, ?);", 
			[req.body.user, req.body.thread], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(200).json(result);
				} else {
					//result.response = data;
					result.code = 0;
					res.status(200).json(result);
				}
		});		
})


router.post('/unsubscribe/',function(req, res, next) {
	var result = {};
	result.response = req.body;
		connect.query("DELETE FROM Subscribers WHERE user=? AND thread=?;", 
				[req.body.user, req.body.thread], 
				function(err, data) {
					if (err) {
						console.log(err);
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(200).json(result);
					} else {
						//result.response = data;
						result.code = 0;
						res.status(200).json(result);
					}
		});		
})


router.post('/update/',function(req, res, next) {
	var result = {};
	result.response = {};
	//console.log("UPDATE Threads SET message=?, slug=? WHERE id="+req.body.thread);
	connect.query("UPDATE Threads SET message=?, slug=? WHERE id=?;", 
		[req.body.message, req.body.slug, req.body.thread], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
				mod_func.get_thread(req.body.thread, function(thread_data, httpreq) {	
					if (httpreq === 400) {
						res.status(200).json(thread_data);
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
	//console.log((req.body.vote > 0));
	connect.query("UPDATE Threads SET likes=likes+?, dislikes=dislikes+? WHERE id =?;", 
		[(req.body.vote > 0), (req.body.vote < 0), req.body.thread], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
				mod_func.get_thread(req.body.thread, function(thread_data, httpreq) {	
					if (httpreq === 400) {
						res.status(200).json(thread_data);
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