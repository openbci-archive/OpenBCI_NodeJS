'use strict';
var gaussian = require('gaussian');
var k = require('./openBCIConstants');
var StreamSearch = require('streamsearch');

/** Constants for interpreting the EEG data */
// Reference voltage for ADC in ADS1299.
//   Set by its hardware.
const ADS1299_VREF = 4.5;
// Scale factor for aux data
const SCALE_FACTOR_ACCEL = 0.002 / Math.pow(2, 4);
// X, Y, Z
const ACCEL_NUMBER_AXIS = 3;
// Default ADS1299 gains array

// For computing Goertzel Algorithm
// See: http://www.embedded.com/design/configurable-systems/4024443/The-Goertzel-Algorithm
// In the tutorial cited above, GOERTZEL_BLOCK_SIZE is referred to as N
const GOERTZEL_BLOCK_SIZE = 62;
const GOERTZEL_K_250 = Math.floor(0.5 + ((GOERTZEL_BLOCK_SIZE * k.OBCILeadOffFrequencyHz) / k.OBCISampleRate250));
const GOERTZEL_W_250 = ((2 * Math.PI) / GOERTZEL_BLOCK_SIZE) * GOERTZEL_K_250;
const GOERTZEL_COEFF_250 = 2 * Math.cos(GOERTZEL_W_250);

