/**
 * Created by ajk on 12/16/15.
 * Purpose: This file folds all the constants for the
 *     OpenBCI Board
 */
'use strict';
/** Turning channels off */
const OBCIChannelOff_1 = '1';
const OBCIChannelOff_2 = '2';
const OBCIChannelOff_3 = '3';
const OBCIChannelOff_4 = '4';
const OBCIChannelOff_5 = '5';
const OBCIChannelOff_6 = '6';
const OBCIChannelOff_7 = '7';
const OBCIChannelOff_8 = '8';
const OBCIChannelOff_9 = 'q';
const OBCIChannelOff_10 = 'w';
const OBCIChannelOff_11 = 'e';
const OBCIChannelOff_12 = 'r';
const OBCIChannelOff_13 = 't';
const OBCIChannelOff_14 = 'y';
const OBCIChannelOff_15 = 'u';
const OBCIChannelOff_16 = 'i';

/** Turn channels on */
const OBCIChannelOn_1 = '!';
const OBCIChannelOn_2 = '@';
const OBCIChannelOn_3 = '#';
const OBCIChannelOn_4 = '$';
const OBCIChannelOn_5 = '%';
const OBCIChannelOn_6 = '^';
const OBCIChannelOn_7 = '&';
const OBCIChannelOn_8 = '*';
const OBCIChannelOn_9 = 'Q';
const OBCIChannelOn_10 = 'W';
const OBCIChannelOn_11 = 'E';
const OBCIChannelOn_12 = 'R';
const OBCIChannelOn_13 = 'T';
const OBCIChannelOn_14 = 'Y';
const OBCIChannelOn_15 = 'U';
const OBCIChannelOn_16 = 'I';

/** Test Signal Control Commands
 * 1x - Voltage will be 1 * (VREFP - VREFN) / 2.4 mV
 * 2x - Voltage will be 2 * (VREFP - VREFN) / 2.4 mV
 */
const OBCITestSignalConnectToDC            = 'p';
const OBCITestSignalConnectToGround        = '0';
const OBCITestSignalConnectToPulse1xFast   = '=';
const OBCITestSignalConnectToPulse1xSlow   = '-';
const OBCITestSignalConnectToPulse2xFast   = ']';
const OBCITestSignalConnectToPulse2xSlow   = '[';

/** Channel Setting Commands */
const OBCIChannelCmdADCNormal      = '0';
const OBCIChannelCmdADCShorted     = '1';
const OBCIChannelCmdADCBiasDRP     = '6';
const OBCIChannelCmdADCBiasDRN     = '7';
const OBCIChannelCmdADCBiasMethod  = '2';
const OBCIChannelCmdADCMVDD        = '3';
const OBCIChannelCmdADCTemp        = '4';
const OBCIChannelCmdADCTestSig     = '5';
const OBCIChannelCmdBiasInclude    = '1';
const OBCIChannelCmdBiasRemove     = '0';
const OBCIChannelCmdChannel_1      = '1';
const OBCIChannelCmdChannel_2      = '2';
const OBCIChannelCmdChannel_3      = '3';
const OBCIChannelCmdChannel_4      = '4';
const OBCIChannelCmdChannel_5      = '5';
const OBCIChannelCmdChannel_6      = '6';
const OBCIChannelCmdChannel_7      = '7';
const OBCIChannelCmdChannel_8      = '8';
const OBCIChannelCmdChannel_9      = 'Q';
const OBCIChannelCmdChannel_10     = 'W';
const OBCIChannelCmdChannel_11     = 'E';
const OBCIChannelCmdChannel_12     = 'R';
const OBCIChannelCmdChannel_13     = 'T';
const OBCIChannelCmdChannel_14     = 'Y';
const OBCIChannelCmdChannel_15     = 'U';
const OBCIChannelCmdChannel_16     = 'I';
const OBCIChannelCmdGain_1         = '0';
const OBCIChannelCmdGain_2         = '1';
const OBCIChannelCmdGain_4         = '2';
const OBCIChannelCmdGain_6         = '3';
const OBCIChannelCmdGain_8         = '4';
const OBCIChannelCmdGain_12        = '5';
const OBCIChannelCmdGain_24        = '6';
const OBCIChannelCmdLatch          = 'X';
const OBCIChannelCmdPowerOff       = '1';
const OBCIChannelCmdPowerOn        = '0';
const OBCIChannelCmdSet            = 'x';
const OBCIChannelCmdSRB1Connect    = '1';
const OBCIChannelCmdSRB1Diconnect  = '0';
const OBCIChannelCmdSRB2Connect    = '1';
const OBCIChannelCmdSRB2Diconnect  = '0';

/** Channel Setting Helper Strings */
const OBCIStringADCNormal      = 'normal';
const OBCIStringADCShorted     = 'shorted';
const OBCIStringADCBiasMethod  = 'biasMethod';
const OBCIStringADCMvdd        = 'mvdd';
const OBCIStringADCTemp        = 'temp';
const OBCIStringADCTestSig     = 'testSig';
const OBCIStringADCBiasDrp     = 'biasDrp';
const OBCIStringADCBiasDrn     = 'biasDrn';

/** Default Channel Settings */
const OBCIChannelDefaultAllSet = 'd';
const OBCIChannelDefaultAllGet = 'D';

