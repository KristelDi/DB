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
	connect.query("INSERT INTO Posts (date, thread_id, message, user, forum, parent, isApproved, isHighlighted, isEdited, isSpam, isDeleted) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);", 
		[req.body.date, req.body.thread, req.body.message, req.body.user, req.body.forum, req.body.parent, req.body.isApproved, req.body.isHighlighted, req.body.isEdited, req.body.isSpam, req.body.isDeleted], 
		function(err, data) {
			if (err) {
				console.log(err);
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
			connect.query("SELECT * FROM Posts p JOIN Forums f ON p.forum=f.short_name WHERE f.short_name=?;", 
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
	connect.query("UPDATE Posts SET isDeleted=true WHERE id=?;", 
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
	var result = {};
	result.response = {};
	connect.query("UPDATE Posts SET isDeleted=false WHERE id=?;", 
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
	console.log((req.body.vote > 0));
	connect.query("UPDATE Posts SET likes=likes+?, dislikes=dislikes+? WHERE id =?;", 
		[(req.body.vote > 0), (req.body.vote < 0), req.body.thread], 
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


module.exports = router