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
    this.timeout(2000);
    var portName = k.OBCISimulatorPortName;
    describe('#constructor', function () {
        var simulator;
        afterEach(() => {
            simulator = null;
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

    });
    describe("boardFailure",function () {

    });
    describe("sync",function () {
        var simulator;
        before(done => {
            simulator = new openBCISimulator.OpenBCISimulator(portName, {
                verbose:true
            });
            simulator.once('open',() => {
                console.log("Made it here");
                done();
            });
        });
        it("should emit the time sync sent command", done => {
            console.log("Taco");
            simulator.once('data',data => {
                expect(openBCISample.isTimeSyncSetConfirmationInBuffer(data)).to.be.true;
                done();
            });
            simulator.write(k.OBCISyncTimeSet);
        });
        it("should set synced to true", done => {
            simulator.synced = false;
            var emitCounter = 0;
            var newData = data => {
                if (emitCounter === 1) {
                    expect(openBCISample.getRawPacketType(data[k.OBCIPacketPositionStopByte])).to.equal(k.OBCIStreamPacketTimeSyncSet);
                    expect(simulator.synced).to.be.true;
                    simulator.removeListener('data', newData);
                    done();
                }
                emitCounter++;
            };

            simulator.on('data', newData);

            simulator.write(k.OBCISyncTimeSet);
        });
    })
});


