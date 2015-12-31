/**
 * Created by ajk on 12/16/15.
 * Purpose: This file folds all the constants for the
 *     OpenBCI Board
 */

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
const kOBCIMiscQueryRegisterSettings    = '?';
const kOBCIMiscSoftReset                = 'v';

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
    commandChannelOff: function(channelNumber,callback) {
        switch (channelNumber) {
            case 1:
                return kOBCIChannelOff_1;
            case 2:
                return kOBCIChannelOff_2;
            case 3:
                return kOBCIChannelOff_3;
            case 4:
                return kOBCIChannelOff_4;
            case 5:
                return kOBCIChannelOff_5;
            case 6:
                return kOBCIChannelOff_6;
            case 7:
                return kOBCIChannelOff_7;
            case 8:
                return kOBCIChannelOff_8;
            case 9:
                return kOBCIChannelOff_9;
            case 10:
                return kOBCIChannelOff_10;
            case 11:
                return kOBCIChannelOff_11;
            case 12:
                return kOBCIChannelOff_12;
            case 13:
                return kOBCIChannelOff_13;
            case 14:
                return kOBCIChannelOff_14;
            case 15:
                return kOBCIChannelOff_15;
            case 16:
                return kOBCIChannelOff_16;
            default:
                if(callback) {
                    callback('Error [commandChannelOff]: Invalid Channel Number')
                }
                return;
        }
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
    commandChannelOn: function(channelNumber,callback) {
        switch (channelNumber) {
            case 1:
                return kOBCIChannelOn_1;
            case 2:
                return kOBCIChannelOn_2;
            case 3:
                return kOBCIChannelOn_3;
            case 4:
                return kOBCIChannelOn_4;
            case 5:
                return kOBCIChannelOn_5;
            case 6:
                return kOBCIChannelOn_6;
            case 7:
                return kOBCIChannelOn_7;
            case 8:
                return kOBCIChannelOn_8;
            case 9:
                return kOBCIChannelOn_9;
            case 10:
                return kOBCIChannelOn_10;
            case 11:
                return kOBCIChannelOn_11;
            case 12:
                return kOBCIChannelOn_12;
            case 13:
                return kOBCIChannelOn_13;
            case 14:
                return kOBCIChannelOn_14;
            case 15:
                return kOBCIChannelOn_15;
            case 16:
                return kOBCIChannelOn_16;
            default:
                if(callback) {
                    callback('Error [commandChannelOn]: Invalid Channel Number')
                }
                return;
        }
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
    commandChannelForCmd: function(channelNumber,callback) {
        switch (channelNumber) {
            case 1:
                return kOBCIChannelCmdChannel_1;
            case 2:
                return kOBCIChannelCmdChannel_2;
            case 3:
                return kOBCIChannelCmdChannel_3;
            case 4:
                return kOBCIChannelCmdChannel_4;
            case 5:
                return kOBCIChannelCmdChannel_5;
            case 6:
                return kOBCIChannelCmdChannel_6;
            case 7:
                return kOBCIChannelCmdChannel_7;
            case 8:
                return kOBCIChannelCmdChannel_8;
            case 9:
                return kOBCIChannelCmdChannel_9;
            case 10:
                return kOBCIChannelCmdChannel_10;
            case 11:
                return kOBCIChannelCmdChannel_11;
            case 12:
                return kOBCIChannelCmdChannel_12;
            case 13:
                return kOBCIChannelCmdChannel_13;
            case 14:
                return kOBCIChannelCmdChannel_14;
            case 15:
                return kOBCIChannelCmdChannel_15;
            case 16:
                return kOBCIChannelCmdChannel_16;
            default:
                if(callback) {
                    callback('Error [commandChannelOn]: Invalid Channel Number')
                }
                return;
        }
    },
    OBCIChannelCmdGain_1:kOBCIChannelCmdGain_1,
    OBCIChannelCmdGain_2:kOBCIChannelCmdGain_2,
    OBCIChannelCmdGain_4:kOBCIChannelCmdGain_4,
    OBCIChannelCmdGain_6:kOBCIChannelCmdGain_6,
    OBCIChannelCmdGain_8:kOBCIChannelCmdGain_8,
    OBCIChannelCmdGain_12:kOBCIChannelCmdGain_12,
    OBCIChannelCmdGain_24:kOBCIChannelCmdGain_24,
    OBCIChannelCmdLatch:kOBCIChannelCmdLatch,
    OBCIChannelCmdPowerOff:kOBCIChannelCmdPowerOff,
    OBCIChannelCmdPowerOn:kOBCIChannelCmdPowerOn,
    OBCIChannelCmdSet:kOBCIChannelCmdSet,
    OBCIChannelCmdSRB1Connect:kOBCIChannelCmdSRB1Connect,
    OBCIChannelCmdSRB1Diconnect:kOBCIChannelCmdSRB1Diconnect,
    OBCIChannelCmdSRB2Connect:kOBCIChannelCmdSRB2Connect,
    OBCIChannelCmdSRB2Diconnect:kOBCIChannelCmdSRB2Diconnect,
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
    OBCIMasterBufferSize:kOBCIMasterBufferSize
};