var sampleModule = {

  /**
   * @description This takes a 33 byte packet and converts it based on the last four bits.
   *                  0000 - Standard OpenBCI V3 Sample Packet
   * @param dataBuf {Buffer} - A 33 byte buffer
   * @param channelSettingsArray (optional) - An array of channel settings that is an Array that has shape similar to the one
   *                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
   *                  Array of objects that have key-value pair {gain:NUMBER}
   * @param convertAuxToAccel (optional) {Boolean} - Do you want to convert to g's? (Defaults to true)*
   * @returns {Object} - A standard sample object.
   */
  parseRawPacketStandard: (dataBuf, channelSettingsArray, convertAuxToAccel) => {
    const defaultChannelSettingsArray = k.channelSettingsArrayInit(k.OBCINumberOfChannelsDefault);

    // channelSettingsArray is optional, defaults to CHANNEL_SETTINGS_ARRAY_DEFAULT
    channelSettingsArray = channelSettingsArray || defaultChannelSettingsArray;
    // By default convert to g's
    if (convertAuxToAccel === undefined || convertAuxToAccel === null) convertAuxToAccel = true;

    // Check to make sure data is not null.
    if (k.isUndefined(dataBuf) || k.isNull(dataBuf)) {
      throw new Error(k.OBCIErrorUndefinedOrNullInput);
    }

    // Check to make sure the buffer is the right size.
    if (dataBuf.byteLength !== k.OBCIPacketSize) {
      throw new Error(k.OBCIErrorInvalidByteLength);
    }

    // Verify the correct stop byte.
    if (dataBuf[0] !== k.OBCIByteStart) {
      throw new Error(k.OBCIErrorInvalidByteStart);
    }

    if (convertAuxToAccel) {
      return parsePacketStandardAccel(dataBuf, channelSettingsArray);
    } else {
      return parsePacketStandardRawAux(dataBuf, channelSettingsArray);
    }
  },
  getRawPacketType,
  getFromTimePacketAccel,
  getFromTimePacketTime,
  getFromTimePacketRawAux,
  parsePacketTimeSyncedAccel,
  parsePacketTimeSyncedRawAux,
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
  * @param sample - A sample object
  * @returns {Buffer}
  */
  convertSampleToPacketStandard: (sample) => {
    var packetBuffer = new Buffer(k.OBCIPacketSize);
    packetBuffer.fill(0);

    // start byte
    packetBuffer[0] = k.OBCIByteStart;

    // sample number
    packetBuffer[1] = sample.sampleNumber;

    // channel data
    for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
      var threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

      threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
    }

    for (var j = 0; j < 3; j++) {
      var twoByteBuffer = floatTo2ByteBuffer(sample.auxData[j]);

      twoByteBuffer.copy(packetBuffer, (k.OBCIPacketSize - 1 - 6) + (i * 2));
    }

    // stop byte
    packetBuffer[k.OBCIPacketSize - 1] = k.OBCIByteStop;

    return packetBuffer;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
  * @param sample - A sample object
  * @param rawAux {Buffer} - A 6 byte long buffer to insert into raw buffer
  * @returns {Buffer} - A 33 byte long buffer
  */
  convertSampleToPacketRawAux: (sample, rawAux) => {
    var packetBuffer = new Buffer(k.OBCIPacketSize);
    packetBuffer.fill(0);

    // start byte
    packetBuffer[0] = k.OBCIByteStart;

    // sample number
    packetBuffer[1] = sample.sampleNumber;

    // channel data
    for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
      var threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

      threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
    }

    // Write the raw aux bytes
    rawAux.copy(packetBuffer, 26);

    // stop byte
    packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux);

    return packetBuffer;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into an accel time sync set buffer
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @returns {Buffer} - A time sync accel packet
  */
  convertSampleToPacketAccelTimeSyncSet: (sample, time) => {
    var buf = convertSampleToPacketAccelTimeSynced(sample, time);
    buf[k.OBCIPacketPositionStopByte] = makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSyncSet);
    return buf;
  },
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into an accel time synced buffer
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @returns {Buffer} - A time sync accel packet
  */
  convertSampleToPacketAccelTimeSynced,
  /**
  * @description Mainly used by the simulator to convert a randomly generated sample into a raw aux time sync set packet
  * @param sample {Buffer} - A sample object
  * @param time {Number} - The time to inject into the sample.
  * @param rawAux {Buffer} - 2 byte buffer to inject into sample
  * @returns {Buffer} - A time sync raw aux packet
  */
  convertSampleToPacketRawAuxTimeSyncSet: (sample, time, rawAux) => {
    var buf = convertSampleToPacketRawAuxTimeSynced(sample, time, rawAux);
    buf[k.OBCIPacketPositionStopByte] = makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSyncSet);
    return buf;
  },
  convertSampleToPacketRawAuxTimeSynced,
  debugPrettyPrint: (sample) => {
    if (sample === null || sample === undefined) {
      console.log('== Sample is undefined ==');
    } else {
      console.log('-- Sample --');
      console.log('---- Start Byte: ' + sample.startByte);
      console.log('---- Sample Number: ' + sample.sampleNumber);
      for (var i = 0; i < 8; i++) {
        console.log('---- Channel Data ' + (i + 1) + ': ' + sample.channelData[i]);
      }
      if (sample.accelData) {
        for (var j = 0; j < 3; j++) {
          console.log('---- Accel Data ' + j + ': ' + sample.accelData[j]);
        }
      }
      if (sample.auxData) {
        console.log('---- Aux Data ' + sample.auxData);
      }
      console.log('---- Stop Byte: ' + sample.stopByte);
    }
  },
  samplePrintHeader: () => {
    return (
      'All voltages in Volts!' +
      'sampleNumber, channel1, channel2, channel3, channel4, channel5, channel6, channel7, channel8, aux1, aux2, aux3\n');
  },
  samplePrintLine: sample => {
    return new Promise((resolve, reject) => {
      if (sample === null || sample === undefined) reject('undefined sample');

      resolve(
        sample.sampleNumber + ',' +
        sample.channelData[0].toFixed(8) + ',' +
        sample.channelData[1].toFixed(8) + ',' +
        sample.channelData[2].toFixed(8) + ',' +
        sample.channelData[3].toFixed(8) + ',' +
        sample.channelData[4].toFixed(8) + ',' +
        sample.channelData[5].toFixed(8) + ',' +
        sample.channelData[6].toFixed(8) + ',' +
        sample.channelData[7].toFixed(8) + ',' +
        sample.auxData[0].toFixed(8) + ',' +
        sample.auxData[1].toFixed(8) + ',' +
        sample.auxData[2].toFixed(8) + '\n'
      );
    });
  },
  floatTo3ByteBuffer,
  floatTo2ByteBuffer,
  /**
  * @description Calculate the impedance for one channel only.
  * @param sampleObject - Standard OpenBCI sample object
  * @param channelNumber - Number, the channel you want to calculate impedance for.
  * @returns {Promise} - Fulfilled with impedance value for the specified channel.
  * @author AJ Keller
  */
  impedanceCalculationForChannel: (sampleObject, channelNumber) => {
    const sqrt2 = Math.sqrt(2);
    return new Promise((resolve, reject) => {
      if (sampleObject === undefined || sampleObject === null) reject('Sample Object cannot be null or undefined');
      if (sampleObject.channelData === undefined || sampleObject.channelData === null) reject('Channel cannot be null or undefined');
      if (channelNumber < 1 || channelNumber > k.OBCINumberOfChannelsDefault) reject('Channel number invalid.');

      var index = channelNumber - 1;

      if (sampleObject.channelData[index] < 0) {
        sampleObject.channelData[index] *= -1;
      }
      var impedance = (sqrt2 * sampleObject.channelData[index]) / k.OBCILeadOffDriveInAmps;
      // if (index === 0) console.log("Voltage: " + (sqrt2*sampleObject.channelData[index]) + " leadoff amps: " + k.OBCILeadOffDriveInAmps + " impedance: " + impedance)
      resolve(impedance);
    });
  },
  /**
  * @description Calculate the impedance for all channels.
  * @param sampleObject - Standard OpenBCI sample object
  * @returns {Promise} - Fulfilled with impedances for the sample
  * @author AJ Keller
  */
  impedanceCalculationForAllChannels: sampleObject => {
    const sqrt2 = Math.sqrt(2);
    return new Promise((resolve, reject) => {
      if (sampleObject === undefined || sampleObject === null) reject('Sample Object cannot be null or undefined');
      if (sampleObject.channelData === undefined || sampleObject.channelData === null) reject('Channel cannot be null or undefined');

      var sampleImpedances = [];
      var numChannels = sampleObject.channelData.length;
      for (var index = 0; index < numChannels; index++) {
        if (sampleObject.channelData[index] < 0) {
          sampleObject.channelData[index] *= -1;
        }
        var impedance = (sqrt2 * sampleObject.channelData[index]) / k.OBCILeadOffDriveInAmps;
        sampleImpedances.push(impedance);

      // if (index === 0) console.log("Voltage: " + (sqrt2*sampleObject.channelData[index]) + " leadoff amps: " + k.OBCILeadOffDriveInAmps + " impedance: " + impedance)
      }

      sampleObject.impedances = sampleImpedances;

      resolve(sampleObject);
    });
  },
  interpret16bitAsInt32: twoByteBuffer => {
    var prefix = 0;

    if (twoByteBuffer[0] > 127) {
      // console.log('\t\tNegative number')
      prefix = 65535; // 0xFFFF
    }

    return (prefix << 16) | (twoByteBuffer[0] << 8) | twoByteBuffer[1];
  },
  interpret24bitAsInt32: threeByteBuffer => {
    var prefix = 0;

    if (threeByteBuffer[0] > 127) {
      // console.log('\t\tNegative number')
      prefix = 255;
    }

    return (prefix << 24) | (threeByteBuffer[0] << 16) | (threeByteBuffer[1] << 8) | threeByteBuffer[2];
  },
  impedanceArray: numberOfChannels => {
    var impedanceArray = [];
    for (var i = 0; i < numberOfChannels; i++) {
      impedanceArray.push(newImpedanceObject(i + 1));
    }
    return impedanceArray;
  },
  impedanceObject: newImpedanceObject,
  impedanceSummarize: singleInputObject => {
    if (singleInputObject.raw > k.OBCIImpedanceThresholdBadMax) { // The case for no load (super high impedance)
      singleInputObject.text = k.OBCIImpedanceTextNone;
    } else {
      singleInputObject.text = k.getTextForRawImpedance(singleInputObject.raw); // Get textual impedance
    }
  },
  newSample,
  /**
  * @description Create a configurable function to return samples for a simulator. This implements 1/f filtering injection to create more brain like data.
  * @param numberOfChannels {Number} - The number of channels in the sample... either 8 or 16
  * @param sampleRateHz {Number} - The sample rate
  * @param injectAlpha {Boolean} (optional) - True if you want to inject noise
  * @param lineNoise {String} (optional) - A string that can be either:
  *              `60Hz` - 60Hz line noise (Default) (ex. __United States__)
  *              `50Hz` - 50Hz line noise (ex. __Europe__)
  *              `none` - Do not inject line noise.
  *
  * @returns {Function}
  */
  randomSample: (numberOfChannels, sampleRateHz, injectAlpha, lineNoise) => {
    const distribution = gaussian(0, 1);
    const sineWaveFreqHz10 = 10;
    const sineWaveFreqHz50 = 50;
    const sineWaveFreqHz60 = 60;
    const uVolts = 1000000;

    var sinePhaseRad = new Array(numberOfChannels + 1); // prevent index error with '+1'
    sinePhaseRad.fill(0);

    var auxData = [0, 0, 0];
    var accelCounter = 0;
    // With 250Hz, every 10 samples, with 125Hz, every 5...
    var samplesPerAccelRate = Math.floor(sampleRateHz / 25); // best to make this an integer
    if (samplesPerAccelRate < 1) samplesPerAccelRate = 1;

    // Init arrays to hold coefficients for each channel and init to 0
    //  This gives the 1/f filter memory on each iteration
    var b0 = new Array(numberOfChannels).fill(0);
    var b1 = new Array(numberOfChannels).fill(0);
    var b2 = new Array(numberOfChannels).fill(0);

    /**
    * @description Use a 1/f filter
    * @param previousSampleNumber {Number} - The previous sample number
    */
    return previousSampleNumber => {
      var sample = newSample();
      var whiteNoise;
      for (var i = 0; i < numberOfChannels; i++) { // channels are 0 indexed
        // This produces white noise
        whiteNoise = distribution.ppf(Math.random()) * Math.sqrt(sampleRateHz / 2) / uVolts;

        switch (i) {
          case 0: // Add 10Hz signal to channel 1... brainy
          case 1:
            if (injectAlpha) {
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz10 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (5 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            }
            break;
          default:
            if (lineNoise === k.OBCISimulatorLineNoiseHz60) {
              // If we're in murica we want to add 60Hz line noise
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz60 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (8 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            } else if (lineNoise === k.OBCISimulatorLineNoiseHz50) {
              // add 50Hz line noise if we are not in america
              sinePhaseRad[i] += 2 * Math.PI * sineWaveFreqHz50 / sampleRateHz;
              if (sinePhaseRad[i] > 2 * Math.PI) {
                sinePhaseRad[i] -= 2 * Math.PI;
              }
              whiteNoise += (8 * Math.SQRT2 * Math.sin(sinePhaseRad[i])) / uVolts;
            }
        }
        /**
        * See http://www.firstpr.com.au/dsp/pink-noise/ section "Filtering white noise to make it pink"
        */
        b0[i] = 0.99765 * b0[i] + whiteNoise * 0.0990460;
        b1[i] = 0.96300 * b1[i] + whiteNoise * 0.2965164;
        b2[i] = 0.57000 * b2[i] + whiteNoise * 1.0526913;
        sample.channelData[i] = b0[i] + b1[i] + b2[i] + whiteNoise * 0.1848;
      }
      if (previousSampleNumber === 255) {
        sample.sampleNumber = 0;
      } else {
        sample.sampleNumber = previousSampleNumber + 1;
      }

      /**
      * Sample rate of accelerometer is 25Hz... when the accelCounter hits the relative sample rate of the accel
      *  we will output a new accel value. The approach will be to consider that Z should be about 1 and X and Y
      *  should be somewhere around 0.
      */
      if (accelCounter === samplesPerAccelRate) {
        // Initialize a new array
        var accelArray = [0, 0, 0];
        // Calculate X
        accelArray[0] = (Math.random() * 0.1 * (Math.random() > 0.5 ? -1 : 1));
        // Calculate Y
        accelArray[1] = (Math.random() * 0.1 * (Math.random() > 0.5 ? -1 : 1));
        // Calculate Z, this is around 1
        accelArray[2] = 1 - ((Math.random() * 0.4) * (Math.random() > 0.5 ? -1 : 1));
        // Store the newly calculated value
        sample.auxData = accelArray;
        // Reset the counter
        accelCounter = 0;
      } else {
        // Increment counter
        accelCounter++;
        // Store the default value
        sample.auxData = auxData;
      }

      return sample;
    };
  },
  scaleFactorAux: SCALE_FACTOR_ACCEL,
  k,
  /**
  * @description Use the Goertzel algorithm to calculate impedances
  * @param sample - a sample with channelData Array
  * @param goertzelObj - An object that was created by a call to this.goertzelNewObject()
  * @returns {Array} - Returns an array if finished computing
  */
  goertzelProcessSample: (sample, goertzelObj) => {
    // calculate the goertzel values for all channels
    for (var i = 0; i < goertzelObj.numberOfChannels; i++) {
      var q0 = GOERTZEL_COEFF_250 * goertzelObj.q1[i] - goertzelObj.q2[i] + sample.channelData[i];
      goertzelObj.q2[i] = goertzelObj.q1[i];
      goertzelObj.q1[i] = q0;

    // console.log('Q1: ' + goertzelObj.q1[i] + ' Q2: ' + goertzelObj.q2[i])
    }

    // Increment the index counter
    goertzelObj.index++;

    // Have we iterated more times then block size?
    if (goertzelObj.index > GOERTZEL_BLOCK_SIZE) {
      var impedanceArray = [];
      for (var j = 0; j < goertzelObj.numberOfChannels; j++) {
        // Calculate the magnitude of the voltage
        // var q1SQRD = goertzelObj.q1[j] * goertzelObj.q1[j];
        // var q2SQRD = goertzelObj.q2[j] * goertzelObj.q2[j];
        // var lastPart = goertzelObj.q1[j] * goertzelObj.q2[j] * GOERTZEL_COEFF_250;

        // console.log('Chan ' + j + ', Q1^2: ' + q1SQRD + ', Q2^2: ' + q2SQRD + ', Last Part: ' + lastPart)

        var voltage = Math.sqrt((goertzelObj.q1[j] * goertzelObj.q1[j]) + (goertzelObj.q2[j] * goertzelObj.q2[j]) - goertzelObj.q1[j] * goertzelObj.q2[j] * GOERTZEL_COEFF_250);

        // Calculate the impedance r = v/i
        var impedance = voltage / k.OBCILeadOffDriveInAmps;
        // Push the impedance into the final array
        impedanceArray.push(impedance);

        // Reset the goertzel variables to get ready for the next iteration
        goertzelObj.q1[j] = 0;
        goertzelObj.q2[j] = 0;
      }

      // Reset the goertzel index counter
      goertzelObj.index = 0;

      // Pass out the impedance array
      return impedanceArray;
    } else {
      // This reject is really just for debugging
      return;
    }
  },
  goertzelNewObject: numberOfChannels => {
    // Object to help calculate the goertzel
    var q1 = [];
    var q2 = [];
    for (var i = 0; i < numberOfChannels; i++) {
      q1.push(0);
      q2.push(0);
    }
    return {
      q1: q1,
      q2: q2,
      index: 0,
      numberOfChannels: numberOfChannels
    };
  },
  GOERTZEL_BLOCK_SIZE,
  samplePacket: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 0, 0, 1, 0, 2, makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel)]);
  },
  samplePacketReal: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0x8F, 0xF2, 0x40, 0x8F, 0xDF, 0xF4, 0x90, 0x2B, 0xB6, 0x8F, 0xBF, 0xBF, 0x7F, 0xFF, 0xFF, 0x7F, 0xFF, 0xFF, 0x94, 0x25, 0x34, 0x20, 0xB6, 0x7D, 0, 0xE0, 0, 0xE0, 0x0F, 0x70, makeTailByteFromPacketType(k.OBCIStreamPacketStandardAccel)]);
  },
  samplePacketStandardRawAux: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 2, 3, 4, 5, makeTailByteFromPacketType(k.OBCIStreamPacketStandardRawAux)]);
  },
  samplePacketAccelTimeSyncSet: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSyncSet)]);
  },
  samplePacketAccelTimeSynced: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0, 1, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced)]);
  },
  samplePacketRawAuxTimeSyncSet: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0x00, 0x01, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSyncSet)]);
  },
  samplePacketRawAuxTimeSynced: sampleNumber => {
    return new Buffer([0xA0, sampleNumberNormalize(sampleNumber), 0, 0, 1, 0, 0, 2, 0, 0, 3, 0, 0, 4, 0, 0, 5, 0, 0, 6, 0, 0, 7, 0, 0, 8, 0x00, 0x01, 0, 0, 0, 1, makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced)]);
  },
  samplePacketUserDefined: () => {
    return new Buffer([0xA0, 0x00, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, makeTailByteFromPacketType(k.OBCIStreamPacketUserDefinedType)]);
  },
  makeDaisySampleObject,
  getChannelDataArray,
  isEven,
  isOdd,
  countADSPresent,
  doesBufferHaveEOT,
  findV2Firmware,
  isFailureInBuffer,
  isSuccessInBuffer,
  isTimeSyncSetConfirmationInBuffer,
  makeTailByteFromPacketType,
  isStopByte,
  newSyncObject,
  stripToEOTBuffer,
  /**
  * @description Checks to make sure the previous sample number is one less
  *  then the new sample number. Takes into account sample numbers wrapping
  *  around at 255.
  * @param `previousSampleNumber` {Number} - An integer number of the previous
  *  sample number.
  * @param `newSampleNumber` {Number} - An integer number of the new sample
  *  number.
  * @returns {Array} - Returns null if there is no dropped packets, otherwise,
  *  or on a missed packet, an array of their packet numbers is returned.
  */
  droppedPacketCheck: (previousSampleNumber, newSampleNumber) => {
    if (previousSampleNumber === k.OBCISampleNumberMax && newSampleNumber === 0) {
      return null;
    }

    if (newSampleNumber - previousSampleNumber === 1) {
      return null;
    }

    var missedPacketArray = [];

    if (previousSampleNumber > newSampleNumber) {
      var numMised = k.OBCISampleNumberMax - previousSampleNumber;
      for (var i = 0; i < numMised; i++) {
        missedPacketArray.push(previousSampleNumber + i + 1);
      }
      previousSampleNumber = -1;
    }

    for (var j = 1; j < (newSampleNumber - previousSampleNumber); j++) {
      missedPacketArray.push(previousSampleNumber + j);
    }
    return missedPacketArray;
  }
};

