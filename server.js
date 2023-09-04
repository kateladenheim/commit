var express = require('express');
var app = express();
var http = require('http').Server(app);
var server = require('socket.io')(http);
var path = require('path');
var port = process.env.PORT || 3000;

const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

var counter1 = 0;
var counter2 = 0;

pool.query('SELECT button1_count, button2_count FROM click_counts WHERE id = 1', (err, res) => {
    if (err) {
        console.error('Error fetching click counts:', err);
        return;
    }
    
    if (res && res.rows && res.rows.length > 0) {
        counter1 = res.rows[0].button1_count;
        counter2 = res.rows[0].button2_count;
    } else {
        pool.query('INSERT INTO click_counts (button1_count, button2_count) VALUES (0, 0)');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to serve the latest data
app.get('/latest-data', (req, res) => {
    res.json({
        button1: counter1,
        button2: counter2
    });
});

server.on('connection', function(socket) {
    console.log('A user connected');
    socket.emit('click_count1', counter1);
    socket.emit('click_count2', counter2);

    socket.on('clicked1', function(ack) {
        counter1 += 1; 
        pool.query('UPDATE click_counts SET button1_count = $1 WHERE id = 1', [counter1]);
        server.emit('click_count1', counter1);
        ack(true);
    });

    socket.on('clicked2', function(ack) {
        counter2 += 1;
        pool.query('UPDATE click_counts SET button2_count = $1 WHERE id = 1', [counter2]);
        server.emit('click_count2', counter2);
        ack(true);
    });
});

http.listen(port, function() {
    console.log('Listening on port: ' + port);
});
