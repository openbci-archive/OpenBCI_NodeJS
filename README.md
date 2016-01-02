[![Stories in Ready](https://badge.waffle.io/OpenBCI/openbci-js-sdk.png?label=ready&title=Ready)](https://waffle.io/OpenBCI/openbci-js-sdk)
[![Join the chat at https://gitter.im/OpenBCI/openbci-js-sdk](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OpenBCI/openbci-js-sdk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/OpenBCI/openbci-js-sdk.svg?branch=master)](https://travis-ci.org/OpenBCI/openbci-js-sdk)

#openbci-sdk

An NPM module for OpenBCI ~ written with love by Push The World

##Working with the Module

Initialization
--------------

Initializing the board:

```js
var OpenBCIBoard = require('openbci-sdk');
var ourBoard = new OpenBCIBoard.OpenBCIBoard();
```

'ready' event
------------

You MUST wait for the 'ready' event to be emitted before streaming/talking with the board. The ready happens asynchronously 
so installing the 'sample' listener and writing before the ready event might result in... nothing at all.

```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
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
1. `startByte` (`Number`  should be `0xA0`)
2. `sampleNumber` (a `Number` between 0-255) 
3. `channelData` (channel data indexed starting at 1 [1,2,3,4,5,6,7,8] filled with floating point `Numbers`)
4. `auxData` (aux data indexed starting at 0 [0,1,2] filled with floating point `Numbers`)
5. `stopByte` (`Number` should be `0xC0`)

The power of this module is in using the sample emitter, to be provided with samples to do with as you wish.

To get a 'sample' event, you need to:
-------------------------------------
1. Call `.connect(serialPortName)`
2. Install the 'ready' event emitter on resolved promise
3. In callback for 'ready' emitter, call `streamStart()`
4. Install the 'sample' event emitter
```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.connect(portName).then(function(boardSerial) {
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

To start the simulator test samples:
----------
1. Call `.simulatorStart()`
2. Install the 'ready' event emitter on resolved promise
3. In callback for 'ready' emitter, call `streamStart()`
4. Install the 'sample' event emitter
```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.simulatorStart().then(function() {
    ourBoard.on('sample',function(sample) {
        /** Work with sample */
    });
}).catch(function(err) {
    console.log('Error [simulator]: ' + err);
});
```
To stop the simulator:
```js
ourBoard.simulatorStop()
```

Auto-finding boards
-------------------
You must have the OpenBCI board connected to the PC before trying to automatically find it.

If a port is not automatically found, then a list of ports will be returned, this would be a 
good place to present a drop down picker list to the user, so they may manually select the 
serial port name.

```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.autoFindOpenBCIBoard(function(portName,ports) {
    if(portName) {
        /** 
        * Connect to the board with portName
        * i.e. ourBoard.connect(portName).....
        */

    } else {
        /** Display list of ports */
        console.log('Port not found... check ports for other ports');
    }
});
```


##Dev Notes
Running
-------
1. Plug usb module into serial port
1. Turn OpenBCI device on
1. Type `npm start` into the terminal in the project directory

Testing
-------
```
npm test
```
