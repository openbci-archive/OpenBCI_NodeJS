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
const SCALE_FACTOR_CHANNEL = ADS1299_VREF / ADS1299_GAIN / (Math.pow(2,23) - 1);

var k = require('./OpenBCIConstants');

/*
 Errors
 */
const kErrorInvalidByteLength = "Invalid Packet Byte Length";
const kErrorInvalidByteStart = "Invalid Start Byte";
const kErrorInvalidByteStop = "Invalid Stop Byte";

module.exports = {
    convertPacketToSample: function (dataBuf) {
        var self = this;
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
            var count = 1;
            for (var i = 2; i <= numberOfBytes - 10; i += 3) {
                //console.log('\tDataBuf is is: ' + dataBuf.slice(i, i + 3).toString('hex'));
                //var newNumber = self.interpret24bitAsInt32(dataBuf.slice(i, i + 3));
                //out[count] = newNumber * SCALE_FACTOR_CHANNEL;
                out[count] = scaleData ? self.interpret24bitAsInt32(dataBuf.slice(i, i + 3)) * SCALE_FACTOR_CHANNEL : self.interpret24bitAsInt32(dataBuf.slice(i, i + 3));
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
                out[count] = scaleData ? self.interpret16bitAsInt32(dataBuf.slice(i, i + 2)) * SCALE_FACTOR_ACCEL : self.interpret16bitAsInt32(dataBuf.slice(i, i + 2));
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
    interpret24bitAsInt32: function(threeByteBuffer) {
        //const maskForNegativeNum = (255 << (3 * 8));
        //const maskForPositiveNum = 255 | (255 << 8) | (255 << 16);

        var prefix = 0;

        if(threeByteBuffer[0] > 127) {
            //console.log('\t\tNegative number');
            prefix = 255;
        }

        var newInt = (prefix << 24 ) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];

        return newInt;
        //// 3byte int in 2s compliment
        //console.log('\tthreeByteBuffer is: ' + threeByteBuffer.toString('hex'));
        //
        //if (threeByteBuffer[0] > 127) {
        //    //this is the two's compliment case
        //    //i.e. number is negative so we need to simply
        //    //add a byte of 1's on the front
        //    console.log('\t\tnegative number');
        //    netInt = newInt | maskForNegativeNum;
        //} else {
        //    //I'm pretty sure we don't need this seeing as newInt is already 32-bits
        //    newInt = newInt & maskForPositiveNum;
        //}
        //
        //return newInt;
    },
    interpret16bitAsInt32: function(twoByteBuffer) {

        var prefix = 0;

        if(twoByteBuffer[0] > 127) {
            //console.log('\t\tNegative number');
            prefix = 65535; // 0xFFFF
        }

        //var newInt = (prefix << 24 ) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
        var newInt = (prefix << 16) | (twoByteBuffer[0] << 8) | twoByteBuffer[1];

        return newInt;
        //const maskForNegativeNum = (255 << (3 * 8)) | (255 << (2 * 8));
        //const maskForPositiveNum = 255 | (255 << 8);
        //
        //var newInt = (twoByteBuffer[0] << 8) | twoByteBuffer[1];
        //// 3byte int in 2s compliment
        //console.log('\ttwoByteBuffer is: ' + twoByteBuffer.toString('hex'));
        //if (twoByteBuffer[0] > 127) {
        //    //this is the two's compliment case
        //    //i.e. number is negative so we need to simply
        //    //add a byte of 1's on the front
        //    console.log('\t\tNegative number');
        //    netInt = newInt | maskForNegativeNum;
        //} else {
        //    //I'm pretty sure we don't need this seeing as newInt is already 32-bits
        //    newInt = newInt & maskForPositiveNum;
        //}
        //
        //return newInt;
    },
    samplePacket: function () {
        var byteSample = 0x45;
        // test data in OpenBCI serial format V3
        //var data = 	BYTE_START.toString() + byteSample + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataChannel + chunkDataAux + chunkDataAux + chunkDataAux + BYTE_STOP;
        var buffy = new Buffer([BYTE_START,byteSample,0,0,1,0,0,2,0,0,3,0,0,4,0,0,5,0,0,6,0,0,7,0,0,8,0,0,0,1,0,2,BYTE_STOP]);
        //console.log(buffy);
        //buffy.write(data,"utf-8");
        //console.log('Byte stop is ' + BYTE_STOP);
        //console.log(buffy);
        return buffy;
    }
};


// var bufTemp = new Buffer('\x00\x00\x07');
// console.log(interpret24bitAsInt32(bufTemp));



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