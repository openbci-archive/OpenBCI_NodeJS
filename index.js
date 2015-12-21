//var openBCIBoard = ;
var board = require('./OpenBCIBoard');

var bciBoard = new board.OpenBCIBoard();

bciBoard.autoFindOpenBCIBoard(function(portName) {
    if(portName) {
        bciBoard.boardConnect(portName).then(function(boardSerial) {
            console.log('Connected...');
            

        }).catch(function(err) {
            console.log('Error [setup]: ' + err);
        });


        //bciBoard.boardConnect(portName).then(function(boardSerial) {
        //        console.log('Waiting for 1 second before sending start stream command!');
        //        setTimeout(function(){
        //            console.log("Starting stream");
        //            return bciBoard.streamStart().then(function(sample) {
        //                console.log('Sample: ' + JSON.stringify(sample));
        //            });
        //        },1000);
        //    })
        //    .catch( function(err) {
        //        console.log('Error [Outside]: ' + err);
        //    });
    } else {
        /** Display list of ports*/

    }
});





//bciBoard.autoFindOpenBCIBoard()
//    .then(function(portName) {
//        return new Promise(function (resolve, reject) {
//            if (portName) {
//                resolve(portName);
//            } else {
//                //reject('Unable to find device to connect to...');
//            }
//        });
//    })
//    .then(bciBoard.boardConnect).then(function() {
//        console.log('Waiting for 1 second before sending start stream command!');
//        setTimeout(function(){
//            console.log("Starting stream");
//            return bciBoard.streamStart().then(function(sample) {
//                console.log('Sample: ' + JSON.stringify(sample));
//            });
//        },1000);
//    })
//    .catch( function(err) {
//        console.log('Error [Outside]: ' + err);
//});

//setTimeout(function() {
//    bciBoard.boardConnect().then(function(boardSerial) {
//        console.log('Trying to start stream with ' + JSON.stringify(boardSerial));
//        return bciBoard.streamStart(boardSerial);
//    }).then(function(sample) {
//        console.log('Sample: ' + JSON.stringify(sample));
//    }).catch(function(err) {
//        console.log('Error: ' + err);
//    });
//},3000);

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
