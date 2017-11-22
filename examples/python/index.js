'use strict';
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
const portPub = 'tcp://127.0.0.1:3004';
const zmq = require('zeromq');
const socket = zmq.socket('pair');
const debug = false; // Pretty print any bytes in and out... it's amazing...
const verbose = true; // Adds verbosity to functions

const kWirelessProtocolBluetooth = 'bluetooth'; // The dongle
const kWirelessProtocolWifi = 'wifi';

const curWirelessProtocol = kWirelessProtocolBluetooth;

let cytonSerial, cytonWifi;
if (curWirelessProtocol === kWirelessProtocolBluetooth) {
  const Cyton = require('openbci-cyton');
  const simulate = false; // Sends synthetic data
  cytonSerial = new Cyton({
    simulate: simulate, // Uncomment to see how it works with simulator!
    simulatorFirmwareVersion: 'v2',
    debug: debug,
    verbose: verbose
  });

  let timeSyncPossible = false;

  let resyncPeriodMin = 1;
  let secondsInMinute = 60;
  let resyncPeriod = cytonSerial.sampleRate() * resyncPeriodMin * secondsInMinute;

  cytonSerial.autoFindOpenBCIBoard().then(portName => {
    if (portName) {
      /**
       * Connect to the board with portName
       * i.e. ourBoard.connect(portName).....
       */
      // Call to connect
      cytonSerial.connect(portName)
        .then(() => {
          cytonSerial.once('ready', () => {
            // Find out if you can even time sync, you must be using v2 and this is only accurate after a `.softReset()` call which is called internally on `.connect()`. We parse the `.softReset()` response for the presence of firmware version 2 properties.
            timeSyncPossible = cytonSerial.usingAtLeastVersionTwoFirmware();

            cytonSerial.streamStart()
              .catch(err => {
                console.log(`stream start: ${err}`);
              });
          });
        })
        .catch(err => {
          console.log(`connect: ${err}`);
          process.exit(0);
        });
    } else {
      /** Unable to auto find OpenBCI board */
      console.log('Unable to auto find OpenBCI board');
      process.exit(0);
    }
  });

  const sampleFunc = sample => {
    if (timeSyncPossible) {
      if (sample._count % resyncPeriod === 0) {
        cytonSerial.syncClocksFull()
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
    } else {
      sendToPython({
        action: 'process',
        command: 'sample',
        message: sample
      });
    }
  };

  // Subscribe to your functions
  cytonSerial.on('sample', sampleFunc);
} else if (curWirelessProtocol === kWirelessProtocolWifi) {
  const protocol = 'tcp'; // or 'udp'

  let Wifi = require('openbci-wifi');
  cytonWifi = new Wifi({
    debug: debug,
    verbose: verbose,
    sendCounts: false,
    latency: 16667,
    protocol: protocol,
    burst: true
  });

  const sampleFunc = (sample) => {
    sendToPython({
      action: 'process',
      command: 'sample',
      message: sample
    });
  };

  cytonWifi.on('sample', sampleFunc);

  cytonWifi.searchToStream({
      streamStart: true,
      sampleRate: 1000
    })
    .catch((err) => {
      console.log(err);
      process.exit(0);
    });
} else {
  console.error(Error(`Selected wifi network ${curWirelessProtocol} is not support yet`));
}

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
const sendToPython = (interProcessObject, verbose) => {
  if (verbose) {
    console.log(`<- out ${JSON.stringify(interProcessObject)}`);
  }
  if (socket) {
    socket.send(JSON.stringify(interProcessObject));
  }
};

const receiveFromPython = (rawData) => {
  try {
    let body = JSON.parse(rawData); // five because `resp `
    processInterfaceObject(body);
  } catch (err) {
    console.log('in -> ' + 'bad json');
  }
};

socket.on('message', receiveFromPython);

const sendStatus = () => {
  sendToPython({'action': 'active', 'message': 'ready', 'command': 'status'}, true);
};

sendStatus();

/**
 * Process an incoming message
 * @param  {String} body   A stringify JSON object that shall be parsed.
 * @return {None}
 */
const processInterfaceObject = (body) => {
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
const processStatus = (body) => {
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
    if (curWirelessProtocol === kWirelessProtocolBluetooth) {
      if (cytonSerial) {
        cytonSerial.removeAllListeners('sample');
      }
    } else if (curWirelessProtocol === kWirelessProtocolWifi) {
      if (cytonWifi) {
        if (cytonWifi.isConnected()) cytonWifi.disconnect().catch(console.log);
        cytonWifi.removeAllListeners('sample');
        cytonWifi.destroy();
      }
    }
  }
  if (err) console.log(err.stack);
  if (options.exit) {
    if (verbose) console.log('exit');
    if (curWirelessProtocol === kWirelessProtocolBluetooth) {
      cytonSerial.disconnect()
        .then(() => {
          process.exit(0);
        })
        .catch((err) => {
          console.log(err);
          process.exit(0);
        });
    } else if (curWirelessProtocol === kWirelessProtocolWifi) {
      if (cytonWifi.isStreaming()) {
        let timmy = setTimeout(() => {
          console.log("timeout");
          process.exit(0);
        }, 1000);
        cytonWifi.streamStop()
          .then(() => {
            console.log('stream stopped');
            if (timmy) clearTimeout(timmy);
            process.exit(0);
          }).catch((err) => {
          console.log(err);
          process.exit(0);
        });
      } else {
        process.exit(0);
      }
    }
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
