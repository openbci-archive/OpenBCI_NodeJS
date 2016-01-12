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
        simulate: false,
        verbose: false
    };

    /**
     * Purpose: The initialization method to call first, before any other method.
     * @param options (optional) - Board optional configurations.
     *     - `baudRate` - Baud Rate, defaults to 115200. Manipulating this is allowed if
     *                      firmware on board has been previously configured.
     *     - `daisy` - Daisy chain board is connected to the OpenBCI board. (NOTE: THIS
     *                      IS IN-OP AT THIS TIME DUE TO NO ACCESS TO ACCESSORY BOARD)
     *     - `verbose` - Print out useful debugging events
     * @constructor
     * Author: AJ Keller (@pushtheworldllc)
     */
    function OpenBCIBoard(options) {
        //var self = this;
        //var args = Array.prototype.slice.call(arguments);

        options = (typeof options !== 'function') && options || {};
        var opts = {};

        stream.Stream.call(this);

        /** Configuring Options */
        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;
        opts.daisy = options.daisy || _options.daisy;
        opts.verbose = options.verbose || _options.verbose;
        // TODO: Add ability to start simulator with options
        //opts.simulate = options.simulate || options.simulate || _options.simulate;
        this.options = opts;

        /** Properties (keep alphabetical) */
        // Arrays
        this.writeOutArray = new Array(50);
        // Bools
        this.isLookingForKeyInBuffer = true;
        this.isSimulating = false;
        // Buffers
        this.masterBuffer = { // Buffer used to store bytes in and read packets from
            buffer: new Buffer(k.OBCIMasterBufferSize),
            positionRead: 0,
            positionWrite: 0,
            packetsIn:0,
            packetsRead:0,
            looseBytes:0
        };
        this.moneyBuf = new Buffer('$$$');
        this.searchingBuf = this.moneyBuf;
        // Objects
        this.writer = null;
        // Numbers
        this.badPackets = 0;
        this.bytesIn = 0;
        this.commandsToWrite = 0;
        this.sampleCount = 0;
        // Strings
        //self.portName = portName;

        //TODO: Add connect immediately functionality, suggest this to be the default...
    }

    // This allows us to use the emitter class freely outside of the module
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
    OpenBCIBoard.prototype.connect = function(portName) {
        this.connected = false;

        return new Promise((resolve,reject) => {
            var boardSerial = new serialPort.SerialPort(portName, {
                baudRate: this.options.baudRate
            },(err) => {
                reject(err);
            });
            this.serial = boardSerial;

            if(this.options.verbose) console.log('Serial port connected');

            //console.log('0');
            boardSerial.on('data',(data) => {
                this._processBytes(data);
            });
            this.connected = true;

            boardSerial.on('open',() => {
                if(this.options.verbose) console.log('Serial port open');
                setTimeout(() => {
                    if(this.options.verbose) console.log('Sending stop command, in case the device was left streaming...');
                    this.write(k.OBCIStreamStop);
                    boardSerial.flush();
                },300);
                resolve(setTimeout(() => {
                    if(this.options.verbose) console.log('Sending soft reset');
                    this.write(k.OBCIMiscSoftReset);
                    if(this.options.verbose) console.log("Waiting for '$$$'");

                },750));
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
     * Purpose: Closes the serial port
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.disconnect = function() {
        var timeout = 0;
        if (this.streaming) {
            if(this.options.verbose) console.log('stop streaming');
            this.streaming = false;
            this.write(k.OBCIStreamStop);
            timeout = 10;
        }

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if(!this.connected) reject('no board connected');
                this.serial.close(() => {
                    this.isLookingForKeyInBuffer = true;
                    resolve();
                });
            },timeout);
        });
    };


    /**
     * Purpose: Sends a start streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the connect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board will start streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStart = function() {
        this.streaming = true;
        return this.write(k.OBCIStreamStart);
    };

    /**
     * Purpose: Sends a stop streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the connect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board stopped streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStop = function() {
        this.streaming = false;
        return this.write(k.OBCIStreamStop);
    };

    /**
     * Purpose: To be able to easily write to the board but ensure that we never send a commands
     *              with less than a 10ms spacing between sends. This uses an array and pops off
     *              the entries until there are none left.
     * @param dataToWrite - Either a single character or an Array of characters
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.write = function(dataToWrite) {
        //var self = this;
        var writerFunction = () => {
            if (this.commandsToWrite > 0) {
                var command = this.writeOutArray.shift();
                this.commandsToWrite--;
                //console.log('Wrote: ' + command + ' we have ' + this.commandsToWrite + ' left to write');
                if (this.commandsToWrite === 0) {
                    this.writer = null;
                    //console.log('Finished writing, this.writer now null');
                } else {
                    this.writer = setTimeout(writerFunction,10);
                }

                writeAndDrain.call(this,command).then(() => {
                    if(this.options.verbose) console.log('write success');
                },(err) => {
                    if(this.options.verbose) console.log('write failure: ' + err);
                });
            }
        };

        return new Promise((resolve,reject) => {
            //console.log('write method called');
            if (this.serial === null || this.serial === undefined) {
                reject('Serial port not configured');
            } else {
                if (Array.isArray(dataToWrite)) { // Got an input array
                    var len = dataToWrite.length;
                    //console.log('Length of array in write: ' + len);
                    for (var i = 0; i < len; i++) {
                        this.writeOutArray[this.commandsToWrite] = dataToWrite[i];
                        this.commandsToWrite++;
                    }
                } else {
                    //console.log('not array');
                    this.writeOutArray[this.commandsToWrite] = dataToWrite;
                    this.commandsToWrite++;
                }
                if(this.writer === null || this.writer === undefined) { //there is no writer started
                    //console.log('starting writer');
                    this.writer = setTimeout(writerFunction,0);
                }
                resolve();
            }
        });
    };



    /**
     * Purpose: Sends a soft reset command to the board
     * @returns {Promise}
     * Note: The softReset command MUST be sent to the board before you can start
     *           streaming.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.softReset = function() {
        return this.write(k.OBCIMiscSoftReset);
    };

    /**
     * Purpose: To get the specified channelSettings register data from printRegisterSettings call
     * @param channelNumber - a number
     * @returns {Promise.<T>|*}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.getSettingsForChannel = function(channelNumber) {
        var self = this;

        return k.channelSettingsKeyForChannel(channelNumber).then(function(newSearchingBuffer) {
            self.searchingBuf = newSearchingBuffer;
            return self.printRegisterSettings();
        });
    };

    /**
     * Purpose: To print out the register settings to the console
     * @returns {Promise.<T>|*}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printRegisterSettings = function() {
        var self = this;
        return self.write(k.OBCIMiscQueryRegisterSettings).then(function() {
            self.isLookingForKeyInBuffer = true; //need to wait for key in
        });
    };

    /**
     * Purpose: Send a command to the board to turn a specified channel off
     * @param channelNumber
     * @returns {Promise.<T>}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOff = function(channelNumber) {
        var self = this;
        return k.commandChannelOff(channelNumber).then(function(charCommand) {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return self.write(charCommand);
        });
    };

    /**
     * Purpose: Send a command to the board to turn a specified channel on
     * @param channelNumber
     * @returns {Promise.<T>|*}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOn = function(channelNumber) {
        var self = this;
        return k.commandChannelOn(channelNumber).then(function(charCommand) {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return self.write(charCommand);
        });
    };

    /**
     * Purpose: To send a channel setting command to the board
     * @param channelNumber - Number (1-16)
     * @param powerDown - Bool (true -> OFF, false -> ON (default))
     *          turns the channel on or off
     * @param gain - Number (1,2,4,6,8,12,24(default))
     *          sets the gain for the channel
     * @param inputType - String (normal,shorted,biasMethod,mvdd,temp,testsig,biasDrp,biasDrn)
     *          selects the ADC channel input source
     * @param bias - Bool (true -> Include in bias (default), false -> remove from bias)
     *          selects to include the channel input in bias generation
     * @param srb2 - Bool (true -> Connect this input to SRB2 (default),
     *                     false -> Disconnect this input from SRB2)
     *          Select to connect (true) this channel's P input to the SRB2 pin. This closes
     *              a switch between P input and SRB2 for the given channel, and allows the
     *              P input to also remain connected to the ADC.
     * @param srb1 - Bool (true -> connect all N inputs to SRB1,
     *                     false -> Disconnect all N inputs from SRB1 (default))
     *          Select to connect (true) all channels' N inputs to SRB1. This effects all pins,
     *              and disconnects all N inputs from the ADC.
     * @returns {Promise} resolves if sent, rejects on bad input or no board
     */
    OpenBCIBoard.prototype.channelSet = function(channelNumber,powerDown,gain,inputType,bias,srb2,srb1) {
        var self = this;
        var arrayOfCommands = [];
        k.getChannelSetter(channelNumber,powerDown,gain,inputType,bias,srb2,srb1).then(function(arr) {
            arrayOfCommands = arr;
            self.write(arrayOfCommands);
        }, function(err) {
            return Promise.reject(err);
        });
    };

    /**
     * Purpose: To start simulating an open bci board
     * Note: Must be called after the constructor
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.simulatorStart = function() {
        return new Promise((resolve,reject) => {
            if(this.isSimulating) {
                // already running simulator
                reject('Simulator Already Running');
            } else {
                // start simulating
                this.isSimulating = true;
                // generateSample is a func that takes the previous sample number
                var generateSample = OpenBCISample.randomSample(this.numberOfChannels(),this.sampleRate());

                var oldSample = OpenBCISample.newSample();
                oldSample.sampleNumber = 0;
                this.simulator = setInterval(function() {
                    //console.log('Interval...');
                    var newSample = generateSample(oldSample.sampleNumber);
                    //console.log(JSON.stringify(newSample));
                    this.emit('sample',newSample);
                    oldSample = newSample;
                    resolve();
                }, 20);

            }

        });
    };

    /**
     * Purpose: To stop simulating an open bci board
     * Note: Must be called after the constructor
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.simulatorStop = function() {
        return new Promise((resolve,reject) => {
            if(this.isSimulating) {
                // stop simulating
                this.isSimulating = false;
                if(this.simulator) {
                    clearInterval(this.simulator);
                }
                resolve();
            } else {
                // no simulator to stop...
                reject('No simulator to stop!');
            }
        });
    };

    /**
     * Purpose: Get the the current sample rate is.
     * @returns {Number} The sample rate
     * Note: This is dependent on if you configured the board correctly on setup options
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sampleRate = function() {
        if(this.options.daisy) {
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
     * Purpose: Consider the '_processBytes' method to be the work horse of this
     *              entire framework. This method gets called any time there is new
     *              data coming in on the serial port. If you are familiar with the
     *              'serialport' package, then every time data is emitted, this function
     *              gets sent the input data.
     * @param data - a buffer of unknown size
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processBytes = function(data) {
        var self = this;
        var sizeOfData = data.byteLength;
        self.bytesIn += sizeOfData; // increment to keep track of how many bytes we are receiving
        if(self.isLookingForKeyInBuffer) { //in a reset state
            //console.log(data.toString());
            var sizeOfSearchBuf = self.searchingBuf.byteLength;
            for (var i = 0; i < sizeOfData - (sizeOfSearchBuf - 1); i++) {
                if (self.searchingBuf.equals(data.slice(i, i + sizeOfSearchBuf))) {
                    if (self.searchingBuf.equals(self.moneyBuf)) {
                        if(this.options.verbose) console.log('Money!');
                        self.isLookingForKeyInBuffer = false;
                        self.emit('ready');
                    } else {
                        //console.log('Found register... changing search buffer');
                        getChannelSettingsObj(data.slice(i)).then(function(channelSettingsObject) {
                            self.emit('query',channelSettingsObject);
                        }, function(err) {
                            console.log('Error: ' + err);
                        });
                        self.searchingBuf = self.moneyBuf;
                        break;
                    }
                }
            }
        } else { //ready to open the serial fire hose
            // send input data to master buffer
            self._bufMerger(self,data);

            // parse the master buffer
            while(self.masterBuffer.packetsRead < self.masterBuffer.packetsIn) {
                var rawPacket = self._bufPacketStripper(self);
                //console.log(rawPacket);
                var newSample = OpenBCISample.convertPacketToSample(rawPacket);
                if(newSample) {

                    newSample._count = self.sampleCount++;
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
     * @returns {Promise}
     */
    OpenBCIBoard.prototype.autoFindOpenBCIBoard = function() {
        var macSerialPrefix = 'usbserial-D';
        return new Promise((resolve, reject) => {
            serialPort.list((err, ports) => {
                if(err) reject(err);
                if(ports.some(port => {
                        if(port.comName.includes(macSerialPrefix)) {
                            this.portName = port.comName;
                            return true;
                        }
                    })) {
                    resolve(this.portName);
                }
                else resolve(ports);
            })
        })
    };

    /**
     * Purpose: Merge an input buffer with the master buffer. Takes into account
     *              wrapping around the master buffer if we run out of space in
     *              the master buffer. Note that if you are not reading bytes from
     *              master buffer, you will lose them if you continue to call this
     *              method due to the overwrite nature of buffers
     * @param self
     * @param inputBuffer
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._bufMerger = function(self, inputBuffer) {
        // we do a try, catch, paradigm to prevent fatal crashes while trying to read from the buffer
        try {
            var inputBufferSize = inputBuffer.byteLength;
            if (inputBufferSize > k.OBCIMasterBufferSize) { /** Critical error condition */
                console.log("input buffer too large...");
            } else if (inputBufferSize < (k.OBCIMasterBufferSize - self.masterBuffer.positionWrite)) { /**Normal*/
                // debug prints
                //     console.log('Storing input buffer of size: ' + inputBufferSize + ' to the master buffer at position: ' + self.masterBufferPositionWrite);
                //there is room in the buffer, so fill it
                inputBuffer.copy(self.masterBuffer.buffer,self.masterBuffer.positionWrite,0);
                // update the write position
                self.masterBuffer.positionWrite += inputBufferSize;
                //store the number of packets read in
                self.masterBuffer.packetsIn += Math.floor((inputBufferSize + self.masterBuffer.looseBytes) / k.OBCIPacketSize);
                //console.log('Total packets to read: '+ self.masterBuffer.packetsIn);
                // loose bytes results when there is not an even multiple of packets in the inputBuffer
                //    example: The first time this is ran there are only 68 bytes in the first call to this function
                //        therefore there are only two packets (66 bytes), these extra two bytes need to be saved for the next
                //        call and be considered in the next iteration so we can keep track of how many bytes we need to read.
                self.masterBuffer.looseBytes = (inputBufferSize + self.masterBuffer.looseBytes) % k.OBCIPacketSize;
            } else { /** Wrap around condition*/
                //console.log('We reached the end of the master buffer');
                //the new buffer cannot fit all the way into the master buffer, going to need to break it up...
                var bytesSpaceLeftInMasterBuffer = k.OBCIMasterBufferSize - self.masterBuffer.positionWrite;
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
                //console.log('Total packets to read: '+ self.masterBuffer.packetsIn);
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
    OpenBCIBoard.prototype._bufPacketStripper = function(self) {
        try {
            // not at end of master buffer
            var rawPacket;
            if(k.OBCIPacketSize < k.OBCIMasterBufferSize - self.masterBuffer.positionRead) {
                // extract packet
                rawPacket = self.masterBuffer.buffer.slice(self.masterBuffer.positionRead, self.masterBuffer.positionRead + k.OBCIPacketSize);
                // move the read position pointer
                self.masterBuffer.positionRead += k.OBCIPacketSize;
                // increment packets read
                self.masterBuffer.packetsRead++;
                // return this raw packet
                return rawPacket;
            } else { //special case because we are at the end of the master buffer (must wrap)
                // calculate the space left to read from for the partial packet
                var part1Size = k.OBCIMasterBufferSize - self.masterBuffer.positionRead;
                // make the first part of the packet
                var part1 = self.masterBuffer.buffer.slice(self.masterBuffer.positionRead, self.masterBuffer.positionRead + part1Size);
                // reset the read position to 0
                self.masterBuffer.positionRead = 0;
                // get part 2 size
                var part2Size = k.OBCIPacketSize - part1Size;
                // get the second part
                var part2 = self.masterBuffer.buffer.slice(0, part2Size);
                // merge the two parts
                rawPacket = Buffer.concat([part1,part2], k.OBCIPacketSize);
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

    /**
     * Purpose: To pretty print the info recieved on a Misc Register Query (printRegisterSettings)
     * @param channelSettingsObj
     */
    OpenBCIBoard.prototype.debugPrintChannelSettings = function(channelSettingsObj) {
        console.log('-- Channel Settings Object --');
        var powerState = 'OFF';
        if(channelSettingsObj.POWER_DOWN.toString().localeCompare('1')) {
            powerState = 'ON';
        }
        console.log('---- POWER STATE: ' + powerState);
        console.log('-- END --');
    };

    /**
     * Purpose: Quickly determine if a channel is on or off from a channelSettingObject. Most likely from a getChannelSettings call.
     * @param channelSettingsObject
     * @returns {boolean}
     */
    OpenBCIBoard.prototype.channelIsOnFromChannelSettingsObject = function(channelSettingsObject) {
        //console.log(channelSettingsObject.POWER_DOWN);
        if(channelSettingsObject.POWER_DOWN.toString().localeCompare('1')) {
            return true;
        }
        return false;
    };

    // TODO: checkConnection (py: check_connection)
    // TODO: reconnect (py: reconnect)
    // TODO: testAuto
    // TODO: getNbAUXChannels
    // TODO: printIncomingText (py: print_incomming_text)
    // TODO: warn

    factory.OpenBCIBoard = OpenBCIBoard;
    factory.OpenBCIConstants = k;
    factory.OpenBCISample = OpenBCISample;

}

util.inherits(OpenBCIFactory, EventEmitter);

module.exports = new OpenBCIFactory();

/**
 * Purpose: Should be used to send data to the board
 * @param boardSerial
 * @param data
 * @returns {Promise} if signal was able to be sent
 * Author: AJ Keller (@pushtheworldllc)
 */
function writeAndDrain(data) {
    return new Promise((resolve,reject) => {
        //console.log('boardSerial in [writeAndDrain]: ' + JSON.stringify(boardSerial) + ' with command ' + data);
        this.serial.write(data,(error,results) => {
            if(results) {
                this.serial.drain(function() {
                    resolve();
                });
            } else {
                console.log('Error [writeAndDrain]: ' + error);
                reject(error);
            }
        })
    });
}

/**
 * Purpose: To parse a given channel given output from a print registers query
 * @param rawChannelBuffer
 *          An example would be 'CH1SET 0x05, 0xFF, 1, 0, 0, 0, 0, 1, 0
 * @returns {Promise}
 * Author: AJ Keller (@pushtheworldllc)
 */
function getChannelSettingsObj(rawChannelBuffer) {
    return new Promise(function(resolve,reject) {
        if (rawChannelBuffer === undefined || rawChannelBuffer === null) {
            reject('Undefined or null channel buffer');
        }

        var channelSettingsObject = {
            CHANNEL:'0',
            POWER_DOWN:'0',
            GAIN_SET:'0',
            INPUT_TYPE_SET:'0',
            BIAS_SET:'0',
            SRB2_SET:'0',
            SRB1_SET:'0'
        };

        var bitsToSkip = 20; //CH1SET, 0x05, 0xE0 --> 20 bits
        var sizeOfData = rawChannelBuffer.byteLength;

        var objIndex = 0;
        for(var j = bitsToSkip; j < sizeOfData - 1;j+=3) { //every three bytes there is data
            switch (objIndex) {
                case 0:
                    channelSettingsObject.POWER_DOWN = rawChannelBuffer.slice(j,j+1).toString();
                    break;
                default:
                    break;
            }

            objIndex++;
        }
        resolve(channelSettingsObject);
    });
}