/** LeadOff Impedance Commands */
const OBCIChannelImpedanceLatch                = 'Z';
const OBCIChannelImpedanceSet                  = 'z';
const OBCIChannelImpedanceTestSignalApplied    = '1';
const OBCIChannelImpedanceTestSignalAppliedNot = '0';

/** SD card Commands */
const OBCISDLogForHour1    = 'G';
const OBCISDLogForHour2    = 'H';
const OBCISDLogForHour4    = 'J';
const OBCISDLogForHour12   = 'K';
const OBCISDLogForHour24   = 'L';
const OBCISDLogForMin5     = 'A';
const OBCISDLogForMin15    = 'S';
const OBCISDLogForMin30    = 'F';
const OBCISDLogForSec14    = 'a';
const OBCISDLogStop        = 'j';

/** SD Card String Commands */
const OBCIStringSDHour1    = '1hour';
const OBCIStringSDHour2    = '2hour';
const OBCIStringSDHour4    = '4hour';
const OBCIStringSDHour12   = '12hour';
const OBCIStringSDHour24   = '24hour';
const OBCIStringSDMin5     = '5min';
const OBCIStringSDMin15    = '15min';
const OBCIStringSDMin30    = '30min';
const OBCIStringSDSec14    = '14sec';

/** Stream Data Commands */
const OBCIStreamStart  = 'b';
const OBCIStreamStop   = 's';

/** Miscellaneous */
const OBCIMiscQueryRegisterSettings            = '?';
const OBCIMiscQueryRegisterSettingsChannel1    = 'CH1SET';
const OBCIMiscQueryRegisterSettingsChannel2    = 'CH2SET';
const OBCIMiscQueryRegisterSettingsChannel3    = 'CH3SET';
const OBCIMiscQueryRegisterSettingsChannel4    = 'CH4SET';
const OBCIMiscQueryRegisterSettingsChannel5    = 'CH5SET';
const OBCIMiscQueryRegisterSettingsChannel6    = 'CH6SET';
const OBCIMiscQueryRegisterSettingsChannel7    = 'CH7SET';
const OBCIMiscQueryRegisterSettingsChannel8    = 'CH8SET';
const OBCIMiscSoftReset                        = 'v';

/** 16 Channel Commands */
const OBCIChannelMaxNumber8    = 'c';
const OBCIChannelMaxNumber16   = 'C';

/** 60Hz line filter */
const OBCIFilterDisable ='g';
const OBCIFilterEnable = 'f';

/** Triggers */
const OBCITrigger = '`';

/** Sync Clocks */
const OBCISyncTimeSet = '<';
const OBCISyncTimeSent = ",";

/** Radio Key */
const OBCIRadioKey = 0xF0;
/** Radio Commands */
const OBCIRadioCmdChannelGet            = 0x00;
const OBCIRadioCmdChannelSet            = 0x01;
const OBCIRadioCmdChannelSetOverride    = 0x02;
const OBCIRadioCmdPollTimeGet           = 0x03;
const OBCIRadioCmdPollTimeSet           = 0x04;
const OBCIRadioCmdBaudRateSetDefault    = 0x05;
const OBCIRadioCmdBaudRateSetFast       = 0x06;
const OBCIRadioCmdSystemStatus          = 0x07;

/** Possible number of channels */
const OBCINumberOfChannelsDaisy = 16;
const OBCINumberOfChannelsDefault = 8;
const OBCINumberOfChannelsGanglion = 4;

/** Possible OpenBCI board types */
const OBCIBoardDaisy = 'daisy';
const OBCIBoardDefault = 'default';
const OBCIBoardGanglion = 'ganglion';

/** Possible Simulator Line Noise injections */
const OBCISimulatorLineNoiseHz60 = '60Hz';
const OBCISimulatorLineNoiseHz50 = '50Hz';
const OBCISimulatorLineNoiseNone = 'None';

/** Possible Sample Rates*/
const OBCISampleRate125 = 125;
const OBCISampleRate250 = 250;

/** Packet Size */
const OBCIPacketSize = 33;

/** OpenBCI V3 Standard Packet Positions */
/**
 * 0:[startByte] | 1:[sampleNumber] | 2:[Channel-1.1] | 3:[Channel-1.2] | 4:[Channel-1.3] | 5:[Channel-2.1] | 6:[Channel-2.2] | 7:[Channel-2.3] | 8:[Channel-3.1] | 9:[Channel-3.2] | 10:[Channel-3.3] | 11:[Channel-4.1] | 12:[Channel-4.2] | 13:[Channel-4.3] | 14:[Channel-5.1] | 15:[Channel-5.2] | 16:[Channel-5.3] | 17:[Channel-6.1] | 18:[Channel-6.2] | 19:[Channel-6.3] | 20:[Channel-7.1] | 21:[Channel-7.2] | 22:[Channel-7.3] | 23:[Channel-8.1] | 24:[Channel-8.2] | 25:[Channel-8.3] | 26:[Aux-1.1] | 27:[Aux-1.2] | 28:[Aux-2.1] | 29:[Aux-2.2] | 30:[Aux-3.1] | 31:[Aux-3.2] | 32:StopByte
 */
