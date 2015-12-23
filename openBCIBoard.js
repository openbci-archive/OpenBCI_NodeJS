'use strict';


var k = require('./OpenBCIConstants');
var OpenBCISample = require('./OpenBCISample');
var serialPort = require('serialport');
//var SerialPort = serialPort.SerialPort;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');
//require('tty').setRawMode(true);
//var stdin = process.openStdin();
//var io = require('socket.io')(80);



function OpenBCIFactory() {
    var factory = this;

    var _options = {
        baudrate: 115200,
        daisy: false,
        parser: serialPort.parsers.byteLength(33)
    };

    function OpenBCIBoard(portName,options,connectImmediately) {
        var self = this;
        var args = Array.prototype.slice.call(arguments);



        options = (typeof options !== 'function') && options || {};

        var opts = {};

        connectImmediately = (connectImmediately === undefined || connectImmediately === null) ? true : connectImmediately;

        stream.Stream.call(this);

        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;

        opts.daisy = options.daisy || options.daisy || _options.daisy;

        self.badPackets = 0;
        self.options = opts;
        self.portName = portName;
        self.moneyBuf = new Buffer('$$$');
        self.lookingForMoney = true;
        self.parser = OpenBCISample.sampleMaker(33);
        self.masterBufferMaxSize = 3300;
        self.masterBuffer = new Buffer(self.masterBufferMaxSize);
        self.masterBufferPositionRead = 0;
        self.masterBufferPositionWrite = 0;

        //stdin.on('keypress', function(chunk, key) {
        //    process.stdout.write('Get Chunk: ' + chunk + '\n');
        //    if (key && key.ctrl && key.name == 's') {
        //        if(self.serial) {
        //            console.log('Stopping stream');
        //            writeAndDrain(self.serial, k.OBCIStreamStop);
        //        }
        //    }
        //});

        if(connectImmediately) {
            /** Step 1:  Instaniate serialport */

            /** Step 2:  Wait for 'open' event on serialport */

            /** Step 3:  Send a soft reset */

            /** Step 4:  Wait for a '$$$' on buffer */

        }

    }



        //callback = callback || function(err) {
        //        if(err) {
        //            if(self._events.error) {
        //                self.emit('error', err);
        //            } else {
        //                factory.emit('error', err);
        //            }
        //        }
        //    };
        //
        //var err;
        //
        //
        //
        //if(portName === undefined || portName === null) {
        //    this.portName = autoFindOpenBCIBoard();
        //    console.log(this.portName);
        //} else {
        //    this.portName = portName;
        //}
        //if(!portName) {
        //    err = new Error('Invalid port specified: ' + portName);
        //    callback(err);
        //    return;
        //}


        //this.portName = portName;

        //this.parsers = serialPort.parsers;
        //if(connectImmediately) {
        //    process.nextTick(function() {
        //        self.boardConnect();
        //    });
        //}
    //}

    util.inherits(OpenBCIBoard, stream.Stream);
    //OpenBCIBoard.prototype.listPorts = serialPort.listPorts;

    OpenBCIBoard.prototype.boardConnect = function(portName) {
        var self = this;

        this.connected = false;
        //this.gotMoney = false; //indicates if '$$$' was sent over port yet

        var boardSerial = new serialPort.SerialPort(portName, {
            baudrate: self.options.baudRate
        },function(err) {
            return Promise.reject(err);
        });

        this.serial = boardSerial;

        return new Promise(function(resolve,reject) {
            console.log('0');
            boardSerial.on('data',function(data) {
                self.processBytes(data);
            });
            boardSerial.on('open',resolve(boardSerial));
            boardSerial.on('close',reject('Serial Port Closed!'));
            boardSerial.on('error',reject('Error on serialport'));
        }).then(function(boardSerial) {
            self.connected = true;
            console.log('taco');
            setTimeout(function() {
                console.log('Sending stop command, incase the device was left streaming...');
                writeAndDrain(boardSerial, k.OBCIStreamStop);
                boardSerial.flush();
            },250);
            setTimeout(function() {
                console.log('Sending soft reset');
                Promise.resolve(writeAndDrain(boardSerial, k.OBCIMiscSoftReset));
            },500);
        });
    };

    OpenBCIBoard.prototype.boardSoftReset = function() {
        var self = this;
        return writeAndDrain(self.serial, k.OBCIMiscSoftReset);
    };


    OpenBCIBoard.prototype.boardDisconnect = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            if(self.connected === false) { reject(Error('No open serial connection')); }
            self.serial.close(function() {
                Promise.resolve('Closed the serial connection!');
            })
        });
    };

    /**
     * Call to start a stream...
     * Returns a promise, on success, with a OpenBCISample
     */
    OpenBCIBoard.prototype.streamStart = function() {
        var self = this;

        return writeAndDrain(self.serial, k.OBCIStreamStart);
        //if(self.streaming === false) {
        //    console.log('Streaming: true');
        //    self.streaming = true;
        //    console.log('telling board to start streaming');
        //    self.serial.parser = serialPort.parsers.readline(0xC0,'hex');
        //    writeAndDrain(self.serial, k.OBCIStreamStart);
        //}
        //return new Promise(function(resolve) {
        //    //self.serial.removeAllListners(['data']);
        //    //console.log(serialPort.parsers.byteLength(33) === self.serial.parser);
        //    self.serial.on('data', function(data) {
        //        //console.log('new era data recieved: ' + data);
        //        console.log('Data length: ' + data.byteLength);
        //        resolve(data);
        //    });
        //    self.serial.on('close',function() {
        //        console.log("Connection closed");
        //    });
        //    self.serial.on('error',function(err) {
        //        console.log('Error! :(' + err);
        //    });
        //    //resolve();
        //}).then(OpenBCISample.convertPacketToSample).then(function(sample) {
        //    console.log('Got a packet!');
        //    return Promise.resolve(sample);
        //},function(error) {
        //    console.log('Whoops... ' + error);
        //    return Promise.resolve();
        //}).catch(function(err) {
        //    self.badPackets++;
        //    console.log('Dropped a packet :( -> Total Packets Dropped: ' + self.badPackets);
        //    return Promise.resolve(err);
        //});
    };

    /**
     * Call to stop the stream
     */
    OpenBCIBoard.prototype.streamStop = function() {
        if(this.streaming) {
            this.streaming = false;
            writeAndDrain(this.serial,k.OBCIStreamStop);
        }
    };
    /**
     * Call to disable the 60Hz line filter
     */
    OpenBCIBoard.prototype.filterDisable = function() {
        if(this.connected) {
            writeAndDrain(this.serial, k.OBCIFilterDisable);
        }
    };
    /**
     * Call to enable the 60Hz line filter
     */
    OpenBCIBoard.prototype.filterEnable = function() {
        if(this.connected) {
            writeAndDrain(this.serial, k.OBCIFilterEnable);
        }
    };

    OpenBCIBoard.prototype.sampleRate = function() {
        if(this.daisy) {
            return k.OBCISampleRate125;
        } else {
            return k.OBCISampleRate250;
        }
    };

    OpenBCIBoard.prototype.numberOfChannels = function() {
        if(this.daisy) {
            return k.OBCINumberOfChannelsDaisy;
        } else {
            return k.OBCINumberOfChannelsDefault;
        }
    };

    OpenBCIBoard.prototype.processBytes = function(data) {
        var self = this;
        var sizeOfData = data.byteLength;
        if(self.lookingForMoney) { //in a reset state
            for (var i = 0; i < sizeOfData - 2; i++) {
                if (self.moneyBuf.equals(data.slice(i, i + 3))) {
                    console.log('Money!');
                    self.lookingForMoney = false;
                    self.emit('ready');
                }
            }
        } else { //ready to open the serial fire hose
            if(sizeOfData < k.OBCIPacketSize) {
                /** Store to master buffer*/
            } else {

            }
            var slicer = self.parser(data);
            if(slicer !== undefined && slicer !== null) {
                if(slicer[0] === 0x0A) {
                    OpenBCISample.convertPacketToSample(slicer).then(function(sample) {
                        console.log('Wow, for the first time, you actually got a packet... maybe lets check it out!');
                        self.debugSample(sample);
                        self.emit('sample', sample);
                    }, function(err) {
                        self.badPackets++;
                    });
                }
            }
        }
    };

    OpenBCIBoard.prototype.autoFindOpenBCIBoard = function(callback) {
        var macSerialPrefix = 'usbserial-D';
        var self = this;
        serialPort.list(function(err, ports) {
            console.log('Searching for ports...');
            var foundPort = false;
            ports.forEach(function (port) {
                if (port.comName.search(macSerialPrefix) > 0) {
                    self.portName = port.comName;
                    console.log('found');
                    callback(port.comName);
                    foundPort = true;
                }
            });
            if(!foundPort) {
                callback(null,ports);
            }
            //return false;
            //reject('unable to auto locate bci device');
        })
    };

    OpenBCIBoard.prototype.debugSample = function(sample) {
        console.log('-- Sample --');
        console.log('---- Start Byte: ' + sample.startByte.toString('hex'));
        console.log('---- Sample Number: ' + sample.sampleNumber);
        for(var i = 0; i < 8; i++) {
            console.log('---- Channel Data ' + i + ': ' + sample.channelData[i]);
        }
        for(var j = 0; j < 3; j++) {
            console.log('---- Aux Data ' + j + ': ' + sample.auxData[j]);
        }
        console.log('---- Stop Byte: ' + sample.stopByte.toString('hex'));


    };

    OpenBCIBoard.prototype.debugSession = function() {
        if(this.badPackets > 0) {
            console.log('Dropped a total of ' + this.badPackets + ' packets.');
        }
    }

    // TODO: boardConnectAutomatic
    // TODO: boardCheckConnection (py: check_connection)
    // TODO: boardReconnect (py: reconnect)
    // TODO: boardTestAuto
    // TODO: getNbAUXChannels
    // TODO: printIncomingText (py: print_incomming_text)
    // TODO: printRegisterSettings (py: print)register_settings)
    // TODO: printBytesIn (py: print_bytes_in)
    // TODO: printPacketsIn (py: print_packets_in)
    // TODO: warn

    factory.OpenBCIBoard = OpenBCIBoard;

}

