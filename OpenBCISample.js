/*
Author: AJ Keller
*/

/*
Require Statements
*/
var fs = require("fs");


// Fill a buffer with that data
var buf = function () {
	const byteSample 		= '\x45';
	const byteStart	 		= '\x0A';
	const byteStop 			= '\xC0';
	const chunkDataAux		= '\x00\x01';
	const chunkDataChannel	= '\x00\x00\x01';

	// test data in OpenBCI serial format V3
	var data = 	byteStart 			+ 
				byteSample 			+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataChannel 	+ 
				chunkDataAux 		+ 
				chunkDataAux 		+ 
				chunkDataAux 		+ 
				byteStop;
	return new Buffer(data);
}


function OpenBCISample(dataBuf) {
	var numberOfBytes = dataBuf.byteLength;

 	var numberOfChannels = numberOfBytes - 9;



 	var channelData = function() {
 		var out = {};
 		for(var i = 2; i < numberOfBytes-7; i++) {
 			out[i] = interpret24bitAsInt32(buf.slice(i,i+3));
 		}
 		return out;
 	}

 	// var auxData = function() {
 	// 	var out = {};
 	// 	for(var i = ; i < numberOfBytes - 1; i++) {
 	// 		out[i] = dataBuf.readUInt8(i);
 	// 	}
 	// 	return out;
 	// }



	return {
		startByte		: dataBuf.readUInt8(0), //byte
		sampleNumber	: dataBuf.readUInt8(1), //byte
		channelData		: channelData(), 		// multiple of 3 bytes
		auxData			: "auData", 					// 6 bytes
		stopByte 		: dataBuf.readUInt8(numberOfBytes - 1) //byte
	};
}


// var openBCISample1 = convertSerialToOpenBCISample(buf);

// console.log(openBCISample1);


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

var bufTemp = new Buffer('\x00\x00\x07');
console.log(interpret24bitAsInt32(bufTemp));

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

