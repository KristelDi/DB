var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');
var moment = require('moment');

router.post('/create/', function(req, res) {
 	var result = {};
//	console.log("req/body create user");
	//console.log(req.body);
	result.response = req.body;
	if (req.body.isAnonymous === undefined) {
		req.body.isAnonymous = false;
	}
	connect.query("INSERT INTO Users (username, about, name, email, isAnonymous) VALUES (?, ?, ?, ?, ?);", 
		[req.body.username, req.body.about, req.body.name, req.body.email, req.body.isAnonymous], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result.response = err;
				result.code = 5;
				res.status(200).json(result);
			} else {
				mod_func.get_user(req.body.email, function (data_user, httpreq) {
					result.response = data_user;
					result.code = 0;
					res.status(httpreq).json(result);
				});							
			}
		});		
})

router.get('/details/', function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_user_full(req.query.user, function(user_data, httpreq) {
		if (httpreq === 400) {
			res.status(200).json(user_data);
		} else {
			result.response = user_data;
			result.code = 0;
			res.status(200).json(result);
		}
	});


	// connect.query("SELECT * FROM Users WHERE email=?;", 
	// 	[req.query.user], 
	// 	function(err, data) {
	// 		if (err) {
	// 			err = mod_func.mysqlErr(err.errno);
	// 			result = err;
	// 			res.status(400).json(result);
	// 		} else {
	// 			result.response = data[0];
	// 			result.code = 0;
	// 			res.status(200).json(result);
	// 		}
	// 	});	
})

router.post('/follow/',function(req, res, next) {
	var result = {};
	result.response = {};
	//console.log(req.body);
	connect.query("INSERT INTO Followers (follower, followee) VALUES (?, ?);", 
		[req.body.follower, req.body.followee], 
		function(err, data) {
			if (err) {
				//console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
				mod_func.get_user_full(req.body.follower, function(user_data, httpreq) {
					if (httpreq === 400) {
						res.status(200).json(user_data);
					} else {
						result.response = user_data;
						result.code = 0;
						res.status(200).json(result);
					}
				});

			}
		});	
});


router.get('/listFollowers/',function(req, res, next) { 
	var result = {};
	result.response = {};
	var str_since = "";
	var str_order = "";
	var str_limit = ";";
	
	if (req.query.since) {
		str_since = " AND since_id > " + req.query.since_id;	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.order)
		str_order = " ORDER BY name "+ req.query.order;
	console.log("SELECT id FROM Users u JOIN Followers f ON  u.email = f.follower WHERE f.followee=?" + str_since + str_order + str_limit + ";");
	connect.query("SELECT id FROM Users u JOIN Followers f ON  u.email = f.follower WHERE f.followee=?" + str_since + str_order + str_limit + ";", 
		[req.query.user], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				if (Object.keys(data).length === 0) {
					result.code = 0;
					res.status(200).json(result);
				} else {
					arr_ids =  data.map(function(test) {
						return test.id;
					})
					console.log("get_user by id" + arr_ids);
					mod_func.get_user_by_id(arr_ids, function(data_users, httpreq) {
						result.response = data_users;
						result.code = 0;
						res.status(httpreq).json(result);
					});
				}
			}
		});	
	
})


router.get('/listFollowing/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_user(req.query.user, function(user_data, httpreq) {
		if (httpreq === 400) {
			res.status(200).json(user_data);
		} else {
			connect.query("SELECT id FROM Users u JOIN Followers f ON u.email = f.followee WHERE f.follower=?;", 
				[req.query.user], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(400).json(result);
					} else {
						//console.log('DATA ');
						//console.log(data);
						if (Object.keys(data).length === 0) {
							result.code = 0;
							res.status(200).json(result);
						} else {
							arr_ids =  data.map(function(test) {
								return test.id;
							})
							mod_func.get_user_by_id(arr_ids, function(data_users, httpreq) {
								result.response = data_users;
								result.code = 0;
								res.status(httpreq).json(result);
							});
							// mod_func.get_user_by_ids(arr_ids, function(data_users, httpreq) {
							// 	result.response = data_users;
							// 	result.code = 0;
							// 	res.status(httpreq).json(result);
							// });
						}
					}
				});	
		}
	});
})

router.get('/listPosts/',function(req, res, next) {
	var result = {};
	result.response = {};
	var str_since = "";
	var str_sort = "";
	var str_order = "";
	var str_limit = ";";
	
	if (req.query.since) {
		var newdate = moment(req.query.since);
		req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
		str_since = " AND date > '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.sort === "flat" || !req.query.sort)
		str_sort = " ORDER BY date";
	if(req.query.sort === "tree")
		str_sort = " ORDER BY parent, date ";
	if(req.query.sort === "parent_tree")
		str_sort = " ORDER BY parent, date ";
	if (req.query.order)
		str_order = " "+ req.query.order;

	console.log("SELECT * FROM Posts WHERE user=?" + str_since + str_sort + str_order + str_limit + ";");

	connect.query("SELECT  p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.user=?" + str_since + str_sort + str_order + str_limit + ";", 
		[req.query.user], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
					result.response = mod_func.format_dates(data);
					result.code = 0;
					res.status(200).json(result);
			}
		});	
})

router.post('/unfollow/',function(req, res, next) {
	var result = {};
	result.response = {};
	//console.log(req.body);
	connect.query("DELETE FROM Followers WHERE follower=? AND followee=?;", 
		[req.body.follower, req.body.followee], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_user_full(req.body.follower, function(data_users, httpreq) {
					result.response = data_users;
					result.code = 0;
					res.status(httpreq).json(result);
				});							
			}
		});
})

router.post('/updateProfile/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Users SET about=?, name=? WHERE email=?;", 
		[req.body.about, req.body.name, req.body.user], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				mod_func.get_user(req.body.user, function (user_data, httpreq) {
					result.response = user_data;
					result.code = 0;
					res.status(httpreq).json(result);
				});							
			}
		});		
})


module.exports = router

