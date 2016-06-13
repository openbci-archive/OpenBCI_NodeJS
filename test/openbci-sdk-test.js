var sinon = require('sinon');
var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    openBCIBoard = require('../openBCIBoard'),
    openBCISample = openBCIBoard.OpenBCISample,
    k = openBCISample.k;

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);

var fs = require('fs');
//var wstream = fs.createWriteStream('myOutput.txt');


describe('openbci-sdk',function() {
    this.timeout(2000);
    var ourBoard, masterPortName, realBoard, spy;

    before(function(done) {
        ourBoard = new openBCIBoard.OpenBCIBoard();
        ourBoard.autoFindOpenBCIBoard()
            .then(portName => {
                ourBoard = null;
                realBoard = true;
                masterPortName = portName;
                done();
            })
            .catch(err => {
                ourBoard = null;
                realBoard = false;
                masterPortName = k.OBCISimulatorPortName;
                done();
            })
    });
    describe('#constructor', function () {
        it('constructs with require', function() {
            var OpenBCIBoard = require('../openBCIBoard').OpenBCIBoard;
            ourBoard = new OpenBCIBoard({
                verbose:true
            });
            expect(ourBoard.numberOfChannels()).to.equal(8);
        });
        it('constructs with the correct default options', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard();
            (ourBoard.options.boardType).should.equal('default');
            (ourBoard.options.baudRate).should.equal(115200);
            (ourBoard.options.verbose).should.equal(false);
            (ourBoard.options.simulate).should.equal(false);
            (ourBoard.options.simulatorSampleRate).should.equal(250);
            (ourBoard.options.simulatorAlpha).should.equal(true);
            (ourBoard.options.simulatorLineNoise).should.equal('60Hz');
            describe('#sampleRate', function() {
                it('should get value for default',function() {
                    ourBoard.sampleRate().should.equal(250);
                });
            });
            describe('#numberOfChannels', function() {
                it('should get value for default',function() {
                    ourBoard.numberOfChannels().should.equal(8);
                });
            });
        });
        it('can set daisy mode', function() {
            var ourBoard1 = new openBCIBoard.OpenBCIBoard({
                boardType: 'daisy'
            });
            var ourBoard2 = new openBCIBoard.OpenBCIBoard({
                boardtype: 'daisy'
            });
            (ourBoard1.options.boardType).should.equal('daisy');
            (ourBoard2.options.boardType).should.equal('daisy');
            describe('#sampleRate', function() {
                it('should get value for daisy',function() {
                    ourBoard1.sampleRate().should.equal(125);
                });
            });
            describe('#numberOfChannels', function() {
                it('should get value for daisy',function() {
                    ourBoard1.numberOfChannels().should.equal(16);
                });
            });
        });
        it('should start in current stream state in the init mode', () => {
            ourBoard = new openBCIBoard.OpenBCIBoard();

            ourBoard.curParsingMode.should.equal(k.OBCIParsingReset);
        });
        it('can set ganglion mode', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                boardType: 'ganglion'
            });
            (ourBoard.options.boardType).should.equal('ganglion');
        });
        it('can change baud rate', function() {
            var ourBoard1 = new openBCIBoard.OpenBCIBoard({
                baudRate: 9600
            });
            (ourBoard1.options.baudRate).should.equal(9600);
            var ourBoard2 = new openBCIBoard.OpenBCIBoard({
                baudrate: 9600
            });
            (ourBoard2.options.baudRate).should.equal(9600);
        });
        it('can enter verbose mode', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true
            });
            (ourBoard.options.verbose).should.equal(true);
        });
        it('can enter simulate mode', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulate: true
            });
            (ourBoard.options.simulate).should.equal(true);
        });
        it('can enter simulate mode with different sample rate', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulate: true,
                simulatorSampleRate: 69
            });
            (ourBoard.options.simulate).should.equal(true);
            (ourBoard.options.simulatorSampleRate).should.equal(69);
            (ourBoard.sampleRate()).should.equal(69);
        });
        it('can turn 50Hz line noise on', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulatorLineNoise: '50Hz'
            });
            (ourBoard.options.simulatorLineNoise).should.equal('50Hz');
        });
        it('can turn no line noise on', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulatorLineNoise: 'None'
            });
            (ourBoard.options.simulatorLineNoise).should.equal('None');
        });
        it('defaults to 60Hz line noise when bad input', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulatorLineNoise: '20Hz'
            });
            (ourBoard.options.simulatorLineNoise).should.equal('60Hz');
        });
        it('will not inject alpha', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulatorAlpha: false
            });
            (ourBoard.options.simulatorAlpha).should.equal(false);
        });
        it('configures impedance testing variables correctly', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard();
            (ourBoard.impedanceTest.active).should.equal(false);
            (ourBoard.impedanceTest.isTestingNInput).should.equal(false);
            (ourBoard.impedanceTest.isTestingPInput).should.equal(false);
            (ourBoard.impedanceTest.onChannel).should.equal(0);
            (ourBoard.impedanceTest.sampleNumber).should.equal(0);
        });
        it('configures impedance array with the correct amount of channels for default', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard();
            (ourBoard.impedanceArray.length).should.equal(8);
        });
        it('configures impedance array with the correct amount of channels for daisy', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                boardType: 'daisy'
            });
            (ourBoard.impedanceArray.length).should.equal(16);
        });
        it('configures impedance array with the correct amount of channels for ganglion', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                boardType: 'ganglion'
            });
            (ourBoard.impedanceArray.length).should.equal(4);
        });
    });
    describe('#simulator', function() {
        it('can enable simulator after constructor', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true
            });
            ourBoard.simulatorEnable().should.be.fulfilled.and.notify(done);
        });
        it('should disable sim and call disconnected', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true
            });
            var disconnectSpy = sinon.spy(ourBoard,"disconnect");
            ourBoard.options.simulate.should.equal(false);
            ourBoard.connected = true;
            ourBoard.simulatorEnable().then(() => {
                disconnectSpy.should.have.been.calledOnce;
                ourBoard.options.simulate.should.equal(true);
                done();
            });
        });
        it('should not enable the simulator if already simulating', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true,
                simulate: true
            });
            ourBoard.simulatorEnable().should.be.rejected.and.notify(done);
        });
        it('can disable simulator', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true,
                simulate: true
            });
            ourBoard.simulatorDisable().should.be.fulfilled.and.notify(done);
        });
        it('should not disable simulator if not in simulate mode', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true
            });
            ourBoard.simulatorDisable().should.be.rejected.and.notify(done);
        });
        it('should start sim and call disconnected', function(done) {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true,
                simulate: true
            });
            var disconnectSpy = sinon.spy(ourBoard,"disconnect");
            ourBoard.options.simulate.should.equal(true);
            ourBoard.connected = true;
            ourBoard.simulatorDisable().then(() => {
                disconnectSpy.should.have.been.calledOnce;
                ourBoard.options.simulate.should.equal(false);
                done();
            });
        });
    });

    describe('#boardTests', function() {
        this.timeout(2000);
        before(function() {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                simulate: !realBoard,
                verbose: true
            });
            spy = sinon.spy(ourBoard,"_writeAndDrain");
        });
        after(function(done) {
            if (ourBoard.connected) {
                ourBoard.disconnect().then(() => {
                    done();
                });
            } else {
                done()
            }
        });
        afterEach(function() {
            if (spy) spy.reset();
        });
        describe('#connect/disconnect/streamStart/streamStop', function () {
            it('sends a stop streaming command before disconnecting', function(done) {
                //spy = sinon.spy(ourBoard,"_writeAndDrain");

                ourBoard.connect(masterPortName).catch(err => done(err));

                ourBoard.once('ready', function() {
                    ourBoard.streamStart().catch(err => done(err)); // start streaming

                    ourBoard.once('sample',(sample) => { // wait till we get a sample
                        //console.log('got a sample');
                        ourBoard.disconnect().then(() => { // call disconnect
                            //console.log('Device is streaming: ' + ourBoard.streaming ? 'true' : 'false');
                            setTimeout(() => {
                                spy.should.have.been.calledWithMatch(k.OBCIStreamStop);
                                var conditionalTimeout = realBoard ? 300 : 0;
                                setTimeout(() => {
                                    done();
                                }, conditionalTimeout);
                            }, 4 * k.OBCIWriteIntervalDelayMSShort); // give plenty of time
                        }).catch(err => done(err));
                    });
                });
            });
            it('gets the ready ($$$) signal from board', function(done) {
                ourBoard.connect(masterPortName).catch(err => done(err));
                // for the ready signal test
                ourBoard.once('ready', function() {
                    //console.log('got here');
                    ourBoard.disconnect()
                        .then(() => {
                            //console.log('disconnected');
                            var conditionalTimeout = realBoard ? 300 : 0;
                            setTimeout(() => {
                                done();
                            }, conditionalTimeout);
                        }).catch(err => {
                            console.log(err);
                            done(err);
                        });
                });
            });
            it('rawDataPacket is emitted', function(done) {
                ourBoard.connect(masterPortName).catch(err => done(err));
                // for the ready signal test
                ourBoard.once('ready', function() {
                    ourBoard.streamStart().catch(err => done(err)); // start streaming

                    ourBoard.once('rawDataPacket',(rawDataPacket) => { // wait till we get a raw data packet
                        console.log('got a sample');
                        done();
                    });
                });
            });
        });
        describe('#write', function() {
            before(function(done) {
                if (ourBoard.connected) {
                    ourBoard.disconnect().then(() => {
                        done();
                    });
                } else {
                    done()
                }
            });
            it('rejects when not connected', function(done) {
                ourBoard.write('b').should.be.rejected.and.notify(done);
            });
        });
        // good
        describe('#listPorts', function () {
            it('returns a list of ports',function(done) {
                ourBoard.listPorts().then(ports => {
                    if (ports.some(port => {
                            if (port.comName === masterPortName) {
                                return true;
                            }
                        })) {
                        done();
                    } else {
                        done();
                    }
                });
            })
        });
        describe('#sdStart',function() {
            before(function(done) {
                ourBoard.connect(masterPortName)
                    .then(() => {
                        ourBoard.once('ready',done);
                    })
                    .catch(err => done(err));
            });
            afterEach(function(done) {
                ourBoard.sdStop()
                    .catch(done);
                ourBoard.once('ready',done);

            });
            after(function(done) {
                ourBoard.disconnect()
                    .then(done)
                    .catch(err => done(err));
            });
            it('can start 14 seconds of logging with sd',function(done) {
                ourBoard.sdStart('14sec')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 5 minutes of logging with sd',function(done) {
                ourBoard.sdStart('5min')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 15 minutes of logging with sd',function(done) {
                ourBoard.sdStart('15min')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 30 minutes of logging with sd',function(done) {
                ourBoard.sdStart('30min')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 1 hour of logging with sd',function(done) {
                ourBoard.sdStart('1hour')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 2 hours of logging with sd',function(done) {
                ourBoard.sdStart('2hour')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 4 hours of logging with sd',function(done) {
                ourBoard.sdStart('4hour')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 12 hours of logging with sd',function(done) {
                ourBoard.sdStart('12hour')
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can start 24 hours of logging with sd',function(done) {
                ourBoard.sdStart('24hour')
                    .catch(done);
                ourBoard.once('ready',done);
            });
        });
        describe('#sdStop',function() {
            before(function(done) {
                ourBoard.connect(masterPortName).catch(err => done(err));
                ourBoard.once('ready',done);
            });
            it('can stop logging with sd',function(done) {
                console.log('yoyoyo');
                ourBoard.sdStop()
                    .then(() => {
                        console.log('taco');
                        spy.should.have.been.calledWith('j');
                    })
                    .catch(err => done(err));
                ourBoard.once('ready',done);
            });
        });
        // bad
        describe('#channelOff', function () {
            before(function(done) {
                if (!ourBoard.connected) {
                    ourBoard.connect(masterPortName)
                        .then(done)
                        .catch(err => done(err));
                } else {
                    done();
                }
            });

            it('should call the write function with proper command for channel 1', function(done) {
                ourBoard.channelOff(1).then(() => {
                    setTimeout(() => {
                        spy.should.have.been.calledWith(k.OBCIChannelOff_1);
                        done();
                    }, 5 * k.OBCIWriteIntervalDelayMSShort);
                });
            });
            it('should call the write function with proper command for channel 16', function(done) {
                //spy = sinon.spy(ourBoard,"_writeAndDrain");

                ourBoard.channelOff(16).then(() => {
                    setTimeout(() => {
                        spy.should.have.been.calledWith(k.OBCIChannelOff_16);
                        done();
                    }, 5 * k.OBCIWriteIntervalDelayMSShort);
                });
            });
            it('should reject with invalid channel', function(done) {
                ourBoard.channelOff(0).should.be.rejected.and.notify(done);
            });
            it('should turn the realBoard channel off', function(done) {
                ourBoard.channelOff(1).then(() => {
                    setTimeout(() => {
                        spy.should.have.been.calledWith(k.OBCIChannelOff_1);
                        done();
                    }, 5 * k.OBCIWriteIntervalDelayMSShort);
                });
            });
        });
        // good
        describe('#channelOn', function () {
            before(function(done) {
                if (!ourBoard.connected) {
                    ourBoard.connect(masterPortName)
                        .then(done)
                        .catch(err => done(err));
                } else {
                    done();
                }
            });

            it('should call the write function with proper command for channel 2', function(done) {
                ourBoard.channelOn(2).then(() => {
                    setTimeout(() => {
                        spy.should.have.been.calledWith(k.OBCIChannelOn_2);
                        done();
                    }, 5 * k.OBCIWriteIntervalDelayMSShort);

                });
            });
            it('should call the write function with proper command for channel 16', function(done) {
                ourBoard.channelOn(16).then(() => {
                    setTimeout(() => {
                        spy.should.have.been.calledWith(k.OBCIChannelOn_16);
                        done();
                    }, 5 * k.OBCIWriteIntervalDelayMSShort);

                });
            });
            it('should reject with invalid channel', function(done) {
                ourBoard.channelOn(0).should.be.rejected.and.notify(done);
            });
        });
        // bad
        describe('#channelSet', function () {
            this.timeout(6000);
            before(function(done) {
                if (!ourBoard.connected) {
                    ourBoard.connect(masterPortName)
                        .then(done)
                        .catch(err => done(err));
                } else {
                    done();
                }
            });
            it('should call the writeAndDrain function array of commands 9 times', function(done) {
                setTimeout(() => {
                    spy.reset();
                    ourBoard.channelSet(1,true,24,'normal',true,true,true)
                        .then(() => {
                            setTimeout(() => {
                                spy.callCount.should.equal(9);
                                done()
                            }, 15 * k.OBCIWriteIntervalDelayMSShort);
                        })
                        .catch(err => done(err));
                }, 10 * k.OBCIWriteIntervalDelayMSShort); // give some time for writer to finish
            });

            it('should be rejected', function(done) {
                ourBoard.channelSet(1,true,24,'normal','taco',true,true).should.be.rejected.and.notify(done);
            });
        });

        describe('#impedanceTest Not Connected Rejects ',function() {
            it('rejects all channeles when not streaming', function(done) {
                ourBoard.impedanceTestAllChannels().should.be.rejected.and.notify(done);
            });
            it('rejects array channels when not streaming', function(done) {
                ourBoard.impedanceTestChannels(['-','N','n','p','P','-','b','b']).should.be.rejected.and.notify(done);
            });
        });
        describe('#impedancePrivates', function () {
            describe('disconnected', function() {
                before(function(done) {
                    if (ourBoard.connected) {
                        ourBoard.disconnect()
                            .then(done)
                            .catch(err => done(err));
                    } else {
                        done();
                    }
                });
                describe('#_impedanceTestSetChannel', function () {
                    it('should reject because not connected', function(done) {
                        ourBoard._impedanceTestSetChannel(0,false,false).should.be.rejected.and.notify(done);
                    });
                });
            });
        });

    });

    /**
     * Test the function that parses an incoming data buffer for packets
     */
    describe('#_processDataBuffer', function() {
        var ourBoard = new openBCIBoard.OpenBCIBoard({
            verbose: true
        });
        var _processQualifiedPacketSpy = sinon.spy(ourBoard,"_processQualifiedPacket");

        it('should return an unaltered buffer if there is less than a packets worth of data in it', () => {
            var expectedString = "AJ";
            var buffer = new Buffer(expectedString);

            // Reset the spy if it exists
            if(_processQualifiedPacketSpy) _processQualifiedPacketSpy.reset();

            // Test the function
            buffer = ourBoard._processDataBuffer(buffer);

            // Convert the buffer to a string and ensure that it equals the expected string
            buffer.toString().should.equal(expectedString);

            // Make sure that the spy was not infact called.
            _processQualifiedPacketSpy.should.not.have.been.called;
        });
        it('should identify a packet',() => {
            var buffer = openBCISample.samplePacketReal(0);

            // Reset the spy if it exists
            if(_processQualifiedPacketSpy) _processQualifiedPacketSpy.reset();

            // Call the function under test
            buffer = ourBoard._processDataBuffer(buffer);

            // Ensure that we extracted only one buffer
            _processQualifiedPacketSpy.should.have.been.calledOnce;

            // The buffer should not have anything in it any more
            buffer.length.should.equal(0);
        });
        it('should extract a buffer and preseve the remaining data in the buffer',() => {
            var expectedString = "AJ";
            var extraBuffer = new Buffer(expectedString);
            console.log('extraBuffer',extraBuffer);
            // declare the big buffer
            var buffer = new Buffer(k.OBCIPacketSize + extraBuffer.length);
            // Fill that new big buffer with buffers
            samplePacketReal(0).copy(buffer,0);
            extraBuffer.copy(buffer,k.OBCIPacketSize);
            // Reset the spy if it exists
            if(_processQualifiedPacketSpy) _processQualifiedPacketSpy.reset();
            // Call the function under test
            buffer = ourBoard._processDataBuffer(buffer);
            // Ensure that we extracted only one buffer
            _processQualifiedPacketSpy.should.have.been.called;
            // The buffer should have the epxected number of bytes left
            buffer.length.should.equal(expectedString.length);
            // Convert the buffer to a string and ensure that it equals the expected string
            buffer.toString().should.equal(expectedString);
        });

        it('should be able to extract multiple packets from a single buffer',() => {
            // We are going to extract multiple buffers
            var expectedNumberOfBuffers = 3;
            // declare the big buffer
            var buffer = new Buffer(k.OBCIPacketSize * expectedNumberOfBuffers);
            // Fill that new big buffer with buffers
            samplePacketReal(0).copy(buffer,0);
            samplePacketReal(1).copy(buffer,k.OBCIPacketSize);
            samplePacketReal(2).copy(buffer,k.OBCIPacketSize * 2);
            // Reset the spy if it exists
            if(_processQualifiedPacketSpy) _processQualifiedPacketSpy.reset();
            // Call the function under test
            buffer = ourBoard._processDataBuffer(buffer);
            // Ensure that we extracted only one buffer
            _processQualifiedPacketSpy.should.have.been.calledThrice;
            // The buffer should not have anything in it any more
            buffer.length.should.equal(0);
        });

        it('should be able to get multiple packets and keep extra data on the end', () => {
            var expectedString = "AJ";
            var extraBuffer = new Buffer(expectedString);
            // We are going to extract multiple buffers
            var expectedNumberOfBuffers = 2;
            // declare the big buffer
            var buffer = new Buffer(k.OBCIPacketSize * expectedNumberOfBuffers + extraBuffer.length);
            // Fill that new big buffer with buffers
            samplePacketReal(0).copy(buffer,0);
            samplePacketReal(1).copy(buffer,k.OBCIPacketSize);
            extraBuffer.copy(buffer,k.OBCIPacketSize * 2);
            // Reset the spy if it exists
            if(_processQualifiedPacketSpy) _processQualifiedPacketSpy.reset();
            // Call the function under test
            buffer = ourBoard._processDataBuffer(buffer);
            // Ensure that we extracted only one buffer
            _processQualifiedPacketSpy.should.have.been.calledTwice;
            // The buffer should not have anything in it any more
            buffer.length.should.equal(extraBuffer.length);
        });
    });

    /**
     * Test the function that routes raw packets for processing
     */
    describe('#_processQualifiedPacket', function() {
        var ourBoard;
        var funcSpyTimeSyncSet, funcSpyTimeSyncedAccel, funcSpyTimeSyncedRawAux, funcSpyStandardRawAux, funcSpyStandardAccel;

        before(() => {
            ourBoard = new openBCIBoard.OpenBCIBoard({
                verbose: true
            });
            // Put watchers on all functions
            funcSpyStandardAccel = sinon.spy(ourBoard,"_processPacketStandardAccel");
            funcSpyStandardRawAux = sinon.spy(ourBoard,"_processPacketStandardRawAux");
            funcSpyTimeSyncSet = sinon.spy(ourBoard,"_processPacketTimeSyncSet");
            funcSpyTimeSyncedAccel = sinon.spy(ourBoard,"_processPacketTimeSyncedAccel");
            funcSpyTimeSyncedRawAux = sinon.spy(ourBoard,"_processPacketTimeSyncedRawAux");
        });
        beforeEach(() => {
            funcSpyStandardAccel.reset();
            funcSpyStandardRawAux.reset();
            funcSpyTimeSyncSet.reset();
            funcSpyTimeSyncedAccel.reset();
            funcSpyTimeSyncedRawAux.reset();
        });


        it('should process a standard packet',() => {
            var buffer = openBCISample.samplePacket(0);

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Ensure that we extracted only one buffer
            funcSpyStandardAccel.should.have.been.calledOnce;
        });
        it('should process a standard packet with raw aux',() => {
            var buffer = openBCISample.samplePacketStandardRawAux(0);

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Ensure that we extracted only one buffer
            funcSpyStandardRawAux.should.have.been.calledOnce;
        });
        it('should call nothing for a user defined packet type ',() => {
            var buffer = openBCISample.samplePacketUserDefined();

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Nothing should be called
            funcSpyStandardAccel.should.not.have.been.called;
            funcSpyStandardRawAux.should.not.have.been.called;
            funcSpyTimeSyncSet.should.not.have.been.called;
            funcSpyTimeSyncedAccel.should.not.have.been.called;
            funcSpyTimeSyncedRawAux.should.not.have.been.called;
        });
        it('should process a time sync set packet',() => {
            var buffer = openBCISample.samplePacketTimeSyncSet();

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Ensure that we extracted only one buffer
            funcSpyTimeSyncSet.should.have.been.calledOnce;
        });
        it('should process a time synced packed with accel',() => {
            var buffer = openBCISample.samplePacketTimeSyncedAccel(0);

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Ensure that we extracted only one buffer
            funcSpyTimeSyncedAccel.should.have.been.calledOnce;
        });
        it('should process a time synced packed with raw aux',() => {
            var buffer = openBCISample.samplePacketTimeSyncedRawAux(0);

            // Call the function under test
            ourBoard._processQualifiedPacket(buffer);

            // Ensure that we extracted only one buffer
            funcSpyTimeSyncedRawAux.should.have.been.calledOnce;
        });
        it('should not identify any packet',() => {
            var buffer = openBCISample.samplePacket(0);

            // Set the stop byte to some number not yet defined
            buffer[k.OBCIPacketPositionStopByte] = 0xCF;

            // Call the function under test
            ourBoard._processDataBuffer(buffer);

            // Nothing should be called
            funcSpyStandardAccel.should.not.have.been.called;
            funcSpyStandardRawAux.should.not.have.been.called;
            funcSpyTimeSyncSet.should.not.have.been.called;
            funcSpyTimeSyncedAccel.should.not.have.been.called;
            funcSpyTimeSyncedRawAux.should.not.have.been.called;
        });
    });

    xdescribe('#hardwareValidation', function() {
        this.timeout(20000); // long timeout for pleanty of stream time :)
        var runHardwareValidation = masterPortName !== k.OBCISimulatorPortName;
        var wstream;
        before(function(done) {
            if (runHardwareValidation) {
                ourBoard = new openBCIBoard.OpenBCIBoard({
                    verbose:true
                });
                // Use the line below to output the
                wstream = fs.createWriteStream('hardwareVoltageOutputAll.txt');

                ourBoard.connect(masterPortName)
                    .catch(err => done(err));

                ourBoard.once('ready',() => {
                    done();
                });

            } else {
                done();
            }

        });
        after(function() {
            if (runHardwareValidation) {
                ourBoard.disconnect();
            }
        });
        it('test all output signals', function(done) {
            if (runHardwareValidation) {
                ourBoard.streamStart()
                    .then(() => {
                        console.log('Started stream');
                        console.log('--------');

                    })
                    .catch(err => done(err));

                setTimeout(() => {
                    console.log('*-------');
                    ourBoard.testSignal('pulse1xSlow');
                },3000);
                setTimeout(() => {
                    console.log('**------');
                    ourBoard.testSignal('pulse2xSlow');
                },5000);
                setTimeout(() => {
                    console.log('***-----');
                    ourBoard.testSignal('pulse1xFast');
                },7000);
                setTimeout(() => {
                    console.log('****----');
                    ourBoard.testSignal('pulse2xFast');
                },9000);
                setTimeout(() => {
                    console.log('*****---');
                    ourBoard.testSignal('none');
                },11000);
                setTimeout(() => {
                    console.log('******--');
                    ourBoard.testSignal('pulse1xSlow');
                },13000);
                setTimeout(() => {
                    console.log('*******-');
                    ourBoard.testSignal('none');
                },15000);


                ourBoard.on('sample', sample => {
                    openBCISample.samplePrintLine(sample)
                        .then(line => {
                            wstream.write(line);
                        });
                });
                // This stops the test
                setTimeout(() => {
                    console.log('********');
                    done();
                },19000);
            } else {
                done();
            }
        });
    });

});