module.exports = sampleModule;

function newImpedanceObject (channelNumber) {
  return {
    channel: channelNumber,
    P: {
      raw: -1,
      text: k.OBCIImpedanceTextInit
    },
    N: {
      raw: -1,
      text: k.OBCIImpedanceTextInit
    }
  };
}

function newSyncObject () {
  return {
    boardTime: 0,
    correctedTransmissionTime: false,
    error: null,
    timeSyncSent: 0,
    timeSyncSentConfirmation: 0,
    timeSyncSetPacket: 0,
    timeRoundTrip: 0,
    timeTransmission: 0,
    timeOffset: 0,
    timeOffsetMaster: 0,
    valid: false
  };
}

/**
* @description This method parses a 33 byte OpenBCI V3 packet and converts to a sample object
* @param dataBuf - 33 byte packet that has bytes:
* 0:[startByte] | 1:[sampleNumber] | 2:[Channel-1.1] | 3:[Channel-1.2] | 4:[Channel-1.3] | 5:[Channel-2.1] | 6:[Channel-2.2] | 7:[Channel-2.3] | 8:[Channel-3.1] | 9:[Channel-3.2] | 10:[Channel-3.3] | 11:[Channel-4.1] | 12:[Channel-4.2] | 13:[Channel-4.3] | 14:[Channel-5.1] | 15:[Channel-5.2] | 16:[Channel-5.3] | 17:[Channel-6.1] | 18:[Channel-6.2] | 19:[Channel-6.3] | 20:[Channel-7.1] | 21:[Channel-7.2] | 22:[Channel-7.3] | 23:[Channel-8.1] | 24:[Channel-8.2] | 25:[Channel-8.3] | 26:[Aux-1.1] | 27:[Aux-1.2] | 28:[Aux-2.1] | 29:[Aux-2.2] | 30:[Aux-3.1] | 31:[Aux-3.2] | 32:StopByte
* @param channelSettingsArray {Array} - An array of channel settings that is an Array that has shape similar to the one
*                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
*                  Array of objects that have key-value pair {gain:NUMBER}
* @returns {object} Sample.
 *                  `sample` Object with:
*                   {
*                     channelData: {Array}, // of floats
*                     accelData: {Array}, // of floats of accel data
*                     sampleNumber: {Number} // The sample number
*                   }
*/
function parsePacketStandardAccel (dataBuf, channelSettingsArray) {
  var sampleObject = {};

  sampleObject.accelData = getDataArrayAccel(dataBuf.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));

  sampleObject.channelData = getChannelDataArray(dataBuf, channelSettingsArray);

  if (k.getVersionNumber(process.version) >= 6) {
    // From introduced in node version 6.x.x
    sampleObject.auxData = Buffer.from(dataBuf.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));
  } else {
    sampleObject.auxData = new Buffer(dataBuf.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));
  }
  // Get the sample number
  sampleObject.sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = dataBuf[0];
  // Get the stop byte
  sampleObject.stopByte = dataBuf[k.OBCIPacketPositionStopByte];

  return sampleObject;
}

