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
	mod_func.get_user(req.body.user, function (user_data, httpreq) {
		if (httpreq === 400) {
			res.status(httpreq).json(user_data);
		} else {
			mod_func.get_forum(req.body.forum, function(forum_data, httpreq) {	
				if (httpreq === 400) {
					res.status(httpreq).json(forum_data);
				} else {
					connect.query("INSERT INTO Posts (date, thread_id, message, user_id, forum_id, parent, isApproved, isHighlighted, isEdited, isSpam, isDeleted) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
						[req.body.date, req.body.thread, req.body.message, user_data.id, forum_data.id, req.body.parent, req.body.isApproved, req.body.isHighlighted, req.body.isEdited, req.body.isSpam, req.body.isDeleted], 
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
	result.response = {};
	connect.query("SELECT * FROM Posts WHERE id=?;", 
		[req.query.post], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				console.log(data);
				result.response = data[0];
				if (req.query.related !== undefined){
					mod_func.get_user(data.user, function(user_data, httpreq){
						result.response.user = user_data;
						result.code = 0;
						res.status(200).json(result);
					});
				} else {
					result.code = 0;	
					res.status(200).json(result);
				}
			}
	});		
})

router.get('/list/',function(req, res, next) {
	var result = {};
	if (req.query.thread !== undefined) {
		connect.query("SELECT * FROM Posts p JOIN Threads t ON t.id=p.thread_id WHERE t.id=?;", 
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
	} else {
		if (req.query.forum !== undefined) {
			connect.query("SELECT * FROM Posts p JOIN Forums f ON p.id=f.post_id WHERE f.short_name=?;", 
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

router.post('/remove/',function(req, res, next) {
	var result = {};
	result.response = {};
	connect.query("UPDATE Posts SET isDeleted = true WHERE id=?;", 
		[req.query.post], 
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
	res.send('user.create')
})

router.post('/update/',function(req, res, next) {
	res.send('user.create')
})

router.post('/vote/',function(req, res, next) {
	res.send('user.create')
})


module.exports = router