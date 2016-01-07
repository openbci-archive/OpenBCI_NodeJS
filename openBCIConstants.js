/**
 * Created by ajk on 12/16/15.
 * Purpose: This file folds all the constants for the
 *     OpenBCI Board
 */
'use strict';
/** Turning channels off */
const kOBCIChannelOff_1 = '1';
const kOBCIChannelOff_2 = '2';
const kOBCIChannelOff_3 = '3';
const kOBCIChannelOff_4 = '4';
const kOBCIChannelOff_5 = '5';
const kOBCIChannelOff_6 = '6';
const kOBCIChannelOff_7 = '7';
const kOBCIChannelOff_8 = '8';
const kOBCIChannelOff_9 = 'q';
const kOBCIChannelOff_10 = 'w';
const kOBCIChannelOff_11 = 'e';
const kOBCIChannelOff_12 = 'r';
const kOBCIChannelOff_13 = 't';
const kOBCIChannelOff_14 = 'y';
const kOBCIChannelOff_15 = 'u';
const kOBCIChannelOff_16 = 'i';

/** Turn channels on */
const kOBCIChannelOn_1 = '!';
const kOBCIChannelOn_2 = '@';
const kOBCIChannelOn_3 = '#';
const kOBCIChannelOn_4 = '$';
const kOBCIChannelOn_5 = '%';
const kOBCIChannelOn_6 = '^';
const kOBCIChannelOn_7 = '&';
const kOBCIChannelOn_8 = '*';
const kOBCIChannelOn_9 = 'Q';
const kOBCIChannelOn_10 = 'W';
const kOBCIChannelOn_11 = 'E';
const kOBCIChannelOn_12 = 'R';
const kOBCIChannelOn_13 = 'T';
const kOBCIChannelOn_14 = 'Y';
const kOBCIChannelOn_15 = 'U';
const kOBCIChannelOn_16 = 'I';

/** Test Signal Control Commands */
const kOBCITestSignalConnectToDC            = 'p';
const kOBCITestSignalConnectToGround        = '0';
const kOBCITestSignalConnectToPulse1xFast   = '=';
const kOBCITestSignalConnectToPulse1xSlow   = '-';
const kOBCITestSignalConnectToPulse2xFast   = ']';
const kOBCITestSignalConnectToPulse2xSlow   = '[';

/** Channel Setting Commands */
const kOBCIChannelCmdADCNormal      = '0';
const kOBCIChannelCmdADCShorted     = '1';
const kOBCIChannelCmdADCBiasDRP     = '6';
const kOBCIChannelCmdADCBiasDRN     = '7';
const kOBCIChannelCmdADCBiasMethod  = '2';
const kOBCIChannelCmdADCMVDD        = '3';
const kOBCIChannelCmdADCTemp        = '4';
const kOBCIChannelCmdADCTestSig     = '5';
const kOBCIChannelCmdBiasInclude    = '1';
const kOBCIChannelCmdBiasRemove     = '0';
const kOBCIChannelCmdChannel_1      = '1';
const kOBCIChannelCmdChannel_2      = '2';
const kOBCIChannelCmdChannel_3      = '3';
const kOBCIChannelCmdChannel_4      = '4';
const kOBCIChannelCmdChannel_5      = '5';
const kOBCIChannelCmdChannel_6      = '6';
const kOBCIChannelCmdChannel_7      = '7';
const kOBCIChannelCmdChannel_8      = '8';
const kOBCIChannelCmdChannel_9      = 'Q';
const kOBCIChannelCmdChannel_10     = 'W';
const kOBCIChannelCmdChannel_11     = 'E';
const kOBCIChannelCmdChannel_12     = 'R';
const kOBCIChannelCmdChannel_13     = 'T';
const kOBCIChannelCmdChannel_14     = 'Y';
const kOBCIChannelCmdChannel_15     = 'U';
const kOBCIChannelCmdChannel_16     = 'I';
const kOBCIChannelCmdGain_1         = '0';
const kOBCIChannelCmdGain_2         = '1';
const kOBCIChannelCmdGain_4         = '2';
const kOBCIChannelCmdGain_6         = '3';
const kOBCIChannelCmdGain_8         = '4';
const kOBCIChannelCmdGain_12        = '5';
const kOBCIChannelCmdGain_24        = '6';
const kOBCIChannelCmdLatch          = 'X';
const kOBCIChannelCmdPowerOff       = '1';
const kOBCIChannelCmdPowerOn        = '0';
const kOBCIChannelCmdSet            = 'x';
const kOBCIChannelCmdSRB1Connect    = '1';
const kOBCIChannelCmdSRB1Diconnect  = '0';
const kOBCIChannelCmdSRB2Connect    = '1';
const kOBCIChannelCmdSRB2Diconnect  = '0';

