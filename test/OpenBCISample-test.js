/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var openBCISample = require('../openBCISample');
var sinon = require('sinon');
var chai = require('chai'),
    should = chai.should(),
    openBCIBoard = require('../openBCIBoard');

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);

var k = openBCISample.k;

var samplePacket = function () {
    var byteSample = 0x45;
    var buffy = new Buffer([0xA0,byteSample,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0,0,0,1,0,2, 0xC0]);
    return buffy;
};
// Actual first byte recieved from device, one time...
var samplePacketReal = function () {
    return new Buffer([0xA0,0,0x8F,0xF2,0x40,0x8F,0xDF,0xF4,0x90,0x2B,0xB6,0x8F,0xBF,0xBF,0x7F,0xFF,0xFF,0x7F,0xFF,0xFF,0x94,0x25,0x34,0x20,0xB6,0x7D,0,0xE0,0,0xE0,0x0F,0x70, 0xC0]);
};

var sampleBuf = samplePacket();



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
            openBCISample.parseRawPacket(sampleBuf)
                .then(sampleObject => {
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
        describe('#errorConditions', function() {
            it('send non data buffer', function(done) {
                openBCISample.parseRawPacket(1).should.be.rejected.and.notify(done)
                //var sample = openBCISample.convertPacketToSample(1);
                //assert.equal(undefined,sample);
            });
            it('bad start byte', function(done) {
                var temp = samplePacket();
                temp[0] = 69;
                openBCISample.parseRawPacket(temp).should.be.rejected.and.notify(done);
                //var sample = openBCISample.convertPacketToSample(temp);
                //assert.equal(undefined,sample);
            });
            it('wrong number of bytes', function(done) {
                openBCISample.parseRawPacket(new Buffer(5)).should.be.rejected.and.notify(done);
                //var sample = openBCISample.convertPacketToSample(new Buffer(5));
                //assert.equal(undefined,sample);
            });
            it('undefined', function(done) {
                openBCISample.parseRawPacket().should.be.rejected.and.notify(done);
                //var sample = openBCISample.convertPacketToSample();
                //assert.equal(undefined,sample);
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
            impedanceArray[0].data = [5201.84, 7583.14, 2067.17, 0, 4132.37, 3189.33, 0, 3010.21, 7720.12, 4095.69, 0, 2730.19];

            openBCISample.impedanceSummarize(impedanceArray[0]);

            var sum = 0;
            var arrLen = impedanceArray[0].data.length;
            for (var i = 0; i < arrLen; i++) {
                sum += impedanceArray[0].data[i];
            }
            var avg = sum / arrLen;

            impedanceArray[0].average.should.be.approximately(avg,10); // Check the average
            impedanceArray[0].text.should.equal(k.OBCIImpedanceTextGood); // Check the text
        });
        it('should find impedance ok', function() {
            impedanceArray[0].data = [5201.84, 7583.14, 6067.17, 4305.43, 4132.37, 9189.33, 6925.34, 5010.21, 7720.12, 6095.69, 8730.19];

            openBCISample.impedanceSummarize(impedanceArray[0]);

            var sum = 0;
            var arrLen = impedanceArray[0].data.length;
            for (var i = 0; i < arrLen; i++) {
                sum += impedanceArray[0].data[i];
            }
            var avg = sum / arrLen;

            impedanceArray[0].average.should.be.approximately(avg,10); // Check the average
            impedanceArray[0].text.should.equal(k.OBCIImpedanceTextOk); // Check the text
        });
        it('should find impedance bad', function() {
            impedanceArray[0].data = [10201.84, 12583.14, 16067.17, 14305.43, 14132.37, 13189.33, 16925.34, 15010.21, 17720.12, 16095.69, 18730.19];

            openBCISample.impedanceSummarize(impedanceArray[0]);

            var sum = 0;
            var arrLen = impedanceArray[0].data.length;
            for (var i = 0; i < arrLen; i++) {
                sum += impedanceArray[0].data[i];
            }
            var avg = sum / arrLen;

            impedanceArray[0].average.should.be.approximately(avg,10); // Check the average
            impedanceArray[0].text.should.equal(k.OBCIImpedanceTextBad); // Check the text
        });
        it('should find impedance none', function() {
            impedanceArray[0].data = [44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09, 44194179.09];

            openBCISample.impedanceSummarize(impedanceArray[0]);

            var sum = 0;
            var arrLen = impedanceArray[0].data.length;
            for (var i = 0; i < arrLen; i++) {
                sum += impedanceArray[0].data[i];
            }
            var avg = sum / arrLen;

            impedanceArray[0].average.should.be.approximately(avg,10); // Check the average
            impedanceArray[0].text.should.equal(k.OBCIImpedanceTextNone); // Check the text
        });
        it('should remove outliers from data and find good impedance', function() {
            impedanceArray[0].data = [5201.84, 7583.14, 1112067.17, 0, 4132.37, 3189.33, 0, 1113010.21, 7720.12, 4095.69, 0, 2730.19];

            openBCISample.impedanceSummarize(impedanceArray[0]);

            var cleanedData = [5201.84, 7583.14, 0, 4132.37, 3189.33, 0, 7720.12, 4095.69, 0, 2730.19];

            var sum = 0;
            var arrLen = cleanedData.length;
            for (var i = 0; i < arrLen; i++) {
                sum += cleanedData[i];
            }
            var avg = sum / arrLen;

            impedanceArray[0].average.should.be.approximately(avg,10); // Check the average
            impedanceArray[0].text.should.equal(k.OBCIImpedanceTextGood); // Check the text
        });
    });
});

