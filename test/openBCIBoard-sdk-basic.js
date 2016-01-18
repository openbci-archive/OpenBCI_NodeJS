//'use strict';
//
//var sinon = require('sinon');
//var chai = require('chai');
//var expect = chai.expect;
//
//var MockedOpenBCIBoard = require('../test_mocks/openbci-hardware');
//var openBCIBoard = MockedOpenBCIBoard.openBCIBoard;
//var hardware = MockedOpenBCIBoard.hardware;
//
//describe('openBCIBoard', function () {
//    var sandbox;
//
//    beforeEach(function (){
//        sandbox = sinon.sandbox.create();
//
//        // Create a board for fun and profit
//        hardware.reset();
//        hardware.createBoard();
//    });
//
//    afterEach(function () {
//        sandbox.restore();
//    });
//
//});