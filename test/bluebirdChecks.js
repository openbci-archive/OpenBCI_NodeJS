var timingEventsAsPromises = require('./timingEventsAsPromises');
exports.BluebirdPromise = require('bluebird');
exports.PromiseIgnored = global.Promise;

// Enable bluebird for all promise usage during tests only
// Fails tests for issues bluebird finds
// Exports a function to list all promises (getPendingPromises)
// Exports a function to verify no promises pending within a timeout (noPendingPromises)

exports.BluebirdPromise.config({
  // TODO: wForgottenReturn is disabled because timingEventsAsPromises triggers it; find a workaround
  warnings: { wForgottenReturn: false },
  longStackTraces: true,
  monitoring: true,
  cancellation: true
});

// nextTick conveniently not instrumented by timingEventsAsPromises
exports.BluebirdPromise.setScheduler(process.nextTick);

// unhandled rejections become test failures
process.on('unhandledRejection', (reason, promise) => {
  if (!(reason instanceof Error)) {
    reason = new Error('unhandled promise rejection: ' + reason);
  } else {
    reason.message = 'unhandled promise rejection: ' + reason.message;
  }
  process.nextTick(() => { throw reason; });
});

// // warnings become test failures
// process.on('warning', (warning) => {
//   var error = new Error(warning);
//   process.nextTick(() => { throw error; });
// });

// provide access to all currently pending promises
var pendingPromises = {};
var promiseId = 0;
var nested = 0;

function promiseCreationHandler (promise) {
  // promise created already resolved; ignore
  if (!promise.isPending()) return;

  // need to create another promise to get access to the extended stack trace
  // nested detects if we are inside our own dummy promise
  ++nested;
  if (nested === 1) {
    // not the dummy promise
    promise.___id = ++promiseId;
    // store promise details
    var error = new Error('Promise ' + promise.___id + ' is still pending');
    var entry = {
      promise: promise,
      id: promise.___id,
      error: error
    };
    pendingPromises[promise.___id] = entry;
    // extract stack trace by rejecting an error; bluebird fills in expanded stack
    exports.BluebirdPromise.reject(error).catch(error => {
      entry.error = error;
      entry.stack = error.stack;
    });
  } else {
    promise.___nested = nested;
  }
  --nested;
}
process.on('promiseCreated', promiseCreationHandler);

function promiseDoneHandler (promise) {
  if (promise.___nested) return;
  delete pendingPromises[promise.___id];
}
process.on('promiseFulfilled', promiseDoneHandler);
process.on('promiseRejected', promiseDoneHandler);
process.on('promiseResolved', promiseDoneHandler);
process.on('promiseCancelled', promiseDoneHandler);

exports.getPendingPromises = function () {
  var ret = [];
  for (var promise in pendingPromises) {
    ret.push(pendingPromises[promise]);
  }
  return ret;
};

exports.noPendingPromises = function (milliseconds) {
  if (!milliseconds) milliseconds = 0;

  return new exports.PromiseIgnored((resolve, reject) => {
    function waited100 () {
      var promises = exports.getPendingPromises();

      if (promises.length === 0) {
        return resolve();
      }

      if (milliseconds > 0) {
        milliseconds -= 100;
        return timingEventsAsPromises.setTimeoutIgnored(waited100, 100);
      }

      // timed out, but promises remaining: cancel all

      console.log(promises.length + ' promises still pending');

      promises.forEach(promise => {
        promise.promise.cancel();
      });

      // report one
      reject(promises[0].error);
    }

    timingEventsAsPromises.setTimeoutIgnored(waited100, 0);
  });
};

// now instrument the Promise object itself to always use a simplified version of bluebird
// bluebird is composed inside a bare-bones Promise object providing only the official calls

global.Promise = function (handler) {
  this._promise = new exports.BluebirdPromise(handler);
};

// compose class methods
['all', 'race', 'reject', 'resolve'].forEach(classMethod => {
  global.Promise[classMethod] = function () {
    return exports.BluebirdPromise[classMethod].apply(exports.BluebirdPromise, [].slice.call(arguments));
  };
  Object.defineProperty(global.Promise[classMethod], 'name', { value: 'Promise.' + classMethod });
});

// compose object methods
['then', 'catch'].forEach(objectMethod => {
  global.Promise.prototype[objectMethod] = function () {
    return this._promise[objectMethod].apply(this._promise, [].slice.call(arguments));
  };
  Object.defineProperty(global.Promise.prototype[objectMethod], 'name', { value: 'Promise.' + objectMethod });
});
