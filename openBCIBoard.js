'use strict';


var k = require('./OpenBCIConstants');
var OpenBCISample = require('./OpenBCISample');
var serialPort = require('serialport');
var SerialPort = serialPort.SerialPort;
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');


function OpenBCIFactory() {
    var factory = this;

    var _options = {
        baudrate: 115200,
        daisy: false
    };

    function OpenBCIBoard(portName,options,connectImmediately,callback) {
        var self = this;

        var args = Array.prototype.slice.call(arguments);

        // Get callback
        callback = args.pop();

        if (typeof (callback) !== 'function') {
            callback = null;
        }
        options = (typeof options !== 'function') && options || {};

        var opts = {};

        connectImmediately = (connectImmediately === undefined || connectImmediately === null) ? true : connectImmediately;

        stream.Stream.call(this);

        //callback = callback || function(err) {
        //        if(err) {
        //            if(self._events.error) {
        //                self.emit('error', err);
        //            } else {
        //                factory.emit('error', err);
        //            }
        //        }
        //    };

        var err;

        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;

        opts.daisy = options.daisy || options.daisy || _options.daisy;

        if(!portName) {
            err = new Error('Invalid port specified: ' + portName);
            callback(err);
            return;
        }
        this.badPackets = 0;
        this.options = opts;
        this.portName = portName;
        this.serialPort = serialPort;
        this.parsers = serialPort.parsers;
        //if(connectImmediately) {
        //    process.nextTick(function() {
        //        self.boardConnect(callback);
        //    });
        //}
    }

    util.inherits(OpenBCIBoard, stream.Stream);
    //OpenBCIBoard.prototype.listPorts = serialPort.listPorts;

    OpenBCIBoard.prototype.boardConnect = function() {
        var self = this;
        return new Promise(function(resolve, reject) {
            self.paused = false;
            self.connected = true;
            console.log('Attempting to open serial connection to: ' + self.portName);
            var boardSerial = new self.serialPort.SerialPort(self.portName, {
                baudrate: self.baudrate,
                parser: self.parsers.byteLength(33)
            });
            self.serial = boardSerial;
            boardSerial.on('open',function() {
                console.log('Successful connection to board!');
                resolve(boardSerial);
            });
            boardSerial.on('error',function(err) {
                console.log('Error! :(');
                reject(err);
            });
        }).then(function(boardSerial) {
            console.log('soft reset');
            return writeAndDrain(boardSerial, k.OBCIMiscSoftReset);
        }).catch(function(err) {
            return Promise.reject(err);
        });


        //var promise = new Promise(function(resolve, reject) {
        //    boardSerial.on('open',resolve);
        //    boardSerial.on('close', reject);
        //});
        //
        //boardSerial.on('data',onData).on('error',onErr);
        //return promise;
        //return new Promise(function(resolve,reject) {
        //
        //
        //    boardSerial.on('open', function() {
        //        console.log('open');
        //        self.connected = true;
        //    });
        //    boardSerial.on('close', function() {
        //        self.connected = false;
        //        self.emit('disconnected');
        //        console.log('serial connection closed');
        //    });
        //
        //
        //    resolve(boardSerial);
        //
        //});
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
        return new Promise(function(resolve,reject) {
            self.serial.on('data', function(data) {
                resolve(data);
            });
            self.serial.on('close',function() {
                console.log("Connection closed");
            });
            resolve();
        }).then(function(data) {
            if((self.connected === true) && (self.streaming === false)) {
                writeAndDrain(self.serial, k.OBCIStreamStart);
            }
            return Promise.resolve(data);
        }).then(OpenBCISample.convertPacketToSample).then(function(sample) {
            console.log('Got a packet!');
            return Promise.resolve(sample);
        }).catch(function(err) {
            self.badPackets++;
            console.log('Dropped a packet :( -> Total Packets Dropped: ' + self.badPackets);
            return Promise.reject(err);
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
        boardSerial.write(data,function(error,results) {
            if(results) {
                console.log('Sent msg to board');
                resolve(boardSerial.drain());
            } else {
                reject(error);
            }
        })
    });
    //boardSerial.write(data, function() {
    //    boardSerial.drain(callback);
    //})
}


