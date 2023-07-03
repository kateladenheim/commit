var express = require('express');
var app = express();
var http = require('http').Server(app);
var server = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000; // Use the Heroku environment variable for the port, or fallback to a default value (e.g., 3000)

var counter1 = 0; // Initial counter value for button 1
var counter2 = 0; // Initial counter value for button 2

app.use(express.static(path.join(__dirname, 'public')));

server.on('connection', function(socket) {
    console.log('A user connected');

    // On user connected, send the current click counts
    socket.emit('click_count1', counter1);
    socket.emit('click_count2', counter2);

    // When user clicks button 1
    socket.on('clicked1', function() {
        counter1 += 1; // Increment click count for button 1
        server.emit('click_count1', counter1); // Send new counter value to all users
    });

    // When user clicks button 2
    socket.on('clicked2', function() {
        counter2 += 1; // Increment click count for button 2
        server.emit('click_count2', counter2); // Send new counter value to all users
    });
});

// Start the server
http.listen(port, function() {
    console.log('Listening on port: ' + port);
});