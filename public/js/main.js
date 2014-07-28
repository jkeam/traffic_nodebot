$(document).ready(function() {
  var socket = io.connect('http://localhost:3000');
  socket.on('results', function (data) {
    $("#results").html('');
    $('#error').html('');
    if (data instanceof Array) {
      for (var i=0; i< data.length; i++) {
        $("#results").append("<li>" + data + "</li>");
      }
    } else {
      $('#results').html(data);
    }
  });
  socket.on('error', function(data) {
    $("#results").html('');
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
