var sinon = require('sinon'),
    chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    openBCISimulator = require('../openBCISimulator'),
    openBCISample = require('../openBCISample'),
    k = openBCISample.k;

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);
var bufferEqual = require('buffer-equal');
var fs = require('fs');

describe('openBCISimulator',function() {
    this.timeout(4000);
    var portName = k.OBCISimulatorPortName;
    describe('#constructor', function () {
        var simulator;
        afterEach(() => {
            simulator = null;
        });
        after(done => {
            setTimeout(() => {
                // Since there is a conditional timeout, it's important to wait to start the next test till this ends for sure
                done();
            }, 200); // The same amount of time in the simulator
        });
        it('constructs with the correct default options', function() {
            simulator = new openBCISimulator.OpenBCISimulator();
            expect(simulator.options.accel).to.be.true;
            expect(simulator.options.alpha).to.be.true;
            expect(simulator.options.boardFailure).to.be.false;
            expect(simulator.options.daisy).to.be.false;
            expect(simulator.options.drift).to.equal(0);
            expect(simulator.options.firmwareVersion).to.equal(k.OBCIFirmwareV1);
            expect(simulator.options.lineNoise).to.equal(k.OBCISimulatorLineNoiseHz60);
            expect(simulator.options.sampleRate).to.equal(k.OBCISampleRate250);
            expect(simulator.options.serialPortFailure).to.be.false;
            expect(simulator.options.verbose).to.be.false;
        });
        it('should be able to get into daisy mode',function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                daisy: true
            });
            expect(simulator.options.daisy).to.be.true;
        });
        it('should set the correct sample rate in daisy mode, if no sampleRate is provided',function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                daisy: true
            });
            expect(simulator.options.sampleRate).to.equal(125);
        });
        it('should use provided sample rate even if daisy is true',function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                daisy: true,
                sampleRate: 20
            });
            expect(simulator.options.daisy).to.be.true;
            expect(simulator.options.sampleRate).to.equal(20);
        });
        it('should be able to put into firmware version 2', function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                firmwareVersion: 'v2'
            });
            expect(simulator.options.firmwareVersion).to.equal(k.OBCIFirmwareV2);
        });
        it('should be able to simulate board failure',function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                boardFailure: true
            });
            expect(simulator.options.boardFailure).to.be.true;
        });
        it('should be able to simulate serial port failure',function () {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                serialPortFailure: true
            });
            expect(simulator.options.serialPortFailure).to.be.true;
        });
        it('can turn 50Hz line noise on', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                lineNoise: '50Hz'
            });
            (simulator.options.lineNoise).should.equal(k.OBCISimulatorLineNoiseHz50);
        });
        it('can turn no line noise on', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                lineNoise: 'None'
            });
            (simulator.options.lineNoise).should.equal(k.OBCISimulatorLineNoiseNone);
        });
        it('should not inject alpha if desired', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                alpha: false
            });
            expect(simulator.options.alpha).to.be.false;
        });
        it('should be able to not use the accel', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                accel: false
            });
            expect(simulator.options.accel).to.be.false;
        });
        it('should be able to set positive drift', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                drift: 1
            });
            expect(simulator.options.drift).to.be.greaterThan(0);
        });
        it('should be able to set negative drift', function() {
            simulator = new openBCISimulator.OpenBCISimulator(portName,{
                drift: -1
            });
            expect(simulator.options.drift).to.be.lessThan(0);
        });
    });
    describe("firmwareVersion1",function () {

    });
    describe("firmwareVersion2",function () {
        var simulator;
        beforeEach(() => {
            simulator = new openBCISimulator.OpenBCISimulator(k.OBCISimulatorPortName,{
                firmwareVersion: 'v2'
            });
        });
        afterEach(() => {
            simulator = null;
        });
        describe('_processPrivateRadioMessage',function () {
            describe('OBCIRadioCmdChannelGet',function () {
                it('should emit success if firmware version 2', done => {
                    simulator.channelNumber = 0;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(0);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelGet]));
                });
                it('should emit failure if board failure and host channel number', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    simulator.channelNumber = 9;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            expect(buf[buf.length - 4]).to.equal(9);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelGet]));
                });
            });
            describe('OBCIRadioCmdChannelSet',function () {
                it('should set the channel number if in bounds', done => {
                    var newChanNum = 20;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(newChanNum);
                            expect(simulator.channelNumber).to.equal(newChanNum);
                            expect(simulator.hostChannelNumber).to.equal(newChanNum);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSet,newChanNum]));
                });
                it('should not set the channel number if out of bounds', done => {
                    var newChanNum = 26;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSet,newChanNum]));
                });
                it('should emit failure if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);
                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSet,7]));
                });
            });
            describe('OBCIRadioCmdChannelSetOverride',function () {
                it('should change just the hosts channel number and not the systems channel number and force a board comms failure', done => {
                    var systemChannelNumber = 0;
                    var newHostChannelNumber = 1;
                    simulator.channelNumber = systemChannelNumber;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(newHostChannelNumber);
                            expect(simulator.options.boardFailure).to.be.true;
                            expect(simulator.channelNumber).to.equal(systemChannelNumber);
                            expect(simulator.hostChannelNumber).to.equal(newHostChannelNumber);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSetOverride,newHostChannelNumber]));
                });
                it('should change just the hosts channel number and not the systems channel number and fix a board failure', done => {
                    var systemChannelNumber = 0;
                    var oldHostChannelNumber = 1;
                    simulator.channelNumber = systemChannelNumber;
                    simulator.hostChannelNumber = oldHostChannelNumber;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(systemChannelNumber);
                            expect(simulator.options.boardFailure).to.be.false;
                            expect(simulator.channelNumber).to.equal(systemChannelNumber);
                            expect(simulator.hostChannelNumber).to.equal(systemChannelNumber);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSetOverride,systemChannelNumber]));
                });
                it('should not set the channel number if out of bounds', done => {
                    var newChanNum = 26;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdChannelSetOverride,newChanNum]));
                });
            });
            describe('OBCIRadioCmdPollTimeGet',function () {
                it('should emit success if firmware version 2 with poll time', done => {
                    var expectedPollTime = 80;
                    simulator.pollTime = expectedPollTime;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(expectedPollTime);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdPollTimeGet]));
                });
                it('should emit failure if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdPollTimeGet]));
                });
            });
            describe('OBCIRadioCmdPollTimeSet',function () {
                it('should set the poll time if in bounds', done => {
                    var newPollTime = 20;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            expect(buf[buf.length - 4]).to.equal(newPollTime);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdPollTimeSet,newPollTime]));
                });
                it('should emit failure if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);
                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdPollTimeSet,7]));
                });
            });
            describe('OBCIRadioCmdBaudRateSetDefault',function () {
                it('should emit success if firmware version 2 with proper baud rate', done => {
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            var eotBuf = new Buffer('$$$');
                            var newBaudRateBuf;
                            for (var i = buf.length; i > 3; i--) {
                                if (bufferEqual(buf.slice(i - 3, i),eotBuf)) {
                                    newBaudRateBuf = buf.slice(i - 9, i - 3);
                                    break;
                                }
                            }
                            var newBaudRateNum = Number(newBaudRateBuf.toString());
                            expect(newBaudRateNum).to.equal(k.OBCIRadioBaudRateDefault);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdBaudRateSetDefault]));
                });
                it('should emit success if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdBaudRateSetDefault]));
                });
            });
            describe('OBCIRadioCmdBaudRateSetFast',function () {
                it('should emit success if firmware version 2 with proper baud rate', done => {
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            var eotBuf = new Buffer("$$$");
                            var newBaudRateBuf;
                            for (var i = buf.length; i > 3; i--) {
                                if (bufferEqual(buf.slice(i - 3, i),eotBuf)) {
                                    newBaudRateBuf = buf.slice(i - 9, i - 3);
                                    break;
                                }
                            }
                            var newBaudRateNum = Number(newBaudRateBuf.toString());
                            expect(newBaudRateNum).to.equal(k.OBCIRadioBaudRateFast);
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdBaudRateSetFast]));
                });
                it('should emit success if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdBaudRateSetFast]));
                });
            });
            describe('OBCIRadioCmdSystemStatus',function () {
                it('should emit success if firmware version 2', done => {
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.true;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.false;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdSystemStatus]));
                });
                it('should emit failure if board failure', done => {
                    // Turn board failure mode
                    simulator.options.boardFailure = true;
                    var buf = new Buffer(0);
                    var dataEmit = data => {
                        buf = Buffer.concat([buf,data]);
                        if (openBCISample.doesBufferHaveEOT(buf)) {
                            expect(openBCISample.isSuccessInBuffer(buf)).to.be.false;
                            expect(openBCISample.isFailureInBuffer(buf)).to.be.true;
                            simulator.removeListener('data',dataEmit);
                            done();
                        }
                    };

                    simulator.on('data',dataEmit);

                    simulator._processPrivateRadioMessage(new Buffer([k.OBCIRadioKey,k.OBCIRadioCmdSystemStatus]));
                });
            });
        });
    });
    describe("boardFailure",function () {

    });

    describe("#sync",function () {
        var simulator;
        beforeEach(done => {
            simulator = new openBCISimulator.OpenBCISimulator(portName, {
                firmwareVersion: 'v2'
            });
            simulator.once('open',() => {
                done();
            });
        });
        afterEach(() => {
            simulator = null;
        });
        it("should emit the time sync sent command", done => {
            simulator.once('data',data => {
                expect(openBCISample.isTimeSyncSetConfirmationInBuffer(data)).to.be.true;
                done();
            });
            simulator.write(k.OBCISyncTimeSet, (err, msg) => {
                if (err) {
                    done(err);
                }
            });
        });
        it("should set synced to true", done => {
            simulator.synced = false;
            var emitCounter = 0;
            var newData = data => {
                if (emitCounter === 1) {
                    expect(simulator.synced).to.be.true;
                    simulator.removeListener('data', newData);
                    done();
                }
                emitCounter++;
            };

            simulator.on('data', newData);

            simulator.write(k.OBCISyncTimeSet, (err, msg) => {
                if (err) {
                    done(err);
                }
            });
        });
        it("should set emit a legit time sync set packet", done => {
            simulator.synced = false;
            var emitCounter = 0;
            var newData = data => {
                if (emitCounter === 1) {
                    expect(openBCISample.getRawPacketType(data[k.OBCIPacketPositionStopByte])).to.equal(k.OBCIStreamPacketTimeSyncSet);
                    openBCISample.getFromTimePacketTime(data).then(time => {
                        expect(time).to.be.greaterThan(0);
                        done();
                    }).catch(err => done(err));
                    simulator.removeListener('data', newData);
                }
                emitCounter++;
            };

            simulator.on('data', newData);

            simulator.write(k.OBCISyncTimeSet, (err, msg) => {
                if (err) {
                    done(err);
                }
            });
        });
        it("should emit a time synced standard packet after sync up call", done => {
            simulator.synced = false;
            var emitCounter = 0;
            var newData = data => {
                if (emitCounter === 1) { // the time sync packet is emitted here
                    // Make a call to start streaming
                    simulator.write(k.OBCIStreamStart, err => {
                        if (err) done(err);
                    });
                } else if (emitCounter === 2) {
                    expect(openBCISample.getRawPacketType(data[k.OBCIPacketPositionStopByte])).to.equal(k.OBCIStreamPacketTimeSyncedAccel);
                    simulator.write(k.OBCIStreamStop, err => {
                        if (err) done(err);
                        simulator.removeListener('data', newData);
                        done();
                    });
                }
                emitCounter++;
            };

            simulator.on('data', newData);

            simulator.write(k.OBCISyncTimeSet, (err, msg) => {
                if (err) {
                    done(err);
                }
            });
        });
        it("should emit a time synced raw aux packet", done => {
            simulator.options.accel = false;
            var emitCounter = 0;
            var newData = data => {
                if (emitCounter === 1) { // the time sync packet is emitted here
                    // Make a call to start streaming
                    simulator.write(k.OBCIStreamStart, err => {
                        if (err) done(err);
                    });
                } else if (emitCounter === 2) {
                    expect(openBCISample.getRawPacketType(data[k.OBCIPacketPositionStopByte])).to.equal(k.OBCIStreamPacketTimeSyncedRawAux);
                    simulator.write(k.OBCIStreamStop, err => {
                        if (err) done(err);
                        simulator.removeListener('data', newData);
                        done();
                    });
                }
                emitCounter++;
            };

            simulator.on('data', newData);

            simulator.write(k.OBCISyncTimeSet, err => {
                if (err) {
                    done(err);
                }
            });
        });
    })
});


