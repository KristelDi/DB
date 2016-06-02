var express = require('express');
var mysql = require('mysql');
 
var pool = mysql.createPool({
			connectionLimit : 250,
			connectTimeout: 3000,
			host: 'localhost',
     		user: 'root',
        	password: 'vita',
        	database: 'forum'
	});

module.exports.pool = pool;

