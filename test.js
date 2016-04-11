var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();

port = 3060;

// для таблицы Users
user_link = 'http://localhost:' + port +'/db/api/user/create/';
forum_link = 'http://localhost:' + port +'/db/api/forum/create/';
thread_link = 'http://localhost:' + port +'/db/api/thread/create/';
post_link = 'http://localhost:' + port +'/db/api/post/create/';


// send_test(
// 	user_link, 
// 	JSON.stringify({
// 		"username": "user3", 
// 		"about": "hello im user1", 
// 		"name": "John", 
// 		"email": "user3@mail.ru" 
// 	})
// );

// send_test(
// 	user_link, 
// 	JSON.stringify({
// 		"username": "user4", 
// 		"about": "hello im user1", 
// 		"name": "John", 
// 		"email": "user4@mail.ru" 
// 	})
// );

// send_test(
// 	user_link, 
// 	JSON.stringify({
// 		"username": "user5", 
// 		"about": "hello im user1", 
// 		"name": "John", 
// 		"email": "user5@mail.ru" 
// 	})
// );

// send_test(
// 	user_link, 
// 	JSON.stringify({
// 		"username": "user6", 
// 		"about": "hello im user1", 
// 		"name": "John", 
// 		"email": "user6@mail.ru" 
// 	})
// );


// send_test(
// 	thread_link, 
// 	JSON.stringify({
// 		"user": "user1@mail.ru", 
// 		"forum": "forum1", 
// 		"title": "Thread With Sufficiently Large Title", 
// 		"isClosed": true, 
// 		"date": "2014-01-01 00:00:01", 
// 		"message": "hey hey hey hey!", 
// 		"slug": "Threadwithsufficientlylargetitle", 
// 		"isDeleted": false 
// 	})
// );

send_test(
	post_link, 
	JSON.stringify({
		"user": "user1@mail.ru", 
		"thread": 4, 
		"forum": "forum1",
		"isApproved": true, 
		"date": "2014-01-01 00:00:01", 
		"message": "my message 1", 
		"isSpam": false, 
		"isHighlighted": true, 
		"isDeleted": false, 
		"isEdited": true
	})
);

// send_test(
// 	forum_link, 
// 	JSON.stringify({
// 		"name": "Forum With Sufficiently Large Name", 
// 		"short_name": "forumwithsufficientlylargename", 
// 		"user": "user1@mail.ru"
// 	})
// );

// для таблицы Forums





function send_test(link, data) {
	xhr.open('POST', link, true); 
	xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
	xhr.send(data);
}

