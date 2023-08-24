$(function () {

    var socket = io(); // connect to the socket

    socket.on('connect', function() {
        console.log('Yeah, I am connected!!');
    });

    // Listen from server.js for click counts 1
    socket.on('click_count1', function(value) {
        $('#counter1').html(value); // Set new count value
    });

    // Listen from server.js for click counts 2
    socket.on('click_count2', function(value) {
        $('#counter2').html(value); // Set new count value
    });

    // Emit click event for button 1
$('#btn_click1').click(function() {
    socket.emit('clicked1'); 
    // setTimeout(function() {
    //     window.location.href = 'https://www.kateladenheim.com/commit-yes';
    // }, 1000);  // Delaying the redirection by 1 second
});

    // Emit click event for button 2
    $('#btn_click2').click(function() {
    socket.emit('clicked2');
    // setTimeout(function() {
    //     window.location.href = 'https://www.kateladenheim.com/commit-no';
    // }, 1000);  // Delaying the redirection by 1 second
});

});
