var sinon = require('sinon');
var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    openBCIBoard = require('../openBCIBoard'),
    OpenBCISample = openBCIBoard.OpenBCISample;

var fs = require('fs');
var wstream = fs.createWriteStream('myOutput.txt');


describe('openbci-sdk',function() {
    describe('#testsWithBoard', function() {
        this.timeout(10000);
        describe('#connect', function() {
            var running = false;
            beforeEach(function(done) {
                var ourBoard = new openBCIBoard.OpenBCIBoard({
                    verbose: true
                });

                ourBoard.autoFindOpenBCIBoard().then((value) => {
                    if(Array.isArray(value)) {
                        /**Unable to auto find OpenBCI board*/
                        console.log('NO BOARD CONNECTED!, AUTO PASSING TEST!');
                        running = true;
                        done();
                    } else {
                        return ourBoard.connect(value).then(function() {
                            console.log('board connected on path: ' + value);
                            ourBoard.on('ready',function() {
                                console.log('Ready to start streaming!');
                                ourBoard.streamStart();
                                ourBoard.on('sample',function(sample) {
                                    //wstream.write('Master Count: ' + sample._count + ' Sample Count: ' + sample.sampleNumber + '\n');
                                    //console.log('Master Count: ' + sample._count + ' Sample Count: ' + sample.sampleNumber);
                                    OpenBCISample.debugPrettyPrint(sample);
                                });
                            });
                        });
                    }
                }).catch(function(err) {
                    console.log('Error [setup]: ' + err);
                    done();
                });
                setTimeout(function() {
                    ourBoard.disconnect().then(function(msg) {
                        running = true;
                        setTimeout(function(){
                            done();
                        },50);
                    }, function(err) {
                        console.log('Error: ' + err);
                        done();
                    });
                },9000);
            });
            it('should stop the simulator after 5 seconds', function() {
                expect(running).equals(true);
            });
        });
        xdescribe('#imdenceCheck', function() {
            var running = false;
            beforeEach(function(done) {
                var ourBoard = new openBCIBoard.OpenBCIBoard({
                    verbose: true
                });

                ourBoard.autoFindOpenBCIBoard().then((value) => {
                    if(Array.isArray(value)) {
                        /**Unable to auto find OpenBCI board*/
                        console.log('NO BOARD CONNECTED!, AUTO PASSING TEST!');
                        running = true;
                        done();
                    } else {
                        return ourBoard.connect(value).then(function() {
                            console.log('board connected on path: ' + value);
                            ourBoard.on('ready',function() {
                                console.log('Ready to start streaming!');
                                //ourBoard.channelOff(1);
                                //ourBoard.channelOff(2);
                                //ourBoard.channelOff(3);
                                //ourBoard.channelOff(4);
                                //ourBoard.channelOff(5);
                                //ourBoard.channelOff(6);
                                //ourBoard.channelOff(7);
                                ourBoard.streamStart();
                                //ourBoard.on('sample',function(sample) {
                                //    //wstream.write('Master Count: ' + sample._count + ' Sample Count: ' + sample.sampleNumber + '\n');
                                //    //console.log('Master Count: ' + sample._count + ' Sample Count: ' + sample.sampleNumber);
                                //    OpenBCISample.debugPrettyPrint(sample);
                                //});
                                setTimeout(() => {
                                    ourBoard.impedanceTestStartAll().then(() => {
                                        console.log('good start');
                                    },(err) => {
                                        console.log(err);
                                    });
                                },50);
                                ourBoard.on('sample',function(sample) {
                                    //wstream.write(' Sample Count: ' + sample.sampleNumber + ' impedance: ' + JSON.stringify(sample.impedanceArray) + '\n');
                                    //console.log('Sample!');
                                    if(sample.impedanceArray) {
                                        wstream.write('Impedance\'s for channels: 1: ' + sample.impedanceArray[1] + ' 2: ' + sample.impedanceArray[2] + ' 3: ' + sample.impedanceArray[3] + ' 4: ' + sample.impedanceArray[4] + ' 5: ' + sample.impedanceArray[5] + ' 6: ' + sample.impedanceArray[6] + ' 7: ' + sample.impedanceArray[7] + ' 8: ' + sample.impedanceArray[8] + '\n');
                                        console.log('Impedance: ' + sample.impedanceArray.toString());
                                        //console.log('Impedance\'s for channels: 1: ' + sample.impedanceArray[1] + ' 2: ' + sample.impedanceArray[2] + ' 3: ' + sample.impedanceArray[3] + ' 4: ' + sample.impedanceArray[4] + ' 5: ' + sample.impedanceArray[5] + ' 6: ' + sample.impedanceArray[6] + ' 7: ' + sample.impedanceArray[7] + ' 8: ' + sample.impedanceArray[8]);
                                    }
                                });
                            });
                        });
                    }
                }).catch(function(err) {
                    console.log('Error [setup]: ' + err);
                    done();
                });
                setTimeout(() => {
                    if(ourBoard.isCalculatingImpedance) {
                        ourBoard.impedanceTestStopAll()
                            .then(function() {
                                console.log('Impedance test stopped!');
                            });
                    } else {
                        done();
                    }
                },6000);
                setTimeout(function() {
                    ourBoard.disconnect().then(function(msg) {
                        running = true;
                        setTimeout(function(){
                            done();
                        },50);
                    }, function(err) {
                        console.log('Error: ' + err);
                        done();
                    });
                },9000);
            });
            it('should stop the simulator after 5 seconds', function() {
                expect(running).equals(true);
            });
        });
        xdescribe('#confirm channel 1 off with query register settings', function() {
            var channelIsOn = false;
            var didTryToSendPrintCommand = false;
            var didTryToTurnChannel1Off = false;
            beforeEach(function(done) {
                var ourBoard = new openBCIBoard.OpenBCIBoard();

                ourBoard.autoFindOpenBCIBoard(function (portName, ports) {
                    if (portName) {
                        ourBoard.connect(portName).then(function (boardSerial) {
                            //console.log('board connected');
                            ourBoard.on('ready', function () {
                                //console.log('Ready to print register settings!');
                                if (!didTryToSendPrintCommand) {
                                    didTryToSendPrintCommand = true;
                                    ourBoard.getSettingsForChannel(1); //sets isChannelOn to true
                                } else if (!didTryToTurnChannel1Off) {
                                    didTryToTurnChannel1Off = true;
                                    //console.log('Tried to turn channel 1 off');
                                    ourBoard.channelOff(1);
                                    setTimeout(function() {
                                        //console.log('Re print register settings');
                                        ourBoard.getSettingsForChannel(1);
                                    },100);
                                }
                                ourBoard.on('query',function(channelSettingsObject) {
                                    //ourBoard.debugPrintChannelSettings(channelSettingsObject);
                                    channelIsOn = ourBoard.channelIsOnFromChannelSettingsObject(channelSettingsObject);
                                });
                            });
                        }).catch(function (err) {
                            console.log('Error [setup]: ' + err);
                            done();
                        });

                    } else {
                        /** Display list of ports*/
                        console.log('Port not found... check ports for other ports');
                        done();
                    }
                });
                setTimeout(function () {
                    ourBoard.streamStop().then(ourBoard.disconnect).then(function (msg) {
                        done();
                    }, function (err) {
                        console.log('Error: ' + err);
                        done();
                    });
                }, 6000);
            });
            it('should turn channel off', function() {
                expect(channelIsOn).equals(false);
            });
        });
        xdescribe('#confirm channel 2 off with query register settings', function() {
            var channelIsOn = true;
            var didTryToSendPrintCommand = false;
            var didTryToTurnChannel1Off = false;
            beforeEach(function(done) {
                var ourBoard = new openBCIBoard.OpenBCIBoard();

                ourBoard.autoFindOpenBCIBoard(function (portName, ports) {
                    if (portName) {
                        ourBoard.connect(portName).then(function (boardSerial) {
                            //console.log('board connected');
                            ourBoard.on('ready', function () {
                                //console.log('Ready to print register settings!');
                                if (!didTryToSendPrintCommand) {
                                    didTryToSendPrintCommand = true;
                                    ourBoard.getSettingsForChannel(2); //set isChannelOn to true
                                } else if (!didTryToTurnChannel1Off) {
                                    didTryToTurnChannel1Off = true;
                                    //console.log('Tried to turn channel 1 off');
                                    ourBoard.channelOff(2);
                                    setTimeout(function() {
                                        //console.log('Re print register settings');
                                        ourBoard.getSettingsForChannel(2);
                                    },100);
                                }
                                ourBoard.on('query',function(channelSettingsObject) {
                                    //ourBoard.debugPrintChannelSettings(channelSettingsObject);
                                    channelIsOn = ourBoard.channelIsOnFromChannelSettingsObject(channelSettingsObject);
                                });
                            });
                        }).catch(function (err) {
                            console.log('Error [setup]: ' + err);
                            done();
                        });

                    } else {
                        /** Display list of ports*/
                        console.log('Port not found... check ports for other ports');
                        done();
                    }
                });
                setTimeout(function () {
                    ourBoard.streamStop().then(ourBoard.disconnect).then(function (msg) {
                        done();
                    }, function (err) {
                        console.log('Error: ' + err);
                        done();
                    });
                }, 6000);
            });
            it('should turn channel off', function() {
                expect(channelIsOn).equals(false);
            });
        });
    });
    xdescribe('#simulator', function() {
        var running = false;
        beforeEach(function(done) {
            var ourBoard = new openBCIBoard.OpenBCIBoard();

            ourBoard.simulatorStart().then(function() {
                console.log('Simulator started');
                ourBoard.on('sample',function(sample) {
                    //OpenBCISample.debugPrettyPrint(sample);
                });
            }).catch(function(err) {
                console.log('Error [simulator]: ' + err);
            });
            setTimeout(function() {
                ourBoard.simulatorStop().then(function() {
                    running = true;
                    done();
                },function(err) {
                    console.log('Error: ' + err);
                    done();
                });
            },1000);
        });
        it('should stop the simulator after 1 second', function() {
            expect(running).equals(true);
        });
    });
    //describe('write with different calls', function() {
    //    this.timeout(10000);
    //    //var running = false;
    //    var ourBoard = new openBCIBoard.OpenBCIBoard();
    //    var k = openBCIBoard.OpenBCIConstants;
    //    //console.log(ourBoard.writeAndDrain.toString());
    //    ourBoard.serial = 'taco';
    //    //var sandbox = sinon.sandbox.create();//(ourBoard.writeAndDrain);
    //    var mock = sinon.mock(ourBoard.writeAndDrain());
    //    //console.log(JSON.stringify(mock));
    //
    //    //ourBoard.write('1');
    //    //ourBoard.write('2');
    //    beforeEach(function(done) {
    //        setTimeout(function() {
    //            done();
    //        },k.OBCIWriteIntervalDelayMS * 3);
    //    });
    //    afterEach(function() {
    //        mock.restore();
    //    });
    //    it('should send command to writeAndDrain three times', function() {
    //        //console.log(JSON.stringify(ourBoard));
    //        expect(mock.calledThrice);
    //        //expect(running).equals(true);
    //    });
    //});
    //describe('write with array', function() {
    //    this.timeout(10000);
    //    var running = false;
    //    var ourBoard = new openBCIBoard.OpenBCIBoard();
    //
    //    ourBoard.serial = 'taco';
    //
    //    ourBoard.write(['1','2','3']);
    //    ourBoard.write('4');
    //    ourBoard.write('5');
    //    ourBoard.write('6');
    //    ourBoard.write('7');
    //    ourBoard.write('8');
    //    ourBoard.write(['9','10','11']);
    //
    //    beforeEach(function(done) {
    //        setTimeout(function() {
    //            running = true;
    //            done();
    //        },8000);
    //    });
    //    it('should send command to writeAndDrain three times', function() {
    //        expect(running).equals(true);
    //    });
    //});

});