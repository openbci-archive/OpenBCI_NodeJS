0.3.0

New Features
    * Test Signals with ADS1299 using `.testSignal()`
    * Continuous impedance testing, where each sample gets an `impedances` object that is an array of impedances for each
        channel.
    * OpenBCI Radio Test File
    * Added Sntp npm module with helper functions
    * Removed stopByte and startByte from sampleObjects
    
Breaking Changes
    * Changed simulator name to `OpenBCISimulator`
    * Changed name of function `simulatorOn` to `simulatorEnable`
    * Changed name of function `simulatorOff` to `simulatorDisable`

Work In Progress
    * NTP Time Synchronization
    
Bug fixes
    * Impedance calculations
    * Readme updates
    * Serial buffer had the chance to become permanently unaligned, optimized and completely transformed and refactored the way bytes are processed.
    * Changes to gain of channels not working correctly.
    
Github Issues Addressed
    * #25 "simulator sample rate optionally parameter doesn't work"