/**
* @description This method parses a 33 byte OpenBCI V3 packet and converts to a sample object
* @param dataBuf - 33 byte packet that has bytes:
* 0:[startByte] | 1:[sampleNumber] | 2:[Channel-1.1] | 3:[Channel-1.2] | 4:[Channel-1.3] | 5:[Channel-2.1] | 6:[Channel-2.2] | 7:[Channel-2.3] | 8:[Channel-3.1] | 9:[Channel-3.2] | 10:[Channel-3.3] | 11:[Channel-4.1] | 12:[Channel-4.2] | 13:[Channel-4.3] | 14:[Channel-5.1] | 15:[Channel-5.2] | 16:[Channel-5.3] | 17:[Channel-6.1] | 18:[Channel-6.2] | 19:[Channel-6.3] | 20:[Channel-7.1] | 21:[Channel-7.2] | 22:[Channel-7.3] | 23:[Channel-8.1] | 24:[Channel-8.2] | 25:[Channel-8.3] | 26:[Aux-1.1] | 27:[Aux-1.2] | 28:[Aux-2.1] | 29:[Aux-2.2] | 30:[Aux-3.1] | 31:[Aux-3.2] | 32:StopByte
* @param channelSettingsArray - An array of channel settings that is an Array that has shape similar to the one
*                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
*                  Array of objects that have key-value pair {gain:NUMBER}
* @returns {Promise} - Fulfilled with a sample object that has form:
*                  {
*                      channelData: Array of floats
*                      auxData: 6 byte long buffer of raw aux data
*                      sampleNumber: a Number that is the sample
*                  }
*/
function parsePacketStandardRawAux (dataBuf, channelSettingsArray) {
  var sampleObject = {};

  // Store the channel data
  sampleObject.channelData = getChannelDataArray(dataBuf, channelSettingsArray);

  // Slice the buffer for the aux data
  if (k.getVersionNumber(process.version) >= 6) {
    // From introduced in node version 6.x.x
    sampleObject.auxData = Buffer.from(dataBuf.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));
  } else {
    sampleObject.auxData = new Buffer(dataBuf.slice(k.OBCIPacketPositionStartAux, k.OBCIPacketPositionStopAux + 1));
  }
  // Get the sample number
  sampleObject.sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = dataBuf[0];
  // Get the stop byte
  sampleObject.stopByte = dataBuf[k.OBCIPacketPositionStopByte];

  return sampleObject;
}

