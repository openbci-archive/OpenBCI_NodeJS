'use strict';
var bluebirdChecks = require('./bluebirdChecks');
var sinon = require('sinon'); // eslint-disable-line no-unused-vars
var chai = require('chai');
var expect = chai.expect;
var should = chai.should(); // eslint-disable-line no-unused-vars
var OpenBCICyton = require('../openBCICyton');
var k = require('openbci-utilities').Constants;
var chaiAsPromised = require('chai-as-promised');
var sinonChai = require('sinon-chai');

chai.use(chaiAsPromised);
chai.use(sinonChai);

describe('openbci-radios', function () {
  this.timeout(2000);
  var ourBoard, masterPortName;

  before(function (done) {
    ourBoard = new OpenBCICyton();
    ourBoard.autoFindOpenBCIBoard()
      .then(portName => {
        ourBoard = null;
        masterPortName = portName;
        done();
      })
      .catch(() => {
        ourBoard = null;
        masterPortName = k.OBCISimulatorPortName;
        done();
      });
  });
  after(done => {
    if (ourBoard) {
      if (ourBoard['connected']) {
        ourBoard.disconnect()
          .then(() => {
            done();
          })
          .catch(err => {
            done(err);
          });
      } else {
        done();
      }
    } else {
      done();
    }
  });

  describe('#radioChannelSet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());

    it('should not change the channel number if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.radioChannelGet().should.be.rejected.and.notify(done);
    });

    it('should reject if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioChannelSet(1).then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should reject if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet(1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should reject if a number is not sent as input', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet('1').should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if no channel number is presented as arg', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if the requested new channel number is lower than 0', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet(-1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if the requested new channel number is higher than 25', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet(26).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should not change the channel if the board is not communicating with the host', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorBoardFailure: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet(1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should change the channel if connected, not steaming, and using firmware version 2+', function (done) {
      var newChannelNumber = 2;
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSet(newChannelNumber).then(channelNumber => {
              expect(channelNumber).to.be.equal(newChannelNumber);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioChannelSetHostOverride', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());
    it('should not change the channel number if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.radioChannelSetHostOverride().should.be.rejected.and.notify(done);
    });
    it('should reject if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioChannelSetHostOverride(1).then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should reject if a number is not sent as input', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSetHostOverride('1').should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should reject if no channel number is presented as arg', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSetHostOverride().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should reject if the requested new channel number is lower than 0', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSetHostOverride(-1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should reject if the requested new channel number is higher than 25', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSetHostOverride(26).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should change the channel if connected, not steaming, and using firmware version 2+', function (done) {
      var newChannelNumber = 2;
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelSetHostOverride(newChannelNumber).then(channelNumber => {
              expect(channelNumber).to.be.equal(newChannelNumber);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioChannelGet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());

    it('should not query if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioChannelGet().should.be.rejected.and.notify(done);
    });
    it('should not query if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioChannelGet().then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should not query if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelGet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should query if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelGet().then(res => {
              expect(res.channelNumber).to.be.within(k.OBCIRadioChannelMin, k.OBCIRadioChannelMax);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should get message even if the board is not communicating with dongle', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorBoardFailure: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioChannelGet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioPollTimeSet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());
    it('should not change the channel number if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.radioPollTimeSet().should.be.rejected.and.notify(done);
    });

    it('should reject if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioPollTimeSet(1).then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });

    it('should reject if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet(1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if a number is not sent as input', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet('1').should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if no poll time is presented as arg', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if the requested new poll time is lower than 0', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet(-1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should reject if the requested new poll time is higher than 255', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet(256).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should not change the poll time if the board is not communicating with the host', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorBoardFailure: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet(1).should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });

    it('should change the poll time if connected, not steaming, and using firmware version 2+', function (done) {
      var newPollTime = 69;
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeSet(newPollTime).then(() => {
              done();
            }).catch(err => {
              done(err);
            });
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioPollTimeGet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());

    it('should not query if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioPollTimeGet().should.be.rejected.and.notify(done);
    });
    it('should not query if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioPollTimeGet().then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should not query if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeGet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should query if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeGet().then(pollTime => {
              expect(pollTime).to.be.greaterThan(0);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should get failure message if the board is not communicating with dongle', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorBoardFailure: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioPollTimeGet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioBaudRateSet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());

    it('should not try to set baud rate if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioBaudRateSet('default').should.be.rejected.and.notify(done);
    });
    it('should reject if no input', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioBaudRateSet().should.be.rejected.and.notify(done);
    });
    it('should be rejected if input type incorrect', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioBaudRateSet(1).should.be.rejected.and.notify(done);
    });
    it('should not try to change the baud rate if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioBaudRateSet('default').then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should not try to change the baud rate if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioBaudRateSet('default').should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should set the baud rate to default if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioBaudRateSet('default').then(baudrate => {
              expect(baudrate).to.be.equal(115200);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should set the baud rate to fast if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioBaudRateSet('fast').then(baudrate => {
              expect(baudrate).to.be.equal(230400);
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioSystemStatusGet', function () {
    afterEach(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        }).catch(() => done);
      } else {
        done();
      }
    });
    afterEach(() => bluebirdChecks.noPendingPromises());

    it('should not get system status if not connected', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.radioSystemStatusGet().should.be.rejected.and.notify(done);
    });
    it('should not get system status if streaming', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.streamStart()
              .then(() => {
                ourBoard.radioSystemStatusGet().then(() => {
                  done('should have rejected');
                }).catch(() => {
                  done(); // Test pass
                });
              }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should not get system status if not firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioSystemStatusGet().should.be.rejected.and.notify(done);
          });
        }).catch(err => done(err));
    });
    it('should get up system status if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2'
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioSystemStatusGet().then(isUp => {
              expect(isUp).to.be.true;
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
    it('should get down system status if firmware version 2', function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulate: true,
        simulatorFirmwareVersion: 'v2',
        simulatorBoardFailure: true
      });
      ourBoard.connect(k.OBCISimulatorPortName)
        .then(() => {
          ourBoard.once('ready', () => {
            ourBoard.radioSystemStatusGet().then(isUp => {
              expect(isUp).to.be.false;
              done();
            }).catch(err => done(err));
          });
        }).catch(err => done(err));
    });
  });

  describe('#radioTests', function () {
    this.timeout(0);
    before(function (done) {
      ourBoard = new OpenBCICyton({
        verbose: true,
        simulatorFirmwareVersion: 'v2',
        simulatorFragmentation: k.OBCISimulatorFragmentationRandom
      });
      ourBoard.connect(masterPortName).catch(err => done(err));

      ourBoard.once('ready', () => {
        done();
      });
    });
    after(function (done) {
      if (ourBoard.isConnected()) {
        ourBoard.disconnect().then(() => {
          done();
        });
      } else {
        done();
      }
    });
    after(() => bluebirdChecks.noPendingPromises());
    it('should be able to get the channel number', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      // The channel number should be between 0 and 25. Those are hard limits.
      ourBoard.radioChannelGet().then(res => {
        expect(res.channelNumber).to.be.within(0, 25);
        done();
      }).catch(err => done(err));
    });
    it('should be able to set the channel to 1', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioChannelSet(1).then(channelNumber => {
        expect(channelNumber).to.equal(1);
        done();
      }).catch(err => done(err));
    });
    it('should be able to set the channel to 2', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioChannelSet(2).then(channelNumber => {
        expect(channelNumber).to.equal(2);
        done();
      }).catch(err => done(err));
    });
    it('should be able to set the channel to 25', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioChannelSet(25).then(channelNumber => {
        expect(channelNumber).to.equal(25);
        done();
      }).catch(err => done(err));
    });
    it('should be able to set the channel to 5', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioChannelSet(5).then(channelNumber => {
        expect(channelNumber).to.equal(5);
        done();
      }).catch(err => done(err));
    });
    it('should be able to override host channel number, verify system is down, set the host back and verify system is up', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      var systemChanNumber = 0;
      var newChanNum = 0;
      // var timey = Date.now()
      // Get the current system channel
      ourBoard.radioChannelGet()
        .then(res => {
          // Store it
          systemChanNumber = res.channelNumber;
          // console.log(`system channel number: ${res.channelNumber}`)
          if (systemChanNumber === 25) {
            newChanNum = 24;
          } else {
            newChanNum = systemChanNumber + 1;
          }
          // Call to change just the host
          return ourBoard.radioChannelSetHostOverride(newChanNum);
        })
        .then(newChanNumActual => {
          expect(newChanNumActual).to.equal(newChanNum);
          // timey = Date.now()
          // console.log(`new chan ${newChanNumActual} got`, timey, '0ms')
          return new Promise((resolve, reject) => {
            setTimeout(function () {
              // console.log(`get status`, Date.now(), `${Date.now() - timey}ms`)
              ourBoard.radioSystemStatusGet().then(isUp => {
                // console.log('resolving', Date.now(), `${Date.now() - timey}ms`)
                resolve(isUp);
              })
                .catch(err => {
                  reject(err);
                });
            }, 270); // Should be accurate after 270 seconds
          });
        })
        .then(isUp => {
          // console.log(`isUp test`, Date.now(), `${Date.now() - timey}ms`)
          expect(isUp).to.be.false;
          return ourBoard.radioChannelSetHostOverride(systemChanNumber); // Set back to good
        })
        .then(newChanNumActual => {
          // Verify we set it back to normal
          expect(newChanNumActual).to.equal(systemChanNumber);
          return ourBoard.radioSystemStatusGet();
        })
        .then(isUp => {
          expect(isUp).to.be.true;
          done();
        })
        .catch(err => done(err));
    });
    it('should be able to get the poll time', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioPollTimeGet().should.eventually.be.greaterThan(0).and.notify(done);
    });
    it('should be able to set the poll time', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioPollTimeSet(80).should.become(80).and.notify(done);
    });
    it('should be able to change to default baud rate', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioBaudRateSet('default').should.become(115200).and.notify(done);
    });
    it('should be able to change to fast baud rate', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioBaudRateSet('fast').then(newBaudRate => {
        expect(newBaudRate).to.equal(230400);
        return ourBoard.radioBaudRateSet('default');
      }).then(() => {
        done();
      }).catch(err => done(err));
    });
    it('should be able to set the system status', function (done) {
      // Don't test if not using v2
      if (!ourBoard.usingVersionTwoFirmware()) return done();
      ourBoard.radioSystemStatusGet().then(isUp => {
        expect(isUp).to.be.true;
        done();
      }).catch(err => done(err));
    });
  });
});
