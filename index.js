//var openBCIBoard = ;
var board = require('./OpenBCIBoard');

var serialPortName = "/dev/tty.usbserial-DN0095GD";

var bciBoard = new board.OpenBCIBoard(serialPortName);

setTimeout(function() {
    bciBoard.boardConnect().then(function(boardSerial) {
        return bciBoard.streamStart(boardSerial);
    }).then(function(sample) {
        console.log('Sample: ' + JSON.stringify(sample));
    }).catch(function(err) {
        console.log(err);
    });
},1000);

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    bciBoard.boardDisconnect().then(function(success){
        console.log('Serial port closed in the nic of time!');
        process.exit();
    }, function(error) {
        console.log('No serial port to close...');
        process.exit();
    });
});
