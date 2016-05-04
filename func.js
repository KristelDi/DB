var express = require('express');
var app = express();
var connect = require('./dbconnect');
var moment = require('moment');

function TwoDigits(s){
  if(s<10){s = '0'+s;}else{s = ''+s;} return(s)
 }

exports.execute_sql = function (sql_string, callback) {
	data = {};
	connect.query(sql_string, function(err, data) {
		if (err) {
			throw err;
		} else {
			// console.log("data execute");
			// console.log(data);
			if (typeof callback === 'function') {
				callback(data);
			}
		}
	});		
}


exports.get_user = function (email, callback) {
	var data = {};
	var result = {};
	//console.log('tet user email = ' + email);
	connect.query("SELECT * FROM Users WHERE email=?;", 
		[email], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					//console.log('data');
					//console.log(data);
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'User is not found';
						callback(result, 400);
					} else {
						result = data[0];
						callback(result, 200);
					}
			}
		});			
}


exports.get_user_full = function (email, callback) {
	var data = {};
	var result = {};
	//console.log('tet user email = ' + email);
	connect.query("SELECT * FROM Users WHERE email=?;", 
		[email], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'User is not found';
						callback(result, 400);
					} else {
						result = data[0];
						get_subscribers(email, function(subscribers, httpreq) {	
							get_followers(email, function(followers, httpreq) {	
								get_followees(email, function(followees, httpreq) {	
									result.followers = followers;
									result.following = followees;
									result.subscriptions = subscribers;
									callback(result, 200);
								})
							})
						})
					}
			}
		});			
}

function get_subscribers(user, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT thread FROM Subscribers WHERE user=?;", 
		[user], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				
				result = data;

				callback(result, 200);
			}
		})
}



function get_followers(user, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT follower FROM Followers WHERE followee=?;", 
		[user], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				result = data;
				callback(result, 200);
			}
		})
}


function get_followees(user, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT followee FROM Followers WHERE follower=?;", 
		[user], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				result = data;
				callback(result, 200);
			}
		})
}


exports.get_user_by_id = function (id, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT * FROM Users WHERE id=?;", 
		[id], 
		function(err, data) {
			if (err) {
				//console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					//console.log('data');
					//console.log(data);
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'User is not found';
						callback(result, 400);
					} else {
						result = data[0];
						callback(result, 200);
					}
			}
		});			
}

exports.get_user_by_ids = function (arr_id, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT * FROM Users WHERE id IN (?);", 
		[arr_id], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					//console.log('data');
					//console.log(data);
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.response = 'User is not found';
						callback(result, 400);
					} else {
						result = data;
						callback(result, 200);
					}
			}
		});	
}


function GetDate(date){
	var delim = '-';
    var spacer = ' ';
    var str = [
	    date.getFullYear().toString(),
	    delim,
	    TwoDigits(date.getMonth() + 1),
	    delim,
	    TwoDigits(date.getDate()),
	    spacer,
	    TwoDigits(date.getHours()),
	    delim,
	    TwoDigits(date.getMinutes()),
	    delim,
	    TwoDigits(date.getSeconds())
	].join('');
	return str;
}

exports.get_thread = function (id, callback) {
	var data = {};
	var result = {};
	//console.log('request = SELECT * FROM Threads WHERE id=' + id);
	connect.query("SELECT * FROM Threads WHERE id=?;", 
		[id], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					console.log('data');
					console.log(data);
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.response = 'Thread is not found';
						callback(result, 400);
					} else {
						var newdate = moment(data[0].date);
						data[0].date = newdate.format('YYYY-MM-DD HH:mm:ss');
						data[0].points = data[0].likes-data[0].dislikes;
						result = data[0];
						callback(result, 200);
						// get_count_posts(id, function(posts, httpreq) {	
						// 	// console.log("hhttpreq = "+httpreq);
						// 	// console.log("posts = "+posts);
						// 	if (httpreq === 400) {
						// 		res.status(httpreq).json(thread_data);
						// 	} else {
						// 		result.posts = posts;
						// 		callback(result, 200);
						// 	}
						// })
					}
			}
		});
}

