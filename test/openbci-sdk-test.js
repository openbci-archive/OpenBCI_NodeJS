var sinon = require('sinon');
var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    openBCIBoard = require('../openBCIBoard'),
    OpenBCISample = openBCIBoard.OpenBCISample,
    k = OpenBCISample.k;

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);

var fs = require('fs');
//var wstream = fs.createWriteStream('myOutput.txt');


xdescribe('openbci-sdk',function() {
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
    xdescribe('#constructor', function () {
        it('constructs with the correct default options', function() {
            ourBoard = new openBCIBoard.OpenBCIBoard();
            (ourBoard.options.boardType).should.equal('default');
            (ourBoard.options.simulate).should.equal(false);
            (ourBoard.options.simulatorSampleRate).should.equal(250);
            (ourBoard.options.baudRate).should.equal(115200);
            (ourBoard.options.verbose).should.equal(false);
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
    xdescribe('#simulator', function() {
        it('can enable simulator after contructor', function(done) {
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

    xdescribe('#boardTests', function() {
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

                    ourBoard.once('sample',() => { // wait till we get a sample
                        ourBoard.disconnect().then(() => { // call disconnect
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
                    ourBoard.streamStop()
                        .then(ourBoard.disconnect())
                        .then(() => {
                            var conditionalTimeout = realBoard ? 300 : 0;
                            setTimeout(() => {
                                done();
                            }, conditionalTimeout);
                        }).catch(err => done(err));
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


    xdescribe('#hardwareValidation', function() {
        this.timeout(20000); // long timeout for pleanty of stream time :)
        var runHardwareValidation = masterPortName !== k.OBCISimulatorPortName;
        var wstream;
        before(function(done) {
            if (runHardwareValidation) {
                ourBoard = new openBCIBoard.OpenBCIBoard({
                    verbose:true
                });
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
                    OpenBCISample.samplePrintLine(sample)
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
    console.log('1');

    before(function(done) {
        console.log('3');
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
                console.log('4');
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
            console.log('5');
            ourBoard.streamStart().then(() => {
                setTimeout(() => {
                    done();
                    console.log('6');
                }, 100); // give some time for the stream command to be sent
            });
        });


    });
    after(function() {
        ourBoard.disconnect();
    });

    xdescribe('#impedanceTestAllChannels', function () {
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
                it('data array present',function() {
                    impedanceArray[0].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[0].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[0].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[0].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[1].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[1].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[1].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[1].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[2].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[2].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[2].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[2].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[3].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[3].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[3].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[3].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[4].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[4].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[4].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[4].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[5].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[5].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[5].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[5].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[6].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[6].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[6].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[6].N.should.have.property('average').above(-1);
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
                it('data array present', function () {
                    impedanceArray[7].P.data.length.should.be.above(0);
                });
                it('valid average', function () {
                    impedanceArray[7].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function () {
                it('data array present', function () {
                    impedanceArray[7].N.data.length.should.be.above(0);
                });
                it('valid average', function () {
                    impedanceArray[7].N.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    xdescribe('#impedanceTestChannelsRejects', function() {
        it('rejects when it does not get an array', function(done) {
            ourBoard.impedanceTestChannels('taco').should.be.rejected.and.notify(done);
        });

        it('rejects when it array length does not match number of channels', function(done) {
            ourBoard.impedanceTestChannels(['-','N','n','p','P','p','b']).should.be.rejected.and.notify(done);
        });

    });
    xdescribe('#impedanceTestChannels', function () {
        var impedanceArray = [];

        before(function(done) {
            ourBoard.once('impedanceArray', arr => {
                impedanceArray = arr;
                done();
            });
            ourBoard.impedanceArray[0] = openBCIBoard.OpenBCISample.impedanceObject(1);
            ourBoard.impedanceTestChannels(['-','N','n','p','P','p','b','B']).catch(err => done(err));
        });
        describe('#channel1',function() {
            it('has valid channel number', function() {
                impedanceArray[0].channel.should.be.equal(1);
            });
            describe('#inputP', function() {
                it('data array NOT present',function() {
                    impedanceArray[0].P.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[0].P.should.have.property('average').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[0].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array NOT present',function() {
                    impedanceArray[0].N.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[0].N.should.have.property('average').equal(-1);
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
                it('data array NOT present',function() {
                    impedanceArray[1].P.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[1].P.should.have.property('average').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[1].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[1].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[1].N.should.have.property('average').above(-1);
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
                it('data array NOT present',function() {
                    impedanceArray[2].P.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[2].P.should.have.property('average').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[2].P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[2].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[2].N.should.have.property('average').above(-1);
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
                it('data array present',function() {
                    impedanceArray[3].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[3].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[3].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array NOT present',function() {
                    impedanceArray[3].N.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[3].N.should.have.property('average').equal(-1);
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
                it('data array present',function() {
                    impedanceArray[4].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[4].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[4].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array NOT present',function() {
                    impedanceArray[4].N.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[4].N.should.have.property('average').equal(-1);
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
                it('data array present',function() {
                    impedanceArray[5].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[5].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[5].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array NOT present',function() {
                    impedanceArray[5].N.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceArray[5].N.should.have.property('average').equal(-1);
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
                it('data array present',function() {
                    impedanceArray[6].P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[6].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceArray[6].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceArray[6].N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceArray[6].N.should.have.property('average').above(-1);
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
                it('data array present', function () {
                    impedanceArray[7].P.data.length.should.be.above(0);
                });
                it('valid average', function () {
                    impedanceArray[7].P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function () {
                it('data array present', function () {
                    impedanceArray[7].N.data.length.should.be.above(0);
                });
                it('valid average', function () {
                    impedanceArray[7].N.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function () {
                    impedanceArray[7].N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    xdescribe('#impedanceTestChannel', function () {
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
                it('data array present',function() {
                    impedanceObject.P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceObject.P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceObject.N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceObject.N.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    xdescribe('#impedanceTestChannelInputP', function () {
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
                it('data array present',function() {
                    impedanceObject.P.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceObject.P.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array NOT present',function() {
                    impedanceObject.N.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceObject.N.should.have.property('average').equal(-1);
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
        console.log('2');

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
                    console.log('9');
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
                it('data array NOT present',function() {
                    impedanceObject.P.data.length.should.be.equal(0);
                });
                it('valid average',function() {
                    impedanceObject.P.should.have.property('average').equal(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.P.should.have.property('text').equal(k.OBCIImpedanceTextInit);
                });
            });
            describe('#inputN', function() {
                it('data array present',function() {
                    impedanceObject.N.data.length.should.be.above(0);
                });
                it('valid average',function() {
                    impedanceObject.N.should.have.property('average').above(-1);
                });
                it('text is not \'init\'', function() {
                    impedanceObject.N.should.have.property('text').not.be.equal(k.OBCIImpedanceTextInit);
                });
            });
        });
    });
    xdescribe('#_impedanceTestSetChannel', function () {
        it('reject with invalid channel', function(done) {
            ourBoard._impedanceTestSetChannel(0,false,false).should.be.rejected.and.notify(done);
        });
    });
    xdescribe('#_impedanceTestCalculateChannel', function () {
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
    xdescribe('#_impedanceTestFinalizeChannel', function () {
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

xdescribe('#sync', function() {
    var ourBoard;
    this.timeout(5000);
    before(function (done) {
        ourBoard = new openBCIBoard.OpenBCIBoard({
            verbose: true
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
                return ourBoard.connect(portName);
            })
            .catch((err) => {
                useSim();
            })
            .then(() => {
                console.log('connected');
            })
            .catch(err => {
                console.log('Error: ' + err);
            });


        ourBoard.once('ready', () => {

            done();
        });
    });
    after(function () {
        ourBoard.disconnect();
    });
    describe('#syncClocksStart', function() {
        it('can sync the clocks',function(done) {
            ourBoard.syncClocksStart();
        });
    });
});