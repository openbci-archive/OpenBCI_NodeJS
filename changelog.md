# 1.5.2

### Dependency Package Updates
* `performance-now`: from `^0.2.0` to `2.1.0`
* `serialport` - from `4.0.1` to `4.0.7`

### Development Dependency Package Updates
* `bluebird`: from `3.4.6` to `3.5.0`
* `chai-as-promised`: from `^5.2.0` to `^6.0.0`
* `codecov`: from `^1.0.1` to `^2.1.0`
* `semistandard`: from `^9.0.0` to `^10.0.0`
* `sinon`: from `^1.17.2` to `^2.1.0`
* `snazzy`: from `^5.0.0` to `^6.0.0`

# 1.5.1

### New Features
* Add new example for Lab stream layer (#139) thanks @gabrielibagon

### Breaking changes
* Removed `impedanceCalculationForChannel()` and `impedanceCalculationForAllChannels` from `OpenBCISample.js`

### Bug Fixes
* Fixes #28- Impedance not working properly.

# 1.5.0

### New Features
* New simulator option `simulatorDaisyModuleCanBeAttached` - Boolean, deafults to true, allows the simulation of the a hot swapped daisy board or simulates a misinformed module.
* New `EventEmitter` - `hardSet` - for when the module detects the board is not configured as the options for the module intended and tries to save itself. i.e. when the `daisy` option is `true` and a soft reset message is parsed and the module determines that a daisy was not detected, the module will emit `hardSet` then send an attach daisy command to recover. Either `error` will be emitted if unable to attach or `ready` will be emitted if success.
* Add example for streaming with `daisy` and `hardSet`.

### Breaking changes
* `.setInfoForBoardType()` changed to `.overrideInfoForBoardType()` to elevate it's dangerous nature.
* `.setMaxChannels()` changed to `.hardSetBoardType()` and input changed from numerical to string: 8 and 16 to `default` and `daisy` respectively.

### Bug Fixes
* Fixes #131 - 16 chan not working by sending a channel command and parsing the return.
* Fixed bug where end of transmission characters would not be ejected from buffer.
 
### Enhancements
* Separated radio tests from main board test file.
 
# 1.4.4

### New Features
* Set max number of channels for the board to use with `.setMaxChannels()` see readme.md
* Set the core info object that drives the module with `.overrideInfoForBoardType()` see readme.md
* Get info for the core object that drives the module with `.getInfo()` see readme.md

### Work In Progress
* Bug where daisy would sometimes not be recognized which destroyed all data.

# 1.4.3

### New examples
* Add example of node to python

# 1.4.2

### New examples
* Add example of debug
* Add example of get streaming

# 1.4.1

### Bug Fixes
* Fixes bug where extra data after EOT (`$$$`) was dumped by preserving the poriton after the EOT for further decomposition.
* Fixes bug where any calls to channel set would actually break the openBCISample code as the channelSettingsArray contained an undefined.
* Writes promises resolve when they are actually sent over the serial port. 

# 1.4.0

### New Features

* Three new initialization options: `simulatorFragmentation`, `simulatorBufferSize`, and `simulatorLatencyTimer`.  Together, these enable a more _realistic_ serial port simulation, mimicking different potential user computer systems.
* New option `debug` gives a live dump of serial traffic on the console if enabled
* New API function `.isConnected()` to check if communications are active.
* New API function `.isStreaming()` to check if samples are coming from the board.

### Enhancements

* Implement and adapt semi-standard code style. Closes #83
* autoFindOpenBCIBoard now notices and uses the stock dongle on Linux
* 'synced' object now has `error` property, null on good syncs, error description on bad syncs.

### Breaking Changes

* The setting for simulatorInjectLineNoise has changed from `None` to `none`
* connect() will now fail if already connected
* The constructor will throw an error now if an invalid option is passed
* The `.connected` property has been removed, replaced by `.isConnected()`. Removed from docs.
* The `.streaming` property has been removed, replaced by `.isStreaming()`. Removed from docs.
* An error event will be emitted if sntp fails to initialize on construction
* The simulator will no longer communicate when disconnected
* Promises returned by writes will now only resolve after the write has been sent

### Bug Fixes

* Fixed bug where early packet fragments were dropped after board reset
* Fixed bug where time sync replies that began a buffered chunk were ignored
* Fixed bug where simulator would output wrong version in its reset message
* Fixed bug where resources were not cleaned up if connect was called twice
* Fixed bug where serial data was written after disconnection
* Fixed bug where unexpected disconnection was not detected
* Fixed bug where promises could lead to out of order packet processing.

# 1.3.3

### New Features

* Add `timeOffsetMaster` to object emitted when bad time sync.

### Bug Fixes

* Fixed log statement on impedance setting function
* Remove event emitter with time sync on reject of sync clock full

# 1.3.2

### Enhancements

* Added master time offset `timeOffsetMaster` to `syncObj` which is a running average across sync attempts.

# 1.3.1

### Bug Fixes

* Fixed bug where `connected` and `streaming` were not set in constructor

# 1.3.0

### New Features

* Add dropped packet detection, new event `droppedPacket` can be added to get an array of dropped packet numbers in the case of the dropped packet event.

# 1.2.3

### Enhancements

* Add table of contents to read me
* Reduce size of repo by removing impedance test report

# 1.2.2

### Enhancements

* Upgrade serialport to 4.x

# 1.2.1

### Bug Fixes

* Fixed bug where set channel function allowed for channel 0 to be set. Cannot set system to channel 0; lower limit is 1.

# 1.2.0

### New Features

* Add tutorial/sample code for interfacing the module with lab streaming layer.

### Breaking Changes

* Fixed time synced accel to work OpenBCI_32bit_Library release candidate 5 and newer.

# 1.1.0

### New Features

* Add function `.time()` which should be used in time syncing
* Add function `.syncClocksFull()` which should be used for immediate consecutive time syncs
* Synced object can be emitted on `synced` event. Check `valid` property for if the sync was done
* Add detailed description of object returned on `synced` event to README.md

### Breaking Changes

* Changed option named `timeSync` to `sntpTimeSync`
* Removed function called `.sntpNow()` because it was replaced by `.time()`

### Bug Fixes

* Time sync working
* Module could not work with local time

# 1.0.1

### New Features

* Add time sync tutorial in `README.md`

### Bug Fixes

* Fixed bug in simulator that lead to samples being all zeros.
* Fixed time sync sent confirmation bug that led to bad time values.

# 1.0.0

The second major release for the OpenBCI Node.js SDK brings major changes, improvements and stability, on top of a push to increase automated test coverage.

### New Features

* NPM Module now called `openbci` instead of `openbci-sdk`
* Firmware version 2.0 support.
* Clock synchronization between OpenBCI board and this driver
* `.info` property which contains verified board information parsed from the OpenBCI's `softReset()` response.
* `eot` event that is emitted when a user sends a command that results in an EOT ("$$$") being sent from the board
* Daisy (16 channel) support
* Simulator overhaul, it completely mocks the board. Can now simulate board failure, where the board stops talking to the dongle. Can also mock a serial port failure.
* `error` and `close` events from serialport now emtted events users can subscribe to.

### Breaking Changes

* NPM package is not called `openbci-sdk` anymore, now called `openbci`
* Accelerometer data now goes into `.accelData` array instead of `.auxData` array.
* In openBCISample.js
  * `parseRawPacket()` is now called `parseRawPacketStandard()`
* `ready` event only triggered after soft reset. `eot` event emitted in all other conditions resulting in the board sending EOT ("$$$")
* Must use camel case on the OpenBCISimulator object.
* Renamed constructor options for readability:
  * `simulatorAlpha` to `simulatorInjectAlpha`
  * `simulatorLineNoise` to `simulatorInjectLineNoise`
* `connect()` no longer rejects on `close` or `error` event from the serialport.

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
