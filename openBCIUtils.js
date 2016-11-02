module.exports = {
  debugBytes
};

/**
 * @description Output passed bytes on the console as a hexdump, if enabled
 * @param prefix - label to show to the left of bytes
 * @param data - bytes to output, a buffer or string
 * @private
 */
function debugBytes (prefix, data) {
  if (typeof data === 'string') data = new Buffer(data);

  console.log('Debug bytes:');

  for (var j = 0; j < data.length;) {
    var hexPart = '';
    var ascPart = '';
    for (var end = Math.min(data.length, j + 16); j < end; ++j) {
      var byt = data[j];

      var hex = ('0' + byt.toString(16)).slice(-2);
      hexPart += (((j & 0xf) === 0x8) ? '  ' : ' '); // puts an extra space 8 bytes in
      hexPart += hex;

      var asc = (byt >= 0x20 && byt < 0x7f) ? String.fromCharCode(byt) : '.';
      ascPart += asc;
    }

    // pad to fixed width for alignment
    hexPart = (hexPart + '                                                   ').substring(0, 3 * 17);

    console.log(prefix + ' ' + hexPart + '|' + ascPart + '|');
  }
}
