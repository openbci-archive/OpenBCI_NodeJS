/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var OpenBCISample = require('../OpenBCISample');
var chai = require('chai')
    ,  expect = chai.expect
    ,  should = chai.should()
    //,  chaiModel = require('./helpers/model')
    ,  Assertion = chai.Assertion;
//var chaiAsPromised = require("chai-as-promised");


// Start byte
const BYTE_START = 0x0A;
// Stop byte
const BYTE_STOP	= 0xC0;

// Fill a buffer with that data
//This function not operational at the moment
// something weird is going on when trying to write
// '\xC0' (the stop byte) to the buffer
//function sampleOpenBCIPacket() {
//    var byteSample = 0x45;
//    // test data in OpenBCI serial format V3
//    //var data = 	BYTE_START.toString() + byteSample + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataAux + chunkDataAux + chunkDataAux + BYTE_STOP;
//    var buffy = new Buffer([BYTE_START,byteSample,0,0,0,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,0,1,0,2,BYTE_STOP]);
//    //console.log(buffy);
//    //buffy.write(data,"utf-8");
//    //console.log('Byte stop is ' + BYTE_STOP);
//    //console.log(buffy);
//    return buffy;
//}

var sampleBuf = OpenBCISample.samplePacket();

//Assertion.addProperty('sample', function () {
//    this.assert(
//        this._obj instanceof OpenBCISample
//      , 'expected #{this} to be a Sample'
//      , 'expected #{this} to not be a Sample'
//    );
//});
//
//// language chain method
//Assertion.addMethod('sample',function(type) {
//    var obj = this._obj;
//
//    // first, out instanceof check, shortcut
//    new Assertion(this._obj).to.be.instanceof(OpenBCISample)
//});




describe('OpenBCISample',function() {
    describe('#convertPacketToSample', function() {
        it('should have the correct start byte', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert.equal(0x0A,sample.startByte);
        });
        it('should have the correct stop byte', function() {
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert.equal(0xC0,sample.stopByte);
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
            var temp = OpenBCISample.samplePacket();
            //console.log(temp);
            var taco = new Buffer([0x81]);
            taco.copy(temp,2);
            //console.log(temp);
            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
            assert(sample.channelData[1], -8323071 * OpenBCISample.scaleFactorChannel);

        });
        it('check to see if negative numbers work on aux data',function() {
            var temp = OpenBCISample.samplePacket();
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
});

