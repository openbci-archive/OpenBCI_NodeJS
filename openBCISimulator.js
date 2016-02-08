'use strict';

var EventEmitter = require('events').EventEmitter;
var util = require('util');
var stream = require('stream');

var openBCISample = require('./openBCISample');
var k = openBCISample.k;


function OpenBCISimulatorFactory() {
    var factory = this;



    var _options = {
        samplerate: 250,
        daisy: false,
        verbose: false
    };



    function OpenBCISimulator(portName, options) {
        options = (typeof options !== 'function') && options || {};
        var opts = {};

        stream.Stream.call(this);

        /** Configuring Options */
        opts.sampleRate = options.sampleRate || options.samplerate || _options.samplerate;
        opts.daisy = options.daisy || _options.daisy;
        opts.verbose = options.verbose || _options.verbose;

        this.options = opts;

        // Bools
        this.connected = false;
        // Buffers
        this.buffer = new Buffer(500);
        // Numbers
        this.sampleNumber = -1; // So the first sample is 0
        // Strings
        this.portName = portName || k.OBCISimulatorPortName;

        // Call 'open'
        setTimeout(() => {
            console.log('Port name: ' + portName);
            if (portName === k.OBCISimulatorPortName) {
                this.emit('open');
                this.connected = true;
            } else {
                var err = new Error('Serialport not open.');
                this.emit('error',err);
            }
        }, 200);

    }

    // This allows us to use the emitter class freely outside of the module
    util.inherits(OpenBCISimulator, stream.Stream);

    OpenBCISimulator.prototype.flush = function() {
        this.buffer.fill(0);
        //if (this.options.verbose) console.log('flushed');
    };

    OpenBCISimulator.prototype.write = function(data,callback) {
        if (data[0] === k.OBCIStreamStart) {
            if (!this.stream) this._startStream();
        } else if (data[0] === k.OBCIStreamStop) {
            if (this.stream) clearInterval(this.stream); // Stops the stream
        } else if (data[0] === k.OBCIMiscSoftReset) {
            if (this.stream) clearInterval(this.stream);
            this.emit('data', new Buffer('OpenBCI Board Simulator\nPush The World V-0.2\n$$$'));
        }

        /** Handle Callback */
        if (this.connected) {
            callback(null,'Success!');
        }
    };

    OpenBCISimulator.prototype.drain = function(callback) {
        callback();
        //if (this.options.verbose) console.log('drain');
    };

    OpenBCISimulator.prototype.close = function(callback) {
        if (this.connected) {
            this.emit('close');
        }
        this.connected = false;
        //if (this.options.verbose) console.log('close');
        callback();
    };

    OpenBCISimulator.prototype._startStream = function() {
        var intervalInMS = 1000 / this.options.sampleRate;

        if (intervalInMS < 2) intervalInMS = 2;

        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        var getNewPacket = sampNumber => {
            return openBCISample.convertSampleToPacket(generateSample(sampNumber));
        };

        this.stream = setInterval(() => {
            this.emit('data', getNewPacket(this.sampleNumber));
            this.sampleNumber++;
        }, intervalInMS);
    };

    factory.OpenBCISimulator = OpenBCISimulator;

}

util.inherits(OpenBCISimulatorFactory, EventEmitter);

module.exports = new OpenBCISimulatorFactory();