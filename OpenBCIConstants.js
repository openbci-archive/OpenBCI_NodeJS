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

module.exports = {
    /** Turning channels off */
    kOBCIChannelOff_1:kOBCIChannelOff_1,
    kOBCIChannelOff_2:kOBCIChannelOff_2,
    kOBCIChannelOff_3:kOBCIChannelOff_3,
    kOBCIChannelOff_4:kOBCIChannelOff_4,
    kOBCIChannelOff_5:kOBCIChannelOff_5,
    kOBCIChannelOff_6:kOBCIChannelOff_6,
    kOBCIChannelOff_7:kOBCIChannelOff_7,
    kOBCIChannelOff_8:kOBCIChannelOff_8,
    kOBCIChannelOff_9:kOBCIChannelOff_9,
    kOBCIChannelOff_10:kOBCIChannelOff_10,
    kOBCIChannelOff_11:kOBCIChannelOff_11,
    kOBCIChannelOff_12:kOBCIChannelOff_12,
    kOBCIChannelOff_13:kOBCIChannelOff_13,
    kOBCIChannelOff_14:kOBCIChannelOff_14,
    kOBCIChannelOff_15:kOBCIChannelOff_15,
    kOBCIChannelOff_16:kOBCIChannelOff_16,
    /** Turning channels on */
    kOBCIChannelOn_1:kOBCIChannelOn_1,
    kOBCIChannelOn_2:kOBCIChannelOn_2,
    kOBCIChannelOn_3:kOBCIChannelOn_3,
    kOBCIChannelOn_4:kOBCIChannelOn_4,
    kOBCIChannelOn_5:kOBCIChannelOn_5,
    kOBCIChannelOn_6:kOBCIChannelOn_6,
    kOBCIChannelOn_7:kOBCIChannelOn_7,
    kOBCIChannelOn_8:kOBCIChannelOn_8,
    kOBCIChannelOn_9:kOBCIChannelOn_9,
    kOBCIChannelOn_10:kOBCIChannelOn_10,
    kOBCIChannelOn_11:kOBCIChannelOn_11,
    kOBCIChannelOn_12:kOBCIChannelOn_12,
    kOBCIChannelOn_13:kOBCIChannelOn_13,
    kOBCIChannelOn_14:kOBCIChannelOn_14,
    kOBCIChannelOn_15:kOBCIChannelOn_15,
    kOBCIChannelOn_16:kOBCIChannelOn_16,
    /** Test Signal Control Commands */
    kOBCITestSignalConnectToDC:kOBCITestSignalConnectToDC,
    kOBCITestSignalConnectToGround:kOBCITestSignalConnectToGround,
    kOBCITestSignalConnectToPulse1xFast:kOBCITestSignalConnectToPulse1xFast,
    kOBCITestSignalConnectToPulse1xSlow:kOBCITestSignalConnectToPulse1xSlow,
    kOBCITestSignalConnectToPulse2xFast:kOBCITestSignalConnectToPulse2xFast,
    kOBCITestSignalConnectToPulse2xSlow:kOBCITestSignalConnectToPulse2xSlow,
    /** Channel Setting Commands */
    kOBCIChannelCmdADCNormal:kOBCIChannelCmdADCNormal,
    kOBCIChannelCmdADCShorted:kOBCIChannelCmdADCShorted,
    kOBCIChannelCmdADCBiasDRP:kOBCIChannelCmdADCBiasDRP,
    kOBCIChannelCmdADCBiasDRN:kOBCIChannelCmdADCBiasDRN,
    kOBCIChannelCmdADCBiasMethod:kOBCIChannelCmdADCBiasMethod,
    kOBCIChannelCmdADCMVDD:kOBCIChannelCmdADCMVDD,
    kOBCIChannelCmdADCTemp:kOBCIChannelCmdADCTemp,
    kOBCIChannelCmdADCTestSig:kOBCIChannelCmdADCTestSig,
    kOBCIChannelCmdBiasInclude:kOBCIChannelCmdBiasInclude,
    kOBCIChannelCmdBiasRemove:kOBCIChannelCmdBiasRemove,
    kOBCIChannelCmdGain_1:kOBCIChannelCmdGain_1,
    kOBCIChannelCmdGain_2:kOBCIChannelCmdGain_2,
    kOBCIChannelCmdGain_4:kOBCIChannelCmdGain_4,
    kOBCIChannelCmdGain_6:kOBCIChannelCmdGain_6,
    kOBCIChannelCmdGain_8:kOBCIChannelCmdGain_8,
    kOBCIChannelCmdGain_12:kOBCIChannelCmdGain_12,
    kOBCIChannelCmdGain_24:kOBCIChannelCmdGain_24,
    kOBCIChannelCmdLatch:kOBCIChannelCmdLatch,
    kOBCIChannelCmdPowerOff:kOBCIChannelCmdPowerOff,
    kOBCIChannelCmdPowerOn:kOBCIChannelCmdPowerOn,
    kOBCIChannelCmdSet:kOBCIChannelCmdSet,
    kOBCIChannelCmdSRB1Connect:kOBCIChannelCmdSRB1Connect,
    kOBCIChannelCmdSRB1Diconnect:kOBCIChannelCmdSRB1Diconnect,
    kOBCIChannelCmdSRB2Connect:kOBCIChannelCmdSRB2Connect,
    kOBCIChannelCmdSRB2Diconnect:kOBCIChannelCmdSRB2Diconnect,
    /** Default Channel Settings */
    kOBCIChannelDefaultAllSet:kOBCIChannelDefaultAllSet,
    kOBCIChannelDefaultAllGet:kOBCIChannelDefaultAllGet,
    /** LeadOff Impedance Commands */
    kOBCIChannelImpedanceLatch:kOBCIChannelImpedanceLatch,
    kOBCIChannelImpedanceSet:kOBCIChannelImpedanceSet,
    kOBCIChannelImpedanceTestSignalApplied:kOBCIChannelImpedanceTestSignalApplied,
    kOBCIChannelImpedanceTestSignalAppliedNot:kOBCIChannelImpedanceTestSignalAppliedNot,
    /** SD card Commands */
    kOBCISDLogForHour1:kOBCISDLogForHour1,
    kOBCISDLogForHour2:kOBCISDLogForHour2,
    kOBCISDLogForHour4:kOBCISDLogForHour4,
    kOBCISDLogForHour12:kOBCISDLogForHour12,
    kOBCISDLogForHour24:kOBCISDLogForHour24,
    kOBCISDLogForMin5:kOBCISDLogForMin5,
    kOBCISDLogForMin15:kOBCISDLogForMin15,
    kOBCISDLogForMin30:kOBCISDLogForMin30,
    kOBCISDLogForSec14:kOBCISDLogForSec14,
    kOBCISDLogStop:kOBCISDLogStop,
    /** Stream Data Commands */
    kOBCIStreamStart:kOBCIStreamStart,
    kOBCIStreamStop:kOBCIStreamStop,
    /** Miscellaneous */
    kOBCIMiscQueryRegisterSettings:kOBCIMiscQueryRegisterSettings,
    kOBCIMiscSoftReset:kOBCIMiscSoftReset,
    /** 16 Channel Commands */
    kOBCIChannelMaxNumber8:kOBCIChannelMaxNumber8,
    kOBCIChannelMaxNumber16:kOBCIChannelMaxNumber16
}