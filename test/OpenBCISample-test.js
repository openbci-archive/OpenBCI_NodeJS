/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var openBCISample = require('../openBCISample');
var sinon = require('sinon');
var chai = require('chai'),
    expect = chai.expect,
    should = chai.should(),
    expect = chai.expect;

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);
var bufferEqual = require('buffer-equal');

var k = openBCISample.k;

const defaultChannelSettingsArray = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault);


var sampleBuf = openBCISample.samplePacket();
var sampleBufTimeSyncSet = openBCISample.samplePacketTimeSyncSet();

var accelArray;

var channelScaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);

describe('openBCISample',function() {
    beforeEach(function() {
        accelArray = [0,0,0];
    });
    describe('#parseRawPacketStandard', function() {
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
                        channelValue.should.equal(channelScaleFactor * (index + 1));
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('gets the 6-byte raw aux buffer',function(done) {
            openBCISample.parseRawPacketStandard(sampleBuf,defaultChannelSettingsArray,true)
                .then(sampleObject => {
                    Buffer.isBuffer(sampleObject.auxData).should.be.equal(true);
                    done();
                })
                .catch(err => done(err));
        });
        it('all the auxs should have the same number value as their index * scaleFactor', function(done) {
            openBCISample.parseRawPacketStandard(sampleBuf)
                .then(sampleObject => {
                    sampleObject.accelData.forEach((accelValue, index) => {
                        accelValue.should.equal(openBCISample.scaleFactorAux * index);
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('check to see if negative numbers work on channel data',function(done) {
            var temp = openBCISample.samplePacket();
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
        it('check to see if negative numbers work on aux data',function(done) {
            var temp = openBCISample.samplePacket();
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
                openBCISample.parseRawPacketStandard(temp)
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
        it('has the right sample number',function(done) {
            var expectedSampleNumber = 0x45;
            openBCISample.parseRawPacketStandard(sampleBuf)
                .then(sampleObject => {
                    sampleObject.sampleNumber.should.equal(expectedSampleNumber);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right stop byte',function(done) {
            openBCISample.parseRawPacketStandard(sampleBuf)
                .then(sampleObject => {
                    sampleObject.stopByte.should.equal(0xC0);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right start byte',function(done) {
            openBCISample.parseRawPacketStandard(sampleBuf)
                .then(sampleObject => {
                    sampleObject.startByte.should.equal(0xA0);
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('send non data buffer', function(done) {
                openBCISample.parseRawPacketStandard(1).should.be.rejected.and.notify(done);
            });
            it('bad start byte', function(done) {
                var temp = openBCISample.samplePacket();
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
    describe('#parsePacketStandardRawAux',function() {
        var packet;
        it('gets 6-byte buffer',function(done) {
            // Get a packet
            // This packet has aux bytes with the same value as their index
            packet = openBCISample.samplePacketStandardRawAux(0);

            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    Buffer.isBuffer(sampleObject.auxData).should.equal(true);
                    done();
                })
                .catch(err => done(err));
        });
        it('gets the correct 6-byte buffer',function(done) {
            // Get a packet
            // This packet has aux bytes with the same value as their index
            packet = openBCISample.samplePacketStandardRawAux(0);

            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    for (var i = 0; i < 6; i++) {
                        sampleObject.auxData[i].should.equal(i);
                    }
                    done();
                })
                .catch(err => done(err));
        });
        it('all the channels should have the same number value as their (index + 1) * scaleFactor', function(done) {
            packet = openBCISample.samplePacketStandardRawAux(0);
            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    sampleObject.channelData.forEach((channelValue, index) => {
                        channelValue.should.equal(channelScaleFactor * (index + 1));
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right sample number',function(done) {
            var expectedSampleNumber = 69;
            packet = openBCISample.samplePacketStandardRawAux(expectedSampleNumber);
            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    sampleObject.sampleNumber.should.equal(expectedSampleNumber);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right stop byte',function(done) {
            packet = openBCISample.samplePacketStandardRawAux(0);
            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    sampleObject.stopByte.should.equal(0xC1);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right start byte',function(done) {
            packet = openBCISample.samplePacketStandardRawAux(0);
            openBCISample.parseRawPacketStandard(packet,defaultChannelSettingsArray,false)
                .then(sampleObject => {
                    sampleObject.startByte.should.equal(0xA0);
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('send non data buffer', function(done) {
                openBCISample.parseRawPacketStandard(1,defaultChannelSettingsArray,false).should.be.rejected.and.notify(done)
            });
            it('bad start byte', function(done) {
                var temp = openBCISample.samplePacket();
                temp[0] = 69;
                openBCISample.parseRawPacketStandard(temp,defaultChannelSettingsArray,false).should.be.rejected.and.notify(done);
            });
            it('wrong number of bytes', function(done) {
                openBCISample.parseRawPacketStandard(new Buffer(5),defaultChannelSettingsArray,false).should.be.rejected.and.notify(done);
            });
            it('undefined', function(done) {
                openBCISample.parseRawPacketStandard(undefined,defaultChannelSettingsArray,false).should.be.rejected.and.notify(done);
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
                    //console.log(packetTime);
                    packetTime.should.equal(1);
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
    describe('#getFromTimePacketAccel',function() {
        var packet;

        it('should emit and array if z axis i.e. sampleNumber % 10 === 2', function(done) {
            // Make a packet with a sample number that represents z axis
            packet = openBCISample.samplePacketTimeSyncedAccel(2);
            openBCISample.getFromTimePacketAccel(packet,accelArray)
                .then(isZAxis => {
                    // accel array ready
                    isZAxis.should.equal(true);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });
        it('false if sample number is not sampleNumber % 10 === 2', function(done) {
            // Make a packet that is anything but the z axis
            packet = openBCISample.samplePacketTimeSyncedAccel(0);
            openBCISample.getFromTimePacketAccel(packet,accelArray)
                .then(isZAxis => {
                    // Accel array not ready for sampleNumber % 10 === 0
                    isZAxis.should.equal(false);

                    packet = openBCISample.samplePacketTimeSyncedAccel(1);
                    return openBCISample.getFromTimePacketAccel(packet,accelArray);
                })
                .then(isZAxis => {
                    // Accel array not ready for sampleNumber % 10 === 1
                    isZAxis.should.equal(false);

                    packet = openBCISample.samplePacketTimeSyncedAccel(34);
                    return openBCISample.getFromTimePacketAccel(packet,accelArray);
                })
                .then(isZAxis => {
                    // Accel array not ready for sampleNumber % 10 === 4
                    isZAxis.should.equal(false);

                    packet = openBCISample.samplePacketTimeSyncedAccel(99);
                    return openBCISample.getFromTimePacketAccel(packet,accelArray);
                })
                .then(isZAxis => {
                    // Accel array not ready for sampleNumber % 10 === 9
                    isZAxis.should.equal(false);
                    done();
                })
                .catch(err => {
                    done(err);
                })
        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.getFromTimePacketAccel(new Buffer(5),accelArray).should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#parsePacketTimeSyncedAccel', function() {
        // Global array (at least it's global in practice) to store accel data between packets
        var packet1, packet2, packet3;

        it('should only include accel data array on sampleNumber%10 === 2', function(done) {
            // Generate three packets, packets only get one axis value per packet
            //  X axis data is sent with every sampleNumber % 10 === 0
            packet1 = openBCISample.samplePacketTimeSyncedAccel(0);
            //  Y axis data is sent with every sampleNumber % 10 === 1
            packet2 = openBCISample.samplePacketTimeSyncedAccel(1);
            //  Z axis data is sent with every sampleNumber % 10 === 2
            packet3 = openBCISample.samplePacketTimeSyncedAccel(2);

            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray)
                .then(sampleObject => {
                    sampleObject.should.not.have.property('accelData');
                    return openBCISample.parsePacketTimeSyncedAccel(packet2,defaultChannelSettingsArray,0,accelArray);
                })
                .then(sampleObject => {
                    sampleObject.should.not.have.property('accelData');
                    return openBCISample.parsePacketTimeSyncedAccel(packet3,defaultChannelSettingsArray,0,accelArray);
                })
                .then(sampleObject => {
                    sampleObject.should.have.property('accelData');
                    done();
                })
                .catch(err => done(err));
        });
        it('should convert raw numbers into g\'s with scale factor',function(done) {
            // Generate three packets, packets only get one axis value per packet
            //  X axis data is sent with every sampleNumber % 10 === 0
            packet1 = openBCISample.samplePacketTimeSyncedAccel(0);
            //  Y axis data is sent with every sampleNumber % 10 === 1
            packet2 = openBCISample.samplePacketTimeSyncedAccel(1);
            //  Z axis data is sent with every sampleNumber % 10 === 2
            packet3 = openBCISample.samplePacketTimeSyncedAccel(2);

            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray)
                .then(() => {
                    return openBCISample.parsePacketTimeSyncedAccel(packet2,defaultChannelSettingsArray,0,accelArray);
                })
                .then(() => {
                    return openBCISample.parsePacketTimeSyncedAccel(packet3,defaultChannelSettingsArray,0,accelArray);
                })
                .then(sampleObject => {
                    sampleObject.accelData.forEach((accelValue, index) => {
                        accelValue.should.equal(openBCISample.scaleFactorAux);
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('all the channels should have the same number value as their (index + 1) * scaleFactor', function(done) {
            packet1 = openBCISample.samplePacketTimeSyncedAccel(0);
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray) // sampleBuf has its channel number for each 3 byte integer. See line 20...
                .then(sampleObject => {
                    sampleObject.channelData.forEach((channelValue, index) => {
                        channelValue.should.equal(channelScaleFactor * (index + 1));
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right sample number',function(done) {
            var expectedSampleNumber = 69;
            packet1 = openBCISample.samplePacketTimeSyncedAccel(expectedSampleNumber);
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray) // sampleBuf has its channel number for each 3 byte integer. See line 20...
                .then(sampleObject => {
                    sampleObject.sampleNumber.should.equal(expectedSampleNumber);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right stop byte',function(done) {
            packet1 = openBCISample.samplePacketTimeSyncedAccel(0);
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray) // sampleBuf has its channel number for each 3 byte integer. See line 20...
                .then(sampleObject => {
                    sampleObject.stopByte.should.equal(0xC4);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right start byte',function(done) {
            packet1 = openBCISample.samplePacketTimeSyncedAccel(0);
            openBCISample.parsePacketTimeSyncedAccel(packet1,defaultChannelSettingsArray,0,accelArray) // sampleBuf has its channel number for each 3 byte integer. See line 20...
                .then(sampleObject => {
                    sampleObject.startByte.should.equal(0xA0);
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.parsePacketTimeSyncedAccel(new Buffer(5),defaultChannelSettingsArray,0,accelArray).should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#getFromTimePacketRawAux', function() {
        var packet;
        it('should put the two aux bytes into a buffer',function(done) {
            // Get a packet
            packet = openBCISample.samplePacketTimeSyncedRawAux(0);

            openBCISample.getFromTimePacketRawAux(packet)
                .then(rawAuxBuffer => {
                    Buffer.isBuffer(rawAuxBuffer).should.equal(true);
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.getFromTimePacketRawAux(new Buffer(5)).should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#parsePacketTimeSyncedRawAux', function() {
        var packet;
        it('should put the two aux bytes into a buffer',function(done) {
            // Generate three packets, packets only get one axis value per packet
            packet = openBCISample.samplePacketTimeSyncedRawAux(0);

            openBCISample.parsePacketTimeSyncedRawAux(packet,defaultChannelSettingsArray,0)
                .then(sampleObject => {
                    sampleObject.should.have.property('auxData');
                    sampleObject.auxData[0].should.equal(0);
                    sampleObject.auxData[1].should.equal(1);
                    sampleObject.auxData.byteLength.should.equal(2);
                    done();
                })
                .catch(err => done(err));
        });
        it('all the channels should have the same number value as their (index + 1) * scaleFactor', function(done) {
            packet = openBCISample.samplePacketTimeSyncedRawAux(0);
            openBCISample.parsePacketTimeSyncedRawAux(packet,defaultChannelSettingsArray,0)
                .then(sampleObject => {
                    sampleObject.channelData.forEach((channelValue, index) => {
                        channelValue.should.equal(channelScaleFactor * (index + 1));
                    });
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right sample number',function(done) {
            var expectedSampleNumber = 69;
            packet = openBCISample.samplePacketTimeSyncedRawAux(expectedSampleNumber);
            openBCISample.parsePacketTimeSyncedRawAux(packet,defaultChannelSettingsArray,0)
                .then(sampleObject => {
                    sampleObject.sampleNumber.should.equal(expectedSampleNumber);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right stop byte',function(done) {
            packet = openBCISample.samplePacketTimeSyncedRawAux(0);
            openBCISample.parsePacketTimeSyncedRawAux(packet,defaultChannelSettingsArray,0)
                .then(sampleObject => {
                    sampleObject.stopByte.should.equal(0xC5);
                    done();
                })
                .catch(err => done(err));
        });
        it('has the right start byte',function(done) {
            packet = openBCISample.samplePacketTimeSyncedRawAux(0);
            openBCISample.parsePacketTimeSyncedRawAux(packet,defaultChannelSettingsArray,0)
                .then(sampleObject => {
                    sampleObject.startByte.should.equal(0xA0);
                    done();
                })
                .catch(err => done(err));
        });
        describe('#errorConditions', function() {
            it('wrong number of bytes', function(done) {
                openBCISample.parsePacketTimeSyncedRawAux(new Buffer(5),defaultChannelSettingsArray,0,accelArray).should.be.rejected.and.notify(done);
            });
        });
    });
    describe('#convertSampleToPacketStandard', function() {
        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        // get new sample
        var newSample = generateSample(0);

        // try to convert to packet
        var packetBuffer = openBCISample.convertSampleToPacketStandard(newSample);

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
        });
    });
    describe('#convertSampleToPacketRawAux', function() {
        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        // get new sample
        var newSample = generateSample(0);

        // Make a fake 6 byte buffer
        var rawBuffer = new Buffer([0,1,2,3,4,5]);

        // try to convert to packet
        var packetBuffer = openBCISample.convertSampleToPacketRawAux(newSample,rawBuffer);

        it('should have correct start byte', function() {
            packetBuffer[0].should.equal(k.OBCIByteStart,'confirming start byte');
        });
        it('should have correct stop byte', function() {
            packetBuffer[k.OBCIPacketSize - 1].should.equal(0xC1,'confirming stop byte');
        });
        it('should have correct sample number', function() {
            packetBuffer[1].should.equal(1,'confirming sample number is 1 more than 0');
        });
        it('should convert channel data to binary', function(done) {
            openBCISample.parseRawPacketStandard(packetBuffer,defaultChannelSettingsArray,false)
                .then(sample => {
                    for(var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                        sample.channelData[i].should.be.approximately(newSample.channelData[i],0.001);
                    }
                    done();
                })
                .catch(err => done(err));
        });
        it('should get raw aux buffer', done => {
            openBCISample.parseRawPacketStandard(packetBuffer,defaultChannelSettingsArray,false)
                .then(sample => {
                    expect(sample.auxData).to.exist;
                    expect(bufferEqual(rawBuffer,sample.auxData)).to.be.true;
                    done();
                })
                .catch(err => done(err));
        });
    });
    describe('#convertSampleToPacketTimeSync', function() {
        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        // get new sample
        var newSample = generateSample(0);

        // Make a time
        var time = 1010101;

        // Accel array
        var accelArray = [0,0,0];

        // Channel Settings
        var channelSettingsArray = k.channelSettingsArrayInit(8);

        // try to convert to packet
        var packetBuffer = openBCISample.convertSampleToPacketTimeSyncAccel(newSample,time);

        it('should have correct start byte', () => {
            packetBuffer[0].should.equal(k.OBCIByteStart,'confirming start byte');
        });
        it('should have correct stop byte', () => {
            packetBuffer[k.OBCIPacketSize - 1].should.equal(0xC4,'confirming stop byte');
        });
        it('should have correct sample number', () => {
            packetBuffer[1].should.equal(1,'confirming sample number is 1 more than 0');
        });
        it('should convert channel data to binary', done => {
            openBCISample.parsePacketTimeSyncedAccel(packetBuffer,channelSettingsArray,0,accelArray)
                .then(sample => {
                    for(var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                        sample.channelData[i].should.be.approximately(newSample.channelData[i],0.001);
                    }
                    done();
                })
                .catch(err => done(err));

        });
        it('should get board time', done => {
            openBCISample.parsePacketTimeSyncedAccel(packetBuffer,channelSettingsArray,0,accelArray)
                .then(sample => {
                    expect(sample.boardTime).to.exist;
                    expect(sample.boardTime).to.equal(time);
                    done();
                })
                .catch(err => done(err));
        });
        it('should get time stamp with offset', done => {
            var timeOffset = 80;
            openBCISample.parsePacketTimeSyncedAccel(packetBuffer,channelSettingsArray,timeOffset,accelArray)
                .then(sample => {
                    expect(sample.timeStamp).to.exist;
                    expect(sample.timeStamp).to.equal(time + timeOffset);
                    done();
                })
                .catch(err => done(err));
        });
    });
    describe('#convertSampleToPacketTimeSyncRawAux', function() {
        var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

        // get new sample
        var newSample = generateSample(0);

        // Make a time
        var time = 1010101;

        // Raw Aux
        var rawAux = new Buffer([0,1]);

        // Channel Settings
        var channelSettingsArray = k.channelSettingsArrayInit(8);

        // try to convert to packet
        var packetBuffer = openBCISample.convertSampleToPacketTimeSyncRawAux(newSample,time,rawAux);

        it('should have correct start byte', () => {
            packetBuffer[0].should.equal(k.OBCIByteStart,'confirming start byte');
        });
        it('should have correct stop byte', () => {
            packetBuffer[k.OBCIPacketSize - 1].should.equal(0xC5,'confirming stop byte');
        });
        it('should have correct sample number', () => {
            packetBuffer[1].should.equal(1,'confirming sample number is 1 more than 0');
        });
        it('should convert channel data to binary', done => {
            openBCISample.parsePacketTimeSyncedRawAux(packetBuffer,channelSettingsArray,0)
                .then(sample => {
                    for(var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                        sample.channelData[i].should.be.approximately(newSample.channelData[i],0.001);
                    }
                    done();
                })
                .catch(err => done(err));

        });
        it('should get raw aux buffer', done => {
            openBCISample.parsePacketTimeSyncedRawAux(packetBuffer,channelSettingsArray,0)
                .then(sample => {
                    expect(sample.auxData).to.exist;
                    expect(bufferEqual(rawAux,sample.auxData)).to.be.true;
                    done();
                })
                .catch(err => done(err));
        });
        it('should get board time', done => {
            openBCISample.parsePacketTimeSyncedRawAux(packetBuffer,channelSettingsArray,0)
                .then(sample => {
                    expect(sample.boardTime).to.exist;
                    expect(sample.boardTime).to.equal(time);
                    done();
                })
                .catch(err => done(err));
        });
        it('should get time stamp with offset', done => {
            var timeOffset = 80;
            openBCISample.parsePacketTimeSyncedRawAux(packetBuffer,channelSettingsArray,timeOffset)
                .then(sample => {
                    expect(sample.timeStamp).to.exist;
                    expect(sample.timeStamp).to.equal(time + timeOffset);
                    done();
                })
                .catch(err => done(err));
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
    describe('#makeDaisySampleObject', function() {
        var lowerSampleObject, upperSampleObject, daisySampleObject;
        before(() => {
            // Make the lower sample (channels 1-8)
            lowerSampleObject = openBCISample.newSample(1);
            lowerSampleObject.channelData = [1,2,3,4,5,6,7,8];
            lowerSampleObject.auxData = [0,1,2];
            lowerSampleObject.timestamp = 4;
            lowerSampleObject.accelData = [0.5,-0.5,1];
            // Make the upper sample (channels 9-16)
            upperSampleObject = openBCISample.newSample(2);
            upperSampleObject.channelData = [9,10,11,12,13,14,15,16];
            upperSampleObject.auxData = [3,4,5];
            upperSampleObject.timestamp = 8;

            // Call the function under test
            daisySampleObject = openBCISample.makeDaisySampleObject(lowerSampleObject,upperSampleObject);
        });
        it("should make a channelData array 16 elements long",function() {
            daisySampleObject.channelData.length.should.equal(k.OBCINumberOfChannelsDaisy);
        });
        it("should make a channelData array with lower array in front of upper array",function() {
            for (var i = 0; i < 16; i++) {
                expect(daisySampleObject.channelData[i]).to.equal(i+1);
            }
        });
        it("should make the sample number equal to the second packet divided by two",function() {
            daisySampleObject.sampleNumber.should.equal(upperSampleObject.sampleNumber / 2);
        });
        it("should put the aux packets in an object", function() {
            daisySampleObject.auxData.hasOwnProperty('lower').should.be.true;
            daisySampleObject.auxData.hasOwnProperty('upper').should.be.true;
        });
        it("should put the aux packets in an object in the right order", function() {
            for (var i = 0; i < 3; i++) {
                expect(daisySampleObject.auxData["lower"][i]).to.equal(i);
                expect(daisySampleObject.auxData["upper"][i]).to.equal(i + 3);
            }
        });
        it("should average the two timestamps together",function() {
            var expectedAverage = (upperSampleObject.timestamp + lowerSampleObject.timestamp)/2;
            daisySampleObject.timestamp.should.equal(expectedAverage);
        });
        it("should place the old timestamps in an object",function() {
            daisySampleObject._timestamps.lower.should.equal(lowerSampleObject.timestamp);
            daisySampleObject._timestamps.upper.should.equal(upperSampleObject.timestamp);
        });
        it("should store an accelerometer value if present",function() {
            daisySampleObject.should.have.property("accelData");
        });
    });
    describe("#isEven", function () {
        it("should return true for even number",function(){
            openBCISample.isEven(2).should.be.true;
        });
        it("should return false for odd number",function(){
            openBCISample.isEven(1).should.be.false;
        });
    });
    describe("#isOdd", function () {
        it("should return true for odd number",function(){
            openBCISample.isOdd(1).should.be.true;
        });
        it("should return false for even number",function(){
            openBCISample.isOdd(2).should.be.false;
        });
    });
    describe("#getChannelDataArray", function() {
        var sampleBuf, badChanArray;
        beforeEach(() => {
            sampleBuf = openBCISample.samplePacket(0);
        });
        it("should multiply each channel by the proper scale value", done => {
            var chanArr = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault); // Not in daisy mode
            var scaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);
            // Call the function under test
            openBCISample.getChannelDataArray(sampleBuf,chanArr).then(valueArray => {
                console.log("hey");
                for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
                    console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`);
                    expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1),0.0001);
                }
                done();
            }).catch(err => done);
        });
        it("in daisy mode, on odd samples should use gains from index 0-7 of channel settings array", done => {
            // Overwrite the default
            sampleBuf = openBCISample.samplePacket(1); // even's are the daisy channels
            // Make a 16 element long channel settings array
            var chanArr = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDaisy);
            // Set the upper (8-15) of channel settings array. If the function under test uses the 1 gain, then the test
            //  will fail.
            for (var i = k.OBCINumberOfChannelsDefault; i < k.OBCINumberOfChannelsDaisy; i++) {
                chanArr[i].gain = 1;
            }
            var scaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);
            // Call the function under test
            openBCISample.getChannelDataArray(sampleBuf,chanArr).then(valueArray => {
                for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
                    // console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`);
                    expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1),0.0001);
                }
                done();
            }).catch(err => done);
        });
        it("in daisy mode, on even samples should use gains from index 8-15 of channel settings array", done => {
            // Overwrite the default
            sampleBuf = openBCISample.samplePacket(2); // even's are the daisy channels
            // Make a 16 element long channel settings array
            var chanArr = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDaisy);
            // Set the lower (0-7) of channel settings array. If the function under test uses the 1 gain, then the test
            //  will fail.
            for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                chanArr[i].gain = 1;
            }
            // gain here is 24, the same as in the channel settings array
            var scaleFactor = 4.5 / 24 / (Math.pow(2,23) - 1);
            // Call the function under test
            openBCISample.getChannelDataArray(sampleBuf,chanArr).then(valueArray => {
                for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
                    // console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`);
                    expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1),0.0001);
                }
                done();
            }).catch(err => done);
        });
        it("in default mode, should reject when empty channel setting array", done => {
            badChanArray = new Array(k.OBCINumberOfChannelsDefault).fill(0);
            openBCISample.getChannelDataArray(sampleBuf,badChanArray).should.be.rejected.and.notify(done);
        });
        it("in daisy mode, should reject when empty channel setting array", done => {
            badChanArray = new Array(k.OBCINumberOfChannelsDaisy).fill(0);
            openBCISample.getChannelDataArray(sampleBuf,badChanArray).should.be.rejected.and.notify(done);
        });
        it("in default mode, should reject if not numbers in gain position", done => {
            badChanArray = [];
            for(var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
                badChanArray.push({
                    gain : "taco"
                });
            }
            openBCISample.getChannelDataArray(sampleBuf,badChanArray).should.be.rejected.and.notify(done);
        });
        it("in daisy mode, should reject if not numbers in gain position", done => {
            badChanArray = [];
            for(var i = 0; i < k.OBCINumberOfChannelsDaisy; i++) {
                badChanArray.push({
                    gain : "taco"
                });
            }
            openBCISample.getChannelDataArray(sampleBuf,badChanArray).should.be.rejected.and.notify(done);
        });
        it("should reject when channelSettingsArray is not in fact an array", done => {
            openBCISample.getChannelDataArray(sampleBuf,{}).should.be.rejected.and.notify(done);
        });
    });
    describe('#countADSPresent',function() {
        it("should not crash on small buff",function() {
            var buf = new Buffer("AJ!");

            openBCISample.countADSPresent(buf).should.equal(0);
        });
        it("should not find any ADS1299 present",function() {
            var buf = new Buffer("AJ Keller is an awesome programmer!\n I know right!");

            openBCISample.countADSPresent(buf).should.equal(0);
        });
        it("should find one ads present",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nLIS3DH Device ID: 0x38422$$$`);

            openBCISample.countADSPresent(buf).should.equal(1);
        });
        it("should find two ads1299 present",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nOn Daisy ADS1299 Device ID: 0xFFFFF\nLIS3DH Device ID: 0x38422\n$$$`);

            openBCISample.countADSPresent(buf).should.equal(2);
        });
    });
    describe('#doesBufferHaveEOT',function() {
        it("should not crash on small buff",function() {
            var buf = new Buffer("AJ!");

            openBCISample.doesBufferHaveEOT(buf).should.equal(false);
        });
        it("should not find any $$$",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nOn Daisy ADS1299 Device ID: 0xFFFFF\nLIS3DH Device ID: 0x38422\nFirmware: v2\n`);

            openBCISample.doesBufferHaveEOT(buf).should.equal(false);

            buf = Buffer.concat([buf, new Buffer(k.OBCIParseEOT)],buf.length + 3);

            openBCISample.doesBufferHaveEOT(buf).should.equal(true);
        });
        it("should find a $$$",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nOn Daisy ADS1299 Device ID: 0xFFFFF\nLIS3DH Device ID: 0x38422\nFirmware: v2\n$$$`);

            openBCISample.doesBufferHaveEOT(buf).should.equal(true);
        });
    });
    describe('#findV2Firmware',function() {
        it("should not crash on small buff",function() {
            var buf = new Buffer("AJ!");

            openBCISample.findV2Firmware(buf).should.equal(false);
        });
        it("should not find any v2",function() {
            var buf = new Buffer("AJ Keller is an awesome programmer!\n I know right!");

            openBCISample.findV2Firmware(buf).should.equal(false);
        });
        it("should not find a v2",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nLIS3DH Device ID: 0x38422$$$`);

            openBCISample.findV2Firmware(buf).should.equal(false);
        });
        it("should find a v2",function() {
            var buf = new Buffer(`OpenBCI V3 Simulator\nOn Board ADS1299 Device ID: 0x12345\nOn Daisy ADS1299 Device ID: 0xFFFFF\nLIS3DH Device ID: 0x38422\nFirmware: v2\n$$$`);

            openBCISample.findV2Firmware(buf).should.equal(true);
        });
    });
    describe('#isFailureInBuffer',function() {
        it("should not crash on small buff",function() {
            var buf = new Buffer("AJ!");

            openBCISample.isFailureInBuffer(buf).should.equal(false);
        });
        it("should not find any failure in a success message",function() {
            var buf = new Buffer("Success: Poll time set$$$");

            openBCISample.isFailureInBuffer(buf).should.equal(false);
        });
        it("should find failure in a failure message",function() {
            var buf = new Buffer("Failure: Could not change Dongle channel number$$$");

            openBCISample.isFailureInBuffer(buf).should.equal(true);
        });
    });
    describe('#isSuccessInBuffer',function() {
        it("should not crash on small buff",function() {
            var buf = new Buffer("AJ!");

            openBCISample.isSuccessInBuffer(buf).should.equal(false);
        });
        it("should not find any success in a failure message",function() {
            var buf = new Buffer("Failure: Could not change Dongle channel number");

            openBCISample.isSuccessInBuffer(buf).should.equal(false);
        });
        it("should find success in a success message",function() {
            var buf = new Buffer("Success: Poll time set$$$");

            openBCISample.isSuccessInBuffer(buf).should.equal(true);
        });
    });

    describe("#isTimeSyncSetConfirmationInBuffer", function() {
        it("should find the character in a buffer with only the character", function() {
            openBCISample.isTimeSyncSetConfirmationInBuffer(new Buffer(",")).should.equal(true);
        });
        it("should not find the character in a buffer without the character", function() {
            openBCISample.isTimeSyncSetConfirmationInBuffer(openBCISample.samplePacket()).should.equal(false);
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
