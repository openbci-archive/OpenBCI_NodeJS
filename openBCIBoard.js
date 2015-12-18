'use strict';


var k = require('./OpenBCIConstants');
var OpenBCISample = require('./OpenBCISample');
var serialPort = require('serialport');
//var SerialPort = serialPort.SerialPort;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');


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
        return new Promise(function(resolve, reject) {
            //console.log('inside the promise, board is: ' + board);
            //self.paused = false;
            self.connected = true;
            self.streaming = false;
            var moneyBuf = new Buffer('$$$');
            console.log('Attempting to open serial connection to: ' + portName + ' at baud rate: ' + self.options.baudRate);
            var boardSerial = new serialPort.SerialPort(portName, {
                baudrate: self.options.baudRate,
                parser: serialPort.parsers.raw
            });
            self.serial = boardSerial;
            boardSerial.on('open', function () {
                console.log('Successful connection to board!');
                console.log('Sending soft reset to board...');
                boardSerial.write(k.OBCIMiscSoftReset, function(error, results) {
                    if(results)
                    console.log('    Success');
                });
            });

            var temp = function (data) {
                var sizeOfData = data.length;
                console.log(data);
                for (var i = 0; i < sizeOfData - 2; i++) {
                    if (moneyBuf.equals(data.slice(i, i + 3))) {
                        console.log('Money!');
                        return true;
                        //resolve(boardSerial);
                    }
                }
            };

            boardSerial.on('data', function (data) {
                var sizeOfData =  data.length;
                //console.log('Size of data: ' + sizeOfData.toString());
                //console.log(data);
                //console.log('data recieved: ' + data);
                if (self.streaming === false) {
                    if (temp(data)) {
                        console.log('og data fired');
                        boardSerial.removeListener('data', temp);
                        boardSerial.flush(function () {
                            resolve(boardSerial);
                        });
                    }
                }

            });

            //board.serial = boardSerial;
        }).catch(function(err) {
            return Promise.reject('Error [boardConnect]' + err);
        });
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
        if(self.streaming === false) {
            console.log('Streaming: true');
            self.streaming = true;
            console.log('telling board to start streaming');
            self.serial.parser = serialPort.parsers.byteLength(33);
            writeAndDrain(self.serial, k.OBCIStreamStart);
        }
        return new Promise(function(resolve) {
            //self.serial.removeAllListners(['data']);
            //console.log(serialPort.parsers.byteLength(33) === self.serial.parser);
            self.serial.on('data', function(data) {
                //console.log('new era data recieved: ' + data);
                resolve(data);
            });
            self.serial.on('close',function() {
                console.log("Connection closed");
            });
            self.serial.on('error',function(err) {
                console.log('Error! :(' + err);
            });
            //resolve();
        }).then(OpenBCISample.convertPacketToSample).then(function(sample) {
            console.log('Got a packet!');
            return Promise.resolve(sample);
        },function(error) {
            console.log('Whoops... ' + error);
            return Promise.resolve();
        }).catch(function(err) {
            self.badPackets++;
            console.log('Dropped a packet :( -> Total Packets Dropped: ' + self.badPackets);
            return Promise.resolve(err);
        });
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
                callback();
            }
            //return false;
            //reject('unable to auto locate bci device');
        })
    };

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
        //console.log(boardSerial);
        boardSerial.write(data,function(error,results) {
            if(results) {
                console.log('Sent msg to board');
                boardSerial.drain(function() {
                    //console.log('boardSerial in writeAndDrain: ');
                    //console.log(JSON.stringify(boardSerial));
                    //resolve(boardSerial);
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

