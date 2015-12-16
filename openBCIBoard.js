var serialport = require('serialport');
module.exports = {
    streaming: false,
    serial: null,
    createBoard: function(board){
        return new serialport.SerialPort(board.port, {
            baudrate: board.baudrate,
            parser: serialport.parsers.byteLength(33)
        });
    },
    listPorts: function() {
        serialport.list(function (err, ports) {
            if (err) {
                return err;
            } else {
                return ports;
            }
        });
    }
    // TODO: boardCheckConnection (py: check_connection)
    // TODO: boardDisconnect (py: disconnect)
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
    // TODO: streamStart (py: start_streaming)
    // TODO: streamStop (py: stop)
    // TODO: warn
    // TODO:
};

function writeAndDrain(data, callback) {
    serialport.write(data, function() {
        serialport.drain(callback);
    })
}