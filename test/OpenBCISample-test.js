/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var openBCISample = require('../openBCISample');
var sinon = require('sinon');
var chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    openBCIBoard = require('../openBCIBoard');

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);

var k = openBCISample.k;

var samplePacket = function (sampleNumber) {
    if (sampleNumber === undefined || sampleNumber === null) {
        sampleNumber = 0x45;
    }
    if(sampleNumber > 255) {
        sampleNumber = 0x45;
    }
    return new Buffer([0xA0,sampleNumber,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0,0,0,1,0,2, 0xC0]);
};
// Actual first byte recieved from device, one time...
var samplePacketReal = function () {
    return new Buffer([0xA0,0,0x8F,0xF2,0x40,0x8F,0xDF,0xF4,0x90,0x2B,0xB6,0x8F,0xBF,0xBF,0x7F,0xFF,0xFF,0x7F,0xFF,0xFF,0x94,0x25,0x34,0x20,0xB6,0x7D,0,0xE0,0,0xE0,0x0F,0x70, 0xC0]);
};

var samplePacketTimeSyncSet = function () {
    return new Buffer([0xA0,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0,0,0,1, 0xC2]);
};

var sampleBuf = samplePacket();
var sampleBufTimeSyncSet = samplePacketTimeSyncSet();



describe('openBCISample',function() {
    var channelScaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);
    describe('#parseRawPacket', function() {
        it('should fulfill promise', function() {
            return openBCISample.parseRawPacket(sampleBuf).should.be.fulfilled;
        });
        it('should have the correct sample number', function() {
            return openBCISample.parseRawPacket(sampleBuf).should.eventually.have.property('sampleNumber').equal(0x45);
        });
        it('all the channels should have the same number value as their (index + 1) * scaleFactor', function(done) {
            openBCISample.parseRawPacket(sampleBuf) // sampleBuf has its channel number for each 3 byte integer. See line 20...
                .then(sampleObject => {
                    // So parse the sample we created and each value resulting from the channelData array should
                    //  be its index + 1 (i.e. channel number) multiplied by the channel scale factor set by the
                    //  ADS1299 for a gain of 24 (default)
                    sampleObject.channelData.forEach((channelValue, index) => {
                        assert.equal(channelValue,channelScaleFactor * (index + 1),'Channel ' + index + ' does not compute correctly');
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('all the auxs should have the same number value as their index * scaleFactor', function(done) {
            openBCISample.parseRawPacket(sampleBuf)
                .then(sampleObject => {
                    sampleObject.auxData.forEach((auxValue, index) => {
                        assert.equal(auxValue,openBCISample.scaleFactorAux * index,'Aux ' + index + ' does not compute correctly');
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('check to see if negative numbers work on channel data',function(done) {
            var temp = samplePacket();
            //console.log(temp);
            var taco = new Buffer([0x81]);
            taco.copy(temp,2);
            openBCISample.parseRawPacket(temp)
                .then(sampleObject => {
                    assert.equal(sampleObject.channelData[0],channelScaleFactor * -8323071,'Negative numbers not working correctly');
                    done();
                })
                .catch(err => done(err));
        });
        it('check to see if negative numbers work on aux data',function() {
            var temp = samplePacket();
            var taco = new Buffer([0x81]);
            taco.copy(temp,26);
            openBCISample.parseRawPacket(temp)
                .then(sampleObject => {
                    sampleObject.auxData[0].should.be.approximately(-32512 * openBCISample.scaleFactorAux,1);
                    done();
                })
                .catch(err => done(err));
        });
        it('should work on 200 samples',done => {
            var numberOfSamplesToTest = 200;
            var samplesReceived = 0;

            for (var i = 0; i < numberOfSamplesToTest; i++) {
                var temp = samplePacket(i);
                //console.log(temp);
                var taco = new Buffer([i]);
                taco.copy(temp,2);
                openBCISample.parseRawPacket(temp)
                    .then(sampleObject => {
                        if (sampleObject.sampleNumber === numberOfSamplesToTest - 1) {
                            done();
                        }
                        expect(sampleObject.sampleNumber).to.equal(samplesReceived);
                        samplesReceived++;
                    })
                    .catch(err => done(err));
            }
        });
        describe('#errorConditions', function() {
            it('send non data buffer', function(done) {
                openBCISample.parseRawPacket(1).should.be.rejected.and.notify(done);
            });
            it('bad start byte', function(done) {
                var temp = samplePacket();
                temp[0] = 69;
                openBCISample.parseRawPacket(temp).should.be.rejected.and.notify(done);
            });
            it('wrong number of bytes', function(done) {
                openBCISample.parseRawPacket(new Buffer(5)).should.be.rejected.and.notify(done);
            });
            it('undefined', function(done) {
                openBCISample.parseRawPacket().should.be.rejected.and.notify(done);
            });
        });
    });
    describe.only('#parseTimeSyncSetPacket', function() {
        it('should fulfill promise', function() {
            return openBCISample.parseTimeSyncSetPacket(sampleBufTimeSyncSet,0).should.be.fulfilled;
        });
        it('should extract the proper time value from packet', function(done) {
            openBCISample.parseTimeSyncSetPacket(sampleBufTimeSyncSet,0)
                .then(boardTime => {
                    assert.equal(boardTime,1,'Could not get 1 out of sampleBufTimeSyncSet');
                    done();
                })
                .catch(err => done(err));
        });
        it('should extract the proper time value from packet and add current time', function(done) {
            var currentTime = 0x800000000;
            var expectedTime = 0x800000001;//34359738369
            openBCISample.parseTimeSyncSetPacket(sampleBufTimeSyncSet,currentTime)
                .then(boardTime => {
                    assert.equal(boardTime,expectedTime,'Could not add current time with board time');
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('send non data buffer', function(done) {
                openBCISample.parseTimeSyncSetPacket(1,0).should.be.rejected.and.notify(done)
            });
            it('wrong number of bytes', function(done) {
                openBCISample.parseTimeSyncSetPacket(new Buffer(5),0).should.be.rejected.and.notify(done);
            });
            it('undefined', function(done) {
                openBCISample.parseTimeSyncSetPacket().should.be.rejected.and.notify(done);
            });
        });

    });
    describe('#convertSampleToPacket', function() {
        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        // get new sample
        var newSample = generateSample(0);

        // try to convert to packet
        var packetBuffer = openBCISample.convertSampleToPacket(newSample);

        it('should have correct start byte', function() {
            packetBuffer[0].should.equal(k.OBCIByteStart,'confirming start byte');
        });
        it('should have correct stop byte', function() {
            packetBuffer[k.OBCIPacketSize - 1].should.equal(k.OBCIByteStop,'confirming stop byte');
        });
        it('should have correct sample number', function() {
            packetBuffer[1].should.equal(1,'confirming sample number is 1 more than 0');
        });
        it('should convert channel data to binary', function(done) {
            openBCISample.parseRawPacket(packetBuffer)
                .then(sample => {
                    for(var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                        sample.channelData[i].should.be.approximately(newSample.channelData[i],0.001);
                    }
                    done();
                })
                .catch(err => done(err));
            //var sample = openBCISample.convertPacketToSample(packetBuffer);

        });
        it('should convert aux data to binary', function(done) {
            openBCISample.parseRawPacket(packetBuffer)
                .then(sample => {
                    for(var i = 0; i < 3; i++) {
                        sample.auxData[i].should.be.approximately(newSample.auxData[i],0.001);
                    }
                    done();
                })
                .catch(err => done(err));
            //var sample = openBCISample.convertPacketToSample(packetBuffer);

        });
    });
    describe('#interpret24bitAsInt32', function() {
        it('converts a small positive number', function() {
            var buf1 = new Buffer([0x00,0x06,0x90]); // 0x000690 === 1680
            var num = openBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,1680);
        });
        it('converts a large positive number', function() {
            var buf1 = new Buffer([0x02,0xC0,0x01]); // 0x02C001 === 180225
            var num = openBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,180225);
        });
        it('converts a small negative number', function() {
            var buf1 = new Buffer([0xFF,0xFF,0xFF]); // 0xFFFFFF === -1
            var num = openBCISample.interpret24bitAsInt32(buf1);
            num.should.be.approximately(-1,1);
        });
        it('converts a large negative number', function() {
            var buf1 = new Buffer([0x81,0xA1,0x01]); // 0x81A101 === -8281855
            var num = openBCISample.interpret24bitAsInt32(buf1);
            num.should.be.approximately(-8281855,1);
        });
    });
    describe('#interpret16bitAsInt32', function() {
        it('converts a small positive number', function() {
            var buf1 = new Buffer([0x06,0x90]); // 0x0690 === 1680
            var num = openBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,1680);
        });
        it('converts a large positive number', function() {
            var buf1 = new Buffer([0x02,0xC0]); // 0x02C0 === 704
            var num = openBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,704);
        });
        it('converts a small negative number', function() {
            var buf1 = new Buffer([0xFF,0xFF]); // 0xFFFF === -1
            var num = openBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,-1);
        });
        it('converts a large negative number', function() {
            var buf1 = new Buffer([0x81,0xA1]); // 0x81A1 === -32351
            var num = openBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,-32351);
        });
    });
    describe('#floatTo3ByteBuffer', function() {
        it('converts random floats to a 3-byte buffer', function() {
            var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
            var newSample = generateSample(0);

            for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                var buff = openBCISample.floatTo3ByteBuffer(newSample.channelData[i]);

                var num = openBCISample.interpret24bitAsInt32(buff);

                num = num * channelScaleFactor;

                num.should.be.approximately(newSample.channelData[i],0.00002);
            }
        });
    });
    describe('#floatTo2ByteBuffer', function() {
        it('converts random floats to a 2-byte buffer', function() {
            var auxData = [0.001,1,-0.00892];

            for (var i = 0; i < 3 ; i++) {
                var buff = openBCISample.floatTo2ByteBuffer(auxData[i]);

                var num = openBCISample.interpret16bitAsInt32(buff);

                num = num * openBCISample.scaleFactorAux;

                num.should.be.approximately(auxData[i],0.001);
            }
        });
    });
    describe('#randomSample', function() {
        it('should generate a random sample',function() {
            var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
            var oldSampleNumber = 0;
            var newSample = generateSample(oldSampleNumber);
            assert(newSample.sampleNumber,oldSampleNumber+1);
            describe('#debugPrettyPrint',function() {
                it('works with a good sample',function() {
                    openBCISample.debugPrettyPrint(newSample);
                });
                it('does not with a undefined sample',function() {
                    openBCISample.debugPrettyPrint();
                });
            });
        });
        it('should generate a sample with accel data every 25Hz',function() {
            var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
            var newSample = generateSample(0);

            var passed = false;
            // Should get one non-zero auxData array (on the 10th sample)
            for (var i = 0; i < 10; i++) {
                newSample = generateSample(newSample.sampleNumber);
                if (newSample.auxData[0] !== 0 || newSample.auxData[1] !== 0 || newSample.auxData[2] !== 0) {
                    passed = true;
                    newSample.auxData[0].should.be.approximately(0,0.1);
                    newSample.auxData[1].should.be.approximately(0,0.1);
                    newSample.auxData[2].should.be.approximately(1,0.4);
                }
            }
            assert(passed,"a sample with accel data was produced");
        });
    });
    describe('#impedanceCalculationForChannel', function() {

        it('rejects when undefined sampleObject', function(done) {
            var bad;
            openBCISample.impedanceCalculationForChannel(bad,1).should.be.rejected.and.notify(done);
        });
        it('rejects when undefined channel number', function(done) {
            var bad;
            openBCISample.impedanceCalculationForChannel('taco',bad).should.be.rejected.and.notify(done);
        });
        it('rejects when invalid channel number', function(done) {
            var bad;
            openBCISample.impedanceCalculationForChannel('taco',69).should.be.rejected.and.notify(done);
        });
    });
    describe('#impedanceSummarize', function() {
        var impedanceArray = [];
        var numberOfChannels = 8;
        beforeEach(() => {
            impedanceArray = openBCISample.impedanceArray(numberOfChannels);
        });
        it('should find impedance good', function() {
            impedanceArray[0].N.raw = 2201.84;

            openBCISample.impedanceSummarize(impedanceArray[0].N);

            impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextGood); // Check the text
        });
        it('should find impedance ok', function() {
            impedanceArray[0].N.raw = 5201.84;

            openBCISample.impedanceSummarize(impedanceArray[0].N);

            impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextOk); // Check the text
        });
        it('should find impedance bad', function() {
            impedanceArray[0].N.raw = 10201.84;

            openBCISample.impedanceSummarize(impedanceArray[0].N);

            impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextBad); // Check the text
        });
        it('should find impedance none', function() {
            impedanceArray[0].N.data = 44194179.09; // A huge number that would be seen if there was no electrode connected

            openBCISample.impedanceSummarize(impedanceArray[0].N);

            impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextNone); // Check the text
        });
    });
});

describe('#goertzelProcessSample', function() {
    var numberOfChannels = k.OBCINumberOfChannelsDefault;
    var goertzelObj = openBCISample.goertzelNewObject(numberOfChannels);
    var newRandomSample = openBCISample.randomSample(numberOfChannels,k.OBCISampleRate250);

    it('produces an array of impedances', function(done) {

        var passed = false;
        for (var i = 0; i < openBCISample.GOERTZEL_BLOCK_SIZE + 1; i++) {
            console.log('Iteration ' + i);
            var impedanceArray = openBCISample.goertzelProcessSample(newRandomSample(i),goertzelObj);
            if (impedanceArray) {
                console.log('Impedance Array: ');
                for(var j = 0; j < numberOfChannels; j++) {
                    console.log('Channel ' + (j+1) + ': ' + impedanceArray[j].toFixed(8))
                }
                passed = true;
            }
        }
        setTimeout(() => {
            if (passed) {
                done();
            } else {
                done('Failed to produce impedance array within block size + 1');
            }
        })

    });
});