/**
* @description Grabs an accel value from a raw but time synced packet. Important that this utilizes the fact that:
*      X axis data is sent with every sampleNumber % 10 === 0
*      Y axis data is sent with every sampleNumber % 10 === 1
*      Z axis data is sent with every sampleNumber % 10 === 2
* @param dataBuf {Buffer} - The 33byte raw time synced accel packet
* @param channelSettingsArray {Array} - An array of channel settings that is an Array that has shape similar to the one
*                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
*                  Array of objects that have key-value pair {gain:NUMBER}
* @param boardOffsetTime {Number} - The difference between board time and current time calculated with sync methods.
* @param accelArray {Array} - A 3 element array that allows us to have inter packet memory of x and y axis data and emit only on the z axis packets.
* @returns {Object} - A sample object. NOTE: Only has accelData if this is a Z axis packet.
*/
function parsePacketTimeSyncedAccel (dataBuf, channelSettingsArray, boardOffsetTime, accelArray) {
  // Ths packet has 'A0','00'....,'AA','AA','FF','FF','FF','FF','C4'
  //  where the 'AA's form an accel 16bit num and 'FF's form a 32 bit time in ms
  // The sample object we are going to build
  var sampleObject = {};

  // Get the sample number
  sampleObject.sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = dataBuf[0];
  // Get the stop byte
  sampleObject.stopByte = dataBuf[k.OBCIPacketPositionStopByte];

  // Get the board time
  sampleObject.boardTime = getFromTimePacketTime(dataBuf);
  sampleObject.timeStamp = sampleObject.boardTime + boardOffsetTime;

  // Extract the aux data
  sampleObject.auxData = getFromTimePacketRawAux(dataBuf);

  // Grab the accelData only if `getFromTimePacketAccel` returns true.
  if (getFromTimePacketAccel(dataBuf, accelArray)) {
    sampleObject.accelData = accelArray;
  }

  // Grab the channel data.
  sampleObject.channelData = getChannelDataArray(dataBuf, channelSettingsArray);

  return sampleObject;
}

/**
* @description Grabs an accel value from a raw but time synced packet. Important that this utilizes the fact that:
*      X axis data is sent with every sampleNumber % 10 === 0
*      Y axis data is sent with every sampleNumber % 10 === 1
*      Z axis data is sent with every sampleNumber % 10 === 2
* @param dataBuf {Buffer} - The 33byte raw time synced accel packet
* @param channelSettingsArray {Array} - An array of channel settings that is an Array that has shape similar to the one
*                  calling OpenBCIConstans.channelSettingsArrayInit(). The most important rule here is that it is
*                  Array of objects that have key-value pair {gain:NUMBER}
* @param boardOffsetTime {Number} - The difference between board time and current time calculated with sync methods.
* @returns {Object} - A sample object. NOTE: The aux data is placed in a 2 byte buffer
*/
function parsePacketTimeSyncedRawAux (dataBuf, channelSettingsArray, boardOffsetTime) {
  // Ths packet has 'A0','00'....,'AA','AA','FF','FF','FF','FF','C4'
  //  where the 'AA's form an accel 16bit num and 'FF's form a 32 bit time in ms
  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  }

  // The sample object we are going to build
  var sampleObject = {};

  // Get the sample number
  sampleObject.sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  // Get the start byte
  sampleObject.startByte = dataBuf[0];
  // Get the stop byte
  sampleObject.stopByte = dataBuf[k.OBCIPacketPositionStopByte];

  // Get the board time
  sampleObject.boardTime = getFromTimePacketTime(dataBuf);
  sampleObject.timeStamp = sampleObject.boardTime + boardOffsetTime;

  // Extract the aux data
  sampleObject.auxData = getFromTimePacketRawAux(dataBuf);

  // Grab the channel data.
  sampleObject.channelData = getChannelDataArray(dataBuf, channelSettingsArray);

  return sampleObject;
}

