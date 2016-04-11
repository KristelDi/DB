// exports.get_user = function  (connection) {
// 	returnObject = {};
// 	connection.query('INSERT INTO Users (email, username, about, name, isAnonimous) VALUES ("Q@masdseffil.ru", "tesdergfst", "afdbout", "nadsme", 0);',
// 		function(err,rows){
// 	  if(err) throw err;
// 	  returnObject.code = 0;
// 	  returnObject.response = rows;
// 	  console.log('Data received from Db:\n');
// 	  console.log(rows);
// 	});
// 	return returnObject;
// }

// // exports.create_user = function (connection, input) {
// // 	returnObject = {};
// // 	if (input.isAnonymous !== undefined) {
// // 		connection.query('INSERT INTO Users (username, about, isAnonimous, name, email) VALUES ("'+ input.username +'", "' + input.about + '","' + input.isAnonimous +'", "' + input.name +  '", "'
// // 			 + input.email + '");',
// // 			function(err,rows){
// // 				if(err) throw err;
// // 		  		returnObject.code = 0;
// // 		  		returnObject.response = input;
// // 			}
// // 		);
// // 	}
// // 	else {
// // 		connection.query('INSERT INTO Users (email) VALUES ("'+ 'input.body.email3' +'");',
// // 			function(err,rows){
// // 				if(err) throw err;
// // 				console.log(input);
// // 		  		returnObject.code = 0;
// // 		  		returnObject.response = input;
// // 			}
// // 		);
// // 		returnObject.answer = "undef";
// // 		returnObject.wtf = input.name;
// // 	}
// // 	return returnObject;
// // }











// 		// connection.query('INSERT INTO Users (username, about, name, email) VALUES ("'+ input.body.username +'", "' + input.body.about + '", "' + input.body.name +  '", "'
// 		// 	 + input.body.email + '");',
// 		// 	function(err,rows){
// 		// 		if(err) throw err;
// 		//   		returnObject.code = 0;
// 		//   		returnObject.response = input;
// 		// 	}
// 		// );