/** Channel Setting Helper Strings */
const kOBCIStringADCNormal      = 'normal';
const kOBCIStringADCShorted     = 'shorted';
const kOBCIStringADCBiasMethod  = 'biasMethod';
const kOBCIStringADCMvdd        = 'mvdd';
const kOBCIStringADCTemp        = 'temp';
const kOBCIStringADCTestSig     = 'testSig';
const kOBCIStringADCBiasDrp     = 'biasDrp';
const kOBCIStringADCBiasDrn     = 'biasDrn';

/** Default Channel Settings */
const kOBCIChannelDefaultAllSet = 'd';
const kOBCIChannelDefaultAllGet = 'D';

/** LeadOff Impedance Commands */
const kOBCIChannelImpedanceLatch                = 'Z';
const kOBCIChannelImpedanceSet                  = 'z';
const kOBCIChannelImpedanceTestSignalApplied    = '1';
const kOBCIChannelImpedanceTestSignalAppliedNot = '0';

/** SD card Commands */
const kOBCISDLogForHour1    = 'G';
const kOBCISDLogForHour2    = 'H';
const kOBCISDLogForHour4    = 'J';
const kOBCISDLogForHour12   = 'K';
const kOBCISDLogForHour24   = 'L';
const kOBCISDLogForMin5     = 'A';
const kOBCISDLogForMin15    = 'S';
const kOBCISDLogForMin30    = 'F';
const kOBCISDLogForSec14    = 'a';
const kOBCISDLogStop        = 'j';

/** Stream Data Commands */
const kOBCIStreamStart  = 'b';
const kOBCIStreamStop   = 's';

/** Miscellaneous */
const kOBCIMiscQueryRegisterSettings            = '?';
const kOBCIMiscQueryRegisterSettingsChannel1    = 'CH1SET';
const kOBCIMiscQueryRegisterSettingsChannel2    = 'CH2SET';
const kOBCIMiscQueryRegisterSettingsChannel3    = 'CH3SET';
const kOBCIMiscQueryRegisterSettingsChannel4    = 'CH4SET';
const kOBCIMiscQueryRegisterSettingsChannel5    = 'CH5SET';
const kOBCIMiscQueryRegisterSettingsChannel6    = 'CH6SET';
const kOBCIMiscQueryRegisterSettingsChannel7    = 'CH7SET';
const kOBCIMiscQueryRegisterSettingsChannel8    = 'CH8SET';
const kOBCIMiscSoftReset                        = 'v';

/** 16 Channel Commands */
const kOBCIChannelMaxNumber8    = 'c';
const kOBCIChannelMaxNumber16   = 'C';

/** 60Hz line filter */
const kOBCIFilterDisable ='g';
const kOBCIFilterEnable = 'f';

/** Triggers */
const kOBCITrigger = '`';

/** Possible number of channels */
const kOBCINumberOfChannelsDaisy = 16;
const kOBCINumberOfChannelsDefault = 8;
const kOBCINumberOfChannelsGanglion = 4;

/** Possible Sample Rates*/
const kOBCISampleRate125 = 125;
const kOBCISampleRate250 = 250;

/** Packet Size */
const kOBCIPacketSize = 33;

/** Notable Bytes */
const kOBCIByteStart = 0xA0;
const kOBCIByteStop = 0xC0;

/** Errors */
const kErrorInvalidByteLength = "Invalid Packet Byte Length";
const kErrorInvalidByteStart = "Invalid Start Byte";
const kErrorInvalidByteStop = "Invalid Stop Byte";
const kErrorUndefinedOrNullInput = "Undefined or Null Input";

/** Max Master Buffer Size */
const kOBCIMasterBufferSize = kOBCIPacketSize * 100;

/** Impedance Calculation Variables */
const kOBCILeadOffDriveInAmps = 0.000000006;

