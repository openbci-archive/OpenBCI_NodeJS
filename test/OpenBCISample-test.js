/**
* Created by ajk on 12/15/15.
*/
'use strict';
const bluebirdChecks = require('./bluebirdChecks');
const openBCISample = require('../openBCISample');
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const should = chai.should(); // eslint-disable-line no-unused-vars

const chaiAsPromised = require('chai-as-promised');
const sinonChai = require('sinon-chai');
chai.use(chaiAsPromised);
chai.use(sinonChai);
const bufferEqual = require('buffer-equal');

const k = require('../openBCIConstants');

const defaultChannelSettingsArray = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault);

const sampleBuf = openBCISample.samplePacket();

let accelArray;

const channelScaleFactor = 4.5 / 24 / (Math.pow(2, 23) - 1);

describe('openBCISample', function () {
  beforeEach(function () {
    accelArray = [0, 0, 0];
  });
  afterEach(() => bluebirdChecks.noPendingPromises());
  describe('#parseRawPacketStandard', function () {
    this.timeout(4000);
    it('should return the packet', function () {
      expect(openBCISample.parseRawPacketStandard(sampleBuf)).to.not.be.null;
    });
    it('should have the correct sample number', function () {
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);

      (sample.sampleNumber).should.equal(0x45);
    });
    it('all the channels should have the same number value as their (index + 1) * scaleFactor', function () {
      // sampleBuf has its channel number for each 3 byte integer. See line 20...
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);

      // So parse the sample we created and each value resulting from the channelData array should
      //  be its index + 1 (i.e. channel number) multiplied by the channel scale factor set by the
      //  ADS1299 for a gain of 24 (default)
      sample.channelData.forEach((channelValue, index) => {
        channelValue.should.equal(channelScaleFactor * (index + 1));
      });
    });
    it('gets the 6-byte raw aux buffer', function () {
      let sample = openBCISample.parseRawPacketStandard(sampleBuf, defaultChannelSettingsArray, true);
      Buffer.isBuffer(sample.auxData).should.be.equal(true);
    });
    it('all the auxs should have the same number value as their index * scaleFactor', function () {
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);

      sample.accelData.forEach((accelValue, index) => {
        accelValue.should.equal(openBCISample.scaleFactorAux * index);
      });
    });
    it('check to see if negative numbers work on channel data', function () {
      var temp = openBCISample.samplePacket();
      // console.log(temp)
      var taco = new Buffer([0x81]);
      taco.copy(temp, 2);
      let sample = openBCISample.parseRawPacketStandard(temp);
      assert.equal(sample.channelData[0], channelScaleFactor * -8323071, 'Negative numbers not working correctly');
    });
    it('check to see if negative numbers work on aux data', function () {
      var temp = openBCISample.samplePacket();
      var taco = new Buffer([0x81]);
      taco.copy(temp, 26);
      let sample = openBCISample.parseRawPacketStandard(temp);
      sample.accelData[0].should.be.approximately(-32512 * openBCISample.scaleFactorAux, 1);
    });
    it('should work on 200 samples', function () {
      var numberOfSamplesToTest = 200;
      var samplesReceived = 0;

      for (var i = 0; i < numberOfSamplesToTest; i++) {
        var temp = openBCISample.samplePacket(i);
        // console.log(temp)
        var taco = new Buffer([i]);
        taco.copy(temp, 2);
        let sample = openBCISample.parseRawPacketStandard(temp);
        expect(sample.sampleNumber).to.equal(samplesReceived);
        samplesReceived++;
      }
    });
    it('has the right sample number', function () {
      var expectedSampleNumber = 0x45;
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);
      sample.sampleNumber.should.equal(expectedSampleNumber);
    });
    it('has the right stop byte', function () {
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);
      sample.stopByte.should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel));
    });
    it('has the right start byte', function () {
      let sample = openBCISample.parseRawPacketStandard(sampleBuf);
      sample.startByte.should.equal(0xA0);
    });
    describe('#errorConditions', function () {
      it('send non data buffer', function () {
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, 1)).to.throw(k.OBCIErrorInvalidByteLength);
      });
      it('bad start byte', function () {
        var temp = openBCISample.samplePacket();
        temp[0] = 69;
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, temp)).to.throw(k.OBCIErrorInvalidByteStart);
      });
      it('wrong number of bytes', function () {
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, new Buffer(5))).to.throw(k.OBCIErrorInvalidByteLength);
      });
      it('undefined', function () {
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample)).to.throw(k.OBCIErrorUndefinedOrNullInput);
      });
    });
  });
  describe('#parsePacketStandardRawAux', function () {
    var packet;
    it('gets 6-byte buffer', function () {
      // Get a packet
      // This packet has aux bytes with the same value as their index
      packet = openBCISample.samplePacketStandardRawAux(0);

      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      Buffer.isBuffer(sample.auxData).should.equal(true);
    });
    it('gets the correct 6-byte buffer', function () {
      // Get a packet
      // This packet has aux bytes with the same value as their index
      packet = openBCISample.samplePacketStandardRawAux(0);

      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      for (var i = 0; i < 6; i++) {
        sample.auxData[i].should.equal(i);
      }
    });
    it('all the channels should have the same number value as their (index + 1) * scaleFactor', function () {
      packet = openBCISample.samplePacketStandardRawAux(0);
      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      sample.channelData.forEach((channelValue, index) => {
        channelValue.should.equal(channelScaleFactor * (index + 1));
      });
    });
    it('has the right sample number', function () {
      var expectedSampleNumber = 69;
      packet = openBCISample.samplePacketStandardRawAux(expectedSampleNumber);
      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      sample.sampleNumber.should.equal(expectedSampleNumber);
    });
    it('has the right stop byte', function () {
      packet = openBCISample.samplePacketStandardRawAux(0);
      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      sample.stopByte.should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux));
    });
    it('has the right start byte', function () {
      packet = openBCISample.samplePacketStandardRawAux(0);
      let sample = openBCISample.parseRawPacketStandard(packet, defaultChannelSettingsArray, false);
      sample.startByte.should.equal(0xA0);
    });
    describe('#errorConditions', function () {
      it('send non data buffer', function () {
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, 1)).to.throw(k.OBCIErrorInvalidByteLength);
      });
      it('bad start byte', function () {
        var temp = openBCISample.samplePacket();
        temp[0] = 69;
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, temp, defaultChannelSettingsArray, false)).to.throw(k.OBCIErrorInvalidByteStart);
      });
      it('wrong number of bytes', function () {
        expect(openBCISample.parseRawPacketStandard.bind(openBCISample, new Buffer(5), defaultChannelSettingsArray, false)).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#getFromTimePacketTime', function () {
    it('should extract the proper time value from packet', function () {
      let sampleWithTime = openBCISample.samplePacketAccelTimeSynced(0);
      let time = openBCISample.getFromTimePacketTime(sampleWithTime);
      time.should.equal(1);
    });
    describe('#errorConditions', function () {
      it('wrong number of bytes', function () {
        expect(openBCISample.getFromTimePacketTime.bind(openBCISample, new Buffer(5))).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#getFromTimePacketAccel', function () {
    var packet;

    it('should emit and array if z axis i.e. sampleNumber % 10 === 9', function () {
      // Make a packet with a sample number that represents z axis
      packet = openBCISample.samplePacketAccelTimeSynced(9);
      let isZAxis = openBCISample.getFromTimePacketAccel(packet, accelArray);
      isZAxis.should.equal(true);
    });
    it(`false if sample number is not sampleNumber % 10 === ${k.OBCIAccelAxisZ}`, function () {
      // Make a packet that is anything but the z axis
      packet = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisX);
      let isZAxis = openBCISample.getFromTimePacketAccel(packet, accelArray);
      isZAxis.should.equal(false);

      packet = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisY);
      isZAxis = openBCISample.getFromTimePacketAccel(packet, accelArray);
      isZAxis.should.equal(false);

      packet = openBCISample.samplePacketAccelTimeSynced(34);
      isZAxis = openBCISample.getFromTimePacketAccel(packet, accelArray);
      isZAxis.should.equal(false);

      packet = openBCISample.samplePacketAccelTimeSynced(100);
      isZAxis = openBCISample.getFromTimePacketAccel(packet, accelArray);
      isZAxis.should.equal(false);
    });
    describe('#errorConditions', function () {
      it('wrong number of bytes', function () {
        expect(openBCISample.getFromTimePacketAccel.bind(openBCISample, new Buffer(5))).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#parsePacketTimeSyncedAccel', function () {
    // Global array (at least it's global in practice) to store accel data between packets
    var packet1, packet2, packet3;

    it(`should only include accel data array on sampleNumber%10 === ${k.OBCIAccelAxisZ}`, function () {
      // Generate three packets, packets only get one axis value per packet
      //  X axis data is sent with every sampleNumber % 10 === 7
      packet1 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisX);
      //  Y axis data is sent with every sampleNumber % 10 === 8
      packet2 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisY);
      //  Z axis data is sent with every sampleNumber % 10 === 9
      packet3 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisZ);

      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray);
      sample.should.not.have.property('accelData');

      sample = openBCISample.parsePacketTimeSyncedAccel(packet2, defaultChannelSettingsArray, 0, accelArray);
      sample.should.not.have.property('accelData');

      sample = openBCISample.parsePacketTimeSyncedAccel(packet3, defaultChannelSettingsArray, 0, accelArray);
      sample.should.have.property('accelData');
    });
    it("should convert raw numbers into g's with scale factor", function () {
      // Generate three packets, packets only get one axis value per packet
      //  X axis data is sent with every sampleNumber % 10 === 7
      packet1 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisX);
      //  Y axis data is sent with every sampleNumber % 10 === 8
      packet2 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisY);
      //  Z axis data is sent with every sampleNumber % 10 === 9
      packet3 = openBCISample.samplePacketAccelTimeSynced(k.OBCIAccelAxisZ);

      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray);
      sample = openBCISample.parsePacketTimeSyncedAccel(packet2, defaultChannelSettingsArray, 0, accelArray);
      sample = openBCISample.parsePacketTimeSyncedAccel(packet3, defaultChannelSettingsArray, 0, accelArray);
      sample.accelData.forEach((accelValue, index) => {
        accelValue.should.equal(openBCISample.scaleFactorAux);
      });
    });
    it('all the channels should have the same number value as their (index + 1) * scaleFactor', function () {
      packet1 = openBCISample.samplePacketAccelTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray); // sampleBuf has its channel number for each 3 byte integer. See line 20...
      sample.channelData.forEach((channelValue, index) => {
        channelValue.should.equal(channelScaleFactor * (index + 1));
      });
    });
    it('has the right sample number', function () {
      var expectedSampleNumber = 69;
      packet1 = openBCISample.samplePacketAccelTimeSynced(expectedSampleNumber);
      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray); // sampleBuf has its channel number for each 3 byte integer. See line 20...
      sample.sampleNumber.should.equal(expectedSampleNumber);
    });
    it('has the right stop byte', function () {
      packet1 = openBCISample.samplePacketAccelTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray); // sampleBuf has its channel number for each 3 byte integer. See line 20...
      sample.stopByte.should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced));
    });
    it('has the right start byte', function () {
      packet1 = openBCISample.samplePacketAccelTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedAccel(packet1, defaultChannelSettingsArray, 0, accelArray); // sampleBuf has its channel number for each 3 byte integer. See line 20...
      sample.startByte.should.equal(0xA0);
    });
    describe('#errorConditions', function () {
      it('wrong number of bytes', function () {
        expect(openBCISample.parsePacketTimeSyncedAccel.bind(openBCISample, new Buffer(5), defaultChannelSettingsArray, 0, accelArray)).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#getFromTimePacketRawAux', function () {
    var packet;
    it('should put the two aux bytes into a buffer', function () {
      // Get a packet
      packet = openBCISample.samplePacketRawAuxTimeSynced(0);

      let rawAuxBuffer = openBCISample.getFromTimePacketRawAux(packet);
      Buffer.isBuffer(rawAuxBuffer).should.equal(true);
    });
    describe('#errorConditions', function () {
      it('wrong number of bytes', function () {
        expect(openBCISample.getFromTimePacketRawAux.bind(openBCISample, new Buffer(5))).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#parsePacketTimeSyncedRawAux', function () {
    var packet;
    it('should put the two aux bytes into a buffer', function () {
      // Generate three packets, packets only get one axis value per packet
      packet = openBCISample.samplePacketRawAuxTimeSynced(0);

      let sample = openBCISample.parsePacketTimeSyncedRawAux(packet, defaultChannelSettingsArray, 0);
      sample.should.have.property('auxData');
      sample.auxData[0].should.equal(0);
      sample.auxData[1].should.equal(1);
      sample.auxData.byteLength.should.equal(2);
    });
    it('all the channels should have the same number value as their (index + 1) * scaleFactor', function () {
      packet = openBCISample.samplePacketRawAuxTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packet, defaultChannelSettingsArray, 0);
      sample.channelData.forEach((channelValue, index) => {
        channelValue.should.equal(channelScaleFactor * (index + 1));
      });
    });
    it('has the right sample number', function () {
      var expectedSampleNumber = 69;
      packet = openBCISample.samplePacketRawAuxTimeSynced(expectedSampleNumber);
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packet, defaultChannelSettingsArray, 0);
      sample.sampleNumber.should.equal(expectedSampleNumber);
    });
    it('has the right stop byte', function () {
      packet = openBCISample.samplePacketRawAuxTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packet, defaultChannelSettingsArray, 0);
      sample.stopByte.should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced));
    });
    it('has the right start byte', function () {
      packet = openBCISample.samplePacketRawAuxTimeSynced(0);
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packet, defaultChannelSettingsArray, 0);
      sample.startByte.should.equal(0xA0);
    });
    describe('#errorConditions', function () {
      it('wrong number of bytes', function () {
        expect(openBCISample.parsePacketTimeSyncedRawAux.bind(openBCISample, new Buffer(5), defaultChannelSettingsArray, 0, accelArray)).to.throw(k.OBCIErrorInvalidByteLength);
      });
    });
  });
  describe('#convertSampleToPacketStandard', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketStandard(newSample);

    it('should have correct start byte', function () {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', function () {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(k.OBCIByteStop, 'confirming stop byte');
    });
    it('should have correct sample number', function () {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parseRawPacketStandard(packetBuffer);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should convert aux data to binary', function () {
      let sample = openBCISample.parseRawPacketStandard(packetBuffer);
      for (var i = 0; i < 3; i++) {
        sample.accelData[i].should.be.approximately(newSample.auxData[i], 0.001);
      }
    });
  });
  describe('#convertSampleToPacketRawAux', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // Make a fake 6 byte buffer
    var rawBuffer = new Buffer([0, 1, 2, 3, 4, 5]);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketRawAux(newSample, rawBuffer);

    it('should have correct start byte', function () {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', function () {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux), 'confirming stop byte');
    });
    it('should have correct sample number', function () {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parseRawPacketStandard(packetBuffer, defaultChannelSettingsArray, false);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should get raw aux buffer', function () {
      let sample = openBCISample.parseRawPacketStandard(packetBuffer, defaultChannelSettingsArray, false);
      expect(sample.auxData).to.exist;
      expect(bufferEqual(rawBuffer, sample.auxData)).to.be.true;
    });
  });
  describe('#convertSampleToPacketAccelTimeSyncSet', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // Make a time
    var time = 1010101;

    // Accel array
    var accelArray = [0, 0, 0];

    // Channel Settings
    var channelSettingsArray = k.channelSettingsArrayInit(8);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketAccelTimeSyncSet(newSample, time);

    it('should have correct start byte', () => {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', () => {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSyncSet), 'confirming stop byte');
    });
    it('should have correct sample number', () => {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, 0, accelArray);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should get board time', function () {
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, 0, accelArray);
      expect(sample.boardTime).to.exist;
      expect(sample.boardTime).to.equal(time);
    });
    it('should get time stamp with offset', function () {
      var timeOffset = 80;
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, timeOffset, accelArray);
      expect(sample.timeStamp).to.exist;
      expect(sample.timeStamp).to.equal(time + timeOffset);
    });
  });
  describe('#convertSampleToPacketAccelTimeSynced', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // Make a time
    var time = 1010101;

    // Accel array
    var accelArray = [0, 0, 0];

    // Channel Settings
    var channelSettingsArray = k.channelSettingsArrayInit(8);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketAccelTimeSynced(newSample, time);

    it('should have correct start byte', () => {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', () => {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced), 'confirming stop byte');
    });
    it('should have correct sample number', () => {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, 0, accelArray);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should get board time', function () {
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, 0, accelArray);
      expect(sample.boardTime).to.exist;
      expect(sample.boardTime).to.equal(time);
    });
    it('should get time stamp with offset', function () {
      var timeOffset = 80;
      let sample = openBCISample.parsePacketTimeSyncedAccel(packetBuffer, channelSettingsArray, timeOffset, accelArray);
      expect(sample.timeStamp).to.exist;
      expect(sample.timeStamp).to.equal(time + timeOffset);
    });
  });
  describe('#convertSampleToPacketRawAuxTimeSyncSet', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // Make a time
    var time = 1010101;

    // Raw Aux
    var rawAux = new Buffer([0, 1]);

    // Channel Settings
    var channelSettingsArray = k.channelSettingsArrayInit(8);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketRawAuxTimeSyncSet(newSample, time, rawAux);

    it('should have correct start byte', () => {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', () => {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSyncSet), 'confirming stop byte');
    });
    it('should have correct sample number', () => {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should get raw aux buffer', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      expect(sample.auxData).to.exist;
      expect(bufferEqual(rawAux, sample.auxData)).to.be.true;
    });
    it('should get board time', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      expect(sample.boardTime).to.exist;
      expect(sample.boardTime).to.equal(time);
    });
    it('should get time stamp with offset', function () {
      var timeOffset = 80;
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, timeOffset);
      expect(sample.timeStamp).to.exist;
      expect(sample.timeStamp).to.equal(time + timeOffset);
    });
  });
  describe('#convertSampleToPacketRawAuxTimeSynced', function () {
    var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);

    // get new sample
    var newSample = generateSample(0);

    // Make a time
    var time = 1010101;

    // Raw Aux
    var rawAux = new Buffer([0, 1]);

    // Channel Settings
    var channelSettingsArray = k.channelSettingsArrayInit(8);

    // try to convert to packet
    var packetBuffer = openBCISample.convertSampleToPacketRawAuxTimeSynced(newSample, time, rawAux);

    it('should have correct start byte', () => {
      packetBuffer[0].should.equal(k.OBCIByteStart, 'confirming start byte');
    });
    it('should have correct stop byte', () => {
      packetBuffer[k.OBCIPacketSize - 1].should.equal(openBCISample.makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced), 'confirming stop byte');
    });
    it('should have correct sample number', () => {
      packetBuffer[1].should.equal(1, 'confirming sample number is 1 more than 0');
    });
    it('should convert channel data to binary', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        sample.channelData[i].should.be.approximately(newSample.channelData[i], 0.001);
      }
    });
    it('should get raw aux buffer', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      expect(sample.auxData).to.exist;
      expect(bufferEqual(rawAux, sample.auxData)).to.be.true;
    });
    it('should get board time', function () {
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, 0);
      expect(sample.boardTime).to.exist;
      expect(sample.boardTime).to.equal(time);
    });
    it('should get time stamp with offset', function () {
      var timeOffset = 80;
      let sample = openBCISample.parsePacketTimeSyncedRawAux(packetBuffer, channelSettingsArray, timeOffset);
      expect(sample.timeStamp).to.exist;
      expect(sample.timeStamp).to.equal(time + timeOffset);
    });
  });
  describe('#interpret16bitAsInt32', function () {
    it('converts a small positive number', function () {
      var buf1 = new Buffer([0x06, 0x90]); // 0x0690 === 1680
      var num = openBCISample.interpret16bitAsInt32(buf1);
      assert.equal(num, 1680);
    });
    it('converts a large positive number', function () {
      var buf1 = new Buffer([0x02, 0xC0]); // 0x02C0 === 704
      var num = openBCISample.interpret16bitAsInt32(buf1);
      assert.equal(num, 704);
    });
    it('converts a small negative number', function () {
      var buf1 = new Buffer([0xFF, 0xFF]); // 0xFFFF === -1
      var num = openBCISample.interpret16bitAsInt32(buf1);
      assert.equal(num, -1);
    });
    it('converts a large negative number', function () {
      var buf1 = new Buffer([0x81, 0xA1]); // 0x81A1 === -32351
      var num = openBCISample.interpret16bitAsInt32(buf1);
      assert.equal(num, -32351);
    });
  });
  describe('#interpret24bitAsInt32', function () {
    it('converts a small positive number', function () {
      var buf1 = new Buffer([0x00, 0x06, 0x90]); // 0x000690 === 1680
      var num = openBCISample.interpret24bitAsInt32(buf1);
      assert.equal(num, 1680);
    });
    it('converts a large positive number', function () {
      var buf1 = new Buffer([0x02, 0xC0, 0x01]); // 0x02C001 === 180225
      var num = openBCISample.interpret24bitAsInt32(buf1);
      assert.equal(num, 180225);
    });
    it('converts a small negative number', function () {
      var buf1 = new Buffer([0xFF, 0xFF, 0xFF]); // 0xFFFFFF === -1
      var num = openBCISample.interpret24bitAsInt32(buf1);
      num.should.be.approximately(-1, 1);
    });
    it('converts a large negative number', function () {
      var buf1 = new Buffer([0x81, 0xA1, 0x01]); // 0x81A101 === -8281855
      var num = openBCISample.interpret24bitAsInt32(buf1);
      num.should.be.approximately(-8281855, 1);
    });
  });
  describe('#floatTo3ByteBuffer', function () {
    it('converts random floats to a 3-byte buffer', function () {
      var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
      var newSample = generateSample(0);

      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        var buff = openBCISample.floatTo3ByteBuffer(newSample.channelData[i]);

        var num = openBCISample.interpret24bitAsInt32(buff);

        num = num * channelScaleFactor;

        num.should.be.approximately(newSample.channelData[i], 0.00002);
      }
    });
  });
  describe('#floatTo2ByteBuffer', function () {
    it('converts random floats to a 2-byte buffer', function () {
      var auxData = [0.001, 1, -0.00892];

      for (var i = 0; i < 3; i++) {
        var buff = openBCISample.floatTo2ByteBuffer(auxData[i]);

        var num = openBCISample.interpret16bitAsInt32(buff);

        num = num * openBCISample.scaleFactorAux;

        num.should.be.approximately(auxData[i], 0.001);
      }
    });
  });
  describe('#randomSample', function () {
    it('should generate a random sample', function () {
      var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
      var oldSampleNumber = 0;
      var newSample = generateSample(oldSampleNumber);
      assert(newSample.sampleNumber, oldSampleNumber + 1);
      describe('#debugPrettyPrint', function () {
        it('works with a good sample', function () {
          openBCISample.debugPrettyPrint(newSample);
        });
        it('does not with a undefined sample', function () {
          openBCISample.debugPrettyPrint();
        });
      });
    });
    it('should generate a sample with accel data every 25Hz', function () {
      var generateSample = openBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
      var newSample = generateSample(0);

      var passed = false;
      // Should get one non-zero auxData array (on the 10th sample)
      for (var i = 0; i < 10; i++) {
        newSample = generateSample(newSample.sampleNumber);
        if (newSample.auxData[0] !== 0 || newSample.auxData[1] !== 0 || newSample.auxData[2] !== 0) {
          passed = true;
          newSample.auxData[0].should.be.approximately(0, 0.1);
          newSample.auxData[1].should.be.approximately(0, 0.1);
          newSample.auxData[2].should.be.approximately(1, 0.4);
        }
      }
      assert(passed, 'a sample with accel data was produced');
    });
  });
  describe('#impedanceCalculationForChannel', function () {
    it('rejects when undefined sampleObject', function (done) {
      var bad;
      openBCISample.impedanceCalculationForChannel(bad, 1).should.be.rejected.and.notify(done);
    });
    it('rejects when undefined channel number', function (done) {
      var bad;
      openBCISample.impedanceCalculationForChannel('taco', bad).should.be.rejected.and.notify(done);
    });
    it('rejects when invalid channel number', function (done) {
      openBCISample.impedanceCalculationForChannel('taco', 69).should.be.rejected.and.notify(done);
    });
  });
  describe('#impedanceSummarize', function () {
    var impedanceArray = [];
    var numberOfChannels = 8;
    beforeEach(() => {
      impedanceArray = openBCISample.impedanceArray(numberOfChannels);
    });
    it('should find impedance good', function () {
      impedanceArray[0].N.raw = 2201.84;

      openBCISample.impedanceSummarize(impedanceArray[0].N);

      impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextGood); // Check the text
    });
    it('should find impedance ok', function () {
      impedanceArray[0].N.raw = 5201.84;

      openBCISample.impedanceSummarize(impedanceArray[0].N);

      impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextOk); // Check the text
    });
    it('should find impedance bad', function () {
      impedanceArray[0].N.raw = 10201.84;

      openBCISample.impedanceSummarize(impedanceArray[0].N);

      impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextBad); // Check the text
    });
    it('should find impedance none', function () {
      impedanceArray[0].N.data = 44194179.09; // A huge number that would be seen if there was no electrode connected

      openBCISample.impedanceSummarize(impedanceArray[0].N);

      impedanceArray[0].N.text.should.equal(k.OBCIImpedanceTextNone); // Check the text
    });
  });
  describe('#makeDaisySampleObject', function () {
    var lowerSampleObject, upperSampleObject, daisySampleObject;
    before(() => {
      // Make the lower sample (channels 1-8)
      lowerSampleObject = openBCISample.newSample(1);
      lowerSampleObject.channelData = [1, 2, 3, 4, 5, 6, 7, 8];
      lowerSampleObject.auxData = [0, 1, 2];
      lowerSampleObject.timestamp = 4;
      lowerSampleObject.accelData = [0.5, -0.5, 1];
      // Make the upper sample (channels 9-16)
      upperSampleObject = openBCISample.newSample(2);
      upperSampleObject.channelData = [9, 10, 11, 12, 13, 14, 15, 16];
      upperSampleObject.auxData = [3, 4, 5];
      upperSampleObject.timestamp = 8;

      // Call the function under test
      daisySampleObject = openBCISample.makeDaisySampleObject(lowerSampleObject, upperSampleObject);
    });
    it('should make a channelData array 16 elements long', function () {
      daisySampleObject.channelData.length.should.equal(k.OBCINumberOfChannelsDaisy);
    });
    it('should make a channelData array with lower array in front of upper array', function () {
      for (var i = 0; i < 16; i++) {
        expect(daisySampleObject.channelData[i]).to.equal(i + 1);
      }
    });
    it('should make the sample number equal to the second packet divided by two', function () {
      daisySampleObject.sampleNumber.should.equal(upperSampleObject.sampleNumber / 2);
    });
    it('should put the aux packets in an object', function () {
      daisySampleObject.auxData.hasOwnProperty('lower').should.be.true;
      daisySampleObject.auxData.hasOwnProperty('upper').should.be.true;
    });
    it('should put the aux packets in an object in the right order', function () {
      for (var i = 0; i < 3; i++) {
        expect(daisySampleObject.auxData['lower'][i]).to.equal(i);
        expect(daisySampleObject.auxData['upper'][i]).to.equal(i + 3);
      }
    });
    it('should average the two timestamps together', function () {
      var expectedAverage = (upperSampleObject.timestamp + lowerSampleObject.timestamp) / 2;
      daisySampleObject.timestamp.should.equal(expectedAverage);
    });
    it('should place the old timestamps in an object', function () {
      daisySampleObject._timestamps.lower.should.equal(lowerSampleObject.timestamp);
      daisySampleObject._timestamps.upper.should.equal(upperSampleObject.timestamp);
    });
    it('should store an accelerometer value if present', function () {
      daisySampleObject.should.have.property('accelData');
    });
  });
  describe('#isEven', function () {
    it('should return true for even number', function () {
      openBCISample.isEven(2).should.be.true;
    });
    it('should return false for odd number', function () {
      openBCISample.isEven(1).should.be.false;
    });
  });
  describe('#isOdd', function () {
    it('should return true for odd number', function () {
      openBCISample.isOdd(1).should.be.true;
    });
    it('should return false for even number', function () {
      openBCISample.isOdd(2).should.be.false;
    });
  });
  describe('#getChannelDataArray', function () {
    var sampleBuf, badChanArray;
    beforeEach(() => {
      sampleBuf = openBCISample.samplePacket(0);
    });
    it('should multiply each channel by the proper scale value', function () {
      var chanArr = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault); // Not in daisy mode
      var scaleFactor = 4.5 / 24 / (Math.pow(2, 23) - 1);
      // Call the function under test
      let valueArray = openBCISample.getChannelDataArray(sampleBuf, chanArr);
      for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
        console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`);
        expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1), 0.0001);
      }
    });
    it('in daisy mode, on odd samples should use gains from index 0-7 of channel settings array', function () {
      // Overwrite the default
      sampleBuf = openBCISample.samplePacket(1); // even's are the daisy channels
      // Make a 16 element long channel settings array
      var chanArr = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDaisy);
      // Set the upper (8-15) of channel settings array. If the function under test uses the 1 gain, then the test
      //  will fail.
      for (var i = k.OBCINumberOfChannelsDefault; i < k.OBCINumberOfChannelsDaisy; i++) {
        chanArr[i].gain = 1;
      }
      var scaleFactor = 4.5 / 24 / (Math.pow(2, 23) - 1);
      // Call the function under test
      let valueArray = openBCISample.getChannelDataArray(sampleBuf, chanArr);
      for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
        // console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`)
        expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1), 0.0001);
      }
    });
    it('in daisy mode, on even samples should use gains from index 8-15 of channel settings array', function () {
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
      var scaleFactor = 4.5 / 24 / (Math.pow(2, 23) - 1);
      // Call the function under test
      let valueArray = openBCISample.getChannelDataArray(sampleBuf, chanArr);
      for (var j = 0; j < k.OBCINumberOfChannelsDefault; j++) {
        // console.log(`channel data ${j + 1}: ${valueArray[j]} : actual ${scaleFactor * (j + 1)}`)
        expect(valueArray[j]).to.be.closeTo(scaleFactor * (j + 1), 0.0001);
      }
    });
    it('in default mode, should reject when empty channel setting array', function () {
      badChanArray = new Array(k.OBCINumberOfChannelsDefault).fill(0);
      expect(openBCISample.getChannelDataArray.bind(openBCISample, sampleBuf, badChanArray)).to.throw('Error [getChannelDataArray]: Invalid channel settings object at index 0');
    });
    it('in daisy mode, should reject when empty channel setting array', function () {
      badChanArray = new Array(k.OBCINumberOfChannelsDaisy).fill(0);
      expect(openBCISample.getChannelDataArray.bind(openBCISample, sampleBuf, badChanArray)).to.throw('Error [getChannelDataArray]: Invalid channel settings object at index 0');
    });
    it('in default mode, should reject if not numbers in gain position', function () {
      badChanArray = [];
      for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
        badChanArray.push({
          gain: 'taco'
        });
      }
      expect(openBCISample.getChannelDataArray.bind(openBCISample, sampleBuf, badChanArray)).to.throw('Error [getChannelDataArray]: Property gain of channelSettingsObject not or type Number');
    });
    it('in daisy mode, should reject if not numbers in gain position', function () {
      badChanArray = [];
      for (var i = 0; i < k.OBCINumberOfChannelsDaisy; i++) {
        badChanArray.push({
          gain: 'taco'
        });
      }
      expect(openBCISample.getChannelDataArray.bind(openBCISample, sampleBuf, badChanArray)).to.throw('Error [getChannelDataArray]: Property gain of channelSettingsObject not or type Number');
    });
    it('should reject when channelSettingsArray is not in fact an array', function () {
      expect(openBCISample.getChannelDataArray.bind(openBCISample, sampleBuf, {})).to.throw('Error [getChannelDataArray]: Channel Settings must be an array!');
    });
  });
  describe('#countADSPresent', function () {
    it('should not crash on small buff', function () {
      var buf = new Buffer('AJ!');

      openBCISample.countADSPresent(buf).should.equal(0);
    });
    it('should not find any ADS1299 present', function () {
      var buf = new Buffer('AJ Keller is an awesome programmer!\n I know right!');

      openBCISample.countADSPresent(buf).should.equal(0);
    });
    it('should find one ads present', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
LIS3DH Device ID: 0x38422$$$`);

      openBCISample.countADSPresent(buf).should.equal(1);
    });
    it('should find two ads1299 present', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
On Daisy ADS1299 Device ID: 0xFFFFF
LIS3DH Device ID: 0x38422
$$$`);

      openBCISample.countADSPresent(buf).should.equal(2);
    });
  });
  describe('#doesBufferHaveEOT', function () {
    it('should not crash on small buff', function () {
      var buf = new Buffer('AJ!');

      openBCISample.doesBufferHaveEOT(buf).should.equal(false);
    });
    it('should not find any $$$', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
On Daisy ADS1299 Device ID: 0xFFFFF
LIS3DH Device ID: 0x38422
Firmware: v2
`);

      openBCISample.doesBufferHaveEOT(buf).should.equal(false);

      buf = Buffer.concat([buf, new Buffer(k.OBCIParseEOT)], buf.length + 3);

      openBCISample.doesBufferHaveEOT(buf).should.equal(true);
    });
    it('should find a $$$', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
On Daisy ADS1299 Device ID: 0xFFFFF
LIS3DH Device ID: 0x38422
Firmware: v2
$$$`);

      openBCISample.doesBufferHaveEOT(buf).should.equal(true);
    });
  });
  describe('#findV2Firmware', function () {
    it('should not crash on small buff', function () {
      var buf = new Buffer('AJ!');

      openBCISample.findV2Firmware(buf).should.equal(false);
    });
    it('should not find any v2', function () {
      var buf = new Buffer('AJ Keller is an awesome programmer!\n I know right!');

      openBCISample.findV2Firmware(buf).should.equal(false);
    });
    it('should not find a v2', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
LIS3DH Device ID: 0x38422$$$`);

      openBCISample.findV2Firmware(buf).should.equal(false);
    });
    it('should find a v2', function () {
      var buf = new Buffer(`OpenBCI V3 Simulator
On Board ADS1299 Device ID: 0x12345
On Daisy ADS1299 Device ID: 0xFFFFF
LIS3DH Device ID: 0x38422
Firmware: v2
$$$`);

      openBCISample.findV2Firmware(buf).should.equal(true);
    });
  });
  describe('#isFailureInBuffer', function () {
    it('should not crash on small buff', function () {
      var buf = new Buffer('AJ!');

      openBCISample.isFailureInBuffer(buf).should.equal(false);
    });
    it('should not find any failure in a success message', function () {
      var buf = new Buffer('Success: Poll time set$$$');

      openBCISample.isFailureInBuffer(buf).should.equal(false);
    });
    it('should find failure in a failure message', function () {
      var buf = new Buffer('Failure: Could not change Dongle channel number$$$');

      openBCISample.isFailureInBuffer(buf).should.equal(true);
    });
  });
  describe('#isSuccessInBuffer', function () {
    it('should not crash on small buff', function () {
      var buf = new Buffer('AJ!');

      openBCISample.isSuccessInBuffer(buf).should.equal(false);
    });
    it('should not find any success in a failure message', function () {
      var buf = new Buffer('Failure: Could not change Dongle channel number');

      openBCISample.isSuccessInBuffer(buf).should.equal(false);
    });
    it('should find success in a success message', function () {
      var buf = new Buffer('Success: Poll time set$$$');

      openBCISample.isSuccessInBuffer(buf).should.equal(true);
    });
  });

  describe('#isStopByte', function () {
    it('should return true for a normal stop byte', () => {
      expect(openBCISample.isStopByte(0xC0)).to.be.true;
    });
    it('should return true for a good stop byte with a different end nibble', () => {
      expect(openBCISample.isStopByte(0xCF)).to.be.true;
    });
    it('should return false for a bad stop byte', () => {
      expect(openBCISample.isStopByte(0xF0)).to.be.false;
    });
    it('should return false for a bad stop byte', () => {
      expect(openBCISample.isStopByte(0x00)).to.be.false;
    });
  });

  describe('#isTimeSyncSetConfirmationInBuffer', function () {
    // Attn: 0x2C is ASCII for ','
    var comma = 0x2C;
    it('should not find the character in a buffer without the character', function () {
      openBCISample.isTimeSyncSetConfirmationInBuffer(openBCISample.samplePacket()).should.equal(false);
    });
    it('should find with just 0x2C', function () {
      var buffer = new Buffer([comma]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'just comma').to.be.true;
    });
    it('should find even at start of buffer', function () {
      // Start of buffer
      var buffer = new Buffer([comma, k.OBCIByteStart]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'before packet').to.be.true;
    });
    it('should find even at back of buffer', function () {
      // Back of buffer
      var buffer = new Buffer([0xC0, comma]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'after packet').to.be.true;
    });
    it('should find wedged beween two packets', function () {
      // / wedged
      var buffer = new Buffer([0xC0, comma, 0xA0]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'wedged between packets').to.be.true;
    });
    it('should not find if no comma present', function () {
      // / wedged
      var buffer = new Buffer([0x2D]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'not comma').to.be.false;
    });
    it('should not find if comma at the front of bad block', function () {
      // Start of buffer
      var buffer = new Buffer([comma, 0xCC]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'front of buffer').to.be.false;
    });
    it('should not find if comma at the back of bad block', function () {
      // Back of buffer
      var buffer = new Buffer([0xD3, comma]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'end of buffer').to.be.false;
    });
    it('should not find is not the comma', function () {
      // Wedged
      var buffer = new Buffer([comma, comma, comma]);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer), 'strictly commas').to.be.false;
    });
    it('should find the character in a buffer packed with samples', function () {
      var buf1 = openBCISample.samplePacket(1);
      var buf2 = openBCISample.samplePacket(2);
      var buf3 = new Buffer([0x2C]);
      var buf4 = openBCISample.samplePacket(3);

      var bufferLength = buf1.length + buf2.length + buf3.length + buf4.length;
      /* eslint new-cap: ["error", { "properties": false }] */
      var buffer = new Buffer.concat([buf1, buf2, buf3, buf4], bufferLength);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer)).to.be.true;
    });
    it('should find the character in a buffer packed with samples with comma at end', function () {
      var buf1 = openBCISample.samplePacket(1);
      var buf2 = openBCISample.samplePacket(2);
      var buf3 = openBCISample.samplePacket(3);
      var buf4 = new Buffer([0x2C]);

      var bufferLength = buf1.length + buf2.length + buf3.length + buf4.length;
      /* eslint new-cap: ["error", { "properties": false }] */
      var buffer = new Buffer.concat([buf1, buf2, buf3, buf4], bufferLength);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer)).to.be.true;
    });
    it('should not find the character in a buffer packed with samples', function () {
      var buf1 = openBCISample.samplePacket(1);
      var buf2 = openBCISample.samplePacket(2);
      var buf3 = openBCISample.samplePacket(3);

      var bufferLength = buf1.length + buf2.length + buf3.length;
      /* eslint new-cap: ["error", { "properties": false }] */
      var buffer = new Buffer.concat([buf1, buf2, buf3], bufferLength);
      expect(openBCISample.isTimeSyncSetConfirmationInBuffer(buffer)).to.be.false;
    });
  });
  describe('#makeTailByteFromPacketType', function () {
    it('should convert 0 to 0xC0', function () {
      expect(openBCISample.makeTailByteFromPacketType(0)).to.equal(0xC0);
    });
    it('should convert 5 to 0xC5', function () {
      expect(openBCISample.makeTailByteFromPacketType(5)).to.equal(0xC5);
    });
    it('should convert 15 to 0xCF', function () {
      expect(openBCISample.makeTailByteFromPacketType(15)).to.equal(0xCF);
    });
    it('should convert 16 to 0xC0', function () {
      expect(openBCISample.makeTailByteFromPacketType(16)).to.equal(0xC0);
    });
    it('should convert 30 to 0xC0', function () {
      expect(openBCISample.makeTailByteFromPacketType(30)).to.equal(0xC0);
    });
    it('should convert -2 to 0xC0', function () {
      expect(openBCISample.makeTailByteFromPacketType(-2)).to.equal(0xC0);
    });
  });
  describe('#newSyncObject', function () {
    var syncObj = openBCISample.newSyncObject();
    it('should have property timeSyncSent', function () {
      expect(syncObj).to.have.property('timeSyncSent', 0);
    });
    it('should have property timeOffset', function () {
      expect(syncObj).to.have.property('timeOffset', 0);
    });
    it('should have property timeOffsetMaster', function () {
      expect(syncObj).to.have.property('timeOffsetMaster', 0);
    });
    it('should have property timeRoundTrip', function () {
      expect(syncObj).to.have.property('timeRoundTrip', 0);
    });
    it('should have property timeTransmission', function () {
      expect(syncObj).to.have.property('timeTransmission', 0);
    });
    it('should have property timeSyncSentConfirmation', function () {
      expect(syncObj).to.have.property('timeSyncSentConfirmation', 0);
    });
    it('should have property timeSyncSetPacket', function () {
      expect(syncObj).to.have.property('timeSyncSetPacket', 0);
    });
    it('should have property valid', function () {
      expect(syncObj).to.have.property('valid', false);
    });
    it('should have property correctedTransmissionTime', function () {
      expect(syncObj).to.have.property('correctedTransmissionTime', false);
    });
    it('should have property boardTime', function () {
      expect(syncObj).to.have.property('boardTime', 0);
    });
    it('should have property error', function () {
      expect(syncObj).to.have.property('error', null);
    });
  });
  describe('#droppedPacketCheck', function () {
    it('should return an array of missed packet numbers', function () {
      var previous = 0;
      var current = previous + 2;
      assert.sameMembers(openBCISample.droppedPacketCheck(previous, current), [1], 'dropped one packet');

      previous = 0;
      current = previous + 4;
      assert.sameMembers(openBCISample.droppedPacketCheck(previous, current), [1, 2, 3], 'dropped three packets');

      previous = 255;
      current = 2;
      assert.sameMembers(openBCISample.droppedPacketCheck(previous, current), [0, 1], 'dropped two packets on wrap edge!');

      previous = 254;
      current = 2;
      assert.sameMembers(openBCISample.droppedPacketCheck(previous, current), [255, 0, 1], 'dropped three packets on wrap!');

      previous = 250;
      current = 1;
      assert.sameMembers(openBCISample.droppedPacketCheck(previous, current), [251, 252, 253, 254, 255, 0], 'dropped a bunch of packets on wrap!');
    });
    it('should roll over when 255 was previous and current is 0', function () {
      var previous = 255;
      var current = 0;
      expect(openBCISample.droppedPacketCheck(previous, current)).to.be.null;
    });
    it('should return null when previous is one less then new sample number', function () {
      var previous = 0;
      var current = previous + 1;
      expect(openBCISample.droppedPacketCheck(previous, current)).to.be.null;
    });
  });
  describe('#stripToEOTBuffer', function () {
    it('should return the buffer if no EOT', function () {
      let buf = null;
      if (k.getVersionNumber(process.version) >= 6) {
        // From introduced in node version 6.x.x
        buf = Buffer.from('tacos are delicious');
      } else {
        buf = new Buffer('tacos are delicious');
      }
      expect(openBCISample.stripToEOTBuffer(buf).toString()).to.equal(buf.toString());
    });
    it('should slice the buffer after eot $$$', function () {
      let bufPre = null;
      let eotBuf = null;
      let bufPost = null;
      if (k.getVersionNumber(process.version) >= 6) {
        // From introduced in node version 6.x.x
        bufPre = Buffer.from('tacos are delicious');
        eotBuf = Buffer.from(k.OBCIParseEOT);
        bufPost = Buffer.from('tacos');
      } else {
        bufPre = new Buffer('tacos are delicious');
        eotBuf = new Buffer(k.OBCIParseEOT);
        bufPost = new Buffer('tacos');
      }

      let totalBuf = Buffer.concat([bufPre, eotBuf, bufPost]);
      expect(openBCISample.stripToEOTBuffer(totalBuf).toString()).to.equal(bufPost.toString());
    });
    it('should return null if nothing left', function () {
      let bufPre = null;
      let eotBuf = null;
      if (k.getVersionNumber(process.version) >= 6) {
        // From introduced in node version 6.x.x
        bufPre = Buffer.from('tacos are delicious');
        eotBuf = Buffer.from(k.OBCIParseEOT);
      } else {
        bufPre = new Buffer('tacos are delicious');
        eotBuf = new Buffer(k.OBCIParseEOT);
      }

      let totalBuf = Buffer.concat([bufPre, eotBuf]);
      expect(openBCISample.stripToEOTBuffer(totalBuf)).to.equal(null);
    });
  });
});

describe('#goertzelProcessSample', function () {
  var numberOfChannels = k.OBCINumberOfChannelsDefault;
  var goertzelObj = openBCISample.goertzelNewObject(numberOfChannels);
  var newRandomSample = openBCISample.randomSample(numberOfChannels, k.OBCISampleRate250);

  afterEach(() => bluebirdChecks.noPendingPromises());

  it('produces an array of impedances', function (done) {
    var passed = false;
    for (var i = 0; i < openBCISample.GOERTZEL_BLOCK_SIZE + 1; i++) {
      // console.log('Iteration ' + i)
      var impedanceArray = openBCISample.goertzelProcessSample(newRandomSample(i), goertzelObj);
      if (impedanceArray) {
        // console.log('Impedance Array: ')
        for (var j = 0; j < numberOfChannels; j++) {
          console.log('Channel ' + (j + 1) + ': ' + impedanceArray[j].toFixed(8));
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
    });
  });
});
