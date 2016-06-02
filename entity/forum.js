var express = require('express');
var router = express.Router();
// var connect = require('./../dbconnect');
var database = require('./../dbconnect');
var pool = database.pool;
var mod_func = require('./../func');
var moment = require('moment');
var pars = require('./../app.js');

router.get('/test/', function(req, res, next) {
	console.log(pars.get_pars());
	res.status(200).json(pars.get_pars());
})

router.post('/create/', function(req, res, next) {
 	var name_of_request = "FORUM create";
	console.time(name_of_request);
	var result = {};
	result.response = req.body;
	database.pool.query("INSERT INTO Forums (name, short_name, user) VALUES (?, ?, ?);", 
				[req.body.name, req.body.short_name, req.body.user], 
				function(err, data) {
					if (err) {
						err = mod_func.mysqlErr(err.errno);
						result = err;
						console.timeEnd(name_of_request);	
						res.status(200).json(result);
					} else {
						result.response.id = data.insertId;
						result.code = 0;
						console.timeEnd(name_of_request);
						res.status(200).json(result);
					}
			});
})

router.get('/details/', function(req, res, next) {
	var name_of_request = "FORUM details";
	console.time(name_of_request);
	var result = {};
	result.response = req.query;
	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		database.pool.query("SELECT * FROM Forums WHERE short_name=?;", 
			[req.query.forum], 
			function(err, data) {
				if (err) {
					//console.log(err);
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(200).json(result);
				} else {
					if (data.length === 0) {
						result.code = 0;
						result.response = [];
						console.timeEnd(name_of_request);
						res.status(200).json(result);
					} else {
						result.response = data[0];
						mod_func.get_user(data[0].user, function(user_data, httpreq){
							//console.log('user data');
							//console.log(user_data);
							if (req.query.related !== undefined) {
								result.response.user = user_data;						
								result.code = 0;
								console.timeEnd(name_of_request);
								res.status(200).json(result);
							} else {
								result.code = 0;
								console.timeEnd(name_of_request);
								res.status(200).json(result);
							}
						});	
					}
				}
		});	
	}	
})

router.get('/listPosts/', function(req, res, next) {
	var name_of_request = "FORUM listPosts";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		var str_since = "";
		var str_order = "";
		var str_limit = ";";
		if (req.query.since) {
			var newdate = moment(req.query.since);
			req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
			str_since = " AND p.date >= '" + req.query.since+"'";	
		}
		if (req.query.limit)
			str_limit = " LIMIT " + req.query.limit + ";";
		if (req.query.order)
			str_order = " ORDER BY p.date "+ req.query.order;

		database.pool.query("SELECT p.date, p.dislikes, p.forum, p.dislikes, p.forum, p.id, p.isApproved, p.isDeleted, p.isEdited, p.isHighlighted, p.isSpam, p.likes, p.message, p.thread, p.user, p.parent, p.likes-p.dislikes as points FROM Posts p WHERE p.forum=?" + str_since + str_order + str_limit + ";",  
			[req.query.forum], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					console.timeEnd(name_of_request);
					res.status(200).json(result);
				} else {
					data = mod_func.format_dates(data);
					result.response = data;		
					if (req.query.related) {	
						mod_func.get_full_info(data, req.query.related, function(data_all, httpreq) {					
							result.response = data_all;
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

router.get('/listThreads/', function(req, res, next) {
	console.time("FORUM listThreads");
	var result = {};
	result.response = {};
	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		var str_since = "";
		var str_order = "";
		var str_limit = ";";
		if (req.query.since) {
			var newdate = moment(req.query.since);
			req.query.since = newdate.format('YYYY-MM-DD HH:mm:ss');
			str_since = " AND t.date >= '" + req.query.since+"'";	
		}
		if (req.query.limit)
			str_limit = " LIMIT " + req.query.limit + ";";
		if (req.query.order)
			str_order = " ORDER BY t.date "+ req.query.order;


		database.pool.query("SELECT *, likes-dislikes as points FROM Threads t WHERE t.forum=?" + str_since + str_order + str_limit + ";", 
			[req.query.forum], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(200).json(result);
				} else {
					data = mod_func.format_dates(data);
					result.response = data;
					if (req.query.related){
						mod_func.get_full_info_forums(data, req.query.related, function(data_all, httpreq) {
							result.response = data_all;
							result.code = 0;
							console.timeEnd("FORUM listThreads");
							res.status(200).json(result);
						});
					} else {
							result.code = 0;
							console.timeEnd("FORUM listThreads");
							res.status(200).json(result);	
					}			
				}
		});		
	}
})

router.get('/listUsers/', function(req, res, next) {
	var name_of_request = "FORUM listUsers";
	console.time(name_of_request);
	var result = {};
	result.response = {};
	if (pars.get_pars()) return res.status(200).json(result);
	else
	{
		var str_since = "";
		var str_order = "";
		var str_limit = ";";
		if (req.query.since_id) {
			str_since = " AND u.id >= '" + req.query.since_id+"'";	
		}
		if (req.query.limit)
			str_limit = " LIMIT " + req.query.limit + ";";
		if (req.query.order)
			str_order = " ORDER BY u.name "+ req.query.order;


		var params = {};
		params.str_since = str_since;
		params.str_order = str_order;
		params.str_limit = str_limit;
		
		database.pool.query("SELECT DISTINCT user FROM Posts p WHERE p.forum=?;",  
			[req.query.forum], 
			function(err, data) {
				if (err) {
					err = mod_func.mysqlErr(err.errno);
					result = err;
					res.status(200).json(result);
				} else {
					if (data.length === 0) {
						result.code = 0;
						result.response = [];
						res.status(200).json(result);
					} else {
						var arr_emails =  data.map(function(test) {
								return "'"+test.user+"'";
							})
						mod_func.get_users_by_emails(arr_emails, params, function(data_users, httpreq){
							result.response = data_users;
							result.code = 0;
							console.timeEnd(name_of_request);
							res.status(httpreq).json(result);
						})
					}
				}
		});		
	}
})

function include(arr, obj) {
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) return true;
    }
}

module.exports = router