const OBCIPacketPositionChannelDataStart   = 2;  // 0:startByte | 1:sampleNumber | [2:4] | [5:7] | [8:10] | [11:13] | [14:16] | [17:19] | [21:23] | [24:26]
const OBCIPacketPositionChannelDataStop    = 25; // 24 bytes for channel data
const OBCIPacketPositionSampleNumber       = 1;
const OBCIPacketPositionStartByte          = 0;  // first byte
const OBCIPacketPositionStopByte           = 32; // [32]
const OBCIPacketPositionStartAux           = 26; // [26,27]:Aux 1 | [28,29]:Aux 2 | [30,31]:Aux 3
const OBCIPacketPositionStopAux            = 31; // - - - [30,31]:Aux 3 | 32: Stop byte
const OBCIPacketPositionTimeSyncAuxStart   = 26;
const OBCIPacketPositionTimeSyncAuxStop    = 28;
const OBCIPacketPositionTimeSyncTimeStart  = 28;
const OBCIPacketPositionTimeSyncTimeStop   = 32;


/** Notable Bytes */
const OBCIByteStart = 0xA0;
const OBCIByteStop = 0xC0;

/** Errors */
const ErrorInvalidByteLength = "Invalid Packet Byte Length";
const ErrorInvalidByteStart = "Invalid Start Byte";
const ErrorInvalidByteStop = "Invalid Stop Byte";
const ErrorUndefinedOrNullInput = "Undefined or Null Input";

/** Max Master Buffer Size */
const OBCIMasterBufferSize = 4096;

/** Impedance Calculation Variables */
const OBCILeadOffDriveInAmps = 0.000000006;
const OBCILeadOffFrequencyHz = 31.5;

/** Command send delay */
const OBCIWriteIntervalDelayMSLong = 50;
const OBCIWriteIntervalDelayMSNone = 0;
const OBCIWriteIntervalDelayMSShort = 10;

/** Impedance */
const OBCIImpedanceTextBad = 'bad';
const OBCIImpedanceTextNone = 'none';
const OBCIImpedanceTextGood = 'good';
const OBCIImpedanceTextInit = 'init';
const OBCIImpedanceTextOk = 'ok';

const OBCIImpedanceThresholdGoodMin = 0;
const OBCIImpedanceThresholdGoodMax = 5000;
const OBCIImpedanceThresholdOkMin = 5001;
const OBCIImpedanceThresholdOkMax = 10000;
const OBCIImpedanceThresholdBadMin = 10001;
const OBCIImpedanceThresholdBadMax = 1000000;

const OBCIImpedanceSeriesResistor = 2200; // There is a 2.2 k Ohm series resistor that must be subtracted

/** Simulator */
const OBCISimulatorPortName = 'OpenBCISimulator';

/**
 * Stream packet types/codes
 */
const OBCIStreamPacketStandardAccel      = 0; // 0000
const OBCIStreamPacketStandardRawAux     = 1; // 0001
const OBCIStreamPacketUserDefinedType    = 2; // 0010
const OBCIStreamPacketTimeSyncSet        = 3; // 0011
const OBCIStreamPacketTimeSyncedAccel    = 4; // 0100
const OBCIStreamPacketTimeSyncedRawAux   = 5; // 0101

/** Time from board */
const OBCIStreamPacketTimeByteSize = 4;

/** Time synced with accel packet */
const OBCIAccelAxisX = 0;
const OBCIAccelAxisY = 1;
const OBCIAccelAxisZ = 2;

/** Firmware version indicator */
const OBCIFirmwareV1 = 'v1';
const OBCIFirmwareV2 = 'v2';

/** Parse */
const OBCIParseDaisy        = "Daisy";
const OBCIParseFirmware     = "v2";
const OBCIParseFailure      = "Failure";
const OBCIParseEOT          = "$$$";
const OBCIParseSuccess      = "Success";

/** Used in parsing incoming serial data*/
const OBCIParsingChannelSettings  = 2;
const OBCIParsingEOT              = 4;
const OBCIParsingNormal           = 3;
const OBCIParsingReset            = 0;
const OBCIParsingTimeSyncSent     = 1;

/** Timeouts */
const OBCITimeoutProcessBytes = 500; // 0.5 seconds

/** Simulator Board Configurations */
const OBCISimulatorRawAux   = 'rawAux';
const OBCISimulatorStandard = 'standard';

/** OpenBCI Radio Limits */
const OBCIRadioChannelMax   = 25;
const OBCIRadioChannelMin   = 0;
const OBCIRadioPollTimeMax  = 255;
const OBCIRadioPollTimeMin  = 0;

/** Time sync array size */
const OBCITimeSyncArraySize = 10;

