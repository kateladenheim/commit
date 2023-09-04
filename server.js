var express = require('express');
var app = express();
var http = require('http').Server(app);
var server = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000; // Use the Heroku environment variable for the port, or fallback to a default value (e.g., 3000)

const { Pool } = require('pg');
var osc = require('node-osc');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // This will be set by Heroku once you've provisioned a Postgres add-on
    ssl: {
        rejectUnauthorized: false
    }
});

// Initialize OSC client
var oscClient = new osc.Client('10.225.49.181', 8000);  // The IP and Port of your Unity App listening for OSC messages

var counter1 = 0; // Initial counter value for button 1
var counter2 = 0; // Initial counter value for button 2

pool.query('SELECT button1_count, button2_count FROM click_counts WHERE id = 1', (err, res) => {
    if (err) {
        console.error('Error fetching click counts:', err);
        return;
    }
    
    if (res && res.rows && res.rows.length > 0) {
        counter1 = res.rows[0].button1_count;
        counter2 = res.rows[0].button2_count;
    } else {
        // Insert initial row if it doesn't exist
        pool.query('INSERT INTO click_counts (button1_count, button2_count) VALUES (0, 0)');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

server.on('connection', function(socket) {
    console.log('A user connected');

    // On user connected, send the current click counts
    socket.emit('click_count1', counter1);
    socket.emit('click_count2', counter2);

    // When user clicks button 1
    socket.on('clicked1', function(ack) {
        counter1 += 1; 
        pool.query('UPDATE click_counts SET button1_count = $1 WHERE id = 1', [counter1]); // Update the database
        server.emit('click_count1', counter1);

        // Send an OSC message for button 1
        oscClient.send('/clickCount1', counter1);

        ack(true);  // Acknowledge that the click has been processed
    });

    // When user clicks button 2
    socket.on('clicked2', function(ack) {
        counter2 += 1; // Increment click count for button 2
        pool.query('UPDATE click_counts SET button2_count = $1 WHERE id = 1', [counter2]); // Update the database
        console.log(counter2);
        server.emit('click_count2', counter2);

        // Send an OSC message for button 2
        oscClient.send('/clickCount2', counter2);

        ack(true);
    });
});

// Start the server
http.listen(port, function() {
    console.log('Listening on port: ' + port);
});