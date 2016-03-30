'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');
var serialPort = require('serialport');
var openBCISample = require('./openBCISample');
var k = openBCISample.k;
var openBCISimulator = require('./openBCISimulator');
var now = require('performance-now');
var Sntp = require('sntp');

/**
 * @description SDK for OpenBCI Board {@link www.openbci.com}
 * @module 'openbci-sdk'
 */
function OpenBCIFactory() {
    var factory = this;

    var _options = {
        boardType: k.OBCIBoardDefault,
        simulate: false,
        simulatorSampleRate: 250,
        baudrate: 115200,
        verbose: false,
        ntp: false
    };

    /**
     * @description The initialization method to call first, before any other method.
     * @param options (optional) - Board optional configurations.
     *     - `boardType` - Specifies type of OpenBCI board
     *          3 Possible Boards:
     *              `default` - 8 Channel OpenBCI board (Default)
     *              `daisy` - 8 Channel board with Daisy Module
     *                  (NOTE: THIS IS IN-OP AT THIS TIME DUE TO NO ACCESS TO ACCESSORY BOARD)
     *              `ganglion` - 4 Channel board
     *                  (NOTE: THIS IS IN-OP TIL RELEASE OF GANGLION BOARD 07/2016)
     *
     *     - `simulate` - Full functionality, just mock data.
     *
     *     - `simulatorSampleRate` - The sample rate to use for the simulator
     *                      (Default is `250`)
     *
     *     - `baudRate` - Baud Rate, defaults to 115200. Manipulating this is allowed if
     *                      firmware on board has been previously configured.
     *
     *     - `verbose` - Print out useful debugging events
     *     - `NTP` - Syncs the module up with an NTP time server. Syncs the board on startup
     *                  with the NTP time. Adds a time stamp to the AUX channels. (NOT FULLY
     *                  IMPLEMENTED) [DO NOT USE]
     * @constructor
     * @author AJ Keller (@pushtheworldllc)
     */
    function OpenBCIBoard(options) {
        //var args = Array.prototype.slice.call(arguments);

        options = (typeof options !== 'function') && options || {};
        var opts = {};

        stream.Stream.call(this);

        /** Configuring Options */
        opts.boardType = options.boardType || options.boardtype || _options.boardType;
        opts.simulate = options.simulate || _options.simulate;
        opts.simulatorSampleRate = options.simulatorSampleRate || options.simulatorsamplerate || _options.simulatorSampleRate;
        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;
        opts.verbose = options.verbose || _options.verbose;
        opts.ntp = options.NTP || options.ntp || _options.NTP;
        // Set to global options object
        this.options = opts;

        /** Properties (keep alphabetical) */
        // Arrays
        this.writeOutArray = new Array(100);
        this.channelSettingsArray = k.channelSettingsArrayInit(this.numberOfChannels());
        // Bools
        this.isLookingForKeyInBuffer = true;
        // Buffers
        this.masterBuffer = masterBufferMaker();
        this.searchBuffers = {
            timeSyncStart: new Buffer('$a$'),
            miscStop: new Buffer('$$$')
        };
        this.searchingBuf = this.searchBuffers.miscStop;
        // Objects
        this.goertzelObject = openBCISample.goertzelNewObject(this.numberOfChannels());
        this.writer = null;
        this.impedanceTest = {
            active: false,
            isTestingPInput: false,
            isTestingNInput: false,
            onChannel: 0,
            sampleNumber: 0,
            continuousMode: false
        };
        this.sync = {
            npt1: 0,
            ntp2: 0
        };
        var ntpOptions = {
            host: 'nist1-sj.ustiming.org',  // Defaults to pool.ntp.org
            port: 123,                      // Defaults to 123 (NTP)
            resolveReference: true,         // Default to false (not resolving)
            timeout: 1000                   // Defaults to zero (no timeout)
        };
        // Numbers
        this.badPackets = 0;
        this.commandsToWrite = 0;
        this.impedanceArray = openBCISample.impedanceArray(k.numberOfChannelsForBoardType(this.options.boardType));
        this.writeOutDelay = k.OBCIWriteIntervalDelayMSShort;
        // Strings

        // NTP
        if (this.options.ntp) {

        }

        //TODO: Add connect immediately functionality, suggest this to be the default...
    }

    // This allows us to use the emitter class freely outside of the module
    util.inherits(OpenBCIBoard, stream.Stream);

    /**
     * @description The essential precursor method to be called initially to establish a
     *              serial connection to the OpenBCI board.
     * @param portName - a string that contains the port name of the OpenBCIBoard.
     * @returns {Promise} if the board was able to connect.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.connect = function(portName) {
        this.connected = false;

        return new Promise((resolve,reject) => {
            // If we are simulating, set boardSerial to fake name
            var boardSerial;
            /* istanbul ignore else */
            if (this.options.simulate || portName === k.OBCISimulatorPortName) {
                this.options.simulate = true;
                if (this.options.verbose) console.log('using faux board ' + portName);
                boardSerial = new openBCISimulator.OpenBCISimulator(portName, {
                    verbose: this.options.verbose,
                    sampleRate: this.options.simulatorSampleRate
                });
            } else {
                /* istanbul ignore if */
                if (this.options.verbose) console.log('using real board ' + portName);
                boardSerial = new serialPort.SerialPort(portName, {
                    baudRate: this.options.baudRate
                },(err) => {
                    if (err) reject(err);
                });
            }

            this.serial = boardSerial;

            if(this.options.verbose) console.log('Serial port connected');

            boardSerial.on('data',(data) => {
                this._processBytes(data);
            });
            this.connected = true;


            boardSerial.on('open',() => {
                var timeoutLength = this.options.simulate ? 50 : 300;
                if(this.options.verbose) console.log('Serial port open');
                setTimeout(() => {
                    if(this.options.verbose) console.log('Sending stop command, in case the device was left streaming...');
                    this.write(k.OBCIStreamStop);
                    if (this.serial) this.serial.flush();
                },timeoutLength);
                setTimeout(() => {
                    if(this.options.verbose) console.log('Sending soft reset');
                    this.softReset();
                    resolve();
                    if(this.options.verbose) console.log("Waiting for '$$$'");

                },timeoutLength + 250);
            });
            boardSerial.on('close',() => {
                if (this.options.verbose) console.log('Serial Port Closed');
                this.emit('close')
            });
            /* istanbul ignore next */
            boardSerial.on('error',(err) => {
                if (this.options.verbose) console.log('Serial Port Error');
                this.emit('error',err);
            });
        });
    };

    /**
     * @description Closes the serial port
     * @returns {Promise} - fulfilled by a successful close of the serial port object, rejected otherwise.
     * @author AJ Keller (@pushtheworldllc)
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
                if (this.serial) {
                    this.serial.close(() => {
                        this.isLookingForKeyInBuffer = true;
                        resolve();
                    });
                } else {
                    this.isLookingForKeyInBuffer = true;
                    resolve();
                }

            },timeout);
        });
    };


    /**
     * @description Sends a start streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the connect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board will start streaming.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStart = function() {
        return new Promise((resolve, reject) => {
            console.log('got here');
            if(this.streaming) reject('Error [.streamStart()]: Already streaming');
            this.streaming = true;
            this._reset();
            this.write(k.OBCIStreamStart)
                .then(resolve)
                .catch(err => reject(err));
        });
    };

    /**
     * @description Sends a stop streaming command to the board.
     * @returns {Promise} indicating if the signal was able to be sent.
     * Note: You must have successfully connected to an OpenBCI board using the connect
     *           method. Just because the signal was able to be sent to the board, does not
     *           mean the board stopped streaming.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.streamStop = function() {
        return new Promise((resolve,reject) => {
            if(!this.streaming) reject('Error [.streamStop()]: No stream to stop');
            this.streaming = false;
            this.write(k.OBCIStreamStop)
                .then(resolve)
                .catch(err => reject(err));
        });
    };

    /**
     * @description To start simulating an open bci board
     * Note: Must be called after the constructor
     * @returns {Promise} - Fulfilled if able to enter simulate mode, reject if not.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.simulatorEnable = function() {
        return new Promise((resolve,reject) => {
            if (this.options.simulate) reject('Already simulating'); // Are we already in simulate mode?
            if (this.connected) {
                this.disconnect() // disconnect first
                    .then(() => {
                        this.options.simulate = true;
                        resolve();
                    })
                    .catch(err => reject(err));
            } else {
                this.options.simulate = true;
                resolve();
            }
        });
    };

    /**
     * @description To stop simulating an open bci board
     * Note: Must be called after the constructor
     * @returns {Promise} - Fulfilled if able to stop simulate mode, reject if not.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.simulatorDisable = function() {
        return new Promise((resolve,reject) => {
            if (!this.options.simulate) reject('Not simulating'); // Are we already not in simulate mode?
            if (this.connected) {
                this.disconnect()
                    .then(() => {
                        this.options.simulate = false;
                        resolve();
                    })
                    .catch(err => reject(err));
            } else {
                this.options.simulate = false;
                resolve();
            }
        });
    };

    /**
     * @description To be able to easily write to the board but ensure that we never send a commands
     *              with less than a 10ms spacing between sends. This uses an array and pops off
     *              the entries until there are none left.
     * @param dataToWrite - Either a single character or an Array of characters
     * @returns {Promise}
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.write = function(dataToWrite) {
        var writerFunction = () => {
            /* istanbul ignore else */
            if (this.commandsToWrite > 0) {
                var command = this.writeOutArray.shift();
                this.commandsToWrite--;
                if (this.commandsToWrite === 0) {
                    this.writer = null;
                } else {
                    this.writer = setTimeout(writerFunction,this.writeOutDelay);
                }
                this._writeAndDrain.call(this,command)
                    .catch(err => {
                        /* istanbul ignore if */
                        if(this.options.verbose) console.log('write failure: ' + err);
                    });
            } else {
                if(this.options.verbose) console.log('Big problem! Writer started with no commands to write');
            }
        };

        return new Promise((resolve,reject) => {
            //console.log('write method called');
            if (!this.connected) reject('not connected');
            if (this.serial === null || this.serial === undefined) {
                reject('Serial port not configured');
            } else {
                var cmd = '';
                if (Array.isArray(dataToWrite)) { // Got an input array
                    var len = dataToWrite.length;
                    cmd = dataToWrite[0];
                    for (var i = 0; i < len; i++) {
                        this.writeOutArray[this.commandsToWrite] = dataToWrite[i];
                        this.commandsToWrite++;
                    }
                } else {
                    cmd = dataToWrite;
                    this.writeOutArray[this.commandsToWrite] = dataToWrite;
                    this.commandsToWrite++;
                }
                if(this.writer === null || this.writer === undefined) { //there is no writer started
                    this.writer = setTimeout(writerFunction,this.writeOutDelay);
                }
                console.log('resolveing');
                resolve();
            }
        });
    };

    /**
     * @description Should be used to send data to the board
     * @param data
     * @returns {Promise} if signal was able to be sent
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._writeAndDrain = function(data) {
        return new Promise((resolve,reject) => {
            console.log('writing command ' + data);
            if(!this.serial) reject('Serial port not open');
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
    };

    /**
     * @description Automatically find an OpenBCI board.
     * Note: This method is used for convenience and should be used when trying to
     *           connect to a board. If you find a case (i.e. a platform (linux,
     *           windows...) that this does not work, please open an issue and
     *           we will add support!
     * @author AJ Keller (@pushtheworldllc)
     * @returns {Promise} - Fulfilled with portName, rejected when can't find the board.
     */
    OpenBCIBoard.prototype.autoFindOpenBCIBoard = function() {
        var macSerialPrefix = 'usbserial-D';
        return new Promise((resolve, reject) => {
            /* istanbul ignore else  */
            serialPort.list((err, ports) => {
                if(err) {
                    if (this.options.verbose) console.log('serial port err');
                    reject(err);
                }
                if(ports.some(port => {
                        if(port.comName.includes(macSerialPrefix)) {
                            this.portName = port.comName;
                            return true;
                        }
                    })) {
                    if (this.options.verbose) console.log('auto found board');
                    resolve(this.portName);
                }
                else {
                    if (this.options.verbose) console.log('could not find board');
                    reject('Could not auto find board');
                }
            });
        })
    };

    /**
     * @description List available ports so the user can choose a device when not
     *              automatically found.
     * Note: This method is used for convenience essentially just wrapping up
     *           serial port.
     * @author Andy Heusser (@andyh616)
     * @returns {Promise}
     */
    OpenBCIBoard.prototype.listPorts = function() {
        return new Promise((resolve, reject) => {
            serialPort.list((err, ports) => {
                if(err) reject(err);
                else {
                    ports.push( {
                        comName: k.OBCISimulatorPortName,
                        manufacturer: '',
                        serialNumber: '',
                        pnpId: '',
                        locationId: '',
                        vendorId: '',
                        productId: ''
                    });
                    resolve(ports);
                }
            })
        })
    };

    /**
     * @description Sends a soft reset command to the board
     * @returns {Promise}
     * Note: The softReset command MUST be sent to the board before you can start
     *           streaming.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.softReset = function() {
        this.isLookingForKeyInBuffer = true;
        this.searchingBuf = this.searchBuffers.miscStop;
        return this.write(k.OBCIMiscSoftReset);
    };

    /**
     * @description To get the specified channelSettings register data from printRegisterSettings call
     * @param channelNumber - a number
     * @returns {Promise.<T>|*}
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.getSettingsForChannel = function(channelNumber) {

        return k.channelSettingsKeyForChannel(channelNumber).then((newSearchingBuffer) => {
            this.searchingBuf = newSearchingBuffer;
            return this.printRegisterSettings();
        });
    };

    /**
     * @description To print out the register settings to the console
     * @returns {Promise.<T>|*}
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.printRegisterSettings = function() {
        return this.write(k.OBCIMiscQueryRegisterSettings).then(() => {
            this.isLookingForKeyInBuffer = true; //need to wait for key in
        });
    };

    /**
     * @description Send a command to the board to turn a specified channel off
     * @param channelNumber
     * @returns {Promise.<T>}
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOff = function(channelNumber) {
        return k.commandChannelOff(channelNumber).then((charCommand) => {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return this.write(charCommand);
        });
    };

    /**
     * @description Send a command to the board to turn a specified channel on
     * @param channelNumber
     * @returns {Promise.<T>|*}
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.channelOn = function(channelNumber) {
        return k.commandChannelOn(channelNumber).then((charCommand) => {
            //console.log('sent command to turn channel ' + channelNumber + ' by sending command ' + charCommand);
            return this.write(charCommand);
        });
    };

    /**
     * @description To send a channel setting command to the board
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
        return new Promise((resolve,reject) => {
            k.getChannelSetter(channelNumber,powerDown,gain,inputType,bias,srb2,srb1)
                .then((arr,newChannelSettingObject) => {
                    arrayOfCommands = arr;
                    this.channelSettingsArray[channelNumber-1] = newChannelSettingObject;
                    resolve(this.write(arrayOfCommands));
            }, function(err) {
                 reject(err);
            });
        });
    };

    /**
     * @description Apply the internal test signal to all channels
     * @param signal - A string indicating which test signal to apply
     *      - `dc`
     *          - Connect to DC signal
     *      - `ground`
     *          - Connect to internal GND (VDD - VSS)
     *      - `pulse1xFast`
     *          - Connect to test signal 1x Amplitude, fast pulse
     *      - `pulse1xSlow`
     *          - Connect to test signal 1x Amplitude, slow pulse
     *      - `pulse2xFast`
     *          - Connect to test signal 2x Amplitude, fast pulse
     *      - `pulse2xFast`
     *          - Connect to test signal 2x Amplitude, slow pulse
     *      - 'none'
     *          - Reset to default
     * @returns {Promise}
     */
    OpenBCIBoard.prototype.testSignal = function(signal) {
        return new Promise((resolve, reject) => {
            k.getTestSignalCommand(signal)
                .then(command => {
                    return this.write(command);
                })
                .then(() => resolve())
                .catch(err => reject(err));
        });
    };

    /**
     * @description - Sends command to turn on impedances for all channels and continuously calculate their impedances
     * @returns {Promise} - Fulfills when all the commands are sent to the internal write buffer
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestContinuousStart = function() {
        return new Promise((resolve, reject) => {
            if (this.impedanceTest.active) reject('Error: test already active');
            if (this.impedanceTest.continuousMode) reject('Error: Already in continuous impedance test mode!');

            this.impedanceTest.active = true;
            this.impedanceTest.continuousMode = true;

            for (var i = 0;i < this.numberOfChannels(); i++) {
                k.getImpedanceSetter(i + 1,false,true).then((commandsArray) => {
                    this.write(commandsArray);
                });
            }
            resolve();
        });
    };

    /**
     * @description - Sends command to turn off impedances for all channels and stop continuously calculate their impedances
     * @returns {Promise} - Fulfills when all the commands are sent to the internal write buffer
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestContinuousStop = function() {
        return new Promise((resolve, reject) => {
            if (!this.impedanceTest.continuousMode) reject('Error: Not in continuous impedance test mode!');

            this.impedanceTest.active = false;
            this.impedanceTest.continuousMode = true;

            for (var i = 0;i < this.numberOfChannels(); i++) {
                k.getImpedanceSetter(i + 1,false,false).then((commandsArray) => {
                    this.write(commandsArray);
                });
            }
            resolve();
        });
    };

    /**
     * @description To apply test signals to the channels on the OpenBCI board used to test for impedance. This can take a
     *  little while to actually run (<8 seconds)!
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestAllChannels = function() {
        var upperLimit = k.OBCINumberOfChannelsDefault;

        /* istanbul ignore if */
        if (this.options.daisy) {
            upperLimit = k.OBCINumberOfChannelsDaisy;
        }

        if (!this.streaming) return Promise.reject('Must be streaming!');

        // Recursive function call
        var completeChannelImpedanceTest = (channelNumber) => {
            return new Promise((resolve,reject) => {
                if (channelNumber > upperLimit) { // Base case!
                    this.emit('impedanceArray',this.impedanceArray);
                    this.impedanceTest.onChannel = 0;
                    resolve();
                } else {
                    if (this.options.verbose) console.log('\n\nImpedance Test for channel ' + channelNumber);
                    this.impedanceTestChannel(channelNumber)
                        .then(() => {
                            return completeChannelImpedanceTest(channelNumber + 1);
                        /* istanbul ignore next */
                        }).catch(err => reject(err));
                }
            });
        };

        return completeChannelImpedanceTest(1);
    };

    /**
     * @description To test specific input configurations of channels!
     * @param arrayOfChannels - The array of configurations where:
     *              'p' or 'P' is only test P input
     *              'n' or 'N' is only test N input
     *              'b' or 'B' is test both inputs (takes 66% longer to run)
     *              '-' to ignore channel
     *      EXAMPLE:
     *          For 8 channel board: ['-','N','n','p','P','-','b','b']
     *              (Note: it doesn't matter if capitalized or not)
     * @returns {Promise} - Fulfilled with a loaded impedance object.
     */
    OpenBCIBoard.prototype.impedanceTestChannels = function(arrayOfChannels) {
        if (!Array.isArray(arrayOfChannels)) return Promise.reject('Input must be array of channels... See Docs!');
        if (!this.streaming) return Promise.reject('Must be streaming!');
        // Check proper length of array
        if (arrayOfChannels.length != this.numberOfChannels()) return Promise.reject('Array length mismatch, should have ' + this.numberOfChannels() + ' but array has length ' + arrayOfChannels.length);

        // Recursive function call
        var completeChannelImpedanceTest = (channelNumber) => {
            return new Promise((resolve,reject) => {
                if (channelNumber > arrayOfChannels.length) { // Base case!
                    this.emit('impedanceArray',this.impedanceArray);
                    this.impedanceTest.onChannel = 0;
                    resolve();
                } else {
                    if (this.options.verbose) console.log('\n\nImpedance Test for channel ' + channelNumber);

                    var testCommand = arrayOfChannels[channelNumber - 1];

                    if (testCommand === 'p' || testCommand === 'P') {
                        this.impedanceTestChannelInputP(channelNumber).then(() => {
                            return completeChannelImpedanceTest(channelNumber + 1);
                        }).catch(err => reject(err));

                    } else if (testCommand === 'n' || testCommand === 'N') {
                        this.impedanceTestChannelInputN(channelNumber).then(() => {
                            return completeChannelImpedanceTest(channelNumber + 1);
                        }).catch(err => reject(err));

                    } else if (testCommand === 'b' || testCommand === 'B') {
                        this.impedanceTestChannel(channelNumber).then(() => {
                            return completeChannelImpedanceTest(channelNumber + 1);
                        }).catch(err => reject(err));

                    } else { // skip ('-') condition
                        return completeChannelImpedanceTest(channelNumber + 1);
                    }
                }
            });
        };
        return completeChannelImpedanceTest(1);
    };

    /**
     * @description Run a complete impedance test on a single channel, applying the test signal individually to P & N inputs.
     * @param channelNumber - A Number, specifies which channel you want to test.
     * @returns {Promise} - Fulfilled with a single channel impedance object.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestChannel = function(channelNumber) {
        this.impedanceArray[channelNumber - 1] = openBCISample.impedanceObject(channelNumber);
        return new Promise((resolve,reject) => {
            this._impedanceTestSetChannel(channelNumber,true,false) // Sends command for P input on channel number.
                .then(channelNumber => {
                    return this._impedanceTestCalculateChannel(channelNumber,true,false); // Calculates for P input of channel number
                })
                .then(channelNumber => {
                    return this._impedanceTestSetChannel(channelNumber,false,true); // Sends command for N input on channel number.
                })
                .then(channelNumber => {
                    return this._impedanceTestCalculateChannel(channelNumber,false,true); // Calculates for N input of channel number
                })
                .then(channelNumber => {
                    return this._impedanceTestSetChannel(channelNumber,false,false); // Sends command to stop applying test signal to P and N channel
                })
                .then(channelNumber => {
                    return this._impedanceTestFinalizeChannel(channelNumber,true,true); // Finalize the impedances.
                })
                .then((channelNumber) => resolve(this.impedanceArray[channelNumber - 1]))
                .catch(err => reject(err));
        });
    };


    /**
     * @description Run impedance test on a single channel, applying the test signal only to P input.
     * @param channelNumber - A Number, specifies which channel you want to test.
     * @returns {Promise} - Fulfilled with a single channel impedance object.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestChannelInputP = function(channelNumber) {
        this.impedanceArray[channelNumber - 1] = openBCISample.impedanceObject(channelNumber);
        return new Promise((resolve,reject) => {
            this._impedanceTestSetChannel(channelNumber,true,false) // Sends command for P input on channel number.
                .then(channelNumber => {
                    return this._impedanceTestCalculateChannel(channelNumber,true,false); // Calculates for P input of channel number
                })
                .then(channelNumber => {
                    return this._impedanceTestSetChannel(channelNumber,false,false); // Sends command to stop applying test signal to P and N channel
                })
                .then(channelNumber => {
                    return this._impedanceTestFinalizeChannel(channelNumber,true,false); // Finalize the impedances.
                })
                .then((channelNumber) => resolve(this.impedanceArray[channelNumber - 1]))
                .catch(err => reject(err));
        });
    };

    /**
     * @description Run impedance test on a single channel, applying the test signal to N input.
     * @param channelNumber - A Number, specifies which channel you want to test.
     * @returns {Promise} - Fulfilled with a single channel impedance object.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.impedanceTestChannelInputN = function(channelNumber) {
        this.impedanceArray[channelNumber - 1] = openBCISample.impedanceObject(channelNumber);
        return new Promise((resolve,reject) => {
            this._impedanceTestSetChannel(channelNumber,false,true) // Sends command for N input on channel number.
                .then(channelNumber => {
                    return this._impedanceTestCalculateChannel(channelNumber,false,true); // Calculates for N input of channel number
                })
                .then(channelNumber => {
                    return this._impedanceTestSetChannel(channelNumber,false,false); // Sends command to stop applying test signal to P and N channel
                })
                .then(channelNumber => {
                    return this._impedanceTestFinalizeChannel(channelNumber,false,true); // Finalize the impedances.
                })
                .then((channelNumber) => resolve(this.impedanceArray[channelNumber - 1]))
                .catch(err => reject(err));
        });
    };

    /* istanbul ignore next */
    /**
     * @description To apply the impedance test signal to an input for any given channel
     * @param channelNumber -  Number - The channel you want to test.
     * @param pInput - A bool true if you want to apply the test signal to the P input, false to not apply the test signal.
     * @param nInput - A bool true if you want to apply the test signal to the N input, false to not apply the test signal.
     * @returns {Promise} - With Number value of channel number
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._impedanceTestSetChannel = function(channelNumber, pInput, nInput) {
        return new Promise((resolve,reject) => {
            if(!this.connected) reject('Must be connected');

            var delayInMS = 0;

            /* istanbul ignore if */
            if (this.options.verbose) {
                if (pInput && !nInput) {
                    console.log('\tSending command to apply test signal to P input.');
                } else if (!pInput && nInput) {
                    console.log('\tSending command to apply test signal to N input.');
                } else if (pInput && nInput) {
                    console.log('\tSending command to apply test signal to P and N inputs.');
                } else {
                    console.log('\tSending command to stop applying test signal to both P and N inputs.');
                }
            }

            if (!pInput && !nInput) {
                this.impedanceTest.active = false;
                //this.writeOutDelay = k.OBCIWriteIntervalDelayMSShort;
            } else {
                //this.writeOutDelay = k.OBCIWriteIntervalDelayMSLong;
            }
            console.log('pInput: ' + pInput + ' nInput: ' + nInput);
            k.getImpedanceSetter(channelNumber,pInput,nInput).then((commandsArray) => {
                console.log(commandsArray);
                this.write(commandsArray);
                //delayInMS += commandsArray.length * k.OBCIWriteIntervalDelayMSLong;
                delayInMS += this.commandsToWrite * k.OBCIWriteIntervalDelayMSShort; // Account for commands waiting to be sent in the write buffer
                setTimeout(() => {
                    /**
                     * If either pInput or nInput are true then we should start calculating impedance. Setting
                     *  this.isCalculatingImpedance to true here allows us to route every sample for an impedance
                     *  calculation instead of the normal sample output.
                     */
                    if (pInput || nInput) this.impedanceTest.active = true;
                    resolve(channelNumber);
                }, delayInMS); // Prevents emitting .impedanceArray before all setting commands have been applied
            }, (err) => {
                reject(err);
            });


        });
    };

    /**
     * @description Calculates the impedance for a specified channel for a set time
     * @param channelNumber - A Number, the channel number you want to test.
     * @param pInput - A bool true if you want to calculate impedance on the P input, false to not calculate.
     * @param nInput - A bool true if you want to calculate impedance on the N input, false to not calculate.
     * @returns {Promise} - Resolves channelNumber as value on fulfill, rejects with error...
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._impedanceTestCalculateChannel = function(channelNumber,pInput,nInput) {
        /* istanbul ignore if */
        if (this.options.verbose) {
            if (pInput && !nInput) {
                console.log('\tCalculating impedance for P input.');
            } else if (!pInput && nInput) {
                console.log('\tCalculating impedance for N input.');
            } else if (pInput && nInput) {
                console.log('\tCalculating impedance for P and N input.');
            } else {
                console.log('\tNot calculating impedance for either P and N input.');
            }
        }
        return new Promise((resolve, reject) => {
            if (channelNumber < 1 || channelNumber > this.numberOfChannels()) reject('Invalid channel number');
            if (typeof pInput !== 'boolean') reject('Invalid Input: \'pInput\' must be of type Bool');
            if (typeof nInput !== 'boolean') reject('Invalid Input: \'nInput\' must be of type Bool');
            this.impedanceTest.onChannel = channelNumber;
            this.impedanceTest.sampleNumber = 0; // Reset the sample number
            this.impedanceTest.isTestingPInput = pInput;
            this.impedanceTest.isTestingNInput = nInput;
            //console.log(channelNumber + ' In calculate channel pInput: ' + pInput + ' this.impedanceTest.isTestingPInput: ' + this.impedanceTest.isTestingPInput);
            //console.log(channelNumber + ' In calculate channel nInput: ' + nInput + ' this.impedanceTest.isTestingNInput: ' + this.impedanceTest.isTestingNInput);
            setTimeout(() => { // Calculate for 250ms
                this.impedanceTest.onChannel = 0;
                /* istanbul ignore if */
                if (this.options.verbose) {
                    if (pInput && !nInput) {
                        console.log('\tDone calculating impedance for P input.');
                    } else if (!pInput && nInput) {
                        console.log('\tDone calculating impedance for N input.');
                    } else if (pInput && nInput) {
                        console.log('\tDone calculating impedance for P and N input.');
                    } else {
                        console.log('\tNot calculating impedance for either P and N input.');
                    }
                }
                resolve(channelNumber);
            }, 1000);
        });
    };

    /**
     * @description Calculates average and gets textual value of impedance for a specified channel
     * @param channelNumber - A Number, the channel number you want to finalize.
     * @param pInput - A bool true if you want to finalize impedance on the P input, false to not finalize.
     * @param nInput - A bool true if you want to finalize impedance on the N input, false to not finalize.
     * @returns {Promise} - Resolves channelNumber as value on fulfill, rejects with error...
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._impedanceTestFinalizeChannel = function(channelNumber,pInput,nInput) {
        /* istanbul ignore if */
        if (this.options.verbose) {
            if (pInput && !nInput) {
                console.log('\tFinalizing impedance for P input.');
            } else if (!pInput && nInput) {
                console.log('\tFinalizing impedance for N input.');
            } else if (pInput && nInput) {
                console.log('\tFinalizing impedance for P and N input.');
            } else {
                console.log('\tNot Finalizing impedance for either P and N input.');
            }
        }
        return new Promise((resolve, reject) => {
            if (channelNumber < 1 || channelNumber > this.numberOfChannels()) reject('Invalid channel number');
            if (typeof pInput !== 'boolean') reject('Invalid Input: \'pInput\' must be of type Bool');
            if (typeof nInput !== 'boolean') reject('Invalid Input: \'nInput\' must be of type Bool');

            if (pInput) openBCISample.impedanceSummarize(this.impedanceArray[channelNumber - 1].P);
            if (nInput) openBCISample.impedanceSummarize(this.impedanceArray[channelNumber - 1].N);

            resolve(channelNumber);
        });
    };

    /**
     * @description Get the the current sample rate is.
     * @returns {Number} The sample rate
     * Note: This is dependent on if you configured the board correctly on setup options
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sampleRate = function() {
        if(this.options.boardType === k.OBCIBoardDaisy) {
            return k.OBCISampleRate125;
        } else {
            return k.OBCISampleRate250;
        }
    };

    /**
     * @description This function is used as a convenience method to determine how many
     *              channels the current board is using.
     * @returns {Number} A number
     * Note: This is dependent on if you configured the board correctly on setup options
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.numberOfChannels = function() {
        if(this.options.boardType === k.OBCIBoardDaisy) {
            return k.OBCINumberOfChannelsDaisy;
        } else {
            return k.OBCINumberOfChannelsDefault;
        }
    };

    /**
     * @description Send the command to tell the board to start the syncing protocol.
     */
    OpenBCIBoard.prototype.syncClocksStart = function() {
        return new Promise((resolve,reject) => {
            if (!this.connected) reject('Must be connected to the device');
            if (this.streaming) reject('Cannot be streaming to sync clocks');
            this.searchingBuf = this.searchBuffers.timeSyncStart;
            this.isLookingForKeyInBuffer = true;
            this.write(k.OBCISyncClockStart);
            resolve();
        });
    };

    /**
     * @description Consider the '_processBytes' method to be the work horse of this
     *              entire framework. This method gets called any time there is new
     *              data coming in on the serial port. If you are familiar with the
     *              'serialport' package, then every time data is emitted, this function
     *              gets sent the input data.
     * @param data - a buffer of unknown size
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processBytes = function(data) {
        //console.log(data);
        var sizeOfData = data.byteLength;
        this.bytesIn += sizeOfData; // increment to keep track of how many bytes we are receiving
        if(this.isLookingForKeyInBuffer) { //in a reset state
            var sizeOfSearchBuf = this.searchingBuf.byteLength; // then size in bytes of the buffer we are searching for
            for (var i = 0; i < sizeOfData - (sizeOfSearchBuf - 1); i++) {
                if (this.searchingBuf.equals(data.slice(i, i + sizeOfSearchBuf))) { // slice a chunk of the buffer to analyze
                    if (this.searchingBuf.equals(this.searchBuffers.miscStop)) {
                        if (this.options.verbose) console.log('Money!');
                        if (this.options.verbose) console.log(data.toString());
                        this.isLookingForKeyInBuffer = false; // critical!!!
                        this.emit('ready'); // tell user they are ready to stream, etc...
                    } else if (this.searchingBuf.equals(this.searchBuffers.timeSyncStart)) {
                        this.sync.ntp1 = now();
                        if(this.options.verbose) console.log('Got time sync request: ' + this.sync.npt1.toFixed(4));
                        this.sync.ntp2 = now();
                        this._writeAndDrain('<' + (this.sync.ntp1 * 1000) + (this.sync.ntp2 * 1000));
                        this.searchingBuf = this.searchBuffers.miscStop;

                    } else {
                        getChannelSettingsObj(data.slice(i)).then((channelSettingsObject) => {
                            this.emit('query',channelSettingsObject);
                        }, (err) => {
                            console.log('Error: ' + err);
                        });
                        this.searchingBuf = this.searchBuffers.miscStop;
                        break;
                    }
                }
            }
        } else { // steaming operation should lead here...
            // send input data to master buffer
            this._bufMerger(data);
            //console.log('Packets in: ' + this.masterBuffer.packetsIn + ', Packets read: ' + this.masterBuffer.packetsRead);

            // parse the master buffer
            while(this.masterBuffer.packetsRead < this.masterBuffer.packetsIn) {
                var rawPacket = this._bufPacketStripper();
                this.emit('rawDataPacket', rawPacket);
                openBCISample.parseRawPacket(rawPacket,this.channelSettingsArray)
                    .then(sampleObject => {
                        sampleObject._count = this.sampleCount++;
                        if(this.impedanceTest.active) {
                            if (this.impedanceTest.continuousMode) {
                                //console.log('running in contiuous mode...');
                                openBCISample.goertzelProcessSample(sampleObject,this.goertzelObject)
                                    .then((impedanceArray) => {
                                        this.emit('impedanceArray',impedanceArray);
                                    })
                            } else if (this.impedanceTest.onChannel != 0) {
                                // Only calculate impedance for one channel
                                openBCISample.impedanceCalculationForChannel(sampleObject,this.impedanceTest.onChannel)
                                    .then(rawValue => {
                                        //console.log("Raw value: " + rawValue);
                                        impedanceTestApplyRaw.call(this,rawValue);
                                    }).catch(err => {
                                    console.log('Impedance calculation error: ' + err);
                                });
                            }
                        } else {
                            this.emit('sample', sampleObject);
                        }
                    }).catch(err => {
                        console.log('Skipped with error: ' + err);
                        this.badPackets++;
                        this._bufAlign(); // fix the buffer to start reading at next start byte
                    });
            }
        }
    };

    /**
     * @description Merge an input buffer with the master buffer. Takes into account
     *              wrapping around the master buffer if we run out of space in
     *              the master buffer. Note that if you are not reading bytes from
     *              master buffer, you will lose them if you continue to call this
     *              method due to the overwrite nature of buffers
     * @param inputBuffer
     * @author AJ Keller (@pushtheworldllc)
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
     * @description Strip packets from the master buffer
     * @returns {Buffer} A buffer containing a packet of 33 bytes long, ready to be read.
     * @author AJ Keller (@pushtheworldllc)
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
                //console.log(rawPacket);
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

    OpenBCIBoard.prototype._bufAlign = function() {
        var startingReadPosition = this.masterBuffer.positionRead;
        console.log('Starting read position: '+ startingReadPosition);
        var aligned = false;

        while (this.masterBuffer.buffer[this.masterBuffer.positionRead] !== k.OBCIByteStart) {
            //console.log(this.masterBuffer.buffer[this.masterBuffer.positionRead]);
            if(this.masterBuffer.positionRead === startingReadPosition) {
                console.log('Wrapped around and hit the starting point again');
                aligned = true; // give up and try again at some later point in time when new stuff has been loaded in.
            } else if (this.masterBuffer.positionRead >= k.OBCIMasterBufferSize) { // Wrap around condition
                this.masterBuffer.positionRead = 0;
                console.log('Wrapped around');
            }
            this.masterBuffer.positionRead++;
        }
        console.log('aligned... new read position: ' + this.masterBuffer.positionRead + ' because start byte is ' + this.masterBuffer.buffer[this.masterBuffer.positionRead])
    };

    OpenBCIBoard.prototype._reset = function() {
        this.masterBuffer = masterBufferMaker();
        this.searchingBuf = this.searchBuffers.miscStop;
        this.badPackets = 0;
    };

    /**
     * @description Stateful method for querying the current offset only when the last
     *                  one is too old. (defaults to daily)
     * @returns {Promise} A promise with the time offset
     */
    OpenBCIBoard.prototype.sntpGetOffset = function() {
        return new Promise((resolve, reject) => {
            Sntp.offset(function(err, offset) {
                if(err) reject(err);
                resolve(offset);
            });
        });
    };

    /**
     * @description Get time from the NTP server. Must have internet connection!
     * @returns {Promise} - Fulfilled with time object
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sntpGetServerTime = function() {
        return new Promise((resolve,reject) => {
            Sntp.time(options, function (err, time) {

                if (err) {
                    console.log('Failed: ' + err.message);
                    reject(err);
                    //process.exit(1);
                }

                console.log('Local clock is off by: ' + time.t + ' milliseconds');
                //process.exit(0);
                resolve(time);
            });
        });
    };

    /**
     * @description This starts the NTP server and gets it to remain in sync with the NTP server
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sntpStart = function() {
        var start = () => {
            Sntp.start(() => {
                Sntp.now();
            });
        };

        start();
    };

    /**
     * @description Stops the sntp from updating
     */
    OpenBCIBoard.prototype.sntpStop = function() {
        Sntp.stop();
    };

    /**
     * @description This prints the total number of packets that were not able to be read
     * @author AJ Keller (@pushtheworldllc)
     */
    /* istanbul ignore next */
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
     * @description This prints the total bytes in
     * @author AJ Keller (@pushtheworldllc)
     */
    /* istanbul ignore next */
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
     * @description This prints the total number of packets that have been read
     * @author AJ Keller (@pushtheworldllc)
     */
    /* istanbul ignore next */
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
     * @description Nice convenience method to print some session details
     * @author AJ Keller (@pushtheworldllc)
     */
    /* istanbul ignore next */
    OpenBCIBoard.prototype.debugSession = function() {
        this.printBytesIn();
        this.printPacketsRead();
        this.printPacketsBad();
    };

    /**
     * @description To pretty print the info recieved on a Misc Register Query (printRegisterSettings)
     * @param channelSettingsObj
     */
    /* istanbul ignore next */
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
     * @description Quickly determine if a channel is on or off from a channelSettingObject. Most likely from a getChannelSettings call.
     * @param channelSettingsObject
     * @returns {boolean}
     */
    OpenBCIBoard.prototype.channelIsOnFromChannelSettingsObject = function(channelSettingsObject) {
        return channelSettingsObject.POWER_DOWN.toString().localeCompare('1') === 1;
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
 * @description To apply the calculated raw value to the function
 * @param rawValue - A raw value of impedance
 * @author AJ Keller (@pushtheworldllc)
 */
function impedanceTestApplyRaw(rawValue) {
    var indexOfChannel = this.impedanceTest.onChannel - 1;

    // Subtract the 2.2k Ohm series resistor
    rawValue -= k.OBCIImpedanceSeriesResistor;

    // Don't allow negative rawValues
    if (rawValue > 0) {
        if (this.impedanceTest.isTestingNInput) {
            this.impedanceArray[indexOfChannel].N.data.push(rawValue);
        }
        if (this.impedanceTest.isTestingPInput) {
            this.impedanceArray[indexOfChannel].P.data.push(rawValue);
        }
    }

}

/**
 * @description To parse a given channel given output from a print registers query
 * @param rawChannelBuffer
 * @example would be 'CH1SET 0x05, 0xFF, 1, 0, 0, 0, 0, 1, 0
 * @returns {Promise}
 * @author AJ Keller (@pushtheworldllc)
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

function masterBufferMaker() {
    var masterBuf = new Buffer(k.OBCIMasterBufferSize);
    masterBuf.fill(0);
    return { // Buffer used to store bytes in and read packets from
        buffer: masterBuf,
        positionRead: 0,
        positionWrite: 0,
        packetsIn:0,
        packetsRead:0,
        looseBytes:0
    };
}
