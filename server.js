// :: Simple Chat App Created By : Des Raj :: @ 08/02/2018  //

// implement node modules in our app ... 
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);



var mongo = require('mongodb');
var mongoose = require('mongoose');

//connecting to mongodb
mongoose.connect('mongodb://localhost/chat',function (err,db){
	if(err){throw err;}
	console.log("[|db|] : connected\n---------");
});
var fs = require('fs');

//end of all require modules

var users = []; // users list
var connections = []; // count the socket connections;
var feedback = []; // not used yet ; but for sending feedback or err msgs;;
var nicknames = {}; // all user data in this object;


// socket io connect
io.on('connection',function(socket){
	socket.user = socket;
	//console.log('socket.user %s',socket.user);
connections.push(socket);
console.log('socket id : %s',socket.id);
console.log('connected socket(s) : %s',connections.length + '\n---------\n');


// on socket disconnect
socket.on('disconnect',function(data){

	console.log('a user disconnected');
	//if(!socket.user){return;}
	//users.splice(users.indexOf(socket.user),1);
	delete nicknames[socket.user];
	console.log("socket.user %s",socket.user);
	connections.splice(connections.indexOf(socket.user),1)
	updateuserlist();
	console.log('total user online now :    %s',connections.length)

	
	});
	
	// to update users list
	function updateuserlist() {
		io.sockets.emit('show users',Object.keys(nicknames));
	}

// catch 'chat' event from client side
socket.on('chat',function (message,callback) {
	//socket.user = user;
	var msg = message.trim();
	//console.log('msg is :%s',msg);
	if(msg.substr(0,3) === '/s '){
		msg = msg.substr(3);
		console.log('msg after substr(3):'+msg);
		var ind = msg.indexOf(' ');
		console.log('ind : %s',ind);
		if(ind !== -1){
		var name = msg.substring(0,ind);
		console.log('name : %s',name);
		var msg = msg.substring(ind + 1);
		console.log('msg at last : %s',msg);
		if(name in nicknames){
			nicknames[name].emit('secret',{msg:msg,user:socket.user});
			console.log('in secret the socket user :'+socket.user);
			//console.log(nicknames[name]);
			console.log('secret');	
		}
		else {callback('plz enter a valid user');}
	}
		else {callback('plz enter message');}
		
		}
	else{
	//console.log(message);
	io.sockets.emit('chat',{msg:message,user:socket.user});
 }
});

// catch 'new user ' from client;
socket.on('new user',function (user,callback) {


	if(user in nicknames){
		//return false;
		//res.send("users exists");	
		socket.emit('feedback','User Exists Try Another Name');
		
	}else{ 
		
		
		socket.user = user;

	socket.emit('new user',user);
	nicknames[socket.user] = socket;
	console.log('the value from sockets : %s ',nicknames[socket.user].user);
	console.log("online users are : %s",Object.keys(nicknames));
	updateuserlist();}
	//io.sockets.emit('show users',users);}
	
});



});




// set route ::express::

app.get('/',function(req,res){

    res.sendFile(__dirname+'/index.html');

})

// listen the server on specified port e.g. 4000 

server.listen(process.env.PORT || 4000 ,function(err,data){
    if(err){throw err}
    console.log('||| @ 4000');
})