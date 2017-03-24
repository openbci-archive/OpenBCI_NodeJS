[![Stories in Ready](https://badge.waffle.io/OpenBCI/OpenBCI_NodeJS.png?label=ready&title=Ready)](https://waffle.io/OpenBCI/OpenBCI_NodeJS)
[![Join the chat at https://gitter.im/OpenBCI/OpenBCI_NodeJS](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OpenBCI/OpenBCI_NodeJS?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/OpenBCI/OpenBCI_NodeJS.svg?branch=master)](https://travis-ci.org/OpenBCI/OpenBCI_NodeJS)
[![codecov](https://codecov.io/gh/OpenBCI/OpenBCI_NodeJS/branch/master/graph/badge.svg)](https://codecov.io/gh/OpenBCI/OpenBCI_NodeJS)
[![Dependency Status](https://david-dm.org/OpenBCI/OpenBCI_NodeJS.svg)](https://david-dm.org/OpenBCI/OpenBCI_NodeJS)
[![npm](https://img.shields.io/npm/dm/openbci.svg?maxAge=2592000)](http://npmjs.com/package/openbci)
[![js-semistandard-style](https://img.shields.io/badge/code%20style-semistandard-brightgreen.svg?style=flat-square)](https://github.com/Flet/semistandard)

# OpenBCI Node.js SDK

A Node.js module for OpenBCI ~ written with love by [Push The World!](http://www.pushtheworldllc.com)

We are proud to support all functionality of the OpenBCI 8 and 16 Channel boards and are actively developing and maintaining this module.

The purpose of this module is to **get connected** and **start streaming** as fast as possible.

Python researcher or developer? Check out how easy it is to [get access to the entire API in the Python example](examples/python)!

### Table of Contents:
---

1. [Installation](#install)
2. [TL;DR](#tldr)
3. [About](#About)
4. [General Overview](#general-overview)
5. [SDK Reference Guide](#sdk-reference-guide)
  1. [Constructor](#constructor)
  2. [Methods](#method)
  3. [Events](#event)
  4. [Constants](#constants)
6. [Interfacing With Other Tools](#interfacing-with-other-tools)
7. [Developing](#developing)
8. [Testing](#developing-testing)
9. [Contribute](#contribute)
10. [License](#license)
11. [Roadmap](#roadmap)

### <a name="install"></a> Installation:
```
npm install openbci
```
#### serialport dependency
If you encounter this error when trying to run:
```
Error: The module '/path/to/your/project/node_modules/serialport/build/Release/serialport.node'
was compiled against a different Node.js version using
NODE_MODULE_VERSION 48. This version of Node.js requires
NODE_MODULE_VERSION 51. Please try re-compiling or re-installing
the module (for instance, using `npm rebuild` or`npm install`).
```
...the issue can be resolved by running:
```
npm rebuild --build-from-source
```
### <a name="tldr"></a> TL;DR:
Get connected and [start streaming right now with the example code](examples/getStreaming/getStreaming.js).

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard();
ourBoard.connect(portName) // Port name is a serial port name, see `.listPorts()`
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

### <a name="about"></a> About:
Want to know if the module really works? Check out some projects and organizations using it:

* [_OpenEXP_](https://github.com/openexp/OpenEXP): an open-source desktop app for running experiments and collecting behavioral and physiological data.
* [_Thinker_](http://www.pushtheworldllc.com/#!thinker/uc1fn): a project building the world's first brainwave-word database.
* [_NeuroJS_](https://github.com/NeuroJS): a community dedicated to Neuroscience research using JavaScript, they have several great examples.

Still not satisfied it works?? Check out this [detailed report](http://s132342840.onlinehome.us/pushtheworld/files/voltageVerificationTestPlanAndResults.pdf) that scientifically validates the output voltages of this module.

How are you still doubting and not using this already? Fine, go look at some of the [800 **_automatic_** tests](https://codecov.io/gh/OpenBCI/OpenBCI_NodeJS) written for it!

Python researcher or developer? Check out how easy it is to [get access to the entire API in the Python example](examples/python)!

### <a name="general-overview"></a> General Overview:

Initialization
--------------

Initializing the board:

```js
var OpenBCIBoard = require('openbci');
var ourBoard = new OpenBCIBoard.OpenBCIBoard();
```
Go [checkout out the get streaming example](examples/getStreaming/getStreaming.js)!

For initializing with options, such as verbose print outs:

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    verbose: true
});
```

Or if you don't have a board and want to use synthetic data:

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    simulate: true
});
```

Have a daisy?:
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    boardType: `daisy`,
    hardSet: true
});
```
Go [checkout out the get streaming with daisy example](examples/getStreamingDaisy/getStreamingDaisy.js)!

Another useful way to start the simulator:
```js
var openBCIBoard = require('openbci');
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

To debug, it's amazing, do:

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var ourBoard = new OpenBCIBoard({
    simulate: true
});
```
Go [checkout out the debug example](examples/debug/debug.js)!

'ready' event
------------

You MUST wait for the 'ready' event to be emitted before streaming/talking with the board. The ready happens asynchronously
so installing the 'sample' listener and writing before the ready event might result in... nothing at all.

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

You can also start the simulator by sending [`.connect(portName)`](#method-connect) with `portName` equal to [`'OpenBCISimulator'`](#constants-obcisimulatorportname).

To get a ['sample'](#event-sample) event, you need to:
-------------------------------------
1. Call [`.connect(serialPortName)`](#method-connect)
2. Install the ['ready'](#event-ready) event emitter on resolved promise
3. In callback for ['ready'](#event-ready) emitter, call [`streamStart()`](#method-stream-start)
4. Install the ['sample'](#event-sample) event emitter
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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
Close the connection with [`.streamStop()`](#method-stream-stop) and disconnect with [`.disconnect()`](#method-disconnect)
```js
var ourBoard = new require('openbci').OpenBCIBoard();
ourBoard.streamStop().then(ourBoard.disconnect());
```

Time Syncing
------------
You must be using OpenBCI firmware version 2 in order to do time syncing. After you [`.connect()`](#method-connect) and send a [`.softReset()`](#method-soft-reset), you can call [`.usingVersionTwoFirmware()`](#method-using-version-two-firmware) to get a boolean response as to if you are using `v1` or `v2`.

Now using firmware `v2`, the fun begins! We synchronize the Board's clock with the module's time. In firmware `v2` we leverage samples with time stamps and _ACKs_ from the Dongle to form a time synchronization strategy. Time syncing has been verified to +/- 4ms and a test report is on the way. We are still working on the synchronize of this module and an NTP server, this is an open call for any NTP experts out there! With a global NTP server you could use several different devices and all sync to the same time server. That way you can really do some serious cloud computing!

Keep your resync interval above 50ms. While it's important to resync every couple minutes due to drifting of clocks, please do not try to sync without getting the last sync event! We can only support one sync operation at a time!

Using local computer time:
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard,
    ourBoard = new OpenBCIBoard({
        verbose:true
    });

const resyncPeriodMin = 5; // re sync every five minutes
const secondsInMinute = 60;
var sampleRate = k.OBCISampleRate250; // Default to 250, ALWAYS verify with a call to `.sampleRate()` after 'ready' event!
var timeSyncPossible = false;

// Call to connect
ourBoard.connect(portName).then(() => {
    ourBoard.on('ready',() => {
        // Get the sample rate after 'ready'
        sampleRate = ourBoard.sampleRate();
        // Find out if you can even time sync, you must be using v2 and this is only accurate after a `.softReset()` call which is called internally on `.connect()`. We parse the `.softReset()` response for the presence of firmware version 2 properties.
        timeSyncPossible = ourBoard.usingVersionTwoFirmware();

        ourBoard.streamStart()
            .then(() => {
                /** Start streaming command sent to board. */
            })
            .catch(err => {
                console.log(`stream start: ${err}`);
            })
    });

    // PTW recommends sample driven  
    ourBoard.on('sample',sample => {
        // Resynchronize every every 5 minutes
        if (sample._count % (sampleRate * resyncPeriodMin * secondsInMinute) === 0) {
            ourBoard.syncClocksFull()
                .then(syncObj => {
                    // Sync was successful
                    if (syncObj.valid) {
                        // Log the object to check it out!
                        console.log(`syncObj`,syncObj);

                    // Sync was not successful
                    } else {
                        // Retry it
                        console.log(`Was not able to sync, please retry?`);
                    }
                });
        }

        if (sample.timeStamp) { // true after the first sync
            console.log(`NTP Time Stamp ${sample.timeStamp}`);
        }

    });
})
.catch(err => {
    console.log(`connect: ${err}`);
});
```

Auto-finding boards
-------------------
You must have the OpenBCI board connected to the PC before trying to automatically find it.

If a port is not automatically found, then call [`.listPorts()`](#method-list-ports) to get a list of all serial ports this would be a good place to present a drop down picker list to the user, so they may manually select the serial port name.

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

Note: [`.autoFindOpenBCIBoard()`](#method-auto-find-open-bci-board) will return the name of the Simulator if you instantiate with option `simulate: true`.

Auto Test - (Using impedance to determine signal quality)
---------------------------------------------------------
Measuring impedance is a vital tool in ensuring great data is collected.

**_IMPORTANT!_** Measuring impedance takes time, so *only test what you must*

Your OpenBCI board will have electrodes hooked up to either a P input, N input or in some cases both inputs.

To test specific inputs of channels:

1. Connect to board.
2. Start streaming.
3. Install the ['impedanceArray'](#event-impedance-array) event
4. Call [`.impedanceTestChannels()`](#method-impedance-test-channels) with your configuration array

A configuration array looks like, for an 8 channel board, `['-','N','n','p','P','-','b','b']`

Where there are the same number of elements as channels and each element can be either:

* `p` or `P` (only test P input)
* `n` or `N` (only test N input)
* `b` or `B` (test both inputs) (takes 66% longer to run then previous two `p` or `n`)
* `-` (ignore channel)

Without further ado, here is an example:
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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
3. Install the ['impedanceArray'](#event-impedance-array)
4. Call [`.impedanceTestAllChannels()`](#method-impedance-test-all-channels)

**Note: Takes up to 5 seconds to start measuring impedances. There is an unknown number of samples taken. Not always 60!**

For example:

```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

# <a name="sdk-reference-guide"></a> SDK Reference Guide:
---------------
## <a name="constructor"></a> Constructor:

### <a name="constructor-openbciboard"></a> OpenBCIBoard (options)

Create new instance of an OpenBCI board.

**_options (optional)_**

Board optional configurations.

* `baudRate` {Number} - Baud Rate, defaults to 115200. Manipulating this is allowed if firmware on board has been previously configured.
* `boardType` {String} - Specifies type of OpenBCI board (3 possible boards)
  * `default` - 8 Channel OpenBCI board (Default)
  * `daisy` - 8 Channel board with Daisy Module - 16 Channels
  * `ganglion` - 4 Channel board
    (NOTE: THIS IS IN-OP TIL RELEASE OF GANGLION BOARD 08/2016)
* `hardSet` {Boolean} - Recommended if using `daisy` board! For some reason, the `daisy` is sometimes not picked up by the module so you can set `hardSet` to true which will ensure the daisy is picked up. (Default `false`)
* `simulate` {Boolean} - Full functionality, just mock data. Must attach Daisy module by setting `simulatorDaisyModuleAttached` to `true` in order to get 16 channels. (Default `false`)
* `simulatorBoardFailure` {Boolean} - Simulates board communications failure. This occurs when the RFduino on the board is not polling the RFduino on the dongle. (Default `false`)
* `simulatorDaisyModuleAttached` {Boolean} - Simulates a daisy module being attached to the OpenBCI board. This is useful if you want to test how your application reacts to a user requesting 16 channels but there is no daisy module actually attached, or vice versa, where there is a daisy module attached and the user only wants to use 8 channels. (Default `false`)
* `simulatorFirmwareVersion` {String} - Allows the simulator to use firmware version 2 features. (2 Possible Options)
  * `v1` - Firmware Version 1 (Default)
  * `v2` - Firmware Version 2
* `simulatorFragmentation` {String} - Specifies how to break packets to simulate fragmentation, which occurs commonly in real devices.  It is recommended to test code with this enabled.  (4 Possible Options)
  * `none` - do not fragment packets; output complete chunks immediately when produced (Default)
  * `random` - output random small chunks of data interspersed with full buffers
  * `fullBuffers` - allow buffers to fill up until latency timer has expired
  * `oneByOne` - output each byte separately
* `simulatorLatencyTime` {Number} - The time in milliseconds to wait before sending partially full buffers of data, if `simulatorFragmentation` is specified.  (Default `16`)
* `simulatorBufferSize` {Number} - The size of a full buffer of data, if `simulatorFragmentation` is specified. (Default `4096`)
* `simulatorHasAccelerometer` - {Boolean} - Sets simulator to send packets with accelerometer data. (Default `true`)
* `simulatorInjectAlpha` - {Boolean} - Inject a 10Hz alpha wave in Channels 1 and 2 (Default `true`)
* `simulatorInjectLineNoise` {String} - Injects line noise on channels. (3 Possible Options)
  * `60Hz` - 60Hz line noise (Default) [America]
  * `50Hz` - 50Hz line noise [Europe]
  * `none` - Do not inject line noise.
* `simulatorSampleRate` {Number} - The sample rate to use for the simulator. Simulator will set to 125 if `simulatorDaisyModuleAttached` is set `true`. However, setting this option overrides that setting and this sample rate will be used. (Default is `250`)
* `simulatorSerialPortFailure` {Boolean} - Simulates not being able to open a serial connection. Most likely due to a OpenBCI dongle not being plugged in.
* `sntpTimeSync` - {Boolean} Syncs the module up with an SNTP time server and uses that as single source of truth instead of local computer time. If you are running experiments on your local computer, keep this `false`. (Default `false`)
* `sntpTimeSyncHost` - {String} The sntp server to use, can be either sntp or ntp (Defaults `pool.ntp.org`).
* `sntpTimeSyncPort` - {Number} The port to access the sntp server (Defaults `123`)
* `verbose` {Boolean} - Print out useful debugging events (Default `false`)
* `debug` {Boolean} - Print out a raw dump of bytes sent and received (Default `false`)

**Note, we have added support for either all lowercase OR camel case for the options, use whichever style you prefer.**

## <a name="method"></a> Methods:

### <a name="method-auto-find-open-bci-board"></a> .autoFindOpenBCIBoard()

Automatically find an OpenBCI board.

**Note: This will always return an Array of `COM` ports on Windows**

**_Returns_** a promise, fulfilled with a `portName` such as `/dev/tty.*` on Mac/Linux or `OpenBCISimulator` if `this.options.simulate === true`.

### <a name="method-channel-off"></a> .channelOff(channelNumber)

Turn off a specified channel

**_channelNumber_**

A number (1-16) specifying which channel you want to turn off.

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### <a name="method-channel-on"></a> .channelOn(channelNumber)

Turn on a specified channel

**_channelNumber_**

A number (1-16) specifying which channel you want to turn on.

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### <a name="method-"></a> .channelSet(channelNumber,powerDown,gain,inputType,bias,srb2,srb1)

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

### <a name="method-connect"></a> .connect(portName)

The essential precursor method to be called initially to establish a serial connection to the OpenBCI board.

**_portName_**

The system path of the OpenBCI board serial port to open. For example, `/dev/tty` on Mac/Linux or `COM1` on Windows.

**_Returns_** a promise, fulfilled by a successful serial connection to the board.

### <a name="method-debug-session"></a> .debugSession()

Calls all [`.printPacketsBad()`](#method-print-packets-bad), [`.printPacketsRead()`](#method-print-packets-read), [`.printBytesIn()`](#method-print-bytes-in)

### <a name="method-disconnect"></a> .disconnect()

Closes the serial port opened by [`.connect()`](#method-connect).  Waits for stop streaming command to be sent if currently streaming.

**_Returns_** a promise, fulfilled by a successful close of the serial port object, rejected otherwise.

### <a name="method-get-info"></a> .getInfo()

Get the core info object. It's the object that actually drives the parsing of data.

**_Returns_** Object - {{boardType: string, sampleRate: number, firmware: string, numberOfChannels: number, missedPackets: number}}

### <a name="method-get-settings-for-channel"></a> .getSettingsForChannel(channelNumber)

Gets the specified channelSettings register data from printRegisterSettings call.

**_channelNumber_**

A number specifying which channel you want to get data on. Only 1-8 at this time.

**Note, at this time this does not work for the daisy board**

**_Returns_** a promise, fulfilled if the command was sent to the board and the `.processBytes()` function is ready to reach for the specified channel.

### <a name="method-hard-set-board-type"></a> .hardSetBoardType(boardType)

Used to sync the module and board to `boardType`.

**Note: This has the potential to change the way data is parsed** 
 
**_boardType_**

A String indicating the number of channels.

* `default` - Default board: Sample rate is `250Hz` and number of channels is `8`. 
* `daisy` - Daisy board: Sample rate is `125Hz` and number of channels is `16`.

**_Returns_** a promise, fulfilled if both the board and module are the requested `boardType`, rejects otherwise.

### <a name="method-impedance-test-all-channels"></a> .impedanceTestAllChannels()

To apply test signals to the channels on the OpenBCI board used to test for impedance. This can take a little while to actually run (<8 seconds)!

Don't forget to install the ['impedanceArray'](#event-impedance-array) emitter to receive the impendances!

**Note, you must be connected in order to set the test commands. Also this method can take up to 5 seconds to send all commands!**

**_Returns_** a promise upon completion of test.  

### <a name="method-impedance-test-channels"></a> .impedanceTestChannels(arrayOfCommands)

**_arrayOfCommands_**

The array of configurations where there are the same number of elements as channels and each element can be either:

* `p` or `P` (only test P input)
* `n` or `N` (only test N input)
* `b` or `B` (test both inputs) (takes 66% longer to run then previous two `p` or `n`)
* `-` (ignore channel)

Don't forget to install the `impedanceArray` emitter to receive the impendances!

**Note, you must be connected in order to set the test commands. Also this method can take up to 5 seconds to send all commands!**

**_Returns_** a promise upon completion of test.  

### <a name="method-impedance-test-channel"></a> .impedanceTestChannel(channelNumber)

Run a complete impedance test on a single channel, applying the test signal individually to P & N inputs.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

**Example**
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

### <a name="method-impedance-test-channel-input-p"></a> .impedanceTestChannelInputP(channelNumber)

Run impedance test on a single channel, applying the test signal only to P input.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

**Example**
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

### <a name="method-impedance-test-channel-input-n"></a> .impedanceTestChannelInputN(channelNumber)

Run impedance test on a single channel, applying the test signal only to N input.

**_channelNumber_**

A Number, specifies which channel you want to test.

**_Returns_** a promise that resolves a single channel impedance object.

**Example**
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
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

### <a name="method-impedance-test-continuous-start"></a> .impedanceTestContinuousStart()

Sends command to turn on impedances for all channels and continuously calculate their impedances.

**_Returns_** a promise, that fulfills when all the commands are sent to the internal write buffer

### <a name="method-impedance-test-continuous-stop"></a> .impedanceTestContinuousStop()

Sends command to turn off impedances for all channels and stop continuously calculate their impedances.

**_Returns_** a promise, that fulfills when all the commands are sent to the internal write buffer

### <a name="method-is-connected"></a> .isConnected()

Checks if the driver is connected to a board.
**_Returns_** a boolean, true if connected

### <a name="method-is-streaming"></a> .isStreaming()

Checks if the board is currently sending samples.
**_Returns_** a boolean, true if streaming

### <a name="method-list-ports"></a> .listPorts()

List available ports so the user can choose a device when not automatically found.

**_Returns_** a promise, fulfilled with a list of available serial ports.

### <a name="method-number-of-channels"></a> .numberOfChannels()

Get the current number of channels available to use. (i.e. 8 or 16).

**Note: This is dependent on if you configured the board correctly on setup options. Specifically as a daisy.**

**_Returns_** a number, the total number of available channels.

### <a name="method-override-info-for-board-type"></a> .overrideInfoForBoardType(boardType)

Set the info property for board type. 

**Note: This has the potential to change the way data is parsed** 
 
**_boardType_**

A String indicating the number of channels.

* `default` - Default board: Sample rate is `250Hz` and number of channels is `8`. 
* `daisy` - Daisy board: Sample rate is `125Hz` and number of channels is `16`.

### <a name="method-print-bytes-in"></a> .printBytesIn()

Prints the total number of bytes that were read in this session to the console.

### <a name="method-print-packets-bad"></a> .printPacketsBad()

Prints the total number of packets that were not able to be read in this session to the console.

### <a name="method-print-packets-read"></a> .printPacketsRead()

Prints the total number of packets that were read in this session to the console.

### <a name="method-print-register-settings"></a> .printRegisterSettings()

Prints all register settings for the ADS1299 and the LIS3DH on the OpenBCI board.

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### <a name="method-radio-baud-rate-set"></a> .radioBaudRateSet(speed)

Used to set the OpenBCI Host (Dongle) baud rate. With the RFduino configuration, the Dongle is the Host and the Board is the Device. Only the Device can initiate a communication between the two entities. There exists a detrimental error where if the Host is interrupted by the radio during a Serial write, then all hell breaks loose. So this is an effort to eliminate that problem by increasing the rate at which serial data is sent from the Host to the Serial driver. The rate can either be set to default or fast. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve the new baud rate after closing the current serial port and reopening one.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_speed_**

{String} - The baud rate that to switch to. Can be either `default` (115200) or `fast` (230400).

**_Returns_** {Promise} - Resolves a {Number} that is the new baud rate, rejects on error.

### <a name="method-radio-channel-get"></a> .radioChannelGet()

Used to query the OpenBCI system for it's radio channel number. The function will reject if not connected to the serial port of the dongle. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve an Object. See `returns` below.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_Returns_** {Promise} - Resolve an object with keys `channelNumber` which is a Number and `err` which contains an error in the condition that there system is experiencing board communications failure.

### <a name="method-radio-channel-set"></a> .radioChannelSet(channelNumber)

Used to set the system radio channel number. The function will reject if not connected to the serial port of the dongle. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_channelNumber_**

{Number} - The channel number you want to set to, 1-25.

**_Returns_** {Promise} - Resolves with the new channel number, rejects with err.

### <a name="method-radio-channel-set-host-override"></a> .radioChannelSetHostOverride(channelNumber)

Used to set the ONLY the radio dongle Host channel number. This will fix your radio system if your dongle and board are not on the right channel and bring down your radio system if you take your dongle and board are not on the same channel. Use with caution! The function will reject if not connected to the serial port of the dongle. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_channelNumber_**

{Number} - The channel number you want to set to, 1-25.

**_Returns_** {Promise} - Resolves with the new channel number, rejects with err.

### <a name="method-radio-poll-time-get"></a> .radioPollTimeGet()

Used to query the OpenBCI system for it's device's poll time. The function will reject if not connected to the serial port of the dongle. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve the poll time when fulfilled. It's important to note that if the board is not on, this function will always be rejected with a failure message.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_Returns_** {Promise} - Resolves with the new poll time, rejects with err.

### <a name="method-radio-poll-time-set"></a> .radioPollTimeSet(pollTime)

Used to set the OpenBCI poll time. With the RFduino configuration, the Dongle is the Host and the Board is the Device. Only the Device can initiate a communication between the two entities. Therefore this sets the interval at which the Device polls the Host for new information. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware 2+ then this function should resolve.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_pollTime_**

{Number} - The poll time you want to set to, 0-255.

**_Returns_** {Promise} - Resolves with the new channel number, rejects with err.

### <a name="method-radio-system-status-get"></a> .radioSystemStatusGet()

Used to ask the Host if it's radio system is up. This is useful to quickly determine if you are in fact ready to start trying to connect and such. The function will reject if not connected to the serial port of the dongle. Further the function should reject if currently streaming. Lastly and more important, if the board is not running the new firmware then this functionality does not exist and thus this method will reject. If the board is using firmware +v2.0.0 and the radios are both on the same channel and powered, then this will resolve true.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_Returns_** {Promise} - Resolves true if both radios are powered and on the same channel; false otherwise.

### <a name="method-sample-rate"></a> .sampleRate()

Get the current sample rate.

**Note: This is dependent on if you configured the board correctly on setup options. Specifically as a daisy.**

**_Returns_** a number, the current sample rate.

### <a name="method-sd-start"></a> .sdStart(recordingDuration)

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

### <a name="method-sd-stop"></a> .sdStop()

Stop logging to the SD card and close any open file. If you are not streaming when you send this command, then you should expect to get a success or failure message followed by and end of transmission `$$$`. The success message contains a lot of useful information about what happened when writing to the SD card.

**_Returns_** resolves if the command was added to the write queue.

### <a name="method-simulator-enable"></a> .simulatorEnable()

To enter simulate mode. Must call [`.connect()`](#method-connect) after.

**Note, must be called after the constructor.**

**_Returns_** a promise, fulfilled if able to enter simulate mode, reject if not.

### <a name="method-simulator-disable"></a> .simulatorDisable()

To leave simulate mode.

**Note, must be called after the constructor.**

**_Returns_** a promise, fulfilled if able to stop simulate mode, reject if not.

### <a name="method-sntp"></a> .sntp

Extends the popular SNTP package on [npmjs](https://www.npmjs.com/package/sntp)

### <a name="method-sntp-get-offset"></a> .sntpGetOffset()

Stateful method for querying the current offset only when the last one is too old. (defaults to daily)

**_Returns_** a promise with the time offset

### <a name="method-sntp-start"></a> .sntpStart()

This starts the SNTP server and gets it to remain in sync with the SNTP server.

**_Returns_** a promise if the module was able to sync with NTP server.

### <a name="method-sntp-stop"></a> .sntpStop()

Stops the SNTP from updating

### <a name="method-soft-reset"></a> .softReset()

Sends a soft reset command to the board.

**Note, this method must be sent to the board before you can start streaming. This triggers the initial 'ready' event emitter.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue.

### <a name="method-stream-start"></a> .streamStart()

Sends a start streaming command to the board.

**Note, You must have called and fulfilled [`.connect()`](#method-connect) AND observed a `'ready'` emitter before calling this method.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue, rejected if unable.

### <a name="method-stream-stop"></a> .streamStop()

Sends a stop streaming command to the board.

**Note, You must have called and fulfilled [`.connect()`](#method-connect) AND observed a `'ready'` emitter before calling this method.**

**_Returns_** a promise, fulfilled if the command was sent to the write queue, rejected if unable.

### <a name="method-sync-clocks"></a> .syncClocks()

Send the command to tell the board to start the syncing protocol. Must be connected, streaming and using version +2 firmware.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_Returns_** {Promise} resolves if the command was sent to the write queue, rejects if unable.

### <a name="method-sync-clocks-full"></a> .syncClocksFull()

Send the command to tell the board to start the syncing protocol. Must be connected, streaming and using v2 firmware. Uses the `synced` event to ensure multiple syncs don't overlap.

**Note, this functionality requires OpenBCI Firmware Version 2.0**

**_Returns_** {Promise} resolves if `synced` event is emitted, rejects if not connected or using firmware v2. Resolves with a synced object:
```javascript
{
    boardTime: 0, // The time contained in the time sync set packet.
    correctedTransmissionTime: false, // If the confirmation and the set packet arrive in the same serial flush we have big problem! This will be true in this case. See source code for full explanation.
    timeSyncSent: 0, // The time the `<` was sent to the Dongle.
    timeSyncSentConfirmation: 0, // The time the `<` was sent to the Board; It's really the time `,` was received from the Dongle.
    timeSyncSetPacket: 0, // The time the set packet was received from the Board.
    timeRoundTrip: 0, // Simply timeSyncSetPacket - timeSyncSent.
    timeTransmission: 0, // Estimated time it took for time sync set packet to be sent from Board to Driver.
    timeOffset: 0, // The map (or translation) from boardTime to module time.
    timeOffsetMaster: 0, // The map (or translation) from boardTime to module time averaged over time syncs.
    valid: false // If there was an error in the process, valid will be false and no time sync was done. It's important to resolve this so we can perform multiple promise syncs as show in the example below.
}
```

**Example**

Syncing multiple times to base the offset of the average of the four syncs.

```javascript
var OpenBCIBoard = require('openbci').OpenBCIBoard,
    ourBoard = new OpenBCIBoard({
        verbose:true
    });

var portName = /* INSERT PORT NAME HERE */;
var samples = []; // Array to store time synced samples into
var timeSyncActivated = false;

ourBoard.connect(portName)
    .then(() => {
        ourBoard.on('ready',() => {
            ourBoard.streamStart()
                .then(() => {
                    /** Could also call `.syncClocksFull()` here */
                })
                .catch(err => {
                    console.log(`Error starting stream ${err}`);
                })
            });
        ourBoard.on('sample',sample => {
            /** If we are not synced, then do that! */
            if (timeSyncActivated === false) {
                timeSyncActivated = true;
                ourBoard.syncClocksFull()
                    .then(syncObj => {
                        if (syncObj.valid) {
                            console.log('1st sync done');
                        }
                        return ourBoard.syncClocksFull();
                    })
                    .then(syncObj => {
                        if (syncObj.valid) {
                            console.log('2nd sync done');
                        }
                        return ourBoard.syncClocksFull();
                    })
                    .then(syncObj => {
                        if (syncObj.valid) {
                            console.log('3rd sync done');
                        }
                        return ourBoard.syncClocksFull();
                    })
                    .then(syncObj => {
                        if (syncObj.valid) {
                            console.log('4th sync done');

                        }
                        /* Do awesome time syncing stuff */
                    })
                    .catch(err => {
                        console.log(`sync err ${err}`);
                    });
            }
            if (startLoggingSamples && sample.hasOwnProperty("timeStamp") && sample.hasOwnProperty("boardTime")) {
                /** If you only want to log samples with time stamps */
                samples.push(sample);
            }
        });
    })
.catch(err => {
    console.log(`connect ${err}`);
});

```

### <a name="method-test-signal"></a> .testSignal(signal)

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

### <a name="method-time"></a> .time()

Uses `._sntpNow()` time when sntpTimeSync specified `true` in options, or else Date.now() for time.

**_Returns_** time since UNIX epoch in ms.

### <a name="method-using-version-two-firmware"></a> .usingVersionTwoFirmware()

Convenience method to determine if you can use firmware v2.x.x capabilities.

**Note, should be called after a [`.softReset()`](#method-soft-reset) because we can parse the output of that to determine if we are using firmware version 2.**

**_Returns_** a boolean, true if using firmware version 2 or greater.

### <a name="method-write"></a> .write(dataToWrite)

Send commands to the board. Due to the OpenBCI board firmware 1.0, a 10ms spacing **must** be observed between every command sent to the board. This method handles the timing and spacing between characters by adding characters to a global write queue and pulling from it every 10ms. If you are using firmware version +2.0 then you no spacing will be used.

**_dataToWrite_**

Either a single character or an Array of characters

**_Returns_** a promise, fulfilled if the board has been connected and `dataToWrite` has been added to the write queue, rejected if there were any problems.

**Example**

Sends a single character command to the board.
```js
// ourBoard has fulfilled the promise on .connect() and 'ready' has been observed previously
ourBoard.write('a');
```

Sends an array of bytes
```js
// ourBoard has fulfilled the promise on .connect() and 'ready' has been observed previously
ourBoard.write(['x','0','1','0','0','0','0','0','0','X']);
```

Taking full advantage of the write queue. The following would be sent at t = 0, 10ms, 20ms, 30ms
```js
ourBoard.write('t');
ourBoard.write('a');
ourBoard.write('c');
ourBoard.write('o');
```

## <a name="event"></a> Events:

### <a name="event-close"></a> .on('close', callback)

Emitted when the serial connection to the board is closed.

### <a name="event-close"></a> .on('droppedPacket', callback)

Emitted when a packet (or packets) are dropped. Returns an array.

### <a name="event-error"></a> .on('error', callback)

Emitted when there is an on the serial port.

### <a name="event-hard-set"></a> .on('hardSet', callback)

Emitted when the module detects the board is not configured as the options for the module intended and tries to save itself. i.e. when the `daisy` option is `true` and a soft reset message is parsed and the module determines that a daisy was not detected, the module will emit `hardSet` then send an attach daisy command to recover. Either `error` will be emitted if unable to attach or `ready` will be emitted if success.

### <a name="event-impedance-array"></a> .on('impedanceArray', callback)

Emitted when there is a new impedanceArray available. Returns an array.

### <a name="event-query"></a> .on('query', callback)

Emitted resulting in a call to [`.getChannelSettings()`](#method-get-settings-for-channel) with the channelSettingsObject

### <a name="event-raw-data-packet"></a> .on('rawDataPacket', callback)

Emitted when there is a new raw data packet available.

### <a name="event-ready"></a> .on('ready', callback)

Emitted when the board is in a ready to start streaming state.

### <a name="event-sample"></a> .on('sample', callback)

Emitted when there is a new sample available.

### <a name="event-sample"></a> .on('synced', callback)

Emitted when there is a new sample available.

## <a name="constants"></a> Constants:

To use the constants file simply:
```js
var openBCIBoard = require('openbci');
var k = openBCIBoard.OpenBCIConstants;

console.log(k.OBCISimulatorPortName); // prints OpenBCISimulator to the console.
```

### <a name="constants-obcisimulatorportname"></a> .OBCISimulatorPortName

The name of the simulator port.

## <a name="interfacing-with-other-tools"></a> Interfacing With Other Tools:

### <a name="interfacing-with-other-tools-labstreaminglayer"></a> LabStreamingLayer

[LabStreamingLayer](https://github.com/sccn/labstreaminglayer) is a tool for streaming or recording time-series data. It can be used to interface with [Matlab](https://github.com/sccn/labstreaminglayer/tree/master/LSL/liblsl-Matlab), [Python](https://github.com/sccn/labstreaminglayer/tree/master/LSL/liblsl-Python), [Unity](https://github.com/xfleckx/LSL4Unity), and many other programs. 

To use LSL with the NodeJS SDK, go to our [labstreaminglayer example](https://github.com/OpenBCI/OpenBCI_NodeJS/tree/master/examples/labstreaminglayer), which contains code that is ready to start an LSL stream of OpenBCI data.

Follow the directions in the [readme](https://github.com/OpenBCI/OpenBCI_NodeJS/blob/master/examples/labstreaminglayer/readme.md) to get started.


## <a name="developing"></a> Developing:
### <a name="developing-running"></a> Running:

```
npm install
```

### <a name="developing-testing"></a> Testing:

```
npm test
```

## <a name="contribute"></a> Contribute:

1. Fork it!
2. Branch off of `development`: `git checkout development`
2. Create your feature branch: `git checkout -b my-new-feature`
3. Make changes
4. If adding a feature, please add test coverage.
5. Ensure tests all pass. (`npm test`)
6. Commit your changes: `git commit -m 'Add some feature'`
7. Push to the branch: `git push origin my-new-feature`
8. Submit a pull request. Make sure it is based off of the `development` branch when submitting! :D

## <a name="license"></a> License:

MIT

## <a name="roadmap"></a> Roadmap:

1. Ganglion integration (2.x)
2. Compatible with node streams (3.x)
3. Remove factory paradigm from main file (3.x)
5. ES6/ES7 total adoption (3.x)
4. Browser support (with browser serialport) (x.x)
