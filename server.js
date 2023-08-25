var express = require('express');
var app = express();
var http = require('http').Server(app);
var server = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000; // Use the Heroku environment variable for the port, or fallback to a default value (e.g., 3000)

var WebSocket = require('websocket').server;
var unitySocket;

var counter1 = 0; // Initial counter value for button 1
var counter2 = 0; // Initial counter value for button 2

app.use(express.static(path.join(__dirname, 'public')));

// Create a WebSocket server
var wsServer = new WebSocket({
    httpServer: http,
    autoAcceptConnections: false
});

wsServer.on('request', function(request) {
    console.log('Unity connected');
    var connection = request.accept(null, request.origin);
    unitySocket = connection;

    connection.on('message', function(message) {
        // Handle any incoming messages from Unity if needed
        console.log('Received message from Unity:', message);
    });

    connection.on('close', function(reasonCode, description) {
        console.log('Unity disconnected');
        unitySocket = null;
    });
});

server.on('connection', function(socket) {
    console.log('A user connected');

    // On user connected, send the current click counts
    socket.emit('click_count1', counter1);
    socket.emit('click_count2', counter2);

    // When user clicks button 1
    socket.on('clicked1', function(ack) {
        counter1 += 1; 
        server.emit('click_count1', counter1);
        if (unitySocket && unitySocket.connected) {
            unitySocket.send(JSON.stringify({ button: 1, count: counter1 }));
        }
        ack(true);  // Acknowledge that the click has been processed
    });

    // When user clicks button 2
    socket.on('clicked2', function(ack) {
        counter2 += 1; // Increment click count for button 2
        server.emit('click_count2', counter2); // Send new counter value to all users
        if (unitySocket && unitySocket.connected) {
            unitySocket.send(JSON.stringify({ button: 2, count: counter2 }));
        }
        ack(true);
    });
});

// Start the server
http.listen(port, function() {
    console.log('Listening on port: ' + port);
});

app.get('/handle-reload', function(req, res) {
    if (unitySocket && unitySocket.connected) {
        unitySocket.close();
        console.log('WebSocket closed due to page reload');
    }
    res.status(200).send('Handled reload');
});
