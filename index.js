var serialport = require('serialport');
var openBCIBoard = require("./openBCIBoard");

var board = {
  baudrate : 115200,
  port: "/dev/ttyUSB0"
};

var ourSerial = new openBCIBoard.createBoard(board);

ourSerial.open(function(err){
  if (err){
    console.log(err);
  } else {
    console.log("open");
    ourSerial.on("data", function(data){
      console.log(data.toString());
    });
    ourSerial.write('b');
  }
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    if (ourSerial){
        ourSerial.close();
    }
    process.exit();
});