/**
* @description Extract a time from a time packet in ms.
* @param dataBuf - A raw packet with 33 bytes of data
* @returns {Number} - Board time in milli seconds
* @author AJ Keller (@pushtheworldllc)
*/
function getFromTimePacketTime (dataBuf) {
  // Ths packet has 'A0','00'....,'00','00','FF','FF','FF','FF','C3' where the 'FF's are times
  const lastBytePosition = k.OBCIPacketSize - 1; // This is 33, but 0 indexed would be 32 minus 1 for the stop byte and another two for the aux channel or the
  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  } else {
    // Grab the time from the packet
    return dataBuf.readUInt32BE(lastBytePosition - k.OBCIStreamPacketTimeByteSize);
  }
}

/**
* @description Grabs an accel value from a raw but time synced packet. Important that this utilizes the fact that:
*      X axis data is sent with every sampleNumber % 10 === 7
*      Y axis data is sent with every sampleNumber % 10 === 8
*      Z axis data is sent with every sampleNumber % 10 === 9
* @param dataBuf {Buffer} - The 33byte raw time synced accel packet
* @param accelArray {Array} - A 3 element array that allows us to have inter packet memory of x and y axis data and emit only on the z axis packets.
* @returns {boolean} - A boolean that is true only when the accel array is ready to be emitted... i.e. when this is a Z axis packet
*/
function getFromTimePacketAccel (dataBuf, accelArray) {
  const accelNumBytes = 2;
  const lastBytePosition = k.OBCIPacketSize - 1 - k.OBCIStreamPacketTimeByteSize - accelNumBytes; // This is 33, but 0 indexed would be 32 minus

  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  }

  var sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  switch (sampleNumber % 10) { // The accelerometer is on a 25Hz sample rate, so every ten channel samples, we can get new data
    case k.OBCIAccelAxisX:
      accelArray[0] = sampleModule.interpret16bitAsInt32(dataBuf.slice(lastBytePosition, lastBytePosition + 2)) * SCALE_FACTOR_ACCEL; // slice is not inclusive on the right
      return false;
    case k.OBCIAccelAxisY:
      accelArray[1] = sampleModule.interpret16bitAsInt32(dataBuf.slice(lastBytePosition, lastBytePosition + 2)) * SCALE_FACTOR_ACCEL; // slice is not inclusive on the right
      return false;
    case k.OBCIAccelAxisZ:
      accelArray[2] = sampleModule.interpret16bitAsInt32(dataBuf.slice(lastBytePosition, lastBytePosition + 2)) * SCALE_FACTOR_ACCEL; // slice is not inclusive on the right
      return true;
    default:
      return false;
  }
}

/**
* @description Grabs a raw aux value from a raw but time synced packet.
* @param dataBuf {Buffer} - The 33byte raw time synced raw aux packet
* @returns {Promise} - Fulfills a 2 byte buffer
*/
function getFromTimePacketRawAux (dataBuf) {
  if (dataBuf.byteLength !== k.OBCIPacketSize) {
    throw new Error(k.OBCIErrorInvalidByteLength);
  }
  if (k.getVersionNumber(process.version) >= 6) {
    return Buffer.from(dataBuf.slice(k.OBCIPacketPositionTimeSyncAuxStart, k.OBCIPacketPositionTimeSyncAuxStop));
  } else {
    return new Buffer(dataBuf.slice(k.OBCIPacketPositionTimeSyncAuxStart, k.OBCIPacketPositionTimeSyncAuxStop));
  }
}

/**
* @description Takes a buffer filled with 3 16 bit integers from an OpenBCI device and converts based on settings
*                  of the MPU, values are in ?
* @param dataBuf - Buffer that is 6 bytes long
* @returns {Array} - Array of floats 3 elements long
* @author AJ Keller (@pushtheworldllc)
*/
function getDataArrayAccel (dataBuf) {
  var accelData = [];
  for (var i = 0; i < ACCEL_NUMBER_AXIS; i++) {
    var index = i * 2;
    accelData.push(sampleModule.interpret16bitAsInt32(dataBuf.slice(index, index + 2)) * SCALE_FACTOR_ACCEL);
  }
  return accelData;
}
/**
* @description Takes a buffer filled with 24 bit signed integers from an OpenBCI device with gain settings in
*                  channelSettingsArray[index].gain and converts based on settings of ADS1299... spits out an
*                  array of floats in VOLTS
* @param dataBuf {Buffer} - Buffer with 33 bit signed integers, number of elements is same as channelSettingsArray.length * 3
* @param channelSettingsArray {Array} - The channel settings array, see OpenBCIConstants.channelSettingsArrayInit() for specs
* @returns {Array} - Array filled with floats for each channel's voltage in VOLTS
* @author AJ Keller (@pushtheworldllc)
*/
function getChannelDataArray (dataBuf, channelSettingsArray) {
  if (!Array.isArray(channelSettingsArray)) {
    throw new Error('Error [getChannelDataArray]: Channel Settings must be an array!');
  }
  var channelData = [];
  // Grab the sample number from the buffer
  var sampleNumber = dataBuf[k.OBCIPacketPositionSampleNumber];
  var daisy = channelSettingsArray.length > k.OBCINumberOfChannelsDefault;

  // Channel data arrays are always 8 long
  for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
    if (!channelSettingsArray[i].hasOwnProperty('gain')) {
      throw new Error(`Error [getChannelDataArray]: Invalid channel settings object at index ${i}`);
    }
    if (!k.isNumber(channelSettingsArray[i].gain)) {
      throw new Error('Error [getChannelDataArray]: Property gain of channelSettingsObject not or type Number');
    }

    var scaleFactor = 0;
    if (isEven(sampleNumber) && daisy) {
      scaleFactor = ADS1299_VREF / channelSettingsArray[i + k.OBCINumberOfChannelsDefault].gain / (Math.pow(2, 23) - 1);
    } else {
      scaleFactor = ADS1299_VREF / channelSettingsArray[i].gain / (Math.pow(2, 23) - 1);
    }
    // Convert the three byte signed integer and convert it
    channelData.push(scaleFactor * sampleModule.interpret24bitAsInt32(dataBuf.slice((i * 3) + k.OBCIPacketPositionChannelDataStart, (i * 3) + k.OBCIPacketPositionChannelDataStart + 3)));
  }
  return channelData;
}

