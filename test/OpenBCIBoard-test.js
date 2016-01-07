/**
 * Created by AJ Keller
 * Date: 12/23/15
 * Purpose: To unit test the OpenBCIBoard file
 */

var assert = require('assert');
var OpenBCIBoard = require('../openBCIBoard');
var OpenBCISample = OpenBCIBoard.OpenBCISample;
var k = OpenBCIBoard.OpenBCIConstants;
var chai = require('chai')
    ,  expect = chai.expect
    ,  should = chai.should();
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var sampleSelf = function() {
    return {
        masterBuffer: {
            buffer: new Buffer(3300),
            positionRead:0,
            positionWrite:0,
            packetsIn:0,
            packetsRead:0,
            looseBytes:0
        }
    };
};

var sampleData;
var bciBoard;

var samplePacket = function () {
    var byteSample = 0x45;
    var buffy = new Buffer([0xA0,byteSample,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0,0,0,1,0,2,0xC0]);
    return buffy;
};




describe('OpenBCIBoard',function() {
    describe('#_bufMerger',function() {
        beforeEach(function() {
            bciBoard = new OpenBCIBoard.OpenBCIBoard();
            sampleData = [];
            (function(){
                for(var i = 0;i < 100;i++) {
                    var sample = samplePacket();
                    sample.sampleNumber = i;
                    sampleData[i] = sample;
                }
            }());
        });
        it('should write the buffer to the empty master buffer', function() {
            bciBoard._bufMerger(sampleData[0]);

            // test to see if buffers match
            assert.equal(0,sampleData[0].compare(bciBoard.masterBuffer.buffer.slice(0, k.OBCIPacketSize)));
            // test to make sure the write position was moved
            assert.equal(k.OBCIPacketSize, bciBoard.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets
            assert.equal(bciBoard.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,0);
        });
        it('should write the tiny buffer to the empty master buffer, but not record a packet in', function() {
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            bciBoard._bufMerger(tinyBuffer);

            // test to see if buffers match
            assert.equal(0,tinyBuffer.compare(bciBoard.masterBuffer.buffer.slice(0, tinyBufferSize)));
            // test to make sure the write position was moved
            assert.equal(tinyBufferSize, bciBoard.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets
            assert.equal(bciBoard.masterBuffer.packetsIn,0);
            // test to make sure there are 10 loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,tinyBufferSize);
        });
        it('should write the multi packet plus loose byte buffer to the empty master buffer', function() {
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            var buffers = [sampleData[0],sampleData[1],sampleData[2],tinyBuffer];
            var totalLength = k.OBCIPacketSize * 3 + tinyBufferSize;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard._bufMerger(multiPacketBuffer);

            // test to see if buffers match
            assert.equal(0,multiPacketBuffer.compare(bciBoard.masterBuffer.buffer.slice(0, totalLength)));
            // test to make sure the write position was moved
            assert.equal(totalLength, bciBoard.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets (shall be three)
            assert.equal(bciBoard.masterBuffer.packetsIn,3);
            // test to make sure there are 10 loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,tinyBufferSize);
        });
        it('should use looseBytes in to write the multi packet to the master buffer and record an extra packet in', function() {
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            var hackedBufferSize = k.OBCIPacketSize - tinyBufferSize;
            var hackedBuffer = sampleData[0].slice(tinyBufferSize);

            bciBoard.masterBuffer.looseBytes = tinyBufferSize;

            var buffers = [hackedBuffer,sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3 + hackedBufferSize;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard._bufMerger(multiPacketBuffer);

            // test to see if buffers match
            assert.equal(0,multiPacketBuffer.compare(bciBoard.masterBuffer.buffer.slice(0, totalLength)));
            // test to make sure the write position was moved
            assert.equal(totalLength, bciBoard.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets (shall be three)
            assert.equal(bciBoard.masterBuffer.packetsIn,4);
            // test to make sure there are 10 loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,0);
        });
        it('should write in the position of the masterBufferPositionWrite', function() {
            var originalWritePosition = 69;
            bciBoard.masterBuffer.positionWrite = originalWritePosition;

            bciBoard._bufMerger(sampleData[0]);

            // test to see if the master buffer contains the correct data
            assert.equal(0,sampleData[0].compare(bciBoard.masterBuffer.buffer.slice(originalWritePosition, originalWritePosition + k.OBCIPacketSize)));
            // test to see if the write position was moved properly
            assert.equal(bciBoard.masterBuffer.positionWrite,originalWritePosition + k.OBCIPacketSize);
            // test to make sure we read in the right number of packets
            assert.equal(bciBoard.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,0);
        });
        it('should wrap the input buffer around the master buffer',function() {
            var spaceRemaingInMasterBuffer = 15;
            var originalWritePosition = k.OBCIMasterBufferSize - spaceRemaingInMasterBuffer;

            bciBoard.masterBuffer.positionWrite = originalWritePosition;

            bciBoard._bufMerger(sampleData[0]);

            // test to see that the end of master buffer contains half of sample
            assert.equal(0,sampleData[0].slice(0,spaceRemaingInMasterBuffer).compare(bciBoard.masterBuffer.buffer.slice(originalWritePosition)));
            // test to see that the beginning of master buffer contains the second half of sampleData[0]
            assert.equal(0,sampleData[0].slice(spaceRemaingInMasterBuffer).compare(bciBoard.masterBuffer.buffer.slice(0,sampleData[0].byteLength - spaceRemaingInMasterBuffer)));
            // test to make sure the write position was moved correctly
            assert.equal(bciBoard.masterBuffer.positionWrite,sampleData[0].byteLength - spaceRemaingInMasterBuffer);
            // test to make sure we read in the right number of packets
            assert.equal(bciBoard.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(bciBoard.masterBuffer.looseBytes,0);
        });
    });
    describe('#_bufPacketStripper', function() {
        beforeEach(function() {
            bciBoard = new OpenBCIBoard.OpenBCIBoard();
            sampleData = [];
            (function(){
                for(var i = 0;i < 100;i++) {
                    var sample = samplePacket();
                    sample.sampleNumber = i;
                    sampleData[i] = sample;
                }
            }());
        });
        it('should remove a packet from the master buffer', function() {
            var buffers = [sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            //console.log(multiPacketBuffer);


            bciBoard._bufMerger(multiPacketBuffer);

            // run through three iterations of stripping packets
            for (var i = 0; i < 3; i++) {
                var rawPacket = bciBoard._bufPacketStripper();
                var sample = OpenBCISample.convertPacketToSample(rawPacket);
                //console.log(OpenBCISample.debugPrettyPrint(sample));
                //console.log('Sample ' + i + ' has sample number ' + sample.sampleNumber);
                assert.equal(sample.sampleNumber,69);
            }
        });
        it('should remove a packet from the master buffer, even at wrap..', function() {

            var buffers = [sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3;

            bciBoard.masterBuffer.positionWrite = k.OBCIMasterBufferSize - 10;
            bciBoard.masterBuffer.positionRead = bciBoard.masterBuffer.positionWrite;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard._bufMerger(multiPacketBuffer);

            // run through three iterations of stripping packets
            for (var i = 0; i < 3; i++) {
                var rawPacket = bciBoard._bufPacketStripper();
                var sample = OpenBCISample.convertPacketToSample(rawPacket);
                assert(sample.sampleNumber,i);
            }
        });
    });
});

function debugPrintBufferCompare(buf1,buf2) {
    console.log('Comparing:\n\tBuffer 1\n\t\t' + buf1.toString('hex') + '\n\tBuffer 2\n\t\t' + buf2.toString('hex'));

}