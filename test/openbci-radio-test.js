/**
 * Created by ajk on 3/22/16.
 */
var sinon = require('sinon');
var chai = require('chai'),
    should = chai.should(),
    expect = chai.expect,
    openBCIBoard = require('../openBCIBoard'),
    OpenBCISample = openBCIBoard.OpenBCISample,
    k = OpenBCISample.k;

var chaiAsPromised = require("chai-as-promised");
var sinonChai = require("sinon-chai");
chai.use(chaiAsPromised);
chai.use(sinonChai);

xdescribe('#host',function() {
    this.timeout(5000);
    var ourBoard, devicePortName;

    devicePortName = '/dev/tty.usbserial-DB00JAKZ';


    it('can connect to the device', function(done) {
        ourBoard = new openBCIBoard.OpenBCIBoard({
            verbose: true
        });

        ourBoard.connect(devicePortName).then(() => {
            ourBoard.on('ready',function() {
                done();
            });
        })
    });
});