module.exports = {
    /** Turning channels off */
    OBCIChannelOff_1,
    OBCIChannelOff_2,
    OBCIChannelOff_3,
    OBCIChannelOff_4,
    OBCIChannelOff_5,
    OBCIChannelOff_6,
    OBCIChannelOff_7,
    OBCIChannelOff_8,
    OBCIChannelOff_9,
    OBCIChannelOff_10,
    OBCIChannelOff_11,
    OBCIChannelOff_12,
    OBCIChannelOff_13,
    OBCIChannelOff_14,
    OBCIChannelOff_15,
    OBCIChannelOff_16,
    /**
     * Purpose: To get the proper command to turn a channel off
     * @param channelNumber - A number (1-16) of the desired channel
     * @returns {Promise}
     */
    commandChannelOff: function(channelNumber) {
        return new Promise(function(resolve,reject) {
            switch (channelNumber) {
                case 1:
                    resolve(OBCIChannelOff_1);
                    break;
                case 2:
                    resolve(OBCIChannelOff_2);
                    break;
                case 3:
                    resolve(OBCIChannelOff_3);
                    break;
                case 4:
                    resolve(OBCIChannelOff_4);
                    break;
                case 5:
                    resolve(OBCIChannelOff_5);
                    break;
                case 6:
                    resolve(OBCIChannelOff_6);
                    break;
                case 7:
                    resolve(OBCIChannelOff_7);
                    break;
                case 8:
                    resolve(OBCIChannelOff_8);
                    break;
                case 9:
                    resolve(OBCIChannelOff_9);
                    break;
                case 10:
                    resolve(OBCIChannelOff_10);
                    break;
                case 11:
                    resolve(OBCIChannelOff_11);
                    break;
                case 12:
                    resolve(OBCIChannelOff_12);
                    break;
                case 13:
                    resolve(OBCIChannelOff_13);
                    break;
                case 14:
                    resolve(OBCIChannelOff_14);
                    break;
                case 15:
                    resolve(OBCIChannelOff_15);
                    break;
                case 16:
                    resolve(OBCIChannelOff_16);
                    break;
                default:
                    reject('Error [commandChannelOff]: Invalid Channel Number');
                    break;
            }
        });
    },
    /** Turning channels on */
    OBCIChannelOn_1,
    OBCIChannelOn_2,
    OBCIChannelOn_3,
    OBCIChannelOn_4,
    OBCIChannelOn_5,
    OBCIChannelOn_6,
    OBCIChannelOn_7,
    OBCIChannelOn_8,
    OBCIChannelOn_9,
    OBCIChannelOn_10,
    OBCIChannelOn_11,
    OBCIChannelOn_12,
    OBCIChannelOn_13,
    OBCIChannelOn_14,
    OBCIChannelOn_15,
    OBCIChannelOn_16,
    commandChannelOn: function(channelNumber) {
        return new Promise(function(resolve,reject) {
            switch (channelNumber) {
                case 1:
                    resolve(OBCIChannelOn_1);
                    break;
                case 2:
                    resolve(OBCIChannelOn_2);
                    break;
                case 3:
                    resolve(OBCIChannelOn_3);
                    break;
                case 4:
                    resolve(OBCIChannelOn_4);
                    break;
                case 5:
                    resolve(OBCIChannelOn_5);
                    break;
                case 6:
                    resolve(OBCIChannelOn_6);
                    break;
                case 7:
                    resolve(OBCIChannelOn_7);
                    break;
                case 8:
                    resolve(OBCIChannelOn_8);
                    break;
                case 9:
                    resolve(OBCIChannelOn_9);
                    break;
                case 10:
                    resolve(OBCIChannelOn_10);
                    break;
                case 11:
                    resolve(OBCIChannelOn_11);
                    break;
                case 12:
                    resolve(OBCIChannelOn_12);
                    break;
                case 13:
                    resolve(OBCIChannelOn_13);
                    break;
                case 14:
                    resolve(OBCIChannelOn_14);
                    break;
                case 15:
                    resolve(OBCIChannelOn_15);
                    break;
                case 16:
                    resolve(OBCIChannelOn_16);
                    break;
                default:
                    reject('Error [commandChannelOn]: Invalid Channel Number');
                    break;
            }
        });
    },
    /** Test Signal Control Commands */
    OBCITestSignalConnectToDC,
    OBCITestSignalConnectToGround,
    OBCITestSignalConnectToPulse1xFast,
    OBCITestSignalConnectToPulse1xSlow,
    OBCITestSignalConnectToPulse2xFast,
    OBCITestSignalConnectToPulse2xSlow,
    getTestSignalCommand: (signal) => {
        return new Promise((resolve,reject) => {
            switch (signal) {
                case 'dc':
                    resolve(OBCITestSignalConnectToDC);
                    break;
                case 'ground':
                    resolve(OBCITestSignalConnectToGround);
                    break;
                case 'pulse1xFast':
                    resolve(OBCITestSignalConnectToPulse1xFast);
                    break;
                case 'pulse1xSlow':
                    resolve(OBCITestSignalConnectToPulse1xSlow);
                    break;
                case 'pulse2xFast':
                    resolve(OBCITestSignalConnectToPulse2xFast);
                    break;
                case 'pulse2xSlow':
                    resolve(OBCITestSignalConnectToPulse2xSlow);
                    break;
                case 'none':
                    resolve(OBCIChannelDefaultAllSet);
                    break;
                default:
                    reject('Invalid selection! Check your spelling.');
                    break;
            }
        })
    },
    /** Channel Setting Commands */
    OBCIChannelCmdADCNormal,
    OBCIChannelCmdADCShorted,
    OBCIChannelCmdADCBiasDRP,
    OBCIChannelCmdADCBiasDRN,
    OBCIChannelCmdADCBiasMethod,
    OBCIChannelCmdADCMVDD,
    OBCIChannelCmdADCTemp,
    OBCIChannelCmdADCTestSig,
    OBCIChannelCmdBiasInclude,
    OBCIChannelCmdBiasRemove,
    OBCIChannelCmdChannel_1,
    OBCIChannelCmdChannel_2,
    OBCIChannelCmdChannel_3,
    OBCIChannelCmdChannel_4,
    OBCIChannelCmdChannel_5,
    OBCIChannelCmdChannel_6,
    OBCIChannelCmdChannel_7,
    OBCIChannelCmdChannel_8,
    OBCIChannelCmdChannel_9,
    OBCIChannelCmdChannel_10,
    OBCIChannelCmdChannel_11,
    OBCIChannelCmdChannel_12,
    OBCIChannelCmdChannel_13,
    OBCIChannelCmdChannel_14,
    OBCIChannelCmdChannel_15,
    OBCIChannelCmdChannel_16,
    commandChannelForCmd,
    OBCIChannelCmdGain_1,
    OBCIChannelCmdGain_2,
    OBCIChannelCmdGain_4,
    OBCIChannelCmdGain_6,
    OBCIChannelCmdGain_8,
    OBCIChannelCmdGain_12,
    OBCIChannelCmdGain_24,
    commandForGain,
    OBCIChannelCmdLatch,
    OBCIChannelCmdPowerOff,
    OBCIChannelCmdPowerOn,
    OBCIChannelCmdSet,
    OBCIChannelCmdSRB1Connect,
    OBCIChannelCmdSRB1Diconnect,
    OBCIChannelCmdSRB2Connect,
    OBCIChannelCmdSRB2Diconnect,
    /** Channel Settings Object */
    channelSettingsObjectDefault,
    channelSettingsArrayInit: (numberOfChannels) => {
        var newChannelSettingsArray = [];
        for (var i = 0; i < numberOfChannels; i++) {
            newChannelSettingsArray.push(channelSettingsObjectDefault(i));
        }
        return newChannelSettingsArray;
    },
    /** Channel Setting Helper Strings */
    OBCIStringADCNormal,
    OBCIStringADCShorted,
    OBCIStringADCBiasMethod,
    OBCIStringADCMvdd,
    OBCIStringADCTemp,
    OBCIStringADCTestSig,
    OBCIStringADCBiasDrp,
    OBCIStringADCBiasDrn,
    /**
     * @description To convert a string like 'normal' to the correct command (i.e. '1')
     * @param adcString
     * @returns {Promise}
     * @author AJ Keller (@pushtheworldllc)
     */
    commandForADCString,
    /** Default Channel Settings */
    OBCIChannelDefaultAllSet,
    OBCIChannelDefaultAllGet,
    /** LeadOff Impedance Commands */
    OBCIChannelImpedanceLatch,
    OBCIChannelImpedanceSet,
    OBCIChannelImpedanceTestSignalApplied,
    OBCIChannelImpedanceTestSignalAppliedNot,
    /** SD card Commands */
    OBCISDLogForHour1,
    OBCISDLogForHour2,
    OBCISDLogForHour4,
    OBCISDLogForHour12,
    OBCISDLogForHour24,
    OBCISDLogForMin5,
    OBCISDLogForMin15,
    OBCISDLogForMin30,
    OBCISDLogForSec14,
    OBCISDLogStop,
    /** SD Card String Commands */
    OBCIStringSDHour1,
    OBCIStringSDHour2,
    OBCIStringSDHour4,
    OBCIStringSDHour12,
    OBCIStringSDHour24,
    OBCIStringSDMin5,
    OBCIStringSDMin15,
    OBCIStringSDMin30,
    OBCIStringSDSec14,
    /**
     * @description Converts a sd string into the proper setting.
     * @param stringCommand {String} - The length of time you want to record to the SD for.
     * @returns {Promise} The command to send to the Board, returns an error on improper `stringCommand`
     */
    sdSettingForString: (stringCommand) => {
        return new Promise((resolve,reject) => {
            switch (stringCommand) {
                case OBCIStringSDHour1:
                    resolve(OBCISDLogForHour1);
                    break;
                case OBCIStringSDHour2:
                    resolve(OBCISDLogForHour2);
                    break;
                case OBCIStringSDHour4:
                    resolve(OBCISDLogForHour4);
                    break;
                case OBCIStringSDHour12:
                    resolve(OBCISDLogForHour12);
                    break;
                case OBCIStringSDHour24:
                    resolve(OBCISDLogForHour24);
                    break;
                case OBCIStringSDMin5:
                    resolve(OBCISDLogForMin5);
                    break;
                case OBCIStringSDMin15:
                    resolve(OBCISDLogForMin15);
                    break;
                case OBCIStringSDMin30:
                    resolve(OBCISDLogForMin30);
                    break;
                case OBCIStringSDSec14:
                    resolve(OBCISDLogForSec14);
                    break;
                default:
                    reject(new Error(TypeError));
                    break;

            }
        });
    },
    /** Stream Data Commands */
    OBCIStreamStart,
    OBCIStreamStop,
    /** Miscellaneous */
    OBCIMiscQueryRegisterSettings,
    OBCIMiscQueryRegisterSettingsChannel1,
    OBCIMiscQueryRegisterSettingsChannel2,
    OBCIMiscQueryRegisterSettingsChannel3,
    OBCIMiscQueryRegisterSettingsChannel4,
    OBCIMiscQueryRegisterSettingsChannel5,
    OBCIMiscQueryRegisterSettingsChannel6,
    OBCIMiscQueryRegisterSettingsChannel7,
    OBCIMiscQueryRegisterSettingsChannel8,
    channelSettingsKeyForChannel: channelNumber =>{
        return new Promise((resolve,reject) => {
            switch (channelNumber) {
                case 1:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel1));
                    break;
                case 2:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel2));
                    break;
                case 3:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel3));
                    break;
                case 4:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel4));
                    break;
                case 5:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel5));
                    break;
                case 6:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel6));
                    break;
                case 7:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel7));
                    break;
                case 8:
                    resolve(new Buffer(OBCIMiscQueryRegisterSettingsChannel8));
                    break;
                default:
                    reject('Invalid channel number');
                    break;
            }
        });
    },
    OBCIMiscSoftReset,
    /** 16 Channel Commands */
    OBCIChannelMaxNumber8,
    OBCIChannelMaxNumber16,
    /** Filters */
    OBCIFilterDisable,
    OBCIFilterEnable,
    /** Triggers */
    OBCITrigger,
    /** Possible number of channels */
    OBCINumberOfChannelsDaisy,
    OBCINumberOfChannelsDefault,
    OBCINumberOfChannelsGanglion,
    /** Possible OpenBCI board types */
    OBCIBoardDaisy,
    OBCIBoardDefault,
    OBCIBoardGanglion,
    numberOfChannelsForBoardType: boardType => {
        switch (boardType) {
            case OBCIBoardDaisy:
                return OBCINumberOfChannelsDaisy;
            case OBCIBoardGanglion:
                return OBCINumberOfChannelsGanglion;
            default:
                return OBCINumberOfChannelsDefault;
        }
    },
    /** Possible Sample Rates */
    OBCISampleRate125,
    OBCISampleRate250,
    /** Packet Size */
    OBCIPacketSize,
    /** Notable Bytes */
    OBCIByteStart,
    OBCIByteStop,
    /** Errors */
    ErrorInvalidByteLength,
    ErrorInvalidByteStart,
    ErrorInvalidByteStop,
    ErrorUndefinedOrNullInput,
    /** Max Master Buffer Size */
    OBCIMasterBufferSize,
    /** Impedance Calculation Variables */
    OBCILeadOffDriveInAmps,
    OBCILeadOffFrequencyHz,
    /** Channel Setter Maker */
    getChannelSetter:channelSetter,
    /** Impedance Setter Maker */
    getImpedanceSetter:impedanceSetter,
    /** Command send delay */
    OBCIWriteIntervalDelayMSLong,
    OBCIWriteIntervalDelayMSNone,
    OBCIWriteIntervalDelayMSShort,
    /** Sync Clocks */
    OBCISyncTimeSent,
    OBCISyncTimeSet,
    /** Radio Key */
    OBCIRadioKey,
    /** Radio Commands */
    OBCIRadioCmdChannelGet,
    OBCIRadioCmdChannelSet,
    OBCIRadioCmdChannelSetOverride,
    OBCIRadioCmdPollTimeGet,
    OBCIRadioCmdPollTimeSet,
    OBCIRadioCmdBaudRateSetDefault,
    OBCIRadioCmdBaudRateSetFast,
    OBCIRadioCmdSystemStatus,
    /** Impedance */
    OBCIImpedanceTextBad,
    OBCIImpedanceTextGood,
    OBCIImpedanceTextInit,
    OBCIImpedanceTextOk,
    OBCIImpedanceTextNone,
    OBCIImpedanceThresholdBadMax,
    OBCIImpedanceSeriesResistor,
    getTextForRawImpedance: (value) => {
        if (value > OBCIImpedanceThresholdGoodMin && value < OBCIImpedanceThresholdGoodMax) {
            return OBCIImpedanceTextGood;
        } else if (value > OBCIImpedanceThresholdOkMin && value < OBCIImpedanceThresholdOkMax) {
            return OBCIImpedanceTextOk;
        } else if (value > OBCIImpedanceThresholdBadMin && value < OBCIImpedanceThresholdBadMax) {
            return OBCIImpedanceTextBad;
        } else {
            return OBCIImpedanceTextNone;
        }
    },
    /** Simulator */
    OBCISimulatorPortName,
    /**
     * Stream packet types/codes
     */
    OBCIStreamPacketStandardAccel,
    OBCIStreamPacketStandardRawAux,
    OBCIStreamPacketUserDefinedType,
    OBCIStreamPacketTimeSyncSet,
    OBCIStreamPacketTimeSyncedAccel,
    OBCIStreamPacketTimeSyncedRawAux,
    /** fun funcs */
    isNumber,
    isBoolean,
    isString,
    /** OpenBCI V3 Standard Packet Positions */
    OBCIPacketPositionStartByte,
    OBCIPacketPositionStopByte,
    OBCIPacketPositionStartAux,
    OBCIPacketPositionStopAux,
    OBCIPacketPositionChannelDataStart,
    OBCIPacketPositionChannelDataStop,
    OBCIPacketPositionSampleNumber,
    OBCIPacketPositionTimeSyncAuxStart,
    OBCIPacketPositionTimeSyncAuxStop,
    OBCIPacketPositionTimeSyncTimeStart,
    OBCIPacketPositionTimeSyncTimeStop,
