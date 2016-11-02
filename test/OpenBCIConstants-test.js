/**
* Created by ajk on 12/16/15.
*/
'use strict';
var bluebirdChecks = require('./bluebirdChecks');
var assert = require('assert');
var k = require('../openBCIConstants');
var chai = require('chai');
var expect = chai.expect;
var should = chai.should(); // eslint-disable-line no-unused-vars
var chaiAsPromised = require('chai-as-promised');
chai.use(chaiAsPromised);

describe('OpenBCIConstants', function () {
  afterEach(() => bluebirdChecks.noPendingPromises());
  describe('Turning Channels Off', function () {
    it('channel 1', function () {
      assert.equal('1', k.OBCIChannelOff1);
    });
    it('channel 2', function () {
      assert.equal('2', k.OBCIChannelOff2);
    });
    it('channel 3', function () {
      assert.equal('3', k.OBCIChannelOff3);
    });
    it('channel 4', function () {
      assert.equal('4', k.OBCIChannelOff4);
    });
    it('channel 5', function () {
      assert.equal('5', k.OBCIChannelOff5);
    });
    it('channel 6', function () {
      assert.equal('6', k.OBCIChannelOff6);
    });
    it('channel 7', function () {
      assert.equal('7', k.OBCIChannelOff7);
    });
    it('channel 8', function () {
      assert.equal('8', k.OBCIChannelOff8);
    });
    it('channel 9', function () {
      assert.equal('q', k.OBCIChannelOff9);
    });
    it('channel 10', function () {
      assert.equal('w', k.OBCIChannelOff10);
    });
    it('channel 11', function () {
      assert.equal('e', k.OBCIChannelOff11);
    });
    it('channel 12', function () {
      assert.equal('r', k.OBCIChannelOff12);
    });
    it('channel 13', function () {
      assert.equal('t', k.OBCIChannelOff13);
    });
    it('channel 14', function () {
      assert.equal('y', k.OBCIChannelOff14);
    });
    it('channel 15', function () {
      assert.equal('u', k.OBCIChannelOff15);
    });
    it('channel 16', function () {
      assert.equal('i', k.OBCIChannelOff16);
    });
  });
  describe('Turning Channels On', function () {
    it('channel 1', function () {
      assert.equal('!', k.OBCIChannelOn1);
    });
    it('channel 2', function () {
      assert.equal('@', k.OBCIChannelOn2);
    });
    it('channel 3', function () {
      assert.equal('#', k.OBCIChannelOn3);
    });
    it('channel 4', function () {
      assert.equal('$', k.OBCIChannelOn4);
    });
    it('channel 5', function () {
      assert.equal('%', k.OBCIChannelOn5);
    });
    it('channel 6', function () {
      assert.equal('^', k.OBCIChannelOn6);
    });
    it('channel 7', function () {
      assert.equal('&', k.OBCIChannelOn7);
    });
    it('channel 8', function () {
      assert.equal('*', k.OBCIChannelOn8);
    });
    it('channel 9', function () {
      assert.equal('Q', k.OBCIChannelOn9);
    });
    it('channel 10', function () {
      assert.equal('W', k.OBCIChannelOn10);
    });
    it('channel 11', function () {
      assert.equal('E', k.OBCIChannelOn11);
    });
    it('channel 12', function () {
      assert.equal('R', k.OBCIChannelOn12);
    });
    it('channel 13', function () {
      assert.equal('T', k.OBCIChannelOn13);
    });
    it('channel 14', function () {
      assert.equal('Y', k.OBCIChannelOn14);
    });
    it('channel 15', function () {
      assert.equal('U', k.OBCIChannelOn15);
    });
    it('channel 16', function () {
      assert.equal('I', k.OBCIChannelOn16);
    });
  });
  describe('Test Signal Control Commands', function () {
    it('Connect to DC', function () {
      assert.equal('p', k.OBCITestSignalConnectToDC);
    });
    it('Connect to Ground', function () {
      assert.equal('0', k.OBCITestSignalConnectToGround);
    });
    it('Connect to Pulse 1x Fast', function () {
      assert.equal('=', k.OBCITestSignalConnectToPulse1xFast);
    });
    it('Connect to Pulse 1x Slow', function () {
      assert.equal('-', k.OBCITestSignalConnectToPulse1xSlow);
    });
    it('Connect to Pulse 2x Fast', function () {
      assert.equal(']', k.OBCITestSignalConnectToPulse2xFast);
    });
    it('Connect to Pulse 2x Slow', function () {
      assert.equal('[', k.OBCITestSignalConnectToPulse2xSlow);
    });
  });
  describe('Channel Setting Commands', function () {
    describe('Channel Selection', function () {
      it('Channel 1', function () {
        assert.equal('1', k.OBCIChannelCmdChannel1);
      });
      it('Channel 2', function () {
        assert.equal('2', k.OBCIChannelCmdChannel2);
      });
      it('Channel 3', function () {
        assert.equal('3', k.OBCIChannelCmdChannel3);
      });
      it('Channel 4', function () {
        assert.equal('4', k.OBCIChannelCmdChannel4);
      });
      it('Channel 5', function () {
        assert.equal('5', k.OBCIChannelCmdChannel5);
      });
      it('Channel 6', function () {
        assert.equal('6', k.OBCIChannelCmdChannel6);
      });
      it('Channel 7', function () {
        assert.equal('7', k.OBCIChannelCmdChannel7);
      });
      it('Channel 8', function () {
        assert.equal('8', k.OBCIChannelCmdChannel8);
      });
      it('Channel 9', function () {
        assert.equal('Q', k.OBCIChannelCmdChannel9);
      });
      it('Channel 10', function () {
        assert.equal('W', k.OBCIChannelCmdChannel10);
      });
      it('Channel 11', function () {
        assert.equal('E', k.OBCIChannelCmdChannel11);
      });
      it('Channel 12', function () {
        assert.equal('R', k.OBCIChannelCmdChannel12);
      });
      it('Channel 13', function () {
        assert.equal('T', k.OBCIChannelCmdChannel13);
      });
      it('Channel 14', function () {
        assert.equal('Y', k.OBCIChannelCmdChannel14);
      });
      it('Channel 15', function () {
        assert.equal('U', k.OBCIChannelCmdChannel15);
      });
      it('Channel 16', function () {
        assert.equal('I', k.OBCIChannelCmdChannel16);
      });
    });
    describe('Power Down', function () {
      it('OFF', function () {
        assert.equal('1', k.OBCIChannelCmdPowerOff);
      });
      it('ON', function () {
        assert.equal('0', k.OBCIChannelCmdPowerOn);
      });
    });
    describe('Gain Setting', function () {
      it('1', function () {
        assert.equal('0', k.OBCIChannelCmdGain1);
      });
      it('2', function () {
        assert.equal('1', k.OBCIChannelCmdGain2);
      });
      it('4', function () {
        assert.equal('2', k.OBCIChannelCmdGain4);
      });
      it('6', function () {
        assert.equal('3', k.OBCIChannelCmdGain6);
      });
      it('8', function () {
        assert.equal('4', k.OBCIChannelCmdGain8);
      });
      it('12', function () {
        assert.equal('5', k.OBCIChannelCmdGain12);
      });
      it('24', function () {
        assert.equal('6', k.OBCIChannelCmdGain24);
      });
    });
    describe('ADC Channel Input Soruce', function () {
      it('Normal', function () {
        assert.equal('0', k.OBCIChannelCmdADCNormal);
      });
      it('Shorted', function () {
        assert.equal('1', k.OBCIChannelCmdADCShorted);
      });
      it('Bias Method', function () {
        assert.equal('2', k.OBCIChannelCmdADCBiasMethod);
      });
      it('MVDD', function () {
        assert.equal('3', k.OBCIChannelCmdADCMVDD);
      });
      it('Temp', function () {
        assert.equal('4', k.OBCIChannelCmdADCTemp);
      });
      it('Test Signal', function () {
        assert.equal('5', k.OBCIChannelCmdADCTestSig);
      });
      it('Bias DRP', function () {
        assert.equal('6', k.OBCIChannelCmdADCBiasDRP);
      });
      it('Bias DRN', function () {
        assert.equal('7', k.OBCIChannelCmdADCBiasDRN);
      });
    });
    describe('Bias Set', function () {
      it('Include in BIAS', function () {
        assert.equal('1', k.OBCIChannelCmdBiasInclude);
      });
      it('Remove from BIAS', function () {
        assert.equal('0', k.OBCIChannelCmdBiasRemove);
      });
    });
    describe('SRB2 Set', function () {
      it('Disconnect this input from SRB2', function () {
        assert.equal('0', k.OBCIChannelCmdSRB2Diconnect);
      });
      it('Connect this input to the SRB2', function () {
        assert.equal('1', k.OBCIChannelCmdSRB2Connect);
      });
    });
    describe('SRB1 Set', function () {
      it('Disconnect this input from SRB1', function () {
        assert.equal('0', k.OBCIChannelCmdSRB1Diconnect);
      });
      it('Connect this input to the SRB1', function () {
        assert.equal('1', k.OBCIChannelCmdSRB1Connect);
      });
    });
    it('Command to access channel settings', function () {
      assert.equal('x', k.OBCIChannelCmdSet);
    });
    it('Command to latch', function () {
      assert.equal('X', k.OBCIChannelCmdLatch);
    });
  });
  describe('Default Channel Settings', function () {
    it('Set all channels to default', function () {
      assert.equal('d', k.OBCIChannelDefaultAllSet);
    });
    it('Get a report of the default settings card', function () {
      assert.equal('D', k.OBCIChannelDefaultAllGet);
    });
  });
  describe('LeadOff Impedance Commands', function () {
    it('Command to access impedance settings', function () {
      assert.equal('z', k.OBCIChannelImpedanceSet);
    });
    it('Command to latch', function () {
      assert.equal('Z', k.OBCIChannelImpedanceLatch);
    });
    it('Test signal not applied', function () {
      assert.equal('0', k.OBCIChannelImpedanceTestSignalAppliedNot);
    });
    it('Test signal applied', function () {
      assert.equal('1', k.OBCIChannelImpedanceTestSignalApplied);
    });
  });
  describe('Time Sync Stuff', function () {
    it('Can get proper array size', function () {
      assert.equal(10, k.OBCITimeSyncArraySize);
    });
    it('Get correct time sync with conf', function () {
      assert.equal(0.9, k.OBCITimeSyncMultiplierWithSyncConf);
    });
    it('Get correct time sync without conf', function () {
      assert.equal(0.75, k.OBCITimeSyncMultiplierWithoutSyncConf);
    });
    it('Get correct time sync transmission threshold', function () {
      assert.equal(10, k.OBCITimeSyncThresholdTransFailureMS);
    });
  });
  describe('SD card Commands', function () {
    it('logs for 1 hour', function () {
      assert.equal('G', k.OBCISDLogForHour1);
    });
    it('logs for 2 hours', function () {
      assert.equal('H', k.OBCISDLogForHour2);
    });
    it('logs for 4 hours', function () {
      assert.equal('J', k.OBCISDLogForHour4);
    });
    it('logs for 12 hours', function () {
      assert.equal('K', k.OBCISDLogForHour12);
    });
    it('logs for 24 hours', function () {
      assert.equal('L', k.OBCISDLogForHour24);
    });
    it('logs for 5 minutes', function () {
      assert.equal('A', k.OBCISDLogForMin5);
    });
    it('logs for 15 minutes', function () {
      assert.equal('S', k.OBCISDLogForMin15);
    });
    it('logs for 30 minutes', function () {
      assert.equal('F', k.OBCISDLogForMin30);
    });
    it('logs for 14 seconds', function () {
      assert.equal('a', k.OBCISDLogForSec14);
    });
    it('stop logging and close the SD file', function () {
      assert.equal('j', k.OBCISDLogStop);
    });
  });
  describe('SD card string Commands', function () {
    it('logs for 1 hour', function () {
      assert.equal('1hour', k.OBCIStringSDHour1);
    });
    it('logs for 2 hours', function () {
      assert.equal('2hour', k.OBCIStringSDHour2);
    });
    it('logs for 4 hours', function () {
      assert.equal('4hour', k.OBCIStringSDHour4);
    });
    it('logs for 12 hours', function () {
      assert.equal('12hour', k.OBCIStringSDHour12);
    });
    it('logs for 24 hours', function () {
      assert.equal('24hour', k.OBCIStringSDHour24);
    });
    it('logs for 5 minutes', function () {
      assert.equal('5min', k.OBCIStringSDMin5);
    });
    it('logs for 15 minutes', function () {
      assert.equal('15min', k.OBCIStringSDMin15);
    });
    it('logs for 30 minutes', function () {
      assert.equal('30min', k.OBCIStringSDMin30);
    });
    it('logs for 14 seconds', function () {
      assert.equal('14sec', k.OBCIStringSDSec14);
    });
  });
  describe('#sdSettingForString', function () {
    it('correct command for 1 hour', function () {
      var expectation = k.OBCISDLogForHour1;
      var result = k.sdSettingForString('1hour');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 2 hour', function () {
      var expectation = k.OBCISDLogForHour2;
      var result = k.sdSettingForString('2hour');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 4 hour', function () {
      var expectation = k.OBCISDLogForHour4;
      var result = k.sdSettingForString('4hour');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 12 hour', function () {
      var expectation = k.OBCISDLogForHour12;
      var result = k.sdSettingForString('12hour');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 24 hour', function () {
      var expectation = k.OBCISDLogForHour24;
      var result = k.sdSettingForString('24hour');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 5 min', function () {
      var expectation = k.OBCISDLogForMin5;
      var result = k.sdSettingForString('5min');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 15 min', function () {
      var expectation = k.OBCISDLogForMin15;
      var result = k.sdSettingForString('15min');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 30 min', function () {
      var expectation = k.OBCISDLogForMin30;
      var result = k.sdSettingForString('30min');
      return expect(result).to.eventually.equal(expectation);
    });
    it('correct command for 14 seconds', function () {
      var expectation = k.OBCISDLogForSec14;
      var result = k.sdSettingForString('14sec');
      return expect(result).to.eventually.equal(expectation);
    });
    it('Invalid command request', function () {
      var result = k.sdSettingForString('taco');
      return expect(result).to.be.rejected;
    });
  });
  describe('Stream Data Commands', function () {
    it('starts', function () {
      assert.equal('b', k.OBCIStreamStart);
    });
    it('stops', function () {
      assert.equal('s', k.OBCIStreamStop);
    });
  });
  describe('Miscellaneous', function () {
    it('queries register settings', function () {
      assert.equal('?', k.OBCIMiscQueryRegisterSettings);
    });
    it('softly resets the board', function () {
      assert.equal('v', k.OBCIMiscSoftReset);
    });
  });
  describe('Max channel number commands', function () {
    it('sets max of 8', function () {
      assert.equal('c', k.OBCIChannelMaxNumber8);
    });
    it('sets max of 16', function () {
      assert.equal('C', k.OBCIChannelMaxNumber16);
    });
  });
  describe('On board filters', function () {
    it('disable', function () {
      assert.equal('g', k.OBCIFilterDisable);
    });
    it('enable', function () {
      assert.equal('f', k.OBCIFilterEnable);
    });
  });
  describe('Stream packet types/codes', function () {
    it('Standard with Accel', function () {
      assert.equal(0, k.OBCIStreamPacketStandardAccel);
    });
    it('Standard with Raw Aux', function () {
      assert.equal(1, k.OBCIStreamPacketStandardRawAux);
    });
    it('User Defined Packet', function () {
      assert.equal(2, k.OBCIStreamPacketUserDefinedType);
    });
    it('Time Sync Set with accel', function () {
      assert.equal(3, k.OBCIStreamPacketAccelTimeSyncSet);
    });
    it('Time Synced with Accel', function () {
      assert.equal(4, k.OBCIStreamPacketAccelTimeSynced);
    });
    it('Time Sync set with Raw Aux', function () {
      assert.equal(5, k.OBCIStreamPacketRawAuxTimeSyncSet);
    });
    it('Time Synced with Raw Aux', function () {
      assert.equal(6, k.OBCIStreamPacketRawAuxTimeSynced);
    });
  });
  describe('Time synced with accel packet', function () {
    it('X axis', function () {
      assert.equal(7, k.OBCIAccelAxisX);
    });
    it('Y axis', function () {
      assert.equal(8, k.OBCIAccelAxisY);
    });
    it('Z axis', function () {
      assert.equal(9, k.OBCIAccelAxisZ);
    });
  });
  describe('Time sync useful numbers', function () {
    it('Time from the board is 4 bytes', function () {
      assert.equal(4, k.OBCIStreamPacketTimeByteSize);
    });
  });
  describe('should return the right command for each channel', function () {
    it('Channel 1', function () {
      var expectation = '1';
      var result = k.commandChannelForCmd(1);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 2', function () {
      var expectation = '2';
      var result = k.commandChannelForCmd(2);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 3', function () {
      var expectation = '3';
      var result = k.commandChannelForCmd(3);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 4', function () {
      var expectation = '4';
      var result = k.commandChannelForCmd(4);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 5', function () {
      var expectation = '5';
      var result = k.commandChannelForCmd(5);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 6', function () {
      var expectation = '6';
      var result = k.commandChannelForCmd(6);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 7', function () {
      var expectation = '7';
      var result = k.commandChannelForCmd(7);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 8', function () {
      var expectation = '8';
      var result = k.commandChannelForCmd(8);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 9', function () {
      var expectation = 'Q';
      var result = k.commandChannelForCmd(9);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 10', function () {
      var expectation = 'W';
      var result = k.commandChannelForCmd(10);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 11', function () {
      var expectation = 'E';
      var result = k.commandChannelForCmd(11);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 12', function () {
      var expectation = 'R';
      var result = k.commandChannelForCmd(12);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 13', function () {
      var expectation = 'T';
      var result = k.commandChannelForCmd(13);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 14', function () {
      var expectation = 'Y';
      var result = k.commandChannelForCmd(14);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 15', function () {
      var expectation = 'U';
      var result = k.commandChannelForCmd(15);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 16', function () {
      var expectation = 'I';
      var result = k.commandChannelForCmd(16);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Invalid channel request', function () {
      var result = k.commandChannelForCmd(17);
      return expect(result).to.be.rejected;
    });
  });
  describe('should return correct channel off command for number', function () {
    it('Channel 1', function () {
      var expectation = '1';
      var result = k.commandChannelOff(1);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 2', function () {
      var expectation = '2';
      var result = k.commandChannelOff(2);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 3', function () {
      var expectation = '3';
      var result = k.commandChannelOff(3);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 4', function () {
      var expectation = '4';
      var result = k.commandChannelOff(4);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 5', function () {
      var expectation = '5';
      var result = k.commandChannelOff(5);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 6', function () {
      var expectation = '6';
      var result = k.commandChannelOff(6);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 7', function () {
      var expectation = '7';
      var result = k.commandChannelOff(7);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 8', function () {
      var expectation = '8';
      var result = k.commandChannelOff(8);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 9', function () {
      var expectation = 'q';
      var result = k.commandChannelOff(9);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 10', function () {
      var expectation = 'w';
      var result = k.commandChannelOff(10);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 11', function () {
      var expectation = 'e';
      var result = k.commandChannelOff(11);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 12', function () {
      var expectation = 'r';
      var result = k.commandChannelOff(12);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 13', function () {
      var expectation = 't';
      var result = k.commandChannelOff(13);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 14', function () {
      var expectation = 'y';
      var result = k.commandChannelOff(14);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 15', function () {
      var expectation = 'u';
      var result = k.commandChannelOff(15);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 16', function () {
      var expectation = 'i';
      var result = k.commandChannelOff(16);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Invalid channel request', function () {
      var result = k.commandChannelOff(17);
      return expect(result).to.be.rejected;
    });
  });
  describe('should return correct channel on command for number', function () {
    it('Channel 1', function () {
      var expectation = '!';
      var result = k.commandChannelOn(1);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 2', function () {
      var expectation = '@';
      var result = k.commandChannelOn(2);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 3', function () {
      var expectation = '#';
      var result = k.commandChannelOn(3);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 4', function () {
      var expectation = '$';
      var result = k.commandChannelOn(4);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 5', function () {
      var expectation = '%';
      var result = k.commandChannelOn(5);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 6', function () {
      var expectation = '^';
      var result = k.commandChannelOn(6);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 7', function () {
      var expectation = '&';
      var result = k.commandChannelOn(7);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 8', function () {
      var expectation = '*';
      var result = k.commandChannelOn(8);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 9', function () {
      var expectation = 'Q';
      var result = k.commandChannelOn(9);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 10', function () {
      var expectation = 'W';
      var result = k.commandChannelOn(10);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 11', function () {
      var expectation = 'E';
      var result = k.commandChannelOn(11);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 12', function () {
      var expectation = 'R';
      var result = k.commandChannelOn(12);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 13', function () {
      var expectation = 'T';
      var result = k.commandChannelOn(13);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 14', function () {
      var expectation = 'Y';
      var result = k.commandChannelOn(14);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 15', function () {
      var expectation = 'U';
      var result = k.commandChannelOn(15);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Channel 16', function () {
      var expectation = 'I';
      var result = k.commandChannelOn(16);
      return expect(result).to.eventually.equal(expectation);
    });
    it('Invalid channel request', function () {
      var result = k.commandChannelOn(17);
      return expect(result).to.be.rejected;
    });
  });
  describe('Number of channels', function () {
    it('Daisy', function () {
      assert.equal(16, k.OBCINumberOfChannelsDaisy);
    });
    it('Default', function () {
      assert.equal(8, k.OBCINumberOfChannelsDefault);
    });
    it('Ganglion', function () {
      assert.equal(4, k.OBCINumberOfChannelsGanglion);
    });
  });
  describe('Possible Sample Rates', function () {
    it('should be 125', function () {
      assert.equal(125, k.OBCISampleRate125);
    });
    it('should be 250', function () {
      assert.equal(200, k.OBCISampleRate200);
    });
    it('should be 250', function () {
      assert.equal(250, k.OBCISampleRate250);
    });
  });
  describe('Max sample number', function () {
    it('should be 255', function () {
      assert.equal(255, k.OBCISampleNumberMax);
    });
  });
  describe('Radio Channel Limits', function () {
    it('should get the right channel number max', function () {
      expect(k.OBCIRadioChannelMax).to.be.equal(25);
    });
    it('should get the right channel number min', function () {
      expect(k.OBCIRadioChannelMin).to.be.equal(1);
    });
    it('should get the right poll time max', function () {
      expect(k.OBCIRadioPollTimeMax).to.be.equal(255);
    });
    it('should get the right poll time min', function () {
      expect(k.OBCIRadioPollTimeMin).to.be.equal(0);
    });
  });
  describe('#getChannelSetter', function () {
    // 'channel 1, power on, gain 24, inputType normal, bias include, srb2 connect, srb1 dissconnect'
    describe('channel input selection works', function () {
      // this.timeout(5000)
      it('channel 2', function (done) {
        k.getChannelSetter(2, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[1].should.equal('2');
          val.newChannelSettingsObject.channelNumber.should.equal(2);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 5', function (done) {
        k.getChannelSetter(5, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[1].should.equal('5');
          val.newChannelSettingsObject.channelNumber.should.equal(5);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 9', function (done) {
        k.getChannelSetter(9, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[1].should.equal('Q');
          val.newChannelSettingsObject.channelNumber.should.equal(9);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 15', function (done) {
        k.getChannelSetter(15, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[1].should.equal('U');
          val.newChannelSettingsObject.channelNumber.should.equal(15);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid channel selection', function (done) {
        k.getChannelSetter(0, false, 24, 'normal', true, true, false).should.be.rejected.and.notify(done);
      });
      it('Invalid type', function (done) {
        k.getChannelSetter('0', false, 24, 'normal', true, true, false).should.be.rejected.and.notify(done);
      });
    });
    describe('power selection works', function () {
      it('on', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[2].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('off', function (done) {
        k.getChannelSetter(1, true, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[2].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(true);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, 'taco', 24, 'normal', true, true, false).should.be.rejected.and.notify(done);
      });
    });
    describe('gain selection works', function () {
      it('1x', function (done) {
        k.getChannelSetter(1, false, 1, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(1);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('2x', function (done) {
        k.getChannelSetter(1, false, 2, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(2);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('4x', function (done) {
        k.getChannelSetter(1, false, 4, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('2');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(4);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('6x', function (done) {
        k.getChannelSetter(1, false, 6, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('3');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(6);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('8x', function (done) {
        k.getChannelSetter(1, false, 8, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('4');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(8);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('12x', function (done) {
        k.getChannelSetter(1, false, 12, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('5');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(12);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('24x', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[3].should.equal('6');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, false, '24', 'normal', true, true, false).should.be.rejected.and.notify(done);
      });
      it('Invalid gain setting', function (done) {
        k.getChannelSetter(1, false, 5, 'normal', true, true, false).should.be.rejected.and.notify(done);
      });
    });
    describe('input type', function () {
      it('normal', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('shorted', function (done) {
        k.getChannelSetter(1, false, 24, 'shorted', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('shorted');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('biasMethod', function (done) {
        k.getChannelSetter(1, false, 24, 'biasMethod', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('2');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('biasMethod');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('mvdd', function (done) {
        k.getChannelSetter(1, false, 24, 'mvdd', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('3');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('mvdd');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('temp', function (done) {
        k.getChannelSetter(1, false, 24, 'temp', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('4');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('temp');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('testsig', function (done) {
        k.getChannelSetter(1, false, 24, 'testSig', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('5');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('testSig');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('biasDrp', function (done) {
        k.getChannelSetter(1, false, 24, 'biasDrp', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('6');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('biasDrp');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('biasDrn', function (done) {
        k.getChannelSetter(1, false, 24, 'biasDrn', true, true, false).then(function (val) {
          val.commandArray[4].should.equal('7');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('biasDrn');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid setting', function (done) {
        k.getChannelSetter(1, false, 24, 'taco', true, true, false).should.be.rejected.and.notify(done);
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, false, 24, 1, true, true, false).should.be.rejected.and.notify(done);
      });
    });
    describe('bias selection works', function () {
      it('Include', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[5].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Remove', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', false, true, false).then(function (val) {
          val.commandArray[5].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(false);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', 'taco', true, false).should.be.rejected.and.notify(done);
      });
    });
    describe('SRB2 selection works', function () {
      it('Connect', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[6].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Disconnect', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, false, false).then(function (val) {
          val.commandArray[6].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(false);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, 'taco', false).should.be.rejected.and.notify(done);
      });
    });
    describe('SRB1 selection works', function () {
      it('Connect', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, true).then(function (val) {
          val.commandArray[7].should.equal('1');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(true);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Disconnect', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, false).then(function (val) {
          val.commandArray[7].should.equal('0');
          val.newChannelSettingsObject.channelNumber.should.equal(1);
          val.newChannelSettingsObject.powerDown.should.equal(false);
          val.newChannelSettingsObject.gain.should.equal(24);
          val.newChannelSettingsObject.inputType.should.equal('normal');
          val.newChannelSettingsObject.bias.should.equal(true);
          val.newChannelSettingsObject.srb2.should.equal(true);
          val.newChannelSettingsObject.srb1.should.equal(false);
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getChannelSetter(1, false, 24, 'normal', true, true, 'taco').should.be.rejected.and.notify(done);
      });
    });
  });
  describe('#getTestSignalCommand', function () {
    it('ground', function () {
      var expectation = '0';
      var result = k.getTestSignalCommand('ground');
      return expect(result).to.eventually.equal(expectation);
    });
    it('dc', function () {
      var expectation = 'p';
      var result = k.getTestSignalCommand('dc');
      return expect(result).to.eventually.equal(expectation);
    });
    it('Pulse 1x Fast', function () {
      var expectation = '=';
      var result = k.getTestSignalCommand('pulse1xFast');
      return expect(result).to.eventually.equal(expectation);
    });
    it('Pulse 1x Slow', function () {
      var expectation = '-';
      var result = k.getTestSignalCommand('pulse1xSlow');
      return expect(result).to.eventually.equal(expectation);
    });
    it('Pulse 2x Fast', function () {
      var expectation = ']';
      var result = k.getTestSignalCommand('pulse2xFast');
      return expect(result).to.eventually.equal(expectation);
    });
    it('Pulse 2x Slow', function () {
      var expectation = '[';
      var result = k.getTestSignalCommand('pulse2xSlow');
      return expect(result).to.eventually.equal(expectation);
    });
    it('none', function () {
      var expectation = 'd';
      var result = k.getTestSignalCommand('none');
      return expect(result).to.eventually.equal(expectation);
    });
  });
  describe('#getVersionNumber', function () {
    it('should get the major version number from a github standard version string', () => {
      var expectedVersion = 6;
      var inputStringVersion = 'v6.0.0';

      expect(k.getVersionNumber(inputStringVersion)).to.equal(expectedVersion);
    });
  });
  describe('#getImpedanceSetter', function () {
    describe('channel input selection works', function () {
      it('channel 2', function (done) {
        k.getImpedanceSetter(2, false, false).then(function (arrayOfCommands) {
          arrayOfCommands[1].should.equal('2');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 5', function (done) {
        k.getImpedanceSetter(5, false, false).then(function (arrayOfCommands) {
          arrayOfCommands[1].should.equal('5');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 9', function (done) {
        k.getImpedanceSetter(9, false, false).then(function (arrayOfCommands) {
          arrayOfCommands[1].should.equal('Q');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('channel 15', function (done) {
        k.getImpedanceSetter(15, false, false).then(function (arrayOfCommands) {
          arrayOfCommands[1].should.equal('U');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid channel selection', function (done) {
        k.getImpedanceSetter(0, false, false).should.be.rejected.and.notify(done);
      });
      it('Invalid type', function (done) {
        k.getImpedanceSetter('1', false, false).should.be.rejected.and.notify(done);
      });
    });
    describe('P Input selection works', function () {
      it('Test Signal Applied', function (done) {
        k.getImpedanceSetter(1, true, false).then(function (arrayOfCommands) {
          arrayOfCommands[2].should.equal('1');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Test Signal Not Applied', function (done) {
        k.getImpedanceSetter(1, false, false).then(function (arrayOfCommands) {
          console.log('\n\n\narray: ' + arrayOfCommands + '\n\n\n');
          arrayOfCommands[2].should.equal('0');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getImpedanceSetter(1, 'taco', false).should.be.rejected.and.notify(done);
      });
    });
    describe('N Input selection works', function () {
      it('Test Signal Applied', function (done) {
        k.getImpedanceSetter(1, false, true).then(function (arrayOfCommands) {
          arrayOfCommands[3].should.equal('1');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Test Signal Not Applied', function (done) {
        k.getImpedanceSetter(1, false, false).then(function (arrayOfCommands) {
          arrayOfCommands[3].should.equal('0');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Invalid type', function (done) {
        k.getImpedanceSetter(1, false, 'taco').should.be.rejected.and.notify(done);
      });
    });
    describe('Prefix and postfix commands work', function () {
      it('Set', function (done) {
        k.getImpedanceSetter(1, true, true).then(function (arrayOfCommands) {
          arrayOfCommands[0].should.equal('z');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
      it('Latch', function (done) {
        k.getImpedanceSetter(1, true, true).then(function (arrayOfCommands) {
          arrayOfCommands[4].should.equal('Z');
          done();
        }).catch(function (err) {
          done(err);
        });
      });
    });
  });
  describe('fun funcs', function () {
    describe('#isNumber', function () {
      it('should return true for object of named type', function () {
        expect(k.isNumber(1)).to.equal(true);
      });
      it('should return false for not of named type', function () {
        expect(k.isNumber('taco')).to.equal(false);
      });
    });
    describe('#isBoolean', function () {
      it('should return true for object of named type', function () {
        expect(k.isBoolean(true)).to.equal(true);
      });
      it('should return false for not of named type', function () {
        expect(k.isBoolean('taco')).to.equal(false);
      });
    });
    describe('#isString', function () {
      it('should return true for object of named type', function () {
        expect(k.isString('taco')).to.equal(true);
      });
      it('should return false for not of named type', function () {
        expect(k.isString(1)).to.equal(false);
      });
    });
    describe('#isUndefined', function () {
      it('should return true for object of named type', function () {
        expect(k.isUndefined()).to.equal(true);
      });
      it('should return false for not of named type', function () {
        expect(k.isUndefined('im here')).to.equal(false);
      });
    });
    describe('#isNull', function () {
      it('should return true for object of named type', function () {
        expect(k.isNull(null)).to.equal(true);
      });
      it('should return false for not of named type', function () {
        expect(k.isNull()).to.equal(false);
      });
      it('should return false for not of named type', function () {
        expect(k.isNull('taco')).to.equal(false);
      });
    });
  });
  describe('Emitters', function () {
    it('Event Emitter Close', function () {
      assert.equal('close', k.OBCIEmitterClose);
    });
    it('Event Emitter Dropped Packet', function () {
      assert.equal('droppedPacket', k.OBCIEmitterDroppedPacket);
    });
    it('Event Emitter Error', function () {
      assert.equal('error', k.OBCIEmitterError);
    });
    it('Event Emitter Impedance Array', function () {
      assert.equal('impedanceArray', k.OBCIEmitterImpedanceArray);
    });
    it('Event Emitter Message', function () {
      assert.equal('message', k.OBCIEmitterMessage);
    });
    it('Event Emitter Query', function () {
      assert.equal('query', k.OBCIEmitterQuery);
    });
    it('Event Emitter Raw Data Packet', function () {
      assert.equal('rawDataPacket', k.OBCIEmitterRawDataPacket);
    });
    it('Event Emitter Ready', function () {
      assert.equal('ready', k.OBCIEmitterReady);
    });
    it('Event Emitter Sample', function () {
      assert.equal('sample', k.OBCIEmitterSample);
    });
  });
});