/** Command send delay */
const kOBCIWriteIntervalDelayMS = 10;

module.exports = {
    /** Turning channels off */
    OBCIChannelOff_1:kOBCIChannelOff_1,
    OBCIChannelOff_2:kOBCIChannelOff_2,
    OBCIChannelOff_3:kOBCIChannelOff_3,
    OBCIChannelOff_4:kOBCIChannelOff_4,
    OBCIChannelOff_5:kOBCIChannelOff_5,
    OBCIChannelOff_6:kOBCIChannelOff_6,
    OBCIChannelOff_7:kOBCIChannelOff_7,
    OBCIChannelOff_8:kOBCIChannelOff_8,
    OBCIChannelOff_9:kOBCIChannelOff_9,
    OBCIChannelOff_10:kOBCIChannelOff_10,
    OBCIChannelOff_11:kOBCIChannelOff_11,
    OBCIChannelOff_12:kOBCIChannelOff_12,
    OBCIChannelOff_13:kOBCIChannelOff_13,
    OBCIChannelOff_14:kOBCIChannelOff_14,
    OBCIChannelOff_15:kOBCIChannelOff_15,
    OBCIChannelOff_16:kOBCIChannelOff_16,
    /**
     * Purpose: To get the proper command to turn a channel off
     * @param channelNumber - A number (1-16) of the desired channel
     * @returns {Promise}
     */
    commandChannelOff: function(channelNumber) {
        return new Promise(function(resolve,reject) {
            switch (channelNumber) {
                case 1:
                    resolve(kOBCIChannelOff_1);
                    break;
                case 2:
                    resolve(kOBCIChannelOff_2);
                    break;
                case 3:
                    resolve(kOBCIChannelOff_3);
                    break;
                case 4:
                    resolve(kOBCIChannelOff_4);
                    break;
                case 5:
                    resolve(kOBCIChannelOff_5);
                    break;
                case 6:
                    resolve(kOBCIChannelOff_6);
                    break;
                case 7:
                    resolve(kOBCIChannelOff_7);
                    break;
                case 8:
                    resolve(kOBCIChannelOff_8);
                    break;
                case 9:
                    resolve(kOBCIChannelOff_9);
                    break;
                case 10:
                    resolve(kOBCIChannelOff_10);
                    break;
                case 11:
                    resolve(kOBCIChannelOff_11);
                    break;
                case 12:
                    resolve(kOBCIChannelOff_12);
                    break;
                case 13:
                    resolve(kOBCIChannelOff_13);
                    break;
                case 14:
                    resolve(kOBCIChannelOff_14);
                    break;
                case 15:
                    resolve(kOBCIChannelOff_15);
                    break;
                case 16:
                    resolve(kOBCIChannelOff_16);
                    break;
                default:
                    reject('Error [commandChannelOff]: Invalid Channel Number');
                    break;
            }
        });
    },
    /** Turning channels on */
    OBCIChannelOn_1:kOBCIChannelOn_1,
    OBCIChannelOn_2:kOBCIChannelOn_2,
    OBCIChannelOn_3:kOBCIChannelOn_3,
    OBCIChannelOn_4:kOBCIChannelOn_4,
    OBCIChannelOn_5:kOBCIChannelOn_5,
    OBCIChannelOn_6:kOBCIChannelOn_6,
    OBCIChannelOn_7:kOBCIChannelOn_7,
    OBCIChannelOn_8:kOBCIChannelOn_8,
    OBCIChannelOn_9:kOBCIChannelOn_9,
    OBCIChannelOn_10:kOBCIChannelOn_10,
    OBCIChannelOn_11:kOBCIChannelOn_11,
    OBCIChannelOn_12:kOBCIChannelOn_12,
    OBCIChannelOn_13:kOBCIChannelOn_13,
    OBCIChannelOn_14:kOBCIChannelOn_14,
    OBCIChannelOn_15:kOBCIChannelOn_15,
    OBCIChannelOn_16:kOBCIChannelOn_16,
    commandChannelOn: function(channelNumber) {
        return new Promise(function(resolve,reject) {
            switch (channelNumber) {
                case 1:
                    resolve(kOBCIChannelOn_1);
                    break;
                case 2:
                    resolve(kOBCIChannelOn_2);
                    break;
                case 3:
                    resolve(kOBCIChannelOn_3);
                    break;
                case 4:
                    resolve(kOBCIChannelOn_4);
                    break;
                case 5:
                    resolve(kOBCIChannelOn_5);
                    break;
                case 6:
                    resolve(kOBCIChannelOn_6);
                    break;
                case 7:
                    resolve(kOBCIChannelOn_7);
                    break;
                case 8:
                    resolve(kOBCIChannelOn_8);
                    break;
                case 9:
                    resolve(kOBCIChannelOn_9);
                    break;
                case 10:
                    resolve(kOBCIChannelOn_10);
                    break;
                case 11:
                    resolve(kOBCIChannelOn_11);
                    break;
                case 12:
                    resolve(kOBCIChannelOn_12);
                    break;
                case 13:
                    resolve(kOBCIChannelOn_13);
                    break;
                case 14:
                    resolve(kOBCIChannelOn_14);
                    break;
                case 15:
                    resolve(kOBCIChannelOn_15);
                    break;
                case 16:
                    resolve(kOBCIChannelOn_16);
                    break;
                default:
                    reject('Error [commandChannelOn]: Invalid Channel Number');
                    break;
            }
        });
    },
    /** Test Signal Control Commands */
    OBCITestSignalConnectToDC:kOBCITestSignalConnectToDC,
    OBCITestSignalConnectToGround:kOBCITestSignalConnectToGround,
    OBCITestSignalConnectToPulse1xFast:kOBCITestSignalConnectToPulse1xFast,
    OBCITestSignalConnectToPulse1xSlow:kOBCITestSignalConnectToPulse1xSlow,
    OBCITestSignalConnectToPulse2xFast:kOBCITestSignalConnectToPulse2xFast,
    OBCITestSignalConnectToPulse2xSlow:kOBCITestSignalConnectToPulse2xSlow,
    /** Channel Setting Commands */
    OBCIChannelCmdADCNormal:kOBCIChannelCmdADCNormal,
    OBCIChannelCmdADCShorted:kOBCIChannelCmdADCShorted,
    OBCIChannelCmdADCBiasDRP:kOBCIChannelCmdADCBiasDRP,
    OBCIChannelCmdADCBiasDRN:kOBCIChannelCmdADCBiasDRN,
    OBCIChannelCmdADCBiasMethod:kOBCIChannelCmdADCBiasMethod,
    OBCIChannelCmdADCMVDD:kOBCIChannelCmdADCMVDD,
    OBCIChannelCmdADCTemp:kOBCIChannelCmdADCTemp,
    OBCIChannelCmdADCTestSig:kOBCIChannelCmdADCTestSig,
    OBCIChannelCmdBiasInclude:kOBCIChannelCmdBiasInclude,
    OBCIChannelCmdBiasRemove:kOBCIChannelCmdBiasRemove,
    OBCIChannelCmdChannel_1:kOBCIChannelCmdChannel_1,
    OBCIChannelCmdChannel_2:kOBCIChannelCmdChannel_2,
    OBCIChannelCmdChannel_3:kOBCIChannelCmdChannel_3,
    OBCIChannelCmdChannel_4:kOBCIChannelCmdChannel_4,
    OBCIChannelCmdChannel_5:kOBCIChannelCmdChannel_5,
    OBCIChannelCmdChannel_6:kOBCIChannelCmdChannel_6,
    OBCIChannelCmdChannel_7:kOBCIChannelCmdChannel_7,
    OBCIChannelCmdChannel_8:kOBCIChannelCmdChannel_8,
    OBCIChannelCmdChannel_9:kOBCIChannelCmdChannel_9,
    OBCIChannelCmdChannel_10:kOBCIChannelCmdChannel_10,
    OBCIChannelCmdChannel_11:kOBCIChannelCmdChannel_11,
    OBCIChannelCmdChannel_12:kOBCIChannelCmdChannel_12,
    OBCIChannelCmdChannel_13:kOBCIChannelCmdChannel_13,
    OBCIChannelCmdChannel_14:kOBCIChannelCmdChannel_14,
    OBCIChannelCmdChannel_15:kOBCIChannelCmdChannel_15,
    OBCIChannelCmdChannel_16:kOBCIChannelCmdChannel_16,
    commandChannelForCmd:commandChannelForCmd,
    OBCIChannelCmdGain_1:kOBCIChannelCmdGain_1,
    OBCIChannelCmdGain_2:kOBCIChannelCmdGain_2,
    OBCIChannelCmdGain_4:kOBCIChannelCmdGain_4,
    OBCIChannelCmdGain_6:kOBCIChannelCmdGain_6,
    OBCIChannelCmdGain_8:kOBCIChannelCmdGain_8,
    OBCIChannelCmdGain_12:kOBCIChannelCmdGain_12,
    OBCIChannelCmdGain_24:kOBCIChannelCmdGain_24,
    commandForGain:commandForGain,
    OBCIChannelCmdLatch:kOBCIChannelCmdLatch,
    OBCIChannelCmdPowerOff:kOBCIChannelCmdPowerOff,
    OBCIChannelCmdPowerOn:kOBCIChannelCmdPowerOn,
    OBCIChannelCmdSet:kOBCIChannelCmdSet,
    OBCIChannelCmdSRB1Connect:kOBCIChannelCmdSRB1Connect,
    OBCIChannelCmdSRB1Diconnect:kOBCIChannelCmdSRB1Diconnect,
    OBCIChannelCmdSRB2Connect:kOBCIChannelCmdSRB2Connect,
    OBCIChannelCmdSRB2Diconnect:kOBCIChannelCmdSRB2Diconnect,
    /** Channel Setting Helper Strings */
    OBCIStringADCNormal:kOBCIStringADCNormal,
    OBCIStringADCShorted:kOBCIStringADCShorted,
    OBCIStringADCBiasMethod:kOBCIStringADCBiasMethod,
    OBCIStringADCMvdd:kOBCIStringADCMvdd,
    OBCIStringADCTemp:kOBCIStringADCTemp,
    OBCIStringADCTestSig:kOBCIStringADCTestSig,
    OBCIStringADCBiasDrp:kOBCIStringADCBiasDrp,
    OBCIStringADCBiasDrn:kOBCIStringADCBiasDrn,
    /**
     * Purpose: To convert a string like 'normal' to the correct command (i.e. '1')
     * @param adcString
     * @returns {Promise}
     * Author: AJ Keller (@pushtheworldllc)
     */
    commandForADCString:commandForADCString,
    /** Default Channel Settings */
    OBCIChannelDefaultAllSet:kOBCIChannelDefaultAllSet,
    OBCIChannelDefaultAllGet:kOBCIChannelDefaultAllGet,
    /** LeadOff Impedance Commands */
    OBCIChannelImpedanceLatch:kOBCIChannelImpedanceLatch,
    OBCIChannelImpedanceSet:kOBCIChannelImpedanceSet,
    OBCIChannelImpedanceTestSignalApplied:kOBCIChannelImpedanceTestSignalApplied,
    OBCIChannelImpedanceTestSignalAppliedNot:kOBCIChannelImpedanceTestSignalAppliedNot,
    /** SD card Commands */
    OBCISDLogForHour1:kOBCISDLogForHour1,
    OBCISDLogForHour2:kOBCISDLogForHour2,
    OBCISDLogForHour4:kOBCISDLogForHour4,
    OBCISDLogForHour12:kOBCISDLogForHour12,
    OBCISDLogForHour24:kOBCISDLogForHour24,
    OBCISDLogForMin5:kOBCISDLogForMin5,
    OBCISDLogForMin15:kOBCISDLogForMin15,
    OBCISDLogForMin30:kOBCISDLogForMin30,
    OBCISDLogForSec14:kOBCISDLogForSec14,
    OBCISDLogStop:kOBCISDLogStop,
    /** Stream Data Commands */
    OBCIStreamStart:kOBCIStreamStart,
    OBCIStreamStop:kOBCIStreamStop,
    /** Miscellaneous */
    OBCIMiscQueryRegisterSettings:kOBCIMiscQueryRegisterSettings,
    OBCIMiscQueryRegisterSettingsChannel1:kOBCIMiscQueryRegisterSettingsChannel1,
    OBCIMiscQueryRegisterSettingsChannel2:kOBCIMiscQueryRegisterSettingsChannel2,
    OBCIMiscQueryRegisterSettingsChannel3:kOBCIMiscQueryRegisterSettingsChannel3,
    OBCIMiscQueryRegisterSettingsChannel4:kOBCIMiscQueryRegisterSettingsChannel4,
    OBCIMiscQueryRegisterSettingsChannel5:kOBCIMiscQueryRegisterSettingsChannel5,
    OBCIMiscQueryRegisterSettingsChannel6:kOBCIMiscQueryRegisterSettingsChannel6,
    OBCIMiscQueryRegisterSettingsChannel7:kOBCIMiscQueryRegisterSettingsChannel7,
    OBCIMiscQueryRegisterSettingsChannel8:kOBCIMiscQueryRegisterSettingsChannel8,
    channelSettingsKeyForChannel: function(channelNumber) {
        return new Promise(function(resolve,reject) {
            switch (channelNumber) {
                case 1:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel1));
                    break;
                case 2:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel2));
                    break;
                case 3:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel3));
                    break;
                case 4:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel4));
                    break;
                case 5:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel5));
                    break;
                case 6:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel6));
                    break;
                case 7:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel7));
                    break;
                case 8:
                    resolve(new Buffer(kOBCIMiscQueryRegisterSettingsChannel8));
                    break;
                default:
                    reject('Invalid channel number');
                    break;
            }
        });
    },
    OBCIMiscSoftReset:kOBCIMiscSoftReset,
    /** 16 Channel Commands */
    OBCIChannelMaxNumber8:kOBCIChannelMaxNumber8,
    OBCIChannelMaxNumber16:kOBCIChannelMaxNumber16,
    /** Filters */
    OBCIFilterDisable:kOBCIFilterDisable,
    OBCIFilterEnable:kOBCIFilterEnable,
    /** Triggers */
    OBCITrigger:kOBCITrigger,
    /** Possible number of channels */
    OBCINumberOfChannelsDaisy:kOBCINumberOfChannelsDaisy,
    OBCINumberOfChannelsDefault:kOBCINumberOfChannelsDefault,
    OBCINumberOfChannelsGanglion:kOBCINumberOfChannelsGanglion,
    /** Possible Sample Rates */
    OBCISampleRate125:kOBCISampleRate125,
    OBCISampleRate250:kOBCISampleRate250,
    /** Packet Size */
    OBCIPacketSize:kOBCIPacketSize,
    /** Notable Bytes */
    OBCIByteStart:kOBCIByteStart,
    OBCIByteStop:kOBCIByteStop,
    /** Errors */
    ErrorInvalidByteLength:kErrorInvalidByteLength,
    ErrorInvalidByteStart:kErrorInvalidByteStart,
    ErrorInvalidByteStop:kErrorInvalidByteStop,
    ErrorUndefinedOrNullInput:kErrorUndefinedOrNullInput,
    /** Max Master Buffer Size */
    OBCIMasterBufferSize:kOBCIMasterBufferSize,
    /** Impedance Calculation Variables */
    OBCILeadOffDriveInAmps:kOBCILeadOffDriveInAmps,
    /** Channel Setter Maker */
    getChannelSetter:channelSetter,
    /** Impedance Setter Maker */
    getImpedanceSetter:impedanceSetter,
    /** Command send delay */
    OBCIWriteIntervalDelayMS:kOBCIWriteIntervalDelayMS
};

