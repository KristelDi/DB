var express = require('express');
var app = express();
var connect = require('./dbconnect');
var moment = require('moment');
var async = require('async');


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
				var arr = [];
				for (var i in data){
					arr.push(data[i].thread);
				}
				result = arr;
				callback(result, 200);
			}
		})
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

function to_array(data) {
	var arr = [];
	for (var i in data){
		arr.push(data[i]);
	}
	return arr;
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
				var arr = [];
				for (var i in data){
					arr.push(data[i].follower);
				}
				result = arr;
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
				var arr = [];
				for (var i in data){
					arr.push(data[i].followee);
				}
				result = arr;
				callback(result, 200);
			}
		})
}


function get_user_full_id(id, callback) {
	var data = {};
	var result = {};
	var httpreq;
	//console.log('tet user email = ' + email);
	connect.query("SELECT * FROM Users WHERE id=?;", 
		[id], 
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
						var email = data[0].email;
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

function get_full_info_one(data, related, callback) {
	var result = data;
	console.log("full ONE data = ", data);
	exports.get_forum(data.forum, function(forum_data, httpreq){
		exports.get_user_full(data.user, function(user_data,httpreq){
			exports.get_thread(data.thread, function(thread_data, httpreq){
					if (exports.include(related,'forum')) {
						result.forum = forum_data;
					} 
					if (exports.include(related,'user')) {
						result.user = user_data;
					}
					if (exports.include(related,'thread')) {
						result.thread = thread_data;
					}
					console.log("result.forum = ", result.forum);

					callback(result,200);
			})
		})
	})	
}

exports.get_full_info = function(posts, related, callback) {
	var data = {};
	var result = [];
	var res ;
	var data_all = posts;
	res = posts.map(function(elem, index) {
			return function (callback) {
				console.log("elem = ", elem[index]);
				get_full_info_one(elem, related,
					function(return_data, httpreq) {
						callback(null, return_data);
					});
			}
		});
		//асинхронный запрос всех юзеров
		async.parallel(res,
		function (err, results){
			if (err) 
				callback(results, 400);
			else {
				//responceCallback(0, results);
				callback(results, 200);
			}
	});	
}

// exports.get_full_info_only_about_users = function(posts, related, callback) {
// 	var data = {};
// 	var result = [];
// 	var res ;
// 	var data_all = posts;
// 	res = posts.map(function(elem, index) {
// 			return function (callback) {
// 				console.log("elem = ", elem[index]);
// 				get_full_info_one(elem, related,
// 					function(return_data, httpreq) {
// 						callback(null, return_data);
// 					});
// 			}
// 		});
// 		//асинхронный запрос всех юзеров
// 		async.parallel(res,
// 		function (err, results){
// 			if (err) 
// 				callback(results, 400);
// 			else {
// 				//responceCallback(0, results);
// 				callback(results, 200);
// 			}
// 	});	
// }

exports.get_user_by_id = function (ids, callback) {
	var data = {};
	var result = [];
	console.log("ids = " + ids);
	var res ;
	res = ids.map( function(elem) {
			return function (callback) {
				get_user_full_id(elem,
					function(user_data, httpreq) {
						console.log("user_data");
						console.log(user_data);
						callback(null, user_data);
					});
			}
		});
		//асинхронный запрос всех юзеров
		async.parallel(res,
		function (err, results){
			if (err) 
				callback(results, 400);
			else {
				//responceCallback(0, results);
				callback(results, 200);
			}
		});	
	}















	// for (var i in ids) {
	// 	var id = ids[id];
	// 	console.log("id = " + ids[i]);
	// 	get_user_full_id(id, function(user_data, httpreq) {
	// 			if (httpreq === 400) {
	// 				callback(user_data, 400);
	// 			} else {
	// 				console.log(user_data);
	// 				if (i === ids.length-1) {
	// 					callback(result, 200)
	// 				} else {
	// 					result.push(user_data);
						
	// 				}
	// 			}
	// 		});
	// 	}
	// }
	// connect.query("SELECT * FROM Users WHERE id=?;", 
	// 	[id], 
	// 	function(err, data) {
	// 		if (err) {
	// 			//console.log(err);
	// 			err = mysqlErr(err.errno);
	// 			result = err;
	// 			callback(result, 400);
	// 		} else {
	// 				//console.log('data');
	// 				//console.log(data);
	// 				if (Object.keys(data).length === 0) {
	// 					result.code = 1;
	// 					result.message = 'User is not found';
	// 					callback(result, 400);
	// 				} else {
	// 					result = data[0];
	// 					callback(result, 200);
	// 				}
	// 		}
	// 	});			

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
	console.log('request = SELECT * FROM Threads WHERE id=' + id);
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
						// 	// console.log("httpreq = "+httpreq);
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
	console.log("arr = ", arr);
    for(var i=0; i<arr.length; i++) {
        if (arr[i] == obj) {
        	console.log("arr[i] ", arr[i], " obj ", obj);
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

exports.get_math_path = function (input_data, callback) {
	console.log("GET MATH PATH");
//	async.parallel(		
		//получаем MaterPath родителя
		connect.query("SELECT path FROM Posts WHERE id = ? AND thread = ?;", 
			[input_data.parent, input_data.thread],
			function(err, data) {
				if (err) {
					console.log("ERROR");
					console.log(err);
					err = mysqlErr(err.errno);
					result = err;
					callback(result, 400);
				} else {
					console.log(data);
					var parentPath;
					if (data.length === 0) {
						parentPath = '';
					} else {
						parentPath = data[0].path;
					}
					//максимальный номер ребенка по маске из родителя
					connect.query('SELECT MAX(path) AS max FROM Posts WHERE (path LIKE ?) AND (thread = ?) ORDER BY path', 
						[parentPath + '__', input_data.thread], 
						function(err, data) {
							if (err) {
								err = mysqlErr(err.errno);
								result = err;
								callback(result, 400);
							} else {
								//формирование следующего нового MaterPath
								var newMaterPath;
								if (data[0].max === null) {
									//предков этого parenta нет, поэтому создаем новый уровень вложенности
									newMaterPath = parentPath + '00';
									console.log("mat path = " + newMaterPath);
								} else {
									//2 последних символа строки на один уровень вложенности
									var tmp = data[0].max.slice(-2);
									tmp = (parseInt(tmp, 36) + 1).toString(36);
									while (tmp.length < 2) tmp = '0' + tmp;
									//больше чем 2 последних символа строки
									if (tmp.length > 2) 
										callback(error.notMemory, null);
									else {
										newMaterPath = parentPath + tmp;
									}
								}
								callback(newMaterPath, 200);	
							}
						});
				}
			})
//		)
}


module.exports.user_details;
module.exports.get_user;