describe('#impedanceTesting', function() {
    var ourBoard;
    this.timeout(20000);

    before(function(done) {
        ourBoard = new openBCIBoard.OpenBCIBoard({
            verbose: true
        });

        var useSim = () => {
            ourBoard.simulatorEnable().then(() => {
                return ourBoard.connect(k.OBCISimulatorPortName);
            });
        };
        ourBoard.autoFindOpenBCIBoard()
            .then(portName => {
                return ourBoard.connect(portName);
            })
            .catch((err) => {
                useSim();
            })
            .then(() => {
                console.log('connected');
            })
            .catch(err => {
                console.log('Error: '+ err);
            });


        ourBoard.once('ready',() => {
            ourBoard.streamStart()
                .then(() => {
                    setTimeout(() => {
                        done();
                    }, 100); // give some time for the stream command to be sent
                })
                .catch(err => {
                    console.log(err);
                    done(err);
                })
        });


    });
    after(function() {
        ourBoard.disconnect();
    });

    describe('#impedanceTestAllChannels', function () {
        var impedanceArray = [];

        before(function(done) {
            ourBoard.once('impedanceArray', arr => {
                impedanceArray = arr;
                console.log(impedanceArray);
                done();
            });
            ourBoard.impedanceTestAllChannels();
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceArray[0].channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[0].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[0].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel2',function() {
            it('has valid channel number', function() {
                impedanceArray[1].channel.should.be.equal(2);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[1].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[1].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel3',function() {
            it('has valid channel number', function() {
                impedanceArray[2].channel.should.be.equal(3);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[2].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[2].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel4',function() {
            it('has valid channel number', function() {
                impedanceArray[3].channel.should.be.equal(4);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[3].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[3].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel5',function() {
            it('has valid channel number', function() {
                impedanceArray[4].channel.should.be.equal(5);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[4].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[4].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel6',function() {
            it('has valid channel number', function() {
                impedanceArray[5].channel.should.be.equal(6);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[5].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[5].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel7',function() {
            it('has valid channel number', function() {
                impedanceArray[6].channel.should.be.equal(7);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[6].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[6].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel8',function() {
            it('has valid channel number', function () {
                impedanceArray[7].channel.should.be.equal(8);
            });
            describe('#inputP', function () {
                it('got raw impedance value', function () {
                    impedanceArray[7].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function () {
                it('got raw impedance value', function () {
                    impedanceArray[7].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    describe('#impedanceTestChannelsRejects', function() {
        it('rejects when it does not get an array', function(done) {
            ourBoard.impedanceTestChannels('taco').should.be.rejected.and.notify(done);
        });

        it('rejects when it array length does not match number of channels', function(done) {
            ourBoard.impedanceTestChannels(['-','N','n','p','P','p','b']).should.be.rejected.and.notify(done);
        });

    });
    describe('#impedanceTestChannels', function () {
        var impedanceArray = [];

        before(function(done) {
            ourBoard.once('impedanceArray', arr => {
                impedanceArray = arr;
                done();
            });
            ourBoard.impedanceArray[0] = openBCISample.impedanceObject(1);
            ourBoard.impedanceTestChannels(['-','N','n','p','P','p','b','B']).catch(err => done(err));
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceArray[0].channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[0].P.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[0].N.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].N.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel2',function() {
            it('has valid channel number', function() {
                impedanceArray[1].channel.should.be.equal(2);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[1].P.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[1].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel3',function() {
            it('has valid channel number', function() {
                impedanceArray[2].channel.should.be.equal(3);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[2].P.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[2].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel4',function() {
            it('has valid channel number', function() {
                impedanceArray[3].channel.should.be.equal(4);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[3].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[3].N.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].N.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel5',function() {
            it('has valid channel number', function() {
                impedanceArray[4].channel.should.be.equal(5);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[4].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[4].N.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].N.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel6',function() {
            it('has valid channel number', function() {
                impedanceArray[5].channel.should.be.equal(6);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[5].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[5].N.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].N.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel7',function() {
            it('has valid channel number', function() {
                impedanceArray[6].channel.should.be.equal(7);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceArray[6].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceArray[6].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
        describe('#channel8',function() {
            it('has valid channel number', function () {
                impedanceArray[7].channel.should.be.equal(8);
            });
            describe('#inputP', function () {
                it('got raw impedance value', function () {
                    impedanceArray[7].P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function () {
                it('got raw impedance value', function () {
                    impedanceArray[7].N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    describe('#impedanceTestChannel', function () {
        var impedanceObject = {};

        before(function(done) {
            ourBoard.impedanceTestChannel(1)
                .then(impdObj => {
                    impedanceObject = impdObj;
                    done();
                })
                .catch(err => done(err));
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceObject.channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceObject.P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceObject.N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    describe('#impedanceTestChannelInputP', function () {
        var impedanceObject = {};

        before(function(done) {
            ourBoard.impedanceTestChannelInputP(1)
                .then(impdObj => {
                    impedanceObject = impdObj;
                    done();
                })
                .catch(err => done(err));
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceObject.channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceObject.P.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceObject.N.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.N.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    describe('#impedanceTestChannelInputN', function () {

        var impedanceObject = {};
        //wstream = fs.createWriteStream('hardwareVoltageOutputAll.txt');

        before(function(done) {

            console.log('7');

            ourBoard.on('sample',sample => {
                //console.log('8');
                //OpenBCISample.debugPrettyPrint(sample);
                // good to start impedance testing..
            });

            ourBoard.impedanceTestChannelInputN(1)
                .then(impdObj => {
                    impedanceObject = impdObj;
                    setTimeout(() => {
                        done();
                    }, 1000);
                })
                .catch(err => done(err));
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceObject.channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('got raw impedance value',function() {
                    impedanceObject.P.should.have.property('raw').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('got raw impedance value',function() {
                    impedanceObject.N.should.have.property('raw').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    describe('#impedanceTestContinuousStXX', function () {

        var impedanceArray = [];

        before(function(done) {
            ourBoard.impedanceTestContinuousStart()
                .then(done).catch(err => done(err));

        });

        after(function(done) {
            ourBoard.impedanceTestContinuousStop()
                .then(done);
        });

        it('prints 10 impedance arrays', function(done) {
            var count = 1;

            var listener = impedanceArray => {
                //console.log('\nImpedance Array: ' + count);
                //console.log(impedanceArray);
                count++;
                if (count > 10) {
                    ourBoard.removeListener('impedanceArray', listener);
                    done();
                }
            };
            ourBoard.on('impedanceArray', listener);




        });
    });
    describe('#_impedanceTestSetChannel', function () {
        it('reject with invalid channel', function(done) {
            ourBoard._impedanceTestSetChannel(0,false,false).should.be.rejected.and.notify(done);
        });
    });
    describe('#_impedanceTestCalculateChannel', function () {
        it('reject with low invalid channel', function(done) {
            ourBoard._impedanceTestCalculateChannel(0,false,false).should.be.rejected.and.notify(done);
        });
        it('reject with high invalid channel', function(done) {
            ourBoard._impedanceTestCalculateChannel(69,false,false).should.be.rejected.and.notify(done);
        });
        it('reject with invalid data type pInput', function(done) {
            ourBoard._impedanceTestCalculateChannel(1,'taco',false).should.be.rejected.and.notify(done);
        });
        it('reject with invalid data type nInput', function(done) {
            ourBoard._impedanceTestCalculateChannel(1,false,'taco').should.be.rejected.and.notify(done);
        });
    });
    describe('#_impedanceTestFinalizeChannel', function () {
        it('reject with low invalid channel', function(done) {
            ourBoard._impedanceTestFinalizeChannel(0,false,false).should.be.rejected.and.notify(done);
        });
        it('reject with high invalid channel', function(done) {
            ourBoard._impedanceTestFinalizeChannel(69,false,false).should.be.rejected.and.notify(done);
        });
        it('reject with invalid data type pInput', function(done) {
            ourBoard._impedanceTestFinalizeChannel(1,'taco',false).should.be.rejected.and.notify(done);
        });
        it('reject with invalid data type nInput', function(done) {
            ourBoard._impedanceTestFinalizeChannel(1,false,'taco').should.be.rejected.and.notify(done);
        });
    });
});

// Need a better test
xdescribe('#sync', function() {
    var ourBoard;
    this.timeout(10000);
    before(function (done) {
        ourBoard = new openBCIBoard.OpenBCIBoard({
            verbose:true,
            sntp: true
        });

        var useSim = () => {
            ourBoard.simulatorEnable()
                .then(() => {
                    return ourBoard.connect(k.OBCISimulatorPortName);
                })
                .then(() => {
                    return ourBoard.softReset();
                })
                .catch(err => console.log(err));
        };
        ourBoard.autoFindOpenBCIBoard()
            .then(portName => {
                return setTimeout(() => {
                    console.log('Issuing connect');
                    ourBoard.connect(portName);
                    //ourBoard.connect("/dev/cu.usbserial-DB00JAKZ");
                },500);
            })
            .catch((err) => {
                useSim();
            })
            .then(() => {
                //console.log('connected');
            })
            .catch(err => {
                console.log('Error: ' + err);
            });


        ourBoard.once('ready', () => {
            console.log("Got ready signal...");
            setTimeout(() => {
                done();
            }, 500);
        });
    });
    after(function () {
        ourBoard.disconnect();
    });
    describe('#syncClocksStart', function() {
        it('can get sntp time and verify extend of sntp valid', function(done) {
            console.log('Sync clocks started!');
            ourBoard.syncClocksStart()
                .catch(err => {
                    done(err);
                });
            ourBoard.on('synced',() => {
                done()
            });

        });
    });
});
