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
var bufferEqual = require('buffer-equal');
var fs = require('fs');
//var wstream = fs.createWriteStream('myOutput.txt');


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
                });
        });


    });
    after(done => {
        if(ourBoard["connected"]) {
            ourBoard.disconnect()
                .then(() => {
                    done();
                })
                .catch(err => {
                    done(err);
                })
        }
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