/** Possible Simulator Line Noise injections */
    OBCISimulatorLineNoiseHz60,
    OBCISimulatorLineNoiseHz50,
    OBCISimulatorLineNoiseNone,
    /** Firmware version indicator */
    OBCIFirmwareV1,
    OBCIFirmwareV2,
    /** Time synced accel packet */
    OBCIAccelAxisX,
    OBCIAccelAxisY,
    OBCIAccelAxisZ,
    /** Time from board */
    OBCIStreamPacketTimeByteSize,
    /** Parse */
    OBCIParseDaisy,
    OBCIParseFailure,
    OBCIParseFirmware,
    OBCIParseEOT,
    OBCIParseSuccess,
    /** Used in parsing incoming serial data*/
    OBCIParsingChannelSettings,
    OBCIParsingEOT,
    OBCIParsingNormal,
    OBCIParsingReset,
    OBCIParsingTimeSyncSent,
    /** Timeouts */
    OBCITimeoutProcessBytes,
    /** Simulator Board Configurations */
    OBCISimulatorRawAux,
    OBCISimulatorStandard,
    /** Radio Channel Limits */
    OBCIRadioChannelMax,
    OBCIRadioChannelMin,
    OBCIRadioPollTimeMax,
    OBCIRadioPollTimeMin,
    /** Time sync array size */
    OBCITimeSyncArraySize
};

