/*
Author: AJ Keller
*/

/*
Require Statements
*/
var fs = require("fs");


// Fill a buffer with that data
function sampleOpenBCIPacket() {
	var byteSample 			= '\x45';
	var byteStart	 		= '\x0A';
	var byteStop 			= '\xC0';
	var chunkDataAux 		= '\x00\x01';
	var chunkDataChannel	= '\x00\x00\x01';

	// test data in OpenBCI serial format V3
	var data = 	byteStart + byteSample + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataAux + chunkDataAux + chunkDataAux + byteStop;
	return new Buffer(data);
}

var sampleBuf = sampleOpenBCIPacket();

function OpenBCISample(dataBuf) {
	var numberOfBytes = dataBuf.byteLength - 1; // Weird off by one error...

 	var numberOfChannels = numberOfBytes - 9;

 	var channelData = function() {
 		var out = {};
 		var count = 1;
 		for(var i = 2; i < numberOfBytes-10; i += 3) {
 			console.log(i);
 			out[count] = interpret24bitAsInt32(dataBuf.slice(i,i+3));
 			count++;
 		}
 		return out;
 	}

 	var auxData = function() {
 		var out = {};
 		var count = 1;
 		for(var i = numberOfBytes - 7; i < numberOfBytes - 1; i += 2) {
 			console.log(i);
 			out[count] = interpret16bitAsInt32(dataBuf.slice(i,i+2));
 			count++;
 		}
 		return out;
 	}

	return {
		startByte		: dataBuf[0], //byte
		sampleNumber	: dataBuf[1], //byte
		channelData		: channelData(), 		// multiple of 3 bytes
		auxData			: auxData(), 					// 6 bytes
		stopByte 		: dataBuf[numberOfBytes - 1] //byte
	};
}


var openBCISample1 = OpenBCISample(sampleBuf);

console.log(openBCISample1);


function interpret24bitAsInt32(threeByteBuffer) {
	const maskForNegativeNum = (255 << (3 * 8));
	const maskForPositiveNum = 255 | (255 << 8) | (255 << 16);

	var newInt = (threeByteBuffer.readUInt8(0) << 16) | (threeByteBuffer.readUInt8(1) << 8) | threeByteBuffer.readUInt8(2);
	// 3byte int in 2s compliment 
 	if (threeByteBuffer.readUInt8(0) > 127) {
 		//this is the two's compliment case
 		//i.e. number is negative so we need to simply
 		//add a byte of 1's on the front
 		netInt = newInt | maskForNegativeNum;
 	} else {
 		//I'm pretty sure we don't need this seeing as newInt is already 32-bits
 		// newInt = newInt & maskForPositiveNum;
 	}

 	// TODO: Apply the sclaing factor
 	return newInt;
}

// var bufTemp = new Buffer('\x00\x00\x07');
// console.log(interpret24bitAsInt32(bufTemp));

function interpret16bitAsInt32(twoByteBuffer) {
	const maskForNegativeNum = (255 << (3 * 8)) | (255 << (2 * 8));
	const maskForPositiveNum = 255 | (255 << 8);

	var newInt = (twoByteBuffer.readUInt8(0) << 8) | twoByteBuffer.readUInt8(1);
	// 3byte int in 2s compliment 
 	if (twoByteBuffer.readUInt8(0) > 127) {
 		//this is the two's compliment case
 		//i.e. number is negative so we need to simply
 		//add a byte of 1's on the front
 		netInt = newInt | maskForNegativeNum;
 	} else {
 		//I'm pretty sure we don't need this seeing as newInt is already 32-bits
 		// newInt = newInt & maskForPositiveNum;
 	}

 	// TODO: Apply the sclaing factor
 	return newInt;
}