function getRawPacketType (stopByte) {
  return stopByte & 0xF;
}

/**
* @description This method is useful for normalizing sample numbers for fake sample packets. This is intended to be
*      useful for the simulator and automated testing.
* @param sampleNumber {Number} - The sample number you want to assign to the packet
* @returns {Number} - The normalized input `sampleNumber` between 0-255
*/
function sampleNumberNormalize (sampleNumber) {
  if (sampleNumber || sampleNumber === 0) {
    if (sampleNumber > 255) {
      sampleNumber = 255;
    }
  } else {
    sampleNumber = 0x45;
  }
  return sampleNumber;
}

function newSample (sampleNumber) {
  if (sampleNumber || sampleNumber === 0) {
    if (sampleNumber > 255) {
      sampleNumber = 255;
    }
  } else {
    sampleNumber = 0;
  }
  return {
    startByte: k.OBCIByteStart,
    sampleNumber: sampleNumber,
    channelData: [],
    accelData: [],
    auxData: null,
    stopByte: k.OBCIByteStop,
    boardTime: 0,
    timeStamp: 0
  };
}

/**
* @description Convert float number into three byte buffer. This is the opposite of .interpret24bitAsInt32()
* @param float - The number you want to convert
* @returns {Buffer} - 3-byte buffer containing the float
*/
function floatTo3ByteBuffer (float) {
  var intBuf = new Buffer(3); // 3 bytes for 24 bits
  intBuf.fill(0); // Fill the buffer with 0s

  var temp = float / (ADS1299_VREF / 24 / (Math.pow(2, 23) - 1)); // Convert to counts

  temp = Math.floor(temp); // Truncate counts number

  // Move into buffer
  intBuf[2] = temp & 255;
  intBuf[1] = (temp & (255 << 8)) >> 8;
  intBuf[0] = (temp & (255 << 16)) >> 16;

  return intBuf;
}

/**
* @description Convert float number into three byte buffer. This is the opposite of .interpret24bitAsInt32()
* @param float - The number you want to convert
* @returns {buffer} - 3-byte buffer containing the float
*/
function floatTo2ByteBuffer (float) {
  var intBuf = new Buffer(2); // 2 bytes for 16 bits
  intBuf.fill(0); // Fill the buffer with 0s

  var temp = float / SCALE_FACTOR_ACCEL; // Convert to counts

  temp = Math.floor(temp); // Truncate counts number

  // console.log('Num: ' + temp)

  // Move into buffer
  intBuf[1] = temp & 255;
  intBuf[0] = (temp & (255 << 8)) >> 8;

  return intBuf;
}

/**
* @description Used to make one sample object from two sample objects. The sample number of the new daisy sample will
*      be the upperSampleObject's sample number divded by 2. This allows us to preserve consecutive sample numbers that
*      flip over at 127 instead of 255 for an 8 channel. The daisySampleObject will also have one `channelData` array
*      with 16 elements inside it, with the lowerSampleObject in the lower indices and the upperSampleObject in the
*      upper set of indices. The auxData from both channels shall be captured in an object called `auxData` which
*      contains two arrays referenced by keys `lower` and `upper` for the `lowerSampleObject` and `upperSampleObject`,
*      respectively. The timestamps shall be averaged and moved into an object called `timestamp`. Further, the
*      un-averaged timestamps from the `lowerSampleObject` and `upperSampleObject` shall be placed into an object called
*      `_timestamps` which shall contain two keys `lower` and `upper` which contain the original timestamps for their
*      respective sampleObjects.
* @param lowerSampleObject {Object} - Lower 8 channels with odd sample number
* @param upperSampleObject {Object} - Upper 8 channels with even sample number
* @returns {Object} - The new merged daisy sample object
*/
function makeDaisySampleObject (lowerSampleObject, upperSampleObject) {
  var daisySampleObject = {};

  daisySampleObject['channelData'] = lowerSampleObject.channelData.concat(upperSampleObject.channelData);

  daisySampleObject['sampleNumber'] = Math.floor(upperSampleObject.sampleNumber / 2);

  daisySampleObject['auxData'] = {
    'lower': lowerSampleObject.auxData,
    'upper': upperSampleObject.auxData
  };

  daisySampleObject['timestamp'] = (lowerSampleObject.timestamp + upperSampleObject.timestamp) / 2;

  daisySampleObject['_timestamps'] = {
    'lower': lowerSampleObject.timestamp,
    'upper': upperSampleObject.timestamp
  };

  if (lowerSampleObject.accelData) {
    daisySampleObject['accelData'] = lowerSampleObject.accelData;
  } else if (upperSampleObject.accelData) {
    daisySampleObject['accelData'] = upperSampleObject.accelData;
  }

  return daisySampleObject;
}

/**
* @description Used to test a number to see if it is even
* @param a {Number} - The number to test
* @returns {boolean} - True if `a` is even
*/
function isEven (a) {
  return a % 2 === 0;
}
/**
* @description Used to test a number to see if it is odd
* @param a {Number} - The number to test
* @returns {boolean} - True if `a` is odd
*/
function isOdd (a) {
  return a % 2 === 1;
}

/**
* @description Since we know exactly what this input will look like (See the hardware firmware) we can program this
*      function with prior knowledge.
* @param dataBuffer {Buffer} - The buffer you want to parse.
* @return {Number} - The number of "ADS1299" present in the `dataBuffer`
*/
function countADSPresent (dataBuffer) {
  const s = new StreamSearch(new Buffer('ADS1299'));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches;
}