/**
 * @description To add a usability abstraction layer above channel setting commands. Due to the
 *          extensive and highly specific nature of the channel setting command chain, this
 *          will take several different human readable inputs and merge to one array filled
 *          with the correct commands, prime for sending directly to the write command.
 * @param channelNumber - Number (1-16)
 * @param powerDown - Bool (true -> OFF, false -> ON (default))
 *          turns the channel on or off
 * @param gain - Number (1,2,4,6,8,12,24(default))
 *          sets the gain for the channel
 * @param inputType - String (normal,shorted,biasMethod,mvdd,temp,testsig,biasDrp,biasDrn)
 *          selects the ADC channel input source
 * @param bias - Bool (true -> Include in bias (default), false -> remove from bias)
 *          selects to include the channel input in bias generation
 * @param srb2 - Bool (true -> Connect this input to SRB2 (default),
 *                     false -> Disconnect this input from SRB2)
 *          Select to connect (true) this channel's P input to the SRB2 pin. This closes
 *              a switch between P input and SRB2 for the given channel, and allows the
 *              P input to also remain connected to the ADC.
 * @param srb1 - Bool (true -> connect all N inputs to SRB1,
 *                     false -> Disconnect all N inputs from SRB1 (default))
 *          Select to connect (true) all channels' N inputs to SRB1. This effects all pins,
 *              and disconnects all N inputs from the ADC.
 * @returns {Promise} resolves array of commands to be sent, rejects on bad input or no board
 */
