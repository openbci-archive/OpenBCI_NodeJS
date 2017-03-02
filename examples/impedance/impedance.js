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
var debug = false; // Pretty print any bytes in and out... it's amazing...
var verbose = true; // Adds verbosity to functions

var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
  debug: debug,
  verbose: verbose
});
var k = require('openbci').OpenBCIConstants;

let startedImpedance = false;
let iBuffer = [];
let count = 0;
const window = 50;

ourBoard.autoFindOpenBCIBoard().then(portName => {
  if (portName) {
    /**
     * Connect to the board with portName
     * Only works if one board is plugged in
     * i.e. ourBoard.connect(portName).....
     */
    ourBoard.connect(portName) // Port name is a serial port name, see `.listPorts()`
      .then(() => {
        ourBoard.on('ready', () => {
          ourBoard.streamStart();
          ourBoard.on('sample', (sample) => {
            if (startedImpedance === false) {
              startedImpedance = true;
              k.getImpedanceSetter(1, false, true)
                .then((commands) => {
                  return ourBoard.write(commands);
                })
                .then(() => {
                  console.log('wrote commands to board');
                })
                .catch((err) => {
                  console.log('errr', err);
                });
            }
            /** Work with sample */
            const chan1ValInVolts = sample.channelData[0];

            // const impedance = chan1ValInVolts / k.OBCILeadOffDriveInAmps;

            // console.log(`impedance:\t${impedance} kOhms`);
            iBuffer.push(chan1ValInVolts);
            count++;
            if (count >= window) {
              let max = 0.0; // sumSquared
              for (let i = 0; i < window; i++) {
                if (iBuffer[i] > max) {
                  max = iBuffer[i];
                }
                // sumSquared += iBuffer[i] * iBuffer[i];
              }
              let min = 0.0;
              for (let i = 0; i < window; i++) {
                if (iBuffer[i] < min) {
                  min = iBuffer[i];
                }
                // sumSquared += iBuffer[i] * iBuffer[i];
              }
              const vP2P = max - min; // peak to peak

              console.log(`impedance: \t${vP2P / 2 / k.OBCILeadOffDriveInAmps}`);
              // console.log(`impedance: ${vRms/k.OBCILeadOffDriveInAmps}`);

              // const mean_squared = sumSquared / window;
              // const root_mean_squared = Math.sqrt(mean_squared);
              // console.log(`impedance: ${root_mean_squared/k.OBCILeadOffDriveInAmps}`);

              count = 0;
              iBuffer = [];
            }
            // console.log(`uV:\t${chan1ValInVolts/(10*6)}\nimpedance:\t${impedance}`);
          });
        });
      });
  } else {
    /** Unable to auto find OpenBCI board */
    console.log('Unable to auto find OpenBCI board');
  }
});

function exitHandler (options, err) {
  if (options.cleanup) {
    if (verbose) console.log('clean');
    /** Do additional clean up here */
    ourBoard.disconnect().catch(console.log);
    ourBoard.removeAllListeners();
  }
  if (err) console.log(err.stack);
  if (options.exit) {
    if (verbose) console.log('exit');
    ourBoard.streamStop()
      .then(() => {
        process.exit(0);
      })
      .catch((err) => {
        console.log(err);
        process.exit(0);
      });
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
