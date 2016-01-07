// This takes a openbci-sdk factory and mocks the shit out of it in complete isolation per require of this file

"use strict";

var Hardware = function () {
    this.bciBoard = {};
    //this.mockBinding = {
    //    connect: this.connect.bind(this),
    //    disconnect: this.disconnect.bind(this),
    //    streamStart: this.streamStart.bind(this),
    //    streamStop: this.streamStop.bind(this),
    //    write: this.write.bind(this),
    //    softReset: this.softReset.bind(this),
    //    autoFindOpenBCIBoard: this.autoFindOpenBCIBoard.bind(this),
    //    simulatorStart: this.simulatorStart.bind(this),
    //    simulatorStop: this.simulatorStop.bind(this)
    //};
};

Hardware.prototype.reset = function () {
    this.bciBoard = {};
};

Hardware.prototype.createBoard = function () {
    this.bciBoard = {
        serial: null,
        connected: false,
        streaming: false,
        isSimulating: false,
        badPackets: 0,
        bytesIn: 0,
        commandsToWrite: 0,
        sampleCount: 0
    }
};

Hardware.prototype.connect = function (portName) {

    return new Promise((resolve, reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.connected = true;
        this.bciBoard.serial = {
            portName:portName,
            baudRate:115200
        };
        resolve(this.bciBoard.serial);
    });
};

Hardware.prototype.disconnect = function () {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.connected = false;
        this.bciBoard.serial = null;
    });
};

Hardware.prototype.streamStart = function () {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.streaming = true;
        resolve();
    });
};

Hardware.prototype.streamStop = function () {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.streaming = false;
        resolve();
    });
};

Hardware.prototype.simulatorStart = function () {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.isSimulating = true;
        resolve();
    });
};

Hardware.prototype.simulatorStop = function () {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.isSimulating = false;
        resolve();
    });
};

Hardware.prototype.autoFindOpenBCIBoard = function () {
    return new Promise((resolve,reject) => {
        resolve('/dev/tty.usbserial-D069XXX');
    });
};

Hardware.prototype.emitSample = function (data) {
    return new Promise((resolve,reject) => {
        if(!this.bciBoard) reject('Board does not exist - call hardware.createBoard() first');

        this.bciBoard.isSimulating = false;
        resolve();
    });
};

Hardware.prototype.fakeData = function (data) {
    //do something, not quite sure what yet...
};

var hardware = new Hardware();

var SandboxedModule = require('sandboxed-module');

var openBCIBoard = SandboxedModule.require('../openBCIBoard', {
    requires: {
        fs: {
            read: hardware.fakeData.bind(hardware)
        }
    },
    globals: {
        process: {
            platform: 'darwin',
            nextTick: process.nextTick
        }
    }
});

openBCIBoard.hardware = hardware;

module.exports = openBCIBoard;