function channelSetter(channelNumber,powerDown,gain,inputType,bias,srb2,srb1) {

    // Used to store and assemble the commands
    var cmdPowerDown,
        cmdBias,
        cmdSrb2,
        cmdSrb1;

    return new Promise(function(resolve,reject) {
        // Validate the input
        if (!isNumber(channelNumber)) reject('channelNumber must be of type \'number\' ');
        if (!isBoolean(powerDown)) reject('powerDown must be of type \'boolean\' ');
        if (!isNumber(gain)) reject('gain must be of type \'number\' ');
        if (!isString(inputType)) reject('inputType must be of type \'string\' ');
        if (!isBoolean(bias)) reject('bias must be of type \'boolean\' ');
        if (!isBoolean(srb2)) reject('srb1 must be of type \'boolean\' ');
        if (!isBoolean(srb1)) reject('srb2 must be of type \'boolean\' ');

        // Set Channel Number
        var p1 = commandChannelForCmd(channelNumber)
            .catch(err => reject(err));

        // Set POWER_DOWN
        cmdPowerDown = powerDown ? OBCIChannelCmdPowerOff : OBCIChannelCmdPowerOn;

        // Set Gain
        var p2 = commandForGain(gain)
            .catch(err => reject(err));

        // Set ADC string
        var p3 = commandForADCString(inputType)
            .catch(err => reject(err));

        // Set BIAS
        cmdBias = bias ? OBCIChannelCmdBiasInclude : OBCIChannelCmdBiasRemove;

        // Set SRB2
        cmdSrb2 = srb2 ? OBCIChannelCmdSRB2Connect : OBCIChannelCmdSRB2Diconnect;

        // Set SRB1
        cmdSrb1 = srb1 ? OBCIChannelCmdSRB1Connect : OBCIChannelCmdSRB1Diconnect;

        var newChannelSettingsObject = {
            channelNumber:channelNumber,
            powerDown: powerDown,
            gain: gain,
            inputType: inputType,
            bias: bias,
            srb2: srb2,
            srb1: srb1
        };

        Promise.all([p1,p2,p3]).then(function(values) {
            var outputArray = [
                OBCIChannelCmdSet,
                values[0],
                cmdPowerDown,
                values[1],
                values[2],
                cmdBias,
                cmdSrb2,
                cmdSrb1,
                OBCIChannelCmdLatch
            ];
            //console.log(outputArray);
            resolve(outputArray,newChannelSettingsObject);
        });
    });
}

