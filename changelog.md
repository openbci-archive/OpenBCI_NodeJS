# 0.4.0

### New Features

* Firmware version 2.0 support.
* Clock synchronization between OpenBCI board and this driver
* `.info` property which contains verified board information parsed from the OpenBCI's `softReset()` response.
* `log` event that is emitted for data sent from the board that is not a stream packet
* `eot` event that is emitted when a user sends a command that results in an EOT ("$$$") being sent from the board
* Daisy (16 channel) support

### Breaking Changes

* Accelerometer data now goes into `.accelData` array instead of `.auxData` array.
* In openBCISample.js 
  * `parseRawPacket()` is now called `parseRawPacketStandard()`
* `ready` event only triggered after soft reset. `eot` event emitted in all other conditions resulting in the board sending EOT ("$$$")

# 0.3.9

### Enhancements

* Add tests for parsing raw packets

### Bug Fixes

* Removed `got here` log from `.streamStart()`
* Validate stop byte before emitting `rawDataPacket`

# 0.3.8

### Bug Fixes
* Fixed readme.md

# 0.3.7

### New Features

* Upgrade dependencies
* Update Travis

### Bug Fixes

* `.numberOfChannels()` now uses the info object, which is set in the constructor and on the return message from `.softReset()`
* `.sampleRate()` now uses the info object, which is set in the constructor and on the return message from `.softReset()`

# 0.3.6

### New Features

* Simulator now has accelerometer data

# 0.3.5

### New Features

* SD card support! Now logging to an SD card is easier than ever. 
 
### Bug Fixes

* Sample rate does not return correct sample rate for custom rate on simulator. #58

# 0.3.4

### New Features

* Simulator made to look more like brainwave data to the user. Implemented a 1/f filter. Defaults to injecting 60Hz line noise with two channels of alpha (10Hz) boost.

### Github Issues Addressed

* [https://github.com/OpenBCI/openbci-js-sdk/issues/44](#44)

# 0.3.3

### Bug Fixes

* `rawDataPacket` not being emitted

# 0.3.2

### Work In Progress

* SNTP Time Synchronization

### Bug Fixes

* updates to README.me and comments to change ntp to sntp, because the two are similar, but not the same and we do not want to be misleading
* Extended [Stnp](https://www.npmjs.com/package/sntp) to main openBCIBoard.js
* Add `.sntpNow()` function to get ntp time.

# 0.3.1

### Bug Fixes

* Bumped serialport version

# 0.3.0

### New Features

* Test Signals with ADS1299 using `.testSignal()`
* Continuous impedance testing, where each sample gets an `impedances` object that is an array of impedances for each
        channel.
* OpenBCI Radio Test File
* Added Sntp npm module with helper functions
* Removed stopByte and startByte from sampleObjects
    
### Breaking Changes

* Changed simulator name to `OpenBCISimulator`
* Changed name of function `simulatorOn` to `simulatorEnable`
* Changed name of function `simulatorOff` to `simulatorDisable`

### Work In Progress

* NTP Time Synchronization
* Goertzel algorithm to get voltage for impedance calculation
    
### Bug fixes

* Impedance calculations
* Readme updates
* Serial buffer had the chance to become permanently unaligned, optimized and completely transformed and refactored the way bytes are processed.
* Changes to gain of channels not working correctly.
* Node 5 compatibility 
    
### Github Issues Addressed

* #25, #26, #27, #29, #30, #31, #33, #34
