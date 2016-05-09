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
    return new Buffer([0xA0,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0,0,0,1,0xC3]);
};

var samplePacketTimeSyncedAccel = function () {
    var byteSample = 0x45;
    return new Buffer([0xA0,byteSample,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0x00,0x00,0,0,0,1,0xC4]);
};


var samplePacketTimeSyncedRawAux = function () {
    var byteSample = 0x45;
    return new Buffer([0xA0,byteSample,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0x00,0x00,0,0,0,1,0xC5]);
};

const defaultChannelSettingsArray = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault);


var sampleBuf = samplePacket();
var sampleBufTimeSyncSet = samplePacketTimeSyncSet();
var sampleBufTimeSyncedRawAux = samplePacketTimeSyncedRawAux();
var sampleBufTimeSyncedAccel = samplePacketTimeSyncedAccel();

var accelArray;


describe('openBCISample',function() {
    var channelScaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);
    beforeEach(function() {
        accelArray = [0,0,0];
    });
    describe('#parseRawPacket', function() {
        it('should fulfill promise', function() {
            return openBCISample.parseRawPacketStandard(sampleBuf).should.be.fulfilled;
        });
        it('should have the correct sample number', function() {
            return openBCISample.parseRawPacketStandard(sampleBuf).should.eventually.have.property('sampleNumber').equal(0x45);
        });
        it('all the channels should have the same number value as their (index + 1) * scaleFactor', function(done) {
            openBCISample.parseRawPacketStandard(sampleBuf) // sampleBuf has its channel number for each 3 byte integer. See line 20...
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
            openBCISample.parseRawPacketStandard(sampleBuf)
                .then(sampleObject => {
                    sampleObject.accelData.forEach((auxValue, index) => {
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
            openBCISample.parseRawPacketStandard(temp)
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
            openBCISample.parseRawPacketStandard(temp)
                .then(sampleObject => {
                    sampleObject.accelData[0].should.be.approximately(-32512 * openBCISample.scaleFactorAux,1);
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
                openBCISample.parseRawPacketStandard(1).should.be.rejected.and.notify(done);
            });
            it('bad start byte', function(done) {
                var temp = samplePacket();
                temp[0] = 69;
                openBCISample.parseRawPacketStandard(temp).should.be.rejected.and.notify(done);
            });
            it('wrong number of bytes', function(done) {
                openBCISample.parseRawPacketStandard(new Buffer(5)).should.be.rejected.and.notify(done);
            });
            it('undefined', function(done) {
                openBCISample.parseRawPacketStandard().should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#getFromTimePacketTime', function() {
        it('should fulfill promise', function() {
            return openBCISample.getFromTimePacketTime(sampleBufTimeSyncSet).should.be.fulfilled;
        });
        it('should extract the proper time value from packet', function(done) {
            openBCISample.getFromTimePacketTime(sampleBufTimeSyncSet)
                .then(packetTime => {
                    console.log(packetTime);
                    assert.equal(packetTime,1,'Could not get time 1 out of sampleBufTimeSyncSet');
                    assert.equal(true,k.isNumber(packetTime),'Time is not a number');
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.getFromTimePacketTime(new Buffer(5),0).should.be.rejected.and.notify(done);
            });
        });
    });
    describe.only('#getFromTimePacketAccel',function() {
        var packet;
        // Generate a new packet
        packet = samplePacketTimeSyncedAccel();

        it('should emit and array if z axis', function() {
            openBCISample.getFromTimePacketAccel(packet,0,accelArray)
                .then()
        });
    });
    describe('#parsePacketTimeSyncedAccel', function() {
        // Global array (at least it's global in practice) to store accel data between packets

        var packet1, packet2, packet3;
        // Generate three packets, packets only get one axis value per packet
        packet1 = samplePacketTimeSyncedAccel();
        packet2 = samplePacketTimeSyncedAccel();
        packet3 = samplePacketTimeSyncedAccel();

        // Change the sample numbers so we produce the correct sequence.
        //  X axis data is sent with every sampleNumber % 10 === 0
        packet1[k.OBCIPacketPositionSampleNumber] = 0;
        //  Y axis data is sent with every sampleNumber % 10 === 1
        packet2[k.OBCIPacketPositionSampleNumber] = 1;
        //  Z axis data is sent with every sampleNumber % 10 === 2
        packet3[k.OBCIPacketPositionSampleNumber] = 2;

        it('should only include accel data array on sampleNumber%10 === 2', function(done) {
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelDataArray)
                .then(sampleObject => {
                    assert.equal(false,sampleObject.hasOwnProperty('accelData'),'should not have accel data yet in first packet, the X');
                    return openBCISample.parsePacketTimeSyncedAccel(packet2,defaultChannelSettingsArray,0,accelDataArray);
                })
                .then(sampleObject => {
                    assert.equal(false,sampleObject.hasOwnProperty('accelData'),'should not have accel data yet in second packet, the Y');
                    return openBCISample.parsePacketTimeSyncedAccel(packet3,defaultChannelSettingsArray,0,accelDataArray);
                })
                .then(sampleObject => {
                    assert.equal(true,sampleObject.hasOwnProperty('accelData'),'finally gets the accel data in the third packet, the Z');
                    done();
                })
                .catch(err => done(err));
        });
        it('should convert raw numbers into g\'s with scale factor',function(done) {
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelDataArray)
                .then(() => {
                    return openBCISample.parsePacketTimeSyncedAccel(packet2,defaultChannelSettingsArray,0,accelDataArray);
                })
                .then(() => {
                    return openBCISample.parsePacketTimeSyncedAccel(packet3,defaultChannelSettingsArray,0,accelDataArray);
                })
                .then(sampleObject => {
                    console.log(sampleObject.accelData);
                    sampleObject.accelData.forEach((accelValue, index) => {
                        assert.equal(accelValue,openBCISample.scaleFactorAux,'Accel ' + index + ' does not compute correctly');
                    });
                    done();
                })
                .catch(err => done(err));

        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.getFromTimePacketTime(new Buffer(5),0).should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#parsePacketTimeSyncedAccel', function() {
        var accelArray = [0,0,0];
        it('should fulfill promise', function() {
            return openBCISample.parsePacketTimeSyncedAccel(sampleBufTimeSyncedAccel,defaultChannelSettingsArray,0,accelArray).should.be.fulfilled;
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
            openBCISample.parseRawPacketStandard(packetBuffer)
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
            openBCISample.parseRawPacketStandard(packetBuffer)
                .then(sample => {
                    for(var i = 0; i < 3; i++) {
                        sample.accelData[i].should.be.approximately(newSample.auxData[i],0.001);
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
            //console.log('Iteration ' + i);
            var impedanceArray = openBCISample.goertzelProcessSample(newRandomSample(i),goertzelObj);
            if (impedanceArray) {
                //console.log('Impedance Array: ');
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