/**
 * @description To build the array of commands to send to the board to measure impedance
 * @param channelNumber
 * @param pInputApplied - Bool (true -> Test Signal Applied, false -> Test Signal Not Applied (default))
 *          applies the test signal to the P input
 * @param nInputApplied - Bool (true -> Test Signal Applied, false -> Test Signal Not Applied (default))
 *          applies the test signal to the N input
 * @returns {Promise} - fulfilled will contain an array of comamnds
 */
function impedanceSetter(channelNumber,pInputApplied,nInputApplied) {
    var cmdNInputApplied,
        cmdPInputApplied;
    return new Promise((resolve,reject) => {
        //validate inputs
        if (!isNumber(channelNumber)) reject('channelNumber must be of type \'number\' ');
        if (!isBoolean(pInputApplied)) reject('pInputApplied must be of type \'boolean\' ');
        if (!isBoolean(nInputApplied)) reject('nInputApplied must be of type \'boolean\' ');

        // Set pInputApplied
        cmdPInputApplied = pInputApplied ? OBCIChannelImpedanceTestSignalApplied : OBCIChannelImpedanceTestSignalAppliedNot;

        // Set nInputApplied
        cmdNInputApplied = nInputApplied ? OBCIChannelImpedanceTestSignalApplied : OBCIChannelImpedanceTestSignalAppliedNot;

        // Set Channel Number
        commandChannelForCmd(channelNumber).then(command => {
            var outputArray = [
                OBCIChannelImpedanceSet,
                command,
                cmdPInputApplied,
                cmdNInputApplied,
                OBCIChannelImpedanceLatch
            ];
            //console.log(outputArray);
            resolve(outputArray);
        }).catch(err => reject(err));
    });
}

function isNumber(input) {
    return (typeof input === 'number');
}
function isBoolean(input) {
    return (typeof input === 'boolean');
}
function isString(input) {
    return (typeof input === 'string');
}

function commandForADCString(adcString) {
    return new Promise(function(resolve,reject) {
        switch (adcString) {
            case OBCIStringADCNormal:
                resolve(OBCIChannelCmdADCNormal);
                break;
            case OBCIStringADCShorted:
                resolve(OBCIChannelCmdADCShorted);
                break;
            case OBCIStringADCBiasMethod:
                resolve(OBCIChannelCmdADCBiasMethod);
                break;
            case OBCIStringADCMvdd:
                resolve(OBCIChannelCmdADCMVDD);
                break;
            case OBCIStringADCTemp:
                resolve(OBCIChannelCmdADCTemp);
                break;
            case OBCIStringADCTestSig:
                resolve(OBCIChannelCmdADCTestSig);
                break;
            case OBCIStringADCBiasDrp:
                resolve(OBCIChannelCmdADCBiasDRP);
                break;
            case OBCIStringADCBiasDrn:
                resolve(OBCIChannelCmdADCBiasDRN);
                break;
            default:
                reject('Invalid ADC string');
                break;
        }
    });
}

function commandForGain(gainSetting) {
    return new Promise(function(resolve,reject) {
        switch (gainSetting) {
            case 1:
                resolve(OBCIChannelCmdGain_1);
                break;
            case 2:
                resolve(OBCIChannelCmdGain_2);
                break;
            case 4:
                resolve(OBCIChannelCmdGain_4);
                break;
            case 6:
                resolve(OBCIChannelCmdGain_6);
                break;
            case 8:
                resolve(OBCIChannelCmdGain_8);
                break;
            case 12:
                resolve(OBCIChannelCmdGain_12);
                break;
            case 24:
                resolve(OBCIChannelCmdGain_24);
                break;
            default:
                reject('Invalid gain setting of ' + gainSetting + ' tisk tisk, gain must be (1,2,4,6,8,12,24)');
                break;
        }
    });
}

function commandChannelForCmd(channelNumber) {
    return new Promise(function(resolve,reject) {
        switch (channelNumber) {
            case 1:
                resolve(OBCIChannelCmdChannel_1);
                break;
            case 2:
                resolve(OBCIChannelCmdChannel_2);
                break;
            case 3:
                resolve(OBCIChannelCmdChannel_3);
                break;
            case 4:
                resolve(OBCIChannelCmdChannel_4);
                break;
            case 5:
                resolve(OBCIChannelCmdChannel_5);
                break;
            case 6:
                resolve(OBCIChannelCmdChannel_6);
                break;
            case 7:
                resolve(OBCIChannelCmdChannel_7);
                break;
            case 8:
                resolve(OBCIChannelCmdChannel_8);
                break;
            case 9:
                resolve(OBCIChannelCmdChannel_9);
                break;
            case 10:
                resolve(OBCIChannelCmdChannel_10);
                break;
            case 11:
                resolve(OBCIChannelCmdChannel_11);
                break;
            case 12:
                resolve(OBCIChannelCmdChannel_12);
                break;
            case 13:
                resolve(OBCIChannelCmdChannel_13);
                break;
            case 14:
                resolve(OBCIChannelCmdChannel_14);
                break;
            case 15:
                resolve(OBCIChannelCmdChannel_15);
                break;
            case 16:
                resolve(OBCIChannelCmdChannel_16);
                break;
            default:
                reject('Invalid channel number');
                break;
        }
    });
}
function channelSettingsObjectDefault(channelNumber) {
    return {
        channelNumber:channelNumber,
        powerDown: false,
        gain: 24,
        inputType: OBCIStringADCNormal,
        bias: true,
        srb2: true,
        srb1: false
    };
}