exports.increment_count_posts = function (thread_id, callback) {
	var result = {};
	connect.query("UPDATE Threads SET posts = posts + 1 WHERE id=?;", 
		[thread_id], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				result.code = 0;
				callback(result, 200);
			}
		});
}
exports.decrement_count_posts = function (thread_id, callback) {
	var result = {};
	connect.query("UPDATE Threads SET posts = posts - 1 WHERE id=?;", 
		[thread_id], 
		function(err, data) {
			if (err) {
				console.log(err);
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				result.code = 0;
				callback(result, 200);
			}
		});
}


function get_count_posts (thread_id, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT COUNT(*) as posts FROM Posts WHERE thread=? AND isDeleted=false;", 
		[thread_id], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
				//console.log(data);
				result = data[0].posts;
				//console.log("res = " + result);
				callback(result, 200);
			}
		});
}


exports.get_forum = function (short_name, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT * FROM Forums WHERE short_name=?;", 
		[short_name], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					console.log('data');
					console.log(data);
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.response = 'Forum is not found';
						callback(result, 400);
					} else {
						result = data[0];
						callback(result, 200);
					}
			}
		});
}

exports.get_post = function (id, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT *, likes-dislikes as points FROM Posts WHERE id=?;", 
		[id], 
		function(err, data) {
			//console.log("try to err" + err);
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					if (Object.keys(data).length === 0 || data[0] === undefined) {
						//console.log("error post not found")
						result.code = 1;
						result.response = 'Post is not found';
						callback(result, 400);
					} else {
						console.log("DATE 1 " + data[0].date);
						if (data[0].date === undefined)
							console.log("WTFWTFWTFWTFWTF!!!!!!!!!!WTFWTFW") 
						var newdate = moment(data[0].date);
						data[0].date = newdate.format('YYYY-MM-DD HH:mm:ss');
						result = data[0];
						callback(result, 200);
					}
			}
		});
}

var errors = {
	requireFields: {
		code: 2,
		message: "Не хватает параметров в запросе"
	},
	unknown: {
		code: 4,
		message: "Неизвестная ошибка"
	},
	duplicateRecord: {
		code: 5,
		message: "Дублирующася запись в таблицу"
	},
	norecord: {
		code: 1,
		message: "Такой записи в таблице нет"
	},
	semantic: {
		code: 3,
		message: "Семантическая ошибка запроса"
	},
	notWrite: {
		code: 1,
		message: "Ошибка записи, почему-то не записалось(("
	},
	notMemory: {
		code: 4,
		message: "Алфавита не хватает для записи постов в этот уровень"
	}
};

exports.mysqlErr = function (errCode) {
	var errAns = {};
	switch(errCode) {
		case 1062: 
			errAns.code = 5;
			errAns.response = "duplicateRecord";
			break;
		case 1064:
			errAns.code = 3;
			errAns.response = "semantic";
			break;
		case 1327:
			errAns.code = 3;
			errAns.response = "semantic";
			break;
		default:
			errAns.code = 4;
			errAns.response = "unknown";
			break;
	}
	return errAns;
}

// exports.get_forum = function (email, user_data, callback) {
// 	qStr = 'SELECT * FROM Users WHERE email="' + email + '";';
// 	connect.query(qStr, function(err, rows) {
// 		if (err) {
// 			throw err;
// 		} else {
// 			user_data = rows[0];
// 			console.log("user_data");
// 			console.log(user_data);
// 			if (typeof callback === 'function') {
// 				callback();
// 			}
// 		}
// 	});		
// }

exports.include = function(arr, obj) {
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

exports.format_dates = function (data) {
    for(var i=0; i<data.length; i++) {
    	console.log("was date: " + data[i].date);
		if (data[i].date === undefined)
			console.log("WTFWTFWTFWTFWTF!!!!!!!!!!WTFWTFW") 
   		var newdate = moment(data[i].date);
		data[i].date = newdate.format('YYYY-MM-DD HH:mm:ss');
    	console.log("now date: " + data[i].date);
	}
	return data;
}

exports.user_details = function(email){
	result = {};
	// my_response = {};
	// qStr = 'SELECT * FROM Users WHERE email="' + email + '";';
	// console.log(qStr);
	// connect.query(qStr, function(err, rows){
	// 	if(err)	{
	// 		// result.code = 
	// 		throw err;
	// 	} else{
	// 		my_response = get_user(rows);
	// 		console.log("my resp = " + my_response);
	// 		result.code = 0;
	// 		result.response = my_response;
	// 		console.log("result = " + result);
	// 		return result;
	// 	}
	// });	
}


module.exports.user_details;
module.exports.get_user;