var express = require('express');
var router = express.Router();
// var connect = require('./../dbconnect');
var database = require('./../dbconnect');
var pool = database.pool;
var mod_func = require('./../func');
var pars = require('./../app.js');

router.post('/create/',function(req, res, next) {
	var name_of_request = "POSTS create";
	console.time(name_of_request);
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

	mod_func.get_math_path(req.body, function(mathpath, httpreq){
		database.pool.query("INSERT INTO Posts (date, thread, message, user, forum, parent, isApproved, isHighlighted, isEdited, isSpam, isDeleted, path) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
			[req.body.date, req.body.thread, req.body.message, req.body.user, req.body.forum, req.body.parent, req.body.isApproved, req.body.isHighlighted, req.body.isEdited, req.body.isSpam, req.body.isDeleted, mathpath], 
			function(err, data) {
				if (err) {
					console.log(err);
					err = mod_func.mysqlErr(err.errno);
					result = err;
					console.timeEnd(name_of_request);
					res.status(200).json(result);
				} else {
					result.response.id = data.insertId;
					mod_func.increment_count_posts(req.body.thread, function(err, data) {
						result.code = 0;
						console.timeEnd(name_of_request);
						res.status(200).json(result);						
					});
				}
			});	
	});
})


router.get('/details/',function(req, res, next) {
	var name_of_request = "POSTS details";
	console.time(name_of_request);
	var result = {};
	console.log("pars = ", pars);


	result.response = {};
	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		mod_func.get_post(req.query.post, function(post_data, httpreq) {	
			if (httpreq === 400) {
				res.status(200).json(post_data);
			} else {
				result.response = post_data;
				if (req.query.related) {	
					mod_func.get_full_info_one(post_data, req.query.related, function(return_data, httpreq) {
							result.response = return_data;
							result.code = 0;
							console.timeEnd(name_of_request);
							res.status(200).json(result);	
						});
				} else {
					result.code = 0;
					console.timeEnd(name_of_request);
					res.status(200).json(result);				
				}
			}
		});		
	}
})

router.get('/list/',function(req, res, next) {
	var name_of_request = "POSTS list";
	console.time(name_of_request);
	var result = {};
	var str_since = "";
	var str_limit = ";";
	var str_order = "";
	if (req.query.since)
		str_since = " AND p.date >= '" + req.query.since + "'";	
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit;
	if (req.query.order)
		str_order = " ORDER BY p.date " + req.query.order;

	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		if (req.query.thread !== undefined) {
			database.pool.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.thread=?" + str_since + str_order + str_limit + ";", 
				[req.query.thread], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						console.timeEnd(name_of_request);
						res.status(200).json(result);
					} else {
						result.response = mod_func.format_dates(data);
						result.code = 0;
						console.timeEnd(name_of_request);
						res.status(200).json(result);
					}
				});		
		} else {
			if (req.query.forum !== undefined) {
				database.pool.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.forum=?" + str_since + str_order + str_limit + ";", 
					[req.query.forum], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							console.timeEnd(name_of_request);
							res.status(200).json(result);
						} else {
							result.response = mod_func.format_dates(data);
							result.code = 0;
							console.timeEnd(name_of_request);
							res.status(200).json(result);
						}
					});
			}
		}
	}
})

router.post('/remove/',function(req, res, next) {
	var name_of_request = "POSTS remove";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	mod_func.get_post(req.body.post, function(post_data, httpreq) {	
		if (httpreq === 400) {
			res.status(200).json(post_data);
		} else {
			if (post_data.isDeleted === 0) {
				database.pool.query("UPDATE Posts SET isDeleted=1 WHERE id=?;", 
					[req.body.post], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							console.timeEnd(name_of_request);
							res.status(200).json(result);
						} else {
							result.response.post = req.body.post;
							mod_func.decrement_count_posts(post_data.thread, function(err, data) {
								result.code = 0;
								console.timeEnd(name_of_request);
								res.status(200).json(result);						
							});
						}
				});		
			} else {
				result.code = 0;
				result.response.post = req.body.post;
				console.timeEnd(name_of_request);
				res.status(200).json(result);										
			}
		}
	})

})

router.post('/restore/',function(req, res, next) {
	var name_of_request = "POSTS restore";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	mod_func.get_post(req.body.post, function(post_data, httpreq) {	
		if (httpreq === 400) {
			res.status(200).json(post_data);
		} else {
			if (post_data.isDeleted === 1) {
				database.pool.query("UPDATE Posts SET isDeleted=0 WHERE id=?;", 
					[req.body.post], 
					function(err, data) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							console.timeEnd(name_of_request);
							res.status(200).json(result);
						} else {
							result.response.post = req.body.post;
							mod_func.increment_count_posts(post_data.thread, function(err, data) {
								result.code = 0;
								console.timeEnd(name_of_request);
								res.status(200).json(result);						
							});
						}
				});		
			} else {
				result.code = 0;
				result.response.post = req.body.post;
				console.timeEnd(name_of_request);
				res.status(200).json(result);										
			}
		}
	})
})

router.post('/update/',function(req, res, next) {
	var name_of_request = "POSTS update";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	database.pool.query("UPDATE Posts SET message=? WHERE id=?;", 
		[req.body.message, req.body.post], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				console.timeEnd(name_of_request);
				res.status(200).json(result);
			} else {
				mod_func.get_post(req.body.post, function(post_data, httpreq) {	
					if (httpreq === 400) {
						console.timeEnd(name_of_request);
						res.status(200).json(post_data);
					} else {
						result.response = post_data;
						result.code = 0;
						console.timeEnd(name_of_request);
						res.status(200).json(result);
					}
				})
			}
	})
})

router.post('/vote/',function(req, res, next) {
	var name_of_request = "POSTS vote";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	database.pool.query("UPDATE Posts SET likes=likes+?, dislikes=dislikes+? WHERE id =?;", 
		[(req.body.vote > 0)*1, (req.body.vote < 0)*1, req.body.post], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				console.timeEnd(name_of_request);
				res.status(200).json(result);
			} else {
				mod_func.get_post(req.body.post, function(post_data, httpreq) {	
					if (httpreq === 400) {
						console.timeEnd(name_of_request);
						res.status(200).json(post_data);
					} else {
						result.response = post_data;
						result.code = 0;
						console.timeEnd(name_of_request);
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