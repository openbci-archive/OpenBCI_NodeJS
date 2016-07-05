[![Stories in Ready](https://badge.waffle.io/OpenBCI/openbci-js-sdk.png?label=ready&title=Ready)](https://waffle.io/OpenBCI/openbci-js-sdk)
[![Join the chat at https://gitter.im/OpenBCI/openbci-js-sdk](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OpenBCI/openbci-js-sdk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/OpenBCI/openbci-js-sdk.svg?branch=master)](https://travis-ci.org/OpenBCI/openbci-js-sdk)
[![codecov.io](https://codecov.io/github/OpenBCI/openbci-js-sdk/coverage.svg?branch=master)](https://codecov.io/github/OpenBCI/openbci-js-sdk?branch=master)

# OpenBCI Node.js SDK

A Node.js module for OpenBCI ~ written with love by [Push The World!](http://www.pushtheworldllc.com)

We are proud to support all functionality of the OpenBCI 8 Channel board (16 channel coming soon) and are actively developing and maintaining this module. 

The purpose of this module is to **get connected** and **start streaming** as fast as possible. 

## TL;DR

#### Install via npm:

```
npm install openbci
```

#### Get connected and start streaming

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName)
    .then(function() {
        ourBoard.on('ready',function() {
            ourBoard.streamStart();
            ourBoard.on('sample',function(sample) {
                /** Work with sample */
                for (var i = 0; i < ourBoard.numberOfChannels(); i++) {
                    console.log("Channel " + (i + 1) + ": " + sample.channelData[i].toFixed(8) + " Volts."); 
                    // prints to the console
                    //  "Channel 1: 0.00001987 Volts."
                    //  "Channel 2: 0.00002255 Volts."
                    //  ...
                    //  "Channel 8: -0.00001875 Volts."
                }
            });
        });
})
```

Want to know if the module really works? Check out some projects and organizations using it:

* [_OpenEXP_](https://github.com/openexp/OpenEXP): an open-source desktop app for running experiments and collecting behavioral and physiological data.
* [_Thinker_](http://www.pushtheworldllc.com/#!thinker/uc1fn): a project building the world's first brainwave-word database.
* [_NeuroJS_](https://github.com/NeuroJS): a community dedicated to Neuroscience research using JavaScript, they have several great examples.

Still not satisfied it works?? Check out this [detailed report](http://s132342840.onlinehome.us/pushtheworld/files/voltageVerificationTestPlanAndResults.pdf) that scientifically validates the output voltages of this module.

How are you still doubting and not using this already? Fine, go look at some of the [400 **_automatic_** tests](https://codecov.io/github/OpenBCI/openbci-js-sdk?branch=master) written for it!

## General Overview

Initialization
--------------

Initializing the board:

```js
var OpenBCIBoard = require('openbci-sdk');
var ourBoard = new OpenBCIBoard.OpenBCIBoard();
```

For initializing with options, such as verbose print outs:

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    verbose: true
});
```

Or if you don't have a board and want to use synthetic data:

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    simulate: true
});
```

Another useful way to start the simulator:
```js
var openBCIBoard = require('openbci-sdk');
var k = openBCIBoard.OpenBCIConstants;
var ourBoard = openBCIBoard.OpenBCIBoard();
ourBoard.connect(k.OBCISimulatorPortName) // This will set `simulate` to true
    .then(function(boardSerial) {
        ourBoard.on('ready',function() {
            /** Start streaming, reading registers, what ever your heart desires  */
        });
    }).catch(function(err) {
        /** Handle connection errors */
    });
```


'ready' event
------------

You MUST wait for the 'ready' event to be emitted before streaming/talking with the board. The ready happens asynchronously 
so installing the 'sample' listener and writing before the ready event might result in... nothing at all.

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.on('ready',function() {
        /** Start streaming, reading registers, what ever your heart desires  */
    });
}).catch(function(err) {
    /** Handle connection errors */
});            
```

Sample properties:
------------------
* `startByte` (`Number` should be `0xA0`)
* `sampleNumber` (a `Number` between 0-255) 
* `channelData` (channel data indexed at 0 filled with floating point `Numbers` in Volts)
* `accelData` (`Array` with X, Y, Z accelerometer values when new data available)
* `auxData` (`Buffer` filled with either 2 bytes (if time synced) or 6 bytes (not time synced))
* `stopByte` (`Number` should be `0xCx` where x is 0-15 in hex)
* `boardTime` (`Number` the raw board time)
* `timeStamp` (`Number` the `boardTime` plus the NTP calculated offset)

The power of this module is in using the sample emitter, to be provided with samples to do with as you wish.

You can also start the simulator by sending `.connect(portName)` with `portName` equal to `'OpenBCISimulator'`.

To get a 'sample' event, you need to:
-------------------------------------
1. Call `.connect(serialPortName)`
2. Install the 'ready' event emitter on resolved promise
3. In callback for 'ready' emitter, call `streamStart()`
4. Install the 'sample' event emitter
```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function() {
    ourBoard.on('ready',function() {
        ourBoard.streamStart();
        ourBoard.on('sample',function(sample) {
            /** Work with sample */
        });
    });
}).catch(function(err) {
    /** Handle connection errors */
});            
```
Close the connection with `.streamStop()` and disconnect with `.disconnect()`
```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.streamStop().then(ourBoard.disconnect());
```

Auto-finding boards
-------------------
You must have the OpenBCI board connected to the PC before trying to automatically find it.

If a port is not automatically found, then call `.listPorts()` to get a list of all serial ports this would be a good place to present a drop down picker list to the user, so they may manually select the serial port name.

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.autoFindOpenBCIBoard().then(portName => {
    if(portName) {
        /** 
        * Connect to the board with portName
        * i.e. ourBoard.connect(portName).....
        */
    } else {
        /**Unable to auto find OpenBCI board*/
    }
});
```

Note: `.autoFindOpenBCIBoard()` will return the name of the Simulator if you instantiate with option `simulate: true`.

Auto Test - (Using impedance to determine signal quality)
---------------------------------------------------------
Measuring impedance is a vital tool in ensuring great data is collected. 

**_IMPORTANT!_** Measuring impedance takes time, so *only test what you must*

Your OpenBCI board will have electrodes hooked up to either a P input, N input or in some cases both inputs. 

To test specific inputs of channels:

1. Connect to board.
2. Start streaming.
3. Install the 'impedanceArray' emitter
4. Call `.impedanceTestChannels()` with your configuration array

A configuration array looks like, for an 8 channel board, `['-','N','n','p','P','-','b','b']`

Where there are the same number of elements as channels and each element can be either:

* `p` or `P` (only test P input)
* `n` or `N` (only test N input)
* `b` or `B` (test both inputs) (takes 66% longer to run then previous two `p` or `n`)
* `-` (ignore channel)

Without further ado, here is an example:
```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.on('ready',function() {
        ourBoard.streamStart();
        ourBoard.once('impedanceArray', impedanceArray => {
            /** Work with impedance Array */
        });
        ourBoard.impedanceTestChannels(['n','N','n','p','P','p','b','B']).catch(err => console.log(err));
    });
}).catch(function(err) {
    /** Handle connection errors */
}); 
```

But wait! What is this `impedanceArray`? An Array of Objects, for each object:
```js
[{
    channel: 1,
    P: {
        raw: -1, 
        text: 'init'
    },
    N: {
        raw: -1, 
        text: 'init'
    }
},
{
    // Continues for each channel up to the amount of channels on board (8 or 16)
},...];
```

Where:

* *channel* is the channel number (`impedanceArray[0]` is channel 1, `impedanceArray[6]` is channel 7)
* *P* is the P input data (Note: P is capitalized)
  * *raw* is an impedance value resulting from the Goertzel algorithm.
  * *text* is a text interpretation of the `average`
    * **Good** impedance is < 5k Ohms
    * **Ok** impedance is 5 to 10k Ohms
    * **Bad** impedance is > 10k Ohms
    * **None** impedance is > 1M Ohms
* *N* is the N input data (Note: N is capitalized) (see above for what N object consists of)

To run an impedance test on all inputs, one channel at a time:

1. Connect to board
2. Start streaming
3. Install the 'impedanceObject'
4. Call `.impedanceTestAllChannels()`

**Note: Takes up to 5 seconds to start measuring impedances. There is an unknown number of samples taken. Not always 60!**

For example:

```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.streamStart();
    ourBoard.on('impedanceArray', impedanceArray => {
        /** Work with impedance */
    });
    ourBoard.impedanceTestAllChannels();
}
```

See Reference Guide for a complete list of impedance tests.

Reference Guide
---------------
## Methods

### OpenBCIBoard (options)

Create new instance of an OpenBCI board.

**_options (optional)_**

Board optional configurations.

* `boardType` Specifies type of OpenBCI board (3 possible boards)
  * `default` - 8 Channel OpenBCI board (Default)
  * `daisy` - 8 Channel board with Daisy Module
    (NOTE: THIS IS IN-OP AT THIS TIME DUE TO NO ACCESS TO ACCESSORY BOARD)
  * `ganglion` - 4 Channel board
    (NOTE: THIS IS IN-OP TIL RELEASE OF GANGLION BOARD 07/2016)
* `baudRate` Baud Rate, defaults to 115200. Manipulating this is allowed if firmware on board has been previously configured.
* `verbose` To output more messages to the command line.
* `simulate` Full functionality, just synthetic data.
* `simulatorSampleRate` - The sample rate to use for the simulator (Default is `250`)
* `simulatorAlpha` - {Boolean} - Inject and 10Hz alpha wave in Channels 1 and 2 (Default `true`)
* `simulatorLineNoise` - Injects line noise on channels.
  * `60Hz` - 60Hz line noise (Default) (ex. __United States__)
  * `50Hz` - 50Hz line noise (ex. __Europe__)
  * `None` - Do not inject line noise.
* `sntp` - Syncs the module up with an SNTP time server. Syncs the board on startup with the SNTP time. Adds a time stamp to the AUX channels. NOTE: (NOT FULLY IMPLEMENTED) [DO NOT USE]

**Note, we have added support for either all lowercase OR camelcase of the options, use whichever style you prefer.**

### .autoFindOpenBCIBoard()

Automatically find an OpenBCI board. 

**Note: This will always return an Array of `COM` ports on Windows**

**_Returns_** a promise, fulfilled with a `portName` such as `/dev/tty.*` on Mac/Linux or `OpenBCISimulator` if `this.options.simulate === true`.

### .channelOff(channelNumber)

Turn off a specified channel

**_channelNumber_**

A number (1-16) specifying which channel you want to turn off. 

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### .channelOn(channelNumber)

Turn on a specified channel

**_channelNumber_**

A number (1-16) specifying which channel you want to turn on. 

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### .channelSet(channelNumber,powerDown,gain,inputType,bias,srb2,srb1)

Send a channel setting command to the board.

**_channelNumber_**  

Determines which channel to set. It's a 'Number' (1-16)

**_powerDown_** 

Powers the channel up or down. It's a 'Bool' where `true` turns the channel off and `false` turns the channel on (default)

**_gain_**
 
Sets the gain for the channel. It's a 'Number' that is either (1,2,4,6,8,12,24(default))
  
**_inputType_** 
  
Selects the ADC channel input source. It's a 'String' that **MUST** be one of the following: "normal", "shorted", "biasMethod" , "mvdd" , "temp" , "testsig", "biasDrp", "biasDrn".

**_bias_** 

Selects if the channel shall include the channel input in bias generation. It's a 'Bool' where `true` includes the channel in bias (default) or `false` it removes it from bias.

**_srb2_**

Select to connect (`true`) this channel's P input to the SRB2 pin. This closes a switch between P input and SRB2 for the given channel, and allows the P input to also remain connected to the ADC. It's a 'Bool' where `true` connects this input to SRB2 (default) or `false` which disconnect this input from SRB2.

**_srb1_**
           
Select to connect (`true`) all channels' N inputs to SRB1. This effects all pins, and disconnects all N inputs from the ADC. It's a 'Bool' where `true` connects all N inputs to SRB1 and `false` disconnects all N inputs from SRB1 (default).

**_Returns_** a promise fulfilled if proper commands sent to the write queue, rejects on bad input or no board.

**Example**
```js
ourBoard.channelSet(2,false,24,'normal',true,true,false);
// sends ['x','2','0','6','0','1','1','0','X'] to the command queue
```

### .connect (portName)

The essential precursor method to be called initially to establish a serial connection to the OpenBCI board.

**_portName_**

The system path of the OpenBCI board serial port to open. For example, `/dev/tty` on Mac/Linux or `COM1` on Windows.

**_Returns_** a promise, fulfilled by a successful serial connection to the board, the promise will be rejected at any time if the serial port has an 'error' or 'close' event emitted.

### .debugSession()

Calls all `.printPacketsBad()`, `.printPacketsRead()`, `.printBytesIn()`

### .disconnect()

Closes the serial port opened by `.connect()`

**_Returns_** a promise, fulfilled by a successful close of the serial port object, rejected otherwise.

### .getSettingsForChannel(channelNumber)

Gets the specified channelSettings register data from printRegisterSettings call.

**_channelNumber_** 

A number specifying which channel you want to get data on. Only 1-8 at this time.

**Note, at this time this does not work for the daisy board**

**_Returns_** a promise, fulfilled if the command was sent to the board and the `.processBytes()` function is ready to reach for the specified channel.

### .impedanceTestAllChannels()

To apply test signals to the channels on the OpenBCI board used to test for impedance. This can take a little while to actually run (<8 seconds)!

Don't forget to install the `impedanceArray` emitter to receive the impendances!

**Note, you must be connected in order to set the test commands. Also this method can take up to 5 seconds to send all commands!**

**_Returns_** a promise upon completion of test.  

### .impedanceTestChannels(arrayOfCommands)

**_arrayOfCommands_** 

The array of configurations where there are the same number of elements as channels and each element can be either:
                            
* `p` or `P` (only test P input)
* `n` or `N` (only test N input)
* `b` or `B` (test both inputs) (takes 66% longer to run then previous two `p` or `n`)
* `-` (ignore channel)

Don't forget to install the `impedanceArray` emitter to receive the impendances!

**Note, you must be connected in order to set the test commands. Also this method can take up to 5 seconds to send all commands!**

**_Returns_** a promise upon completion of test.  

### .impedanceTestChannel(channelNumber)

Run a complete impedance test on a single channel, applying the test signal individually to P & N inputs.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

Example:
```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.on('ready',function() {
        ourBoard.streamStart();
        ourBoard.impedanceTestChannel(1)
            .then(impedanceObject => {
                /** Do something with impedanceObject! */
            })
            .catch(err => console.log(err));
    });
}).catch(function(err) {
    /** Handle connection errors */
}); 
```
Where an impedance for this method call would look like:
```js
{
    channel: 1,
    P: {
        raw: 2394.45, 
        text: 'good'
    },
    N: {
        raw: 7694.45, 
        text: 'ok'
    }
}
```

### .impedanceTestChannelInputP(channelNumber)

Run impedance test on a single channel, applying the test signal only to P input.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

Example:
```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.on('ready',function() {
        ourBoard.streamStart();
        ourBoard.impedanceTestChannelInputP(1)
            .then(impedanceObject => {
                /** Do something with impedanceObject! */
            })
            .catch(err => console.log(err));
    });
}).catch(function(err) {
    /** Handle connection errors */
}); 
```
Where an impedance for this method call would look like:
```js
{
    channel: 1,
    P: {
        raw: 2394.45, 
        text: 'good'
    },
    N: {
        raw: -1, 
        text: 'init'
    }
}
```

### .impedanceTestChannelInputN(channelNumber)

Run impedance test on a single channel, applying the test signal only to N input.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

Example:
```js
var OpenBCIBoard = require('openbci-sdk').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
    ourBoard.on('ready',function() {
        ourBoard.streamStart();
        ourBoard.impedanceTestChannelInputN(1)
            .then(impedanceObject => {
                /** Do something with impedanceObject! */
            })
            .catch(err => console.log(err));
    });
}).catch(function(err) {
    /** Handle connection errors */
}); 
```
Where an impedance for this method call would look like:
```js
{
    channel: 1,
    P: {
        raw: -1, 
        text: 'init'
    },
    N: { 
        raw: 7694.45, 
        text: 'ok'
    }
}
```

### .impedanceTestContinuousStart()

Sends command to turn on impedances for all channels and continuously calculate their impedances.

**_Returns_** a promise, that fulfills when all the commands are sent to the internal write buffer

### .impedanceTestContinuousStop()

Sends command to turn off impedances for all channels and stop continuously calculate their impedances.

**_Returns_** a promise, that fulfills when all the commands are sent to the internal write buffer

### .listPorts()

List available ports so the user can choose a device when not automatically found.

**_Returns_** a promise, fulfilled with a list of available serial ports.

### .numberOfChannels()

Get the current number of channels available to use. (i.e. 8 or 16).

**Note: This is dependent on if you configured the board correctly on setup options. Specifically as a daisy.**

**_Returns_** a number, the total number of available channels.

### .printBytesIn()

Prints the total number of bytes that were read in this session to the console.

### .printPacketsBad()

Prints the total number of packets that were not able to be read in this session to the console.

### .printPacketsRead()

Prints the total number of packets that were read in this session to the console.

### .printRegisterSettings()

Prints all register settings for the ADS1299 and the LIS3DH on the OpenBCI board.

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### .sampleRate()

Get the current sample rate.

**Note: This is dependent on if you configured the board correctly on setup options. Specifically as a daisy.**

**_Returns_** a number, the current sample rate.

### .sdStart(recordingDuration)

Start logging to the SD card. If you are not streaming when you send this command, then you should expect to get a success or failure message followed by and end of transmission `$$$`.

**_recordingDuration_**

The duration you want to log SD information for. Opens a new SD file to write into. Limited to:

 * `14sec` - 14 seconds
 * `5min` - 5 minutes
 * `15min` - 15 minutes
 * `30min` - 30 minutes
 * `1hour` - 1 hour
 * `2hour` - 2 hour
 * `4hour` - 4 hour
 * `12hour` - 12 hour
 * `24hour` - 24 hour
 
**Note: You must have the proper type of SD card inserted into the board for logging to work.**

**_Returns_** resolves if the command was added to the write queue.

### .sdStop()

Stop logging to the SD card and close any open file. If you are not streaming when you send this command, then you should expect to get a success or failure message followed by and end of transmission `$$$`. The success message contains a lot of useful information about what happened when writing to the SD card.

**_Returns_** resolves if the command was added to the write queue.

### .simulatorEnable()

To enter simulate mode. Must call `.connect()` after.

**Note, must be called after the constructor.**

**_Returns_** a promise, fulfilled if able to enter simulate mode, reject if not.

### .simulatorDisable()

To leave simulate mode. 

**Note, must be called after the constructor.**

**_Returns_** a promise, fulfilled if able to stop simulate mode, reject if not.

### .sntp

Extends the popular STNP package on [npmjs](https://www.npmjs.com/package/sntp)

### .sntpGetOffset()

Stateful method for querying the current offset only when the last one is too old. (defaults to daily)

**_Returns_** a promise with the time offset

### .sntpGetServerTime()

Get time from the SNTP server. Must have internet connection!

**_Returns_** a promise fulfilled with time object

### .sntpNow()

This function gets SNTP time since Jan 1, 1970, if we call this after a successful `.sntpStart()` this time will be sycned, or else we will just get the current computer time, the case if there is no internet. 

**_Returns_** time since UNIX epoch in ms.

### .sntpStart()

This starts the SNTP server and gets it to remain in sync with the SNTP server;

**_Returns_** a promise if the module was able to sync with ntp server.

### .sntpStop()

Stops the SNTP from updating

### .softReset()

Sends a soft reset command to the board.

**Note, this method must be sent to the board before you can start streaming. This triggers the initial 'ready' event emitter.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### .streamStart()

Sends a start streaming command to the board. 

**Note, You must have called and fulfilled `.connect()` AND observed a `'ready'` emitter before calling this method.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue, rejected if unable.

### .streamStop()

Sends a stop streaming command to the board. 

**Note, You must have called and fulfilled `.connect()` AND observed a `'ready'` emitter before calling this method.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue, rejected if unable.

### .testSignal(signal)

Apply the internal test signal to all channels.

**_signal_**

A String indicating which test signal to apply

 * `dc` - Connect to DC signal
 * `ground` - Connect to internal GND (VDD - VSS)
 * `pulse1xFast` - Connect to test signal 1x Amplitude, fast pulse
 * `pulse1xSlow` - Connect to test signal 1x Amplitude, slow pulse
 * `pulse2xFast` - Connect to test signal 2x Amplitude, fast pulse
 * `pulse2xFast` - Connect to test signal 2x Amplitude, slow pulse
 * `none` - Reset to default

**_Returns_** a promise, if the commands were sent to write buffer.

### .write(dataToWrite)

Send commands to the board. Due to the OpenBCI board firmware, a 10ms spacing **must** be observed between every command sent to the board. This method handles the timing and spacing between characters by adding characters to a global write queue and pulling from it every 10ms.

**_dataToWrite_** 

Either a single character or an Array of characters

**_Returns_** a promise, fulfilled if the board has been connected and `dataToWrite` has been added to the write queue, rejected if there were any problems.

**Example**

Sends a single character command to the board.
```js
// ourBoard has fulfilled the promise on .connected() and 'ready' has been observed previously
ourBoard.write('a');
```

Sends an array of bytes
```js
// ourBoard has fulfilled the promise on .connected() and 'ready' has been observed previously
ourBoard.write(['x','0','1','0','0','0','0','0','0','X']);
```

Taking full advantage of the write queue. The following would be sent at t = 0, 10ms, 20ms, 30ms 
```js
ourBoard.write('t');
ourBoard.write('a');
ourBoard.write('c');
ourBoard.write('o');
```

## Events

### .on('close', callback)

Emitted when the serial connection to the board is closed.

### .on('error', callback)

Emitted when there is an on the serial port.

### .on('impedanceArray', callback)

Emitted when there is a new impedanceArray available.

### .on('query', callback)

Emitted resulting in a call to `.getChannelSettings()` with the channelSettingsObject

### .on('rawDataPacket', callback)

Emitted when there is a new raw data packet available.

### .on('ready', callback)

Emitted when the board is in a ready to start streaming state.

### .on('sample', callback)

Emitted when there is a new sample available.

## Properties 

### connected

A bool, true if connected to an OpenBCI board, false if not.

### streaming

A bool, true if streaming data from an OpenBCI board, false if not.

## Useful Constants

To use the constants file simply:
```js
var openBCIBoard = require('openbci-sdk');
var k = openBCIBoard.OpenBCIConstants;

console.log(k.OBCISimulatorPortName); // prints OpenBCISimulator to the console.
```

### .OBCISimulatorPortName

The name of the simulator port.

## Dev Notes
Running
-------
1. `npm install -D`
2. Plug usb module into serial port
3. Turn OpenBCI device on
4. Type `npm start` into the terminal in the project directory

Testing
-------
```
npm test
```

## Contribute to the library
1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Make changes and ensure tests all pass. (`npm test`)
4. Commit your changes: `git commit -m 'Add some feature'`
5. Push to the branch: `git push origin my-new-feature`
6. Submit a pull request :D

## License
MIT
