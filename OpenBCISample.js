/*
Author: AJ Keller
*/

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
const BYTE_START = 0x0A;
// Stop byte
const BYTE_STOP	= 0xC0;
// For conversion of Volts to uVolts
const CONVERT_VOLTS_TO_MICROVOLTS = 1000000;
// The sample rate in Hz
const SAMPLE_RATE = 250.0;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2,4);
// Scale factor for channelData
const SCALE_FACTOR_CHANNEL = ADS1299_VREF / ADS1299_GAIN / (Math.pow(2,23) - 1) * CONVERT_VOLTS_TO_MICROVOLTS;

var k = require('./OpenBCIConstants');

/*
 Errors
 */
const kErrorInvalidByteLength = "Invalid Packet Byte Length";
const kErrorInvalidByteStart = "Invalid Start Byte";
const kErrorInvalidByteStop = "Invalid Stop Byte";

module.exports = {
    convertPacketToSample: function (dataBuf) {
        if(dataBuf === undefined || dataBuf === null) {
            reject('data is undefined');
        }
        var numberOfBytes = dataBuf.byteLength;
        var scaleData = true;

        if (dataBuf[0] != BYTE_START) return;
        if (dataBuf[32] != BYTE_STOP) return;
        if (numberOfBytes != k.OBCIPacketSize) return;

        var channelData = function () {
            var out = {};
            var count = 0;
            for (var i = 2; i <= numberOfBytes - 10; i += 3) {
                out[count] = scaleData ? interpret24bitAsInt32(dataBuf.slice(i, i + 3)) * SCALE_FACTOR_CHANNEL : interpret24bitAsInt32(dataBuf.slice(i, i + 3));
                //console.log("in" + dataBuf.slice(i,i+3));
                //console.log(out[count]);
                count++;
            }
            return out;
        };

        var auxData = function () {
            var out = {};
            var count = 0;
            for (var i = numberOfBytes - 7; i < numberOfBytes - 1; i += 2) {
                out[count] = scaleData ? interpret16bitAsInt32(dataBuf.slice(i, i + 2)) * SCALE_FACTOR_ACCEL : interpret16bitAsInt32(dataBuf.slice(i, i + 2));
                count++;
            }
            return out;
        };

        return {
            startByte: dataBuf[0], //byte
            sampleNumber: dataBuf[1], //byte
            channelData: channelData(), // multiple of 3 bytes
            auxData: auxData(), // 6 bytes
            stopByte: dataBuf[numberOfBytes - 1] //byte
        }
    },
    debugPrettyPrint: function(sample) {
        console.log('-- Sample --');
        console.log('---- Start Byte: ' + sample.startByte);
        console.log('---- Sample Number: ' + sample.sampleNumber);
        for(var i = 0; i < 8; i++) {
            console.log('---- Channel Data ' + i + ': ' + sample.channelData[i]);
        }
        for(var j = 0; j < 3; j++) {
            console.log('---- Aux Data ' + j + ': ' + sample.auxData[j]);
        }
        console.log('---- Stop Byte: ' + sample.stopByte);


    },
    scaleFactorAux: SCALE_FACTOR_ACCEL,
    scaleFactorChannel: SCALE_FACTOR_CHANNEL,
    sampleMaker: function(length) {
        var data = new Buffer(0);
        return function (buffer) {
            data = Buffer.concat([data, buffer]);
            while (data.length >= length) {
                var out = data.slice(0, length);
                data = data.slice(length);
            }
        };
    },
    samplePacket: function () {
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
};

function interpret24bitAsInt32(threeByteBuffer) {
    const maskForNegativeNum = (255 << (3 * 8));
	const maskForPositiveNum = 255 | (255 << 8) | (255 << 16);

	var newInt = (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
	// 3byte int in 2s compliment
    console.log('three ByteBuffer is: ' + threeByteBuffer.toString('hex'));

    if (threeByteBuffer[0] > 127) {
 		//this is the two's compliment case
 		//i.e. number is negative so we need to simply
 		//add a byte of 1's on the front
        console.log('negative number');
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
    console.log('twoByteBuffer is: ' + twoByteBuffer.toString('hex'));
 	if (twoByteBuffer[0] > 127) {
 		//this is the two's compliment case
 		//i.e. number is negative so we need to simply
 		//add a byte of 1's on the front
        console.log('Negative number');
 		netInt = newInt | maskForNegativeNum;
 	} else {
 		//I'm pretty sure we don't need this seeing as newInt is already 32-bits
 		// newInt = newInt & maskForPositiveNum;
 	}

 	return newInt;
}



//module.exports = {
//    convert: function(in) {
//        var newNum = dataConversion3000(in);
//        return newNum;
//    },
//    dataConverter3000: function() {
//        const conversionFactor = 69;
//        return function(dataToConvert) {
//            return dataToConvert * conversionFactor;
//        }
//    }
//}