util.inherits(OpenBCIFactory, EventEmitter);



module.exports = new OpenBCIFactory();

/**
 * Should be used to send data to the board
 * @param boardSerial
 * @param data
 * @param callback
 */
function writeAndDrain(boardSerial,data) {
    return new Promise(function(resolve,reject) {
        //console.log('boardSerial in [writeAndDrain]: ' + JSON.stringify(boardSerial) + ' with command ' + data);
        boardSerial.write(data,function(error,results) {
            if(results) {
                console.log('Sent msg to board');
                boardSerial.drain(function() {
                    //console.log('boardSerial in writeAndDrain: ');
                    //console.log(JSON.stringify(boardSerial));
                    resolve(boardSerial);
                });
            } else {
                console.log('Error [writeAndDrain]: ' + error);
                reject(error);
            }
        })
    });
    //boardSerial.write(data, function() {
    //    boardSerial.drain(callback);
    //})
}

function bufMerger(self,buffer) {
        var inputBufferSize = buffer.byteLength;
        // If the buffer is less than the packet size,
        if(inputBufferSize < k.OBCIPacketSize) {
            if(bufferSize < (self.masterBufferMaxSize - self.masterBufferPositionWrite)) {
                //there is room in the buffer
                self.masterBuffer.write(buffer,self.masterBufferPositionWrite,inputBufferSize)
                self.masterBufferPositionWrite += inputBufferSize;
            } else {
                //the buffer cannot fill
            }
        ;
};

//function processBytes(data) {
//    var sizeOfData = data.length;
//    //console.log(data);
//
//    console.log('Data: ' + data);
//}
