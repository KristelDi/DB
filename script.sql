use forum_db;
DROP TABLE IF EXISTS Forums;
CREATE TABLE Forum (
    id INT AUTO_INCREMENT  NOT NULL PRIMARY KEY,
    name VARCHAR(40) UNIQUE KEY,
    short_name VARCHAR(40) UNIQUE KEY,
    user VARCHAR (40)
) DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS Posts;
CREATE TABLE  Posts (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    user_id INT NOT NULL,
    message TEXT NOT NULL,
    forum_id INT NOT NULL,
    thread_id INT NOT NULL,
    parent INT NULL DEFAULT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    likes INT NOT NULL DEFAULT 0,
    dislikes INT NOT NULL DEFAULT 0,
    isApproved BOOLEAN NOT NULL DEFAULT 0,
    isHighlighted BOOLEAN NOT NULL DEFAULT 0,
    isEdited BOOLEAN NOT NULL DEFAULT 0,
    isSpam BOOLEAN NOT NULL DEFAULT 0,
    isDeleted BOOLEAN NOT NULL DEFAULT 0
) DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS Users;
CREATE TABLE Users (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    username VARCHAR(50),
    about TEXT,
    name VARCHAR(50),
    isAnonymous BOOLEAN NOT NULL DEFAULT 0,
    UNIQUE KEY(email)
) DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS Threads;
CREATE TABLE Threads (
	id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    forum_id INT NOT NULL,
    user_id INT NOT NULL,
    title VARCHAR(50) NOT NULL,
    slug VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    likes INT NOT NULL DEFAULT 0,
    dislikes INT NOT NULL DEFAULT 0,
    isClosed BOOLEAN NOT NULL DEFAULT 0,
    isDeleted BOOLEAN NOT NULL DEFAULT 0
) DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS Followers;
CREATE TABLE Followers (
	follower_id INT NOT NULL,
    followee_id INT NOT NULL,
    UNIQUE (followee_id, follower_id)
) DEFAULT CHARSET=utf8;


DROP TABLE IF EXISTS Subscriptions;
CREATE TABLE Subscriptions (
	user_id INT NOT NULL,
    thread_id INT NOT NULL
) DEFAULT CHARSET=utf8;


INSERT INTO Users (email, username, name) VALUES 
	('1@mail.ru', 'login1', 'name1'), 
	('2@mail.ru', 'login2', 'name2'), 
	('3@mail.ru', 'login3', 'name3'), 
	('4@mail.ru', 'login4', 'name4'),
	('5@mail.ru', 'login5', 'name5');



INSERT INTO Users (email, username, about) VALUES ('user1@mail.ru', 'user1', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user2@mail.ru', 'user2', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user3@mail.ru', 'user3', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user4@mail.ru', 'user4', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user5@mail.ru', 'user5', 'about'); 


INSERT INTO Users (email, username, about) VALUES ('user1@mail.ru', 'user1', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user2@mail.ru', 'user2', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user3@mail.ru', 'user3', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user4@mail.ru', 'user4', 'about'); 
INSERT INTO Users (email, username, about) VALUES ('user5@mail.ru', 'user5', 'about'); 
