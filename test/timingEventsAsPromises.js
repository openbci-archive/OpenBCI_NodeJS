// Converts timing events to use promises, to gain bluebird's checks

function instrumentTimingEvents (module, type) {
  // replaces module[type] with a function that does the same thing but uses a promise
  // assumes the first argument will be to a callback function

  // if this a setSomething function with a clearSomething partner, the partner will also be instrumented
  var setName = type;
  var clearName = null;
  if (type.substring(0, 3) === 'set') {
    clearName = 'clear' + type.substring(3);
  }

  if (!module[setName]) return;

  // store original functions
  var originalSet = module[setName];
  var originalClear = module[clearName];
  exports[setName + 'Ignored'] = originalSet;

  // dictionary to store promise details for each call
  var events = {};

  // setAsPromise() is the brunt of the function.  It replaces the previous global function,
  // and sets up a promise to resolve when the callback is called
  var eventCount = 0;
  var setAsPromise = function (callback) {
    var args = [].slice.call(arguments);

    var eventNum = ++eventCount;
    var eventHandle;

    if (setAsPromise._ignoreCount > 0) {
      --setAsPromise._ignoreCount;

      return originalSet.apply(this, args);
    }

    // actual callback is replaced by promise resolve
    args[0] = function () {
      if (!events[eventNum]) throw new Error(setName + ' ' + eventNum + ' disappeared');
      events[eventNum].resolve([].slice.call(arguments));
    };

    eventHandle = originalSet.apply(this, args) || eventNum;

    // this portion is a function so that setInterval may be handled via recursion
    function dispatch () {
      var handlerDetails = { handle: eventHandle };

      var promise = new Promise((resolve, reject) => {
        handlerDetails.resolve = resolve;
        handlerDetails.reject = reject;
      });

      handlerDetails.promise = promise;
      events[eventNum] = handlerDetails;

      promise.then(function (argumentArray) {
        if (type !== 'setInterval') {
          delete events[eventNum];
        } else {
          dispatch();
        }

        // call original handler
        callback.apply(this, argumentArray);
      }, () => {
        originalClear(eventHandle);
        delete events[eventNum];
      });

      return promise;
    }

    dispatch();

    return eventNum;
  };

  // actually replace functions with instrumented ones
  setAsPromise._ignoreCount = 0;
  module[setName] = setAsPromise;
  Object.defineProperty(setAsPromise, 'name', { value: setName + 'AsPromise' });

  if (clearName) {
    module[clearName] = (eventNum) => {
      if (!events[eventNum]) {
        originalClear(eventNum);
      } else {
        events[eventNum].reject(new Error('cleared'));
      }
    };
    Object.defineProperty(module[clearName], 'name', { value: clearName + 'AsPromise' });
  }
}

instrumentTimingEvents(global, 'setTimeout');
instrumentTimingEvents(global, 'setInterval');
instrumentTimingEvents(global, 'setImmediate');
// // Possible TODO: nextTick needs some exceptions included to prevent infinite recursion
// instrumentTimingEvents(process, 'nextTick');

// the next call to the passed function should not be promisified
// may be queued multiple times
exports.ignoreOnce = (ignored) => {
  ignored._ignoreCount ++;
};
