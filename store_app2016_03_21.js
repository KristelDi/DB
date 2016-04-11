var express = require('express');
var app = express();
// var module_user = require('./user.js');
// var bodyParser = require('body-parser');
// var router = express.Router();

// app.use(bodyParser.json());
// app.use('/api/db', require('./router'))


app.listen(3306, function() {
  console.log('Listening on port 3306...')
})


// var env = app.get('env') == 'development' ? 'dev' : app.get('env');
// var port = process.env.PORT || 3306;
// var mysql      = require('mysql');
// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'vita',
//   database : 'forum'
// });

// connection.connect(function(err){
//   if(err){
//     console.log('Error connecting to Db');
//     return;
//   }
//   console.log('Connection established');
// });



app.get('/', function (req, res) {
	res.send('Hello World!');
});

 

// ======================================   FOR USER


// router.get('/create', function(req, res) {
//   res.send('Cow, Horse, Sheep')
// })

// app.route('/user')
//   .get(function(req, res) {
//   	var data = module_user.get_user(connection);
// 	res.json(data);
//   })
//   .post(function(req, res) {
//   	data = {};
//   	data = module_user.create_user(connection, req.body);
//     res.json(data);
//   })
//   .put(function(req, res) {

//     res.json(data);
//   });





// // ======================================   FOR FORUM

// app.route('/forum')
//   .get(function(req, res) {
//   	var data = module_user.get_user(connection);
// 	res.json(data);
//   })
//   .post(function(req, res) {
// 	console.log(req.body);  
//     res.json(req.body.code);
//   })
//   .put(function(req, res) {
//   	var data = module_user.create_user(connection, req);
//     res.json(data);
//   });



  // connection.end();