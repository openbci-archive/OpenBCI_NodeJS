/*
Author: AJ Keller
*/

/*
Require Statements
*/
var fs = require("fs");
/*
Constants for interpreting the EEG data
*/
// Reference voltage for ADC in ADS1299.
//   Set by it's hardware.
const ADS1299_VREF = 4.5;
// Assumed gain setting for ADS1299.
//   Set by it's Arduino code.
const ADS1299_GAIN = 24.0;
// Start byte
const BYTE_START = '\x0A';
// Stop byte
// TODO: FIGURE OUT WHAT IS UP WITH '\xC0'
const BYTE_STOP	= '\x02';
// For conversion of Volts to uVolts
const CONVERT_VOLTS_TO_MICROVOLTS = 1000000;
// The number of bytes per OpenBCI packet
const SAMPLE_NUMBER_OF_BYTES = 33;
// The sample rate in Hz
const SAMPLE_RATE = 250.0;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2,4);
// Scale factor for channelData
const SCALE_FACTOR_CHANNEL = ADS1299_VREF / ADS1299_GAIN / (Math.pow(2,23) - 1) * CONVERT_VOLTS_TO_MICROVOLTS;

/*
 Errors
 */
const kErrorInvalidByteLength = "Invalid Packet Byte Length";
const kErrorInvalidByteStart = "Invalid Start Byte";
const kErrorInvalidByteStop = "Invalid Stop Byte";


// Fill a buffer with that data
//This function not operational at the moment
// something weird is going on when trying to write
// '\xC0' (the stop byte) to the buffer
function sampleOpenBCIPacket() {
	var byteSample 			= '\x45';
	var chunkDataAux 		= '\x00\x01';
	var chunkDataChannel	= '\x00\x00\x01';

	// test data in OpenBCI serial format V3
	var data = 	BYTE_START.toString() + byteSample + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataAux + chunkDataAux + chunkDataAux + BYTE_STOP;
    var buffy = new Buffer(data);
    //console.log(buffy);
    //buffy.write(data,"utf-8");
    //console.log('Byte stop is ' + BYTE_STOP);
    //console.log(buffy);
    return buffy;
}

var sampleBuf = sampleOpenBCIPacket();

function OpenBCISample(dataBuf,scaleData) {
	var numberOfBytes = dataBuf.byteLength;

	try {
		if (dataBuf[0] != 10) throw kErrorInvalidByteStart;
		if (dataBuf[32] != 2) throw kErrorInvalidByteStop;
		if (numberOfBytes != SAMPLE_NUMBER_OF_BYTES) throw kErrorInvalidByteLength;

		var channelData = function () {
			var out = {};
			var count = 0;
			for (var i = 2; i <= numberOfBytes - 10; i += 3) {
				out[count] = scaleData ? interpret24bitAsInt32(dataBuf.slice(i, i + 3)) * SCALE_FACTOR_CHANNEL : interpret24bitAsInt32(dataBuf.slice(i, i + 3));
				count++;
			}
			return out;
		}

		var auxData = function () {
			var out = {};
			var count = 0;
			for (var i = numberOfBytes - 7; i < numberOfBytes - 1; i += 2) {
				out[count] = scaleData ? interpret16bitAsInt32(dataBuf.slice(i, i + 2)) * SCALE_FACTOR_ACCEL : interpret16bitAsInt32(dataBuf.slice(i, i + 2));
				count++;
			}
			return out;
		}

		return {
			startByte: dataBuf[0], //byte
			sampleNumber: dataBuf[1], //byte
			channelData: channelData(), // multiple of 3 bytes
			auxData: auxData(), // 6 bytes
			stopByte: dataBuf[numberOfBytes - 1] //byte
		};
	} catch(error) {
		switch (error) {
			case kErrorInvalidByteLength:
				break;
			case kErrorInvalidByteStart:
				break;
			case kErrorInvalidByteStop:
				break;
			default:
				break;
		}
		console.log("ERROR: " + error);
	}


}


var openBCISample1 = OpenBCISample(sampleBuf);

console.log(openBCISample1);


function interpret24bitAsInt32(threeByteBuffer) {
	const maskForNegativeNum = (255 << (3 * 8));
	const maskForPositiveNum = 255 | (255 << 8) | (255 << 16);

	var newInt = (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
	// 3byte int in 2s compliment
 	if (threeByteBuffer[0] > 127) {
 		//this is the two's compliment case
 		//i.e. number is negative so we need to simply
 		//add a byte of 1's on the front
 		netInt = newInt | maskForNegativeNum;
 	} else {
 		//I'm pretty sure we don't need this seeing as newInt is already 32-bits
 		// newInt = newInt & maskForPositiveNum;
 	}

 	return newInt;
}

// var bufTemp = new Buffer('\x00\x00\x07');
// console.log(interpret24bitAsInt32(bufTemp));

function interpret16bitAsInt32(twoByteBuffer) {
	const maskForNegativeNum = (255 << (3 * 8)) | (255 << (2 * 8));
	const maskForPositiveNum = 255 | (255 << 8);

	var newInt = (twoByteBuffer[0] << 8) | twoByteBuffer[1];
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

 	return newInt;
}
