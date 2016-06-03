var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var mod_func = require('./func');;

app.use(bodyParser.json());

app.post('/db/api/clear/', function(req, res, next) {
	result = {};
	turn_off = 'SET foreign_key_checks = 0;';
	qStr1 = 'TRUNCATE TABLE Users;';
	qStr2 = 'TRUNCATE TABLE Forums;';
	qStr3 = 'TRUNCATE TABLE Threads;';
	qStr4 = 'TRUNCATE TABLE Posts;';
	qStr5 = 'TRUNCATE TABLE Followers;';
	qStr6 = 'TRUNCATE TABLE Subscribers;';
	turn_on = 'SET foreign_key_checks = 1;';
	mod_func.execute_sql(turn_off, function(data){
		mod_func.execute_sql(qStr1, function(data){
			mod_func.execute_sql(qStr2, function(data){
				mod_func.execute_sql(qStr3, function(data){
					mod_func.execute_sql(qStr4, function(data){
						mod_func.execute_sql(qStr5, function(data){
							mod_func.execute_sql(qStr6, function(data){
								mod_func.execute_sql(turn_on, function(data){
									result.response = 'OK';
									result.code = 0;
									res.status(200).json(result);
								})
							})
						})
					})
				})
			})
		})
		// res.status(200).json(data);
	})
})

app.get('/db/api/status/', function(req, res, next) {
	result = {};
	result.response = {};
	qStr1 = 'SELECT COUNT(*) as count_users FROM Users;';
	qStr2 = 'SELECT COUNT(*) as count_forums FROM Forums;';
	qStr3 = 'SELECT COUNT(*) as count_threads FROM Threads;';
	qStr4 = 'SELECT COUNT(*) as count_posts FROM Posts;';
	mod_func.execute_sql(qStr1, function(data){
		result.response.user = data[0].count_users;
		mod_func.execute_sql(qStr2, function(data){
			result.response.forum = data[0].count_forums;
			mod_func.execute_sql(qStr3, function(data){
				result.response.thread = data[0].count_threads;
				mod_func.execute_sql(qStr4, function(data){
					result.response.post = data[0].count_posts;
					result.code = 0;
					res.status(200).json(result);
				})
			})
		})
	})
})


app.use('/db/api/user', require('./entity/user'))
app.use('/db/api/forum', require('./entity/forum'))
app.use('/db/api/thread', require('./entity/thread'))
app.use('/db/api/post', require('./entity/post'))



var port = 8080;
app.listen(port, function () {
  console.log('Example app listening on port '+port+'!');
});

