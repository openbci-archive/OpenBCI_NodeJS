var OpenBCIBoard = require("./OpenBCIBoard").OpenBCIBoard;

var serialPortName = "/dev/ttyUSB0";

var openBCIBoard = new OpenBCIBoard(serialPortName);



process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    if (openBCIBoard){
        openBCIBoard.close();
    }
    process.exit();
});