/**
 * Purpose: To add a usability abstraction layer above channel setting commands. Due to the
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
        if (!isString(inputTdype)) reject('inputType must be of type \'string\' ');
        if (!isBoolean(bias)) reject('bias must be of type \'boolean\' ');
        if (!isBoolean(srb2)) reject('srb1 must be of type \'boolean\' ');
        if (!isBoolean(srb1)) reject('srb2 must be of type \'boolean\' ');

        // Set Channel Number
        var p1 = commandChannelForCmd(channelNumber);

        // Set POWER_DOWN
        cmdPowerDown = powerDown ? kOBCIChannelCmdPowerOff : kOBCIChannelCmdPowerOn;

        // Set Gain
        var p2 = commandForGain(gain);

        // Set ADC string
        var p3 = commandForADCString(inputType);

        // Set BIAS
        cmdBias = bias ? kOBCIChannelCmdBiasInclude : kOBCIChannelCmdBiasRemove;

        // Set SRB2
        cmdSrb2 = srb2 ? kOBCIChannelCmdSRB2Connect : kOBCIChannelCmdSRB2Diconnect;

        // Set SRB1
        cmdSrb1 = srb1 ? kOBCIChannelCmdSRB1Connect : kOBCIChannelCmdSRB1Diconnect;

        Promise.all([p1,p2,p3]).then(function(values) {
            var outputArray = [
                kOBCIChannelCmdSet,
                values[0],
                cmdPowerDown,
                values[1],
                values[2],
                cmdBias,
                cmdSrb2,
                cmdSrb1,
                kOBCIChannelCmdLatch
            ];
            //console.log(outputArray);
            resolve(outputArray);
        });
    });
}

/**
 * Purpose: To build the array of commands to send to the board to measure impedance
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

        // Set nInputApplied
        cmdNInputApplied = nInputApplied ? kOBCIChannelImpedanceTestSignalApplied : kOBCIChannelImpedanceTestSignalAppliedNot;

        // Set pInputApplied
        cmdPInputApplied = pInputApplied ? kOBCIChannelImpedanceTestSignalApplied : kOBCIChannelImpedanceTestSignalAppliedNot;

        // Set Channel Number
        commandChannelForCmd(channelNumber).then(command => {
            var outputArray = [
                kOBCIChannelImpedanceSet,
                command,
                cmdNInputApplied,
                cmdPInputApplied,
                kOBCIChannelImpedanceLatch
            ];
            //console.log(outputArray);
            resolve(outputArray);
        });
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
            case kOBCIStringADCNormal:
                resolve(kOBCIChannelCmdADCNormal);
                break;
            case kOBCIStringADCShorted:
                resolve(kOBCIChannelCmdADCShorted);
                break;
            case kOBCIStringADCBiasMethod:
                resolve(kOBCIChannelCmdADCBiasMethod);
                break;
            case kOBCIStringADCMvdd:
                resolve(kOBCIChannelCmdADCMVDD);
                break;
            case kOBCIStringADCTemp:
                resolve(kOBCIChannelCmdADCTemp);
                break;
            case kOBCIStringADCTestSig:
                resolve(kOBCIChannelCmdADCTestSig);
                break;
            case kOBCIStringADCBiasDrp:
                resolve(kOBCIChannelCmdADCBiasDRP);
                break;
            case kOBCIStringADCBiasDrn:
                resolve(kOBCIChannelCmdADCBiasDRN);
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
                resolve(kOBCIChannelCmdGain_1);
                break;
            case 2:
                resolve(kOBCIChannelCmdGain_2);
                break;
            case 4:
                resolve(kOBCIChannelCmdGain_4);
                break;
            case 6:
                resolve(kOBCIChannelCmdGain_6);
                break;
            case 8:
                resolve(kOBCIChannelCmdGain_8);
                break;
            case 12:
                resolve(kOBCIChannelCmdGain_12);
                break;
            case 24:
                resolve(kOBCIChannelCmdGain_24);
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
                resolve(kOBCIChannelCmdChannel_1);
                break;
            case 2:
                resolve(kOBCIChannelCmdChannel_2);
                break;
            case 3:
                resolve(kOBCIChannelCmdChannel_3);
                break;
            case 4:
                resolve(kOBCIChannelCmdChannel_4);
                break;
            case 5:
                resolve(kOBCIChannelCmdChannel_5);
                break;
            case 6:
                resolve(kOBCIChannelCmdChannel_6);
                break;
            case 7:
                resolve(kOBCIChannelCmdChannel_7);
                break;
            case 8:
                resolve(kOBCIChannelCmdChannel_8);
                break;
            case 9:
                resolve(kOBCIChannelCmdChannel_9);
                break;
            case 10:
                resolve(kOBCIChannelCmdChannel_10);
                break;
            case 11:
                resolve(kOBCIChannelCmdChannel_11);
                break;
            case 12:
                resolve(kOBCIChannelCmdChannel_12);
                break;
            case 13:
                resolve(kOBCIChannelCmdChannel_13);
                break;
            case 14:
                resolve(kOBCIChannelCmdChannel_14);
                break;
            case 15:
                resolve(kOBCIChannelCmdChannel_15);
                break;
            case 16:
                resolve(kOBCIChannelCmdChannel_16);
                break;
            default:
                reject('Invalid channel number');
                break;
        }
    });
}