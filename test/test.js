/**
 * Created by ajk on 12/15/15.
 */
var assert = require('assert');

var OpenBCISampleFile = require('../OpenBCISample');
var interpret24bitAsInt32 = OpenBCISampleFile.interpret24bitAsInt32;

describe('interpret24bitAsInt32',function() {
    it('should return the buffer as number', function() {
        var buf = new Buffer('\x00\x00\x01');
        assert.equal(1,interpret24bitAsInt32(buf));
    })
});

