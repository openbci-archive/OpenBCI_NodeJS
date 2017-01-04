'use strict';
var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');

var openBCISample = require('./openBCISample');
var k = openBCISample.k;
var now = require('performance-now');

function OpenBCISimulatorFactory () {
  var factory = this;

  var _options = {
    accel: true,
    alpha: true,
    boardFailure: false,
    daisy: false,
    daisyCanBeAttached: true,
    drift: 0,
    firmwareVersion: [k.OBCIFirmwareV1, k.OBCIFirmwareV2],
    fragmentation: [k.OBCISimulatorFragmentationNone, k.OBCISimulatorFragmentationRandom, k.OBCISimulatorFragmentationFullBuffers, k.OBCISimulatorFragmentationOneByOne],
    latencyTime: 16,
    bufferSize: 4096,
    lineNoise: [k.OBCISimulatorLineNoiseHz60, k.OBCISimulatorLineNoiseHz50, k.OBCISimulatorLineNoiseNone],
    sampleRate: 250,
    serialPortFailure: false,
    verbose: false
  };

  function OpenBCISimulator (portName, options) {
    options = (typeof options !== 'function') && options || {};
    var opts = {};

    stream.Stream.call(this);

    /** Configuring Options */
    var o;
    for (o in _options) {
      var userValue = options[o];
      delete options[o];

      if (typeof _options[o] === 'object') {
        // an array specifying a list of choices
        // if the choice is not in the list, the first one is defaulted to

        if (_options[o].indexOf(userValue) !== -1) {
          opts[o] = userValue;
        } else {
          opts[o] = _options[o][0];
        }
      } else {
        // anything else takes the user value if provided, otherwise is a default

        if (userValue !== undefined) {
          opts[o] = userValue;
        } else {
          opts[o] = _options[o];
        }
      }
    }

    for (o in options) throw new Error('"' + o + '" is not a valid option');

    this.options = opts;

    // Bools
    this.connected = false;
    this.sd = {
      active: false,
      startTime: 0
    };
    this.streaming = false;
    this.synced = false;
    this.sendSyncSetPacket = false;
    // Buffers
    this.outputBuffer = new Buffer(this.options.bufferSize);
    this.outputBuffered = 0;
    // Numbers
    this.channelNumber = 1;
    this.hostChannelNumber = this.channelNumber;
    this.pollTime = 80;
    this.sampleNumber = -1; // So the first sample is 0
    // Objects
    this.sampleGenerator = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, this.options.sampleRate, this.options.alpha, this.options.lineNoise);
    this.time = {
      current: 0,
      start: now(),
      loop: null
    };
    // Strings
    this.portName = portName || k.OBCISimulatorPortName;

    // Call 'open'
    if (this.options.verbose) console.log(`Port name: ${portName}`);
    setTimeout(() => {
      this.connected = true;
      this.emit('open');
    }, 200);
  }

  // This allows us to use the emitter class freely outside of the module
  // TODO: upgrade from old-style streams to stream.Duplex or stream.Transform
  util.inherits(OpenBCISimulator, stream.Stream);

  OpenBCISimulator.prototype.flush = function (callback) {
    this.outputBuffered = 0;

    clearTimeout(this.outputLoopHandle);
    this.outputLoopHandle = null;

    if (callback) callback();
  };

  OpenBCISimulator.prototype.isOpen = function () {
    return this.connected;
  };

  // output only size bytes of the output buffer
  OpenBCISimulator.prototype._partialDrain = function (size) {
    if (!this.connected) throw new Error('not connected');

    if (size > this.outputBuffered) size = this.outputBuffered;

    // buffer is copied because presently openBCIBoard.js reuses it
    var outBuffer = new Buffer(this.outputBuffer.slice(0, size));

    this.outputBuffer.copy(this.outputBuffer, 0, size, this.outputBuffered);
    this.outputBuffered -= size;

    this.emit('data', outBuffer);
  };

  // queue some data for output and send it out depending on options.fragmentation
  OpenBCISimulator.prototype._output = function (dataBuffer) {
    // drain full buffers until there is no overflow
    while (this.outputBuffered + dataBuffer.length > this.outputBuffer.length) {
      var len = dataBuffer.copy(this.outputBuffer, this.outputBuffered);
      dataBuffer = dataBuffer.slice(len);
      this.outputBuffered += len;

      this._partialDrain(this.outputBuffered);
      this.flush();
    }

    dataBuffer.copy(this.outputBuffer, this.outputBuffered);
    this.outputBuffered += dataBuffer.length;

    if (!this.outputLoopHandle) {
      var latencyTime = this.options.latencyTime;
      if (this.options.fragmentation === k.OBCISimulatorFragmentationOneByOne ||
          this.options.fragmentation === k.OBCISimulatorFragmentationNone) {
        // no need to wait for latencyTime
        // note that this is the only difference between 'none' and 'fullBuffers'
        latencyTime = 0;
      }
      var outputLoop = () => {
        var size;
        switch (this.options.fragmentation) {
          case k.OBCISimulatorFragmentationRandom:
            if (Math.random() < 0.5) {
              // randomly picked to send out a fragment
              size = Math.ceil(Math.random() * Math.max(this.outputBuffered, 62));
              break;
            } // else, randomly picked to send a complete buffer in next block
            /* falls through */
          case k.OBCISimulatorFragmentationFullBuffers:
          case k.OBCISimulatorFragmentationNone:
          case false:
            size = this.outputBuffered;
            break;
          case k.OBCISimulatorFragmentationOneByOne:
            size = 1;
            break;
        }
        this._partialDrain(size);
        if (this.outputBuffered) {
          this.outputLoopHandle = setTimeout(outputLoop, latencyTime);
        } else {
          this.outputLoopHandle = null;
        }
      };
      if (latencyTime === 0) {
        outputLoop();
      } else {
        this.outputLoopHandle = setTimeout(outputLoop, latencyTime);
      }
    }
  };

  OpenBCISimulator.prototype.write = function (data, callback) {
    if (!this.connected) {
      if (callback) callback('Not connected');
      else throw new Error('Not connected!');
      return;
    }

    // TODO: this function assumes a type of Buffer for radio, and a type of String otherwise
    //       FIX THIS it makes it unusable outside the api code
    switch (data[0]) {
      case k.OBCIRadioKey:
        this._processPrivateRadioMessage(data);
        break;
      case k.OBCIStreamStart:
        if (!this.stream) this._startStream();
        this.streaming = true;
        break;
      case k.OBCIStreamStop:
        if (this.stream) clearInterval(this.stream); // Stops the stream
        this.streaming = false;
        break;
      case k.OBCIMiscSoftReset:
        if (this.stream) clearInterval(this.stream);
        this.streaming = false;
        this._output(new Buffer(`OpenBCI V3 Simulator On Board ADS1299 Device ID: 0x12345 ${this.options.daisy ? `On Daisy ADS1299 Device ID: 0xFFFFF\n` : ``} LIS3DH Device ID: 0x38422 ${this.options.firmwareVersion === k.OBCIFirmwareV2 ? `Firmware: v2.0.0\n` : ``}$$$`));
        break;
      case k.OBCISDLogForHour1:
      case k.OBCISDLogForHour2:
      case k.OBCISDLogForHour4:
      case k.OBCISDLogForHour12:
      case k.OBCISDLogForHour24:
      case k.OBCISDLogForMin5:
      case k.OBCISDLogForMin15:
      case k.OBCISDLogForMin30:
      case k.OBCISDLogForSec14:
        // If we are not streaming, then do verbose output
        if (!this.streaming) {
          this._output(new Buffer('Wiring is correct and a card is present.\nCorresponding SD file OBCI_69.TXT\n$$$'));
        }
        this.sd.active = true;
        this.sd.startTime = now();
        break;
      case k.OBCISDLogStop:
        if (!this.streaming) {
          if (this.SDLogActive) {
            this._output(new Buffer(`Total Elapsed Time: ${now() - this.sd.startTime} ms`));
            this._output(new Buffer(`Max write time: ${Math.random() * 500} us`));
            this._output(new Buffer(`Min write time: ${Math.random() * 200} us`));
            this._output(new Buffer(`Overruns: 0`));
            this._printEOT();
          } else {
            this._output(new Buffer('No open file to close\n'));
            this._printEOT();
          }
        }
        this.SDLogActive = false;
        break;
      case k.OBCISyncTimeSet:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          this.synced = true;
          setTimeout(() => {
            this._output(new Buffer(k.OBCISyncTimeSent));
            this._syncUp();
          }, 10);
        }
        break;
      case k.OBCIChannelMaxNumber8:
        if (this.options.daisy) {
          this.options.daisy = false;
          this._output(new Buffer(k.OBCIChannelMaxNumber8SuccessDaisyRemoved));
          this._printEOT();
        } else {
          this._printEOT();
        }
        break;
      case k.OBCIChannelMaxNumber16:
        if (this.options.daisy) {
          this._output(new Buffer(k.OBCIChannelMaxNumber16DaisyAlreadyAttached));
          this._printEOT();
        } else {
          if (this.options.daisyCanBeAttached) {
            this.options.daisy = true;
            this._output(new Buffer(k.OBCIChannelMaxNumber16DaisyAttached));
            this._printEOT();
          } else {
            this._output(new Buffer(k.OBCIChannelMaxNumber16NoDaisyAttached));
            this._printEOT();
          }
        }
        break;
      default:
        break;
    }

    /** Handle Callback */
    if (callback) {
      callback(null, 'Success!');
    }
  };

  OpenBCISimulator.prototype.drain = function (callback) {
    if (callback) callback();
  };

  OpenBCISimulator.prototype.close = function (callback) {
    if (this.connected) {
      this.flush();

      if (this.stream) clearInterval(this.stream);

      this.connected = false;
      this.emit('close');
      if (callback) callback();
    } else {
      if (callback) callback('not connected');
    }
  };

  OpenBCISimulator.prototype._startStream = function () {
    var intervalInMS = 1000 / this.options.sampleRate;

    if (intervalInMS < 2) intervalInMS = 2;

    var getNewPacket = sampNumber => {
      if (this.options.accel) {
        if (this.synced) {
          if (this.sendSyncSetPacket) {
            this.sendSyncSetPacket = false;
            return openBCISample.convertSampleToPacketAccelTimeSyncSet(this.sampleGenerator(sampNumber), now().toFixed(0));
          } else {
            return openBCISample.convertSampleToPacketAccelTimeSynced(this.sampleGenerator(sampNumber), now().toFixed(0));
          }
        } else {
          return openBCISample.convertSampleToPacketStandard(this.sampleGenerator(sampNumber));
        }
      } else {
        if (this.synced) {
          if (this.sendSyncSetPacket) {
            this.sendSyncSetPacket = false;
            return openBCISample.convertSampleToPacketRawAuxTimeSyncSet(this.sampleGenerator(sampNumber), now().toFixed(0), new Buffer([0, 0, 0, 0, 0, 0]));
          } else {
            return openBCISample.convertSampleToPacketRawAuxTimeSynced(this.sampleGenerator(sampNumber), now().toFixed(0), new Buffer([0, 0, 0, 0, 0, 0]));
          }
        } else {
          return openBCISample.convertSampleToPacketRawAux(this.sampleGenerator(sampNumber), new Buffer([0, 0, 0, 0, 0, 0]));
        }
      }
    };

    this.stream = setInterval(() => {
      this._output(getNewPacket(this.sampleNumber));
      this.sampleNumber++;
    }, intervalInMS);
  };

  OpenBCISimulator.prototype._syncUp = function () {
    setTimeout(() => {
      this.sendSyncSetPacket = true;
    }, 12); // 3 packets later
  };

  OpenBCISimulator.prototype._printEOT = function () {
    this._output(new Buffer('$$$'));
  };

  OpenBCISimulator.prototype._printFailure = function () {
    this._output(new Buffer('Failure: '));
  };

  OpenBCISimulator.prototype._printSuccess = function () {
    this._output(new Buffer('Success: '));
  };

  OpenBCISimulator.prototype._printValidatedCommsTimeout = function () {
    this._printFailure();
    this._output(new Buffer('Communications timeout - Device failed to poll Host'));
    this._printEOT();
  };

  OpenBCISimulator.prototype._processPrivateRadioMessage = function (dataBuffer) {
    switch (dataBuffer[1]) {
      case k.OBCIRadioCmdChannelGet:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (!this.options.boardFailure) {
            this._printSuccess();
            this._output(new Buffer(`Host and Device on Channel Number ${this.channelNumber}`));
            this._output(new Buffer([this.channelNumber]));
            this._printEOT();
          } else if (!this.serialPortFailure) {
            this._printFailure();
            this._output(new Buffer(`Host on Channel Number ${this.channelNumber}`));
            this._output(new Buffer([this.channelNumber]));
            this._printEOT();
          }
        }
        break;
      case k.OBCIRadioCmdChannelSet:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (!this.options.boardFailure) {
            if (dataBuffer[2] <= k.OBCIRadioChannelMax) {
              this.channelNumber = dataBuffer[2];
              this.hostChannelNumber = this.channelNumber;
              this._printSuccess();
              this._output(new Buffer(`Channel Number ${this.channelNumber}`));
              this._output(new Buffer([this.channelNumber]));
              this._printEOT();
            } else {
              this._printFailure();
              this._output(new Buffer('Verify channel number is less than 25'));
              this._printEOT();
            }
          } else if (!this.serialPortFailure) {
            this._printValidatedCommsTimeout();
          }
        }
        break;
      case k.OBCIRadioCmdChannelSetOverride:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (dataBuffer[2] <= k.OBCIRadioChannelMax) {
            if (dataBuffer[2] === this.channelNumber) {
              this.options.boardFailure = false;
            } else {
              this.options.boardFailure = true;
            }
            this.hostChannelNumber = dataBuffer[2];
            this._printSuccess();
            this._output(new Buffer(`Host override - Channel Number ${this.hostChannelNumber}`));
            this._output(new Buffer([this.hostChannelNumber]));
            this._printEOT();
          } else {
            this._printFailure();
            this._output(new Buffer('Verify channel number is less than 25'));
            this._printEOT();
          }
        }
        break;
      case k.OBCIRadioCmdPollTimeGet:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (!this.options.boardFailure) {
            this._printSuccess();
            this._output(new Buffer(`Poll Time ${this.pollTime}`));
            this._output(new Buffer([this.pollTime]));
            this._printEOT();
          } else {
            this._printValidatedCommsTimeout();
          }
        }
        break;
      case k.OBCIRadioCmdPollTimeSet:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (!this.options.boardFailure) {
            this.pollTime = dataBuffer[2];
            this._printSuccess();
            this._output(new Buffer(`Poll Time ${this.pollTime}`));
            this._output(new Buffer([this.pollTime]));
            this._printEOT();
          } else {
            this._printValidatedCommsTimeout();
          }
        }
        break;
      case k.OBCIRadioCmdBaudRateSetDefault:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          this._printSuccess();
          this._output(new Buffer('Switch your baud rate to 115200'));
          this._output(new Buffer([0x24, 0x24, 0x24, 0xFF])); // The board really does this
        }
        break;
      case k.OBCIRadioCmdBaudRateSetFast:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          this._printSuccess();
          this._output(new Buffer('Switch your baud rate to 230400'));
          this._output(new Buffer([0x24, 0x24, 0x24, 0xFF])); // The board really does this
        }
        break;
      case k.OBCIRadioCmdSystemStatus:
        if (this.options.firmwareVersion === k.OBCIFirmwareV2) {
          if (!this.options.boardFailure) {
            this._printSuccess();
            this._output(new Buffer('System is Up'));
            this._printEOT();
          } else {
            this._printFailure();
            this._output(new Buffer('System is Down'));
            this._printEOT();
          }
        }
        break;
      default:
        break;
    }
  };

  factory.OpenBCISimulator = OpenBCISimulator;
}

util.inherits(OpenBCISimulatorFactory, EventEmitter);

module.exports = new OpenBCISimulatorFactory();
