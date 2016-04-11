var express = require('express');
var app = express();
var connect = require('./dbconnect');


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
	connect.query("SELECT * FROM Users WHERE email=?;", 
		[email], 
		function(err, data) {
			if (err) {
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
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'User is not found';
						callback(result, 400);
					} else {
						result = data;
						callback(result, 200);
					}
			}
		});	
}



exports.get_thread = function (id, callback) {
	var data = {};
	var result = {};
	connect.query("SELECT * FROM Threads WHERE id=?;", 
		[id], 
		function(err, data) {
			if (err) {
				err = mysqlErr(err.errno);
				result = err;
				callback(result, 400);
			} else {
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'Thread is not found';
						callback(result, 400);
					} else {
						result = data[0];
						callback(result, 200);
					}
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
					if (Object.keys(data).length === 0) {
						result.code = 1;
						result.message = 'Forum is not found';
						callback(result, 400);
					} else {
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
			errAns.message = "duplicateRecord";
			break;
		case 1064:
			errAns.code = 3;
			errAns.message = "semantic";
			break;
		case 1327:
			errAns.code = 3;
			errAns.message = "semantic";
			break;
		default:
			errAns.code = 4;
			errAns.message = "unknown";
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