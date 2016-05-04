var express = require('express');
var router = express.Router();
var connect = require('./../dbconnect');
var mod_func = require('./../func');
var moment = require('moment');

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
	//console.log(req.query);
	connect.query("SELECT * FROM Forums WHERE short_name=?;", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				//console.log(data);
				result.response = data[0];
				//console.log('result');
				//console.log(result);
				mod_func.get_user(data[0].user, function(user_data, httpreq){
					//console.log('user data');
					//console.log(user_data);
					if (req.query.related !== undefined){
						result.response.user = user_data;						
						result.code = 0;
						//console.log('yes response');
						//console.log(result.response);
						res.status(200).json(result);
					} else {
						result.code = 0;
						//console.log('no response');
						//console.log(result.response);
						res.status(200).json(result);
					}
				});	
			}
	});		
})

router.get('/listPosts/', function(req, res, next) {
	var result = {};
	result.response = {};
	var str_since = "";
	var str_order = "";
	var str_limit = ";";
	console.log(req.query);
	if (req.query.since) {
		var newdate = moment(req.query.since);
		req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
		str_since = " AND p.date > '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.order)
		str_order = " ORDER BY p.date "+ req.query.order;

	console.log("SELECT * FROM Posts p WHERE p.forum=?" + str_since + str_order + str_limit + ";");

	connect.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.forum=?" + str_since + str_order + str_limit + ";",  
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
				data = mod_func.format_dates(data);
				result.response = data;
				//console.log(data);
				console.log("related = " + req.query.related);
				
				mod_func.get_full_info(data, req.query.related, function(data_all, httpreq) {					
		
					result.response = data_all;
					result.code = 0;
					res.status(200).json(result);
				});
			}
	});		
})

router.get('/listThreads/', function(req, res, next) {
	var result = {};
	result.response = {};
	var str_since = "";
	var str_order = "";
	var str_limit = ";";
	console.log(req.query);
	if (req.query.since) {
		var newdate = moment(req.query.since);
		req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
		str_since = " AND t.date > '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.order)
		str_order = " ORDER BY t.date "+ req.query.order;


	connect.query("SELECT * FROM Threads t WHERE t.forum=?" + str_since + str_order + str_limit + ";", 
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(200).json(result);
			} else {
				data = mod_func.format_dates(data);
				result.response = data;
				//console.log(data);
				console.log("related = " + req.query.related);
				
				mod_func.get_full_info(data, req.query.related, function(data_all, httpreq) {				
		
					result.response = data_all;
					result.code = 0;
					res.status(200).json(result);
				});
			
			}
	});		
})

router.get('/listUsers/', function(req, res, next) {
	var result = {};
	result.response = {};
	var str_since = "";
	var str_order = "";
	var str_limit = ";";
	console.log(req.query);
	if (req.query.since) {
		str_since = " AND u.id > '" + req.query.since+"'";	
	}
	if (req.query.limit)
		str_limit = " LIMIT " + req.query.limit + ";";
	if (req.query.order)
		str_order = " ORDER BY u.name "+ req.query.order;

console.log("SELECT * FROM Users u JOIN Forums f ON u.email = f.user WHERE f.short_name=?"+ str_since + str_order + str_limit + ";");

	connect.query("SELECT * FROM Users u JOIN Forums f ON u.email = f.user WHERE f.short_name=?"+ str_since + str_order + str_limit + ";",  
		[req.query.forum], 
		function(err, data) {
			if (err) {
				err = mod_func.mysqlErr(err.errno);
				result = err;
				res.status(400).json(result);
			} else {
				data = mod_func.format_dates(data);
				result.response = data;
				//console.log(data);
				console.log("related = " + req.query.related);
				if (req.query.related) {
					mod_func.get_full_info(data, req.query.related, function(data_all, httpreq) {				
						result.response = data_all;
						result.code = 0;
						res.status(200).json(result);
					});
				} else {
					console.log("result = ", result);
					result.code = 0;
					res.status(200).json(result);
				}
			
			}
	});		
})

function include(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
}

module.exports = router