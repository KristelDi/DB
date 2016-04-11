var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');


router.post('/create/', function(req, res) {
 	var result = {};
	console.log("req/body create user");
	console.log(req.body);
	result.response = req.body;
	if (req.body.isAnonymous === undefined) {
		req.body.isAnonymous = false;
	}
	connect.query("INSERT INTO Users (username, about, name, email, isAnonymous) VALUES (?, ?, ?, ?, ?);", 
		[req.body.username, req.body.about, req.body.name, req.body.email, req.body.isAnonymous], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
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
	connect.query("SELECT * FROM Users WHERE email=?;", 
		[req.query.user], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				result.response = data[0];
				result.code = 0;
				res.status(200).json(result);
			}
		});	
})

router.post('/follow/',function(req, res, next) {
	var result = {};
	result.response = {};
	var followee = 0;
	var follower = 1;
	console.log(req.body);
	connect.query("SELECT * FROM Users WHERE email IN (?, ?);", 
		[req.body.follower, req.body.followee], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				console.log(data);
				if (data[1].email === req.body.follower) {
					followee = 1;
					follower = 0;
				};
				connect.query("INSERT INTO Followers (follower_id, followee_id) VALUES (?, ?);", 
					[data[followee].id, data[follower].id], 
					function(err, data2) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(400).json(result);
						} else {
							result.response = data[follower];
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
	mod_func.get_user(req.query.user, function(user_data, httpreq) {
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			connect.query("SELECT id FROM Users u JOIN Followers f ON  u.id = f.follower_id WHERE f.followee_id=?;", 
				[user_data.id], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(400).json(result);
					} else {
						console.log('DATA ');
						console.log(data);
						if (Object.keys(data).length === 0) {
							result.code = 0;
							res.status(200).json(result);
						} else {
							arr_ids =  data.map(function(test) {
								return test.id;
							})
							mod_func.get_user_by_ids(arr_ids, function(data_users, httpreq) {
								result.response = data_users;
								result.code = 0;
								res.status(httpreq).json(result);
							});
						}
					}
				});	
		}
	});
})


router.get('/listFollowing/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_user(req.query.user, function(user_data, httpreq) {
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			connect.query("SELECT id FROM Users u JOIN Followers f ON  u.id = f.followee_id WHERE f.follower_id=?;", 
				[user_data.id], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						res.status(400).json(result);
					} else {
						console.log('DATA ');
						console.log(data);
						if (Object.keys(data).length === 0) {
							result.code = 0;
							res.status(200).json(result);
						} else {
							arr_ids =  data.map(function(test) {
								return test.id;
							})
							mod_func.get_user_by_ids(arr_ids, function(data_users, httpreq) {
								result.response = data_users;
								result.code = 0;
								res.status(httpreq).json(result);
							});
						}
					}
				});	
		}
	});
})

router.get('/listPosts/',function(req, res, next) {
	var result = {};
	result.response = {};
	mod_func.get_user(req.query.user, function(user_data, httpreq) {
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			connect.query("SELECT * FROM Posts WHERE user_id=?;", 
				[user_data.id], 
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
	});
})

router.post('/unfollow/',function(req, res, next) {
	var result = {};
	result.response = {};
	var followee = 0;
	var follower = 1;
	console.log(req.body);
	connect.query("SELECT * FROM Users WHERE email IN (?, ?);", 
		[req.body.follower, req.body.followee], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				console.log(data);
				if (data[1].email === req.body.follower) {
					followee = 1;
					follower = 0;
				};
				connect.query("DELETE FROM Followers WHERE follower_id=? AND followee_id=?;", 
					[data[followee].id, data[follower].id], 
					function(err, data2) {
						if (err) {
							err = mod_func.mysqlErr(err.errno);
							result = err;
							res.status(400).json(result);
						} else {
							mod_func.get_user(req.body.follower, function(data_users, httpreq) {
								result.response = data_users;
								result.code = 0;
								res.status(httpreq).json(result);
							});							
						}
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

