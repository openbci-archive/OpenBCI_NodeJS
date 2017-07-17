/**
 * This is an example of debugging the board. Thanks to Karl @baffo32
 * On windows you should run with PowerShell not git bash.
 * Install
 *   [nodejs](https://nodejs.org/en/)
 *
 * To run:
 *   change directory to this file `cd examples/debug`
 *   do `npm install`
 *   then `npm start`
 */

const stream = true;
const debug = true; // Pretty print any bytes in and out... it's amazing...
const verbose = true; // Adds verbosity to functions
const Cyton = require('openbci').Cyton;
let ourBoard = new Cyton({
  debug: debug,
  verbose: verbose
});

ourBoard.autoFindOpenBCIBoard().then(portName => {
  if (portName) {
    /**
     * Connect to the board with portName
     * Only works if one board is plugged in
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
    /** Unable to auto find OpenBCI board */
    console.log('Unable to auto find OpenBCI board');
  }
});

/**
 * The board is ready to start streaming after the ready function is fired.
 */
var readyFunc = () => {
  // Get the sample rate after 'ready'
  if (stream) {
    ourBoard.streamStart()
      .catch(err => {
        console.log(`stream start: ${err}`);
      });
  }
};

var sampleFunc = sample => {
  /**
   * Checkout the README.md for all other API functions.
   * We support every feature.
   * */
};

// Subscribe to your functions
ourBoard.on('ready', readyFunc);
ourBoard.on('sample', sampleFunc);

function exitHandler (options, err) {
  if (options.cleanup) {
    if (verbose) console.log('clean');
    ourBoard.removeAllListeners();
    /** Do additional clean up here */
  }
  if (err) console.log(err.stack);
  if (options.exit) {
    if (verbose) console.log('exit');
    if (stream) {
      ourBoard.streamStop().catch(console.log);
    }
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
