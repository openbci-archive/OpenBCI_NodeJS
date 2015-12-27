var OpenBCISample = require('./OpenBCISample');
var OpenBCIBoard = require('./OpenBCIBoard');

var ourBoard = new OpenBCIBoard.OpenBCIBoard();

ourBoard.autoFindOpenBCIBoard(function(portName,ports) {
    if(portName) {
        ourBoard.boardConnect(portName).then(function(boardSerial) {
            console.log('board connected');
            ourBoard.on('ready',function() {
                console.log('Ready to start streaming!');
                ourBoard.streamStart();
                ourBoard.on('sample',function(sample) {
                    OpenBCISample.debugPrettyPrint(sample);
                });
            });
        }).catch(function(err) {
            console.log('Error [setup]: ' + err);
        });

    } else {
        /** Display list of ports*/
        console.log('Port not found... check ports for other ports');
    }
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    ourBoard.debugSession();
    ourBoard.boardDisconnect().then(function(success){
        console.log('Serial port closed in the nic of time!');
        process.exit();
    }, function(error) {
        console.log('No serial port to close...');
        process.exit();
    });
});


