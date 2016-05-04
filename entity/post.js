var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');

router.post('/create/',function(req, res, next) {
	var result = {};
	result.response = {};
	if (req.body.parent === undefined) {
		req.body.parent = 0;
	}
	if (req.body.isApproved === undefined) {
		req.body.isApproved = false;
	}
	if (req.body.isHighlighted === undefined) {
		req.body.isHighlighted = false;
	}
	if (req.body.isEdited === undefined) {
		req.body.isEdited = true;
	}
	if (req.body.isSpam === undefined) {
		req.body.isSpam = false;
	}	
	if (req.body.isDeleted === undefined) {
		req.body.isDeleted = false;
	}	
	result.response = req.body;
	var mathpath = '';

	console.log("HI");
	mod_func.get_math_path(req.body, function(mathpath, httpreq){
		console.log("mathpath" + mathpath);
		connect.query("INSERT INTO Posts (date, thread, message, user, forum, parent, isApproved, isHighlighted, isEdited, isSpam, isDeleted, path) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
			[req.body.date, req.body.thread, req.body.message, req.body.user, req.body.forum, req.body.parent, req.body.isApproved, req.body.isHighlighted, req.body.isEdited, req.body.isSpam, req.body.isDeleted, mathpath], 
			function(err, data) {
				if (err) {
					console.log(err);
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(400).json(result);
				} else {
					result.response.id = data.insertId;
					mod_func.increment_count_posts(req.body.thread, function(err, data) {
						result.code = 0;
						res.status(200).json(result);						
					});
				}
			});	
	});
})


router.get('/details/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_post(req.query.post, function(post_data, httpreq) {	
		if (httpreq === 400) {
			//console.log("res = " + post_data);
			res.status(200).json(post_data);
		} else {
			result.response = post_data;
			mod_func.get_forum(post_data.forum, function(forum_data, httpreq){
				mod_func.get_user(post_data.user, function(user_data,httpreq){
					mod_func.get_thread(post_data.thread, function(thread_data, httpreq){
						if (include(req.query.related,'forum')) {
							result.response.forum = forum_data;
						} 
						if (include(req.query.related,'user')) {
							result.response.user = user_data;
						}
						if (include(req.query.related,'thread')) {
							result.response.thread = thread_data;
						}
						result.code = 0;
						res.status(200).json(result);
					})
				})
			})	
		}
	});		
})

router.get('/list/',function(req, res, next) {
	var result = {};
	var str_since = "";
	var str_limit = ";";
	var str_order = "";
	if (req.query.since)
		str_since = " AND p.date > '" + req.query.since + "'";	
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit;
	if (req.query.order)
		str_order = " ORDER BY p.date " + req.query.order;

	if (req.query.thread !== undefined) {
		//console.log("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p JOIN Threads second ON second.id=p.thread WHERE second.id=?" + str_since + str_order + str_limit + ";")
		connect.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p JOIN Threads second ON second.id=p.thread WHERE second.id=?" + str_since + str_order + str_limit + ";", 
			[req.query.thread], 
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
		//console.log("SELECT * FROM Posts p JOIN Forums second ON p.forum=second.short_name WHERE second.short_name=?" + str_since + str_order + str_limit + ";");
		if (req.query.forum !== undefined) {
			connect.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p JOIN Forums second ON p.forum=second.short_name WHERE second.short_name=?" + str_since + str_order + str_limit + ";", 
				[req.query.forum], 
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
		}
	}

})

router.post('/remove/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_post(req.body.post, function(post_data, httpreq) {	
		if (httpreq === 400) {
			res.status(httpreq).json(post_data);
		} else {
			console.log(post_data);
			console.log("post data is Del" + post_data.isDeleted);
			if (post_data.isDeleted === 0) {
				console.log("FALSE")
				connect.query("UPDATE Posts SET isDeleted=1 WHERE id=?;", 
					[req.body.post], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(200).json(result);
						} else {
							console.log("date");
							console.log(data);
							result.response.post = req.body.post;
							mod_func.decrement_count_posts(post_data.thread, function(err, data) {
								result.code = 0;
								res.status(200).json(result);						
							});
						}
				});		
			} else {
				result.code = 0;
				result.response.post = req.body.post;
				res.status(200).json(result);										
			}
		}
	})

})

router.post('/restore/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_post(req.body.post, function(post_data, httpreq) {	
		if (httpreq === 400) {
			res.status(httpreq).json(post_data);
		} else {
			if (post_data.isDeleted === 1) {
				connect.query("UPDATE Posts SET isDeleted=0 WHERE id=?;", 
					[req.body.post], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(200).json(result);
						} else {
							console.log("date");
							console.log(data);
							result.response.post = req.body.post;
							mod_func.increment_count_posts(post_data.thread, function(err, data) {
								result.code = 0;
								res.status(200).json(result);						
							});
						}
				});		
			} else {
				result.code = 0;
				result.response.post = req.body.post;
				res.status(200).json(result);										
			}
		}
	})
})

router.post('/update/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Posts SET message=? WHERE id=?;", 
		[req.body.message, req.body.post], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_post(req.body.post, function(post_data, httpreq) {	
					if (httpreq === 400) {
						res.status(httpreq).json(post_data);
					} else {
						result.response = post_data;
						result.code = 0;
						res.status(200).json(result);
					}
				})
			}
	})
})

router.post('/vote/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Posts SET likes=likes+?, dislikes=dislikes+? WHERE id =?;", 
		[(req.body.vote > 0)*1, (req.body.vote < 0)*1, req.body.post], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_post(req.body.post, function(post_data, httpreq) {	
					if (httpreq === 400) {
						res.status(httpreq).json(post_data);
					} else {
						result.response = post_data;
						result.code = 0;
						res.status(200).json(result);
					}
				})
			}
	});		
})


function include(arr, obj) {
	if(arr === undefined)
		return false;
	if (arr.length > 3) 
		arr = [arr];
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) {
        	return true;
        }
    }
}

module.exports = router