/**
* @description Searchs the buffer for a "$$$" or as we call an EOT
* @param dataBuffer - The buffer of some length to parse
* @returns {boolean} - True if the `$$$` was found.
*/
// TODO: StreamSearch is optimized to search incoming chunks of data, streaming in,
//       but a new search is constructed here with every call.  This is not making use
//       of StreamSearch's optimizations; the object should be preserved between chunks,
//       and only fed the new data.  TODO: also check other uses of StreamSearch
function doesBufferHaveEOT (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseEOT));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
* @description Used to parse a soft reset response to determine if the board is running the v2 firmware
* @param dataBuffer {Buffer} - The data to parse
* @returns {boolean} - True if `v2`is indeed found in the `dataBuffer`
*/
function findV2Firmware (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseFirmware));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
* @description Used to parse a buffer for the word `Failure` that is acked back after private radio msg on failure
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if `Failure` was found.
*/
function isFailureInBuffer (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseFailure));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
* @description Used to parse a buffer for the word `Success` that is acked back after private radio msg on success
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if `Success` was found.
*/
function isSuccessInBuffer (dataBuffer) {
  const s = new StreamSearch(new Buffer(k.OBCIParseSuccess));

  // Clear the buffer
  s.reset();

  // Push the new data buffer. This runs the search.
  s.push(dataBuffer);

  // Check and see if there is a match
  return s.matches >= 1;
}

/**
 * @description Used to slice a buffer for the EOT '$$$'.
 * @param dataBuffer {Buffer} - The buffer of some length to parse
 * @returns {Buffer} - The remaining buffer.
 */
function stripToEOTBuffer (dataBuffer) {
  let indexOfEOT = dataBuffer.indexOf(k.OBCIParseEOT);
  if (indexOfEOT >= 0) {
    indexOfEOT += k.OBCIParseEOT.length;
  } else {
    return dataBuffer;
  }

  if (indexOfEOT < dataBuffer.byteLength) {
    if (k.getVersionNumber(process.version) >= 6) {
      // From introduced in node version 6.x.x
      return Buffer.from(dataBuffer.slice(indexOfEOT));
    } else {
      return new Buffer(dataBuffer.slice(indexOfEOT));
    }
  } else {
    return null;
  }
}

/**
* @description Used to parse a buffer for the `,` character that is acked back after a time sync request is sent
* @param dataBuffer {Buffer} - The buffer of some length to parse
* @returns {boolean} - True if the `,` was found.
*/
function isTimeSyncSetConfirmationInBuffer (dataBuffer) {
  if (dataBuffer) {
    var bufferLength = dataBuffer.length;
    switch (bufferLength) {
      case 0:
        return false;
      case 1:
        return dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0);
      case 2:
        // HEAD Byte at End
        if (dataBuffer[1] === k.OBCIByteStart) {
          return dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0);
          // TAIL byte in front
        } else if (isStopByte((dataBuffer[0]))) {
          return dataBuffer[1] === k.OBCISyncTimeSent.charCodeAt(0);
        } else {
          return false;
        }
      default:
        if (dataBuffer[0] === k.OBCISyncTimeSent.charCodeAt(0) && dataBuffer[1] === k.OBCIByteStart) {
          return true;
        }
        for (var i = 1; i < bufferLength; i++) {
          // The base case (last one)
          // console.log(i)
          if (i === (bufferLength - 1)) {
            if (isStopByte((dataBuffer[i - 1]))) {
              return dataBuffer[i] === k.OBCISyncTimeSent.charCodeAt(0);
            }
          } else {
            // Wedged
            if (isStopByte(dataBuffer[i - 1]) && dataBuffer[i + 1] === k.OBCIByteStart) {
              return dataBuffer[i] === k.OBCISyncTimeSent.charCodeAt(0);
            // TAIL byte in front
            }
          }
        }
        return false;

    }
  }
}

/**
* @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
* @param sample {Object} - A sample object
* @param time {Number} - The time to inject into the sample.
* @param rawAux {Buffer} - 2 byte buffer to inject into sample
* @returns {Buffer} - A time sync raw aux packet
*/
function convertSampleToPacketRawAuxTimeSynced (sample, time, rawAux) {
  var packetBuffer = new Buffer(k.OBCIPacketSize);
  packetBuffer.fill(0);

  // start byte
  packetBuffer[0] = k.OBCIByteStart;

  // sample number
  packetBuffer[1] = sample.sampleNumber;

  // channel data
  for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
    var threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

    threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
  }

  // Write the raw aux bytes
  rawAux.copy(packetBuffer, 26);

  // Write the time
  packetBuffer.writeInt32BE(time, 28);

  // stop byte
  packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketRawAuxTimeSynced);

  return packetBuffer;
}

/**
* @description Mainly used by the simulator to convert a randomly generated sample into a std OpenBCI V3 Packet
* @param sample {Object} - A sample object
* @param time {Number} - The time to inject into the sample.
* @returns {Buffer} - A time sync accel packet
*/
function convertSampleToPacketAccelTimeSynced (sample, time) {
  var packetBuffer = new Buffer(k.OBCIPacketSize);
  packetBuffer.fill(0);

  // start byte
  packetBuffer[0] = k.OBCIByteStart;

  // sample number
  packetBuffer[1] = sample.sampleNumber;

  // channel data
  for (var i = 0; i < k.OBCINumberOfChannelsDefault; i++) {
    var threeByteBuffer = floatTo3ByteBuffer(sample.channelData[i]);

    threeByteBuffer.copy(packetBuffer, 2 + (i * 3));
  }

  packetBuffer.writeInt32BE(time, 28);

  // stop byte
  packetBuffer[k.OBCIPacketSize - 1] = makeTailByteFromPacketType(k.OBCIStreamPacketAccelTimeSynced);

  return packetBuffer;
}

/**
* @description Converts a packet type {Number} into a OpenBCI stop byte
* @param type {Number} - The number to smash on to the stop byte. Must be 0-15,
*          out of bounds input will result in a 0
* @return {Number} - A properly formatted OpenBCI stop byte
*/
function makeTailByteFromPacketType (type) {
  if (type < 0 || type > 15) {
    type = 0;
  }
  return k.OBCIByteStop | type;
}

/**
* @description Used to check and see if a byte adheres to the stop byte structure of 0xCx where x is the set of
*      numbers from 0-F in hex of 0-15 in decimal.
* @param byte {Number} - The number to test
* @returns {boolean} - True if `byte` follows the correct form
* @author AJ Keller (@pushtheworldllc)
*/
function isStopByte (byte) {
  return (byte & 0xF0) === k.OBCIByteStop;
}
