/**
* This is an example of time syncing every second for one minute. Used with a
*  real board.
* To run:
*   change directory to this file `cd examples/timeSync`
*   do `npm install`
*   then `npm start`
*/

var OpenBCIBoard = require('openbci').OpenBCIBoard;

var ourBoard = new OpenBCIBoard({});

const resyncPeriodMin = 5; // re sync every five minutes
const secondsInMinute = 60;
var sampleRate = 250; // Default to 250, ALWAYS verify with a call to `.sampleRate()` after 'ready' event!
var timeSyncPossible = false;

ourBoard.autoFindOpenBCIBoard().then(portName => {
    if(portName) {
        /**
        * Connect to the board with portName
        * i.e. ourBoard.connect(portName).....
        */
        // Call to connect
        ourBoard.connect(portName).then(() => {
            console.log(`connected`);

        })
        .catch(err => {
            console.log(`connect: ${err}`);
        });
    } else {
        /**Unable to auto find OpenBCI board*/
    }
});

var readyFunc = () => {
    // Get the sample rate after 'ready'
    sampleRate = ourBoard.sampleRate();
    // Find out if you can even time sync, you must be using v2 and this is only accurate after a `.softReset()` call which is called internally on `.connect()`. We parse the `.softReset()` response for the presence of firmware version 2 properties.
    timeSyncPossible = ourBoard.usingVersionTwoFirmware();

    if (timeSyncPossible) {
        ourBoard.streamStart()
        .catch(err => {
            console.log(`stream start: ${err}`);
        });
    } else {
        killFunc();
    }

}

var killFunc = () => {
    ourBoard.disconnect()
    .then(() => {
        process.kill();
    });
}

var sampleFunc = sample => {
    // Resynchronize every every second
    if (sample._count % (sampleRate * 1) === 0) {
        ourBoard.syncClocksFull()
            .then(syncObj => {
                // Sync was successful
                if (syncObj.valid) {
                    // Log the object to check it out!
                    console.log(`timeOffset`,syncObj.timeOffsetMaster);
                } else {
                    // Retry it
                    console.log(`Was not able to sync... retry!`);
                }
            });
    }

    if (sample.timeStamp) { // true after the first successful sync
        if (sample.timeStamp < 10 * 60 * 60 * 1000) { // Less than 10 hours
            console.log(`Bad time sync ${sample.timeStamp}`);
        }
    }

    // Stop after one minute
    if (sample._count > sampleRate * 60) {
        killFunc();
    }

}

// Subscribe to your functions
ourBoard.on('ready',readyFunc);
ourBoard.on('sample',sampleFunc);
