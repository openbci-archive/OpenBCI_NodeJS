/*
Author: AJ Keller
*/

/*
Constants for interpreting the EEG data
*/
// Reference voltage for ADC in ADS1299.
//   Set by its hardware.
const ADS1299_VREF = 4.5;
// Assumed gain setting for ADS1299.
//   Set by its Arduino code.
const ADS1299_GAIN = 24.0;
// Start byte
// For conversion of Volts to uVolts
const CONVERT_VOLTS_TO_MICROVOLTS = 1000000;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2,4);
// Scale factor for channelData
const SCALE_FACTOR_CHANNEL = ADS1299_VREF / ADS1299_GAIN / (Math.pow(2,23) - 1);

var k = require('./OpenBCIConstants');

/*
 Errors
 */


module.exports = {
    convertPacketToSample: function (dataBuf) {
        var self = this;
        if(dataBuf === undefined || dataBuf === null) {
            return;
        }
        var numberOfBytes = dataBuf.byteLength;
        var scaleData = true;

        if (dataBuf[0] != k.OBCIByteStart) return;
        if (dataBuf[32] != k.OBCIByteStop) return;
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
            startByte: dataBuf[0], // byte
            sampleNumber: dataBuf[1], // byte
            channelData: channelData(), // multiple of 3 bytes
            auxData: auxData(), // multiple of 2 bytes
            stopByte: dataBuf[numberOfBytes - 1] // byte
        }
    },
    debugPrettyPrint: function(sample) {

        if(sample === null || sample === undefined) {
            console.log('== Sample is undefined ==');
        } else {
            console.log('-- Sample --');
            console.log('---- Start Byte: ' + sample.startByte);
            console.log('---- Sample Number: ' + sample.sampleNumber);
            for(var i = 1; i <= 8; i++) {
                console.log('---- Channel Data ' + i + ': ' + sample.channelData[i]);
            }
            for(var j = 0; j < 3; j++) {
                console.log('---- Aux Data ' + j + ': ' + sample.auxData[j]);
            }
            console.log('---- Stop Byte: ' + sample.stopByte);
        }
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
        var prefix = 0;

        if(threeByteBuffer[0] > 127) {
            //console.log('\t\tNegative number');
            prefix = 255;
        }

        return (prefix << 24 ) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];

    },
    interpret16bitAsInt32: function(twoByteBuffer) {
        var prefix = 0;

        if(twoByteBuffer[0] > 127) {
            //console.log('\t\tNegative number');
            prefix = 65535; // 0xFFFF
        }

        return (prefix << 16) | (twoByteBuffer[0] << 8) | twoByteBuffer[1];
    }
};
