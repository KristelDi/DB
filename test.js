var XMLHttpRequest = require('xhr2');
var xhr = new XMLHttpRequest();

port = 3062;

// для таблицы Users
user_link = 'http://localhost:' + port +'/db/api/user/create/';
forum_link = 'http://localhost:' + port +'/db/api/forum/create/';
thread_link = 'http://localhost:' + port +'/db/api/thread/create/';
post_link = 'http://localhost:' + port +'/db/api/post/create/';


// создать пользователей

// var i;
// for (i = 0; i < 6; i++) {
// 	send_test(
// 		user_link, 
// 		JSON.stringify({
// 			"username": "user"+i, 
// 			"about": "hello im user"+i, 
// 			"name": "John", 
// 			"email": "user"+i+"@mail.ru" 
// 		})
// 	);
// }


// var i;
// for (i = 1; i < 6; i++) {
// 	send_test(
// 		forum_link, 
// 		JSON.stringify({
// 			"name": "NameForum"+i, 
// 			"short_name": "forum"+i, 
// 			"user": "user"+i+"@mail.ru"
// 		})
// 	);
// }



// var i;
// for (i = 0; i < 5; i++) {
// 	send_test(
// 		thread_link, 
// 		JSON.stringify({
// 			"user": "user"+i+"@mail.ru", 
// 			"forum": "forum"+i, 
// 			"title": "Thread With Sufficiently Large Title", 
// 			"isClosed": false, 
// 			"date": "2014-01-0"+i+" 00:00:01", 
// 			"message": "hey hey hey hey!", 
// 			"slug": "slug"+i, 
// 			"isDeleted": false 
// 		})
// 	);
// }



// var i;
// for (i = 0; i < 5; i++) {
// 	send_test(
// 		post_link, 
// 		JSON.stringify({
// 			"user": "user"+i+"@mail.ru", 
// 			"thread": i+1, 
// 			"forum": "forum"+i,
// 			"isApproved": true, 
// 			"date": "2014-01-0"+(i+1)+" 00:00:01", 
// 			"message": "my message"+i, 
// 			"isSpam": false, 
// 			"isHighlighted": true, 
// 			"isDeleted": false, 
// 			"isEdited": true
// 		})
// 	);
// }

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



// Silverxcoins