/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var OpenBCISample = require('../openBCISample');
var chai = require('chai')
    ,  expect = chai.expect
    ,  should = chai.should();
var chaiAsPromised = require("chai-as-promised");

var k = OpenBCISample.k;

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



describe('OpenBCISample',function() {
    describe('#convertPacketToSample', function() {
        it('should have the correct start byte', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert.equal(k.OBCIByteStart,sample.startByte);
        });
        it('should have the correct stop byte', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert.equal(k.OBCIByteStop,sample.stopByte);
        });
        it('should have the correct sample number', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert.equal(0x45,sample.sampleNumber);
        });
        it('all the channels should have the same number value as their index * scaleFactor', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            for(var i = 1;i <= 8;i++) {
                assert.equal(sample.channelData[i],OpenBCISample.scaleFactorChannel * i);
            }
        });
        it('all the auxs should have the same number value as their index * scaleFactor', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            for(var i = 0;i < 3;i++) {
                assert.equal(sample.auxData[i],OpenBCISample.scaleFactorAux * i);
            }
        });
        it('check to see if negative numbers work on channel data',function() {
            var temp = samplePacket();
            //console.log(temp);
            var taco = new Buffer([0x81]);
            taco.copy(temp,2);
            //console.log(temp);
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert(sample.channelData[1], -8323071 * OpenBCISample.scaleFactorChannel);

        });
        it('check to see if negative numbers work on aux data',function() {
            var temp = samplePacket();
            //console.log(temp);
            var taco = new Buffer([0x81]);
            taco.copy(temp,26);
            //console.log(temp);
            var sample = OpenBCISample.convertPacketToSample(temp);
            //OpenBCISample.debugPrettyPrint(sample);
            assert.equal(sample.auxData[0],-32512 * OpenBCISample.scaleFactorAux);

        });
    });
    describe('#interpret24bitAsInt32', function() {
        it('converts a small positive number', function() {
            var buf1 = new Buffer([0x00,0x06,0x90]); // 0x000690 === 1680
            var num = OpenBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,1680);
        });
        it('converts a large positive number', function() {
            var buf1 = new Buffer([0x02,0xC0,0x01]); // 0x02C001 === 180225
            var num = OpenBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,180225);
        });
        it('converts a small negative number', function() {
            var buf1 = new Buffer([0xFF,0xFF,0xFF]); // 0xFFFFFF === -1
            var num = OpenBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,-1);
        });
        it('converts a large negative number', function() {
            var buf1 = new Buffer([0x81,0xA1,0x01]); // 0x81A101 === -8281855
            var num = OpenBCISample.interpret24bitAsInt32(buf1);
            assert.equal(num,-8281855);
        });
    });
    describe('#interpret16bitAsInt32', function() {
        it('converts a small positive number', function() {
            var buf1 = new Buffer([0x06,0x90]); // 0x0690 === 1680
            var num = OpenBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,1680);
        });
        it('converts a large positive number', function() {
            var buf1 = new Buffer([0x02,0xC0]); // 0x02C0 === 704
            var num = OpenBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,704);
        });
        it('converts a small negative number', function() {
            var buf1 = new Buffer([0xFF,0xFF]); // 0xFFFF === -1
            var num = OpenBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,-1);
        });
        it('converts a large negative number', function() {
            var buf1 = new Buffer([0x81,0xA1]); // 0x81A1 === -32351
            var num = OpenBCISample.interpret16bitAsInt32(buf1);
            assert.equal(num,-32351);
        });
    });
    describe('#randomSample', function() {
        it('should generate a random sample',function() {
            var generateSample = OpenBCISample.randomSample(k.OBCINumberOfChannelsDefault, k.OBCISampleRate250);
            var oldSampleNumber = 0;
            var newSample = generateSample(oldSampleNumber);
            console.log(JSON.stringify(newSample));
            assert(newSample.sampleNumber,oldSampleNumber+1);
        });
    });
});

