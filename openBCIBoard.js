'use strict';


var k = require('./OpenBCIConstants');
var OpenBCISample = require('./OpenBCISample');
var serialPort = require('serialport');
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
        self.moneyBuf = new Buffer('$$$');
        self.lookingForMoney = true;
        self.parser = OpenBCISample.sampleMaker(33);
        self.masterBufferMaxSize = 3300;
        self.masterBuffer = {
            buffer: new Buffer(self.masterBufferMaxSize),
            positionRead: 0,
            positionWrite: 0,
            packetsIn:0,
            packetsRead:0,
            looseBytes:0
        };

        if(connectImmediately) {
            /** Step 1:  Instaniate serialport */

            /** Step 2:  Wait for 'open' event on serialport */

            /** Step 3:  Send a soft reset */

            /** Step 4:  Wait for a '$$$' on buffer */

        }

    }

    util.inherits(OpenBCIBoard, stream.Stream);
    //OpenBCIBoard.prototype.listPorts = serialPort.listPorts;

    OpenBCIBoard.prototype.boardConnect = function(portName) {
        var self = this;

        this.connected = false;
        //this.gotMoney = false; //indicates if '$$$' was sent over port yet



        return new Promise(function(resolve,reject) {
            var boardSerial = new serialPort.SerialPort(portName, {
                baudrate: self.options.baudRate
            },function(err) {
                return Promise.reject(err);
            });
            self.serial = boardSerial;
            console.log('Serial port connected');

            console.log('0');
            boardSerial.on('data',function(data) {
                self.processBytes(data);
            });
            self.connected = true;
            boardSerial.on('open',function() {
                console.log('Serial port open!');
                setTimeout(function() {
                    console.log('Sending stop command, incase the device was left streaming...');
                    writeAndDrain(boardSerial, k.OBCIStreamStop);
                    boardSerial.flush();
                },300);
                setTimeout(function() {
                    console.log('Sending soft reset');
                    Promise.resolve(writeAndDrain(boardSerial, k.OBCIMiscSoftReset));
                    console.log("Waiting for '$$$'");
                },750);
                resolve(boardSerial);
            });
            boardSerial.on('close',function(){
                reject('Serial Port Closed!');
            });
            boardSerial.on('error',function() {
                reject('Error on serialport');
            });
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
        self.streaming = true;
        return writeAndDrain(self.serial, k.OBCIStreamStart);
    };

    /**
     * Call to stop the stream
     */
    OpenBCIBoard.prototype.streamStop = function() {
        var self = this;
        self.streaming = false;
        writeAndDrain(this.serial,k.OBCIStreamStop);
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
            console.log(data);
            for (var i = 0; i < sizeOfData - 2; i++) {
                if (self.moneyBuf.equals(data.slice(i, i + 3))) {
                    console.log('Money!');
                    self.lookingForMoney = false;
                    self.emit('ready');
                }
            }
        } else { //ready to open the serial fire hose
            // send input data to master buffer
            self.bufMerger(self,data);

            // parse the master buffer
            while(self.masterBuffer.packetsRead < self.masterBuffer.packetsIn) {
                var rawPacket = self.bufPacketStripper(self);
                //console.log(rawPacket);
                var newSample = OpenBCISample.convertPacketToSample(rawPacket);
                if(newSample) {
                    //console.log('Wow, for the first time, you actually got a packet... maybe lets check it out!');
                    self.emit('sample', newSample);
                } else {
                    console.log('Bad Packet: ' + self.badPackets);
                    self.badPackets++;
                    /*TODO: initiate messed up packet protocol, need to sync back up with good packet */
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

    OpenBCIBoard.prototype.debugSession = function() {
        if(this.badPackets > 0) {
            console.log('Dropped a total of ' + this.badPackets + ' packets.');
        }
    };

    OpenBCIBoard.prototype.bufMerger = function(self,inputBuffer) {
        try {
            var inputBufferSize = inputBuffer.byteLength;
            if (inputBufferSize > self.masterBufferMaxSize) { /** Critical error condition */
                console.log("input buffer too large...");
            } else if (inputBufferSize < (self.masterBufferMaxSize - self.masterBuffer.positionWrite)) { /**Normal*/
                // debug prints
                //     console.log('Storing input buffer of size: ' + inputBufferSize + ' to the master buffer at position: ' + self.masterBufferPositionWrite);
                //there is room in the buffer, so fill it
                inputBuffer.copy(self.masterBuffer.buffer,self.masterBuffer.positionWrite,0);
                // update the write position
                self.masterBuffer.positionWrite += inputBufferSize;
                //store the number of packets read in
                self.masterBuffer.packetsIn = Math.floor((inputBufferSize + self.masterBuffer.looseBytes) / k.OBCIPacketSize);
                // loose bytes results when there is not an even multiple of packets in the inputBuffer
                //    example: The first time this is ran there are only 68 bytes in the first call to this function
                //        therefore there are only two packets (66 bytes), these extra two bytes need to be save for the next
                //        call and be considered in the next iteration so we can keep track of how many bytes we need to read.
                self.masterBuffer.looseBytes = (inputBufferSize + self.masterBuffer.looseBytes) % k.OBCIPacketSize;
            } else { /** Wrap around condition*/
                //the new buffer cannot fit all the way into the master buffer, going to need to break it up...
                var bytesSpaceLeftInMasterBuffer = self.masterBufferMaxSize - self.masterBuffer.positionWrite;
                // fill the rest of the buffer
                inputBuffer.copy(self.masterBuffer.buffer,self.masterBuffer.positionWrite,0,bytesSpaceLeftInMasterBuffer);
                // overwrite the beginning of master buffer
                var remainingBytesToWriteToMasterBuffer = inputBufferSize - bytesSpaceLeftInMasterBuffer;
                inputBuffer.copy(self.masterBuffer.buffer,0,bytesSpaceLeftInMasterBuffer);
                //self.masterBuffer.write(inputBuffer.slice(bytesSpaceLeftInMasterBuffer,inputBufferSize),0,remainingBytesToWriteToMasterBuffer);
                //move the masterBufferPositionWrite
                self.masterBuffer.positionWrite = remainingBytesToWriteToMasterBuffer;
                // store the number of packets read
                self.masterBuffer.packetsIn = Math.floor((inputBufferSize + self.masterBuffer.looseBytes) / k.OBCIPacketSize);
                // see if statement above for exaplaintion of loose bytes
                self.masterBuffer.looseBytes = (inputBufferSize + self.masterBuffer.looseBytes) % k.OBCIPacketSize;
            }
        }
        catch (error) {
            console.log('Error: ' + error);
        }
    };

    OpenBCIBoard.prototype.bufPacketStripper = function(self) {
        try {
            // not at end of master buffer
            if(k.OBCIPacketSize < self.masterBufferMaxSize - self.masterBuffer.positionRead) {
                // extract packet
                var rawPacket = self.masterBuffer.buffer.slice(self.masterBuffer.positionRead, self.masterBuffer.positionRead + k.OBCIPacketSize);
                // move the read position pointer
                self.masterBuffer.positionRead += k.OBCIPacketSize;
                // increment packets read
                self.masterBuffer.packetsRead++;
                // return this raw packet
                return rawPacket;
            } else { //special case because we are at the end of the master buffer (must wrap)
                // calculate the space left to read from for the partial packet
                var part1Size = self.masterBufferMaxSize - self.masterBuffer.positionRead;
                // make the first part of the packet
                var part1 = self.masterBuffer.buffer.slice(self.masterBuffer.positionRead, self.masterBuffer.positionRead + part1Size);
                // reset the read position to 0
                self.masterBuffer.positionRead = 0;
                // get part 2 size
                var part2Size = k.OBCIPacketSize - part1Size;
                // get the second part
                var part2 = self.masterBuffer.buffer.slice(0, part2Size);
                // merge the two parts
                var rawPacket = Buffer.concat([part1,part2], k.OBCIPacketSize);
                // move the read position pointer
                self.masterBuffer.positionRead += part2Size;
                // increment packets read
                self.masterBuffer.packetsRead++;
                // return this raw packet
                return rawPacket;
            }
        }
        catch (error) {
            console.log('Error: ' + error);
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
        //console.log('boardSerial in [writeAndDrain]: ' + JSON.stringify(boardSerial) + ' with command ' + data);
        boardSerial.write(data,function(error,results) {
            if(results) {
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
}



//function processBytes(data) {
//    var sizeOfData = data.length;
//    //console.log(data);
//
//    console.log('Data: ' + data);
//}
