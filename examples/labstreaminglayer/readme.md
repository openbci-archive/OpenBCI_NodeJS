# OpenBCI Node SDK to Lab Streaming Layer

## About

This code provides an example of how to stream OpenBCI data through the [lab streaming layer](https://github.com/sccn/labstreaminglayer) using the NodeJS SDK.

Follow the steps in this README to start streaming. The code is ready to run as-is, but can be modified and extended to customize how you are sending your data. This is designed to be used with the **OpenBCI Cyton** (for **Ganglion support**, see the [Ganglion Node SDK](https://github.com/OpenBCI/OpenBCI_NodeJS_Ganglion/tree/master/examples/labstreaminglayer)).

## Prerequisites

* [Python](https://www.python.org/downloads/)
* [ZeroMQ](http://zeromq.org/bindings:python)

  ```py
  pip install pyzmq
  ```
* [Node.js LTS](https://nodejs.org/en/)
* [Lab Streaming Layer](https://github.com/sccn/labstreaminglayer)

  ```py
   pip install pylsl
  ```


## Installation
First, install Python dependencies:
```bash
python setup.py install
```
Next, install NodeJS dependencies:
```bash
npm install
```
Note: depending on your computer settings, you may need to run as administrator or with `sudo`.

## Running
```
npm start
```
For running just the node, for example if you were running the python in a separate ide and debugging, it's useful.
```python
npm run start-node
```
Note: depending on your computer settings, you may need to run as administrator or with `sudo`.

## Writing Lab Streaming Layer Code
If you would like to use lab streaming layer in a custom OpenBCI NodeJS application, you must include an instance of the OpenBCI NodeJS library and an instance of a Python interface. A basic example is shown below:

index.js
```js
var OpenBCIBoard = require('openbci').OpenBCIBoard;
var portPub = 'tcp://127.0.0.1:3004';
var zmq = require('zmq-prebuilt');
var socket = zmq.socket('pair');
var ourBoard = new OpenBCIBoard();

socket.bind(portPub);

ourBoard.autoFindOpenBCIBoard().then(portName => {
  if (portName) {
    ourBoard.connect(portName) // Port name is a serial port name, see `.listPorts()`
      .then(() => {
        ourBoard.on('ready',() => {
          ourBoard.streamStart();
          ourBoard.on('sample',(sample) => {
              if (socket) {
                socket.send(JSON.stringify({message: sample}));
              }
            }
          });
        });
      });
  } else {
    console.log('Unable to auto find OpenBCI board');
  }
});

/* Insert additional exit handlers and cleanup below*/
```

handoff.py
```python
import json
import zmq
from pylsl import StreamInfo, StreamOutlet

# Create ZMQ socket
context = zmq.Context()
_socket = context.socket(zmq.PAIR)
_socket.connect("tcp://localhost:3004")

# Create a new labstreaminglayer outlet
numChans = 8;
sampleRate = 250;
info = StreamInfo('OpenBCI_EEG', 'EEG', numChans, sampleRate, 'float32', 'openbci_12345')
outlet = StreamOutlet(info)
# Stream incoming data to LSL
while True:
    msg = _socket.recv()
    try:
        dicty = json.loads(msg)
        message = dicty.get('message')
        data=message.get('channelData')
        timeStamp = message.get('timeStamp')
        outlet.push_sample(data,timeStamp)
    except BaseException as e:
        print(e)
```

## Contributing
Please PR if you have code to contribute!
