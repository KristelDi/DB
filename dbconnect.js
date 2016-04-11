var express = require('express');
var mysql = require('mysql');
 
var connection = mysql.createConnection(
    {
      host     : 'localhost',
      user     : 'root',
      password : 'vita',
      database : 'forum',
    }
);
 
connection.connect();


module.exports = connection