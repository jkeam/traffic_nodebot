$(document).ready(function() {
  var socket = io.connect('http://localhost:3000');
  socket.on('results', function (data) {
    $('#error').html('');
    $("#results").append("<li>" + data + "</li>");
  });
  socket.on('error', function(data) {
    $('#error').html(data);
  });

  $('#submit').click(function(e) {
    e.preventDefault();
    socket.emit('traffic_request',
      {
        address: $("input[name='address']").val(),
        radius: $("input[name='radius']").val(),
      }
    );
    return false;
  });
});
