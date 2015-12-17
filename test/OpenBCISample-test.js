/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');
var OpenBCISample = require('../OpenBCISample');


// Start byte
const BYTE_START = 0x0A;
// Stop byte
const BYTE_STOP	= 0xC0;

// Fill a buffer with that data
//This function not operational at the moment
// something weird is going on when trying to write
// '\xC0' (the stop byte) to the buffer
function sampleOpenBCIPacket() {
    var byteSample = 0x45;
    // test data in OpenBCI serial format V3
    //var data = 	BYTE_START.toString() + byteSample + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataAux + chunkDataAux + chunkDataAux + BYTE_STOP;
    var buffy = new Buffer([BYTE_START,byteSample,0,0,0,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,0,1,0,2,BYTE_STOP]);
    //console.log(buffy);
    //buffy.write(data,"utf-8");
    //console.log('Byte stop is ' + BYTE_STOP);
    //console.log(buffy);
    return buffy;
}

var sampleBuf = sampleOpenBCIPacket();




describe('OpenBCISample',function() {
    describe('#convertPacketToSample', function() {
        it('should have the correct start byte', function() {
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                assert.equal(0x0A,sample.startByte);
            });
        });
        it('should have the correct stop byte', function() {
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                assert.equal(0xC0,sample.stopByte);
            });
        });
        it('should have the correct sample number', function() {
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                assert.equal(0x45,sample.sampleNumber);
            });
        });
        it('all the channels should have the same number value as their index * scaleFactor', function() {
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                for(var i = 0;i < 8;i++) {
                    assert.equal(sample.channelData[i],OpenBCISample.scaleFactorChannel * i);
                }
            });
        });
        it('all the auxs should have the same number value as their index * scaleFactor', function() {
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                for(var i = 0;i < 3;i++) {
                    assert.equal(sample.auxData[i],OpenBCISample.scaleFactorAux * i);
                }
            });
        });
        it('check to see if negative numbers work on channel data',function() {
            sampleBuf.write(0x81.toString(),2,1);
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                assert.equal(0x0A,sample.startByte);
            });

            var sample = OpenBCISample.convertPacketToSample(sampleBuf);
        });
        it('check to see if negative numbers work on aux data',function() {
            sampleBuf.write(0x81.toString(),27,1);
            OpenBCISample.convertPacketToSample(sampleBuf).then(function(sample){
                assert(sample.auxData[0],-255 * OpenBCISample.scaleFactorAux);
            });
        });
    });
});

