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
var StreamSearch = require('streamsearch');

/**
 * @description SDK for OpenBCI Board {@link www.openbci.com}
 * @module 'openbci-sdk'
 */
function OpenBCIFactory() {
    var factory = this;

    var _options = {
        boardType: k.OBCIBoardDefault,
        baudrate: 115200,
        verbose: false,
        sntp: false,
        simulate: false,
        simulatorSampleRate: 250,
        simulatorAlpha: true,
        simulatorLineNoise: '60Hz'
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
     *     - `baudRate` - Baud Rate, defaults to 115200. Manipulating this is allowed if
     *                      firmware on board has been previously configured.
     *
     *     - `verbose` - Print out useful debugging events
     *
     *     - `simulate` - Full functionality, just mock data.
     *
     *     - `simulatorSampleRate` - The sample rate to use for the simulator
     *                      (Default is `250`)
     *
     *     - `simulatorAlpha` - {Boolean} - Inject and 10Hz alpha wave in Channels 1 and 2 (Default `true`)
     *
     *     - `simulatorLineNoise` - Injects line noise on channels.
     *          3 Possible Boards:
     *              `60Hz` - 60Hz line noise (Default) [America]
     *              `50Hz` - 50Hz line noise [Europe]
     *              `None` - Do not inject line noise.
     *
     *     - `sntp` - Syncs the module up with an SNTP time server. Syncs the board on startup
     *                  with the SNTP time. Adds a time stamp to the AUX channels. (NOT FULLY
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
        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;
        opts.verbose = options.verbose || _options.verbose;
        opts.sntp = options.SNTP || options.sntp || _options.NTP;
        opts.simulate = options.simulate || _options.simulate;
        opts.simulatorSampleRate = options.simulatorSampleRate || options.simulatorsamplerate || _options.simulatorSampleRate;
        opts.simulatorLineNoise = options.simulatorLineNoise || options.simulatorlinenoise || _options.simulatorLineNoise;
        // Safety check!
        if (opts.simulatorLineNoise !== '60Hz' && opts.simulatorLineNoise !== '50Hz' && opts.simulatorLineNoise !== 'None') {
            opts.simulatorLineNoise = '60Hz';
        }
        if (options.simulatorAlpha === false || options.simulatoralpha === false) {
            opts.simulatorAlpha = false;
        } else {
            opts.simulatorAlpha = _options.simulatorAlpha;
        }
        // Set to global options object
        this.options = opts;

        /** Properties (keep alphabetical) */
        // Arrays
        this.accelArray = [0,0,0]; // X, Y, Z
        this.writeOutArray = new Array(100);
        this.channelSettingsArray = k.channelSettingsArrayInit(k.numberOfChannelsForBoardType(this.options.boardType));
        // Buffers
        this.masterBuffer = masterBufferMaker();
        // Objects
        this.goertzelObject = openBCISample.goertzelNewObject(k.numberOfChannelsForBoardType(this.options.boardType));
        this.writer = null;
        this.impedanceTest = {
            active: false,
            isTestingPInput: false,
            isTestingNInput: false,
            onChannel: 0,
            sampleNumber: 0,
            continuousMode: false,
            impedanceForChannel: 0
        };
        this.info = {
            boardType:k.OBCIBoardDefault,
            sampleRate:k.OBCISampleRate250,
            firmware:k.OBCIFirmwareV1,
            numberOfChannels:k.OBCINumberOfChannelsDefault
        };
        this.sync = {
            active: false,
            timeSent: 0,
            timeLastBoardTime: 0,
            timeEnteredQueue: 0,
            timeGotSetPacket: 0,
            timeRoundTrip: 0,
            timeTransmission: 0,
            timeOffset: 0
        };
        this.sntpOptions = {
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
        this.sampleCount = 0;
        this.curParsingMode = k.OBCIParsingReset;
        // Strings

        // NTP
        if (this.options.sntp) {
            // establishing ntp connection
            this.sntpStart()
                .then(() => {
                    if(this.options.verbose) console.log('SNTP: connected');
                })
                .catch(err => {
                    if(this.options.verbose) console.log('SNTP: unable to connect');
                    console.log(err);
                })
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
                    sampleRate: this.options.simulatorSampleRate,
                    alpha: this.options.simulatorAlpha,
                    lineNoise: this.options.simulatorLineNoise
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
        // if we are streaming then we need to give extra time for that stop streaming command to propagate through the
        //  system before closing the serial port.
        var timeout = 0;
        if (this.streaming) {
            this.streamStop();
            if(this.options.verbose) console.log('stop streaming');
            timeout = 20;
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
            if(this.streaming) reject('Error [.streamStart()]: Already streaming');
            this.streaming = true;
            this._reset();
            this.write(k.OBCIStreamStart)
                .then(() => {
                    setTimeout(() => {
                        resolve();
                    }, 50); // allow time for command to get sent
                })
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
                .then(() => {
                    setTimeout(() => {
                        resolve();
                    }, 10); // allow time for command to get sent
                })
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
            //console.log('writing command ' + data);
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
            if (this.options.simulate) {
                this.portName = k.OBCISimulatorPortName;
                if (this.options.verbose) console.log('auto found sim board');
                resolve(k.OBCISimulatorPortName);
            } else {
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
            }
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
        this.curParsingMode = k.OBCIParsingReset;
        return this.write(k.OBCIMiscSoftReset);
    };

    /**
     * @description To get the specified channelSettings register data from printRegisterSettings call
     * @param channelNumber - a number
     * @returns {Promise.<T>|*}
     * @author AJ Keller (@pushtheworldllc)
     */
    // TODO: REDO THIS FUNCTION
    OpenBCIBoard.prototype.getSettingsForChannel = function(channelNumber) {
        return k.channelSettingsKeyForChannel(channelNumber).then((newSearchingBuffer) => {
            // this.searchingBuf = newSearchingBuffer;
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
            this.curParsingMode = k.OBCIParsingChannelSettings;
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
     * @author AJ Keller (@pushtheworldllc)
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
     *      - `none`
     *          - Reset to default
     * @returns {Promise}
     * @author AJ Keller (@pushtheworldllc)
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
            if (!this.impedanceTest.active) reject('Error: no test active');
            if (!this.impedanceTest.continuousMode) reject('Error: Not in continuous impedance test mode!');

            this.impedanceTest.active = false;
            this.impedanceTest.continuousMode = false;

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
                this.impedanceTest.active = false; // Critical to changing the flow of `._processBytes()`
                //this.writeOutDelay = k.OBCIWriteIntervalDelayMSShort;
            } else {
                //this.writeOutDelay = k.OBCIWriteIntervalDelayMSLong;
            }
            if (this.options.verbose) console.log('pInput: ' + pInput + ' nInput: ' + nInput);
            // Get impedance settings to send the board
            k.getImpedanceSetter(channelNumber,pInput,nInput).then((commandsArray) => {
                console.log(commandsArray);
                this.write(commandsArray);
                //delayInMS += commandsArray.length * k.OBCIWriteIntervalDelayMSLong;
                delayInMS += this.commandsToWrite * k.OBCIWriteIntervalDelayMSShort; // Account for commands waiting to be sent in the write buffer
                setTimeout(() => {
                    /**
                     * If either pInput or nInput are true then we should start calculating impedance. Setting
                     *  this.impedanceTest.active to true here allows us to route every sample for an impedance
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
                if(pInput) this.impedanceArray[channelNumber - 1].P.raw = this.impedanceTest.impedanceForChannel;
                if(nInput) this.impedanceArray[channelNumber - 1].N.raw = this.impedanceTest.impedanceForChannel;
                resolve(channelNumber);
            }, 400);
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

            setTimeout(() => {
                resolve(channelNumber);
            },50); // Introduce a delay to allow for extra time in case of back to back tests

        });
    };

    /**
     * @description Start logging to the SD card.
     * @param recordingDuration {String} - The duration you want to log SD information for. Limited to:
     *      '14sec', '5min', '15min', '30min', '1hour', '2hour', '4hour', '12hour', '24hour'
     * @returns {Promise} - Resolves if the command was added to write queue.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sdStart = function(recordingDuration) {
        return new Promise((resolve,reject) => {
            if (!this.connected) reject('Must be connected to the device');
            k.sdSettingForString(recordingDuration)
                .then(command => {
                    // If we are not streaming, then expect a confirmation message back from the board
                    if (!this.streaming) {
                        // TODO: Do we need to parse the incoming data? I think we can just eject it
                        // this.isLookingForKeyInBuffer = true;
                        // this.searchingBuf = this.searchBuffers.miscStop;
                    }
                    this.writeOutDelay = k.OBCIWriteIntervalDelayMSNone;
                    return this.write(command);
                })
                .catch(err => reject(err));
        });

    };

    /**
     * @description Sends the stop SD logging command to the board.
     * @returns {Promise}
     */
    OpenBCIBoard.prototype.sdStop = function() {
        return new Promise((resolve,reject) => {
            if (!this.connected) reject('Must be connected to the device');
            // If we are not streaming, then expect a confirmation message back from the board
            if (!this.streaming) {
                // TODO: Do we need to parse the incoming data? I think we can just eject it
                // this.isLookingForKeyInBuffer = true;
                // this.searchingBuf = this.searchBuffers.miscStop;
            }
            this.writeOutDelay = k.OBCIWriteIntervalDelayMSNone;
            return this.write(k.OBCISDLogStop);
        });
    };

    /**
     * @description Get the the current sample rate is.
     * @returns {Number} The sample rate
     * Note: This is dependent on if you configured the board correctly on setup options
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sampleRate = function() {
        if (this.options.simulate) {
            return this.options.simulatorSampleRate;
        } else {
            if(this.options.boardType === k.OBCIBoardDaisy) {
                return k.OBCISampleRate125;
            } else {
                return k.OBCISampleRate250;
            }
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
            //if (this.streaming) reject('Cannot be streaming to sync clocks');
            if (this.firmwareVersion === k.OBCIFirmwareV1) reject('Time sync not implemented on V1 firmware, please update');
            this.curParsingMode = k.OBCIParsingTimeSyncSent;
            this.sync.timeEnteredQueue = this.sntpNow();

            if (this.options.verbose) console.log('PC time sent to board: ' + this.sync.timeEnteredQueue);
            this.write(k.OBCISyncTimeSet);
            resolve();
        });
    };

    /**
     * @description Consider the '_processBytes' method to be the work horse of this
     *              entire framework. This method gets called any time there is new
     *              data coming in on the serial port. If you are familiar with the
     *              'serialport' package, then every time data is emitted, this function
     *              gets sent the input data. The data comes in very fragmented, sometimes
     *              we get half of a packet, and sometimes we get 3 and 3/4 packets, so
     *              we will need to store what we don't read for next time.
     * @param data - a buffer of unknown size
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processBytes_vak = function(data) {
        //console.log(data.toString());
        var sizeOfData = data.byteLength;
        this.bytesIn += sizeOfData; // increment to keep track of how many bytes we are receiving
        if(this.isLookingForKeyInBuffer) { //in a reset state
            var sizeOfSearchBuf = this.searchingBuf.byteLength; // then size in bytes of the buffer we are searching for
            for (var i = 0; i < sizeOfData - (sizeOfSearchBuf - 1); i++) {
                if (this.parsingForFirmwareVersion) {
                    if (this.searchBuffers.firmwareVersion.equals(data.slice(i, i+2))) {
                        this.firmwareVersion = k.OBCIFirmwareV2;
                        if (this.options.verbose) console.log('Using Firmware Version 2');
                        this.parsingForFirmwareVersion = false;
                        // If we are using the v2 firmware, no need for a delay
                        this.writeOutDelay = k.OBCIWriteIntervalDelayMSNone;
                    }
                }
                if (this.searchingBuf.equals(data.slice(i, i + sizeOfSearchBuf))) { // slice a chunk of the buffer to analyze
                    if (this.searchingBuf.equals(this.searchBuffers.miscStop)) {
                        if (this.options.verbose) console.log('Money!');
                        if (this.options.verbose) console.log(data.toString());
                        this.parsingForFirmwareVersion = false; // because we didnt find it
                        this.isLookingForKeyInBuffer = false; // critical!!!
                        this.emit('ready'); // tell user they are ready to stream, etc...
                    } else if (this.searchingBuf.equals(this.searchBuffers.timeSyncSent)) {
                        this.sync.timeSent = this.sntpNow();
                        if(this.options.verbose) console.log('Sent time sync');

                        this.searchingBuf = this.searchBuffers.miscStop;
                        this.isLookingForKeyInBuffer = false;

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

            var bytesToRead = sizeOfData;

            // Is there old data? If there was saved data in the buffer from last time, let's post-fix the new data
            //  buffer with the old data.
            if (this.buffer) {
                // Get size of old buffer
                var oldBufferSize = this.buffer.byteLength;

                // Make a new buffer
                var newDataBuffer = new Buffer(bytesToRead + oldBufferSize);

                // Put old buffer in the front of the new buffer
                var oldBytesWritten = this.buffer.copy(newDataBuffer);

                // Move the incoming data into the end of the new buffer
                data.copy(newDataBuffer,oldBytesWritten);

                // Over write data
                data = newDataBuffer;

                // Update the number of bytes to read
                bytesToRead += oldBytesWritten;
            }

            var readingPosition = 0;

            // 45 < (200 - 33) --> 45 < 167 (good) | 189 < 167 (bad) | 0 < (28 - 33) --> 0 < -5 (bad)
            while (readingPosition <= bytesToRead - k.OBCIPacketSize) {
                if (data[readingPosition] === k.OBCIByteStart) {
                    var rawPacket = data.slice(readingPosition, readingPosition + k.OBCIPacketSize);
                    this.emit('rawDataPacket',rawPacket);
                    if ((data[readingPosition + k.OBCIPacketSize - 1] & 0xF0) === k.OBCIByteStop) {
                        var packetType = openBCISample.getRawPacketType(rawPacket[k.OBCIPacketPositionStopByte]);
                        switch (packetType) {
                            case k.OBCIStreamPacketTimeSyncSet:
                                this.sync.timeGotSetPacket = this.sntpNow();
                                this._processPacketTimeSyncSet(rawPacket);
                                break;
                            case k.OBCIStreamPacketTimeSyncedAccel:
                                this._processPacketTimeSyncedAccel(rawPacket);
                                break;
                            case k.OBCIStreamPacketTimeSyncedRawAux:
                                this._processPacketTimeSyncedRawAux(rawPacket);
                                break;
                            case k.OBCIStreamPacketStandardRawAux:
                                this._processPacketStandardRawAux(rawPacket);
                                break;
                            case k.OBCIStreamPacketStandardAccel:
                            default: // Normally route here
                                this._processPacketStandardAccel(rawPacket);
                                break;

                        }
                    }
                }

                // increment reading position
                readingPosition++;
            }

            // Are there any bytes to move into the buffer?
            if (readingPosition < bytesToRead) {
                //we are creating a new Buffer the size of how many bytes are left in the data buffer
                // so we can move and store that into this.buffer for the next time this function is ran.
                this.buffer = new Buffer(bytesToRead - readingPosition);

                // copy data from data into this.buffer.
                data.copy(this.buffer);

            } else {
                this.buffer = null;
            }
        }
    };

    /**
     * @description Consider the '_processBytes' method to be the work horse of this
     *              entire framework. This method gets called any time there is new
     *              data coming in on the serial port. If you are familiar with the
     *              'serialport' package, then every time data is emitted, this function
     *              gets sent the input data. The data comes in very fragmented, sometimes
     *              we get half of a packet, and sometimes we get 3 and 3/4 packets, so
     *              we will need to store what we don't read for next time.
     * @param data - a buffer of unknown size
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processBytes = function(data) {
        // Concat old buffer
        // if (this.buffer) {
        //     data = Buffer.concat([this.buffer,data],data.length + this.buffer.length);
        // } 
        //
        // this.buffer = this._processDataBuffer(data);
        //
        // switch (this.curParsingMode) {
        //     case k.OBCIParsingReset:
        //         // Does the buffer have an EOT in it? 
        //         if (this._doesBufferHaveEOT(this.buffer)) {
        //             this._processParseBufferForReset(this.buffer);
        //         }
        //         break;
        //     case k.OBCIParsingTimeSyncSent:
        //         break;
        //     default:
        //         break;
        //
        // }
    };

    /**
     * @description Used to extract samples out of a buffer of unknown length
     * @param dataBuffer {Buffer} - A buffer to parse for samples
     * @returns {Buffer} - Any data that was not pulled out of the buffer
     */
    OpenBCIBoard.prototype._processDataBuffer = function(dataBuffer) {
        var bytesToParse = dataBuffer.byteLength;
        // Exit if we have a buffer with less data than a packet
        if (bytesToParse < k.OBCIPacketSize) return dataBuffer;

        var parsePosition = 0;
        // Begin parseing
        while (parsePosition <= bytesToParse - k.OBCIPacketSize) {
            // Is the current byte a head byte that looks like 0xA0
            if (dataBuffer[parsePosition] === k.OBCIByteStart) {
                // Now that we know the first is a head byte, let's see if the last one is a
                //  tail byte 0xCx where x is the set of numbers from 0-F (hex)
                if ((dataBuffer[parsePosition + k.OBCIPacketSize - 1] & 0xF0) === k.OBCIByteStop) {
                    /** We just qualified a raw packet */
                    // Grab the raw packet, make a copy of it.
                    var rawPacket;
                    if (process.version > 6) {
                        // From introcuded in node version 6.x.x
                        rawPacket = Buffer.from(dataBuffer.slice(parsePosition, parsePosition + k.OBCIPacketSize));
                    } else {
                        rawPacket = new Buffer(dataBuffer.slice(parsePosition, parsePosition + k.OBCIPacketSize));
                    }

                    // Emit that buffer
                    this.emit('rawDataPacket',rawPacket);
                    // Submit the packet for processing
                    this._processQualifiedPacket(rawPacket);
                    // Overwrite the dataBuffer with a new buffer
                    if (process.version > 6) {
                        dataBuffer = Buffer.from(dataBuffer.slice(k.OBCIPacketSize));
                    } else {
                        dataBuffer = new Buffer(dataBuffer.slice(k.OBCIPacketSize));
                    }
                    // Move the parse position up one packet
                    parsePosition = -1;
                    bytesToParse -= k.OBCIPacketSize;
                }
            }
            parsePosition++;
        }
        return dataBuffer;
    };

    /**
     * @description Searchs the buffer for a "$$$" or as we call an EOT
     * @param dataBuffer - The buffer of some length to parse
     * @returns {boolean} - True if the `$$$` was found.
     */
    OpenBCIBoard.prototype._doesBufferHaveEOT = function(dataBuffer) {
        const s = new StreamSearch(new Buffer(k.OBCIParseEOT));

        // Clear the buffer
        s.reset();

        // Push the new data buffer. This runs the search.
        s.push(dataBuffer);

        // Check and see if there is a match
        return s.matches === 1;
    };

    /**
     * @description Alters the global info object by parseing an incoming soft reset key
     * @param dataBuffer {Buffer} - The soft reset data buffer
     * @private
     */
    OpenBCIBoard.prototype._processParseBufferForReset = function(dataBuffer) {
        if (this._countADSPresent(dataBuffer) === 2) {
            this.info.boardType = k.OBCIBoardDaisy;
            this.info.numberOfChannels = k.OBCINumberOfChannelsDaisy;
            this.info.sampleRate = k.OBCISampleRate125;
        } else {
            this.info.boardType = k.OBCIBoardDefault;
            this.info.numberOfChannels = k.OBCINumberOfChannelsDefault;
            this.info.sampleRate = k.OBCISampleRate250;
        }

        if (this._findV2Firmware(dataBuffer)) {
            this.info.firmware = k.OBCIFirmwareV2;
        } else {
            this.info.firmware = k.OBCIFirmwareV1;
        }
    };

    /**
     * @description Since we know exactly what this input will look like (See the hardware firmware) we can program this
     *      function with proior knowledge.
     * @param dataBuffer - The buffer you want to parse.
     * @return {Number} - The number of "ADS1299" present in the `dataBuffer`
     * @private
     */
    OpenBCIBoard.prototype._countADSPresent = function(dataBuffer) {
        const s = new StreamSearch(new Buffer("ADS1299"));

        // Clear the buffer
        s.reset();

        // Push the new data buffer. This runs the search.
        s.push(dataBuffer);

        // Check and see if there is a match
        return s.matches;
    };


    /**
     * @description Used to parse a soft reset response to determine if the board is running the v2 firmware
     * @param dataBuffer {Buffer} - The data to parse
     * @returns {boolean} - True if `v2`is indeed found in the `dataBuffer`
     * @private
     */
    OpenBCIBoard.prototype._findV2Firmware = function(dataBuffer) {
        const s = new StreamSearch(new Buffer(k.OBCIParseFirmware));

        // Clear the buffer
        s.reset();

        // Push the new data buffer. This runs the search.
        s.push(dataBuffer);

        // Check and see if there is a match
        return s.matches === 1;
    };


    /**
     * @description Used to parse a buffer for the `,` character that is acked back after a time sync request is sent
     * @param dataBuffer - The buffer of some length to parse
     * @returns {boolean} - True if the `,` was found.
     */
    OpenBCIBoard.prototype._isTimeSyncSetConfirmationInBuffer = function(dataBuffer) {
        const s = new StreamSearch(new Buffer(k.OBCISyncTimeSent));

        // Clear the buffer
        s.reset();

        // Push the new data buffer. This runs the search.
        s.push(dataBuffer);

        // Check and see if there is a match
        return s.matches === 1;
    };

    // OpenBCIBoard.prototype._extractTimeSyncSent = function(dataBuffer) {
    //     const s = new StreamSearch(new Buffer(k.OBCISyncTimeSent));
    //
    //     // Clear the buffer
    //     s.reset();
    //
    //     var tempBuf;
    //     s.on('info', function(isMatch, data, start, end) {
    //         tempBuf = Buffer.concat([tempBuf,dataBuffer.slice(start,end)],tempBuf.byteLength + (end - start));
    //         console.log(`data:${data} | start:${start} | end:${end}`);
    //
    //     });
    //
    //     // Push the new data buffer. This runs the search.
    //     s.push(dataBuffer);
    //    
    // };

    /**
     * @description Used to route qualified packets to their proper parsers
     * @param rawDataPacketBuffer
     */
    OpenBCIBoard.prototype._processQualifiedPacket = function(rawDataPacketBuffer) {
        var packetType = openBCISample.getRawPacketType(rawDataPacketBuffer[k.OBCIPacketPositionStopByte]);
        switch (packetType) {
            case k.OBCIStreamPacketStandardAccel:
                this._processPacketStandardAccel(rawDataPacketBuffer);
                break;
            case k.OBCIStreamPacketStandardRawAux:
                this._processPacketStandardRawAux(rawDataPacketBuffer);
                break;
            case k.OBCIStreamPacketUserDefinedType:
                // Do nothing for User Defined Packets
                break;
            case k.OBCIStreamPacketTimeSyncSet:
                this.sync.timeGotSetPacket = this.sntpNow();
                this._processPacketTimeSyncSet(rawDataPacketBuffer);
                break;
            case k.OBCIStreamPacketTimeSyncedAccel:
                this._processPacketTimeSyncedAccel(rawDataPacketBuffer);
                break;
            case k.OBCIStreamPacketTimeSyncedRawAux:
                this._processPacketTimeSyncedRawAux(rawDataPacketBuffer);
                break;
            default:
                // Don't do anything if the packet is not defined
                break;
        }
    };

    /**
     * @description A method used to compute impedances.
     * @param sampleObject - A sample object that follows the normal standards.
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processImpedanceTest = function(sampleObject) {
        var impedanceArray;
        if (this.impedanceTest.continuousMode) {
            //console.log('running in continuous mode...');
            //openBCISample.debugPrettyPrint(sampleObject);
            impedanceArray = openBCISample.goertzelProcessSample(sampleObject,this.goertzelObject);
            if (impedanceArray) {
                this.emit('impedanceArray',impedanceArray);
            }
        } else if (this.impedanceTest.onChannel != 0) {
            // Only calculate impedance for one channel
            impedanceArray = openBCISample.goertzelProcessSample(sampleObject,this.goertzelObject);
            if (impedanceArray) {
                this.impedanceTest.impedanceForChannel = impedanceArray[this.impedanceTest.onChannel - 1];
            }
        }
    };

    /**
     * @description A method to parse a stream packet that has channel data and data in the aux channels that contains accel data.
     * @param rawPacket - A 33byte data buffer from _processQualifiedPacket
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processPacketStandardAccel = function(rawPacket) {
        openBCISample.parseRawPacketStandard(rawPacket,this.channelSettingsArray)
            .then(sampleObject => {
                //openBCISample.debugPrettyPrint(sampleObject);
                sampleObject.rawPacket = rawPacket;
                this._finalizeNewSample(sampleObject);
            })
            .catch(err => console.log('Error in _processPacketStandardAccel',err));
    };

    /**
     * @description A method to parse a stream packet that has channel data and data in the aux channels that should not be scaled.
     * @param rawPacket - A 33byte data buffer from _processQualifiedPacket
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processPacketStandardRawAux = function(rawPacket) {
        openBCISample.parseRawPacketStandard(rawPacket,this.channelSettingsArray,false)
            .then(this._finalizeNewSample)
            .catch(err => console.log('Error in _processPacketStandardRawAux',err));
    };


    /**
     * @description A method to parse a stream packet that does not have channel data or aux/accel data, just a timestamp
     * @param rawPacket - A 33byte data buffer from _processQualifiedPacket
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processPacketTimeSyncSet = function(rawPacket) {
        if (this.options.verbose) console.log('Got time set packet from the board');
        openBCISample.getFromTimePacketTime(rawPacket)
            .then(boardTime => {
                this.sync.timeRoundTrip = this.sync.timeGotSetPacket - this.sync.timeSent;
                this.sync.timeTransmission = this.sync.timeRoundTrip / 2;
                this.sync.timeOffset = this.sync.timeGotSetPacket - this.sync.timeTransmission - boardTime;
                this.sync.active = true;
                if (this.options.verbose) {
                    console.log("Board time: " + boardTime);
                    console.log('Board offset time: ' + this.sync.timeOffset);
                    console.log("Queue time to actual send time: " + (this.sync.timeSent - this.sync.timeEnteredQueue) + " ms");
                    console.log("Round trip time: " + this.sync.timeRoundTrip + " ms");
                    console.log("Transmission time: " + this.sync.timeTransmission + " ms");
                    console.log("Corrected board time: " + (this.sync.timeOffset + boardTime) + " ms");
                    console.log("Diff between corrected board time and actual time we got that packet: " + ((this.sync.timeSent + this.sync.timeTransmission) - (boardTime + this.sync.timeOffset)) + " ms");
                }
                this.emit('synced',this.sync);
            })
            .catch(err => console.log('Error in _processPacketTimeSyncSet', err));
    };

    /**
     * @description A method to parse a stream packet that contains channel data, a time stamp and event couple packets
     *      an accelerometer value.
     * @param rawPacket - A 33byte data buffer from _processQualifiedPacket
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processPacketTimeSyncedAccel = function(rawPacket) {
        if (this.sync.active === false) console.log('Need to sync with board...');
        openBCISample.parsePacketTimeSyncedAccel(rawPacket, this.channelSettingsArray, this.sync.timeOffset, this.accelArray)
            .then((sampleObject) => {
                sampleObject.rawPacket = rawPacket;
                this._finalizeNewSample(sampleObject);
            })
            .catch(err => console.log('Error in _processPacketTimeSyncedAccel',err));
    };

    /**
     * @description A method to parse a stream packet that contains channel data, a time stamp and two extra bytes that
     *      shall be emitted as a raw buffer and not scaled.
     * @param rawPacket - A 33byte data buffer from _processQualifiedPacket
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._processPacketTimeSyncedRawAux = function(rawPacket) {
        if (this.sync.active === false) console.log('Need to sync with board...');
        openBCISample.parsePacketTimeSyncedAccel(rawPacket, this.channelSettingsArray, this.sync.timeOffset, this.accelArray)
            .then(this._finalizeNewSample)
            .catch(err => console.log('Error in _processPacketTimeSyncedAccel',err));
    };

    /**
     * @description A method to emit samples through the EventEmitter channel `sample` or compute impedances if are
     *      being tested.
     * @param sampleObject - A sample object that follows the normal standards.
     * @private
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._finalizeNewSample = function(sampleObject) {
        sampleObject._count = this.sampleCount++;
        if(this.impedanceTest.active) {
            this._processImpedanceTest(sampleObject);
        } else {
            // console.log('sample',sampleObject);
            this.emit('sample', sampleObject);
        }
    };

    /**
     * @description Reset the master buffer and reset the number of bad packets.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype._reset = function() {
        this.masterBuffer = masterBufferMaker();
        this.badPackets = 0;
    };

    /**
     * @description Stateful method for querying the current offset only when the last
     *                  one is too old. (defaults to daily)
     * @returns {Promise} A promise with the time offset
     * @author AJ Keller (@pushtheworldllc)
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
     * @description Get time from the SNTP server. Must have internet connection!
     * @returns {Promise} - Fulfilled with time object
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sntpGetServerTime = function() {
        return new Promise((resolve,reject) => {
            Sntp.time(this.sntpOptions, (err, time) => {

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
     * @description Allows users to utilize all features of sntp if they want to...
     */
    OpenBCIBoard.prototype.sntp = Sntp;

    /**
     * @description This gets the time plus offset
     */
    OpenBCIBoard.prototype.sntpNow = Sntp.now;

    /**
     * @description This starts the SNTP server and gets it to remain in sync with the SNTP server
     * @returns {Promise} - A promise if the module was able to sync with ntp server.
     * @author AJ Keller (@pushtheworldllc)
     */
    OpenBCIBoard.prototype.sntpStart = function() {
        return new Promise((resolve, reject) => {
            Sntp.start((err) => {
                if (err) {
                    this.sync.active = true;
                    reject(err);
                } else {
                    this.sync.active = false;
                    resolve();
                }
            });
        });
    };

    /**
     * @description Stops the sntp from updating
     */
    OpenBCIBoard.prototype.sntpStop = function() {
        Sntp.stop();
        this.sync.active = false;
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
