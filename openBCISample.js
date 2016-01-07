'use strict';
var gaussian = require('gaussian');
/** Constants for interpreting the EEG data */
// Reference voltage for ADC in ADS1299.
//   Set by its hardware.
const ADS1299_VREF = 4.5;
// Assumed gain setting for ADS1299.
//   Set by its Arduino code.
const ADS1299_GAIN = 24.0;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2,4);
// Scale factor for channelData
const SCALE_FACTOR_CHANNEL = ADS1299_VREF / ADS1299_GAIN / (Math.pow(2,23) - 1);

var k = require('./openBCIConstants');


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
    impedanceCalculation: function(sampleObject) {
        const sqrt2 = Math.sqrt(2);
        return new Promise((resolve,reject) => {
            if(sampleObject === undefined || sampleObject === null) reject('Sample Object cannot be null or undefined');
            if(sampleObject.channelData === undefined || sampleObject.channelData === null) reject('Channel cannot be null or undefined');

            var impedanceArray = [];
            for (var i = 1; i <= k.OBCINumberOfChannelsDefault; i++) {
                impedanceArray[i] = (sqrt2 * sampleObject.channelData[i]) / k.OBCILeadOffDriveInAmps;
            }
            sampleObject.impedanceArray = impedanceArray;
            resolve(sampleObject);
        });
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
    },
    newSample: function() {
        return {
            startByte: k.OBCIByteStart,
            sampleNumber:0,
            channelData: [],
            auxData: [],
            stopByte: k.OBCIByteStop
        }
    },
    randomSample: function(numberOfChannels,sampleRateHz) {
        var self = this;
        const distribution = gaussian(0,2);
        const sineWaveFreqHz10 = 10;
        const sineWaveFreqHz50 = 50;
        const sineWaveFreqHz60 = 60;
        const pi = Math.PI;
        const sqrt2 = Math.sqrt(2);
        const uVolts = 1000000;

        var sinePhaseRad = new Array(numberOfChannels+1); //prevent index error with '+1'
        sinePhaseRad.fill(0);

        var auxData = [0,0,0];

        return function(previousSampleNumber) {
            var newSample = self.newSample();

            //console.log('New Sample: ' + JSON.stringify(newSample));

            for(var i = 1; i <= numberOfChannels; i++) { //channels are 1 indexed
                newSample.channelData[i] = distribution.ppf(Math.random())*Math.sqrt(sampleRateHz/2)/uVolts;

                switch (i) {
                    case 1: // scale first channel higher
                        newSample.channelData[i] *= 10;
                        break;
                    case 2:
                        sinePhaseRad[i] += 2 * pi * sineWaveFreqHz10 / sampleRateHz;
                        if (sinePhaseRad[i] > 2 * pi) {
                            sinePhaseRad[i] -= 2 * pi;
                        }
                        newSample.channelData[i] += (10 * sqrt2 * Math.sin(sinePhaseRad[i]))/uVolts;
                        break;
                    case 3:
                        sinePhaseRad[i] += 2 * pi * sineWaveFreqHz50 / sampleRateHz;
                        if (sinePhaseRad[i] > 2 * pi) {
                            sinePhaseRad[i] -= 2 * pi;
                        }
                        newSample.channelData[i] += (50 * sqrt2 * Math.sin(sinePhaseRad[i]))/uVolts;
                        break;
                    case 4:
                        sinePhaseRad[i] += 2 * pi * sineWaveFreqHz60 / sampleRateHz;
                        if (sinePhaseRad[i] > 2 * pi) {
                            sinePhaseRad[i] -= 2 * pi;
                        }
                        newSample.channelData[i] += (50 * sqrt2 * Math.sin(sinePhaseRad[i]))/uVolts;
                        break;

                }
            }
            newSample.sampleNumber = previousSampleNumber + 1;
            newSample.auxData = auxData;

            return newSample;
        };
    },
    scaleFactorAux: SCALE_FACTOR_ACCEL,
    scaleFactorChannel: SCALE_FACTOR_CHANNEL,
    k:k
};