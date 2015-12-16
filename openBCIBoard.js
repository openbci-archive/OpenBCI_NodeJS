var k = require('./OpenBCIConstants');
var openBCISample = require('OpenBCISample');
var serialPort = require('serialport');
var Serialport = serialPort.SerialPort;
var EventEmitter = require('events').EventEmitter;
var util = require('util');


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

        callback = callback || function(err) {
                if(err) {
                    if(self._events.error) {
                        self.emit('error', err);
                    } else {
                        factory.emit('error', err);
                    }
                }
            };

        var err;

        opts.baudRate = options.baudRate || options.baudrate || _options.baudrate;

        opts.daisy = options.daisy || options.daisy || _options.daisy;

        if(!portName) {
            err = new Error('Invalid port specified: ' + portName);
            callback(err);
            return;
        }
        this.options = opts;
        this.portName = portName;
        if(connectImmediately) {
            process.nextTick(function() {
                self.boardConnect(callback);
            });
        }
    }

    //OpenBCIBoard.prototype.listPorts = serialPort.listPorts;

    OpenBCIBoard.prototype.boardConnect = function(callback) {
        var self = this;
        this.paused = false;
        this.connected = true;
        var boardSerial = new Serialport(this.portName, {
            baudrate: this.baudrate,
            parser: serialport.parsers.byteLength(33)
        });

        boardSerial.on('open', function() {
            console.log('open');
            self.connected = true;
            boardSerial.on('data', function(data) {
                console.log('data recieved: ' + data);
                self.emit('sample', OpenBCISample.convertPacketToSample(data));
            });
        });
        boardSerial.on('close', function() {
            self.connected = false;
            self.emit('disconnected');
            console.log('serial connection closed');
        });
        this.serial = boardSerial;

        writeAndDrain(boardSerial, k.OBCIStreamStart, function() {
            self.emit('connected');
        });


        if (callback) { callback(); }

    };

    OpenBCIBoard.prototype.boardDisconnect = function() {
        this.connected = false;
        if(this.serial.isOpen()) {
            this.serial.close();
        }
    };

    /**
     * Used to send a start signal to a connected device
     * @param callback - contains an error message
     */
    OpenBCIBoard.prototype.streamStart = function(callback) {
        if(this.connected) {
            if(this.streaming === false) {
                this.streaming = true;
                writeAndDrain(this.serial,k.OBCIStreamStart);
            } else {
                callback("All ready streaming")
            }
        } else {
            callback("No device connected");
        }
        if (callback) { callback(); }
    };

    OpenBCIBoard.prototype.streamStop = function() {
        if(this.streaming) {
            this.streaming = false;
            writeAndDrain(this.serial,k.OBCIStreamStop);
        }
    };
    // TODO: boardCheckConnection (py: check_connection)

    // TODO: boardReconnect (py: reconnect)
    // TODO: filtersDisable (py: disable_filters)
    // TODO: filtersEnable (py: enable_filters)
    // TODO: getSampleRate
    // TODO: getNbEEGChannels
    // TODO: getNbAUXChannels
    // TODO: printIncomingText (py: print_incomming_text)
    // TODO: printRegisterSettings (py: print)register_settings)
    // TODO: printBytesIn (py: print_bytes_in)
    // TODO: printPacketsIn (py: print_packets_in)
    // TODO: warn

}

util.inherits(OpenBCIFactory, EventEmitter);

module.exports = new OpenBCIFactory();

/**
 * Should be used to send data to the board
 * @param boardSerial
 * @param data
 * @param callback
 */
function writeAndDrain(boardSerial,data, callback) {
    boardSerial.write(data, function() {
        boardSerial.drain(callback);
    })
}


