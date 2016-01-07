'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');
var serialPort = require('serialport');
var openBCISample;
try { // Perform voodoo magic
    openBCISample = require('./openBCISample');
} catch (e) {
    openBCISample = require(__dirname + '/../node_modules/openbci-sdk/openBCISample');
}
var k = openBCISample.k;


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
        this.writeOutArray = new Array(100);
        // Bools
        this.isCalculatingImpedance = false;
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
        this.commandsToWrite = 0;
        // Strings

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
                this.connected = false;
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

    // TODO: Write unit test for .write() function
    /**
     * Purpose: To be able to easily write to the board but ensure that we never send a commands
     *              with less than a 10ms spacing between sends. This uses an array and pops off
     *              the entries until there are none left.
     * @param dataToWrite - Either a single character or an Array of characters
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.write = function(dataToWrite) {
        var writerFunction = () => {
            if (this.commandsToWrite > 0) {
                var command = this.writeOutArray.shift();
                this.commandsToWrite--;
                //console.log('Wrote: ' + command + ' we have ' + this.commandsToWrite + ' left to write');
                if (this.commandsToWrite === 0) {
                    this.writer = null;
                    //console.log('Finished writing, this.writer now null');
                } else {
                    this.writer = setTimeout(writerFunction,k.OBCIWriteIntervalDelayMS);
                }
                if(this.options.verbose) console.log('Sending ' + command + ' to board!');
                writeAndDrain.call(this,command).then(() => {
                    //if(this.options.verbose) console.log('write success');
                },(err) => {
                    if(this.options.verbose) console.log('write failure: ' + err);
                });
            } else {
                if(this.options.verbose) console.log('Big problem! Writer started with no commands to write');
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
                    console.log('Adding ' + dataToWrite + ' to the write queue');
                    this.writeOutArray[this.commandsToWrite] = dataToWrite;
                    this.commandsToWrite++;
                }
                if(this.writer === null || this.writer === undefined) { //there is no writer started
                    console.log('starting writer');
                    this.writer = setTimeout(writerFunction,k.OBCIWriteIntervalDelayMS);
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

        return k.channelSettingsKeyForChannel(channelNumber).then((newSearchingBuffer) => {
            this.searchingBuf = newSearchingBuffer;
            return this.printRegisterSettings();
        });
    };

    /**
     * Purpose: To print out the register settings to the console
     * @returns {Promise.<T>|*}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printRegisterSettings = function() {
        return this.write(k.OBCIMiscQueryRegisterSettings).then(() => {
            this.isLookingForKeyInBuffer = true; //need to wait for key in
        });
    };

    /**
     * Purpose: Send a command to the board to turn a specified channel off
     * @param channelNumber
     * @returns {Promise.<T>}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOff = function(channelNumber) {
        return k.commandChannelOff(channelNumber).then((charCommand) => {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return this.write(charCommand);
        });
    };

    /**
     * Purpose: Send a command to the board to turn a specified channel on
     * @param channelNumber
     * @returns {Promise.<T>|*}
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOn = function(channelNumber) {
        return k.commandChannelOn(channelNumber).then((charCommand) => {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return this.write(charCommand);
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
        var arrayOfCommands = [];
        k.getChannelSetter(channelNumber,powerDown,gain,inputType,bias,srb2,srb1).then((arr) => {
            arrayOfCommands = arr;
            this.write(arrayOfCommands);
        }, function(err) {
            return Promise.reject(err);
        });
    };

    /**
     * Purpose: To apply test signals to the channels on the OpenBCI board used to test for impedance.
     * @returns {Promise} - Fulfilled once all the test commands are sent to the board.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestStartAll = function() {
        return new Promise((resolve, reject) => {
            if(!this.connected) reject('Must be connected');

            //console.log('is going to start calculating');

            if(this.options.daisy) {
                // TODO: Do something different for daisy probably, just saying
                reject('Not setup to measure impedance on daisy board.')
            } else {
                if (this.verbose) console.log('Sending impedance start commands!');

                var delayInMS = 0;
                // Apply test signals
                for(var i = 1; i <= k.OBCINumberOfChannelsDefault; i++) {
                    k.getImpedanceSetter(i,true,true).then((commandsArray) => {
                        // Good thing we wrote the write array to stack commands :D (*wipes dirt off shoulder*)
                        this.write(commandsArray);
                        delayInMS += commandsArray.length * k.OBCIWriteIntervalDelayMS;
                    });
                }
                delayInMS += this.commandsToWrite * k.OBCIWriteIntervalDelayMS; // Account for commands waiting to be sent in the write buffer
                setTimeout(() => {
                    resolve();
                    this.impedanceTestCalculatingStart();
                }, delayInMS); // Prevents emitting .impedanceArray before all setting commands have been applied
            }
        });
    };

    /**
     * Purpose: To stop calculating impedance's for the board.
     * @returns {Promise} - Fulfilled once all the test commands are sent to the board.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestStopAll = function() {
        return new Promise((resolve, reject) => {
            if(!this.connected) reject('Must be connected');

            this.impedanceTestCalculatingStop();

            if(this.options.daisy) {
                // TODO: Do something different for daisy probably, just saying
            } else {
                // Apply test signals
                for(var i = 1; i <= k.OBCINumberOfChannelsDefault; i++) {
                    k.getImpedanceSetter(i,false,false).then((commandsArray) => {
                        // Good thing we wrote the write array to stack commands :D (*wipes dirt off shoulder*)
                        this.write(commandsArray);
                    });
                }
                resolve();
            }
        });
    };

    /**
     * Purpose: To apply the impedance test signal to an input for any given channel
     * @param channelNumber -  Number - The channel you want to test
     * @param pInput - BOOL - True if you want to apply the test signal to the P input, false to not apply the test signal.
     * @param nInput - BOOL - True if you want to apply the test signal to the N input, false to not apply the test signal.
     * @returns {Promise}
     */
    OpenBCIBoard.prototype.impedanceTestStartChannel = function(channelNumber,pInput,nInput) {
        return new Promise((resolve,reject) => {
            if(!this.connected) reject('Must be connected');

            var delayInMS = 0;

            k.getImpedanceSetter(channelNumber,pInput,nInput).then((commandsArray) => {
                this.write(commandsArray);
                delayInMS += commandsArray.length * k.OBCIWriteIntervalDelayMS;
            }, (err) => {
                reject(err);
            });
            delayInMS += this.commandsToWrite * k.OBCIWriteIntervalDelayMS; // Account for commands waiting to be sent in the write buffer
            setTimeout(() => {
                if(!this.isCalculatingImpedance) this.impedanceTestCalculatingStart();
                resolve();
            }, delayInMS); // Prevents emitting .impedanceArray before all setting commands have been applied

        });
    };

    /**
     * Purpose: To stop applying test signals for a given channel number.
     * Note: Call .impedanceTestCalculatingStop() when finished applying your test signals.
     * @param channelNumber
     * @returns {Promise} - Fulfilled when all commands are send to the board, rejects on error.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestStopChannel = function(channelNumber) {
        return new Promise((resolve,reject) => {
            if(!this.connected) reject('Must be connected');

            k.getImpedanceSetter(channelNumber,false,false).then((commandsArray) => {
                this.write(commandsArray);
                resolve();
            }, (err) => {
                reject(err);
            });
        });
    };

    /**
     * Purpose: To start calculating impedance's every time there is a new sample.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestCalculatingStart = function() {
        this.isCalculatingImpedance = true;
    };

    /**
     * Purpose: To stop calculating impedance's every time there is a new sample.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestCalculatingStop = function() {
        this.isCalculatingImpedance = false;
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
                var generateSample = openBCISample.randomSample(this.numberOfChannels(),this.sampleRate());

                var oldSample = openBCISample.newSample();
                oldSample.sampleNumber = 0;
                this.simulator = setInterval(() => {
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
        if(this.options.daisy) {
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
        var sizeOfData = data.byteLength;
        this.bytesIn += sizeOfData; // increment to keep track of how many bytes we are receiving
        if(this.isLookingForKeyInBuffer) { //in a reset state
            //console.log(data.toString());
            var sizeOfSearchBuf = this.searchingBuf.byteLength;
            for (var i = 0; i < sizeOfData - (sizeOfSearchBuf - 1); i++) {
                if (this.searchingBuf.equals(data.slice(i, i + sizeOfSearchBuf))) {
                    if (this.searchingBuf.equals(this.moneyBuf)) {
                        if(this.options.verbose) console.log('Money!');
                        this.isLookingForKeyInBuffer = false;
                        this.emit('ready');
                    } else {
                        //console.log('Found register... changing search buffer');
                        getChannelSettingsObj(data.slice(i)).then((channelSettingsObject) => {
                            this.emit('query',channelSettingsObject);
                        }, (err) => {
                            console.log('Error: ' + err);
                        });
                        this.searchingBuf = this.moneyBuf;
                        break;
                    }
                }
            }
        } else { //ready to open the serial fire hose
            // send input data to master buffer
            this._bufMerger(data);

            // parse the master buffer
            while(this.masterBuffer.packetsRead < this.masterBuffer.packetsIn) {
                var rawPacket = this._bufPacketStripper();
                //console.log(rawPacket);
                var newSample = openBCISample.convertPacketToSample(rawPacket);
                if(newSample) {
                    newSample._count = this.sampleCount++;

                    if(this.isCalculatingImpedance) {
                        openBCISample.impedanceCalculation(newSample).then((updatedSampleObject) => {
                            this.emit('sample', updatedSampleObject);
                        }, (err) => {
                            this.emit('sample', newSample);
                            console.log('Error [impedanceCalculation]: ' + err);
                        });
                    } else {
                        this.emit('sample', newSample);
                    }

                } else {
                    console.log('Bad Packet: ' + this.badPackets);
                    this.badPackets++;
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
     * @param inputBuffer
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._bufMerger = function(inputBuffer) {
        // we do a try, catch, paradigm to prevent fatal crashes while trying to read from the buffer
        try {
            var inputBufferSize = inputBuffer.byteLength;
            if (inputBufferSize > k.OBCIMasterBufferSize) { /** Critical error condition */
                console.log("input buffer too large...");
            } else if (inputBufferSize < (k.OBCIMasterBufferSize - this.masterBuffer.positionWrite)) { /**Normal*/
                // debug prints
                //     console.log('Storing input buffer of size: ' + inputBufferSize + ' to the master buffer at position: ' + this.masterBufferPositionWrite);
                //there is room in the buffer, so fill it
                inputBuffer.copy(this.masterBuffer.buffer,this.masterBuffer.positionWrite,0);
                // update the write position
                this.masterBuffer.positionWrite += inputBufferSize;
                //store the number of packets read in
                this.masterBuffer.packetsIn += Math.floor((inputBufferSize + this.masterBuffer.looseBytes) / k.OBCIPacketSize);
                //console.log('Total packets to read: '+ this.masterBuffer.packetsIn);
                // loose bytes results when there is not an even multiple of packets in the inputBuffer
                //    example: The first time this is ran there are only 68 bytes in the first call to this function
                //        therefore there are only two packets (66 bytes), these extra two bytes need to be saved for the next
                //        call and be considered in the next iteration so we can keep track of how many bytes we need to read.
                this.masterBuffer.looseBytes = (inputBufferSize + this.masterBuffer.looseBytes) % k.OBCIPacketSize;
            } else { /** Wrap around condition*/
                //console.log('We reached the end of the master buffer');
                //the new buffer cannot fit all the way into the master buffer, going to need to break it up...
                var bytesSpaceLeftInMasterBuffer = k.OBCIMasterBufferSize - this.masterBuffer.positionWrite;
                // fill the rest of the buffer
                inputBuffer.copy(this.masterBuffer.buffer,this.masterBuffer.positionWrite,0,bytesSpaceLeftInMasterBuffer);
                // overwrite the beginning of master buffer
                var remainingBytesToWriteToMasterBuffer = inputBufferSize - bytesSpaceLeftInMasterBuffer;
                inputBuffer.copy(this.masterBuffer.buffer,0,bytesSpaceLeftInMasterBuffer);
                //this.masterBuffer.write(inputBuffer.slice(bytesSpaceLeftInMasterBuffer,inputBufferSize),0,remainingBytesToWriteToMasterBuffer);
                //move the masterBufferPositionWrite
                this.masterBuffer.positionWrite = remainingBytesToWriteToMasterBuffer;
                // store the number of packets read
                this.masterBuffer.packetsIn += Math.floor((inputBufferSize + this.masterBuffer.looseBytes) / k.OBCIPacketSize);
                //console.log('Total packets to read: '+ this.masterBuffer.packetsIn);
                // see if statement above for explanation of loose bytes
                this.masterBuffer.looseBytes = (inputBufferSize + this.masterBuffer.looseBytes) % k.OBCIPacketSize;
            }
        }
        catch (error) {
            console.log('Error: ' + error);
        }
    };

    /**
     * Purpose: Strip packets from the master buffer
     * @returns {Buffer} A buffer containing a packet of 33 bytes long, ready to be read.
     * Author: AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._bufPacketStripper = function() {
        try {
            // not at end of master buffer
            var rawPacket;
            if(k.OBCIPacketSize < k.OBCIMasterBufferSize - this.masterBuffer.positionRead) {
                // extract packet
                rawPacket = this.masterBuffer.buffer.slice(this.masterBuffer.positionRead, this.masterBuffer.positionRead + k.OBCIPacketSize);
                // move the read position pointer
                this.masterBuffer.positionRead += k.OBCIPacketSize;
                // increment packets read
                this.masterBuffer.packetsRead++;
                // return this raw packet
                return rawPacket;
            } else { //special case because we are at the end of the master buffer (must wrap)
                // calculate the space left to read from for the partial packet
                var part1Size = k.OBCIMasterBufferSize - this.masterBuffer.positionRead;
                // make the first part of the packet
                var part1 = this.masterBuffer.buffer.slice(this.masterBuffer.positionRead, this.masterBuffer.positionRead + part1Size);
                // reset the read position to 0
                this.masterBuffer.positionRead = 0;
                // get part 2 size
                var part2Size = k.OBCIPacketSize - part1Size;
                // get the second part
                var part2 = this.masterBuffer.buffer.slice(0, part2Size);
                // merge the two parts
                rawPacket = Buffer.concat([part1,part2], k.OBCIPacketSize);
                // move the read position pointer
                this.masterBuffer.positionRead += part2Size;
                // increment packets read
                this.masterBuffer.packetsRead++;
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
        if(this.badPackets > 1) {
            console.log('Dropped a total of ' + this.badPackets + ' packets.');
        } else if (this.badPackets === 1) {
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
        if(this.bytesIn > 1) {
            console.log('Read in ' + this.bytesIn + ' bytes.');
        } else if (this.bytesIn === 1) {
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
        if(this.masterBuffer.packetsRead > 1) {
            console.log('Read ' + this.masterBuffer.packetsRead + ' packets.');
        } else if (this.masterBuffer.packetsIn === 1) {
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
        this.printBytesIn();
        this.printPacketsRead();
        this.printPacketsBad();
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
    factory.OpenBCISample = openBCISample;

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
