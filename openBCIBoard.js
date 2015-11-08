var serialport = require('serialport');
module.exports = {
  streaming: false,
  serial: null,
  createBoard: function(board){
    return new serialport.SerialPort(board.port, {
      baudrate: board.baudrate,
      parser: this.parseData
    });
  },
  parseData: function(evt, data){
    console.log("evt: " + evt + "\n" + "data: " + data);
  }
};
