/**
 * This is an example from the readme.md
 * On windows you should run with PowerShell not git bash.
 * Install
 *   [nodejs](https://nodejs.org/en/)
 *
 * To run:
 *   change directory to this file `cd examples/debug`
 *   do `npm install`
 *   then `npm start`
 */
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var portPub = 'tcp://127.0.0.1:3004';
var zmq = require('zmq-prebuilt');
var socket = zmq.socket('pair');
var simulate = false; // Sends synthetic data
var debug = false; // Pretty print any bytes in and out... it's amazing...
var verbose = true; // Adds verbosity to functions

var ourBoard = new OpenBCIBoard({
  simulate: simulate, // Uncomment to see how it works with simulator!
  simulatorFirmwareVersion: 'v2',
  debug: debug,
  verbose: verbose
});

var timeSyncPossible = false;
var resyncPeriodMin = 1;
var secondsInMinute = 60;
var resyncPeriod = ourBoard.sampleRate() * resyncPeriodMin * secondsInMinute;

ourBoard.autoFindOpenBCIBoard().then(portName => {
  if (portName) {
    /**
     * Connect to the board with portName
     * i.e. ourBoard.connect(portName).....
     */
    // Call to connect
    ourBoard.connect(portName)
      .then(() => {
        ourBoard.on('ready', () => {
          // Find out if you can even time sync, you must be using v2 and this is only accurate after a `.softReset()` call which is called internally on `.connect()`. We parse the `.softReset()` response for the presence of firmware version 2 properties.
          timeSyncPossible = ourBoard.usingVersionTwoFirmware();

          if (timeSyncPossible) {
            ourBoard.streamStart()
              .catch(err => {
                console.log(`stream start: ${err}`);
              });
          } else {
            console.log('not able to time sync');
          }
        });
      })
      .catch(err => {
        console.log(`connect: ${err}`);
      });
  } else {
    /** Unable to auto find OpenBCI board */
    console.log('Unable to auto find OpenBCI board');
  }
});

var sampleFunc = sample => {
  if (sample._count % resyncPeriod === 0) {
    ourBoard.syncClocksFull()
      .then(syncObj => {
        // Sync was successful
        if (syncObj.valid) {
          // Log the object to check it out!
          console.log(`timeOffset`, syncObj.timeOffsetMaster);
        } else {
          // Retry it
          console.log(`Was not able to sync... retry!`);
        }
      });
  }

  if (sample.timeStamp) { // true after the first successful sync
    if (sample.timeStamp < 10 * 60 * 60 * 1000) { // Less than 10 hours
      console.log(`Bad time sync ${sample.timeStamp}`);
    } else {
      sendToPython({
        action: 'process',
        command: 'sample',
        message: sample
      });
    }
  }
};

// Subscribe to your functions
ourBoard.on('sample', sampleFunc);

// ZMQ fun

socket.bind(portPub, function (err) {
  if (err) throw err;
  console.log(`bound to ${portPub}`);
});

/**
 * Used to send a message to the Python process.
 * @param  {Object} interProcessObject The standard inter-process object.
 * @return {None}
 */
var sendToPython = (interProcessObject, verbose) => {
  if (verbose) {
    console.log(`<- out ${JSON.stringify(interProcessObject)}`);
  }
  if (socket) {
    socket.send(JSON.stringify(interProcessObject));
  }
};

var receiveFromPython = (rawData) => {
  try {
    let body = JSON.parse(rawData); // five because `resp `
    processInterfaceObject(body);
  } catch (err) {
    console.log('in -> ' + 'bad json');
  }
};

socket.on('message', receiveFromPython);

var sendStatus = () => {
  sendToPython({'action': 'active', 'message': 'ready', 'command': 'status'}, true);
};

sendStatus();

/**
 * Process an incoming message
 * @param  {String} body   A stringify JSON object that shall be parsed.
 * @return {None}
 */
var processInterfaceObject = (body) => {
  switch (body.command) {
    case 'status':
      processStatus(body);
      break;
    default:
      unrecognizedCommand(body);
      break;
  }
};

/**
 * Used to process a status related command from TCP IPC.
 * @param  {Object} body
 * @return {None}
 */
var processStatus = (body) => {
  switch (body.action) {
    case 'started':
      console.log(`python started @ ${body.message}ms`);
      break;
    case 'alive':
      console.log(`python duplex communication test completed @ ${body.message}ms`);
      break;
    default:
      unrecognizedCommand(body);
      break;
  }
};

function unrecognizedCommand (body) {
  console.log(`unrecognizedCommand ${body}`);
}

function exitHandler (options, err) {
  if (options.cleanup) {
    if (verbose) console.log('clean');
    /** Do additional clean up here */
  }
  if (err) console.log(err.stack);
  if (options.exit) {
    if (verbose) console.log('exit');
    ourBoard.disconnect().catch(console.log);
  }
}

if (process.platform === 'win32') {
  const rl = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  rl.on('SIGINT', function () {
    process.emit('SIGINT');
  });
}

// do something when app is closing
process.on('exit', exitHandler.bind(null, {
  cleanup: true
}));

// catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null, {
  exit: true
}));

// catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null, {
  exit: true
}));
