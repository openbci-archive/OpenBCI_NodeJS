[![Stories in Ready](https://badge.waffle.io/OpenBCI/openbci-js-sdk.png?label=ready&title=Ready)](https://waffle.io/OpenBCI/openbci-js-sdk)
# openbci-sdk

[![Join the chat at https://gitter.im/OpenBCI/openbci-js-sdk](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/OpenBCI/openbci-js-sdk?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
An NPM module for OpenBCI

#Interacting With The Module

To Use
------

Initializing the board:

```js
var OpenBCIBoard = require('openbci-skd');
var ourBoard = new OpenBCIBoard.OpenBCIBoard();
```

ready event
----------

You MUST wait for the ready event to be emitted before streaming/talking with the board. The ready happens asynchronously 
so installing the 'sample' listener and writing before the ready event might result in... nothing at all.

Assuming you are connected to a serial console, you would for example:

```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.boardConnect(portName).then(function(boardSerial) {
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

Auto-finding
------------

You must have the OpenBCI board connected to the PC before trying to automatically find it.
```js
var ourBoard = new require('openbci-sdk').OpenBCIBoard();
ourBoard.autoFindOpenBCIBoard(function(portName,ports) {
    if(portName) {
        /** 
        * Connect to the board with portName
        * i.e. ourBoard.boardConnect().....
        */

    } else {
        /** Display list of ports */
        console.log('Port not found... check ports for other ports');
    }
});
```


#Dev Notes
Running
-------
1. Plug usb module into serial port
2. Turn OpenBCI device on
3. Type `npm start` into the terminal in the enclosed folder

Testing
-------
```
npm test
```
