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
        daisy: false
    };

    /**
     * Purpose: The initialization method to call first, before any other method.
     * Author: AJ Keller (@pushtheworldllc)
     */
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
        self.bytesIn = 0;
        self.options = opts;
        self.portName = portName;
        self.moneyBuf = new Buffer('$$$');
        self.lookingForMoney = true;
        self.masterBufferMaxSize = 3300;
        // Buffer used to store bytes in and read packets from
        self.masterBuffer = {
            buffer: new Buffer(self.masterBufferMaxSize),
            positionRead: 0,
            positionWrite: 0,
            packetsIn:0,
            packetsRead:0,
            looseBytes:0
        };

        //TODO: Add connect immediately functionality, suggest this to be the default...
        if(connectImmediately) {
            /** Step 1:  Instaniate serialport */

            /** Step 2:  Wait for 'open' event on serialport */

            /** Step 3:  Send a soft reset */

            /** Step 4:  Wait for a '$$$' on buffer */

        }

    }

    // This allows use to use the emitter class so freely in the index.js method
    util.inherits(OpenBCIBoard, stream.Stream);

    /**
     * Purpose: The essential precursor method to be called initially to establish a
     *              serial connection to the OpenBCI board.
     * @param portName - a string that contains the port name of the OpenBCIBoard.
     * @returns {Promise} if the board was able to connect. If at any time the serial port
     *              closes or errors then this promise will be rejected, and this should be
     *              observed and taken care of in the most front facing user methods.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.boardConnect = function(portName) {
        var self = this;

        this.connected = false;

        return new Promise(function(resolve,reject) {
            var boardSerial = new serialPort.SerialPort(portName, {
                baudrate: self.options.baudRate
            },function(err) {
                return Promise.reject(err);
            });
            self.serial = boardSerial;
            console.log('Serial port connected');

            //console.log('0');
            boardSerial.on('data',function(data) {
                self.processBytes(data);
            });
            self.connected = true;
            boardSerial.on('open',function() {
                console.log('Serial port open!');
                setTimeout(function() {
                    console.log('Sending stop command, in case the device was left streaming...');
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

    /**
     * Purpose: Sends a soft reset command to the board
     * @returns {Promise}
     * Note: The softReset command MUST be sent to the board before you can start
     *           streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.boardSoftReset = function() {
        var self = this;
        return writeAndDrain(self.serial, k.OBCIMiscSoftReset);
    };

    /**
     * Purpose: Stops the stream and closes the serial port
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.boardDisconnect = function() {
        var self = this;
        var closingPromise = new Promise(function(resolve, reject) {
            if(self.connected === false) { reject(Error('No open serial connection')); }
            self.serial.close(function() {
                Promise.resolve('Closed the serial connection!');
            })
        });
        return self.streamStop().then(closingPromise());
    };

    /**
     * Purpose: Send a stop streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the boardConnect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board will start streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStart = function() {
        var self = this;
        self.streaming = true;
        return writeAndDrain(self.serial, k.OBCIStreamStart);
    };

    /**
     * Purpose: Send a stop streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the boardConnect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board stopped streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStop = function() {
        var self = this;
        self.streaming = false;
        return writeAndDrain(self.serial,k.OBCIStreamStop);
    };

    /**
     * Purpose: This function is used as a convenience method to determine what the current
     *              sample rate is.
     * @returns {Number} The sampe rate
     * Note: This is dependent on if you configured the board correctly on setup options
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sampleRate = function() {
        var self = this;
        if(self.options.daisy) {
            return k.OBCISampleRate125;
        } else {
            return k.OBCISampleRate250;
        }
    };

    /**
     * Purpose: This function is used as a convenience method to determine how many
     *              channels the current board is using.
     * @returns {Number} A number
     * Note: This is dependent on if you configured the board correctly on setup options
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.numberOfChannels = function() {
        var self = this;
        if(self.options.daisy) {
            return k.OBCINumberOfChannelsDaisy;
        } else {
            return k.OBCINumberOfChannelsDefault;
        }
    };

    /**
     * Purpose: Consider the 'processBytes' method to be the work horse of this
     *              entire framework. This method gets called any time there is new
     *              data coming in on the serial port. If you are familiar with the
     *              'serialport' package, then every time data is emitted, this function
     *              gets sent the input data.
     *
     * Author: AJ Keller (@pushtheworldllc)
     * @param data
     */
    OpenBCIBoard.prototype.processBytes = function(data) {
        var self = this;
        var sizeOfData = data.byteLength;
        self.bytesIn += sizeOfData; // increment to keep track of how many bytes we are receiving
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

    /**
     * Purpose: Automatically find an OpenBCI board. Returns either the name
     *              of the port of the OpenBCI board, or a list of all the ports
     *              so you can offer a drop down menu to the user to pick from!
     *
     * Note: This method is used for convenience and should be used when trying to
     *           connect to a board. If you find a case (i.e. a platform (linux,
     *           windows...) that this does not work, please open an issue and
     *           we will add support!
     *
     * Author: AJ Keller (@pushtheworldllc)
     * @param callback -> returns (portname,ports)
     */
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
                    callback(port.comName); //return the portname
                    foundPort = true;
                }
            });
            if(!foundPort) {
                callback(null,ports);
            }
        })
    };

    /**
     * Purpose: Merge an input buffer with the master buffer. Takes into account
     *              wrapping around the master buffer if we run out of space in
     *              the master buffer. Note that if you are not reading bytes from
     *              master buffer, you will lose them if you continue to call this
     *              method due to the overwrite nature of buffers
     * Author: AJ Keller (@pushtheworldllc)
     * @param self
     * @param inputBuffer
     */
    OpenBCIBoard.prototype.bufMerger = function(self,inputBuffer) {
        // we do a try, catch, paradigm to prevent fatal crashes while trying to read from the buffer
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
                self.masterBuffer.packetsIn += Math.floor((inputBufferSize + self.masterBuffer.looseBytes) / k.OBCIPacketSize);
                console.log('Total packets to read: '+ self.masterBuffer.packetsIn);
                // loose bytes results when there is not an even multiple of packets in the inputBuffer
                //    example: The first time this is ran there are only 68 bytes in the first call to this function
                //        therefore there are only two packets (66 bytes), these extra two bytes need to be saved for the next
                //        call and be considered in the next iteration so we can keep track of how many bytes we need to read.
                self.masterBuffer.looseBytes = (inputBufferSize + self.masterBuffer.looseBytes) % k.OBCIPacketSize;
            } else { /** Wrap around condition*/
                console.log('We reached the end of the master buffer');
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
                self.masterBuffer.packetsIn += Math.floor((inputBufferSize + self.masterBuffer.looseBytes) / k.OBCIPacketSize);
                console.log('Total packets to read: '+ self.masterBuffer.packetsIn);
                // see if statement above for explanation of loose bytes
                self.masterBuffer.looseBytes = (inputBufferSize + self.masterBuffer.looseBytes) % k.OBCIPacketSize;
            }
        }
        catch (error) {
            console.log('Error: ' + error);
        }
    };

    /**
     * Purpose: Strip packets from the master buffer
     * @param self - the main OpenBCIObject
     * @returns {Buffer} A buffer containing a packet of 33 bytes long, ready to be read.
     * Author: AJ Keller (@pushtheworldllc)
     */
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

    /**
     * Purpose: This prints the total number of packets that were not able to be read
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printPacketsBad = function() {
        var self = this;
        if(self.badPackets > 1) {
            console.log('Dropped a total of ' + self.badPackets + ' packets.');
        } else if (self.badPackets === 1) {
            console.log('Dropped a total of 1 packet.');
        } else {
            console.log('No packets dropped.');
        }
    };

    /**
     * Purpose: This prints the total bytes in
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printBytesIn = function() {
        var self = this;
        if(self.bytesIn > 1) {
            console.log('Read in ' + self.bytesIn + ' bytes.');
        } else if (self.bytesIn === 1) {
            console.log('Read one 1 packet in.');
        } else {
            console.log('Read no packets.');
        }
    };

    /**
     * Purpose: This prints the total number of packets that have been read
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printPacketsRead = function() {
        var self = this;
        if(self.masterBuffer.packetsRead > 1) {
            console.log('Read ' + self.masterBuffer.packetsRead + ' packets.');
        } else if (self.masterBuffer.packetsIn === 1) {
            console.log('Read 1 packet.');
        } else {
            console.log('No packets read.');
        }
    };

    /**
     * Purpose: Nice convenience method to print some session details
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.debugSession = function() {
        var self = this;
        self.printBytesIn();
        self.printPacketsRead();
        self.printPacketsBad();
    };

    // TODO: boardCheckConnection (py: check_connection)
    // TODO: boardReconnect (py: reconnect)
    // TODO: boardTestAuto
    // TODO: getNbAUXChannels
    // TODO: printIncomingText (py: print_incomming_text)
    // TODO: printRegisterSettings (py: print)register_settings)
    // TODO: warn

    factory.OpenBCIBoard = OpenBCIBoard;

}

util.inherits(OpenBCIFactory, EventEmitter);

module.exports = new OpenBCIFactory();

/**
 * Should be used to send data to the board
 * @param boardSerial
 * @param data
 * @returns {Promise} if signal was able to be sent
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