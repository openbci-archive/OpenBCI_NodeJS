/**
 * Created by ajk on 12/16/15.
 */
var assert = require('assert');
var k = require('../OpenBCIConstants');

describe('OpenBCIConstants', function() {
    describe('Turning Channels Off', function() {
        it('channel 1', function () {
            assert.equal('1', k.kOBCIChannelOff_1);
        });
        it('channel 2', function () {
            assert.equal('2', k.kOBCIChannelOff_2);
        });
        it('channel 3', function () {
            assert.equal('3', k.kOBCIChannelOff_3);
        });
        it('channel 4', function () {
            assert.equal('4', k.kOBCIChannelOff_4);
        });
        it('channel 5', function () {
            assert.equal('5', k.kOBCIChannelOff_5);
        });
        it('channel 6', function () {
            assert.equal('6', k.kOBCIChannelOff_6);
        });
        it('channel 7', function () {
            assert.equal('7', k.kOBCIChannelOff_7);
        });
        it('channel 8', function () {
            assert.equal('8', k.kOBCIChannelOff_8);
        });
        it('channel 9', function () {
            assert.equal('q', k.kOBCIChannelOff_9);
        });
        it('channel 10', function () {
            assert.equal('w', k.kOBCIChannelOff_10);
        });
        it('channel 11', function () {
            assert.equal('e', k.kOBCIChannelOff_11);
        });
        it('channel 12', function () {
            assert.equal('r', k.kOBCIChannelOff_12);
        });
        it('channel 13', function () {
            assert.equal('t', k.kOBCIChannelOff_13);
        });
        it('channel 14', function () {
            assert.equal('y', k.kOBCIChannelOff_14);
        });
        it('channel 15', function () {
            assert.equal('u', k.kOBCIChannelOff_15);
        });
        it('channel 16', function () {
            assert.equal('i', k.kOBCIChannelOff_16);
        });
    });
    describe('Turning Channels On', function() {
        it('channel 1', function () {
            assert.equal('!', k.kOBCIChannelOn_1);
        });
        it('channel 2', function () {
            assert.equal('@', k.kOBCIChannelOn_2);
        });
        it('channel 3', function () {
            assert.equal('#', k.kOBCIChannelOn_3);
        });
        it('channel 4', function () {
            assert.equal('$', k.kOBCIChannelOn_4);
        });
        it('channel 5', function () {
            assert.equal('%', k.kOBCIChannelOn_5);
        });
        it('channel 6', function () {
            assert.equal('^', k.kOBCIChannelOn_6);
        });
        it('channel 7', function () {
            assert.equal('&', k.kOBCIChannelOn_7);
        });
        it('channel 8', function () {
            assert.equal('*', k.kOBCIChannelOn_8);
        });
        it('channel 9', function () {
            assert.equal('Q', k.kOBCIChannelOn_9);
        });
        it('channel 10', function () {
            assert.equal('W', k.kOBCIChannelOn_10);
        });
        it('channel 11', function () {
            assert.equal('E', k.kOBCIChannelOn_11);
        });
        it('channel 12', function () {
            assert.equal('R', k.kOBCIChannelOn_12);
        });
        it('channel 13', function () {
            assert.equal('T', k.kOBCIChannelOn_13);
        });
        it('channel 14', function () {
            assert.equal('Y', k.kOBCIChannelOn_14);
        });
        it('channel 15', function () {
            assert.equal('U', k.kOBCIChannelOn_15);
        });
        it('channel 16', function () {
            assert.equal('I', k.kOBCIChannelOn_16);
        });
    });
    describe('Test Signal Control Commands', function() {
        it('Connect to DC', function() {
            assert.equal('p', k.kOBCITestSignalConnectToDC);
        });
        it('Connect to Ground', function() {
            assert.equal('0', k.kOBCITestSignalConnectToGround);
        });
        it('Connect to Pulse 1x Fast', function() {
            assert.equal('=', k.kOBCITestSignalConnectToPulse1xFast);
        });
        it('Connect to Pulse 1x Slow', function() {
            assert.equal('-', k.kOBCITestSignalConnectToPulse1xSlow);
        });
        it('Connect to Pulse 2x Fast', function() {
            assert.equal(']', k.kOBCITestSignalConnectToPulse2xFast);
        });
        it('Connect to Pulse 2x Slow', function() {
            assert.equal('[', k.kOBCITestSignalConnectToPulse2xSlow);
        });
    });
    describe('Channel Setting Commands', function() {
        describe('Channel Selection', function () {
            it('Channel 1', function() {
                assert.equal('1', k.kOBCIChannelCmdChannel_1);
            });
            it('Channel 2', function() {
                assert.equal('2', k.kOBCIChannelCmdChannel_2);
            });
            it('Channel 3', function() {
                assert.equal('3', k.kOBCIChannelCmdChannel_3);
            });
            it('Channel 4', function() {
                assert.equal('4', k.kOBCIChannelCmdChannel_4);
            });
            it('Channel 5', function() {
                assert.equal('5', k.kOBCIChannelCmdChannel_5);
            });
            it('Channel 6', function() {
                assert.equal('6', k.kOBCIChannelCmdChannel_6);
            });
            it('Channel 7', function() {
                assert.equal('7', k.kOBCIChannelCmdChannel_7);
            });
            it('Channel 8', function() {
                assert.equal('8', k.kOBCIChannelCmdChannel_8);
            });
            it('Channel 9', function() {
                assert.equal('Q', k.kOBCIChannelCmdChannel_9);
            });
            it('Channel 10', function() {
                assert.equal('W', k.kOBCIChannelCmdChannel_10);
            });
            it('Channel 11', function() {
                assert.equal('E', k.kOBCIChannelCmdChannel_11);
            });
            it('Channel 12', function() {
                assert.equal('R', k.kOBCIChannelCmdChannel_12);
            });
            it('Channel 13', function() {
                assert.equal('T', k.kOBCIChannelCmdChannel_13);
            });
            it('Channel 14', function() {
                assert.equal('Y', k.kOBCIChannelCmdChannel_14);
            });
            it('Channel 15', function() {
                assert.equal('U', k.kOBCIChannelCmdChannel_15);
            });
            it('Channel 16', function() {
                assert.equal('I', k.kOBCIChannelCmdChannel_16);
            });
        });
        describe('Power Down', function() {
            it('OFF', function() {
                assert.equal('1', k.kOBCIChannelCmdPowerOff);
            });
            it('ON', function() {
                assert.equal('0', k.kOBCIChannelCmdPowerOn);
            });
        });
        describe('Gain Setting', function () {
            it('1', function () {
                assert.equal('0', k.kOBCIChannelCmdGain_1);
            });
            it('2', function () {
                assert.equal('1', k.kOBCIChannelCmdGain_2);
            });
            it('4', function () {
                assert.equal('2', k.kOBCIChannelCmdGain_4);
            });
            it('6', function () {
                assert.equal('3', k.kOBCIChannelCmdGain_6);
            });
            it('8', function () {
                assert.equal('4', k.kOBCIChannelCmdGain_8);
            });
            it('12', function () {
                assert.equal('5', k.kOBCIChannelCmdGain_12);
            });
            it('24', function () {
                assert.equal('6', k.kOBCIChannelCmdGain_24);
            });
        });
        describe('ADC Channel Input Soruce', function () {
            it('Normal', function() {
                assert.equal('0', k.kOBCIChannelCmdADCNormal);
            });
            it('Shorted', function() {
                assert.equal('1', k.kOBCIChannelCmdADCShorted);
            });
            it('Bias Method', function() {
                assert.equal('2', k.kOBCIChannelCmdADCBiasMethod);
            });
            it('MVDD', function() {
                assert.equal('3', k.kOBCIChannelCmdADCMVDD);
            });
            it('Temp', function() {
                assert.equal('4', k.kOBCIChannelCmdADCTemp);
            });
            it('Test Signal', function() {
                assert.equal('5', k.kOBCIChannelCmdADCTestSig);
            });
            it('Bias DRP', function() {
                assert.equal('6', k.kOBCIChannelCmdADCBiasDRP);
            });
            it('Bias DRN', function() {
                assert.equal('7', k.kOBCIChannelCmdADCBiasDRN);
            });
        });
        describe('Bias Set', function() {
            it('Include in BIAS', function() {
                assert.equal('1', k.kOBCIChannelCmdBiasInclude);
            });
            it('Remove from BIAS', function() {
                assert.equal('0', k.kOBCIChannelCmdBiasRemove);
            });
        });
        describe('SRB2 Set', function() {
            it('Disconnect this input from SRB2', function() {
                assert.equal('0', k.kOBCIChannelCmdSRB2Diconnect);
            });
            it('Connect this input to the SRB2', function() {
                assert.equal('1', k.kOBCIChannelCmdSRB2Connect);
            });
        });
        describe('SRB1 Set', function() {
            it('Disconnect this input from SRB1', function() {
                assert.equal('0', k.kOBCIChannelCmdSRB1Diconnect);
            });
            it('Connect this input to the SRB1', function() {
                assert.equal('1', k.kOBCIChannelCmdSRB1Connect);
            });
        });
        it('Command to access channel settings',function() {
            assert.equal('x', k.kOBCIChannelCmdSet);
        });
        it('Command to latch',function() {
            assert.equal('X', k.kOBCIChannelCmdLatch);
        });
    });
    describe('Default Channel Settings',function() {
        it('Set all channels to default',function() {
            assert.equal('d', k.kOBCIChannelDefaultAllSet);
        });
        it('Get a report of the default settings card',function() {
            assert.equal('D', k.kOBCIChannelDefaultAllGet);
        });
    });
    describe('LeadOff Impedance Commands',function() {
        it('Command to access impedance settings',function() {
            assert.equal('z', k.kOBCIChannelImpedanceSet);
        });
        it('Command to latch',function() {
            assert.equal('Z', k.kOBCIChannelImpedanceLatch);
        });
        it('Test signal not applied',function() {
            assert.equal('0', k.kOBCIChannelImpedanceTestSignalAppliedNot);
        });
        it('Test signal applied',function() {
            assert.equal('1', k.kOBCIChannelImpedanceTestSignalApplied);
        });
    });
    describe('SD card Commands',function() {
        it('logs for 1 hour', function() {
            assert.equal('G', k.kOBCISDLogForHour1);
        });
        it('logs for 2 hours', function() {
            assert.equal('H', k.kOBCISDLogForHour2);
        });
        it('logs for 4 hours', function() {
            assert.equal('J', k.kOBCISDLogForHour4);
        });
        it('logs for 12 hours', function() {
            assert.equal('K', k.kOBCISDLogForHour12);
        });
        it('logs for 24 hours', function() {
            assert.equal('L', k.kOBCISDLogForHour24);
        });
        it('logs for 5 minutes', function() {
            assert.equal('A', k.kOBCISDLogForMin5);
        });
        it('logs for 15 minutes', function() {
            assert.equal('S', k.kOBCISDLogForMin15);
        });
        it('logs for 30 minutes', function() {
            assert.equal('F', k.kOBCISDLogForMin30);
        });
        it('logs for 14 seconds', function() {
            assert.equal('a', k.kOBCISDLogForSec14);
        });
        it('stop logging and close the SD file', function() {
            assert.equal('j', k.kOBCISDLogStop);
        });
    });
    describe('Stream Data Commands',function() {
        it('starts',function () {
            assert.equal('b', k.kOBCIStreamStart);
        });
        it('stops',function () {
            assert.equal('s', k.kOBCIStreamStop);
        });
    });
    describe('Miscellaneous',function() {
        it('queries register settings',function () {
            assert.equal('?', k.kOBCIMiscQueryRegisterSettings);
        });
        it('softly resets the board',function () {
            assert.equal('v', k.kOBCIMiscSoftReset);
        });
    });
    describe('Max channel number commands',function() {
        it('sets max of 8',function () {
            assert.equal('c', k.kOBCIChannelMaxNumber8);
        });
        it('sets max of 16',function () {
            assert.equal('C', k.kOBCIChannelMaxNumber16);
        });
    });
});