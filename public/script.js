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
        socket.emit('clicked1', function(acknowledged) {
            if (acknowledged) {
                window.location.href = 'https://www.kateladenheim.com/commit-yes';
            }
        });
    });

    // Emit click event for button 2
    $('#btn_click2').click(function() {
        socket.emit('clicked2', function(acknowledged) {
            if (acknowledged) {
                window.location.href = 'https://www.kateladenheim.com/commit-no';
            }
        });
    });

//     window.addEventListener("beforeunload", function (e) {
//         var xhr = new XMLHttpRequest();
//         xhr.open('GET', '/handle-reload', true);
//         xhr.send();
//     });

//     document.addEventListener("visibilitychange", function() {
//     console.log("Visibility state changed to: " + (document.hidden ? "hidden" : "visible"));
//     if (!document.hidden) {
//         // Send message to Unity game object to reconnect
//         gameInstance.SendMessage("YourGameObjectName", "HandlePageVisibility");
//     }
// });

});