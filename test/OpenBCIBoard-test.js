/**
 * Created by AJ Keller
 * Date: 12/23/15
 * Purpose: To unit test the OpenBCIBoard file
 */

var assert = require('assert');
var OpenBCIBoard = require('../OpenBCIBoard');
var OpenBCISample = require('../OpenBCISample');
var k = require('../OpenBCIConstants');
var chai = require('chai')
    ,  expect = chai.expect
    ,  should = chai.should();
var chaiAsPromised = require("chai-as-promised");

chai.use(chaiAsPromised);

var bciBoard = new OpenBCIBoard.OpenBCIBoard();

var sampleSelf = function() {
    return {
        masterBufferMaxSize: 3300,
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

var sampleData = [];
(function(){
    for(var i = 0;i < 100;i++) {
        var sample = OpenBCISample.samplePacket();
        sample.sampleNumber = i;
        sampleData[i] = sample;
    }
}());

describe('OpenBCIBoard',function() {
    describe('#bufMerger',function() {
        it('should write the buffer to the empty master buffer', function() {
            var self = sampleSelf();
            // console.log(sampleData[0]);
            bciBoard.bufMerger(self, sampleData[0]);

            // test to see if buffers match
            assert.equal(0,sampleData[0].compare(self.masterBuffer.buffer.slice(0, k.OBCIPacketSize)));
            // test to make sure the write position was moved
            assert.equal(k.OBCIPacketSize, self.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets
            assert.equal(self.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(self.masterBuffer.looseBytes,0);
        });
        it('should write the tiny buffer to the empty master buffer, but not record a packet in', function() {
            var self = sampleSelf();
            // console.log(sampleData[0]);
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            bciBoard.bufMerger(self, tinyBuffer);

            // test to see if buffers match
            assert.equal(0,tinyBuffer.compare(self.masterBuffer.buffer.slice(0, tinyBufferSize)));
            // test to make sure the write position was moved
            assert.equal(tinyBufferSize, self.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets
            assert.equal(self.masterBuffer.packetsIn,0);
            // test to make sure there are 10 loose bytes
            assert.equal(self.masterBuffer.looseBytes,tinyBufferSize);
        });
        it('should write the multi packet plus loose byte buffer to the empty master buffer', function() {
            var self = sampleSelf();
            // console.log(sampleData[0]);
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            var buffers = [sampleData[0],sampleData[1],sampleData[2],tinyBuffer];
            var totalLength = k.OBCIPacketSize * 3 + tinyBufferSize;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard.bufMerger(self, multiPacketBuffer);

            // test to see if buffers match
            assert.equal(0,multiPacketBuffer.compare(self.masterBuffer.buffer.slice(0, totalLength)));
            // test to make sure the write position was moved
            assert.equal(totalLength, self.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets (shall be three)
            assert.equal(self.masterBuffer.packetsIn,3);
            // test to make sure there are 10 loose bytes
            assert.equal(self.masterBuffer.looseBytes,tinyBufferSize);
        });
        it('should use looseBytes in to write the multi packet to the master buffer and record an extra packet in', function() {
            var self = sampleSelf();
            // console.log(sampleData[0]);
            var tinyBufferSize = 10; //tiny because its smaller than a packet
            var tinyBuffer = sampleData[0].slice(0,tinyBufferSize);

            var hackedBufferSize = k.OBCIPacketSize - tinyBufferSize;
            var hackedBuffer = sampleData[0].slice(tinyBufferSize);

            self.masterBuffer.looseBytes = tinyBufferSize;

            var buffers = [hackedBuffer,sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3 + hackedBufferSize;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard.bufMerger(self, multiPacketBuffer);

            // test to see if buffers match
            assert.equal(0,multiPacketBuffer.compare(self.masterBuffer.buffer.slice(0, totalLength)));
            // test to make sure the write position was moved
            assert.equal(totalLength, self.masterBuffer.positionWrite);
            // test to make sure we read in the right number of packets (shall be three)
            assert.equal(self.masterBuffer.packetsIn,4);
            // test to make sure there are 10 loose bytes
            assert.equal(self.masterBuffer.looseBytes,0);
        });
        it('should write in the position of the masterBufferPositionWrite', function() {
            var self = sampleSelf();
            var originalWritePosition = 69;
            self.masterBuffer.positionWrite = originalWritePosition;

            bciBoard.bufMerger(self, sampleData[0]);

            // test to see if the master buffer contains the correct data
            assert.equal(0,sampleData[0].compare(self.masterBuffer.buffer.slice(originalWritePosition, originalWritePosition + k.OBCIPacketSize)));
            // test to see if the write position was moved properly
            assert.equal(self.masterBuffer.positionWrite,originalWritePosition + k.OBCIPacketSize);
            // test to make sure we read in the right number of packets
            assert.equal(self.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(self.masterBuffer.looseBytes,0);
        });
        it('should wrap the input buffer around the master buffer',function() {
            var self = sampleSelf();
            var spaceRemaingInMasterBuffer = 15;
            var originalWritePosition = self.masterBufferMaxSize - spaceRemaingInMasterBuffer;

            self.masterBuffer.positionWrite = originalWritePosition;

            bciBoard.bufMerger(self, sampleData[0]);

            // test to see that the end of master buffer contains half of sample
            assert.equal(0,sampleData[0].slice(0,spaceRemaingInMasterBuffer).compare(self.masterBuffer.buffer.slice(originalWritePosition)));
            // test to see that the beginning of master buffer contains the second half of sampleData[0]
            assert.equal(0,sampleData[0].slice(spaceRemaingInMasterBuffer).compare(self.masterBuffer.buffer.slice(0,sampleData[0].byteLength - spaceRemaingInMasterBuffer)));
            // test to make sure the write position was moved correctly
            assert.equal(self.masterBuffer.positionWrite,sampleData[0].byteLength - spaceRemaingInMasterBuffer);
            // test to make sure we read in the right number of packets
            assert.equal(self.masterBuffer.packetsIn,1);
            // test to make sure there are no loose bytes
            assert.equal(self.masterBuffer.looseBytes,0);
        });
    });
    describe('#bufPacketStripper', function() {
        it('should remove a packet from the master buffer', function() {
            var self = sampleSelf();

            var buffers = [sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            bciBoard.bufMerger(self,multiPacketBuffer);

            // run through three iterations of stripping packets
            for (var i = 0; i < 3; i++) {
                var rawPacket = bciBoard.bufPacketStripper(self);
                //console.log('Sample ' + i + ' has sample number ' + sample.sampleNumber);
                OpenBCISample.convertPacketToSample(rawPacket).should.eventually.equal(i);
            }
        });
        it('should remove a packet from the master buffer, even at wrap..', function() {
            var self = sampleSelf();

            var buffers = [sampleData[0],sampleData[1],sampleData[2]];
            var totalLength = k.OBCIPacketSize * 3;

            var multiPacketBuffer = Buffer.concat(buffers,totalLength);

            // run through three iterations of stripping packets
            for (var i = 0; i < 3; i++) {
                var rawPacket = bciBoard.bufPacketStripper(self);
                OpenBCISample.convertPacketToSample(rawPacket).then(function(sample) {
                    assert(sample.sampleNumber,i);
                },function(err) {
                    assert(false);
                });
            }
        });
    });
});

function debugPrintBufferCompare(buf1,buf2) {
    console.log('Comparing:\n\tBuffer 1\n\t\t' + buf1.toString('hex') + '\n\tBuffer 2\n\t\t' + buf2.toString('hex'));

}