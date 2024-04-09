/**
* Name: Metaverse
* Date: 2022/4/24
* Author: https://www.4dkankan.com
* Copyright © 2022 4DAGE Co., Ltd. All rights reserved.
* Licensed under the GLP license
*/
(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
    try {
      var info = gen[key](arg);
      var value = info.value;
    } catch (error) {
      reject(error);
      return;
    }

    if (info.done) {
      resolve(value);
    } else {
      Promise.resolve(value).then(_next, _throw);
    }
  }

  function _asyncToGenerator(fn) {
    return function () {
      var self = this,
          args = arguments;
      return new Promise(function (resolve, reject) {
        var gen = fn.apply(self, args);

        function _next(value) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
        }

        function _throw(err) {
          asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
        }

        _next(undefined);
      });
    };
  }

  function createCommonjsModule(fn) {
    var module = { exports: {} };
  	return fn(module, module.exports), module.exports;
  }

  /**
   * Copyright (c) 2014-present, Facebook, Inc.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   */

  var runtime_1 = createCommonjsModule(function (module) {
  var runtime = (function (exports) {

    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    var undefined$1; // More compressible than void 0.
    var $Symbol = typeof Symbol === "function" ? Symbol : {};
    var iteratorSymbol = $Symbol.iterator || "@@iterator";
    var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
    var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

    function define(obj, key, value) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
      return obj[key];
    }
    try {
      // IE 8 has a broken Object.defineProperty that only works on DOM objects.
      define({}, "");
    } catch (err) {
      define = function(obj, key, value) {
        return obj[key] = value;
      };
    }

    function wrap(innerFn, outerFn, self, tryLocsList) {
      // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
      var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
      var generator = Object.create(protoGenerator.prototype);
      var context = new Context(tryLocsList || []);

      // The ._invoke method unifies the implementations of the .next,
      // .throw, and .return methods.
      generator._invoke = makeInvokeMethod(innerFn, self, context);

      return generator;
    }
    exports.wrap = wrap;

    // Try/catch helper to minimize deoptimizations. Returns a completion
    // record like context.tryEntries[i].completion. This interface could
    // have been (and was previously) designed to take a closure to be
    // invoked without arguments, but in all the cases we care about we
    // already have an existing method we want to call, so there's no need
    // to create a new function object. We can even get away with assuming
    // the method takes exactly one argument, since that happens to be true
    // in every case, so we don't have to touch the arguments object. The
    // only additional allocation required is the completion record, which
    // has a stable shape and so hopefully should be cheap to allocate.
    function tryCatch(fn, obj, arg) {
      try {
        return { type: "normal", arg: fn.call(obj, arg) };
      } catch (err) {
        return { type: "throw", arg: err };
      }
    }

    var GenStateSuspendedStart = "suspendedStart";
    var GenStateSuspendedYield = "suspendedYield";
    var GenStateExecuting = "executing";
    var GenStateCompleted = "completed";

    // Returning this object from the innerFn has the same effect as
    // breaking out of the dispatch switch statement.
    var ContinueSentinel = {};

    // Dummy constructor functions that we use as the .constructor and
    // .constructor.prototype properties for functions that return Generator
    // objects. For full spec compliance, you may wish to configure your
    // minifier not to mangle the names of these two functions.
    function Generator() {}
    function GeneratorFunction() {}
    function GeneratorFunctionPrototype() {}

    // This is a polyfill for %IteratorPrototype% for environments that
    // don't natively support it.
    var IteratorPrototype = {};
    define(IteratorPrototype, iteratorSymbol, function () {
      return this;
    });

    var getProto = Object.getPrototypeOf;
    var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
    if (NativeIteratorPrototype &&
        NativeIteratorPrototype !== Op &&
        hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
      // This environment has a native %IteratorPrototype%; use it instead
      // of the polyfill.
      IteratorPrototype = NativeIteratorPrototype;
    }

    var Gp = GeneratorFunctionPrototype.prototype =
      Generator.prototype = Object.create(IteratorPrototype);
    GeneratorFunction.prototype = GeneratorFunctionPrototype;
    define(Gp, "constructor", GeneratorFunctionPrototype);
    define(GeneratorFunctionPrototype, "constructor", GeneratorFunction);
    GeneratorFunction.displayName = define(
      GeneratorFunctionPrototype,
      toStringTagSymbol,
      "GeneratorFunction"
    );

    // Helper for defining the .next, .throw, and .return methods of the
    // Iterator interface in terms of a single ._invoke method.
    function defineIteratorMethods(prototype) {
      ["next", "throw", "return"].forEach(function(method) {
        define(prototype, method, function(arg) {
          return this._invoke(method, arg);
        });
      });
    }

    exports.isGeneratorFunction = function(genFun) {
      var ctor = typeof genFun === "function" && genFun.constructor;
      return ctor
        ? ctor === GeneratorFunction ||
          // For the native GeneratorFunction constructor, the best we can
          // do is to check its .name property.
          (ctor.displayName || ctor.name) === "GeneratorFunction"
        : false;
    };

    exports.mark = function(genFun) {
      if (Object.setPrototypeOf) {
        Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
      } else {
        genFun.__proto__ = GeneratorFunctionPrototype;
        define(genFun, toStringTagSymbol, "GeneratorFunction");
      }
      genFun.prototype = Object.create(Gp);
      return genFun;
    };

    // Within the body of any async function, `await x` is transformed to
    // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
    // `hasOwn.call(value, "__await")` to determine if the yielded value is
    // meant to be awaited.
    exports.awrap = function(arg) {
      return { __await: arg };
    };

    function AsyncIterator(generator, PromiseImpl) {
      function invoke(method, arg, resolve, reject) {
        var record = tryCatch(generator[method], generator, arg);
        if (record.type === "throw") {
          reject(record.arg);
        } else {
          var result = record.arg;
          var value = result.value;
          if (value &&
              typeof value === "object" &&
              hasOwn.call(value, "__await")) {
            return PromiseImpl.resolve(value.__await).then(function(value) {
              invoke("next", value, resolve, reject);
            }, function(err) {
              invoke("throw", err, resolve, reject);
            });
          }

          return PromiseImpl.resolve(value).then(function(unwrapped) {
            // When a yielded Promise is resolved, its final value becomes
            // the .value of the Promise<{value,done}> result for the
            // current iteration.
            result.value = unwrapped;
            resolve(result);
          }, function(error) {
            // If a rejected Promise was yielded, throw the rejection back
            // into the async generator function so it can be handled there.
            return invoke("throw", error, resolve, reject);
          });
        }
      }

      var previousPromise;

      function enqueue(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function(resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }

        return previousPromise =
          // If enqueue has been called before, then we want to wait until
          // all previous Promises have been resolved before calling invoke,
          // so that results are always delivered in the correct order. If
          // enqueue has not been called before, then it is important to
          // call invoke immediately, without waiting on a callback to fire,
          // so that the async generator function has the opportunity to do
          // any necessary setup in a predictable way. This predictability
          // is why the Promise constructor synchronously invokes its
          // executor callback, and why async functions synchronously
          // execute code before the first await. Since we implement simple
          // async functions in terms of async generators, it is especially
          // important to get this right, even though it requires care.
          previousPromise ? previousPromise.then(
            callInvokeWithMethodAndArg,
            // Avoid propagating failures to Promises returned by later
            // invocations of the iterator.
            callInvokeWithMethodAndArg
          ) : callInvokeWithMethodAndArg();
      }

      // Define the unified helper method that is used to implement .next,
      // .throw, and .return (see defineIteratorMethods).
      this._invoke = enqueue;
    }

    defineIteratorMethods(AsyncIterator.prototype);
    define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
      return this;
    });
    exports.AsyncIterator = AsyncIterator;

    // Note that simple async functions are implemented on top of
    // AsyncIterator objects; they just return a Promise for the value of
    // the final result produced by the iterator.
    exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl) {
      if (PromiseImpl === void 0) PromiseImpl = Promise;

      var iter = new AsyncIterator(
        wrap(innerFn, outerFn, self, tryLocsList),
        PromiseImpl
      );

      return exports.isGeneratorFunction(outerFn)
        ? iter // If outerFn is a generator, return the full iterator.
        : iter.next().then(function(result) {
            return result.done ? result.value : iter.next();
          });
    };

    function makeInvokeMethod(innerFn, self, context) {
      var state = GenStateSuspendedStart;

      return function invoke(method, arg) {
        if (state === GenStateExecuting) {
          throw new Error("Generator is already running");
        }

        if (state === GenStateCompleted) {
          if (method === "throw") {
            throw arg;
          }

          // Be forgiving, per 25.3.3.3.3 of the spec:
          // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
          return doneResult();
        }

        context.method = method;
        context.arg = arg;

        while (true) {
          var delegate = context.delegate;
          if (delegate) {
            var delegateResult = maybeInvokeDelegate(delegate, context);
            if (delegateResult) {
              if (delegateResult === ContinueSentinel) continue;
              return delegateResult;
            }
          }

          if (context.method === "next") {
            // Setting context._sent for legacy support of Babel's
            // function.sent implementation.
            context.sent = context._sent = context.arg;

          } else if (context.method === "throw") {
            if (state === GenStateSuspendedStart) {
              state = GenStateCompleted;
              throw context.arg;
            }

            context.dispatchException(context.arg);

          } else if (context.method === "return") {
            context.abrupt("return", context.arg);
          }

          state = GenStateExecuting;

          var record = tryCatch(innerFn, self, context);
          if (record.type === "normal") {
            // If an exception is thrown from innerFn, we leave state ===
            // GenStateExecuting and loop back for another invocation.
            state = context.done
              ? GenStateCompleted
              : GenStateSuspendedYield;

            if (record.arg === ContinueSentinel) {
              continue;
            }

            return {
              value: record.arg,
              done: context.done
            };

          } else if (record.type === "throw") {
            state = GenStateCompleted;
            // Dispatch the exception by looping back around to the
            // context.dispatchException(context.arg) call above.
            context.method = "throw";
            context.arg = record.arg;
          }
        }
      };
    }

    // Call delegate.iterator[context.method](context.arg) and handle the
    // result, either by returning a { value, done } result from the
    // delegate iterator, or by modifying context.method and context.arg,
    // setting context.delegate to null, and returning the ContinueSentinel.
    function maybeInvokeDelegate(delegate, context) {
      var method = delegate.iterator[context.method];
      if (method === undefined$1) {
        // A .throw or .return when the delegate iterator has no .throw
        // method always terminates the yield* loop.
        context.delegate = null;

        if (context.method === "throw") {
          // Note: ["return"] must be used for ES3 parsing compatibility.
          if (delegate.iterator["return"]) {
            // If the delegate iterator has a return method, give it a
            // chance to clean up.
            context.method = "return";
            context.arg = undefined$1;
            maybeInvokeDelegate(delegate, context);

            if (context.method === "throw") {
              // If maybeInvokeDelegate(context) changed context.method from
              // "return" to "throw", let that override the TypeError below.
              return ContinueSentinel;
            }
          }

          context.method = "throw";
          context.arg = new TypeError(
            "The iterator does not provide a 'throw' method");
        }

        return ContinueSentinel;
      }

      var record = tryCatch(method, delegate.iterator, context.arg);

      if (record.type === "throw") {
        context.method = "throw";
        context.arg = record.arg;
        context.delegate = null;
        return ContinueSentinel;
      }

      var info = record.arg;

      if (! info) {
        context.method = "throw";
        context.arg = new TypeError("iterator result is not an object");
        context.delegate = null;
        return ContinueSentinel;
      }

      if (info.done) {
        // Assign the result of the finished delegate to the temporary
        // variable specified by delegate.resultName (see delegateYield).
        context[delegate.resultName] = info.value;

        // Resume execution at the desired location (see delegateYield).
        context.next = delegate.nextLoc;

        // If context.method was "throw" but the delegate handled the
        // exception, let the outer generator proceed normally. If
        // context.method was "next", forget context.arg since it has been
        // "consumed" by the delegate iterator. If context.method was
        // "return", allow the original .return call to continue in the
        // outer generator.
        if (context.method !== "return") {
          context.method = "next";
          context.arg = undefined$1;
        }

      } else {
        // Re-yield the result returned by the delegate method.
        return info;
      }

      // The delegate iterator is finished, so forget it and continue with
      // the outer generator.
      context.delegate = null;
      return ContinueSentinel;
    }

    // Define Generator.prototype.{next,throw,return} in terms of the
    // unified ._invoke helper method.
    defineIteratorMethods(Gp);

    define(Gp, toStringTagSymbol, "Generator");

    // A Generator should always return itself as the iterator object when the
    // @@iterator function is called on it. Some browsers' implementations of the
    // iterator prototype chain incorrectly implement this, causing the Generator
    // object to not be returned from this call. This ensures that doesn't happen.
    // See https://github.com/facebook/regenerator/issues/274 for more details.
    define(Gp, iteratorSymbol, function() {
      return this;
    });

    define(Gp, "toString", function() {
      return "[object Generator]";
    });

    function pushTryEntry(locs) {
      var entry = { tryLoc: locs[0] };

      if (1 in locs) {
        entry.catchLoc = locs[1];
      }

      if (2 in locs) {
        entry.finallyLoc = locs[2];
        entry.afterLoc = locs[3];
      }

      this.tryEntries.push(entry);
    }

    function resetTryEntry(entry) {
      var record = entry.completion || {};
      record.type = "normal";
      delete record.arg;
      entry.completion = record;
    }

    function Context(tryLocsList) {
      // The root entry object (effectively a try statement without a catch
      // or a finally block) gives us a place to store values thrown from
      // locations where there is no enclosing try statement.
      this.tryEntries = [{ tryLoc: "root" }];
      tryLocsList.forEach(pushTryEntry, this);
      this.reset(true);
    }

    exports.keys = function(object) {
      var keys = [];
      for (var key in object) {
        keys.push(key);
      }
      keys.reverse();

      // Rather than returning an object with a next method, we keep
      // things simple and return the next function itself.
      return function next() {
        while (keys.length) {
          var key = keys.pop();
          if (key in object) {
            next.value = key;
            next.done = false;
            return next;
          }
        }

        // To avoid creating an additional object, we just hang the .value
        // and .done properties off the next function object itself. This
        // also ensures that the minifier will not anonymize the function.
        next.done = true;
        return next;
      };
    };

    function values(iterable) {
      if (iterable) {
        var iteratorMethod = iterable[iteratorSymbol];
        if (iteratorMethod) {
          return iteratorMethod.call(iterable);
        }

        if (typeof iterable.next === "function") {
          return iterable;
        }

        if (!isNaN(iterable.length)) {
          var i = -1, next = function next() {
            while (++i < iterable.length) {
              if (hasOwn.call(iterable, i)) {
                next.value = iterable[i];
                next.done = false;
                return next;
              }
            }

            next.value = undefined$1;
            next.done = true;

            return next;
          };

          return next.next = next;
        }
      }

      // Return an iterator with no values.
      return { next: doneResult };
    }
    exports.values = values;

    function doneResult() {
      return { value: undefined$1, done: true };
    }

    Context.prototype = {
      constructor: Context,

      reset: function(skipTempReset) {
        this.prev = 0;
        this.next = 0;
        // Resetting context._sent for legacy support of Babel's
        // function.sent implementation.
        this.sent = this._sent = undefined$1;
        this.done = false;
        this.delegate = null;

        this.method = "next";
        this.arg = undefined$1;

        this.tryEntries.forEach(resetTryEntry);

        if (!skipTempReset) {
          for (var name in this) {
            // Not sure about the optimal order of these conditions:
            if (name.charAt(0) === "t" &&
                hasOwn.call(this, name) &&
                !isNaN(+name.slice(1))) {
              this[name] = undefined$1;
            }
          }
        }
      },

      stop: function() {
        this.done = true;

        var rootEntry = this.tryEntries[0];
        var rootRecord = rootEntry.completion;
        if (rootRecord.type === "throw") {
          throw rootRecord.arg;
        }

        return this.rval;
      },

      dispatchException: function(exception) {
        if (this.done) {
          throw exception;
        }

        var context = this;
        function handle(loc, caught) {
          record.type = "throw";
          record.arg = exception;
          context.next = loc;

          if (caught) {
            // If the dispatched exception was caught by a catch block,
            // then let that catch block handle the exception normally.
            context.method = "next";
            context.arg = undefined$1;
          }

          return !! caught;
        }

        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          var record = entry.completion;

          if (entry.tryLoc === "root") {
            // Exception thrown outside of any try block that could handle
            // it, so set the completion value of the entire function to
            // throw the exception.
            return handle("end");
          }

          if (entry.tryLoc <= this.prev) {
            var hasCatch = hasOwn.call(entry, "catchLoc");
            var hasFinally = hasOwn.call(entry, "finallyLoc");

            if (hasCatch && hasFinally) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              } else if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else if (hasCatch) {
              if (this.prev < entry.catchLoc) {
                return handle(entry.catchLoc, true);
              }

            } else if (hasFinally) {
              if (this.prev < entry.finallyLoc) {
                return handle(entry.finallyLoc);
              }

            } else {
              throw new Error("try statement without catch or finally");
            }
          }
        }
      },

      abrupt: function(type, arg) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc <= this.prev &&
              hasOwn.call(entry, "finallyLoc") &&
              this.prev < entry.finallyLoc) {
            var finallyEntry = entry;
            break;
          }
        }

        if (finallyEntry &&
            (type === "break" ||
             type === "continue") &&
            finallyEntry.tryLoc <= arg &&
            arg <= finallyEntry.finallyLoc) {
          // Ignore the finally entry if control is not jumping to a
          // location outside the try/catch block.
          finallyEntry = null;
        }

        var record = finallyEntry ? finallyEntry.completion : {};
        record.type = type;
        record.arg = arg;

        if (finallyEntry) {
          this.method = "next";
          this.next = finallyEntry.finallyLoc;
          return ContinueSentinel;
        }

        return this.complete(record);
      },

      complete: function(record, afterLoc) {
        if (record.type === "throw") {
          throw record.arg;
        }

        if (record.type === "break" ||
            record.type === "continue") {
          this.next = record.arg;
        } else if (record.type === "return") {
          this.rval = this.arg = record.arg;
          this.method = "return";
          this.next = "end";
        } else if (record.type === "normal" && afterLoc) {
          this.next = afterLoc;
        }

        return ContinueSentinel;
      },

      finish: function(finallyLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.finallyLoc === finallyLoc) {
            this.complete(entry.completion, entry.afterLoc);
            resetTryEntry(entry);
            return ContinueSentinel;
          }
        }
      },

      "catch": function(tryLoc) {
        for (var i = this.tryEntries.length - 1; i >= 0; --i) {
          var entry = this.tryEntries[i];
          if (entry.tryLoc === tryLoc) {
            var record = entry.completion;
            if (record.type === "throw") {
              var thrown = record.arg;
              resetTryEntry(entry);
            }
            return thrown;
          }
        }

        // The context.catch method must only be called with a location
        // argument that corresponds to a known catch block.
        throw new Error("illegal catch attempt");
      },

      delegateYield: function(iterable, resultName, nextLoc) {
        this.delegate = {
          iterator: values(iterable),
          resultName: resultName,
          nextLoc: nextLoc
        };

        if (this.method === "next") {
          // Deliberately forget the last sent value so that we don't
          // accidentally pass it on to the delegate.
          this.arg = undefined$1;
        }

        return ContinueSentinel;
      }
    };

    // Regardless of whether this script is executing as a CommonJS module
    // or not, return the runtime object so that we can declare the variable
    // regeneratorRuntime in the outer scope, which allows this module to be
    // injected easily by `bin/regenerator --include-runtime script.js`.
    return exports;

  }(
    // If this script is executing as a CommonJS module, use module.exports
    // as the regeneratorRuntime namespace. Otherwise create a new empty
    // object. Either way, the resulting object will be used to initialize
    // the regeneratorRuntime variable at the top of this file.
    module.exports 
  ));

  try {
    regeneratorRuntime = runtime;
  } catch (accidentalStrictMode) {
    // This module should not be running in strict mode, so the above
    // assignment should always work unless something is misconfigured. Just
    // in case runtime.js accidentally runs in strict mode, in modern engines
    // we can explicitly access globalThis. In older engines we can escape
    // strict mode using a global Function call. This could conceivably fail
    // if a Content Security Policy forbids using Function, but in that case
    // the proper solution is to fix the accidental strict mode problem. If
    // you've misconfigured your bundler to force strict mode and applied a
    // CSP to forbid Function, and you're not willing to fix either of those
    // problems, please detail your unique predicament in a GitHub issue.
    if (typeof globalThis === "object") {
      globalThis.regeneratorRuntime = runtime;
    } else {
      Function("r", "regeneratorRuntime = r")(runtime);
    }
  }
  });

  var regenerator = runtime_1;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
      return call;
    } else if (call !== void 0) {
      throw new TypeError("Derived constructors may only return object or undefined");
    }

    return _assertThisInitialized(self);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  var eventemitter3 = createCommonjsModule(function (module) {

  var has = Object.prototype.hasOwnProperty
    , prefix = '~';

  /**
   * Constructor to create a storage for our `EE` objects.
   * An `Events` instance is a plain object whose properties are event names.
   *
   * @constructor
   * @private
   */
  function Events() {}

  //
  // We try to not inherit from `Object.prototype`. In some engines creating an
  // instance in this way is faster than calling `Object.create(null)` directly.
  // If `Object.create(null)` is not supported we prefix the event names with a
  // character to make sure that the built-in object properties are not
  // overridden or used as an attack vector.
  //
  if (Object.create) {
    Events.prototype = Object.create(null);

    //
    // This hack is needed because the `__proto__` property is still inherited in
    // some old browsers like Android 4, iPhone 5.1, Opera 11 and Safari 5.
    //
    if (!new Events().__proto__) prefix = false;
  }

  /**
   * Representation of a single event listener.
   *
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} [once=false] Specify if the listener is a one-time listener.
   * @constructor
   * @private
   */
  function EE(fn, context, once) {
    this.fn = fn;
    this.context = context;
    this.once = once || false;
  }

  /**
   * Add a listener for a given event.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} context The context to invoke the listener with.
   * @param {Boolean} once Specify if the listener is a one-time listener.
   * @returns {EventEmitter}
   * @private
   */
  function addListener(emitter, event, fn, context, once) {
    if (typeof fn !== 'function') {
      throw new TypeError('The listener must be a function');
    }

    var listener = new EE(fn, context || emitter, once)
      , evt = prefix ? prefix + event : event;

    if (!emitter._events[evt]) emitter._events[evt] = listener, emitter._eventsCount++;
    else if (!emitter._events[evt].fn) emitter._events[evt].push(listener);
    else emitter._events[evt] = [emitter._events[evt], listener];

    return emitter;
  }

  /**
   * Clear event by name.
   *
   * @param {EventEmitter} emitter Reference to the `EventEmitter` instance.
   * @param {(String|Symbol)} evt The Event name.
   * @private
   */
  function clearEvent(emitter, evt) {
    if (--emitter._eventsCount === 0) emitter._events = new Events();
    else delete emitter._events[evt];
  }

  /**
   * Minimal `EventEmitter` interface that is molded against the Node.js
   * `EventEmitter` interface.
   *
   * @constructor
   * @public
   */
  function EventEmitter() {
    this._events = new Events();
    this._eventsCount = 0;
  }

  /**
   * Return an array listing the events for which the emitter has registered
   * listeners.
   *
   * @returns {Array}
   * @public
   */
  EventEmitter.prototype.eventNames = function eventNames() {
    var names = []
      , events
      , name;

    if (this._eventsCount === 0) return names;

    for (name in (events = this._events)) {
      if (has.call(events, name)) names.push(prefix ? name.slice(1) : name);
    }

    if (Object.getOwnPropertySymbols) {
      return names.concat(Object.getOwnPropertySymbols(events));
    }

    return names;
  };

  /**
   * Return the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Array} The registered listeners.
   * @public
   */
  EventEmitter.prototype.listeners = function listeners(event) {
    var evt = prefix ? prefix + event : event
      , handlers = this._events[evt];

    if (!handlers) return [];
    if (handlers.fn) return [handlers.fn];

    for (var i = 0, l = handlers.length, ee = new Array(l); i < l; i++) {
      ee[i] = handlers[i].fn;
    }

    return ee;
  };

  /**
   * Return the number of listeners listening to a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Number} The number of listeners.
   * @public
   */
  EventEmitter.prototype.listenerCount = function listenerCount(event) {
    var evt = prefix ? prefix + event : event
      , listeners = this._events[evt];

    if (!listeners) return 0;
    if (listeners.fn) return 1;
    return listeners.length;
  };

  /**
   * Calls each of the listeners registered for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @returns {Boolean} `true` if the event had listeners, else `false`.
   * @public
   */
  EventEmitter.prototype.emit = function emit(event, a1, a2, a3, a4, a5) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return false;

    var listeners = this._events[evt]
      , len = arguments.length
      , args
      , i;

    if (listeners.fn) {
      if (listeners.once) this.removeListener(event, listeners.fn, undefined, true);

      switch (len) {
        case 1: return listeners.fn.call(listeners.context), true;
        case 2: return listeners.fn.call(listeners.context, a1), true;
        case 3: return listeners.fn.call(listeners.context, a1, a2), true;
        case 4: return listeners.fn.call(listeners.context, a1, a2, a3), true;
        case 5: return listeners.fn.call(listeners.context, a1, a2, a3, a4), true;
        case 6: return listeners.fn.call(listeners.context, a1, a2, a3, a4, a5), true;
      }

      for (i = 1, args = new Array(len -1); i < len; i++) {
        args[i - 1] = arguments[i];
      }

      listeners.fn.apply(listeners.context, args);
    } else {
      var length = listeners.length
        , j;

      for (i = 0; i < length; i++) {
        if (listeners[i].once) this.removeListener(event, listeners[i].fn, undefined, true);

        switch (len) {
          case 1: listeners[i].fn.call(listeners[i].context); break;
          case 2: listeners[i].fn.call(listeners[i].context, a1); break;
          case 3: listeners[i].fn.call(listeners[i].context, a1, a2); break;
          case 4: listeners[i].fn.call(listeners[i].context, a1, a2, a3); break;
          default:
            if (!args) for (j = 1, args = new Array(len -1); j < len; j++) {
              args[j - 1] = arguments[j];
            }

            listeners[i].fn.apply(listeners[i].context, args);
        }
      }
    }

    return true;
  };

  /**
   * Add a listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.on = function on(event, fn, context) {
    return addListener(this, event, fn, context, false);
  };

  /**
   * Add a one-time listener for a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn The listener function.
   * @param {*} [context=this] The context to invoke the listener with.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.once = function once(event, fn, context) {
    return addListener(this, event, fn, context, true);
  };

  /**
   * Remove the listeners of a given event.
   *
   * @param {(String|Symbol)} event The event name.
   * @param {Function} fn Only remove the listeners that match this function.
   * @param {*} context Only remove the listeners that have this context.
   * @param {Boolean} once Only remove one-time listeners.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeListener = function removeListener(event, fn, context, once) {
    var evt = prefix ? prefix + event : event;

    if (!this._events[evt]) return this;
    if (!fn) {
      clearEvent(this, evt);
      return this;
    }

    var listeners = this._events[evt];

    if (listeners.fn) {
      if (
        listeners.fn === fn &&
        (!once || listeners.once) &&
        (!context || listeners.context === context)
      ) {
        clearEvent(this, evt);
      }
    } else {
      for (var i = 0, events = [], length = listeners.length; i < length; i++) {
        if (
          listeners[i].fn !== fn ||
          (once && !listeners[i].once) ||
          (context && listeners[i].context !== context)
        ) {
          events.push(listeners[i]);
        }
      }

      //
      // Reset the array, or remove it completely if we have no more listeners.
      //
      if (events.length) this._events[evt] = events.length === 1 ? events[0] : events;
      else clearEvent(this, evt);
    }

    return this;
  };

  /**
   * Remove all listeners, or those of the specified event.
   *
   * @param {(String|Symbol)} [event] The event name.
   * @returns {EventEmitter} `this`.
   * @public
   */
  EventEmitter.prototype.removeAllListeners = function removeAllListeners(event) {
    var evt;

    if (event) {
      evt = prefix ? prefix + event : event;
      if (this._events[evt]) clearEvent(this, evt);
    } else {
      this._events = new Events();
      this._eventsCount = 0;
    }

    return this;
  };

  //
  // Alias methods names because people roll like that.
  //
  EventEmitter.prototype.off = EventEmitter.prototype.removeListener;
  EventEmitter.prototype.addListener = EventEmitter.prototype.on;

  //
  // Expose the prefix.
  //
  EventEmitter.prefixed = prefix;

  //
  // Allow `EventEmitter` to be imported as module namespace.
  //
  EventEmitter.EventEmitter = EventEmitter;

  //
  // Expose the module.
  //
  {
    module.exports = EventEmitter;
  }
  });

  var WorkerClass = null;

  try {
      var WorkerThreads =
          typeof module !== 'undefined' && typeof module.require === 'function' && module.require('worker_threads') ||
          typeof __non_webpack_require__ === 'function' && __non_webpack_require__('worker_threads') ||
          typeof require === 'function' && require('worker_threads');
      WorkerClass = WorkerThreads.Worker;
  } catch(e) {} // eslint-disable-line

  function decodeBase64$1(base64, enableUnicode) {
      return Buffer.from(base64, 'base64').toString(enableUnicode ? 'utf16' : 'utf8');
  }

  function createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg) {
      var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
      var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
      var source = decodeBase64$1(base64, enableUnicode);
      var start = source.indexOf('\n', 10) + 1;
      var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
      return function WorkerFactory(options) {
          return new WorkerClass(body, Object.assign({}, options, { eval: true }));
      };
  }

  function decodeBase64(base64, enableUnicode) {
      var binaryString = atob(base64);
      if (enableUnicode) {
          var binaryView = new Uint8Array(binaryString.length);
          for (var i = 0, n = binaryString.length; i < n; ++i) {
              binaryView[i] = binaryString.charCodeAt(i);
          }
          return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
      }
      return binaryString;
  }

  function createURL(base64, sourcemapArg, enableUnicodeArg) {
      var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
      var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
      var source = decodeBase64(base64, enableUnicode);
      var start = source.indexOf('\n', 10) + 1;
      var body = source.substring(start) + (sourcemap ? '\/\/# sourceMappingURL=' + sourcemap : '');
      var blob = new Blob([body], { type: 'application/javascript' });
      return URL.createObjectURL(blob);
  }

  function createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg) {
      var url;
      return function WorkerFactory(options) {
          url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
          return new Worker(url, options);
      };
  }

  var kIsNodeJS = Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]';

  function isNodeJS() {
      return kIsNodeJS;
  }

  function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
      if (isNodeJS()) {
          return createBase64WorkerFactory$2(base64, sourcemapArg, enableUnicodeArg);
      }
      return createBase64WorkerFactory$1(base64, sourcemapArg, enableUnicodeArg);
  }

  var WorkerFactory = createBase64WorkerFactory('Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICd1c2Ugc3RyaWN0JzsKCiAgLy8KICAvLyAgQ29weXJpZ2h0IChjKSAyMDEzIFNhbSBMZWl0Y2guIEFsbCByaWdodHMgcmVzZXJ2ZWQuCiAgLy8KICAvLyAgUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weQogIC8vICBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSAiU29mdHdhcmUiKSwgdG8KICAvLyAgZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUKICAvLyAgcmlnaHRzIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yCiAgLy8gIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzCiAgLy8gIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6CiAgLy8KICAvLyAgVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4KICAvLyAgYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuCiAgLy8KICAvLyAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1IKICAvLyAgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksCiAgLy8gIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRQogIC8vICBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSCiAgLy8gIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HCiAgLy8gIEZST00sIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MKICAvLyAgSU4gVEhFIFNPRlRXQVJFLgogIC8vCgogIC8qKgogICAqIFRoaXMgY2xhc3Mgd3JhcHMgdGhlIGRldGFpbHMgb2YgdGhlIGgyNjRic2QgbGlicmFyeS4KICAgKiBNb2R1bGUgb2JqZWN0IGlzIGFuIEVtc2NyaXB0ZW4gbW9kdWxlIHByb3ZpZGVkIGdsb2JhbGx5IGJ5IFRpbnlIMjY0LmpzCiAgICoKICAgKiBJbiBvcmRlciB0byB1c2UgdGhpcyBjbGFzcywgeW91IGZpcnN0IHF1ZXVlIGVuY29kZWQgZGF0YSB1c2luZyBxdWV1ZURhdGEuCiAgICogRWFjaCBjYWxsIHRvIGRlY29kZSgpIHdpbGwgZGVjb2RlIGEgc2luZ2xlIGVuY29kZWQgZWxlbWVudC4KICAgKiBXaGVuIGRlY29kZSgpIHJldHVybnMgSDI2NGJzZERlY29kZXIuUElDX1JEWSwgYSBwaWN0dXJlIGlzIHJlYWR5IGluIHRoZSBvdXRwdXQgYnVmZmVyLgogICAqIFlvdSBjYW4gYWxzbyB1c2UgdGhlIG9uUGljdHVyZVJlYWR5KCkgZnVuY3Rpb24gdG8gZGV0ZXJtaW5lIHdoZW4gYSBwaWN0dXJlIGlzIHJlYWR5LgogICAqIFRoZSBvdXRwdXQgYnVmZmVyIGNhbiBiZSBhY2Nlc3NlZCBieSBjYWxsaW5nIGdldE5leHRPdXRwdXRQaWN0dXJlKCkKICAgKiBBbiBvdXRwdXQgcGljdHVyZSBtYXkgYWxzbyBiZSBkZWNvZGVkIHVzaW5nIGFuIEgyNjRic2RDYW52YXMuCiAgICogV2hlbiB5b3UncmUgZG9uZSBkZWNvZGluZywgbWFrZSBzdXJlIHRvIGNhbGwgcmVsZWFzZSgpIHRvIGNsZWFuIHVwIGludGVybmFsIGJ1ZmZlcnMuCiAgICovCiAgdmFyIFRpbnlIMjY0RGVjb2RlciA9IC8qI19fUFVSRV9fKi9mdW5jdGlvbiAoKSB7CiAgICBmdW5jdGlvbiBUaW55SDI2NERlY29kZXIodGlueUgyNjRNb2R1bGUsIG9uUGljdHVyZVJlYWR5KSB7CiAgICAgIHRoaXMudGlueUgyNjRNb2R1bGUgPSB0aW55SDI2NE1vZHVsZTsKICAgICAgdGhpcy5vblBpY3R1cmVSZWFkeSA9IG9uUGljdHVyZVJlYWR5OwogICAgICB0aGlzLnBTdG9yYWdlID0gdGhpcy50aW55SDI2NE1vZHVsZS5faDI2NGJzZEFsbG9jKCk7CiAgICAgIHRoaXMucFdpZHRoID0gdGhpcy50aW55SDI2NE1vZHVsZS5fbWFsbG9jKDQpOwogICAgICB0aGlzLnBIZWlnaHQgPSB0aGlzLnRpbnlIMjY0TW9kdWxlLl9tYWxsb2MoNCk7CiAgICAgIHRoaXMucFBpY3R1cmUgPSB0aGlzLnRpbnlIMjY0TW9kdWxlLl9tYWxsb2MoNCk7CiAgICAgIHRoaXMuX2RlY0J1ZmZlciA9IHRoaXMudGlueUgyNjRNb2R1bGUuX21hbGxvYygxMDI0ICogMTAyNCk7CgogICAgICB0aGlzLnRpbnlIMjY0TW9kdWxlLl9oMjY0YnNkSW5pdCh0aGlzLnBTdG9yYWdlLCAwKTsKICAgIH0KCiAgICB2YXIgX3Byb3RvID0gVGlueUgyNjREZWNvZGVyLnByb3RvdHlwZTsKCiAgICBfcHJvdG8ucmVsZWFzZSA9IGZ1bmN0aW9uIHJlbGVhc2UoKSB7CiAgICAgIHZhciBwU3RvcmFnZSA9IHRoaXMucFN0b3JhZ2U7CgogICAgICBpZiAocFN0b3JhZ2UgIT09IDApIHsKICAgICAgICB0aGlzLnRpbnlIMjY0TW9kdWxlLl9oMjY0YnNkU2h1dGRvd24ocFN0b3JhZ2UpOwoKICAgICAgICB0aGlzLnRpbnlIMjY0TW9kdWxlLl9oMjY0YnNkRnJlZShwU3RvcmFnZSk7CiAgICAgIH0KCiAgICAgIHRoaXMudGlueUgyNjRNb2R1bGUuX2ZyZWUodGhpcy5wV2lkdGgpOwoKICAgICAgdGhpcy50aW55SDI2NE1vZHVsZS5fZnJlZSh0aGlzLnBIZWlnaHQpOwoKICAgICAgdGhpcy50aW55SDI2NE1vZHVsZS5fZnJlZSh0aGlzLnBQaWN0dXJlKTsKCiAgICAgIHRoaXMucFN0b3JhZ2UgPSAwOwogICAgICB0aGlzLnBXaWR0aCA9IDA7CiAgICAgIHRoaXMucEhlaWdodCA9IDA7CiAgICB9OwoKICAgIF9wcm90by5kZWNvZGUgPSBmdW5jdGlvbiBkZWNvZGUobmFsKSB7CiAgICAgIGlmIChuYWwgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcikgewogICAgICAgIG5hbCA9IG5ldyBVaW50OEFycmF5KG5hbCk7CiAgICAgIH0KCiAgICAgIHRoaXMudGlueUgyNjRNb2R1bGUuSEVBUFU4LnNldChuYWwsIHRoaXMuX2RlY0J1ZmZlcik7CgogICAgICB2YXIgcmV0Q29kZSA9IHRoaXMudGlueUgyNjRNb2R1bGUuX2gyNjRic2REZWNvZGUodGhpcy5wU3RvcmFnZSwgdGhpcy5fZGVjQnVmZmVyLCBuYWwuYnl0ZUxlbmd0aCwgdGhpcy5wUGljdHVyZSwgdGhpcy5wV2lkdGgsIHRoaXMucEhlaWdodCk7CgogICAgICBpZiAocmV0Q29kZSA9PT0gVGlueUgyNjREZWNvZGVyLlBJQ19SRFkpIHsKICAgICAgICB2YXIgd2lkdGggPSB0aGlzLnRpbnlIMjY0TW9kdWxlLmdldFZhbHVlKHRoaXMucFdpZHRoLCAnaTMyJyk7CiAgICAgICAgdmFyIGhlaWdodCA9IHRoaXMudGlueUgyNjRNb2R1bGUuZ2V0VmFsdWUodGhpcy5wSGVpZ2h0LCAnaTMyJyk7CiAgICAgICAgdmFyIHBpY1B0ciA9IHRoaXMudGlueUgyNjRNb2R1bGUuZ2V0VmFsdWUodGhpcy5wUGljdHVyZSwgJ2k4KicpOwogICAgICAgIHZhciBwaWMgPSBuZXcgVWludDhBcnJheSh0aGlzLnRpbnlIMjY0TW9kdWxlLkhFQVBVOC5zdWJhcnJheShwaWNQdHIsIHBpY1B0ciArIHdpZHRoICogaGVpZ2h0ICogMyAvIDIpKTsKICAgICAgICB0aGlzLm9uUGljdHVyZVJlYWR5KHBpYywgd2lkdGgsIGhlaWdodCk7CiAgICAgIH0KICAgIH07CgogICAgcmV0dXJuIFRpbnlIMjY0RGVjb2RlcjsKICB9KCk7CgogIFRpbnlIMjY0RGVjb2Rlci5SRFkgPSAwOwogIFRpbnlIMjY0RGVjb2Rlci5QSUNfUkRZID0gMTsKICBUaW55SDI2NERlY29kZXIuSERSU19SRFkgPSAyOwogIFRpbnlIMjY0RGVjb2Rlci5FUlJPUiA9IDM7CiAgVGlueUgyNjREZWNvZGVyLlBBUkFNX1NFVF9FUlJPUiA9IDQ7CiAgVGlueUgyNjREZWNvZGVyLk1FTUFMTE9DX0VSUk9SID0gNTsKCiAgdmFyIE1vZHVsZSA9IGZ1bmN0aW9uICgpIHsKICAgIHZhciBfc2NyaXB0RGlyID0gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0ID8gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMgOiB1bmRlZmluZWQ7CgogICAgcmV0dXJuIGZ1bmN0aW9uIChNb2R1bGUpIHsKICAgICAgTW9kdWxlID0gTW9kdWxlIHx8IHt9OwogICAgICB2YXIgTW9kdWxlID0gdHlwZW9mIE1vZHVsZSAhPT0gInVuZGVmaW5lZCIgPyBNb2R1bGUgOiB7fTsKICAgICAgdmFyIHJlYWR5UHJvbWlzZVJlc29sdmUsIHJlYWR5UHJvbWlzZVJlamVjdDsKICAgICAgTW9kdWxlWyJyZWFkeSJdID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkgewogICAgICAgIHJlYWR5UHJvbWlzZVJlc29sdmUgPSByZXNvbHZlOwogICAgICAgIHJlYWR5UHJvbWlzZVJlamVjdCA9IHJlamVjdDsKICAgICAgfSk7CiAgICAgIHZhciBtb2R1bGVPdmVycmlkZXMgPSB7fTsKICAgICAgdmFyIGtleTsKCiAgICAgIGZvciAoa2V5IGluIE1vZHVsZSkgewogICAgICAgIGlmIChNb2R1bGUuaGFzT3duUHJvcGVydHkoa2V5KSkgewogICAgICAgICAgbW9kdWxlT3ZlcnJpZGVzW2tleV0gPSBNb2R1bGVba2V5XTsKICAgICAgICB9CiAgICAgIH0KICAgICAgdmFyIEVOVklST05NRU5UX0lTX1dPUktFUiA9IHRydWU7CiAgICAgIHZhciBzY3JpcHREaXJlY3RvcnkgPSAiIjsKCiAgICAgIGZ1bmN0aW9uIGxvY2F0ZUZpbGUocGF0aCkgewogICAgICAgIGlmIChNb2R1bGVbImxvY2F0ZUZpbGUiXSkgewogICAgICAgICAgcmV0dXJuIE1vZHVsZVsibG9jYXRlRmlsZSJdKHBhdGgsIHNjcmlwdERpcmVjdG9yeSk7CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgcGF0aDsKICAgICAgfQoKICAgICAgdmFyIHJlYWRCaW5hcnk7CgogICAgICB7CiAgICAgICAgewogICAgICAgICAgc2NyaXB0RGlyZWN0b3J5ID0gc2VsZi5sb2NhdGlvbi5ocmVmOwogICAgICAgIH0KCiAgICAgICAgaWYgKF9zY3JpcHREaXIpIHsKICAgICAgICAgIHNjcmlwdERpcmVjdG9yeSA9IF9zY3JpcHREaXI7CiAgICAgICAgfQoKICAgICAgICBpZiAoc2NyaXB0RGlyZWN0b3J5LmluZGV4T2YoImJsb2I6IikgIT09IDApIHsKICAgICAgICAgIHNjcmlwdERpcmVjdG9yeSA9IHNjcmlwdERpcmVjdG9yeS5zdWJzdHIoMCwgc2NyaXB0RGlyZWN0b3J5Lmxhc3RJbmRleE9mKCIvIikgKyAxKTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgc2NyaXB0RGlyZWN0b3J5ID0gIiI7CiAgICAgICAgfQoKICAgICAgICB7CgogICAgICAgICAgewogICAgICAgICAgICByZWFkQmluYXJ5ID0gZnVuY3Rpb24gcmVhZEJpbmFyeSh1cmwpIHsKICAgICAgICAgICAgICB0cnkgewogICAgICAgICAgICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpOwogICAgICAgICAgICAgICAgeGhyLm9wZW4oIkdFVCIsIHVybCwgZmFsc2UpOwogICAgICAgICAgICAgICAgeGhyLnJlc3BvbnNlVHlwZSA9ICJhcnJheWJ1ZmZlciI7CiAgICAgICAgICAgICAgICB4aHIuc2VuZChudWxsKTsKICAgICAgICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSh4aHIucmVzcG9uc2UpOwogICAgICAgICAgICAgIH0gY2F0Y2ggKGVycikgewogICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB0cnlQYXJzZUFzRGF0YVVSSSh1cmwpOwoKICAgICAgICAgICAgICAgIGlmIChkYXRhKSB7CiAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhOwogICAgICAgICAgICAgICAgfQoKICAgICAgICAgICAgICAgIHRocm93IGVycjsKICAgICAgICAgICAgICB9CiAgICAgICAgICAgIH07CiAgICAgICAgICB9CiAgICAgICAgfQogICAgICB9CgogICAgICBNb2R1bGVbInByaW50Il0gfHwgY29uc29sZS5sb2cuYmluZChjb25zb2xlKTsKICAgICAgdmFyIGVyciA9IE1vZHVsZVsicHJpbnRFcnIiXSB8fCBjb25zb2xlLndhcm4uYmluZChjb25zb2xlKTsKCiAgICAgIGZvciAoa2V5IGluIG1vZHVsZU92ZXJyaWRlcykgewogICAgICAgIGlmIChtb2R1bGVPdmVycmlkZXMuaGFzT3duUHJvcGVydHkoa2V5KSkgewogICAgICAgICAgTW9kdWxlW2tleV0gPSBtb2R1bGVPdmVycmlkZXNba2V5XTsKICAgICAgICB9CiAgICAgIH0KCiAgICAgIG1vZHVsZU92ZXJyaWRlcyA9IG51bGw7CiAgICAgIGlmIChNb2R1bGVbImFyZ3VtZW50cyJdKSA7CiAgICAgIGlmIChNb2R1bGVbInRoaXNQcm9ncmFtIl0pIDsKICAgICAgaWYgKE1vZHVsZVsicXVpdCJdKSA7CiAgICAgIHZhciB3YXNtQmluYXJ5OwogICAgICBpZiAoTW9kdWxlWyJ3YXNtQmluYXJ5Il0pIHdhc21CaW5hcnkgPSBNb2R1bGVbIndhc21CaW5hcnkiXTsKICAgICAgTW9kdWxlWyJub0V4aXRSdW50aW1lIl0gfHwgdHJ1ZTsKCiAgICAgIGlmICh0eXBlb2YgV2ViQXNzZW1ibHkgIT09ICJvYmplY3QiKSB7CiAgICAgICAgYWJvcnQoIm5vIG5hdGl2ZSB3YXNtIHN1cHBvcnQgZGV0ZWN0ZWQiKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gZ2V0VmFsdWUocHRyLCB0eXBlLCBub1NhZmUpIHsKICAgICAgICB0eXBlID0gdHlwZSB8fCAiaTgiOwogICAgICAgIGlmICh0eXBlLmNoYXJBdCh0eXBlLmxlbmd0aCAtIDEpID09PSAiKiIpIHR5cGUgPSAiaTMyIjsKCiAgICAgICAgc3dpdGNoICh0eXBlKSB7CiAgICAgICAgICBjYXNlICJpMSI6CiAgICAgICAgICAgIHJldHVybiBIRUFQOFtwdHIgPj4gMF07CgogICAgICAgICAgY2FzZSAiaTgiOgogICAgICAgICAgICByZXR1cm4gSEVBUDhbcHRyID4+IDBdOwoKICAgICAgICAgIGNhc2UgImkxNiI6CiAgICAgICAgICAgIHJldHVybiBIRUFQMTZbcHRyID4+IDFdOwoKICAgICAgICAgIGNhc2UgImkzMiI6CiAgICAgICAgICAgIHJldHVybiBIRUFQMzJbcHRyID4+IDJdOwoKICAgICAgICAgIGNhc2UgImk2NCI6CiAgICAgICAgICAgIHJldHVybiBIRUFQMzJbcHRyID4+IDJdOwoKICAgICAgICAgIGNhc2UgImZsb2F0IjoKICAgICAgICAgICAgcmV0dXJuIEhFQVBGMzJbcHRyID4+IDJdOwoKICAgICAgICAgIGNhc2UgImRvdWJsZSI6CiAgICAgICAgICAgIHJldHVybiBIRUFQRjY0W3B0ciA+PiAzXTsKCiAgICAgICAgICBkZWZhdWx0OgogICAgICAgICAgICBhYm9ydCgiaW52YWxpZCB0eXBlIGZvciBnZXRWYWx1ZTogIiArIHR5cGUpOwogICAgICAgIH0KCiAgICAgICAgcmV0dXJuIG51bGw7CiAgICAgIH0KCiAgICAgIHZhciB3YXNtTWVtb3J5OwogICAgICB2YXIgQUJPUlQgPSBmYWxzZTsKCiAgICAgIGZ1bmN0aW9uIGFsaWduVXAoeCwgbXVsdGlwbGUpIHsKICAgICAgICBpZiAoeCAlIG11bHRpcGxlID4gMCkgewogICAgICAgICAgeCArPSBtdWx0aXBsZSAtIHggJSBtdWx0aXBsZTsKICAgICAgICB9CgogICAgICAgIHJldHVybiB4OwogICAgICB9CgogICAgICB2YXIgYnVmZmVyLCBIRUFQOCwgSEVBUFU4LCBIRUFQMTYsIEhFQVAzMiwgSEVBUEYzMiwgSEVBUEY2NDsKCiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUdsb2JhbEJ1ZmZlckFuZFZpZXdzKGJ1ZikgewogICAgICAgIGJ1ZmZlciA9IGJ1ZjsKICAgICAgICBNb2R1bGVbIkhFQVA4Il0gPSBIRUFQOCA9IG5ldyBJbnQ4QXJyYXkoYnVmKTsKICAgICAgICBNb2R1bGVbIkhFQVAxNiJdID0gSEVBUDE2ID0gbmV3IEludDE2QXJyYXkoYnVmKTsKICAgICAgICBNb2R1bGVbIkhFQVAzMiJdID0gSEVBUDMyID0gbmV3IEludDMyQXJyYXkoYnVmKTsKICAgICAgICBNb2R1bGVbIkhFQVBVOCJdID0gSEVBUFU4ID0gbmV3IFVpbnQ4QXJyYXkoYnVmKTsKICAgICAgICBNb2R1bGVbIkhFQVBVMTYiXSA9IG5ldyBVaW50MTZBcnJheShidWYpOwogICAgICAgIE1vZHVsZVsiSEVBUFUzMiJdID0gbmV3IFVpbnQzMkFycmF5KGJ1Zik7CiAgICAgICAgTW9kdWxlWyJIRUFQRjMyIl0gPSBIRUFQRjMyID0gbmV3IEZsb2F0MzJBcnJheShidWYpOwogICAgICAgIE1vZHVsZVsiSEVBUEY2NCJdID0gSEVBUEY2NCA9IG5ldyBGbG9hdDY0QXJyYXkoYnVmKTsKICAgICAgfQoKICAgICAgTW9kdWxlWyJJTklUSUFMX01FTU9SWSJdIHx8IDE2Nzc3MjE2OwogICAgICB2YXIgd2FzbVRhYmxlOwogICAgICB2YXIgX19BVFBSRVJVTl9fID0gW107CiAgICAgIHZhciBfX0FUSU5JVF9fID0gW107CiAgICAgIHZhciBfX0FUUE9TVFJVTl9fID0gW107CgogICAgICBmdW5jdGlvbiBwcmVSdW4oKSB7CiAgICAgICAgaWYgKE1vZHVsZVsicHJlUnVuIl0pIHsKICAgICAgICAgIGlmICh0eXBlb2YgTW9kdWxlWyJwcmVSdW4iXSA9PSAiZnVuY3Rpb24iKSBNb2R1bGVbInByZVJ1biJdID0gW01vZHVsZVsicHJlUnVuIl1dOwoKICAgICAgICAgIHdoaWxlIChNb2R1bGVbInByZVJ1biJdLmxlbmd0aCkgewogICAgICAgICAgICBhZGRPblByZVJ1bihNb2R1bGVbInByZVJ1biJdLnNoaWZ0KCkpOwogICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgY2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gaW5pdFJ1bnRpbWUoKSB7CiAgICAgICAgY2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVElOSVRfXyk7CiAgICAgIH0KCiAgICAgIGZ1bmN0aW9uIHBvc3RSdW4oKSB7CiAgICAgICAgaWYgKE1vZHVsZVsicG9zdFJ1biJdKSB7CiAgICAgICAgICBpZiAodHlwZW9mIE1vZHVsZVsicG9zdFJ1biJdID09ICJmdW5jdGlvbiIpIE1vZHVsZVsicG9zdFJ1biJdID0gW01vZHVsZVsicG9zdFJ1biJdXTsKCiAgICAgICAgICB3aGlsZSAoTW9kdWxlWyJwb3N0UnVuIl0ubGVuZ3RoKSB7CiAgICAgICAgICAgIGFkZE9uUG9zdFJ1bihNb2R1bGVbInBvc3RSdW4iXS5zaGlmdCgpKTsKICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIGNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pOwogICAgICB9CgogICAgICBmdW5jdGlvbiBhZGRPblByZVJ1bihjYikgewogICAgICAgIF9fQVRQUkVSVU5fXy51bnNoaWZ0KGNiKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gYWRkT25Jbml0KGNiKSB7CiAgICAgICAgX19BVElOSVRfXy51bnNoaWZ0KGNiKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gYWRkT25Qb3N0UnVuKGNiKSB7CiAgICAgICAgX19BVFBPU1RSVU5fXy51bnNoaWZ0KGNiKTsKICAgICAgfQoKICAgICAgdmFyIHJ1bkRlcGVuZGVuY2llcyA9IDA7CiAgICAgIHZhciBkZXBlbmRlbmNpZXNGdWxmaWxsZWQgPSBudWxsOwoKICAgICAgZnVuY3Rpb24gYWRkUnVuRGVwZW5kZW5jeShpZCkgewogICAgICAgIHJ1bkRlcGVuZGVuY2llcysrOwoKICAgICAgICBpZiAoTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0pIHsKICAgICAgICAgIE1vZHVsZVsibW9uaXRvclJ1bkRlcGVuZGVuY2llcyJdKHJ1bkRlcGVuZGVuY2llcyk7CiAgICAgICAgfQogICAgICB9CgogICAgICBmdW5jdGlvbiByZW1vdmVSdW5EZXBlbmRlbmN5KGlkKSB7CiAgICAgICAgcnVuRGVwZW5kZW5jaWVzLS07CgogICAgICAgIGlmIChNb2R1bGVbIm1vbml0b3JSdW5EZXBlbmRlbmNpZXMiXSkgewogICAgICAgICAgTW9kdWxlWyJtb25pdG9yUnVuRGVwZW5kZW5jaWVzIl0ocnVuRGVwZW5kZW5jaWVzKTsKICAgICAgICB9CgogICAgICAgIGlmIChydW5EZXBlbmRlbmNpZXMgPT0gMCkgewoKICAgICAgICAgIGlmIChkZXBlbmRlbmNpZXNGdWxmaWxsZWQpIHsKICAgICAgICAgICAgdmFyIGNhbGxiYWNrID0gZGVwZW5kZW5jaWVzRnVsZmlsbGVkOwogICAgICAgICAgICBkZXBlbmRlbmNpZXNGdWxmaWxsZWQgPSBudWxsOwogICAgICAgICAgICBjYWxsYmFjaygpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfQoKICAgICAgTW9kdWxlWyJwcmVsb2FkZWRJbWFnZXMiXSA9IHt9OwogICAgICBNb2R1bGVbInByZWxvYWRlZEF1ZGlvcyJdID0ge307CgogICAgICBmdW5jdGlvbiBhYm9ydCh3aGF0KSB7CiAgICAgICAgewogICAgICAgICAgaWYgKE1vZHVsZVsib25BYm9ydCJdKSB7CiAgICAgICAgICAgIE1vZHVsZVsib25BYm9ydCJdKHdoYXQpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgICB3aGF0ICs9ICIiOwogICAgICAgIGVycih3aGF0KTsKICAgICAgICBBQk9SVCA9IHRydWU7CiAgICAgICAgd2hhdCA9ICJhYm9ydCgiICsgd2hhdCArICIpLiBCdWlsZCB3aXRoIC1zIEFTU0VSVElPTlM9MSBmb3IgbW9yZSBpbmZvLiI7CiAgICAgICAgdmFyIGUgPSBuZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKHdoYXQpOwogICAgICAgIHJlYWR5UHJvbWlzZVJlamVjdChlKTsKICAgICAgICB0aHJvdyBlOwogICAgICB9CgogICAgICB2YXIgZGF0YVVSSVByZWZpeCA9ICJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsIjsKCiAgICAgIGZ1bmN0aW9uIGlzRGF0YVVSSShmaWxlbmFtZSkgewogICAgICAgIHJldHVybiBmaWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpOwogICAgICB9CgogICAgICB2YXIgd2FzbUJpbmFyeUZpbGU7CiAgICAgIHdhc21CaW5hcnlGaWxlID0gImRhdGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxBR0Z6YlFFQUFBQUJZZzVnQ1g5L2YzOS9mMzkvZndCZ0EzOS9md0YvWUFKL2Z3Ri9ZQUYvQVg5Z0FYOEFZQVIvZjM5L0FYOWdCbjkvZjM5L2Z3QmdBbjkvQUdBRGYzOS9BR0FBQUdBSWYzOS9mMzkvZjM4QVlBUi9mMzkvQUdBQUFYOWdCbjkvZjM5L2Z3Ri9BZzBDQVdFQllRQURBV0VCWWdBQkF5UWpBZ0VFQlFVQkF3QUJDQUFHQXdjQ0FRQUdBZ2tEQUFBQUFBUUtCd0lMQkF3RURRSUVCUUZ3QVFFQkJRY0JBWUFDZ0lBQ0Jna0Jmd0ZCZ01UQUFnc0hLUW9CWXdJQUFXUUFGUUZsQUNRQlpnQUlBV2NBQkFGb0FDTUJhUUFpQVdvQUlRRnJBQ0FCYkFFQUN2S1ZCeVAzQ1FFSmZ5QUFLQUlFSVFVQ1FBSkFBa0FDUUFKQUlBQW9BZ3hCQTNRaUNTQUFLQUlRSWdocklnZEJJRTRFUUNBRktBQUFJZ0pCR0hRZ0FrRUlkRUdBZ1B3SGNYSWdBa0VJZGtHQS9nTnhJQUpCR0haeWNpRURJQUFvQWdnaUFrVU5BU0FESUFKMElBVXRBQVJCQ0NBQ2EzWnlJUU1NQVFzZ0IwRUJTQVJBREFJTElBVXRBQUFnQUNnQ0NDSUNRUmhxSWdaMElRTWdBaUFIYWtFSWF5SUVRUUZJRFFBZ0JTRUNBMEFnQWkwQUFTQUdRUWhySWdaMElBTnlJUU1nQkVFSVNpRUhJQUpCQVdvaEFpQUVRUWhySVFRZ0J3MEFDd3NnQTBGL1RBUkFJQUFnQ0VFQmFpSUNOZ0lRSUFBZ0FrRUhjVFlDQ0VFQUlRUWdBaUFKU3cwQ0lBQWdBQ2dDQUNBQ1FRTjJhallDQkF3Q0N5QURRWUNBZ0lBRVR3UkFJQUFnQ0VFRGFpSUNOZ0lRSUFBZ0FrRUhjVFlDQ0VFQklRWWdBaUFKU3cwRUlBQWdBQ2dDQUNBQ1FRTjJhallDQkNBRFFSMTJRUUZ4UVFGcUlRUU1BZ3NnQTBHQWdJQ0FBazhFUUNBQUlBaEJCV29pQWpZQ0VDQUFJQUpCQjNFMkFnaEJBU0VHSUFJZ0NVc05CQ0FBSUFBb0FnQWdBa0VEZG1vMkFnUWdBMEViZGtFRGNVRURhaUVFREFJTElBTkJnSUNBZ0FGSkRRQWdBQ0FJUVFkcUlnSTJBaEFnQUNBQ1FRZHhOZ0lJUVFFaEJpQUNJQWxMRFFNZ0FDQUFLQUlBSUFKQkEzWnFOZ0lFSUFOQkdYWkJCM0ZCQjJvaEJBd0JDMEdBZ0lEQUFDRUVRUVFoQ2tFQUlRSUNRQ0FEUVlDQWdNQUFjUTBBQTBBQ1FDQUNJZ1pCQVdvaEFpQUVRUUpKRFFBZ0JFRUJkaUlFSUFOeFJRMEJDd3NnQmtFRmFpSUtRU0JIRFFBZ0FVRUFOZ0lBSUFBZ0FDZ0NFQ0lLUVFkeElnTTJBZ2dnQUNBS1FTQnFJZ0kyQWhBZ0FpQUFLQUlNUVFOMElnZE5CRUFnQUNBQUtBSUFJQUpCQTNacUlnVTJBZ1FMQWtBZ0J5QUNheUlHUVNCT0JFQWdCU2dBQUNJQ1FSaDBJQUpCQ0hSQmdJRDhCM0Z5SUFKQkNIWkJnUDREY1NBQ1FSaDJjbkloQkNBRFJRMEJJQVFnQTNRZ0JTMEFCRUVJSUFOcmRuSWhCQXdCQ3lBR1FRRklCRUJCQUNFRURBRUxJQVV0QUFBZ0EwRVljaUlDZENFRUlBTWdCbXBCQ0dzaUEwRUJTQTBBQTBBZ0JTMEFBU0FDUVFocklnSjBJQVJ5SVFRZ0EwRUlTaUVHSUFWQkFXb2hCU0FEUVFocklRTWdCZzBBQ3dzZ0FDQUtRU0ZxSWdNMkFoQWdBQ0FEUVFkeElnVTJBZ2hCQVNFR0lBTWdCMHNOQXlBQUlBQW9BZ0FpQWlBRFFRTjJhallDQkNBRVFYOUtEUU1nQUJBV0lRTWdBQ0FGTmdJSUlBQWdDa0hCQUdvaUJUWUNFQ0FGSUFkTERRTWdBQ0FDSUFWQkEzWnFOZ0lFUVg4aEJBSkFJQU1PQWdNQUJBdEJBU0VEREFJTElBQWdBaUFJYWtFRmFpSUlOZ0lRSUFBZ0NFRUhjU0lITmdJSUlBZ2dDVTBFUUNBQUlBQW9BZ0FnQ0VFRGRtb2lCVFlDQkFzQ1FDQUpJQWhySWdOQklFNEVRQ0FGS0FBQUlnWkJHSFFnQmtFSWRFR0FnUHdIY1hJZ0JrRUlka0dBL2dOeElBWkJHSFp5Y2lFRUlBZEZEUUVnQkNBSGRDQUZMUUFFUVFnZ0IydDJjaUVFREFFTElBTkJBVWdFUUVFQUlRUU1BUXNnQlMwQUFDQUhRUmh5SWdaMElRUWdBeUFIYWtFSWF5SURRUUZJRFFBRFFDQUZMUUFCSUFaQkNHc2lCblFnQkhJaEJDQURRUWhLSVFjZ0JVRUJhaUVGSUFOQkNHc2hBeUFIRFFBTEN5QUFJQWdnQ21vaUJUWUNFQ0FBSUFWQkIzRTJBZ2hCQVNFR0lBVWdDVXNOQWlBQUlBQW9BZ0FnQlVFRGRtbzJBZ1FnQkVFY0lBSnJkaUlBUVg5R0RRSWdBRUYvSUFwMFFYOXphaUVFQzBFQUlRTUxJQUVnQkRZQ0FDQURJUVlMSUFZTDhnSUNBbjhCZmdKQUlBSkZEUUFnQUNBQ2FpSURRUUZySUFFNkFBQWdBQ0FCT2dBQUlBSkJBMGtOQUNBRFFRSnJJQUU2QUFBZ0FDQUJPZ0FCSUFOQkEyc2dBVG9BQUNBQUlBRTZBQUlnQWtFSFNRMEFJQU5CQkdzZ0FUb0FBQ0FBSUFFNkFBTWdBa0VKU1EwQUlBQkJBQ0FBYTBFRGNTSUVhaUlESUFGQi93RnhRWUdDaEFoc0lnRTJBZ0FnQXlBQ0lBUnJRWHh4SWdScUlnSkJCR3NnQVRZQ0FDQUVRUWxKRFFBZ0F5QUJOZ0lJSUFNZ0FUWUNCQ0FDUVFocklBRTJBZ0FnQWtFTWF5QUJOZ0lBSUFSQkdVa05BQ0FESUFFMkFoZ2dBeUFCTmdJVUlBTWdBVFlDRUNBRElBRTJBZ3dnQWtFUWF5QUJOZ0lBSUFKQkZHc2dBVFlDQUNBQ1FSaHJJQUUyQWdBZ0FrRWNheUFCTmdJQUlBUWdBMEVFY1VFWWNpSUVheUlDUVNCSkRRQWdBYTFDZ1lDQWdCQitJUVVnQXlBRWFpRUJBMEFnQVNBRk53TVlJQUVnQlRjREVDQUJJQVUzQXdnZ0FTQUZOd01BSUFGQklHb2hBU0FDUVNCcklnSkJIMHNOQUFzTElBQUx6QXdCQjM4Q1FDQUFSUTBBSUFCQkNHc2lBeUFBUVFScktBSUFJZ0ZCZUhFaUFHb2hCUUpBSUFGQkFYRU5BQ0FCUVFOeFJRMEJJQU1nQXlnQ0FDSUJheUlEUVpqQUFDZ0NBRWtOQVNBQUlBRnFJUUFnQTBHY3dBQW9BZ0JIQkVBZ0FVSC9BVTBFUUNBREtBSUlJZ0lnQVVFRGRpSUVRUU4wUWJEQUFHcEdHaUFDSUFNb0Fnd2lBVVlFUUVHSXdBQkJpTUFBS0FJQVFYNGdCSGR4TmdJQURBTUxJQUlnQVRZQ0RDQUJJQUkyQWdnTUFnc2dBeWdDR0NFR0FrQWdBeUFES0FJTUlnRkhCRUFnQXlnQ0NDSUNJQUUyQWd3Z0FTQUNOZ0lJREFFTEFrQWdBMEVVYWlJQ0tBSUFJZ1FOQUNBRFFSQnFJZ0lvQWdBaUJBMEFRUUFoQVF3QkN3TkFJQUloQnlBRUlnRkJGR29pQWlnQ0FDSUVEUUFnQVVFUWFpRUNJQUVvQWhBaUJBMEFDeUFIUVFBMkFnQUxJQVpGRFFFQ1FDQURJQU1vQWh3aUFrRUNkRUc0d2dCcUlnUW9BZ0JHQkVBZ0JDQUJOZ0lBSUFFTkFVR013QUJCak1BQUtBSUFRWDRnQW5keE5nSUFEQU1MSUFaQkVFRVVJQVlvQWhBZ0EwWWJhaUFCTmdJQUlBRkZEUUlMSUFFZ0JqWUNHQ0FES0FJUUlnSUVRQ0FCSUFJMkFoQWdBaUFCTmdJWUN5QURLQUlVSWdKRkRRRWdBU0FDTmdJVUlBSWdBVFlDR0F3QkN5QUZLQUlFSWdGQkEzRkJBMGNOQUVHUXdBQWdBRFlDQUNBRklBRkJmbkUyQWdRZ0F5QUFRUUZ5TmdJRUlBQWdBMm9nQURZQ0FBOExJQU1nQlU4TkFDQUZLQUlFSWdGQkFYRkZEUUFDUUNBQlFRSnhSUVJBSUFWQm9NQUFLQUlBUmdSQVFhREFBQ0FETmdJQVFaVEFBRUdVd0FBb0FnQWdBR29pQURZQ0FDQURJQUJCQVhJMkFnUWdBMEdjd0FBb0FnQkhEUU5Ca01BQVFRQTJBZ0JCbk1BQVFRQTJBZ0FQQ3lBRlFaekFBQ2dDQUVZRVFFR2N3QUFnQXpZQ0FFR1F3QUJCa01BQUtBSUFJQUJxSWdBMkFnQWdBeUFBUVFGeU5nSUVJQUFnQTJvZ0FEWUNBQThMSUFGQmVIRWdBR29oQUFKQUlBRkIvd0ZOQkVBZ0JTZ0NDQ0lDSUFGQkEzWWlCRUVEZEVHd3dBQnFSaG9nQWlBRktBSU1JZ0ZHQkVCQmlNQUFRWWpBQUNnQ0FFRitJQVIzY1RZQ0FBd0NDeUFDSUFFMkFnd2dBU0FDTmdJSURBRUxJQVVvQWhnaEJnSkFJQVVnQlNnQ0RDSUJSd1JBSUFVb0FnZ2lBa0dZd0FBb0FnQkpHaUFDSUFFMkFnd2dBU0FDTmdJSURBRUxBa0FnQlVFVWFpSUNLQUlBSWdRTkFDQUZRUkJxSWdJb0FnQWlCQTBBUVFBaEFRd0JDd05BSUFJaEJ5QUVJZ0ZCRkdvaUFpZ0NBQ0lFRFFBZ0FVRVFhaUVDSUFFb0FoQWlCQTBBQ3lBSFFRQTJBZ0FMSUFaRkRRQUNRQ0FGSUFVb0Fod2lBa0VDZEVHNHdnQnFJZ1FvQWdCR0JFQWdCQ0FCTmdJQUlBRU5BVUdNd0FCQmpNQUFLQUlBUVg0Z0FuZHhOZ0lBREFJTElBWkJFRUVVSUFZb0FoQWdCVVliYWlBQk5nSUFJQUZGRFFFTElBRWdCallDR0NBRktBSVFJZ0lFUUNBQklBSTJBaEFnQWlBQk5nSVlDeUFGS0FJVUlnSkZEUUFnQVNBQ05nSVVJQUlnQVRZQ0dBc2dBeUFBUVFGeU5nSUVJQUFnQTJvZ0FEWUNBQ0FEUVp6QUFDZ0NBRWNOQVVHUXdBQWdBRFlDQUE4TElBVWdBVUYrY1RZQ0JDQURJQUJCQVhJMkFnUWdBQ0FEYWlBQU5nSUFDeUFBUWY4QlRRUkFJQUJCQTNZaUFVRURkRUd3d0FCcUlRQUNmMEdJd0FBb0FnQWlBa0VCSUFGMElnRnhSUVJBUVlqQUFDQUJJQUp5TmdJQUlBQU1BUXNnQUNnQ0NBc2hBaUFBSUFNMkFnZ2dBaUFETmdJTUlBTWdBRFlDRENBRElBSTJBZ2dQQzBFZklRSWdBMElBTndJUUlBQkIvLy8vQjAwRVFDQUFRUWgySWdFZ0FVR0EvajlxUVJCMlFRaHhJZ0YwSWdJZ0FrR0E0QjlxUVJCMlFRUnhJZ0owSWdRZ0JFR0FnQTlxUVJCMlFRSnhJZ1IwUVE5MklBRWdBbklnQkhKcklnRkJBWFFnQUNBQlFSVnFka0VCY1hKQkhHb2hBZ3NnQXlBQ05nSWNJQUpCQW5SQnVNSUFhaUVCQWtBQ1FBSkFRWXpBQUNnQ0FDSUVRUUVnQW5RaUIzRkZCRUJCak1BQUlBUWdCM0kyQWdBZ0FTQUROZ0lBSUFNZ0FUWUNHQXdCQ3lBQVFRQkJHU0FDUVFGMmF5QUNRUjlHRzNRaEFpQUJLQUlBSVFFRFFDQUJJZ1FvQWdSQmVIRWdBRVlOQWlBQ1FSMTJJUUVnQWtFQmRDRUNJQVFnQVVFRWNXb2lCMEVRYWlnQ0FDSUJEUUFMSUFjZ0F6WUNFQ0FESUFRMkFoZ0xJQU1nQXpZQ0RDQURJQU0yQWdnTUFRc2dCQ2dDQ0NJQUlBTTJBZ3dnQkNBRE5nSUlJQU5CQURZQ0dDQURJQVEyQWd3Z0F5QUFOZ0lJQzBHb3dBQkJxTUFBS0FJQVFRRnJJZ0JCZnlBQUd6WUNBQXNMMkFzQkZIOGdBVUdRUFdvdEFBQkJER3dpQjBIRVBHb29BZ0FoQlNBSFFjQThhaWdDQUNBQlFZQThhaTBBQUNJR2RDRUVJQUpGQkVBZ0FDQUFLQUlBSUFSc05nSUFDeUFGSUFaMElRRUNRQUpBSUFOQm5QOERjUVJBUVFFaEF5QUFJQUFvQWpnZ0FXd2lCU0FBS0FJa0lBRnNJZzFxSWd3Z0IwSElQR29vQWdBZ0JuUWlBaUFBS0FJOGJDSUdRUUYxSUFBb0FpZ2dBbXdpQ21vaUQyc2lCellDUENBQUlBMGdCV3NpQlNBS1FRRjFJQVpySWcxcklnWTJBamdnQUNnQ05DRUtJQUFnQlNBTmFpSUZOZ0kwSUFBZ0FDZ0NMQ0FFYkNJSUlBQW9BZ3dnQkd3aURtb2lFQ0FBS0FJZ0lBRnNJZ2tnQVNBS2JDSUtRUUYxYWlJU2F5SU5OZ0lzSUFBZ0RpQUlheUlJSUFsQkFYVWdDbXNpRG1zaUNqWUNLQ0FBSUFnZ0Rtb2lDRFlDSkNBQUlBQW9BaHdnQVd3aURpQUFLQUlJSUFGc0lnbHFJaFFnQUNnQ0VDQUNiQ0lMSUFBb0FqQWdBbXdpRVVFQmRXb2lGV3NpQWpZQ0hDQUFLQUlZSVJNZ0FDQUpJQTVySWdrZ0MwRUJkU0FSYXlJTGF5SU9OZ0lZSUFBb0FoUWhFU0FBSUFrZ0Myb2lDVFlDRkNBQUlBUWdFV3dpQkNBQUtBSUFJZ3RxSWhFZ0FDZ0NCQ0FCYkNJV0lBRWdFMndpRTBFQmRXb2lGMnNpQVRZQ0RDQUFJQXNnQkdzaUN5QVdRUUYxSUJOckloTnJJZ1EyQWdnZ0FDQUxJQk5xSWdzMkFnUWdBQ0FRSUJKcUloQWdFU0FYYWlJU2FrRWdhaUlSSUJRZ0ZXb2lGQ0FNSUE5cUlneEJBWFZxSWc5clFRWjFJaFUyQWpBZ0FDQVNJQkJyUVNCcUloQWdGRUVCZFNBTWF5SU1hMEVHZFNJU05nSWdJQUFnRENBUWFrRUdkU0lNTmdJUUlBQWdEeUFSYWtFR2RTSVBOZ0lBSUE5QmdBUnFRZjhIU3cwQ0lBeEJnQVJxUWY4SFN3MENJQkpCZ0FScVFmOEhTdzBDSUJWQmdBUnFRZjhIU3cwQ0lBQWdDQ0FMYWtFZ2FpSU1JQVZCQVhVZ0NXb2lEMnRCQm5VaUVEWUNOQ0FBSUFzZ0NHdEJJR29pQ0NBSlFRRjFJQVZySWdWclFRWjFJZ2syQWlRZ0FDQUZJQWhxUVFaMUlnVTJBaFFnQUNBTUlBOXFRUVoxSWdnMkFnUWdDRUdBQkdwQi93ZExEUUlnQlVHQUJHcEIvd2RMRFFJZ0NVR0FCR3BCL3dkTERRSWdFRUdBQkdwQi93ZExEUUlnQUNBRUlBcHFRU0JxSWdVZ0JrRUJkU0FPYWlJSWEwRUdkU0lKTmdJNElBQWdCQ0FLYTBFZ2FpSUVJQTVCQVhVZ0Jtc2lCbXRCQm5VaUNqWUNLQ0FBSUFRZ0JtcEJCblVpQkRZQ0dDQUFJQVVnQ0dwQkJuVWlCallDQ0NBR1FZQUVha0gvQjBzTkFpQUVRWUFFYWtIL0Iwc05BaUFLUVlBRWFrSC9CMHNOQWlBSlFZQUVha0gvQjBzTkFpQUFJQUVnRFdwQklHb2lCQ0FIUVFGMUlBSnFJZ1pyUVFaMUlnVTJBandnQUNBQklBMXJRU0JxSWdFZ0FrRUJkU0FIYXlJQ2EwRUdkU0lITmdJc0lBQWdBU0FDYWtFR2RTSUJOZ0ljSUFBZ0JDQUdha0VHZFNJQU5nSU1JQUJCZ0FScVFmOEhTdzBDSUFGQmdBUnFRZjhIU3cwQ0lBZEJnQVJxUWY4SFN3MENJQVZCZ0FScVFmOEhUUTBCREFJTElBTkI0Z0J4UlFSQVFRRWhBeUFBS0FJQVFTQnFRUVoxSWdGQmdBUnFRZjhIU3cwQ0lBQWdBVFlDT0NBQUlBRTJBandnQUNBQk5nSTBJQUFnQVRZQ01DQUFJQUUyQWl3Z0FDQUJOZ0lvSUFBZ0FUWUNKQ0FBSUFFMkFpQWdBQ0FCTmdJY0lBQWdBVFlDR0NBQUlBRTJBaFFnQUNBQk5nSVFJQUFnQVRZQ0RDQUFJQUUyQWdnZ0FDQUJOZ0lFSUFBZ0FUWUNBQXdCQzBFQklRTWdBQ0FBS0FJRUlBRnNJZ1VnQUNnQ0dDQUJiQ0lOUVFGMWFpSUNJQUFvQWdBaUJ5QUFLQUlVSUFSc0lnWnFJZ1JxUVNCcVFRWjFJZ0UyQWpBZ0FDQUVJQUpyUVNCcVFRWjFJZ0kyQWd3Z0FDQUZRUUYxSUExcklnVWdCeUFHYTJwQklHcEJCblVpQkRZQ0JDQUFJQUUyQWdBZ0FDQUJOZ0lnSUFBZ0JEWUNOQ0FBSUFFMkFoQWdBQ0FFTmdJa0lBQWdCRFlDRkNBQUlBSTJBandnQUNBSElBVWdCbXByUVNCcVFRWjFJZ2MyQWdnZ0FDQUhOZ0k0SUFBZ0J6WUNLQ0FBSUFjMkFoZ2dBQ0FDTmdJc0lBQWdBallDSENBQlFZQUVha0gvQjBzTkFTQUVRWUFFYWtIL0Iwc05BU0FIUVlBRWFrSC9CMHNOQVNBQ1FZQUVha0gvQjBzTkFRdEJBQ0VEQ3lBREMvb2FBUkYvSXdCQmdBRnJJZzBrQUNBQUtBSUVJUVFDZndKQUFuOENRQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FDQUFLQUlNSWhKQkEzUWlFQ0FBS0FJUUlnbHJJZ1ZCSUU0RVFDQUVLQUFBSWdWQkdIUWdCVUVJZEVHQWdQd0hjWElnQlVFSWRrR0EvZ054SUFWQkdIWnljaUVHSUFBb0FnZ2lCVVVOQVNBR0lBVjBJQVF0QUFSQkNDQUZhM1p5SVFZTUFRc2dCVUVCU0EwQklBUXRBQUFnQUNnQ0NDSUtRUmhxSWdkMElRWWdCU0FLYWtFSWF5SUZRUUZJRFFBRFFDQUVMUUFCSUFkQkNHc2lCM1FnQm5JaEJpQUZRUWhLSVFvZ0JFRUJhaUVFSUFWQkNHc2hCU0FLRFFBTEN5QUNRUUpQRFFNZ0JrRUFTQVJBUVFFaEN3d09DeUFHUVJsMlFmNEFjVUdBQ0dvZ0JrR0FnSURnQUU4TkRCb2dCa0VWZGtIK0QzRkJ3QWhxSUFaQmdJQ0FDRThOREJvZ0JrR0FnSUFCU1FSQUlBWkJFSFloQkF3Q0N5QUdRUkYyUWY3L0FYRkJrQWxxREF3TFFRQWhCQ0FDUVFKUERRRUxJQVJCQVhSQmtBcHFEQW9MSUFKQkJFOE5BUXdJQ3lBQ1FRUkpEUVlnQWtFSVR3MENJQVpCLy8vLy93Rk5EUUVnQmtFWmRrSCtBSEZCMEExcURBZ0xJQUpCQ0U4TkFnc2dCa0VWZGtIK0QzRkIwQTVxREFZTElBSkJFVWtOQVNBR1FmLy8vLzhCVFEwQ0lBWkJISFpCRG5GQjBCRnFEQVVMSUFKQkVFc05BUXNnQmtFWmRrSCtBSEZCMEJCcURBTUxJQVpCRjNaQi9nTnhRZUFSYWd3Q0N5QUdRWDlNQkVCQkFrR2lFQ0FHUVlDQWdJQUVjUnNoQ3d3REN5QUdRUmwyUWY0QWNVSFFDbW9nQmtHQWdJQ0FBVThOQVJvZ0JrR0FnSUFRU1EwQUlBWkJGblpCL2dkeFFaQUxhZ3dCQ3lBR1FSRjJRZjcvQVhGQjBBdHFDeThCQUNJTERRQkJBUXdCQzBFQklBTWdDMEVMZGlJT1NRMEFHa0VnSUF0QkgzRWlBbXNoQ0VFQUlRVUNRQ0FMUVlBUVNRMEFJQVlnQzNRaEJBSkFJQXRCQlhaQlAzRWlEMFVFUUVFQUlRY01BUXNDUUNBSUlBOVBEUUFnQUNBQ0lBbHFJZ2syQWhBZ0FDQUpRUWR4SWdJMkFnaEJBU0FKSUJCTERRTWFJQUFnQUNnQ0FDQUpRUU4yYWlJRk5nSUVRU0FoQ0NBUUlBbHJJZ3BCSUU0RVFDQUZLQUFBSWdSQkdIUWdCRUVJZEVHQWdQd0hjWElnQkVFSWRrR0EvZ054SUFSQkdIWnljaUVFSUFKRkRRRWdCQ0FDZENBRkxRQUVRUWdnQW10MmNpRUVEQUVMSUFwQkFVZ0VRRUVBSVFRTUFRc2dCUzBBQUNBQ1FSaHlJZ2QwSVFRZ0FpQUtha0VJYXlJR1FRRklEUUFEUUNBRkxRQUJJQWRCQ0dzaUIzUWdCSEloQkNBR1FRaEtJUUlnQlVFQmFpRUZJQVpCQ0dzaEJpQUNEUUFMQzBFQklBOUJBV3QwSVFVZ0JFRWdJQTlyZGlFQ1FRQWhCd05BSUExQlFHc2dCMEVDZEdwQmYwRUJJQUlnQlhFYk5nSUFJQWRCQVdvaEJ5QUZRUUZMSVFvZ0JVRUJkaUVGSUFvTkFBc2dDQ0FQYXlFSUlBUWdEM1FoQkFzZ0J5QU9TUVJBSUE5QkEwa2lGQ0FMUWYrdkFVdHhJUW9EUUFKQUlBaEJEMHNOQUNBQUlBa2dDR3RCSUdvaUNUWUNFQ0FBSUFsQkIzRWlBallDQ0VFQklCSkJBM1FpQkNBSlNRMEVHaUFBSUFBb0FnQWdDVUVEZG1vaUJUWUNCQ0FFSUFscklneEJJRTRFUUNBRktBQUFJZ1JCR0hRZ0JFRUlkRUdBZ1B3SGNYSWdCRUVJZGtHQS9nTnhJQVJCR0haeWNpRUVRU0FoQ0NBQ1JRMEJJQVFnQW5RZ0JTMEFCRUVJSUFKcmRuSWhCQXdCQzBFQklBeEJBVWdOQkJvZ0JTMEFBQ0FDUVJoeUlndDBJUVJCSUNFSUlBSWdER3BCQ0dzaUJrRUJTQTBBQTBBZ0JTMEFBU0FMUVFocklndDBJQVJ5SVFRZ0JrRUlTaUVDSUFWQkFXb2hCU0FHUVFocklRWWdBZzBBQ3d0QkFDRUZBa0FDUUFKL0FrQWdCRUVBU0EwQVFRRWhCU0FFUWYvLy8vOERTdzBBUVFJaEJTQUVRZi8vLy84QlN3MEFRUU1oQlNBRVFmLy8vLzhBU3cwQVFRUWhCU0FFUWYvLy96OUxEUUJCQlNFRklBUkIvLy8vSDBzTkFFRUdJUVVnQkVILy8vOFBTdzBBUVFjaEJTQUVRZi8vL3dkTERRQkJDQ0VGSUFSQi8vLy9BMHNOQUVFSklRVWdCRUgvLy84QlN3MEFRUW9oQlNBRVFmLy8vd0JMRFFCQkN5RUZJQVJCLy84L1N3MEFRUXdoQlNBRVFmLy9IMHNOQUVFTklRVWdCRUgvL3c5TERRQUNmd0pBSUFSQi8vOEhUUVJBSUFSQmdJQjhjVUdBZ0FSR0RRRkJBUXdLQ3lBS1FRUWdDaHNoRENBSVFROXJJUWhCRGlFRklBUkJEM1FNQVFzZ0NrRUJJQW9iSVFvZ0NFRVFheUVJUVF3aERFRVBJUVVnQkVFUWRBc2hCQ0FGSUFwMElRc2dDa1VNQVFzZ0JTQUtkQ0VMUVFFaEV5QUlJQVZCQVdvaUFtc2hDQ0FFSUFKMElRUWdDa1VOQVNBS0lReEJBQXNoRXdKQUlBZ2dERThFUUNBRUlRVU1BUXNnQUNBSklBaHJRU0JxSWdrMkFoQWdBQ0FKUVFkeElnWTJBZ2hCQVNBU1FRTjBJQWxKRFFZYUlBQWdBQ2dDQUNBSlFRTjJhaUlFTmdJRUlCQWdDV3NpRVVFZ1RnUkFJQVFvQUFBaUFrRVlkQ0FDUVFoMFFZQ0EvQWR4Y2lBQ1FRaDJRWUQrQTNFZ0FrRVlkbkp5SVFWQklDRUlJQVpGRFFFZ0JTQUdkQ0FFTFFBRVFRZ2dCbXQyY2lFRkRBRUxRU0FoQ0NBUlFRRklCRUJCQUNFRkRBRUxJQVF0QUFBZ0JrRVljaUlDZENFRklBWWdFV3BCQ0dzaUJrRUJTQTBBQTBBZ0JDMEFBU0FDUVFocklnSjBJQVZ5SVFVZ0JrRUlTaUVSSUFSQkFXb2hCQ0FHUVFocklRWWdFUTBBQ3dzZ0NDQU1heUVJSUFVZ0RIUWhCQ0FGUVNBZ0RHdDJJQXRxSVFzTUFRdEJBQ0VLQ3lBTlFVQnJJQWRCQW5ScVFRQWdDMEVDYWlBTElBY2dEMFliSUFzZ0ZCc2lCVUVDYWtFQmRpSUNheUFDSUFWQkFYRWJOZ0lBUVFFZ0NpQVRHeUlGSUFWQkJra2dBa0VESUFWQkFXdDBTbkZxSVFvZ0IwRUJhaUlISUE1SERRQUxDMEVBSVFjZ0F5QU9Td1JBSUFoQkNFMEVRQ0FKSUFocklRSkJJQ0VJSUFBZ0FrRWdhaUlKTmdJUUlBQWdDVUVIY1RZQ0NFRUJJQWtnRUVzTkF4b2dBQ0FBS0FJQUlBbEJBM1pxTmdJRUlBQVFGaUVFQ3dKQUFrQUNmd0pBSUFOQkJFY0VRQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFJQTVCQVdzT0RnNEFBUUlEQkFVR0J3Z0pDZ3NNRUFzZ0JFRWFka0hnRW1vTURnc2dCRUVhZGtHZ0Uyb01EUXNnQkVFYmRrSGdFMm9NREFzZ0JFRWJka0dBRkdvTUN3c2dCRUVhZGtHZ0ZHb01DZ3NnQkVFYWRrSGdGR29NQ1FzZ0JFRWFka0dnRldvTUNBc2dCRUVhZGtIZ0ZXb01Cd3NnQkVFYmRrR2dGbW9NQmdzZ0JFRWNka0hBRm1vTUJRc2dCRUVjZGtIUUZtb01CQXNnQkVFZGRrSGdGbW9NQXdzZ0JFRWVka0hvRm1vTUFnc2dCRUVBU0FSQVFRRWhCUXdFQzBFUklRVWdEa0VEUmcwRFFSSWhCU0FFUWYvLy8vOERTdzBEUVNJaEJTQU9RUUpHRFFOQk0wRWpJQVJCZ0lDQWdBSkpHeUVGREFNTElBUkJGM1pCd0JKcUlnSWdBaUFFUVJ0MklnSkJvQkpxSUFKQkFVWWJJQVJCZ0lDQXdBQkpHd3N0QUFBaUJRMEJRUUVNQkF0QkFVRVJJQVJCZjBvYklRVUxJQVZCQkhZaEJ5QUlJQVZCRDNFaUFtc2hDQ0FFSUFKMElRUUxJQTVCQVdzaUF3UkFJQkpCQTNRaEQwRUFJUW9EUUFKQUlBY0VRQUpBSUFoQkNrc05BQ0FBSUFrZ0NHdEJJR29pQ1RZQ0VDQUFJQWxCQjNFaUFqWUNDRUVCSUFrZ0Qwc05CaG9nQUNBQUtBSUFJQWxCQTNacUlnVTJBZ1FnRUNBSmF5SU1RU0JPQkVBZ0JTZ0FBQ0lFUVJoMElBUkJDSFJCZ0lEOEIzRnlJQVJCQ0haQmdQNERjU0FFUVJoMmNuSWhCRUVnSVFnZ0FrVU5BU0FFSUFKMElBVXRBQVJCQ0NBQ2EzWnlJUVFNQVF0QklDRUlJQXhCQVVnRVFFRUFJUVFNQVFzZ0JTMEFBQ0FDUVJoeUlndDBJUVFnQWlBTWFrRUlheUlHUVFGSURRQURRQ0FGTFFBQklBdEJDR3NpQzNRZ0JISWhCQ0FHUVFoS0lRSWdCVUVCYWlFRklBWkJDR3NoQmlBQ0RRQUxDd0pBQW44Q1FBSkFBa0FDUUFKQUFrQUNRQ0FIUVFGckRnWUdBQUVDQXdRRkN5QUVRUjUyUWU0V2Fnd0dDeUFFUVI1MlFmSVdhZ3dGQ3lBRVFSMTJRZllXYWd3RUN5QUVRUjEyUWY0V2Fnd0RDeUFFUVIxMlFZWVhhZ3dDQ3dKL1FmTUFJQVJCR1haQjhBQnhheUFFUVlDQWdJQUNUdzBBR2tIMEFDQUVRZi8vLy84QVN3MEFHa0dGQVNBRVFmLy8vejlMRFFBYVFaWUJJQVJCLy8vL0gwc05BQnBCcHdFZ0JFSC8vLzhQU3cwQUdrRzRBU0FFUWYvLy93ZExEUUFhUWNrQklBUkIvLy8vQTBzTkFCcEIyZ0VnQkVILy8vOEJTdzBBR2tFQVFlc0JJQVJCZ0lDQUFVa2JDeUlGUVFSMklBZE5EUUpCQVF3SUN5QUVRUjkyUWV3V2Fnc3RBQUFoQlF0QkFTQUZSUTBGR2lBTklBcEJBblJxSUFWQkJIWWlBa0VCYWpZQ0FDQUhJQUpySVFjZ0NDQUZRUTl4SWdKcklRZ2dCQ0FDZENFRURBRUxJQTBnQ2tFQ2RHcEJBVFlDQUVFQUlRY0xJQXBCQVdvaUNpQURSdzBBQ3lBQklBZEJBblJxSUExQlFHc2dBMEVDZEdvb0FnQTJBZ0FnRGtFQ2F5RUNRUUVnQjNRaEJTQURRUUZ4Qkg4Z0FTQU5JQUpCQW5RaUEyb29BZ0FnQjJvaUIwRUNkR29nRFVGQWF5QURhaWdDQURZQ0FFRUJJQWQwSUFWeUlRVWdEa0VEYXdVZ0Fnc2hCQ0FDUlEwQkEwQWdBU0FOSUFSQkFuUWlBMm9vQWdBZ0Iyb2lBa0VDZEdvZ0RVRkFheUlNSUFOcUtBSUFOZ0lBSUFFZ0RTQUVRUUZySWdOQkFuUWlDbW9vQWdBZ0Ftb2lCMEVDZEdvZ0NpQU1haWdDQURZQ0FFRUJJQUowSUFWeVFRRWdCM1J5SVFVZ0JFRUNheUVFSUFNTkFBc01BUXNnQVNBSFFRSjBhaUFOS0FKQU5nSUFRUUVnQjNRaEJRc2dBQ0FBS0FJUUlBaHJRU0JxSWdFMkFoQWdBQ0FCUVFkeE5nSUlRUUVnQVNBQUtBSU1RUU4wU3cwQUdpQUFJQUFvQWdBZ0FVRURkbW8yQWdRZ0JVRVFkQ0FPUVFSMGNnc2hCQ0FOUVlBQmFpUUFJQVFMZ3dRQkEzOGdBa0dBQkU4RVFDQUFJQUVnQWhBQkdpQUFEd3NnQUNBQ2FpRURBa0FnQUNBQmMwRURjVVVFUUFKQUlBQkJBM0ZGQkVBZ0FDRUNEQUVMSUFKQkFVZ0VRQ0FBSVFJTUFRc2dBQ0VDQTBBZ0FpQUJMUUFBT2dBQUlBRkJBV29oQVNBQ1FRRnFJZ0pCQTNGRkRRRWdBaUFEU1EwQUN3c0NRQ0FEUVh4eElnUkJ3QUJKRFFBZ0FpQUVRVUJxSWdWTERRQURRQ0FDSUFFb0FnQTJBZ0FnQWlBQktBSUVOZ0lFSUFJZ0FTZ0NDRFlDQ0NBQ0lBRW9BZ3cyQWd3Z0FpQUJLQUlRTmdJUUlBSWdBU2dDRkRZQ0ZDQUNJQUVvQWhnMkFoZ2dBaUFCS0FJY05nSWNJQUlnQVNnQ0lEWUNJQ0FDSUFFb0FpUTJBaVFnQWlBQktBSW9OZ0lvSUFJZ0FTZ0NMRFlDTENBQ0lBRW9BakEyQWpBZ0FpQUJLQUkwTmdJMElBSWdBU2dDT0RZQ09DQUNJQUVvQWp3MkFqd2dBVUZBYXlFQklBSkJRR3NpQWlBRlRRMEFDd3NnQWlBRVR3MEJBMEFnQWlBQktBSUFOZ0lBSUFGQkJHb2hBU0FDUVFScUlnSWdCRWtOQUFzTUFRc2dBMEVFU1FSQUlBQWhBZ3dCQ3lBQUlBTkJCR3NpQkVzRVFDQUFJUUlNQVFzZ0FDRUNBMEFnQWlBQkxRQUFPZ0FBSUFJZ0FTMEFBVG9BQVNBQ0lBRXRBQUk2QUFJZ0FpQUJMUUFET2dBRElBRkJCR29oQVNBQ1FRUnFJZ0lnQkUwTkFBc0xJQUlnQTBrRVFBTkFJQUlnQVMwQUFEb0FBQ0FCUVFGcUlRRWdBa0VCYWlJQ0lBTkhEUUFMQ3lBQUM0QXZBUXQvSXdCQkVHc2lDeVFBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FDQUFRZlFCVFFSQVFZakFBQ2dDQUNJSFFSQWdBRUVMYWtGNGNTQUFRUXRKR3lJR1FRTjJJZ0oySWdGQkEzRUVRQ0FCUVg5elFRRnhJQUpxSWdSQkEzUWlBVUc0d0FCcUtBSUFJZ05CQ0dvaEFBSkFJQU1vQWdnaUFpQUJRYkRBQUdvaUFVWUVRRUdJd0FBZ0IwRitJQVIzY1RZQ0FBd0JDeUFDSUFFMkFnd2dBU0FDTmdJSUN5QURJQVJCQTNRaUFVRURjallDQkNBQklBTnFJZ0VnQVNnQ0JFRUJjallDQkF3TUN5QUdRWkRBQUNnQ0FDSUtUUTBCSUFFRVFBSkFRUUlnQW5RaUFFRUFJQUJyY2lBQklBSjBjU0lBUVFBZ0FHdHhRUUZySWdBZ0FFRU1ka0VRY1NJQ2RpSUJRUVYyUVFoeElnQWdBbklnQVNBQWRpSUJRUUoyUVFSeElnQnlJQUVnQUhZaUFVRUJka0VDY1NJQWNpQUJJQUIySWdGQkFYWkJBWEVpQUhJZ0FTQUFkbW9pQkVFRGRDSUFRYmpBQUdvb0FnQWlBeWdDQ0NJQklBQkJzTUFBYWlJQVJnUkFRWWpBQUNBSFFYNGdCSGR4SWdjMkFnQU1BUXNnQVNBQU5nSU1JQUFnQVRZQ0NBc2dBMEVJYWlFQUlBTWdCa0VEY2pZQ0JDQURJQVpxSWdJZ0JFRURkQ0lCSUFacklnUkJBWEkyQWdRZ0FTQURhaUFFTmdJQUlBb0VRQ0FLUVFOMklnRkJBM1JCc01BQWFpRUZRWnpBQUNnQ0FDRURBbjhnQjBFQklBRjBJZ0Z4UlFSQVFZakFBQ0FCSUFkeU5nSUFJQVVNQVFzZ0JTZ0NDQXNoQVNBRklBTTJBZ2dnQVNBRE5nSU1JQU1nQlRZQ0RDQURJQUUyQWdnTFFaekFBQ0FDTmdJQVFaREFBQ0FFTmdJQURBd0xRWXpBQUNnQ0FDSUpSUTBCSUFsQkFDQUphM0ZCQVdzaUFDQUFRUXgyUVJCeElnSjJJZ0ZCQlhaQkNIRWlBQ0FDY2lBQklBQjJJZ0ZCQW5aQkJIRWlBSElnQVNBQWRpSUJRUUYyUVFKeElnQnlJQUVnQUhZaUFVRUJka0VCY1NJQWNpQUJJQUIyYWtFQ2RFRzR3Z0JxS0FJQUlnRW9BZ1JCZUhFZ0Jtc2hCQ0FCSVFJRFFBSkFJQUlvQWhBaUFFVUVRQ0FDS0FJVUlnQkZEUUVMSUFBb0FnUkJlSEVnQm1zaUFpQUVJQUlnQkVraUFoc2hCQ0FBSUFFZ0Foc2hBU0FBSVFJTUFRc0xJQUVvQWhnaENDQUJJQUVvQWd3aUEwY0VRQ0FCS0FJSUlnQkJtTUFBS0FJQVNSb2dBQ0FETmdJTUlBTWdBRFlDQ0F3TEN5QUJRUlJxSWdJb0FnQWlBRVVFUUNBQktBSVFJZ0JGRFFNZ0FVRVFhaUVDQ3dOQUlBSWhCU0FBSWdOQkZHb2lBaWdDQUNJQURRQWdBMEVRYWlFQ0lBTW9BaEFpQUEwQUN5QUZRUUEyQWdBTUNndEJmeUVHSUFCQnYzOUxEUUFnQUVFTGFpSUFRWGh4SVFaQmpNQUFLQUlBSWdsRkRRQkJBQ0FHYXlFRUFrQUNRQUpBQW45QkFDQUdRWUFDU1EwQUdrRWZJQVpCLy8vL0Iwc05BQm9nQUVFSWRpSUFJQUJCZ1A0L2FrRVFka0VJY1NJQ2RDSUFJQUJCZ09BZmFrRVFka0VFY1NJQmRDSUFJQUJCZ0lBUGFrRVFka0VDY1NJQWRFRVBkaUFCSUFKeUlBQnlheUlBUVFGMElBWWdBRUVWYW5aQkFYRnlRUnhxQ3lJSFFRSjBRYmpDQUdvb0FnQWlBa1VFUUVFQUlRQU1BUXRCQUNFQUlBWkJBRUVaSUFkQkFYWnJJQWRCSDBZYmRDRUJBMEFDUUNBQ0tBSUVRWGh4SUFacklnVWdCRThOQUNBQ0lRTWdCU0lFRFFCQkFDRUVJQUloQUF3REN5QUFJQUlvQWhRaUJTQUZJQUlnQVVFZGRrRUVjV29vQWhBaUFrWWJJQUFnQlJzaEFDQUJRUUYwSVFFZ0FnMEFDd3NnQUNBRGNrVUVRRUVBSVFOQkFpQUhkQ0lBUVFBZ0FHdHlJQWx4SWdCRkRRTWdBRUVBSUFCcmNVRUJheUlBSUFCQkRIWkJFSEVpQW5ZaUFVRUZka0VJY1NJQUlBSnlJQUVnQUhZaUFVRUNka0VFY1NJQWNpQUJJQUIySWdGQkFYWkJBbkVpQUhJZ0FTQUFkaUlCUVFGMlFRRnhJZ0J5SUFFZ0FIWnFRUUowUWJqQ0FHb29BZ0FoQUFzZ0FFVU5BUXNEUUNBQUtBSUVRWGh4SUFacklnRWdCRWtoQWlBQklBUWdBaHNoQkNBQUlBTWdBaHNoQXlBQUtBSVFJZ0VFZnlBQkJTQUFLQUlVQ3lJQURRQUxDeUFEUlEwQUlBUkJrTUFBS0FJQUlBWnJUdzBBSUFNb0FoZ2hCeUFESUFNb0Fnd2lBVWNFUUNBREtBSUlJZ0JCbU1BQUtBSUFTUm9nQUNBQk5nSU1JQUVnQURZQ0NBd0pDeUFEUVJScUlnSW9BZ0FpQUVVRVFDQURLQUlRSWdCRkRRTWdBMEVRYWlFQ0N3TkFJQUloQlNBQUlnRkJGR29pQWlnQ0FDSUFEUUFnQVVFUWFpRUNJQUVvQWhBaUFBMEFDeUFGUVFBMkFnQU1DQXNnQmtHUXdBQW9BZ0FpQWswRVFFR2N3QUFvQWdBaEJBSkFJQUlnQm1zaUFVRVFUd1JBUVpEQUFDQUJOZ0lBUVp6QUFDQUVJQVpxSWdBMkFnQWdBQ0FCUVFGeU5nSUVJQUlnQkdvZ0FUWUNBQ0FFSUFaQkEzSTJBZ1FNQVF0Qm5NQUFRUUEyQWdCQmtNQUFRUUEyQWdBZ0JDQUNRUU55TmdJRUlBSWdCR29pQUNBQUtBSUVRUUZ5TmdJRUN5QUVRUWhxSVFBTUNnc2dCa0dVd0FBb0FnQWlDRWtFUUVHVXdBQWdDQ0FHYXlJQk5nSUFRYURBQUVHZ3dBQW9BZ0FpQWlBR2FpSUFOZ0lBSUFBZ0FVRUJjallDQkNBQ0lBWkJBM0kyQWdRZ0FrRUlhaUVBREFvTFFRQWhBQ0FHUVM5cUlna0NmMEhnd3dBb0FnQUVRRUhvd3dBb0FnQU1BUXRCN01NQVFuODNBZ0JCNU1NQVFvQ2dnSUNBZ0FRM0FnQkI0TU1BSUF0QkRHcEJjSEZCMktyVnFnVnpOZ0lBUWZUREFFRUFOZ0lBUWNUREFFRUFOZ0lBUVlBZ0N5SUJhaUlIUVFBZ0FXc2lCWEVpQWlBR1RRMEpRY0REQUNnQ0FDSURCRUJCdU1NQUtBSUFJZ1FnQW1vaUFTQUVUUTBLSUFFZ0Ewc05DZ3RCeE1NQUxRQUFRUVJ4RFFRQ1FBSkFRYURBQUNnQ0FDSUVCRUJCeU1NQUlRQURRQ0FFSUFBb0FnQWlBVThFUUNBQklBQW9BZ1JxSUFSTERRTUxJQUFvQWdnaUFBMEFDd3RCQUJBT0lnRkJmMFlOQlNBQ0lRZEI1TU1BS0FJQUlnUkJBV3NpQUNBQmNRUkFJQUlnQVdzZ0FDQUJha0VBSUFScmNXb2hCd3NnQmlBSFR3MEZJQWRCL3YvLy93ZExEUVZCd01NQUtBSUFJZ01FUUVHNHd3QW9BZ0FpQkNBSGFpSUFJQVJORFFZZ0FDQURTdzBHQ3lBSEVBNGlBQ0FCUncwQkRBY0xJQWNnQ0dzZ0JYRWlCMEgrLy8vL0Iwc05CQ0FIRUE0aUFTQUFLQUlBSUFBb0FnUnFSZzBESUFFaEFBc0NRQ0FBUVg5R0RRQWdCa0V3YWlBSFRRMEFRZWpEQUNnQ0FDSUJJQWtnQjJ0cVFRQWdBV3R4SWdGQi92Ly8vd2RMQkVBZ0FDRUJEQWNMSUFFUURrRi9Sd1JBSUFFZ0Iyb2hCeUFBSVFFTUJ3dEJBQ0FIYXhBT0dnd0VDeUFBSWdGQmYwY05CUXdEQzBFQUlRTU1Cd3RCQUNFQkRBVUxJQUZCZjBjTkFndEJ4TU1BUWNUREFDZ0NBRUVFY2pZQ0FBc2dBa0grLy8vL0Iwc05BVUdBd0FBb0FnQWlBU0FDUVFOcVFYeHhJZ0pxSVFBQ1FBSkFBbjhDUUNBQ1JRMEFJQUFnQVVzTkFDQUJEQUVMSUFBL0FFRVFkRTBOQVNBQUVBQU5BVUdBd0FBb0FnQUxJUUJCaE1BQVFUQTJBZ0JCZnlFQkRBRUxRWURBQUNBQU5nSUFDeUFBUHdCQkVIUkxCRUFnQUJBQVJRMENDMEdBd0FBZ0FEWUNBQ0FCUVg5R0RRRWdBRUYvUmcwQklBQWdBVTBOQVNBQUlBRnJJZ2NnQmtFb2FrME5BUXRCdU1NQVFiakRBQ2dDQUNBSGFpSUFOZ0lBUWJ6REFDZ0NBQ0FBU1FSQVFiekRBQ0FBTmdJQUN3SkFBa0FDUUVHZ3dBQW9BZ0FpQlFSQVFjakRBQ0VBQTBBZ0FTQUFLQUlBSWdRZ0FDZ0NCQ0lDYWtZTkFpQUFLQUlJSWdBTkFBc01BZ3RCbU1BQUtBSUFJZ0JCQUNBQUlBRk5HMFVFUUVHWXdBQWdBVFlDQUF0QkFDRUFRY3pEQUNBSE5nSUFRY2pEQUNBQk5nSUFRYWpBQUVGL05nSUFRYXpBQUVIZ3d3QW9BZ0EyQWdCQjFNTUFRUUEyQWdBRFFDQUFRUU4wSWdSQnVNQUFhaUFFUWJEQUFHb2lBallDQUNBRVFiekFBR29nQWpZQ0FDQUFRUUZxSWdCQklFY05BQXRCbE1BQUlBZEJLR3NpQkVGNElBRnJRUWR4UVFBZ0FVRUlha0VIY1JzaUFHc2lBallDQUVHZ3dBQWdBQ0FCYWlJQU5nSUFJQUFnQWtFQmNqWUNCQ0FCSUFScVFTZzJBZ1JCcE1BQVFmRERBQ2dDQURZQ0FBd0NDeUFBTFFBTVFRaHhEUUFnQkNBRlN3MEFJQUVnQlUwTkFDQUFJQUlnQjJvMkFnUkJvTUFBSUFWQmVDQUZhMEVIY1VFQUlBVkJDR3BCQjNFYklnQnFJZ0kyQWdCQmxNQUFRWlRBQUNnQ0FDQUhhaUlCSUFCcklnQTJBZ0FnQWlBQVFRRnlOZ0lFSUFFZ0JXcEJLRFlDQkVHa3dBQkI4TU1BS0FJQU5nSUFEQUVMUVpqQUFDZ0NBQ0FCU3dSQVFaakFBQ0FCTmdJQUN5QUJJQWRxSVFSQnlNTUFJUUlDUUFOQUlBUWdBaWdDQUVjRVFFSEl3d0FoQUNBQ0tBSUlJZ0lOQVF3Q0N3dEJ5TU1BSVFBZ0FpMEFERUVJY1EwQUlBSWdBVFlDQUNBQ0lBSW9BZ1FnQjJvMkFnUWdBVUY0SUFGclFRZHhRUUFnQVVFSWFrRUhjUnRxSWdrZ0JrRURjallDQkNBRVFYZ2dCR3RCQjNGQkFDQUVRUWhxUVFkeEcyb2lBeUFHSUFscUlnaHJJUUlDUUNBRElBVkdCRUJCb01BQUlBZzJBZ0JCbE1BQVFaVEFBQ2dDQUNBQ2FpSUFOZ0lBSUFnZ0FFRUJjallDQkF3QkN5QURRWnpBQUNnQ0FFWUVRRUdjd0FBZ0NEWUNBRUdRd0FCQmtNQUFLQUlBSUFKcUlnQTJBZ0FnQ0NBQVFRRnlOZ0lFSUFBZ0NHb2dBRFlDQUF3QkN5QURLQUlFSWdCQkEzRkJBVVlFUUNBQVFYaHhJUWNDUUNBQVFmOEJUUVJBSUFNb0FnZ2lCQ0FBUVFOMklnQkJBM1JCc01BQWFrWWFJQVFnQXlnQ0RDSUJSZ1JBUVlqQUFFR0l3QUFvQWdCQmZpQUFkM0UyQWdBTUFnc2dCQ0FCTmdJTUlBRWdCRFlDQ0F3QkN5QURLQUlZSVFZQ1FDQURJQU1vQWd3aUFVY0VRQ0FES0FJSUlnQWdBVFlDRENBQklBQTJBZ2dNQVFzQ1FDQURRUlJxSWdBb0FnQWlCQTBBSUFOQkVHb2lBQ2dDQUNJRURRQkJBQ0VCREFFTEEwQWdBQ0VGSUFRaUFVRVVhaUlBS0FJQUlnUU5BQ0FCUVJCcUlRQWdBU2dDRUNJRURRQUxJQVZCQURZQ0FBc2dCa1VOQUFKQUlBTWdBeWdDSENJRVFRSjBRYmpDQUdvaUFDZ0NBRVlFUUNBQUlBRTJBZ0FnQVEwQlFZekFBRUdNd0FBb0FnQkJmaUFFZDNFMkFnQU1BZ3NnQmtFUVFSUWdCaWdDRUNBRFJodHFJQUUyQWdBZ0FVVU5BUXNnQVNBR05nSVlJQU1vQWhBaUFBUkFJQUVnQURZQ0VDQUFJQUUyQWhnTElBTW9BaFFpQUVVTkFDQUJJQUEyQWhRZ0FDQUJOZ0lZQ3lBRElBZHFJUU1nQWlBSGFpRUNDeUFESUFNb0FnUkJmbkUyQWdRZ0NDQUNRUUZ5TmdJRUlBSWdDR29nQWpZQ0FDQUNRZjhCVFFSQUlBSkJBM1lpQUVFRGRFR3d3QUJxSVFJQ2YwR0l3QUFvQWdBaUFVRUJJQUIwSWdCeFJRUkFRWWpBQUNBQUlBRnlOZ0lBSUFJTUFRc2dBaWdDQ0FzaEFDQUNJQWcyQWdnZ0FDQUlOZ0lNSUFnZ0FqWUNEQ0FJSUFBMkFnZ01BUXRCSHlFQUlBSkIvLy8vQjAwRVFDQUNRUWgySWdBZ0FFR0EvajlxUVJCMlFRaHhJZ1IwSWdBZ0FFR0E0QjlxUVJCMlFRUnhJZ0YwSWdBZ0FFR0FnQTlxUVJCMlFRSnhJZ0IwUVE5MklBRWdCSElnQUhKcklnQkJBWFFnQWlBQVFSVnFka0VCY1hKQkhHb2hBQXNnQ0NBQU5nSWNJQWhDQURjQ0VDQUFRUUowUWJqQ0FHb2hBd0pBQWtCQmpNQUFLQUlBSWdSQkFTQUFkQ0lCY1VVRVFFR013QUFnQVNBRWNqWUNBQ0FESUFnMkFnQWdDQ0FETmdJWURBRUxJQUpCQUVFWklBQkJBWFpySUFCQkgwWWJkQ0VBSUFNb0FnQWhBUU5BSUFFaUJDZ0NCRUY0Y1NBQ1JnMENJQUJCSFhZaEFTQUFRUUYwSVFBZ0JDQUJRUVJ4YWlJREtBSVFJZ0VOQUFzZ0F5QUlOZ0lRSUFnZ0JEWUNHQXNnQ0NBSU5nSU1JQWdnQ0RZQ0NBd0JDeUFFS0FJSUlnQWdDRFlDRENBRUlBZzJBZ2dnQ0VFQU5nSVlJQWdnQkRZQ0RDQUlJQUEyQWdnTElBbEJDR29oQUF3RkN3TkFBa0FnQlNBQUtBSUFJZ0pQQkVBZ0FpQUFLQUlFYWlJRElBVkxEUUVMSUFBb0FnZ2hBQXdCQ3d0QmxNQUFJQWRCS0dzaUJFRjRJQUZyUVFkeFFRQWdBVUVJYWtFSGNSc2lBR3NpQWpZQ0FFR2d3QUFnQUNBQmFpSUFOZ0lBSUFBZ0FrRUJjallDQkNBQklBUnFRU2cyQWdSQnBNQUFRZkREQUNnQ0FEWUNBQ0FGSUFOQkp5QURhMEVIY1VFQUlBTkJKMnRCQjNFYmFrRXZheUlBSUFBZ0JVRVFha2tiSWdKQkd6WUNCQ0FDUWREREFDa0NBRGNDRUNBQ1FjakRBQ2tDQURjQ0NFSFF3d0FnQWtFSWFqWUNBRUhNd3dBZ0J6WUNBRUhJd3dBZ0FUWUNBRUhVd3dCQkFEWUNBQ0FDUVJocUlRQURRQ0FBUVFjMkFnUWdBRUVJYWlFQklBQkJCR29oQUNBQklBTkpEUUFMSUFJZ0JVWU5BQ0FDSUFJb0FnUkJmbkUyQWdRZ0JTQUNJQVZySWdOQkFYSTJBZ1FnQWlBRE5nSUFJQU5CL3dGTkJFQWdBMEVEZGlJQVFRTjBRYkRBQUdvaEFnSi9RWWpBQUNnQ0FDSUJRUUVnQUhRaUFIRkZCRUJCaU1BQUlBQWdBWEkyQWdBZ0Fnd0JDeUFDS0FJSUN5RUFJQUlnQlRZQ0NDQUFJQVUyQWd3Z0JTQUNOZ0lNSUFVZ0FEWUNDQXdCQzBFZklRQWdCVUlBTndJUUlBTkIvLy8vQjAwRVFDQURRUWgySWdBZ0FFR0EvajlxUVJCMlFRaHhJZ0owSWdBZ0FFR0E0QjlxUVJCMlFRUnhJZ0YwSWdBZ0FFR0FnQTlxUVJCMlFRSnhJZ0IwUVE5MklBRWdBbklnQUhKcklnQkJBWFFnQXlBQVFSVnFka0VCY1hKQkhHb2hBQXNnQlNBQU5nSWNJQUJCQW5SQnVNSUFhaUVFQWtBQ1FFR013QUFvQWdBaUFrRUJJQUIwSWdGeFJRUkFRWXpBQUNBQklBSnlOZ0lBSUFRZ0JUWUNBQ0FGSUFRMkFoZ01BUXNnQTBFQVFSa2dBRUVCZG1zZ0FFRWZSaHQwSVFBZ0JDZ0NBQ0VCQTBBZ0FTSUNLQUlFUVhoeElBTkdEUUlnQUVFZGRpRUJJQUJCQVhRaEFDQUNJQUZCQkhGcUlnUW9BaEFpQVEwQUN5QUVJQVUyQWhBZ0JTQUNOZ0lZQ3lBRklBVTJBZ3dnQlNBRk5nSUlEQUVMSUFJb0FnZ2lBQ0FGTmdJTUlBSWdCVFlDQ0NBRlFRQTJBaGdnQlNBQ05nSU1JQVVnQURZQ0NBdEJsTUFBS0FJQUlnQWdCazBOQUVHVXdBQWdBQ0FHYXlJQk5nSUFRYURBQUVHZ3dBQW9BZ0FpQWlBR2FpSUFOZ0lBSUFBZ0FVRUJjallDQkNBQ0lBWkJBM0kyQWdRZ0FrRUlhaUVBREFNTFFRQWhBRUdFd0FCQk1EWUNBQXdDQ3dKQUlBZEZEUUFDUUNBREtBSWNJZ0pCQW5SQnVNSUFhaUlBS0FJQUlBTkdCRUFnQUNBQk5nSUFJQUVOQVVHTXdBQWdDVUYrSUFKM2NTSUpOZ0lBREFJTElBZEJFRUVVSUFjb0FoQWdBMFliYWlBQk5nSUFJQUZGRFFFTElBRWdCellDR0NBREtBSVFJZ0FFUUNBQklBQTJBaEFnQUNBQk5nSVlDeUFES0FJVUlnQkZEUUFnQVNBQU5nSVVJQUFnQVRZQ0dBc0NRQ0FFUVE5TkJFQWdBeUFFSUFacUlnQkJBM0kyQWdRZ0FDQURhaUlBSUFBb0FnUkJBWEkyQWdRTUFRc2dBeUFHUVFOeU5nSUVJQU1nQm1vaUJTQUVRUUZ5TmdJRUlBUWdCV29nQkRZQ0FDQUVRZjhCVFFSQUlBUkJBM1lpQUVFRGRFR3d3QUJxSVFJQ2YwR0l3QUFvQWdBaUFVRUJJQUIwSWdCeFJRUkFRWWpBQUNBQUlBRnlOZ0lBSUFJTUFRc2dBaWdDQ0FzaEFDQUNJQVUyQWdnZ0FDQUZOZ0lNSUFVZ0FqWUNEQ0FGSUFBMkFnZ01BUXRCSHlFQUlBUkIvLy8vQjAwRVFDQUVRUWgySWdBZ0FFR0EvajlxUVJCMlFRaHhJZ0owSWdBZ0FFR0E0QjlxUVJCMlFRUnhJZ0YwSWdBZ0FFR0FnQTlxUVJCMlFRSnhJZ0IwUVE5MklBRWdBbklnQUhKcklnQkJBWFFnQkNBQVFSVnFka0VCY1hKQkhHb2hBQXNnQlNBQU5nSWNJQVZDQURjQ0VDQUFRUUowUWJqQ0FHb2hBUUpBQWtBZ0NVRUJJQUIwSWdKeFJRUkFRWXpBQUNBQ0lBbHlOZ0lBSUFFZ0JUWUNBQXdCQ3lBRVFRQkJHU0FBUVFGMmF5QUFRUjlHRzNRaEFDQUJLQUlBSVFZRFFDQUdJZ0VvQWdSQmVIRWdCRVlOQWlBQVFSMTJJUUlnQUVFQmRDRUFJQUVnQWtFRWNXb2lBaWdDRUNJR0RRQUxJQUlnQlRZQ0VBc2dCU0FCTmdJWUlBVWdCVFlDRENBRklBVTJBZ2dNQVFzZ0FTZ0NDQ0lBSUFVMkFnd2dBU0FGTmdJSUlBVkJBRFlDR0NBRklBRTJBZ3dnQlNBQU5nSUlDeUFEUVFocUlRQU1BUXNDUUNBSVJRMEFBa0FnQVNnQ0hDSUNRUUowUWJqQ0FHb2lBQ2dDQUNBQlJnUkFJQUFnQXpZQ0FDQUREUUZCak1BQUlBbEJmaUFDZDNFMkFnQU1BZ3NnQ0VFUVFSUWdDQ2dDRUNBQlJodHFJQU0yQWdBZ0EwVU5BUXNnQXlBSU5nSVlJQUVvQWhBaUFBUkFJQU1nQURZQ0VDQUFJQU0yQWhnTElBRW9BaFFpQUVVTkFDQURJQUEyQWhRZ0FDQUROZ0lZQ3dKQUlBUkJEMDBFUUNBQklBUWdCbW9pQUVFRGNqWUNCQ0FBSUFGcUlnQWdBQ2dDQkVFQmNqWUNCQXdCQ3lBQklBWkJBM0kyQWdRZ0FTQUdhaUlDSUFSQkFYSTJBZ1FnQWlBRWFpQUVOZ0lBSUFvRVFDQUtRUU4ySWdCQkEzUkJzTUFBYWlFRlFaekFBQ2dDQUNFREFuOUJBU0FBZENJQUlBZHhSUVJBUVlqQUFDQUFJQWR5TmdJQUlBVU1BUXNnQlNnQ0NBc2hBQ0FGSUFNMkFnZ2dBQ0FETmdJTUlBTWdCVFlDRENBRElBQTJBZ2dMUVp6QUFDQUNOZ0lBUVpEQUFDQUVOZ0lBQ3lBQlFRaHFJUUFMSUF0QkVHb2tBQ0FBQys0V0FSQi9JQUFnQkVFQUlBWnJJQUlnQWlBR2FrRUFTQnNpQWlBQ0lBUktHeUlPUVFBZ0RrRUFTaHNpRkdvZ0JVRUFJQWRySUFNZ0F5QUhha0VBU0JzaUFDQUFJQVZLR3lJRElBUnNRUUFnQTBFQVNodHFJUWtnQjBFQUlBTnJJQU5CSDNWeElnb2dBeUFIYWlJVklBVnJJaEpCQUNBRklCVklHeUlYYW1zaER5QUdRUUFnRG1zZ0RrRWZkWEVpQ3lBR0lBNXFJaE1nQkd0QkFDQUVJQk5JSWdBYklnMXFheUVNQWtBZ0RrRUFTQ0FBY2lJWVJRUkFBa0FnQ2tVTkFDQUtRUU54SWdJRVFBTkFJQXBCQVdzaENpQUJJQWtnREJBSElBaHFJUUVnQWtFQmF5SUNEUUFMQ3lBRFFYOXpJQU5CQUNBRFFRQktHMnBCQTBrTkFBTkFJQUVnQ1NBTUVBY2dDR29nQ1NBTUVBY2dDR29nQ1NBTUVBY2dDR29nQ1NBTUVBY2dDR29oQVNBS1FRUnJJZ29OQUFzTElBOUZEUUVnRDBFRGNTSUNCRUFEUUNBUFFRRnJJUThnQVNBSklBd1FCeUFJYWlFQklBUWdDV29oQ1NBQ1FRRnJJZ0lOQUFzTElBVWdCMm9nQTJvZ0JTQVZJQVVnRlVvYlFYOXphaUFEUVFBZ0EwRUFTaHRyUVFOSkRRRURRQ0FCSUFrZ0RCQUhJQWhxSUFRZ0NXb2lBQ0FNRUFjZ0NHb2dBQ0FFYWlJQUlBd1FCeUFJYWlBQUlBUnFJZ0FnREJBSElBaHFJUUVnQUNBRWFpRUpJQTlCQkdzaUR3MEFDd3dCQ3dKQUlBcEZEUUFDUUNBTVJRUkFJQWxCQVdzaEFpQUxSUVJBSUExRkRRSWdBMEYvY3lBRFFRQWdBMEVBU2h0cUlRQWdDa0VEY1NJREJFQURRQ0FLUVFGcklRb2dBU0FDTFFBQUlBMFFBeUFJYWlFQklBTkJBV3NpQXcwQUN3c2dBRUVEU1EwRElBcEJCR3NpQUVFRWNVVUVRQ0FBSVFvZ0FTQUNMUUFBSUEwUUF5QUlhaUFDTFFBQUlBMFFBeUFJYWlBQ0xRQUFJQTBRQXlBSWFpQUNMUUFBSUEwUUF5QUlhaUVCQ3lBQVFRUkpEUU1EUUNBQklBSXRBQUFnRFJBRElBaHFJQUl0QUFBZ0RSQURJQWhxSUFJdEFBQWdEUkFESUFocUlBSXRBQUFnRFJBRElBaHFJQUl0QUFBZ0RSQURJQWhxSUFJdEFBQWdEUkFESUFocUlBSXRBQUFnRFJBRElBaHFJQUl0QUFBZ0RSQURJQWhxSVFFZ0NrRUlheUlLRFFBTERBTUxJQU5CZjNNZ0EwRUFJQU5CQUVvYmFpRUFJQXBCQTNFaEF5QU5CRUFnQXdSQUEwQWdBU0FKTFFBQUlBc1FBeUlCSUF0cUlBSXRBQUFnRFJBREdpQUtRUUZySVFvZ0FTQUlhaUVCSUFOQkFXc2lBdzBBQ3dzZ0FFRURTUTBEQTBBZ0FTQUpMUUFBSUFzUUF5SUFJQXRxSUFJdEFBQWdEUkFER2lBQUlBaHFJQWt0QUFBZ0N4QURJZ0FnQzJvZ0FpMEFBQ0FORUFNYUlBQWdDR29nQ1MwQUFDQUxFQU1pQUNBTGFpQUNMUUFBSUEwUUF4b2dBQ0FJYWlBSkxRQUFJQXNRQXlJQUlBdHFJQUl0QUFBZ0RSQURHaUFBSUFocUlRRWdDa0VFYXlJS0RRQUxEQU1MSUFNRVFBTkFJQXBCQVdzaENpQUJJQWt0QUFBZ0N4QURJQWhxSVFFZ0EwRUJheUlERFFBTEN5QUFRUU5KRFFJZ0NrRUVheUlBUVFSeFJRUkFJQUFoQ2lBQklBa3RBQUFnQ3hBRElBaHFJQWt0QUFBZ0N4QURJQWhxSUFrdEFBQWdDeEFESUFocUlBa3RBQUFnQ3hBRElBaHFJUUVMSUFCQkJFa05BZ05BSUFFZ0NTMEFBQ0FMRUFNZ0NHb2dDUzBBQUNBTEVBTWdDR29nQ1MwQUFDQUxFQU1nQ0dvZ0NTMEFBQ0FMRUFNZ0NHb2dDUzBBQUNBTEVBTWdDR29nQ1MwQUFDQUxFQU1nQ0dvZ0NTMEFBQ0FMRUFNZ0NHb2dDUzBBQUNBTEVBTWdDR29oQVNBS1FRaHJJZ29OQUFzTUFnc2dCQ0FHYWlBT2FpQUVJQk1nQkNBVFNodEJmM05xSVFBZ0MwVUVRQ0FNUVFkeElSQWdBQ0FVYXlFQUlBMUZCRUFnQUVFSFNTRVJBMEFnRENFSElBRWhBaUFKSVFNZ0VDSUFCRUFEUUNBQ0lBTXRBQUE2QUFBZ0IwRUJheUVISUFKQkFXb2hBaUFEUVFGcUlRTWdBRUVCYXlJQURRQUxDeUFSUlFSQUEwQWdBaUFETFFBQU9nQUFJQUlnQXkwQUFUb0FBU0FDSUFNdEFBSTZBQUlnQWlBRExRQURPZ0FESUFJZ0F5MEFCRG9BQkNBQ0lBTXRBQVU2QUFVZ0FpQURMUUFHT2dBR0lBSWdBeTBBQnpvQUJ5QUNRUWhxSVFJZ0EwRUlhaUVESUFkQkNHc2lCdzBBQ3dzZ0FTQUlhaUVCSUFwQkFXc2lDZzBBQ3d3REN5QUFRUWRKSVJZRFFDQU1JUWNnQVNFQ0lBa2hBQ0FRSVJFZ0VBUkFBMEFnQWlBQUlnTXRBQUE2QUFBZ0IwRUJheUVISUFKQkFXb2hBaUFEUVFGcUlRQWdFVUVCYXlJUkRRQUxDeUFXUlFSQUEwQWdBaUFBSWdNdEFBQTZBQUFnQWlBRExRQUJPZ0FCSUFJZ0F5MEFBam9BQWlBQ0lBTXRBQU02QUFNZ0FpQURMUUFFT2dBRUlBSWdBeTBBQlRvQUJTQUNJQU10QUFZNkFBWWdBaUFETFFBSE9nQUhJQUpCQ0dvaEFpQURRUWhxSVFBZ0IwRUlheUlIRFFBTElBTkJCMm9oQXdzZ0FpQURMUUFBSUEwUUF4b2dBU0FJYWlFQklBcEJBV3NpQ2cwQUN3d0NDeUFOQkVBZ0RFRUhjU0VRSUFBZ0RrRUFJQTVCQUVvYmEwRUhTU0VSQTBBZ0FTQUpMUUFBSUFzUUF5SVdJQXRxSVFJZ0RDRUhJQWtoQUNBUUlnRUVRQU5BSUFJZ0FDSURMUUFBT2dBQUlBZEJBV3NoQnlBQ1FRRnFJUUlnQTBFQmFpRUFJQUZCQVdzaUFRMEFDd3NnRVVVRVFBTkFJQUlnQUNJQkxRQUFPZ0FBSUFJZ0FTMEFBVG9BQVNBQ0lBRXRBQUk2QUFJZ0FpQUJMUUFET2dBRElBSWdBUzBBQkRvQUJDQUNJQUV0QUFVNkFBVWdBaUFCTFFBR09nQUdJQUlnQVMwQUJ6b0FCeUFDUVFocUlRSWdBVUVJYWlFQUlBZEJDR3NpQncwQUN5QUJRUWRxSVFNTElBSWdBeTBBQUNBTkVBTWFJQWdnRm1vaEFTQUtRUUZySWdvTkFBc01BZ3NnREVFSGNTRVFJQUFnRkd0QkIwa2hFUU5BSUFFZ0NTMEFBQ0FMRUFNaUFTQUxhaUVDSUF3aEJ5QUpJUU1nRUNJQUJFQURRQ0FDSUFNdEFBQTZBQUFnQjBFQmF5RUhJQUpCQVdvaEFpQURRUUZxSVFNZ0FFRUJheUlBRFFBTEN5QVJSUVJBQTBBZ0FpQURMUUFBT2dBQUlBSWdBeTBBQVRvQUFTQUNJQU10QUFJNkFBSWdBaUFETFFBRE9nQURJQUlnQXkwQUJEb0FCQ0FDSUFNdEFBVTZBQVVnQWlBRExRQUdPZ0FHSUFJZ0F5MEFCem9BQnlBQ1FRaHFJUUlnQTBFSWFpRURJQWRCQ0dzaUJ3MEFDd3NnQVNBSWFpRUJJQXBCQVdzaUNnMEFDd3dCQ3lBQklBZ2dDbXhxSVFFTElBOUZEUUFnREVFSGNTRUtJQVFnQm1vZ0Rtb2dCQ0FUSUFRZ0Uwb2JRWDl6YWlBVWEwRUhTU0VRQTBBZ0FTRUNJQXNFUUNBQklBa3RBQUFnQ3hBRElBdHFJUUlMQWtBZ0RFVUVRQ0FKSVFNTUFRc2dEQ0VISUFraEF5QUtJZ0FFUUFOQUlBSWdBeTBBQURvQUFDQUhRUUZySVFjZ0FrRUJhaUVDSUFOQkFXb2hBeUFBUVFGcklnQU5BQXNMSUJBTkFBTkFJQUlnQXkwQUFEb0FBQ0FDSUFNdEFBRTZBQUVnQWlBRExRQUNPZ0FDSUFJZ0F5MEFBem9BQXlBQ0lBTXRBQVE2QUFRZ0FpQURMUUFGT2dBRklBSWdBeTBBQmpvQUJpQUNJQU10QUFjNkFBY2dBa0VJYWlFQ0lBTkJDR29oQXlBSFFRaHJJZ2NOQUFzTElBMEVRQ0FDSUFOQkFXc3RBQUFnRFJBREdnc2dBU0FJYWlFQklBUWdDV29oQ1NBUFFRRnJJZzhOQUFzTEFrQWdGMFVOQUNBSklBUnJJUWtnR0VVRVFDQVNRUU54SWdJRVFBTkFJQkpCQVdzaEVpQUJJQWtnREJBSElBaHFJUUVnQWtFQmF5SUNEUUFMQ3lBVklBVkJmM05xUVFOSkRRRURRQ0FCSUFrZ0RCQUhJQWhxSUFrZ0RCQUhJQWhxSUFrZ0RCQUhJQWhxSUFrZ0RCQUhJQWhxSVFFZ0VrRUVheUlTRFFBTERBRUxJQXhCQjNFaEJTQUVJQVpxSUE1cUlBUWdFeUFFSUJOS0cwRi9jMm9nRkd0QkIwa2hCQU5BSUFFaEFpQUxCRUFnQVNBSkxRQUFJQXNRQXlBTGFpRUNDd0pBSUF4RkJFQWdDU0VEREFFTElBd2hCeUFKSVFNZ0JTSUFCRUFEUUNBQ0lBTXRBQUE2QUFBZ0IwRUJheUVISUFKQkFXb2hBaUFEUVFGcUlRTWdBRUVCYXlJQURRQUxDeUFFRFFBRFFDQUNJQU10QUFBNkFBQWdBaUFETFFBQk9nQUJJQUlnQXkwQUFqb0FBaUFDSUFNdEFBTTZBQU1nQWlBRExRQUVPZ0FFSUFJZ0F5MEFCVG9BQlNBQ0lBTXRBQVk2QUFZZ0FpQURMUUFIT2dBSElBSkJDR29oQWlBRFFRaHFJUU1nQjBFSWF5SUhEUUFMQ3lBTkJFQWdBaUFEUVFGckxRQUFJQTBRQXhvTElBRWdDR29oQVNBU1FRRnJJaElOQUFzTEM4QUNBUU4vUWN6L3N3WWdBWFpCQVhFaEJDQUJRUU4wSWdOQjVDeHFMUUFBSVFVZ0EwR2tLMm90QUFBaEF3SkFRZnIxcXdVZ0FYWkJBWEVFUUNBQ0lBTkJBWFJxTGdFQUlRRWdCQVJBSUFFZ0FpQUZRUUYwYWk0QkFHcEJBV3BCQVhVUEN5QUFLQUxNQVNJQ1JRMEJJQUFvQWdRZ0FpZ0NCRWNOQVNBQklBSWdCVUVCZEdvdUFSeHFRUUZxUVFGMUR3c2dCQVJBSUFJZ0JVRUJkR291QVFBaEFTQUFLQUxJQVNJQ1JRMEJJQUFvQWdRZ0FpZ0NCRWNOQVNBQklBSWdBMEVCZEdvdUFSeHFRUUZxUVFGMUR3dEJBQ0VCUVFFaEFnSkFJQUFvQXNnQklnUkZEUUFnQUNnQ0JDQUVLQUlFUncwQUlBUWdBMEVCZEdvdUFSd2hBVUVBSVFJTElBQW9Bc3dCSWdORkRRQWdBQ2dDQkNBREtBSUVSdzBBSUFNZ0JVRUJkR291QVJ3aEFDQUNCRUFnQUE4TElBQWdBV3BCQVdwQkFYVWhBUXNnQVF2eUF3RURmeUFCS0FJQUlnTkIvLy8vQjBjRVFDQUJLQUlFSVFRZ0FDQUNJQUpCQTNFZ0FrRVFTU0lDRzBFQ2RDSUZRZkFwYWlnQ0FFRVFRUWdnQWhzaUFteHFJQVZCc0NscUtBSUFhaUlBSUFNZ0FDMEFBR3BCd0RWcUxRQUFPZ0FBSUFFb0FnZ2hBeUFBSUFRZ0FDMEFBV3BCd0RWcUxRQUFPZ0FCSUFFb0Fnd2hCQ0FBSUFNZ0FDMEFBbXBCd0RWcUxRQUFPZ0FDSUFBZ0JDQUFMUUFEYWtIQU5Xb3RBQUE2QUFNZ0FTZ0NGQ0VESUFBZ0Ftb2lBQ0FCS0FJUUlBQXRBQUJxUWNBMWFpMEFBRG9BQUNBQktBSVlJUVFnQUNBRElBQXRBQUZxUWNBMWFpMEFBRG9BQVNBQktBSWNJUU1nQUNBRUlBQXRBQUpxUWNBMWFpMEFBRG9BQWlBQUlBTWdBQzBBQTJwQndEVnFMUUFBT2dBRElBRW9BaVFoQXlBQUlBSnFJZ0FnQVNnQ0lDQUFMUUFBYWtIQU5Xb3RBQUE2QUFBZ0FTZ0NLQ0VFSUFBZ0F5QUFMUUFCYWtIQU5Xb3RBQUE2QUFFZ0FTZ0NMQ0VESUFBZ0JDQUFMUUFDYWtIQU5Xb3RBQUE2QUFJZ0FDQURJQUF0QUFOcVFjQTFhaTBBQURvQUF5QUJLQUkwSVFNZ0FDQUNhaUlBSUFFb0FqQWdBQzBBQUdwQndEVnFMUUFBT2dBQUlBRW9BamdoQWlBQUlBTWdBQzBBQVdwQndEVnFMUUFBT2dBQklBRW9BandoQVNBQUlBSWdBQzBBQW1wQndEVnFMUUFBT2dBQ0lBQWdBU0FBTFFBRGFrSEFOV290QUFBNkFBTUxDNWNrQVJSL0l3QkJnQTVySWhVa0FDQURJQVZxSWhrZ0FTNEJBQ0lPUVFKMWFpRURJQVFnQm1vaUd5QUJMZ0VDSWd0QkFuVnFJUWtnQWlnQ0NFRUVkQ0VNSUFJb0FnUkJCSFFoRFNBQUlBWkJCSFJxSUFWcUlRUUNRQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFBa0FDUUFKQUlBNUJBM0ZCQkhRZ0MwRURjVUVDZEhKQndEdHFLQUlBRGc4QUFRSURCQVVHQndnSkNnc01EUTRQQ3lBQ0tBSUFJQVFnQXlBSklBMGdEQ0FISUFoQkVCQUpEQThMSUFJb0FnQWdCQ0FESUFsQkFtc2dEU0FNSUFjZ0NFRUFFQm9NRGdzZ0NVRUNheUVLUVFBaERpQUNLQUlBSVFzQ1FBSkFJQU5CQUVnTkFDQURJQWRxSUExTERRQWdDVUVDU0EwQUlBZ2dDbXBCQldvZ0RFc05BQ0FLSVE0TUFRc2dDeUFWSUFNZ0NpQU5JQXdnQnlBSVFRVnFJQWNRQ1NBVklRc2dCeUVOUVFBaEF3c2dDeUFOSUE1c0lBTnFhaUFOYWlJSklBMUJCV3hxSVFNZ0NFRUNkaUVSUWNBQUlBZHJJUlFnRFVFQmRDRU1JQTFCQW5RZ0Iyc2hEMEVBSUExckloQkJBWFFoR0FOQUlBY2hFd05BSUFRZ0NTQU1haTBBQUNJT0lBTWdER290QUFBZ0F5QU5haTBBQUNJV0lBTWdHR290QUFBaUMyb2lDbXNnQ2tFQ2RHdHFJQU10QUFBaUVpQURJQkJxTFFBQUlncHFRUlJzYWtFUWFrRUZkVUhBTldvdEFBQTZBREFnQkNBSklBMXFMUUFBSWhjZ0ZpQUtJQXRxSWhwQkJIUnFJQTRnRW1vaUZtdHFJQm9nRm10QkFuUnFRUkJxUVFWMVFjQTFhaTBBQURvQUlDQUVJQWt0QUFBaUZpQVNJQXNnRG1vaUdrRUVkR29nQ2lBWGFpSVNhMm9nR2lBU2EwRUNkR3BCRUdwQkJYVkJ3RFZxTFFBQU9nQVFJQVFnQ1NBUWFpMEFBQ0FLSUE0Z0Yyb2lEa0VFZEdvZ0N5QVdhaUlMYTJvZ0RpQUxhMEVDZEdwQkVHcEJCWFZCd0RWcUxRQUFPZ0FBSUFsQkFXb2hDU0FFUVFGcUlRUWdBMEVCYWlFRElCTkJBV3NpRXcwQUN5QUVJQlJxSVFRZ0F5QVBhaUVESUFrZ0Qyb2hDU0FSUVFGckloRU5BQXNNRFFzZ0FpZ0NBQ0FFSUFNZ0NVRUNheUFOSUF3Z0J5QUlRUUVRR2d3TUN5QUNLQUlBSUFRZ0EwRUNheUFKSUEwZ0RDQUhJQWhCQUJBWkRBc0xJQUlvQWdBZ0JDQURRUUpySUFsQkFtc2dEU0FNSUFjZ0NFRUFFQklNQ2dzZ0FpZ0NBQ0FFSUFOQkFtc2dDVUVDYXlBTklBd2dCeUFJUVFBUUZ3d0pDeUFDS0FJQUlBUWdBMEVDYXlBSlFRSnJJQTBnRENBSElBaEJBaEFTREFnTElBZEJCV29oQ3lBRFFRSnJJUW9nQWlnQ0FDRU9Ba0FDUUNBRFFRSklEUUFnQ2lBTGFpQU5TdzBBSUFsQkFFZ05BQ0FJSUFscUlBeExEUUFnRFNFTERBRUxJQTRnRlNBS0lBa2dEU0FNSUFzZ0NDQUxFQWxCQUNFSklCVWhEa0VBSVFvTFFSQWdCMnNoRkNBTElBZHJJUmdnQjBFQ2RpRVNJQTRnQ1NBTGJDQUthbXBCQldvaEF5QUlJUXNEUUNBRFFRRnJMUUFBSVFrZ0EwRUNheTBBQUNFTUlBTkJBMnN0QUFBaENpQURRUVJyTFFBQUlROGdBMEVGYXkwQUFDRVRJQkloRVFOQUlBUWdBeTBBQUNJT0lCTWdDaUFNYWlJTlFRUjBhaUFKSUE5cUloTnJJQTBnRTJ0QkFuUnFha0VRYWtFRmRVSEFOV290QUFBNkFBQWdCQ0FETFFBQklnMGdEeUFKSUF4cUloTkJCSFJxSUFvZ0Rtb2lEMnRxSUJNZ0QydEJBblJxUVJCcVFRVjFRY0ExYWkwQUFEb0FBU0FFSUFNdEFBSWlFQ0FLSUFrZ0Rtb2lFMEVFZEdvZ0RDQU5haUlLYTJvZ0V5QUthMEVDZEdwQkVHcEJCWFZCd0RWcUxRQUFPZ0FDSUFRZ0F5MEFBeUlYSUF3Z0RTQU9haUlLUVFSMGFpQUpJQkJxSWd4cmFpQUtJQXhyUVFKMGFrRVFha0VGZFVIQU5Xb3RBQUE2QUFNZ0JFRUVhaUVFSUFOQkJHb2hBeUFKSVJNZ0RpRVBJQTBoQ2lBUUlRd2dGeUVKSUJGQkFXc2lFUTBBQ3lBRUlCUnFJUVFnQXlBWWFpRURJQXRCQVdzaUN3MEFDd3dIQ3lBQ0tBSUFJQVFnQTBFQ2F5QUpRUUpySUEwZ0RDQUhJQWhCQUJBWURBWUxJQWRCQldvaEN5QUpRUUpySVE0Z0EwRUNheUVLSUFJb0FnQWhEd0pBQWtBZ0EwRUNTQTBBSUFvZ0Myb2dEVXNOQUNBSlFRSklEUUFnQ0VFRmFpSVVJQTVxSUF4TERRQWdEU0VMREFFTElBOGdGVUhBQ21vaUR5QUtJQTRnRFNBTUlBc2dDRUVGYWlJVUlBc1FDVUVBSVE1QkFDRUtDeUFVQkVBZ0N5QUhheUVZSUFkQkFuWWhFaUFQSUFzZ0Rtd2dDbXBxUVFWcUlRTWdGU0VNQTBBZ0EwRUJheTBBQUNFSklBTkJBbXN0QUFBaEN5QURRUU5yTFFBQUlRNGdBMEVFYXkwQUFDRU5JQU5CQldzdEFBQWhFU0FTSVE4RFFDQU1JQU10QUFBaUNpQVJJQXNnRG1vaUUwRUVkR29nQ1NBTmFpSVJheUFUSUJGclFRSjBhbW8yQWdBZ0RDQURMUUFCSWhNZ0RTQUpJQXRxSWhGQkJIUnFJQW9nRG1vaURXdHFJQkVnRFd0QkFuUnFOZ0lFSUF3Z0F5MEFBaUlRSUE0Z0NTQUthaUlPUVFSMGFpQUxJQk5xSWcxcmFpQU9JQTFyUVFKMGFqWUNDQ0FNSUFNdEFBTWlGeUFLSUJOcUlnNUJCSFFnQzJvZ0NTQVFhaUlMYTJvZ0RpQUxhMEVDZEdvMkFnd2dERUVRYWlFTUlBTkJCR29oQXlBSklSRWdDaUVOSUJNaERpQVFJUXNnRnlFSklBOUJBV3NpRHcwQUN5QURJQmhxSVFNZ0ZFRUJheUlVRFFBTEN5QVZJQWRCQW5RaURHb2lDU0FIUVJSc2FpRURJQWhCQW5ZaEQwSEFBQ0FIYXlFWFFRQWdCMnNpRkVFRGRDRVlJQWRCQTNRaEVTQUhRUU5zUVFKMElSTURRQ0FISVEwRFFDQUVJQWtnRVdvb0FnQWlEaUFESUJGcUtBSUFJQU1nREdvb0FnQWlGaUFESUJocUtBSUFJZ3RxSWdwcklBcEJBblJyYWlBREtBSUFJaEFnQXlBVVFRSjBJaHBxS0FJQUlncHFRUlJzYWtHQUJHcEJDblZCd0RWcUxRQUFPZ0F3SUFRZ0NTQU1haWdDQUNJU0lCWWdDaUFMYWlJY1FRUjBhaUFPSUJCcUloWnJhaUFjSUJaclFRSjBha0dBQkdwQkNuVkJ3RFZxTFFBQU9nQWdJQVFnQ1NnQ0FDSVdJQkFnQ3lBT2FpSWNRUVIwYWlBS0lCSnFJaEJyYWlBY0lCQnJRUUowYWtHQUJHcEJDblZCd0RWcUxRQUFPZ0FRSUFRZ0NTQWFhaWdDQUNBS0lBNGdFbW9pRGtFRWRHb2dDeUFXYWlJTGEyb2dEaUFMYTBFQ2RHcEJnQVJxUVFwMVFjQTFhaTBBQURvQUFDQUpRUVJxSVFrZ0JFRUJhaUVFSUFOQkJHb2hBeUFOUVFGcklnME5BQXNnQkNBWGFpRUVJQU1nRTJvaEF5QUpJQk5xSVFrZ0QwRUJheUlQRFFBTERBVUxJQUlvQWdBZ0JDQURRUUpySUFsQkFtc2dEU0FNSUFjZ0NFRUJFQmdNQkFzZ0FpZ0NBQ0FFSUFOQkFtc2dDU0FOSUF3Z0J5QUlRUUVRR1F3REN5QUNLQUlBSUFRZ0EwRUNheUFKUVFKcklBMGdEQ0FISUFoQkFSQVNEQUlMSUFJb0FnQWdCQ0FEUVFKcklBbEJBbXNnRFNBTUlBY2dDRUVCRUJjTUFRc2dBaWdDQUNBRUlBTkJBbXNnQ1VFQ2F5QU5JQXdnQnlBSVFRTVFFZ3NnQVM0QkFDSU9RUU4xSUJsQkFYWnFJUThnQVM0QkFpSUxRUU4xSUJ0QkFYWnFJUU1nQWlnQ0FDQUNLQUlFSWdvZ0FpZ0NDQ0lDYkVFSWRHb2hBU0FBSUFaQkFuUkJlSEZxSUFWQkFYWnFRWUFDYWlFRUlBaEJBWFloRVNBSFFRRjJJUTBnQzBFSGNTRVFJQUpCQTNRaEFDQUtRUU4wSVFvQ1FBSkFJQTVCQjNFaUVrVU5BQ0FRUlEwQUlBMUJBV29oRGtFQUlRVUNRQUpBSUE5QkFFZ05BQ0FPSUE5cUlBcExEUUFnQTBFQVNBMEFJQU1nRVdwQkFXb2dBRXNOQUNBQUlRWWdDaUVPSUFNaEJRd0JDeUFCSUJVZ0R5QURJQW9nQUNBT0lCRkJBV29pQmlBT0VBa2dBU0FBSUFwc2FpQVZJQVlnRG14cUlBOGdBeUFLSUFBZ0RpQUdJQTRRQ1NBVklRRkJBQ0VQQzBFUUlBMXJJUmNnQjBFQ2RpRUFRUWdnRUdzaEEwRUlJQkpySVFrZ0RrRUJkQ0lNSUExcklSUWdBU0FGSUE1c2FpQVBhaUVMSUFRaENpQUlRUUoySWdjaEFnTkFJQkFnQ3lBTWFpMEFBR3dnQXlBTElBNXFMUUFBSWdoc2FpRU5JQWdnRUd3Z0F5QUxMUUFBYkdvaEV5QUFJUkVEUUNBTFFRRnFJZ2dnREdvdEFBQWhHU0FLSUFrZ0Uyd2dFQ0FJSUE1cUxRQUFJZ2hzSUFNZ0N5MEFBV3hxSWhNZ0VteHFRU0JxUVFaMk9nQUFJQW9nQ1NBTmJDQVFJQmxzSUFNZ0NHeHFJZ2dnRW14cVFTQnFRUVoyT2dBSUlBc3RBQUloRFNBTFFRSnFJZ3NnREdvdEFBQWhHU0FLSUFrZ0Uyd2dFQ0FMSUE1cUxRQUFJaHRzSUFNZ0RXeHFJaE1nRW14cVFTQnFRUVoyT2dBQklBb2dDQ0FKYkNBUUlCbHNJQU1nRzJ4cUlnMGdFbXhxUVNCcVFRWjJPZ0FKSUFwQkFtb2hDaUFSUVFGckloRU5BQXNnQ3lBVWFpRUxJQW9nRjJvaENpQUNRUUZySWdJTkFBc2dCRUZBYXlFS0lBRWdCU0FHYWlBT2JHb2dEMm9oQ3dOQUlCQWdDeUFNYWkwQUFHd2dBeUFMSUE1cUxRQUFJZ0ZzYWlFTklBRWdFR3dnQXlBTExRQUFiR29oRXlBQUlSRURRQ0FMUVFGcUlnRWdER290QUFBaEFpQUtJQWtnRTJ3Z0VDQUJJQTVxTFFBQUlnRnNJQU1nQ3kwQUFXeHFJZ1FnRW14cVFTQnFRUVoyT2dBQUlBb2dDU0FOYkNBQ0lCQnNJQUVnQTJ4cUlnRWdFbXhxUVNCcVFRWjJPZ0FJSUFzdEFBSWhBaUFMUVFKcUlnc2dER290QUFBaEJTQUtJQVFnQ1d3Z0VDQUxJQTVxTFFBQUlnUnNJQUlnQTJ4cUloTWdFbXhxUVNCcVFRWjJPZ0FCSUFvZ0FTQUpiQ0FGSUJCc0lBTWdCR3hxSWcwZ0VteHFRU0JxUVFaMk9nQUpJQXBCQW1vaENpQVJRUUZySWhFTkFBc2dDeUFVYWlFTElBb2dGMm9oQ2lBSFFRRnJJZ2NOQUFzTUFRc2dFZ1JBSUExQkFXb2hDMEVBSVFJQ1FBSkFJQTlCQUVnTkFDQUxJQTlxSUFwTERRQWdBMEVBU0EwQUlBTWdFV29nQUVzTkFDQUFJUkVnQ2lFTElBTWhBZ3dCQ3lBQklCVWdEeUFESUFvZ0FDQUxJQkVnQ3hBSklBRWdBQ0FLYkdvZ0ZTQUxJQkZzYWlBUElBTWdDaUFBSUFzZ0VTQUxFQWtnRlNFQlFRQWhEd3RCRUNBTmF5RUdJQWRCQW5ZaEFFRUlJQkpySVFNZ0MwRUJkQ0FOYXlFSElBRWdBaUFMYkdvZ0Qyb2hDU0FFSVF3Z0NFRUNkaUlVSVFVRFFDQUFJUTREUUNBSlFRRnFJQXRxTFFBQUlRZ2dDU0FMYWkwQUFDRUtJQXdnRWlBSkxRQUJJZzFzSUFNZ0NTMEFBR3hxUVFOMFFTQnFRUVoyT2dBQUlBd2dDQ0FTYkNBRElBcHNha0VEZEVFZ2FrRUdkam9BQ0NBSkxRQUNJUW9nQ1VFQ2FpSUpJQXRxTFFBQUlSTWdEQ0FLSUJKc0lBTWdEV3hxUVFOMFFTQnFRUVoyT2dBQklBd2dFaUFUYkNBRElBaHNha0VEZEVFZ2FrRUdkam9BQ1NBTVFRSnFJUXdnRGtFQmF5SU9EUUFMSUFjZ0NXb2hDU0FHSUF4cUlRd2dCVUVCYXlJRkRRQUxJQVJCUUdzaERDQUJJQUlnRVdvZ0MyeHFJQTlxSVFrRFFDQUFJUTREUUNBSlFRRnFJQXRxTFFBQUlRRWdDU0FMYWkwQUFDRUNJQXdnRWlBSkxRQUJJZ1JzSUFNZ0NTMEFBR3hxUVFOMFFTQnFRUVoyT2dBQUlBd2dBU0FTYkNBQ0lBTnNha0VEZEVFZ2FrRUdkam9BQ0NBSkxRQUNJUUlnQ1VFQ2FpSUpJQXRxTFFBQUlRVWdEQ0FDSUJKc0lBTWdCR3hxUVFOMFFTQnFRUVoyT2dBQklBd2dCU0FTYkNBQklBTnNha0VEZEVFZ2FrRUdkam9BQ1NBTVFRSnFJUXdnRGtFQmF5SU9EUUFMSUFjZ0NXb2hDU0FHSUF4cUlRd2dGRUVCYXlJVURRQUxEQUVMSUJBRVFFRUFJUUlDUUFKQUlBOUJBRWdOQUNBTklBOXFJQXBMRFFBZ0EwRUFTQTBBSUFNZ0VXcEJBV29nQUVzTkFDQUFJUVVnQXlFQ0RBRUxJQUVnRlNBUElBTWdDaUFBSUEwZ0VVRUJhaUlGSUEwUUNTQUJJQUFnQ214cUlCVWdCU0FOYkdvZ0R5QURJQW9nQUNBTklBVWdEUkFKSUJVaEFTQU5JUXBCQUNFUEMwRVFJQTFySVJFZ0IwRUNkaUVBUVFnZ0VHc2hBeUFLUVFGMElnWWdEV3NoQnlBQklBSWdDbXhxSUE5cUlRa2dCQ0VNSUFoQkFuWWlDeUVVQTBBZ0FDRU9BMEFnQmlBSmFpMEFBQ0VJSUF3Z0F5QUpMUUFBYkNBUUlBa2dDbW90QUFBaURXeHFRUU4wUVNCcVFRWjJPZ0FBSUF3Z0F5QU5iQ0FJSUJCc2FrRURkRUVnYWtFR2Rqb0FDQ0FKUVFGcUlnZ2dCbW90QUFBaERTQU1JQU1nQ1MwQUFXd2dFQ0FJSUFwcUxRQUFJZ2hzYWtFRGRFRWdha0VHZGpvQUFTQU1JQU1nQ0d3Z0RTQVFiR3BCQTNSQklHcEJCblk2QUFrZ0RFRUNhaUVNSUFsQkFtb2hDU0FPUVFGcklnNE5BQXNnQnlBSmFpRUpJQXdnRVdvaERDQVVRUUZySWhRTkFBc2dCRUZBYXlFTUlBRWdBaUFGYWlBS2JHb2dEMm9oQ1FOQUlBQWhEZ05BSUFZZ0NXb3RBQUFoQVNBTUlBTWdDUzBBQUd3Z0VDQUpJQXBxTFFBQUlnSnNha0VEZEVFZ2FrRUdkam9BQUNBTUlBSWdBMndnQVNBUWJHcEJBM1JCSUdwQkJuWTZBQWdnQ1VFQmFpSUJJQVpxTFFBQUlRSWdEQ0FESUFrdEFBRnNJQkFnQVNBS2FpMEFBQ0lCYkdwQkEzUkJJR3BCQm5ZNkFBRWdEQ0FCSUFOc0lBSWdFR3hxUVFOMFFTQnFRUVoyT2dBSklBeEJBbW9oRENBSlFRSnFJUWtnRGtFQmF5SU9EUUFMSUFjZ0NXb2hDU0FNSUJGcUlRd2dDMEVCYXlJTERRQUxEQUVMSUFFZ0JDQVBJQU1nQ2lBQUlBMGdFVUVJRUFrZ0FTQUFJQXBzYWlBRVFVQnJJQThnQXlBS0lBQWdEU0FSUVFnUUNRc2dGVUdBRG1va0FBdjFGd0VnZnlNQVFkQURheUlHSkFBZ0FTQUJLQUlBSWdvZ0FTZ0NCQ0lJSUFKc0loUWdBMm9pQnlBSWNDSUxRUVIwYWlBSElBdHJJZ2xCQ0hScU5nSU1JQUVnQ2lBSUlBRW9BZ2dpQjJ3aURFRUlkR29pSENBSlFRWjBhaUFMUVFOMGFpSUxOZ0lRSUFFZ0N5QU1RUVowSWlKcU5nSVVJQUJDQURjQ0RDQUFRaWczQWhRZ0FFRUFOZ0lJSUFCQkJqWUNBQ0FEUVFSMElRc0NRQUpBQWtBZ0JFRUNhdzRHQVFBQUFBQUJBQXNnQmtFQU5nSU1JQVlnQnpZQ0dDQUdJQWcyQWhRZ0JpQUZOZ0lRSUFWRkJFQU1BUXNnQmtIUUFHb2lBQ0FHUVF4cUlBWkJFR29nQ3lBQ1FRUjBRUUJCQUVFUVFSQVFEQ0FCSUFBUUR3d0JDeUFHUWRBQWFrRUFRWUFERUFNYUlBb2dGRUVJZEdvZ0Myb2hEQ0FHUWdBM0EwZ2dCa0ZBYTBJQU53TUFJQVpDQURjRE9DQUdRZ0EzQXpBZ0JrSUFOd01vSUFaQ0FEY0RJQ0FHUWdBM0F4Z2dCa0lBTndNUVFRQWhCVUVBSVFrQ2Z3SkFJQUlFUUNBQUlBaEJxSDVzYWlnQ3hBRU5BUXRCQUNFTFFRQU1BUXNnQmlBTUlBaEJCSFJySWdRdEFBVWdCQzBBQkdvZ0JDMEFCbW9nQkMwQUIyb2lGaUFFTFFBRElBUXRBQUlnQkMwQUFTQUVMUUFBYW1wcUloVnFJZ29nQkMwQUR5QUVMUUFPSUFRdEFBMGdCQzBBREdwcWFpSVlJQVF0QUFzZ0JDMEFDaUFFTFFBSklBUXRBQWhxYW1vaUYyb2lCR3NpQ1RZQ0ZDQUdJQVFnQ21vaUN6WUNFRUVCSVJsQkFRc2hCQUpBSUFkQkFXc2dBa1lOQUNBQUlBaEIyQUZzYWlnQ3hBRkZCRUFNQVFzZ0JpQU1JQWhCQ0hScUlnSXRBQVVnQWkwQUJHb2dBaTBBQm1vZ0FpMEFCMm9pSFNBQ0xRQURJQUl0QUFJZ0FpMEFBU0FDTFFBQWFtcHFJaDVxSWdVZ0FpMEFEeUFDTFFBT0lBSXRBQTBnQWkwQURHcHFhaUlmSUFJdEFBc2dBaTBBQ2lBQ0xRQUpJQUl0QUFocWFtb2lJR29pQW1zZ0NXb2lDVFlDRkNBR0lBSWdCV29nQzJvaUN6WUNFRUVCSVFVZ0JFRUJhaUVFQ3dKL0FrQWdBMFVOQUNBQVFSUnJLQUlBUlEwQUlBWWdERUVCYXlJQ0lBaEJCblFpRUdvaUNpQUlRUVIwSWdkcUxRQUFJQW90QUFCcUlBb2dDRUVGZENJTmFpMEFBR29nQ2lBSVFUQnNJZzlxTFFBQWFpSWFJQUlnRDJvdEFBQWdBaUFOYWkwQUFDQUNJQWRxTFFBQUlBSXRBQUJxYW1vaUcyb2lFU0FLSUJCcUlnSWdFR29pQ2lBSGFpMEFBQ0FLTFFBQWFpQUtJQTFxTFFBQWFpQUtJQTlxTFFBQWFpSVFJQUlnRDJvdEFBQWdBaUFOYWkwQUFDQUNJQWRxTFFBQUlBSXRBQUJxYW1vaUQyb2lBbXNpQnpZQ0lDQUdJQUlnRVdvZ0Myb2lDellDRUVFQklSRWdCRUVCYWlFS1FRRU1BUXRCQUNFSElBUWhDa0VBQ3lFQ0FrQUNRQUpBQWtBQ1FDQURJQWhCQVd0SEJFQWdBQ2dDbkFNTkFRc2dCQTBCREFJTElBY2dERUVRYWlJSElBaEJCblFpRTJvaUFDQUlRUVIwSWcxcUxRQUFJQUF0QUFCcUlBQWdDRUVGZENJU2FpMEFBR29nQUNBSVFUQnNJZzVxTFFBQWFpQUhJQTVxTFFBQUlBY2dFbW90QUFBZ0J5QU5haTBBQUNBTUxRQVFhbXBxYWlJTUlBQWdFMm9pQUNBVGFpSUhJQTFxTFFBQUlBY3RBQUJxSUFjZ0Vtb3RBQUJxSUFjZ0Rtb3RBQUJxSWhNZ0FDQU9haTBBQUNBQUlCSnFMUUFBSUFBZ0RXb3RBQUFnQUMwQUFHcHFhaUlBYWlJTmEyb2hCeUFNSUExcUlBdHFJUXRCQVNFU0lBSkJBV29oQWlBS1FRRnFJUW9nRVVVZ0JFRUFSM0pGQkVBZ0dpQWJhaUFQYWlBUWFpQUFJQXhxSUJOcWEwRUZkU0VKREFNTElBUkZEUUlMSUFrZ0JFRURhblVoQ1FzZ0dTQUNSWEVnQlhFRVFDQVZJQlpxSUJkcUlCaHFJQjhnSUdvZ0hXb2dIbXByUVFWMUlRY01BZ3NnQWtVTkFRc2dCeUFDUVFOcWRTRUhDeUFHQW44Q1FBSkFBa0FDUUNBS1FRRnJEZ01BQVFJREN5QUxRUVIyREFNTElBdEJCWFlNQWdzZ0MwRVZiRUVLZGd3QkN5QUxRUVoyQ3lJQU5nSVFBbjhnQnlBSmNrVUVRQ0FHSUFBMkFrZ2dCaUFBTmdKTUlBWWdBRFlDUkNBR0lBQTJBa0FnQmlBQU5nSThJQVlnQURZQ09DQUdJQUEyQWpRZ0JpQUFOZ0l3SUFZZ0FEWUNMQ0FHSUFBMkFpZ2dCaUFBTmdJa0lBWWdBRFlDSUNBR0lBQTJBaHdnQmlBQU5nSVlJQVlnQURZQ0ZDQUdRZEFBYWlFSElBWkJFR29oQ1VFQURBRUxJQVlnQUNBSmFpSUVJQWRyTmdKQUlBWWdCQ0FIUVFGMUlnSnJOZ0l3SUFZZ0FpQUVhallDSUNBR0lBUWdCMm8yQWhBZ0JpQUFJQWxySWdRZ0IyczJBa3dnQmlBRUlBSnJOZ0k4SUFZZ0FpQUVhallDTENBR0lBUWdCMm8yQWh3Z0JpQUFJQWxCQVhVaUNtb2lCQ0FIYXpZQ1JDQUdJQVFnQW1zMkFqUWdCaUFDSUFScU5nSWtJQVlnQkNBSGFqWUNGQ0FHSUFBZ0Ntc2lBQ0FIYXpZQ1NDQUdJQUFnQW1zMkFqZ2dCaUFBSUFKcU5nSW9JQVlnQUNBSGFqWUNHQ0FHUWRBQWFpRUhJQVpCRUdvaENVRUFDeUVBQTBBZ0J5QUpJQUJCREhGcUtBSUFJZ0pCL3dFZ0FrSC9BVWdiSWdKQkFDQUNRUUJLR3lJQ09nQUJJQWNnQWpvQUFDQUhRUUpxSVFjZ0NTQUFRUUpxSWdCQlBuRkZRUVIwYWlFSklBQkJnQUpIRFFBTElCd2dGRUVHZEdvZ0EwRURkR29oQXlBSVFRUjBJUTBnQ0VFR2RDRVVRUUFnQ0VFRGRDSU1heUVUSUFaQjBBSnFJUndnQmtGQWF5RWpRUUFoQzBFQUlRb0RRQ0FHUWdBM0EwZ2dJMElBTndNQUlBWkNBRGNET0NBR1FnQTNBekFnQmtJQU53TW9JQVpDQURjRElDQUdRZ0EzQXhnZ0JrSUFOd01RUVFBaENVRUFJUUJCQUNFQ0lCa0VRQ0FHSUFNZ0Uyb2lBQzBBQXlBQUxRQUNhaUlXSUFBdEFBRWdBQzBBQUdvaUZXb2lBaUFBTFFBSElBQXRBQVpxSWhnZ0FDMEFCU0FBTFFBRWFpSVhhaUlBYXlJSk5nSVVJQVlnQUNBQ2FpSUFOZ0lRUVFFaEFnc2dCUVJBSUFZZ0F5QVVhaUlFTFFBRElBUXRBQUpxSWgwZ0JDMEFBU0FFTFFBQWFpSWVhaUlJSUFRdEFBY2dCQzBBQm1vaUh5QUVMUUFGSUFRdEFBUnFJaUJxSWdScklBbHFJZ2syQWhRZ0JpQUVJQWhxSUFCcUlnQTJBaEFnQWtFQmFpRUNDMEVBSVFjQ2Z5QVJSUVJBSUFJaENFRUFEQUVMSUFZZ0EwRUJheUlFSUExcUlnZ2dER290QUFBZ0NDMEFBR29pR2lBRUlBeHFMUUFBSUFRdEFBQnFJaHRxSWc0Z0NDQU5haUlFSUExcUlnZ2dER290QUFBZ0NDMEFBR29pRUNBRUlBeHFMUUFBSUFRdEFBQnFJZzlxSWdScklnYzJBaUFnQmlBRUlBNXFJQUJxSWdBMkFoQWdBa0VCYWlFSVFRRUxJUVFDUUFKQUFrQUNRQ0FTUlFSQUlBSU5BUXdDQ3lBSElBTkJDR29pRGlBTmFpSUhJQXhxTFFBQUlBY3RBQUJxSUF3Z0Rtb3RBQUFnQXkwQUNHcHFJZzRnQnlBTmFpSUhJQTFxSWlFZ0RHb3RBQUFnSVMwQUFHb2lJU0FISUF4cUxRQUFJQWN0QUFCcUlpUnFJaVZyYWlFSElBNGdKV29nQUdvaEFDQUVRUUZxSVFRZ0NFRUJhaUVJSUJGRklBSkJBRWR5UlFSQUlCb2dHMm9nRDJvZ0VHb2dEaUFrYWlBaGFtdEJCSFVoQ1F3REN5QUNSUTBDQ3lBSklBSkJBbXAxSVFrTElCa2dCRVZ4SUFWeEJFQWdGU0FXYWlBWGFpQVlhaUFmSUNCcUlCMXFJQjVxYTBFRWRTRUhEQUlMSUFSRkRRRUxJQWNnQkVFQ2FuVWhCd3NnQmdKL0FrQUNRQUpBQWtBZ0NFRUJhdzREQUFFQ0F3c2dBRUVEZGd3REN5QUFRUVIyREFJTElBQkJGV3hCQ1hZTUFRc2dBRUVGZGdzaUFEWUNFQUpBSUFjZ0NYSkZCRUFnQmlBQU5nSklJQVlnQURZQ1RDQUdJQUEyQWtRZ0JpQUFOZ0pBSUFZZ0FEWUNQQ0FHSUFBMkFqZ2dCaUFBTmdJMElBWWdBRFlDTUNBR0lBQTJBaXdnQmlBQU5nSW9JQVlnQURZQ0pDQUdJQUEyQWlBZ0JpQUFOZ0ljSUFZZ0FEWUNHQ0FHSUFBMkFoUU1BUXNnQmlBQUlBbHFJZ1FnQjJzMkFrQWdCaUFFSUFkQkFYVWlBbXMyQWpBZ0JpQUNJQVJxTmdJZ0lBWWdCQ0FIYWpZQ0VDQUdJQUFnQ1dzaUJDQUhhellDVENBR0lBUWdBbXMyQWp3Z0JpQUNJQVJxTmdJc0lBWWdCQ0FIYWpZQ0hDQUdJQUFnQ1VFQmRTSUlhaUlFSUFkck5nSkVJQVlnQkNBQ2F6WUNOQ0FHSUFJZ0JHbzJBaVFnQmlBRUlBZHFOZ0lVSUFZZ0FDQUlheUlBSUFkck5nSklJQVlnQUNBQ2F6WUNPQ0FHSUFBZ0FtbzJBaWdnQmlBQUlBZHFOZ0lZQ3lBS0lCeHFJUUJCQUNFSElBWkJFR29oQ1FOQUlBQWdDU0FIUVFGMFFReHhhaWdDQUNJQ1FmOEJJQUpCL3dGSUd5SUNRUUFnQWtFQVNoc2lBam9BQVNBQUlBSTZBQUFnQUVFQ2FpRUFJQWtnQjBFQ2FpSUhRUTV4UlVFRWRHb2hDU0FIUWNBQVJ3MEFDeUFESUNKcUlRTWdDeUVBUWNBQUlRcEJBU0VMSUFCRkRRQUxJQUVnQmtIUUFHb1FEd3NnQmtIUUEyb2tBQXRTQVFKL1FZREFBQ2dDQUNJQklBQkJBMnBCZkhFaUFtb2hBQUpBSUFKQkFDQUFJQUZOR3cwQUlBQS9BRUVRZEVzRVFDQUFFQUJGRFFFTFFZREFBQ0FBTmdJQUlBRVBDMEdFd0FCQk1EWUNBRUYvQzdVRkFRUi9JQUFvQWhRaEF5QUFLQUlRSVFRZ0FDZ0NCQ0VGSUFBb0Fnd2lBaUFCS1FJQU53SUFJQUlnQVNrQ0NEY0NDQ0FDSUFWQkJIUWlBR29pQWlBQktRSVFOd0lBSUFJZ0FTa0NHRGNDQ0NBQUlBSnFJZ0lnQVNrQ0lEY0NBQ0FDSUFFcEFpZzNBZ2dnQUNBQ2FpSUNJQUVwQWpBM0FnQWdBaUFCS1FJNE53SUlJQUFnQW1vaUFpQUJLUUpBTndJQUlBSWdBU2tDU0RjQ0NDQUFJQUpxSWdJZ0FTa0NVRGNDQUNBQ0lBRXBBbGczQWdnZ0FDQUNhaUlDSUFFcEFtQTNBZ0FnQWlBQktRSm9Od0lJSUFBZ0Ftb2lBaUFCS1FKd053SUFJQUlnQVNrQ2VEY0NDQ0FBSUFKcUlnSWdBU2tDZ0FFM0FnQWdBaUFCS1FLSUFUY0NDQ0FBSUFKcUlnSWdBU2tDa0FFM0FnQWdBaUFCS1FLWUFUY0NDQ0FBSUFKcUlnSWdBU2tDb0FFM0FnQWdBaUFCS1FLb0FUY0NDQ0FBSUFKcUlnSWdBU2tDc0FFM0FnQWdBaUFCS1FLNEFUY0NDQ0FBSUFKcUlnSWdBU2tDd0FFM0FnQWdBaUFCS1FMSUFUY0NDQ0FBSUFKcUlnSWdBU2tDMEFFM0FnQWdBaUFCS1FMWUFUY0NDQ0FBSUFKcUlnSWdBU2tDNEFFM0FnQWdBaUFCS1FMb0FUY0NDQ0FBSUFKcUlnQWdBU2tDOEFFM0FnQWdBQ0FCS1FMNEFUY0NDQ0FFSUFFcEFvQUNOd0lBSUFRZ0JVRURkQ0lBYWlJRUlBRXBBb2dDTndJQUlBQWdCR29pQkNBQktRS1FBamNDQUNBQUlBUnFJZ1FnQVNrQ21BSTNBZ0FnQUNBRWFpSUVJQUVwQXFBQ053SUFJQUFnQkdvaUJDQUJLUUtvQWpjQ0FDQUFJQVJxSWdRZ0FTa0NzQUkzQWdBZ0FDQUVhaUFCS1FLNEFqY0NBQ0FESUFFcEFzQUNOd0lBSUFBZ0Eyb2lBeUFCS1FMSUFqY0NBQ0FBSUFOcUlnTWdBU2tDMEFJM0FnQWdBQ0FEYWlJRElBRXBBdGdDTndJQUlBQWdBMm9pQXlBQktRTGdBamNDQUNBQUlBTnFJZ01nQVNrQzZBSTNBZ0FnQUNBRGFpSURJQUVwQXZBQ053SUFJQUFnQTJvZ0FTa0MrQUkzQWdBTGJ3RUJmeU1BUVJCcklnSWtBQ0FDUVFBMkFnd2dBQ0FDUVF4cUVBSWhBQUovSUFFQ2Z5QUNLQUlNSWdGQmYwWUVRRUdBZ0lDQWVDQUFEUUVhUVFFTUFndEJBU0FBRFFFYUlBRkJBV3BCQVhZaUFFRUFJQUJySUFGQkFYRWJDellDQUVFQUN5RUFJQUpCRUdva0FDQUFDellBSUFJRVFDQUFJQUVRQWc4TFFRRWhBaUFCSUFCQkFSQVVJZ0EyQWdBZ0FFRi9Sd1IvSUFFZ0FFRUJjellDQUVFQUJVRUJDd3ZhQndFTmZ5TUFRY0FEYXlJUkpBQWdCa0VGYWlFSkFrQUNRQ0FDUVFCSURRQWdBaUFKYWlBRVN3MEFJQU5CQUVnTkFDQURJQWRxUVFWcUlBVkxEUUFnQkNFSklBTWhDZ3dCQ3lBQUlCRWdBaUFESUFRZ0JTQUpJQWRCQldvZ0NSQUpJQkVoQUVFQUlRSUxJQUFnQ1NBS2JDQUNhbW9pQUNBSklBaEJBWFpCQVhGQkFuSnNha0VGYWlFQ1FSQWdCbXNoRENBSklBWnJJUTRnQmtFQ2RpRVNJQWhCQVhFaEZDQUFJQWxxSVJVZ0J5RVBBMEFnQWtFQmF5MEFBQ0VBSUFKQkFtc3RBQUFoQ0NBQ1FRTnJMUUFBSVFRZ0FrRUVheTBBQUNFS0lBSkJCV3N0QUFBaEN5QVNJUTBEUUNBQklBSXRBQUFpQXlBTElBUWdDR29pQlVFRWRHb2dBQ0FLYWlJTGF5QUZJQXRyUVFKMGFtcEJFR3BCQlhWQndEVnFMUUFBT2dBQUlBRWdBaTBBQVNJRklBb2dBQ0FJYWlJTFFRUjBhaUFESUFScUlncHJhaUFMSUFwclFRSjBha0VRYWtFRmRVSEFOV290QUFBNkFBRWdBU0FDTFFBQ0loQWdCQ0FBSUFOcUlncEJCSFJxSUFVZ0NHb2lCR3RxSUFvZ0JHdEJBblJxUVJCcVFRVjFRY0ExYWkwQUFEb0FBaUFCSUFJdEFBTWlFeUFJSUFNZ0JXb2lCRUVFZEdvZ0FDQVFhaUlJYTJvZ0JDQUlhMEVDZEdwQkVHcEJCWFZCd0RWcUxRQUFPZ0FESUFGQkJHb2hBU0FDUVFScUlRSWdBQ0VMSUFNaENpQUZJUVFnRUNFSUlCTWhBQ0FOUVFGcklnME5BQXNnQVNBTWFpRUJJQUlnRG1vaEFpQVBRUUZySWc4TkFBc2dGQ0FWYWtFQ2FpSUlJQWxCQld4cUlRQWdCMEVDZGlFS1FjQUFJQVpySVJJZ0NVRUJkQ0VQSUFFZ0IwRUVkR3NoQWlBSlFRSjBJQVpySVFkQkFDQUpheUlMUVFGMElSTURRQ0FHSVFFRFFDQUNJQWdnRDJvdEFBQWlBeUFBSUE5cUxRQUFJQUFnQ1dvdEFBQWlEQ0FBSUJOcUxRQUFJZ1JxSWdWcklBVkJBblJyYWlBQUxRQUFJZzBnQUNBTGFpMEFBQ0lGYWtFVWJHcEJFR3BCQlhWQndEVnFMUUFBSUFJdEFEQnFRUUZxUVFGMk9nQXdJQUlnQ0NBSmFpMEFBQ0lRSUF3Z0JDQUZhaUlPUVFSMGFpQURJQTFxSWd4cklBNGdER3RCQW5ScWFrRVFha0VGZFVIQU5Xb3RBQUFnQWkwQUlHcEJBV3BCQVhZNkFDQWdBaUFJTFFBQUlnd2dEU0FESUFScUlnNUJCSFJxSUFVZ0VHb2lEV3NnRGlBTmEwRUNkR3BxUVJCcVFRVjFRY0ExYWkwQUFDQUNMUUFRYWtFQmFrRUJkam9BRUNBQ0lBZ2dDMm90QUFBZ0JTQURJQkJxSWdOQkJIUnFJQVFnREdvaUJHc2dBeUFFYTBFQ2RHcHFRUkJxUVFWMVFjQTFhaTBBQUNBQ0xRQUFha0VCYWtFQmRqb0FBQ0FJUVFGcUlRZ2dBa0VCYWlFQ0lBQkJBV29oQUNBQlFRRnJJZ0VOQUFzZ0FpQVNhaUVDSUFBZ0Iyb2hBQ0FISUFocUlRZ2dDa0VCYXlJS0RRQUxJQkZCd0FOcUpBQUw1d1lCREg4Q1FDQUJRUVJQQkVBZ0EwRUNka0VDYWlFTFFRUWhBUU5BQWtBZ0FFRUJheUlHTFFBQUlnY2dBQzBBQUNJSWF5SUNJQUpCSDNVaUFtb2dBbk1pQWlBRFR3MEFJQUJCQW1zaUR5MEFBQ0lLSUFkcklna2dDVUVmZFNJSmFpQUpjeUFFVHcwQUlBQXRBQUVpRENBSWF5SUpJQWxCSDNVaUNXb2dDWE1nQkU4TkFBSi9Ba0FnQWlBTFNRUkFJQUF0QUFJaERnSi9JQVFnQUVFRGF5SUpMUUFBSWdJZ0Iyc2lEU0FOUVI5MUlnMXFJQTF6U3dSQUlBWWdEQ0FISUFocUlBcHFJZ1pCQVhScUlBSnFRUVJxUVFOMk9nQUFJQThnQWlBR2FrRUNha0VDZGpvQUFDQUdJQUpCQTJ4cUlBQkJCR3N0QUFCQkFYUnFRUVJxUVFOMkRBRUxJQVloQ1NBSElBeHFJQXBCQVhScVFRSnFRUUoyQ3lFQ0lBa2dBam9BQUNBT0lBaHJJZ0lnQWtFZmRTSUNhaUFDY3lBRVR3MEJJQUFnQnlBTWFpQUlhaUlHSUE1cVFRSnFRUUoyT2dBQklBQWdDaUFHUVFGMGFpQU9ha0VFYWtFRGRqb0FBQ0FHSUE1QkEyeHFJQUF0QUFOQkFYUnFRUVJxUVFOMklRWWdBRUVDYWd3Q0N5QUdJQWNnREdvZ0NrRUJkR3BCQW1wQkFuWTZBQUFMSUFnZ0Ntb2dERUVCZEdwQkFtcEJBblloQmlBQUN5QUdPZ0FBQ3lBQUlBVnFJUUFnQVVFQmF5SUJEUUFMREFFTElBRWdBbXBCQVdzdEFBQWlCa0VCYWlFSlFRQWdCbXNoQ2tFRUlRRURRQUpBSUFCQkFXc2lEeTBBQUNJSElBQXRBQUFpQ0dzaUFpQUNRUjkxSWdKcUlBSnpJQU5QRFFBZ0FFRUNheUlOTFFBQUlnd2dCMnNpQWlBQ1FSOTFJZ0pxSUFKeklBUlBEUUFnQUMwQUFTSU9JQWhySWdJZ0FrRWZkU0lDYWlBQ2N5QUVUdzBBSUFBdEFBSWhDeUFHSVFJZ0JDQUFRUU5yTFFBQUloRWdCMnNpRUNBUVFSOTFJaEJxSUJCelN3UkFJQTBnRENBS0lBWWdCeUFJYWtFQmFrRUJkaUFNUVFGMGF5QVJha0VCZFNJQ0lBSWdCa29iSUFJZ0NrZ2Jham9BQUNBSklRSUxJQThnQndKL0lBUWdDeUFJYXlJTklBMUJIM1VpRFdvZ0RYTkxCRUFnQUNBT0lBb2dCaUFISUFocVFRRnFRUUYySUE1QkFYUnJJQXRxUVFGMUlnc2dCaUFMU0JzZ0NpQUxTaHRxT2dBQklBSkJBV29oQWd0QkFDQUNheUlMQ3lBQ0lBd2dEbXNnQ0NBSGEwRUNkR3BCQkdwQkEzVWlCeUFDSUFkSUd5QUhJQXRJR3lJQ2FrSEFOV290QUFBNkFBQWdBQ0FJSUFKclFjQTFhaTBBQURvQUFBc2dBQ0FGYWlFQUlBRkJBV3NpQVEwQUN3c0xpQUlCQjM4Z0FDZ0NCQ0VFQWtBZ0FDZ0NERUVEZENJSElBQW9BaEFpQ0dzaUFrRWdUZ1JBSUFRb0FBQWlBMEVZZENBRFFRaDBRWUNBL0FkeGNpQURRUWgyUVlEK0EzRWdBMEVZZG5KeUlRTWdBQ2dDQ0NJQ1JRMEJJQU1nQW5RZ0JDMEFCRUVJSUFKcmRuSWhBd3dCQ3lBQ1FRRklCRUFNQVFzZ0JDMEFBQ0FBS0FJSUlnVkJHR29pQm5RaEF5QUNJQVZxUVFocklnSkJBVWdOQUFOQUlBUXRBQUVnQmtFSWF5SUdkQ0FEY2lFRElBSkJDRW9oQlNBRVFRRnFJUVFnQWtFSWF5RUNJQVVOQUFzTElBQWdBU0FJYWlJRU5nSVFJQUFnQkVFSGNUWUNDRUYvSVFJZ0JDQUhUUVIvSUFBZ0FDZ0NBQ0FFUVFOMmFqWUNCQ0FEUVNBZ0FXdDJCVUYvQ3dzREFBRUx4d0VCQkg4Z0FDZ0NCQ0VDQWtBZ0FDZ0NERUVEZENBQUtBSVFheUlEUVNCT0JFQWdBaWdBQUNJQlFSaDBJQUZCQ0hSQmdJRDhCM0Z5SUFGQkNIWkJnUDREY1NBQlFSaDJjbkloQVNBQUtBSUlJZ0JGRFFFZ0FTQUFkQ0FDTFFBRVFRZ2dBR3QyY2c4TElBTkJBVWdFUUVFQUR3c2dBaTBBQUNBQUtBSUlJZ0JCR0dvaUJIUWhBU0FBSUFOcVFRaHJJZ0JCQVVnTkFBTkFJQUl0QUFFZ0JFRUlheUlFZENBQmNpRUJJQUJCQ0VvaEF5QUNRUUZxSVFJZ0FFRUlheUVBSUFNTkFBc0xJQUVMOHdjQkVuOGpBRUdBRG1zaUR5UUFJQVpCQldvaENRSkFBa0FnQWtFQVNBMEFJQUlnQ1dvZ0JFc05BQ0FEUVFCSURRQWdBeUFIYWtFRmFpQUZTdzBBSUFNaENnd0JDeUFBSUE5QndBcHFJZ0FnQWlBRElBUWdCU0FKSUFkQkJXb2dDUkFKSUFraEJFRUFJUUlMSUFBZ0JDQUtiQ0FDYW1vZ0JHb2lBQ0FFUVFWc2FpRUNJQVJCQVhRaEVDQUhRUUoySVJKQkFDQUVheUlMUVFGMElSWWdCRUVDZENBR2EwRUZheUVUSUE4Z0NVRUNkQ0lYYWlFRElBbEJBM1FoR0VGN0lBWnJRUUowSVJrZ0NVRURiRUVDZENFYUEwQWdDU0VGQTBBZ0F5QVlhaUFBSUJCcUxRQUFJZ29nQWlBUWFpMEFBQ0FDSUFScUxRQUFJaEVnQWlBV2FpMEFBQ0lNYWlJTmF5QU5RUUowYTJvZ0FpMEFBQ0lPSUFJZ0Myb3RBQUFpRFdwQkZHeHFOZ0lBSUFNZ0Yyb2dBQ0FFYWkwQUFDSVZJQkVnRENBTmFpSVVRUVIwYWlBS0lBNXFJaEZyYWlBVUlCRnJRUUowYWpZQ0FDQURJQUF0QUFBaUVTQU9JQW9nREdvaUZFRUVkR29nRFNBVmFpSU9hMm9nRkNBT2EwRUNkR28yQWdBZ0F5QVphaUFBSUF0cUxRQUFJQTBnQ2lBVmFpSUtRUVIwYWlBTUlCRnFJZ3hyYWlBS0lBeHJRUUowYWpZQ0FDQUFRUUZxSVFBZ0EwRUVhaUVESUFKQkFXb2hBaUFGUVFGcklnVU5BQXNnQWlBVGFpRUNJQUFnRTJvaEFDQURJQnBxSVFNZ0VrRUJheUlTRFFBTFFSQWdCbXNoRGlBR1FRSjJJUklnRHlBSVFRSjBha0VJYWlFSUlBOUJGR29oQkFOQUlBUkJCR3NvQWdBaEFpQUVRUWhyS0FJQUlRQWdCRUVNYXlnQ0FDRUZJQVJCRUdzb0FnQWhDU0FFUVJScktBSUFJUXdnRWlFTkEwQWdBU0FFSWdzb0FnQWlCaUFNSUFBZ0JXb2lBMEVFZEdvZ0FpQUphaUlFYXlBRElBUnJRUUowYW1wQmdBUnFRUXAxUWNBMWFpMEFBQ0FJSWdNb0FnQkJFR3BCQlhWQndEVnFMUUFBYWtFQmFrRUJkam9BQUNBQklBc29BZ1FpQ2lBSklBQWdBbW9pQkVFRWRHb2dCU0FHYWlJSWF5QUVJQWhyUVFKMGFtcEJnQVJxUVFwMVFjQTFhaTBBQUNBREtBSUVRUkJxUVFWMVFjQTFhaTBBQUdwQkFXcEJBWFk2QUFFZ0FTQUxLQUlJSWhBZ0JTQUNJQVpxSWdSQkJIUnFJQUFnQ21vaUJXc2dCQ0FGYTBFQ2RHcHFRWUFFYWtFS2RVSEFOV290QUFBZ0F5Z0NDRUVRYWtFRmRVSEFOV290QUFCcVFRRnFRUUYyT2dBQ0lBRWdDeWdDRENJVElBQWdCaUFLYWlJRVFRUjBhaUFDSUJCcUlnQnJJQVFnQUd0QkFuUnFha0dBQkdwQkNuVkJ3RFZxTFFBQUlBTW9BZ3hCRUdwQkJYVkJ3RFZxTFFBQWFrRUJha0VCZGpvQUF5QUJRUVJxSVFFZ0EwRVFhaUVJSUF0QkVHb2hCQ0FDSVF3Z0JpRUpJQW9oQlNBUUlRQWdFeUVDSUExQkFXc2lEUTBBQ3lBQklBNXFJUUVnQTBFa2FpRUlJQXRCSkdvaEJDQUhRUUZySWdjTkFBc2dEMEdBRG1va0FBdmdCd0VOZnlNQVFZQU9heUlSSkFBZ0JrRUZhaUVKQWtBQ1FDQUNRUUJJRFFBZ0FpQUphaUFFU3cwQUlBTkJBRWdOQUNBSFFRVnFJZzRnQTJvZ0JVc05BQ0FFSVFrZ0F5RUtEQUVMSUFBZ0VVSEFDbW9pQUNBQ0lBTWdCQ0FGSUFrZ0IwRUZhaUlPSUFrUUNVRUFJUUlMSUE0RVFDQUpJQVpySVJNZ0JrRUNkaUVTSUFBZ0NTQUtiQ0FDYW1wQkJXb2hBaUFSSVFBRFFDQUNRUUZyTFFBQUlRa2dBa0VDYXkwQUFDRURJQUpCQTJzdEFBQWhCU0FDUVFSckxRQUFJUW9nQWtFRmF5MEFBQ0VMSUJJaERRTkFJQUFnQWkwQUFDSUVJQXNnQXlBRmFpSU1RUVIwYWlBSklBcHFJZ3RySUF3Z0MydEJBblJxYWpZQ0FDQUFJQUl0QUFFaURDQUtJQU1nQ1dvaUMwRUVkR29nQkNBRmFpSUthMm9nQ3lBS2EwRUNkR28yQWdRZ0FDQUNMUUFDSWc4Z0JTQUVJQWxxSWdWQkJIUnFJQU1nREdvaUNtdHFJQVVnQ210QkFuUnFOZ0lJSUFBZ0FpMEFBeUlVSUFNZ0JDQU1haUlEUVFSMGFpQUpJQTlxSWdWcmFpQURJQVZyUVFKMGFqWUNEQ0FBUVJCcUlRQWdBa0VFYWlFQ0lBa2hDeUFFSVFvZ0RDRUZJQThoQXlBVUlRa2dEVUVCYXlJTkRRQUxJQUlnRTJvaEFpQU9RUUZySWc0TkFBc0xJQkVnQmtFQ2RDSUVhaUlKSUFaQkZHeHFJUUlnQ1NBSVFRSnFJQVpzUVFKMGFpRUFJQWRCQW5ZaENFSEFBQ0FHYXlFVVFRQWdCbXNpRGtFRGRDRVRJQVpCQTNRaEJTQUdRUU5zUVFKMElRY0RRQ0FHSVFNRFFDQUJJQVVnQ1dvb0FnQWlDaUFDSUFWcUtBSUFJQUlnQkdvb0FnQWlFQ0FDSUJOcUtBSUFJZ3hxSWd0cklBdEJBblJyYWlBQ0tBSUFJZzBnQWlBT1FRSjBJZzlxS0FJQUlndHFRUlJzYWtHQUJHcEJDblZCd0RWcUxRQUFJQUFnQldvb0FnQkJFR3BCQlhWQndEVnFMUUFBYWtFQmFrRUJkam9BTUNBQklBUWdDV29vQWdBaUVpQVFJQXNnREdvaUZVRUVkR29nQ2lBTmFpSVFheUFWSUJCclFRSjBhbXBCZ0FScVFRcDFRY0ExYWkwQUFDQUFJQVJxS0FJQVFSQnFRUVYxUWNBMWFpMEFBR3BCQVdwQkFYWTZBQ0FnQVNBSktBSUFJaEFnRFNBS0lBeHFJaFZCQkhScUlBc2dFbW9pRFdzZ0ZTQU5hMEVDZEdwcVFZQUVha0VLZFVIQU5Xb3RBQUFnQUNnQ0FFRVFha0VGZFVIQU5Xb3RBQUJxUVFGcVFRRjJPZ0FRSUFFZ0NTQVBhaWdDQUNBTElBb2dFbW9pQ2tFRWRHb2dEQ0FRYWlJTWF5QUtJQXhyUVFKMGFtcEJnQVJxUVFwMVFjQTFhaTBBQUNBQUlBOXFLQUlBUVJCcVFRVjFRY0ExYWkwQUFHcEJBV3BCQVhZNkFBQWdBRUVFYWlFQUlBbEJCR29oQ1NBQlFRRnFJUUVnQWtFRWFpRUNJQU5CQVdzaUF3MEFDeUFCSUJScUlRRWdBQ0FIYWlFQUlBSWdCMm9oQWlBSElBbHFJUWtnQ0VFQmF5SUlEUUFMSUJGQmdBNXFKQUFMcGdRQkNYOGpBRUhBQTJzaUN5UUFJQVpCQldvaENRSkFBa0FnQWtFQVNBMEFJQUlnQ1dvZ0JFc05BQ0FEUVFCSURRQWdBeUFIYWlBRlN3MEFJQVFoQ1NBRElRb01BUXNnQUNBTElBSWdBeUFFSUFVZ0NTQUhJQWtRQ1NBTElRQkJBQ0VDQzBFUUlBWnJJUTRnQ1NBR2F5RVBJQVpCQW5ZaEVDQUFJQWtnQ213Z0FtcHFRUVZxSVFBRFFDQUFRUUZyTFFBQUlRa2dBRUVDYXkwQUFDRUNJQUJCQTJzdEFBQWhBeUFBUVFSckxRQUFJUW9nQUVFRmF5MEFBQ0VHSUJBaERBTkFJQUVnQUMwQUFDSUVJQVlnQWlBRGFpSUZRUVIwYWlBSklBcHFJZ1pySUFVZ0JtdEJBblJxYWtFUWFrRUZkVUhBTldvdEFBQWdBaUFESUFnYmFrRUJha0VCZGpvQUFDQUJJQUF0QUFFaUJTQUtJQUlnQ1dvaUJrRUVkR29nQXlBRWFpSUthMm9nQmlBS2EwRUNkR3BCRUdwQkJYVkJ3RFZxTFFBQUlBa2dBaUFJRzJwQkFXcEJBWFk2QUFFZ0FTQUFMUUFDSWcwZ0F5QUVJQWxxSWdaQkJIUnFJQUlnQldvaUEydHFJQVlnQTJ0QkFuUnFRUkJxUVFWMVFjQTFhaTBBQUNBRUlBa2dDQnRxUVFGcVFRRjJPZ0FDSUFFZ0FDMEFBeUlSSUFJZ0JDQUZhaUlEUVFSMGFpQUpJQTFxSWdKcmFpQURJQUpyUVFKMGFrRVFha0VGZFVIQU5Xb3RBQUFnQlNBRUlBZ2Jha0VCYWtFQmRqb0FBeUFCUVFScUlRRWdBRUVFYWlFQUlBa2hCaUFFSVFvZ0JTRURJQTBoQWlBUklRa2dERUVCYXlJTURRQUxJQUVnRG1vaEFTQUFJQTlxSVFBZ0IwRUJheUlIRFFBTElBdEJ3QU5xSkFBTHpRUUJESDhqQUVIQUEyc2lEeVFBQWtBQ1FDQUNRUUJJRFFBZ0FpQUdhaUFFU3cwQUlBTkJBRWdOQUNBRElBZHFRUVZxSUFWTERRQWdBeUVKREFFTElBQWdEeUFDSUFNZ0JDQUZJQVlnQjBFRmFpQUdFQWtnRHlFQUlBWWhCRUVBSVFJTElBQWdCQ0FKYkNBQ2Ftb2dCR29pQUNBRVFRVnNhaUVDSUFBZ0JDQUlRUUpxYkdvaEF5QUhRUUoySVJGQndBQWdCbXNoRXlBRVFRRjBJUWNnQkVFQ2RDQUdheUVJUVFBZ0JHc2lDVUVCZENFVUEwQWdCaUVGQTBBZ0FTQUFJQWRxTFFBQUlnb2dBaUFIYWkwQUFDQUNJQVJxTFFBQUlnc2dBaUFVYWkwQUFDSU1haUlOYXlBTlFRSjBhMm9nQWkwQUFDSU9JQUlnQ1dvdEFBQWlEV3BCRkd4cVFSQnFRUVYxUWNBMWFpMEFBQ0FESUFkcUxRQUFha0VCYWtFQmRqb0FNQ0FCSUFBZ0JHb3RBQUFpRWlBTElBd2dEV29pRUVFRWRHb2dDaUFPYWlJTGF5QVFJQXRyUVFKMGFtcEJFR3BCQlhWQndEVnFMUUFBSUFNZ0JHb3RBQUJxUVFGcVFRRjJPZ0FnSUFFZ0FDMEFBQ0lMSUE0Z0NpQU1haUlRUVFSMGFpQU5JQkpxSWc1cklCQWdEbXRCQW5ScWFrRVFha0VGZFVIQU5Xb3RBQUFnQXkwQUFHcEJBV3BCQVhZNkFCQWdBU0FBSUFscUxRQUFJQTBnQ2lBU2FpSUtRUVIwYWlBTElBeHFJZ3hySUFvZ0RHdEJBblJxYWtFUWFrRUZkVUhBTldvdEFBQWdBeUFKYWkwQUFHcEJBV3BCQVhZNkFBQWdBMEVCYWlFRElBQkJBV29oQUNBQlFRRnFJUUVnQWtFQmFpRUNJQVZCQVdzaUJRMEFDeUFCSUJOcUlRRWdBeUFJYWlFRElBSWdDR29oQWlBQUlBaHFJUUFnRVVFQmF5SVJEUUFMSUE5QndBTnFKQUFMNmdZQkNIOENRQ0FBS0FJQUlnRW9BaFJGRFFBZ0FVRUFOZ0lVSUFFb0FoZ05BQ0FBSUFBb0FpeEJBV3MyQWl3TEFrQWdBU2dDUEVVTkFDQUJRUUEyQWp3Z0FVRkFheWdDQUEwQUlBQWdBQ2dDTEVFQmF6WUNMQXNDUUNBQktBSmtSUTBBSUFGQkFEWUNaQ0FCS0FKb0RRQWdBQ0FBS0FJc1FRRnJOZ0lzQ3dKQUlBRW9Bb3dCUlEwQUlBRkJBRFlDakFFZ0FTZ0NrQUVOQUNBQUlBQW9BaXhCQVdzMkFpd0xBa0FnQVNnQ3RBRkZEUUFnQVVFQU5nSzBBU0FCS0FLNEFRMEFJQUFnQUNnQ0xFRUJhellDTEFzQ1FDQUJLQUxjQVVVTkFDQUJRUUEyQXR3QklBRW9BdUFCRFFBZ0FDQUFLQUlzUVFGck5nSXNDd0pBSUFFb0FvUUNSUTBBSUFGQkFEWUNoQUlnQVNnQ2lBSU5BQ0FBSUFBb0FpeEJBV3MyQWl3TEFrQWdBU2dDckFKRkRRQWdBVUVBTmdLc0FpQUJLQUt3QWcwQUlBQWdBQ2dDTEVFQmF6WUNMQXNDUUNBQktBTFVBa1VOQUNBQlFRQTJBdFFDSUFFb0F0Z0NEUUFnQUNBQUtBSXNRUUZyTmdJc0N3SkFJQUVvQXZ3Q1JRMEFJQUZCQURZQy9BSWdBU2dDZ0FNTkFDQUFJQUFvQWl4QkFXczJBaXdMQWtBZ0FTZ0NwQU5GRFFBZ0FVRUFOZ0trQXlBQktBS29BdzBBSUFBZ0FDZ0NMRUVCYXpZQ0xBc0NRQ0FCS0FMTUEwVU5BQ0FCUVFBMkFzd0RJQUVvQXRBRERRQWdBQ0FBS0FJc1FRRnJOZ0lzQ3dKQUlBRW9BdlFEUlEwQUlBRkJBRFlDOUFNZ0FTZ0MrQU1OQUNBQUlBQW9BaXhCQVdzMkFpd0xBa0FnQVNnQ25BUkZEUUFnQVVFQU5nS2NCQ0FCS0FLZ0JBMEFJQUFnQUNnQ0xFRUJhellDTEFzQ1FDQUJLQUxFQkVVTkFDQUJRUUEyQXNRRUlBRW9Bc2dFRFFBZ0FDQUFLQUlzUVFGck5nSXNDd0pBSUFFb0F1d0VSUTBBSUFGQkFEWUM3QVFnQVNnQzhBUU5BQ0FBSUFBb0FpeEJBV3MyQWl3TElBQW9BamdoQmdOQUFrQWdCZzBBSUFBb0Fod2hCMEVBSVFKQi8vLy8vd2NoQTBFQUlRUURRQ0FCSUFSQktHeHFJZ1VvQWhnRVFDQUZJQUlnQlNnQ0VDSUZJQU5JSWdnYklRSWdCU0FESUFnYklRTUxJQVJCQVdvaUJDQUhUUTBBQ3lBQ1JRMEFJQUFvQWd3Z0FDZ0NFQ0lFUVFSMGFpSURJQUlvQWdBMkFnQWdBeUFDS0FJa05nSU1JQU1nQWlnQ0hEWUNCQ0FESUFJb0FpQTJBZ2dnQUNBRVFRRnFOZ0lRSUFKQkFEWUNHQ0FDS0FJVURRRWdBQ0FBS0FJc1FRRnJOZ0lzREFFTEN5QUFRUUEyQWpBZ0FFTC8vd00zQWlRTDJROEJDbjhnQWlBQUtBSUlJZ2tvQWdCR0JFQWdBRUVBTmdJMElBQW9BamdpQWtVaEVRSkFJQUZGQkVBZ0NTQUROZ0lNSUFsQkFEWUNGQ0FKSUJFMkFoZ2dDU0FFTmdJUUlBa2dBellDQ0NBQ0RRRWdBQ0FBS0FJc1FRRnFOZ0lzREFFTElBVUVRQ0FBUWdBM0FoQWdBQkFiQWtBZ0FTZ0NBRVVFUUNBQUtBSTRSUTBCQ3lBQVFnQTNBaEFMSUFBb0FnZ2lBa0VEUVFJZ0FTZ0NCQ0lCR3pZQ0ZDQUFRUUJCLy84RElBRWJOZ0lrSUFJZ0VUWUNHQ0FDUVFBMkFoQWdBa0lBTndJSUlBQkNnWUNBZ0JBM0FpZ01BUXNDUUFKQUlBRW9BZ2dFUUVFQUlRa0RRQUpBQWtBQ1FBSkFBa0FDUUFKQUlBRWdDVUVVYkdvaUFpZ0NERUVCYXc0R0FBRUNBd1FGQ1FzZ0FDZ0NHQ0lLUlEwSUlBTWdBaWdDRUdzaEN5QUFLQUlBSVF4QkFDRUNBMEFDUUNBTUlBSkJLR3hxSWdnb0FoUkJBV3RCQVUwRVFDQUlLQUlJSUF0R0RRRUxJQUpCQVdvaUFpQUtSdzBCREFvTEN5QUNRUUJJRFFnZ0NFRUFOZ0lVSUFBZ0FDZ0NLRUVCYXpZQ0tDQUlLQUlZRFFVZ0FDQUFLQUlzUVFGck5nSXNJQWxCQVdvaENRd0dDeUFBS0FJWUlncEZEUWNnQWlnQ0ZDRUxJQUFvQWdBaERFRUFJUUlEUUFKQUlBd2dBa0VvYkdvaUNDZ0NGRUVEUmdSQUlBZ29BZ2dnQzBZTkFRc2dBa0VCYWlJQ0lBcEhEUUVNQ1FzTElBSkJBRWdOQnlBSVFRQTJBaFFnQUNBQUtBSW9RUUZyTmdJb0lBZ29BaGdOQkNBQUlBQW9BaXhCQVdzMkFpd2dDVUVCYWlFSkRBVUxJQUFvQWlRaUNFSC8vd05HRFFZZ0NDQUNLQUlZSWd0SkRRWWdBQ2dDR0NJSVJRMEdJQUlvQWhBaER5QUFLQUlBSVF4QkFDRUNBMEFDUUFKQUlBd2dBa0VvYkdvaUNpZ0NGRUVEUncwQUlBb29BZ2dnQzBjTkFDQUtRUUEyQWhRZ0FDQUFLQUlvUVFGck5nSW9JQW9vQWhnTkFTQUFJQUFvQWl4QkFXczJBaXdNQVFzZ0FrRUJhaUlDSUFoSERRRUxDeUFJUVFFZ0NFRUJTeHNoQ2lBRElBOXJJUTlCQUNFQ0EwQUNRQ0FNSUFKQktHeHFJZ2dvQWhRaURVRUJhMEVCVFFSQUlBZ29BZ2dnRDBZTkFRc2dBa0VCYWlJQ0lBcEhEUUVNQ0FzTElBSkJBRWdOQmlBTlFRSkpEUVlnQ0VFRE5nSVVJQWdnQ3pZQ0NDQUpRUUZxSVFrTUJBc2dBQ0FDS0FJY0lnbzJBaVFnQUNnQ0dDSUxSUTBDSUFBb0FnQWhERUVBSVFJZ0NrSC8vd05HQkVBRFFBSkFJQXdnQWtFb2JHb2lDQ2dDRkVFRFJ3MEFJQWhCQURZQ0ZDQUFJQUFvQWloQkFXczJBaWdnQ0NnQ0dBMEFJQUFnQUNnQ0xFRUJhellDTEFzZ0FrRUJhaUlDSUF0SERRQU1CQXNBQ3dOQUFrQWdEQ0FDUVNoc2FpSUlLQUlVUVFOSERRQWdDQ2dDQ0NBS1RRMEFJQWhCQURZQ0ZDQUFJQUFvQWloQkFXczJBaWdnQ0NnQ0dBMEFJQUFnQUNnQ0xFRUJhellDTEFzZ0FrRUJhaUlDSUF0SERRQUxEQUlMSUFBUUd5QUFRUUUyQWpSQkFDRURJQWxCQVdvaENRd0NDeUFBS0FJa0lnaEIvLzhEUmcwRElBZ2dBaWdDR0NJS1NRMERBa0FnQUNnQ0dDSUxSUTBBSUFBb0FnQWhERUVBSVFJRFFBSkFJQXdnQWtFb2JHb2lDQ2dDRkVFRFJ3MEFJQWdvQWdnZ0NrY05BQ0FJUVFBMkFoUWdBQ0FBS0FJb1FRRnJOZ0lvSUFnb0FoZ05BaUFBSUFBb0FpeEJBV3MyQWl3TUFnc2dBa0VCYWlJQ0lBdEhEUUFMQ3lBQUtBSW9JZ2dnQzA4TkF5QUFLQUlJSWdKQkF6WUNGQ0FDSUFRMkFoQWdBaUFLTmdJSUlBSWdBellDRENBQ0lBQW9BamhGTmdJWVFRRWhEaUFBSUFoQkFXbzJBaWdnQUNBQUtBSXNRUUZxTmdJc0N5QUpRUUZxSVFrTUFBc0FDeUFBS0FJb0lnZ2dBQ2dDR0NJTFNRMEJJQWhGQkVCQkFDRUlEQUlMSUFBb0FnQWhDa0VBSVFsQmZ5RUJBa0FnQ0VFQlJ3UkFJQWhCQVhFaEQwRUFJUUlnQ0VGK2NTSU9JUXdEUUNBS0lBSkJLR3hxSWcwb0FoUkJBV3RCQVUwRVFDQU5LQUlJSWcwZ0NTQUJRWDlHSUFrZ0RVcHlJZzBiSVFrZ0FpQUJJQTBiSVFFTElBb2dBa0VCY2lJTlFTaHNhaUlRS0FJVVFRRnJRUUpKQkVBZ0VDZ0NDQ0lRSUFrZ0FVRi9SaUFKSUJCS2NpSVFHeUVKSUEwZ0FTQVFHeUVCQ3lBQ1FRSnFJUUlnREVFQ2F5SU1EUUFMSUE5RkRRRUxJQW9nRGtFb2JHb2lBaWdDRkVFQmEwRUJTdzBBSUE0Z0RpQUJJQUZCZjBZYklBSW9BZ2dnQ1VnYklRRUxJQUZCQUVnTkFTQUtJQUZCS0d4cUlnRkJBRFlDRkNBQUlBaEJBV3NpQ0RZQ0tDQUJLQUlZRFFFZ0FDQUFLQUlzUVFGck5nSXNEQUVMSUE0TkFTQUFLQUlZSVFzZ0FDZ0NLQ0VJQ3lBSUlBdFBEUUFnQUNnQ0NDSUJJQkUyQWhnZ0FVRUNOZ0lVSUFFZ0JEWUNFQ0FCSUFNMkFnZ2dBU0FETmdJTUlBQWdDRUVCYWpZQ0tDQUFJQUFvQWl4QkFXbzJBaXdMSUFBb0FnZ2lBU0FITmdJZ0lBRWdCallDSENBQklBVTJBaVFDUUNBQUtBSTRSUVJBSUFBb0Fpd2lBU0FBS0FJY0lnTk5EUUVnQUNnQ0FDRUdBMEJCLy8vLy93Y2hCVUVBSVFsQkFDRUNBMEFnQmlBQ1FTaHNhaUlFS0FJWUJFQWdCQ0FKSUFRb0FoQWlCQ0FGU0NJSEd5RUpJQVFnQlNBSEd5RUZDeUFDUVFGcUlnSWdBMDBOQUFzQ1FDQUpSUTBBSUFBb0Fnd2dBQ2dDRUNJRVFRUjBhaUlDSUFrb0FnQTJBZ0FnQWlBSktBSWtOZ0lNSUFJZ0NTZ0NIRFlDQkNBQ0lBa29BaUEyQWdnZ0FDQUVRUUZxTmdJUUlBbEJBRFlDR0NBSktBSVVEUUFnQUNBQlFRRnJJZ0UyQWl3TElBRWdBMHNOQUFzTUFRc2dBU2dDQUNFQ0lBQW9BZ3dnQUNnQ0VDSURRUVIwYWlJQklBVTJBZ3dnQVNBQ05nSUFJQUVnQnpZQ0NDQUJJQVkyQWdRZ0FDQURRUUZxTmdJUUlBQW9BaHdoQXdzZ0FDZ0NBQ0FEUVFGcUVCMExDOGNFQWd4L0FuNUJCeUVGSXdCQkVHc2lDeUVNQTBBZ0FTQUZTd1JBUVFBZ0JXc2hCeUFGSVFZRFFDQUFJQVpCS0d4cUlnSW9BaGdoRFNBQ0tRSU1JUTRnQWlnQ0NDRUlJQUlwQWdBaER5QUNLQUlVSVFrZ0RDQUNLQUlrTmdJSUlBc2dBaWtDSERjREFBSkFJQVlpQWlBRlNRMEFJQWxGQkVBZ0RVVU5BUU5BSUFBZ0FrRW9iR29pQkNBSFFTaHNhaUlES0FJVURRSWdBeWdDR0EwQ0lBUWdBQ0FDSUFWcklnSkJLR3hxSWdNcEFnQTNBZ0FnQkNBREtRSWdOd0lnSUFRZ0F5a0NHRGNDR0NBRUlBTXBBaEEzQWhBZ0JDQURLUUlJTndJSUlBSWdCVThOQUFzTUFRc2dDVUVCYTBFQlRRUkFBMEFDUUNBQUlBSkJLR3hxSWdRZ0IwRW9iR29pQXlnQ0ZDSUtSUTBBSUFwQkFXdEJBVXNOQUNBREtBSUlJQWhPRFFNTElBUWdBQ0FDSUFWcklnSkJLR3hxSWdNcEFnQTNBZ0FnQkNBREtRSWdOd0lnSUFRZ0F5a0NHRGNDR0NBRUlBTXBBaEEzQWhBZ0JDQURLUUlJTndJSUlBSWdCVThOQUF3Q0N3QUxBMEFnQUNBQ1FTaHNhaUlFSUFkQktHeHFJZ01vQWhRaUNnUkFJQXBCQVd0QkFra05BaUFES0FJSUlBaE1EUUlMSUFRZ0FDQUNJQVZySWdKQktHeHFJZ01wQWdBM0FnQWdCQ0FES1FJZ053SWdJQVFnQXlrQ0dEY0NHQ0FFSUFNcEFoQTNBaEFnQkNBREtRSUlOd0lJSUFJZ0JVOE5BQXNMSUFBZ0FrRW9iR29pQWlBTk5nSVlJQUlnQ1RZQ0ZDQUNJQTQzQWd3Z0FpQUlOZ0lJSUFJZ0R6Y0NBQ0FDSUFzcEF3QTNBaHdnQWlBTUtBSUlOZ0lrSUFaQkFXb2lCaUFCUncwQUN3c2dCVUVCU3lFR0lBVkJBWFloQlNBR0RRQUxDOVlMQVFwL1FRRWhCd0pBSUFBZ0FSQUNEUUFnQVNBQktBSUFRUUZxSWdvMkFnQWdDa0VnU3cwQUlBQW9BZ1FoQkFKQUlBQW9BZ3hCQTNRaUNDQUFLQUlRSWdacklnTkJJRTRFUUNBRUtBQUFJZ0pCR0hRZ0FrRUlkRUdBZ1B3SGNYSWdBa0VJZGtHQS9nTnhJQUpCR0haeWNpRUNJQUFvQWdnaUEwVU5BU0FDSUFOMElBUXRBQVJCQ0NBRGEzWnlJUUlNQVFzZ0EwRUJTQVJBREFFTElBUXRBQUFnQUNnQ0NDSUpRUmhxSWdWMElRSWdBeUFKYWtFSWF5SURRUUZJRFFBRFFDQUVMUUFCSUFWQkNHc2lCWFFnQW5JaEFpQURRUWhLSVFrZ0JFRUJhaUVFSUFOQkNHc2hBeUFKRFFBTEN5QUFJQVpCQkdvaUJUWUNFQ0FBSUFWQkIzRWlBellDQ0NBRklBaExEUUFnQUNBQUtBSUFJZ2tnQlVFRGRtb2lCRFlDQkNBQklBSkJISFkyQWdRQ1FDQUlJQVZySWd0QklFNEVRQ0FFS0FBQUlnSkJHSFFnQWtFSWRFR0FnUHdIY1hJZ0FrRUlka0dBL2dOeElBSkJHSFp5Y2lFQ0lBTkZEUUVnQWlBRGRDQUVMUUFFUVFnZ0EydDJjaUVDREFFTElBdEJBVWdFUUVFQUlRSU1BUXNnQkMwQUFDQURRUmh5SWdWMElRSWdBeUFMYWtFSWF5SURRUUZJRFFBRFFDQUVMUUFCSUFWQkNHc2lCWFFnQW5JaEFpQURRUWhLSVFzZ0JFRUJhaUVFSUFOQkNHc2hBeUFMRFFBTEN5QUFJQVpCQjNFMkFnZ2dBQ0FHUVFocUlnVTJBaEFnQlNBSVN3MEFJQUFnQ1NBRlFRTjJhaUlFTmdJRUlBRWdBa0VjZGpZQ0NDQUtCRUJCQUNFSUEwQWdBQ0FCSUFoQkFuUnFJZ1VpQWtFTWFoQUNCRUJCQVE4TElBSW9BZ3dpQkVGL1JnUkFRUUVQQ3lBQ0lBUkJBV29pQkRZQ0RDQUNJQVFnQVNnQ0JFRUdhblEyQWd3Z0FDQUZRWXdCYWhBQ0RRSWdCU2dDakFFaUFrRi9SZzBDSUFVZ0FrRUJhaUlDTmdLTUFTQUZJQUlnQVNnQ0NFRUVhblEyQW93QklBQW9BZ1FoQkFKQUlBQW9BZ3hCQTNRaUNTQUFLQUlRSWdacklnTkJJRTRFUUNBRUtBQUFJZ0pCR0hRZ0FrRUlkRUdBZ1B3SGNYSWdBa0VJZGtHQS9nTnhJQUpCR0haeWNpRUNJQUFvQWdnaUEwVU5BU0FDSUFOMElBUXRBQVJCQ0NBRGEzWnlJUUlNQVFzZ0EwRUJTQVJBUVFBaEFnd0JDeUFFTFFBQUlBQW9BZ2dpQ2tFWWFpSUhkQ0VDSUFNZ0NtcEJDR3NpQTBFQlNBMEFBMEFnQkMwQUFTQUhRUWhySWdkMElBSnlJUUlnQTBFSVNpRUtJQVJCQVdvaEJDQURRUWhySVFNZ0NnMEFDd3RCQVNFSElBQWdCa0VCYWlJRU5nSVFJQUFnQkVFSGNUWUNDQ0FFSUFsTERRSWdBQ0FBS0FJQUlna2dCRUVEZG1vaUJEWUNCQ0FGSUFKQkgzWTJBb3dDSUFoQkFXb2lDQ0FCS0FJQVNRMEFDeUFBS0FJTVFRTjBJUWdnQUNnQ0VDRUZDd0pBSUFnZ0JXc2lBMEVnVGdSQUlBUW9BQUFpQWtFWWRDQUNRUWgwUVlDQS9BZHhjaUFDUVFoMlFZRCtBM0VnQWtFWWRuSnlJUUlnQUNnQ0NDSURSUTBCSUFJZ0EzUWdCQzBBQkVFSUlBTnJkbkloQWd3QkN5QURRUUZJQkVCQkFDRUNEQUVMSUFRdEFBQWdBQ2dDQ0NJR1FSaHFJZ2QwSVFJZ0F5QUdha0VJYXlJRFFRRklEUUFEUUNBRUxRQUJJQWRCQ0dzaUIzUWdBbkloQWlBRFFRaEtJUVlnQkVFQmFpRUVJQU5CQ0dzaEF5QUdEUUFMQ3lBQUlBVkJCV29pQmpZQ0VDQUFJQVpCQjNFaUF6WUNDRUVCSVFjZ0JpQUlTdzBBSUFBZ0NTQUdRUU4yYWlJRU5nSUVJQUVnQWtFYmRrRUJhallDakFNQ1FDQUlJQVpySWdaQklFNEVRQ0FFS0FBQUlnSkJHSFFnQWtFSWRFR0FnUHdIY1hJZ0FrRUlka0dBL2dOeElBSkJHSFp5Y2lFQ0lBTkZEUUVnQWlBRGRDQUVMUUFFUVFnZ0EydDJjaUVDREFFTElBWkJBVWdFUUVFQUlRSU1BUXNnQkMwQUFDQURRUmh5SWdkMElRSWdBeUFHYWtFSWF5SURRUUZJRFFBRFFDQUVMUUFCSUFkQkNHc2lCM1FnQW5JaEFpQURRUWhLSVFZZ0JFRUJhaUVFSUFOQkNHc2hBeUFHRFFBTEN5QUFJQVZCQ21vaUJEWUNFQ0FBSUFSQkIzRTJBZ2hCQVNFSElBUWdDRXNOQUNBQUlBa2dCRUVEZG1vMkFnUWdBU0FDUVJ0MlFRRnFOZ0tRQXlBQVFRVVFGQ0lDUVg5R0RRQWdBU0FDUVFGcU5nS1VBeUFBUVFVUUZDSUFRWDlHRFFBZ0FTQUFOZ0tZQTBFQUlRY0xJQWNMcUF3QkNuOENRQ0FCUVFSUEJFQkJBQ0FEYXlJTVFRRjBJUXNDUUNBQ0tBSUVJZ0VnQUNBRGF5SUdMUUFBSWdjZ0FDMEFBQ0lJYXlJS0lBcEJIM1VpQ21vZ0NuTk5EUUFnQWlnQ0NDSUZJQUFnQzJvdEFBQWlDaUFIYXlJSklBbEJIM1VpQ1dvZ0NYTk5EUUFnQlNBQUlBTnFMUUFBSWdVZ0NHc2lDU0FKUVI5MUlnbHFJQWx6VFEwQUlBWWdCU0FIYWlBS1FRRjBha0VDYWtFQ2Rqb0FBQ0FBSUFnZ0JVRUJkR29nQ21wQkFtcEJBblk2QUFBZ0FpZ0NCQ0VCQ3dKQUlBQkJBV29pQnlBTWFpSUpMUUFBSWdnZ0FDMEFBU0lLYXlJRklBVkJIM1VpQldvZ0JYTWdBVThOQUNBQ0tBSUlJZ1lnQnlBTGFpMEFBQ0lGSUFocklnUWdCRUVmZFNJRWFpQUVjMDBOQUNBR0lBTWdCMm90QUFBaUJpQUtheUlFSUFSQkgzVWlCR29nQkhOTkRRQWdDU0FHSUFocUlBVkJBWFJxUVFKcVFRSjJPZ0FBSUFjZ0NpQUdRUUYwYWlBRmFrRUNha0VDZGpvQUFDQUNLQUlFSVFFTEFrQWdBRUVDYWlJSElBeHFJZ2t0QUFBaUNDQUFMUUFDSWdwcklnVWdCVUVmZFNJRmFpQUZjeUFCVHcwQUlBSW9BZ2dpQmlBSElBdHFMUUFBSWdVZ0NHc2lCQ0FFUVI5MUlnUnFJQVJ6VFEwQUlBWWdBeUFIYWkwQUFDSUdJQXBySWdRZ0JFRWZkU0lFYWlBRWMwME5BQ0FKSUFZZ0NHb2dCVUVCZEdwQkFtcEJBblk2QUFBZ0J5QUtJQVpCQVhScUlBVnFRUUpxUVFKMk9nQUFJQUlvQWdRaEFRc0NRQ0FBUVFOcUlnY2dER29pQ1MwQUFDSUlJQUF0QUFNaUNtc2lCU0FGUVI5MUlnVnFJQVZ6SUFGUERRQWdBaWdDQ0NJR0lBY2dDMm90QUFBaUJTQUlheUlFSUFSQkgzVWlCR29nQkhOTkRRQWdCaUFESUFkcUxRQUFJZ1lnQ21zaUJDQUVRUjkxSWdScUlBUnpUUTBBSUFrZ0JpQUlhaUFGUVFGMGFrRUNha0VDZGpvQUFDQUhJQW9nQmtFQmRHb2dCV3BCQW1wQkFuWTZBQUFnQWlnQ0JDRUJDd0pBSUFCQkJHb2lCeUFNYWlJSkxRQUFJZ2dnQUMwQUJDSUtheUlGSUFWQkgzVWlCV29nQlhNZ0FVOE5BQ0FDS0FJSUlnWWdCeUFMYWkwQUFDSUZJQWhySWdRZ0JFRWZkU0lFYWlBRWMwME5BQ0FHSUFNZ0Iyb3RBQUFpQmlBS2F5SUVJQVJCSDNVaUJHb2dCSE5ORFFBZ0NTQUdJQWhxSUFWQkFYUnFRUUpxUVFKMk9nQUFJQWNnQ2lBR1FRRjBhaUFGYWtFQ2FrRUNkam9BQUNBQ0tBSUVJUUVMQWtBZ0FFRUZhaUlISUF4cUlna3RBQUFpQ0NBQUxRQUZJZ3BySWdVZ0JVRWZkU0lGYWlBRmN5QUJUdzBBSUFJb0FnZ2lCaUFISUF0cUxRQUFJZ1VnQ0dzaUJDQUVRUjkxSWdScUlBUnpUUTBBSUFZZ0F5QUhhaTBBQUNJR0lBcHJJZ1FnQkVFZmRTSUVhaUFFYzAwTkFDQUpJQVlnQ0dvZ0JVRUJkR3BCQW1wQkFuWTZBQUFnQnlBS0lBWkJBWFJxSUFWcVFRSnFRUUoyT2dBQUlBSW9BZ1FoQVFzQ1FDQUFRUVpxSWdjZ0RHb2lDUzBBQUNJSUlBQXRBQVlpQ21zaUJTQUZRUjkxSWdWcUlBVnpJQUZQRFFBZ0FpZ0NDQ0lHSUFjZ0Myb3RBQUFpQlNBSWF5SUVJQVJCSDNVaUJHb2dCSE5ORFFBZ0JpQURJQWRxTFFBQUlnWWdDbXNpQkNBRVFSOTFJZ1JxSUFSelRRMEFJQWtnQmlBSWFpQUZRUUYwYWtFQ2FrRUNkam9BQUNBSElBb2dCa0VCZEdvZ0JXcEJBbXBCQW5ZNkFBQWdBaWdDQkNFQkN5QUJJQUJCQjJvaUFTQU1haUlITFFBQUlnd2dBQzBBQnlJQWF5SUlJQWhCSDNVaUNHb2dDSE5ORFFFZ0FpZ0NDQ0lJSUFFZ0Myb3RBQUFpQWlBTWF5SUxJQXRCSDNVaUMyb2dDM05ORFFFZ0FTQURhaTBBQUNJRElBQnJJZ3NnQzBFZmRTSUxhaUFMY3lBSVR3MEJJQWNnQXlBTWFpQUNRUUYwYWtFQ2FrRUNkam9BQUNBQklBQWdBMEVCZEdvZ0FtcEJBbXBCQW5ZNkFBQVBDMEVBSUFOcklncEJBWFFoQlNBQklBSW9BZ0JxUVFGckxRQUFJZ0ZCZjNNaEJ5QUJRUUZxSVFoQkNDRUJBMEFDUUNBQ0tBSUVJQUFnQ21vaUJpMEFBQ0lMSUFBdEFBQWlER3NpQ1NBSlFSOTFJZ2xxSUFselRRMEFJQUlvQWdnaUNTQUFJQVZxTFFBQUlnUWdDMnNpRFNBTlFSOTFJZzFxSUExelRRMEFJQWtnQUNBRGFpMEFBQ0lKSUF4cklnMGdEVUVmZFNJTmFpQU5jMDBOQUNBR0lBc2dCeUFJSUF3Z0MydEJBblFnQ1dzZ0JHcEJCR3BCQTNVaUN5QUlJQXRJR3lBSElBdEtHeUlMYWtIQU5Xb3RBQUE2QUFBZ0FDQU1JQXRyUWNBMWFpMEFBRG9BQUFzZ0FFRUJhaUVBSUFGQkFXc2lBUTBBQ3dzTEJnQWdBQkFFQ3djQVFjUWFFQWdMeUFNQkEzOERRQ0FBSUFKQkFuUnFJZ0ZCRkdvb0FnQWlBd1JBSUFNb0FpZ1FCQ0FCS0FJVVFRQTJBaWdnQVNnQ0ZDZ0NWQkFFSUFFb0FoUkJBRFlDVkNBQktBSVVFQVFnQVVFQU5nSVVDeUFDUVFGcUlnSkJJRWNOQUF0QkFDRUNBMEFnQUNBQ1FRSjBhaUlCUVpRQmFpZ0NBQ0lEQkVBZ0F5Z0NGQkFFSUFFb0FwUUJRUUEyQWhRZ0FTZ0NsQUVvQWhnUUJDQUJLQUtVQVVFQU5nSVlJQUVvQXBRQktBSWNFQVFnQVNnQ2xBRkJBRFlDSENBQktBS1VBU2dDTEJBRUlBRW9BcFFCUVFBMkFpd2dBU2dDbEFFUUJDQUJRUUEyQXBRQkN5QUNRUUZxSWdKQmdBSkhEUUFMSUFBb0FyQWFFQVJCQUNFQ0lBQkJBRFlDc0JvZ0FDZ0N2QWtRQkNBQVFRQTJBcndKSUFBb0FwUUpFQVFnQUVFQU5nS1VDU0FBS0FLOEdpSURCRUFnQXhBRUlBQkJBRFlDdkJvTEFrQWdBQ2dDeEFraUEwVU5BQ0FBUWVBSmFpZ0NBRUYvUmdSQUlBTWhBZ3dCQzBFQUlRRWdBeUVDQTBBZ0FpQUJRU2hzSWdOcUtBSUVFQVFnQUNnQ3hBa2lBaUFEYWtFQU5nSUVJQUZCQVdvaUFTQUFLQUxnQ1VFQmFra05BQXNMSUFJUUJDQUFRUUEyQXNRSklBQkJ5QWxxSWdNb0FnQVFCQ0FEUVFBMkFnQWdBRUhRQ1dvaUFDZ0NBQkFFSUFCQkFEWUNBQXZOM3dRQ2FIOENmaU1BUWZBQmF5SUxKQUFnQUVIc0RHb2hWQ0FBUWJRU2FpRlZJQUJCMkFwcUlWWWdBRUhFQ1dvaE9DQUFRYmdLYWlFcklBQkJuQnBxSVR3Z0MwRzBBV29oVnlBTFFiQUJhaUZZSUF0QnJBRnFJVmtnQzBHb0FXb2hXaUFMUVpRQmFpRmJJQXRCakFGcUlWd2dDMEh3QUdvaFhTQUxRVEJxSVY0Z0MwRWdha0VFY2lGZkEwQWdBU0F5YWlFQklBSWdNbXNoQWdKQUFrQUNRQUpBSUFBb0FwQWFSUTBBSUFBb0FwUWFJQUZIRFFBZ0N5QThLQUlRTmdJWUlBc2dQQ2tDQ0RjREVDQThLUUlBSVc1QkFDRUtJQXRCQURZQ0dDQUxRUUEyQWhBZ0N5QnVOd01JSUFzZ2JqNENEQ0FBS0FLWUdpRXlJQXNvQWhRaEJnd0JDd0pBQWtBZ0FrRUVTUTBBSUFFdEFBQU5BQ0FCTFFBQkRRQWdBUzBBQWlJTlFRRkxEUUJCQXlFSElBRkJBMm9oQ1VFQ0lUSURRQ0FKSVFZQ1FDQU5RZjhCY1NJSVJRUkFJREpCQVdvaE1nd0JDMEVBSVFrZ0NFRUJSd1JBUVFBaE1nd0JDeUF5UVFGTElRaEJBQ0V5SUFoRkRRQWdCeUV5UVFBaEdFRUFJUklEUUVFQklCZ2dDU0FHTFFBQUlncEZhaUlJUVFKR0d5QVlJQXBCQTBZYklSZ0NRQ0FLUVFGSERRQWdDRUVDU1EwQUlBc2dNaUFISUFocWF5SUdOZ0lVUVFBZ0NFRURheUlKSUFnZ0NVa2JJUWtNQlF0QkFDQUlJQW9iSVFsQkFTQVNJQWhCQWtzYklCSWdDaHNoRWlBR1FRRnFJUVlnTWtFQmFpSXlJQUpIRFFBTElBc2dBaUFISUFscWF5SUdOZ0lVREFNTElBWkJBV29oQ1NBR0xRQUFJUTFCQXlFTVFRQWhDaUFIUVFGcUlnY2dBa2NOQUFzZ0FpRXlEQVFMSUFzZ0FqWUNGRUVCSVJoQkFDRUhJQUloQmtFQUlRbEJBQ0VTQzBFQUlRb2dDMEVBTmdJWUlBdEJBRFlDRUNBTElBRWdCMm9pRFRZQ0RDQUxJQTAyQWdnZ0J5QUphaUFHYWlFeVFRTWhEQ0FTRFFJZ0dBUkFJQTBoQnlBTElBWUVmd05BSUFaQkFXc2hCaUFITFFBQUlRZ0NmeUFLUVFKR0JFQWdDRUVEUmdSQUlBWkZCRUJCQUNFS0RBa0xRUUFpQ2lBSExRQUJRUU5ORFFJYURBZ0xJQWhCQTBrTkJnc2dEU0FJT2dBQUlBMUJBV29oRFVFQUlBcEJBV29nQ0JzTElRb2dCMEVCYWlFSElBWU5BQXNnQ3lnQ0dDRUtJQXNvQWhRRlFRQUxJQTBnQjJ0cUlnWTJBaFFMSUR3Z0N5a0RDRGNDQUNBOElBc29BaGcyQWhBZ1BDQUxLUU1RTndJSUlBQWdBVFlDbEJvZ0FDQXlOZ0tZR2dzZ0FFRUFOZ0tRR2dKQUlBWkJBM1FpR0NBS2F5SUdRUUZyUVI1TERRQWdCaUFMS0FJUWFrRUlheUlHUVFGSURRQURRQ0FHUVFoS0lRY2dCa0VJYXlFR0lBY05BQXNMSUFzZ0NrRUJhaUlITmdJWUlBc2dCMEVIY1NJSU5nSVFJQWNnR0VzRVFFRURJUXhCQUNFS0RBSUxJQXNnQ3lnQ0NDSU9JQWRCQTNacUlnWTJBZ3dDUUNBWUlBZHJJZzFCSUU0RVFDQUdLQUFBSWdkQkdIUWdCMEVJZEVHQWdQd0hjWElnQjBFSWRrR0EvZ054SUFkQkdIWnljaUVKSUFoRkRRRWdDU0FJZENBR0xRQUVRUWdnQ0d0MmNpRUpEQUVMSUExQkFVZ0VRRUVBSVFrTUFRc2dCaTBBQUNBSVFSaHlJZ3gwSVFrZ0JpRUhJQWdnRFdwQkNHc2lEVUVCU0EwQUEwQWdCeTBBQVNBTVFRaHJJZ3gwSUFseUlRa2dEVUVJU2lFSUlBZEJBV29oQnlBTlFRaHJJUTBnQ0EwQUN3c2dDeUFLUVFOcUlnZzJBaGdnQ3lBSVFRZHhJZ2MyQWhCQmZ5RVNJQWdnR0UwRVFDQUxJQTRnQ0VFRGRtb2lCallDRENBSlFSNTJJUklMQWtBZ0dDQUlheUlJUVNCT0JFQWdCaWdBQUNJSVFSaDBJQWhCQ0hSQmdJRDhCM0Z5SUFoQkNIWkJnUDREY1NBSVFSaDJjbkloRFNBSFJRMEJJQTBnQjNRZ0JpMEFCRUVJSUFkcmRuSWhEUXdCQ3lBSVFRRklCRUJCQUNFTkRBRUxJQVl0QUFBZ0IwRVljaUlKZENFTklBY2dDR3BCQ0dzaUIwRUJTQTBBQTBBZ0JpMEFBU0FKUVFocklnbDBJQTF5SVEwZ0IwRUlTaUVJSUFaQkFXb2hCaUFIUVFocklRY2dDQTBBQ3dzZ0N5QUtRUWR4TmdJUUlBc2dDa0VJYWlJR05nSVlRUUFoQ2lBR0lCaExCRUJCQUNFTURBSUxJQXNnRGlBR1FRTjJhallDRENBTlFSdDJJaHBCQW10QkEwa0VRRUVESVF3TUFnc0NRQ0FhUVF4TERRQkJBU0FhZENJR1FjQThjVVVFUUNBR1FhQURjVVVOQVNBU1JRUkFRUU1oREF3RUN5QWFRUVpIRFFGQkF5RU1EQU1MSUJKRkRRQkJBeUVNREFJTElCcEJBV3NpRTBFTFN3UkFRUUFoREF3Q0N3SkFJQnBCRWtzTkFBSkFBa0JCQVNBYWRDSUdRY0RmSDNGRkJFQWdCa0VpY1VVTkF5QUFLQUswQ2dSL0lBQkJBRFlDdEFwQkFRVkJBQXNoQ2lBTElBc29BaGcyQXVBQklBc2dDeWtEQ0RjRDBBRWdDeUFMUVJCcUloZ3BBd0EzQTlnQklBdEIwQUZxSUF0QjdBRnFFQUlpQmcwQklBdEIwQUZxSUF0QjdBRnFFQUlOQkNBTFFkQUJhaUFMUWV3QmFoQUNEUVFnQ3lnQzdBRWlCa0gvQVVzTkJDQUFJQVpCQW5ScUtBS1VBU0lOUlEwQ0lBQWdEU2dDQkNJR1FRSjBhaWdDRkNJSFJRMENBa0FnQUNnQ0NDSUlRU0JHRFFBZ0JpQUlSZzBBSUJwQkJVY05Bd3NnQ2lBS1FRRWdFaHRCQVNBQUtBS1lDaUlHR3lBR0lCSkdHeUVLQWtBQ1FDQUFLQUtVQ2tFRlJnUkFJQnBCQlVjTkFRd0NDeUFhUVFWSERRRUxRUUVoQ2dzZ0J5Z0NEQ0VHSUFzZ0N5Z0NHRFlDNEFFZ0N5QVlLUU1BTndQWUFTQUxJQXNwQXdnM0E5QUJJQXRCMEFGcUlBdEI3QUZxRUFJTkJDQUxRZEFCYWlBTFFld0JhaEFDRFFRZ0MwSFFBV29nQzBIc0FXb1FBZzBFUVI4Z0JtY2lDV3NoSnlBTEtBTFVBU0VPQWtBZ0N5Z0MzQUZCQTNRaURDQUxLQUxnQVNJVWF5SUdRU0JPQkVBZ0RpZ0FBQ0lHUVJoMElBWkJDSFJCZ0lEOEIzRnlJQVpCQ0haQmdQNERjU0FHUVJoMmNuSWhEeUFMS0FMWUFTSUdSUTBCSUE4Z0JuUWdEaTBBQkVFSUlBWnJkbkloRHd3QkN5QUdRUUZJQkVCQkFDRVBEQUVMSUE0dEFBQWdDeWdDMkFFaUVVRVlhaUlJZENFUElBWWdFV3BCQ0dzaUVVRUJTQTBBQTBBZ0RpMEFBU0FJUVFocklnaDBJQTl5SVE4Z0VVRUlTaUVHSUE1QkFXb2hEaUFSUVFocklSRWdCZzBBQ3dzZ0ZDQW5haUFNU3cwRUlBOGdDVUVCYW5ZaUJrRi9SZzBFSUFZZ0FDZ0NuQXBIQkVBZ0FDQUdOZ0tjQ2tFQklRb0xJQnBCQlVjaUZFVUVRQ0FIS0FJTUlRWWdDeUFMS0FJWU5nTGdBU0FMSUJncEF3QTNBOWdCSUFzZ0N5a0RDRGNEMEFFZ0MwSFFBV29nQzBIc0FXb1FBZzBGSUF0QjBBRnFJQXRCN0FGcUVBSU5CU0FMUWRBQmFpQUxRZXdCYWhBQ0RRVkJIeUFHWnlJTWF5RU9JQXNvQXRRQklSRUNRQ0FMS0FMY0FVRURkQ0ljSUFzb0F1QUJJaGRySWdsQklFNEVRQ0FSS0FBQUlnWkJHSFFnQmtFSWRFR0FnUHdIY1hJZ0JrRUlka0dBL2dOeElBWkJHSFp5Y2lFSUlBc29BdGdCSWdaRkRRRWdDQ0FHZENBUkxRQUVRUWdnQm10MmNpRUlEQUVMSUFsQkFVZ0VRRUVBSVFnTUFRc2dFUzBBQUNBTEtBTFlBU0luUVJocUlnWjBJUWdnQ1NBbmFrRUlheUlQUVFGSURRQURRQ0FSTFFBQklBWkJDR3NpQm5RZ0NISWhDQ0FQUVFoS0lTY2dFVUVCYWlFUklBOUJDR3NoRHlBbkRRQUxDeUFMSUE0Z0Yyb2lCallDNEFFZ0N5QUdRUWR4TmdMWUFTQUdJQnhMRFFVZ0N5QUxLQUxRQVNBR1FRTjJhallDMUFFZ0NDQU1RUUZxZGtGL1JnMEZJQXRCMEFGcUlBdEJ5QUZxRUFJTkJRSkFJQUFvQXBRS1FRVkhCRUFnQ3lnQ3lBRWhFUXdCQ3lBS1FRRWdDeWdDeUFFaUVTQUFLQUtnQ2tZYklRb0xJQUFnRVRZQ29Bb0xBa0FDUUFKQUlBY29BaEFPQWdBQkFnc2dDeUFMS0FJWU5nTGdBU0FMSUFzcEF3ZzNBOUFCSUFzZ0dDa0RBRGNEMkFFZ0MwSFFBV29nQzBIc0FXb1FBZzBHSUF0QjBBRnFJQXRCN0FGcUVBSU5CaUFMUWRBQmFpQUxRZXdCYWhBQ0RRWkJIeUFIS0FJTVp5SU1heUVjSUFzb0F0UUJJUkVDUUNBTEtBTGNBVUVEZENJT0lBc29BdUFCSWhkcklnbEJJRTRFUUNBUktBQUFJZ1pCR0hRZ0JrRUlkRUdBZ1B3SGNYSWdCa0VJZGtHQS9nTnhJQVpCR0haeWNpRUlJQXNvQXRnQklnWkZEUUVnQ0NBR2RDQVJMUUFFUVFnZ0JtdDJjaUVJREFFTElBbEJBVWdFUUVFQUlRZ01BUXNnRVMwQUFDQUxLQUxZQVNJblFSaHFJZ1owSVFnZ0NTQW5ha0VJYXlJUFFRRklEUUFEUUNBUkxRQUJJQVpCQ0dzaUJuUWdDSEloQ0NBUFFRaEtJU2NnRVVFQmFpRVJJQTlCQ0dzaER5QW5EUUFMQ3lBTElCY2dIR29pQmpZQzRBRWdDeUFHUVFkeE5nTFlBU0FHSUE1TERRWWdDeUFMS0FMUUFTQUdRUU4yYWlJUk5nTFVBU0FJSUF4QkFXcDJRWDlHRFFZZ0ZFVUVRQ0FMUWRBQmFpQUxRZXdCYWhBQ0RRY2dDeWdDMUFFaEVTQUxLQUxjQVVFRGRDRU9JQXNvQXVBQklRWUxRUjhnQnlnQ0ZHY2lER3NoSEFKQUlBNGdCbXNpQ1VFZ1RnUkFJQkVvQUFBaUNFRVlkQ0FJUVFoMFFZQ0EvQWR4Y2lBSVFRaDJRWUQrQTNFZ0NFRVlkbkp5SVFnZ0N5Z0MyQUVpQ1VVTkFTQUlJQWwwSUJFdEFBUkJDQ0FKYTNaeUlRZ01BUXNnQ1VFQlNBUkFRUUFoQ0F3QkN5QVJMUUFBSUFzb0F0Z0JJZzlCR0dvaUozUWhDQ0FKSUE5cVFRaHJJZzlCQVVnTkFBTkFJQkV0QUFFZ0owRUlheUluZENBSWNpRUlJQTlCQ0VvaENTQVJRUUZxSVJFZ0QwRUlheUVQSUFrTkFBc0xJQVlnSEdvZ0Rrc05CaUFJSUF4QkFXcDJJZ1pCZjBZTkJpQUdJQUFvQXFRS1J3UkFJQUFnQmpZQ3BBcEJBU0VLQ3lBTktBSUlSUTBCSUFzZ0N5Z0NHRFlDNEFFZ0N5QUxLUU1JTndQUUFTQUxJQmdwQXdBM0E5Z0JJQXRCMEFGcUlBdEJ6QUZxRUFJTkJpQUxRZEFCYWlBTFFjd0JhaEFDRFFZZ0MwSFFBV29nQzBITUFXb1FBZzBHUVI4Z0J5Z0NER2NpSjJzaENDQUxLQUxVQVNFTkFrQWdDeWdDM0FGQkEzUWlEeUFMS0FMZ0FTSU9heUlHUVNCT0JFQWdEU2dBQUNJR1FSaDBJQVpCQ0hSQmdJRDhCM0Z5SUFaQkNIWkJnUDREY1NBR1FSaDJjbkloRENBTEtBTFlBU0lHUlEwQklBd2dCblFnRFMwQUJFRUlJQVpyZG5JaERBd0JDeUFHUVFGSUJFQkJBQ0VNREFFTElBMHRBQUFnQ3lnQzJBRWlDVUVZYWlJWWRDRU1JQVlnQ1dwQkNHc2lDVUVCU0EwQUEwQWdEUzBBQVNBWVFRaHJJaGgwSUF4eUlRd2dDVUVJU2lFR0lBMUJBV29oRFNBSlFRaHJJUWtnQmcwQUN3c2dDeUFJSUE1cUloZzJBdUFCSUFzZ0dFRUhjVFlDMkFFZ0R5QVlTUTBHSUFzZ0N5Z0MwQUVnR0VFRGRtb2lEVFlDMUFFZ0RDQW5RUUZxZGtGL1JnMEdJQlJGQkVBZ0MwSFFBV29nQzBITUFXb1FBZzBISUFzb0F0d0JRUU4wSVE4Z0N5Z0M0QUVoR0NBTEtBTFVBU0VOQzBFZklBY29BaFJuSWdkcklRZ0NRQ0FQSUJocklnWkJJRTRFUUNBTktBQUFJZ1pCR0hRZ0JrRUlkRUdBZ1B3SGNYSWdCa0VJZGtHQS9nTnhJQVpCR0haeWNpRU1JQXNvQXRnQklnWkZEUUVnRENBR2RDQU5MUUFFUVFnZ0JtdDJjaUVNREFFTElBWkJBVWdFUUVFQUlRd01BUXNnRFMwQUFDQUxLQUxZQVNJSlFSaHFJZzUwSVF3Z0JpQUpha0VJYXlJSlFRRklEUUFEUUNBTkxRQUJJQTVCQ0dzaURuUWdESEloRENBSlFRaEtJUVlnRFVFQmFpRU5JQWxCQ0dzaENTQUdEUUFMQ3lBTElBZ2dHR29pQmpZQzRBRWdDeUFHUVFkeE5nTFlBU0FHSUE5TERRWWdDeUFMS0FMUUFTQUdRUU4yYWpZQzFBRWdEQ0FIUVFGcWRrRi9SZzBHSUF0QkFEWUM3QUVnQzBIUUFXb2dDMEhzQVdvUUFpRUdBa0FnQ3lnQzdBRWlCMEYvUmdSQVFZQ0FnSUI0SVFrZ0JrVU5DQXdCQ3lBR0RRY2dCMEVCYWtFQmRpSUdRUUFnQm1zZ0IwRUJjUnNoQ1FzZ0FDZ0NxQW9nQ1VZTkFTQUFJQWsyQXFnS1FRRWhDZ3dCQ3lBSEtBSVlEUUFnRFNnQ0NDRU9JQXNnQ3lnQ0dEWUM0QUVnQ3lBWUtRTUFOd1BZQVNBTElBc3BBd2czQTlBQklBdEIwQUZxSUF0QnpBRnFFQUlOQlNBTFFkQUJhaUFMUWN3QmFoQUNEUVVnQzBIUUFXb2dDMEhNQVdvUUFnMEZRUjhnQnlnQ0RHY2lCMnNoRVNBTEtBTFVBU0VKQWtBZ0N5Z0MzQUZCQTNRaUR5QUxLQUxnQVNJbmF5SUdRU0JPQkVBZ0NTZ0FBQ0lHUVJoMElBWkJDSFJCZ0lEOEIzRnlJQVpCQ0haQmdQNERjU0FHUVJoMmNuSWhHQ0FMS0FMWUFTSUdSUTBCSUJnZ0JuUWdDUzBBQkVFSUlBWnJkbkloR0F3QkN5QUdRUUZJQkVCQkFDRVlEQUVMSUFrdEFBQWdDeWdDMkFFaURFRVlhaUlJZENFWUlBWWdER3BCQ0dzaURFRUJTQTBBQTBBZ0NTMEFBU0FJUVFocklnaDBJQmh5SVJnZ0RFRUlTaUVHSUFsQkFXb2hDU0FNUVFocklRd2dCZzBBQ3dzZ0N5QVJJQ2RxSWdZMkF1QUJJQXNnQmtFSGNUWUMyQUVnQmlBUFN3MEZJQXNnQ3lnQzBBRWdCa0VEZG1vMkF0UUJJQmdnQjBFQmFuWkJmMFlOQlNBVVJRUkFJQXRCMEFGcUlBdEJ6QUZxRUFJTkJnc2dDMEVBTmdMc0FTQUxRZEFCYWlBTFFld0JhaEFDSVFZQ1FDQUxLQUxzQVNJSFFYOUdCRUJCZ0lDQWdIZ2hEQ0FHUlEwSERBRUxJQVlOQmlBSFFRRnFRUUYySWdaQkFDQUdheUFIUVFGeEd5RU1Dd0pBSUE1RkJFQWdZQ0VKREFFTElBdEJBRFlDN0FFZ0MwSFFBV29nQzBIc0FXb1FBaUVZSUFzb0F1d0JJZ1pCZjBZRVFFR0FnSUNBZUNFSklCaEZEUWNNQVFzZ0dBMEdJQVpCQVdwQkFYWWlHRUVBSUJocklBWkJBWEViSVFrTElBd2dBQ2dDckFwSEJFQWdBQ0FNTmdLc0NrRUJJUW9MQWtBZ0RTZ0NDRVVOQUNBQUtBS3dDaUFKUmcwQUlBQWdDVFlDc0FwQkFTRUtDeUFKSVdBTElBQWdHcTBnRXExQ0lJYUVOd0tVQ2d3REMwRUJJUW9NQWdzZ0JrVU5BU0FHUWZEL0EwY05BZ3RCQkNFTVFRQWhDZ3dDQ3dKQUlBb0VRQUpBSUFBb0FxQUpSUTBBSUFBb0FoQkZEUUJCQUNFS0lBQW9BclFhQkVCQkF5RU1EQVVMQWtBZ0FDZ0NwQWxGQkVBZ0FDQUFLQUxFQ1NJSElBQW9BdUFKUVNoc2FpSUdOZ0xNQ1NBQUlBWW9BZ0EyQXJnS0lBQW9BdXdKSWdoRkJFQkJBQ0VKREFJTElBaEJBM0VoQ2tFQUlRbEJBQ0VHQWtBZ0NFRUJhMEVEU1EwQUlBaEJmSEVoRFFOQUlBQW9Bc2dKSUFaQkFuUnFJQWNnQmtFb2JHbzJBZ0FnQUNnQ3lBa2dCa0VCY2lJSFFRSjBhaUFBS0FMRUNTQUhRU2hzYWpZQ0FDQUFLQUxJQ1NBR1FRSnlJZ2RCQW5ScUlBQW9Bc1FKSUFkQktHeHFOZ0lBSUFBb0FzZ0pJQVpCQTNJaUIwRUNkR29nQUNnQ3hBa2dCMEVvYkdvMkFnQWdCa0VFYWlFR0lBMUJCR3NpRFVVTkFTQTRLQUlBSVFjTUFBc0FDeUFLUlEwQkEwQWdBQ2dDeUFrZ0JrRUNkR29nQUNnQ3hBa2dCa0VvYkdvMkFnQWdCa0VCYWlFR0lBcEJBV3NpQ2cwQUN3d0JDeUFBS0FMY0NpRUpDMEVBSVFkQkFDRU1RUUFoRFFKQUFrQUNRQ0FKRGdZQkFBQUFBQUVBQ3lBQUtBSzRHZzBBREFFTElBQkJ5QWxxS0FJQUlRZ0RRQUovUVFBZ0NDQUhRUUowYWlnQ0FDSUdSUTBBR2tFQUlBWW9BaFJCQWtrTkFCb2dCaWdDQUFzaERDQUhRUTVMRFFFZ0IwRUJhaUVISUF4RkRRQUxDeUFyS0FJSUlSRWdLeWdDQkNFT0FrQUNRQUpBSUFBb0FwZ0pJZ2hGQkVCQkFDRUdRUUFoQnd3QkN5QUFLQUs4Q1NFS1FRQWhCMEVBSVFZRFFDQUtJQWRCMkFGc2FpZ0N4QUVOQVVFQUlBWkJBV29pQmlBR0lBNUdJaEliSVFZZ0RTQVNhaUVOSUFkQkFXb2lCeUFJUncwQUN3d0JDeUFISUFoR0RRQWdBQ2dDdkFrZ0RTQU9iRUhZQVd4cUlRZ2dCZ1JBSUFZaEJ3TkFJQWdnQjBFQmF5SUhRZGdCYkdvaUNpQXJJQTBnQnlBSklBd1FEU0FLUVFFMkFzUUJJQUFnQUNnQ3RBbEJBV28yQXJRSklBY05BQXNMSUE0Z0JrRUJhaUlIU3dSQUEwQWdDQ0FIUWRnQmJHb2lCaWdDeEFGRkJFQWdCaUFySUEwZ0J5QUpJQXdRRFNBR1FRRTJBc1FCSUFBZ0FDZ0N0QWxCQVdvMkFyUUpDeUFIUVFGcUlnY2dEa2NOQUFzTElBMEVRQ0FPUlEwQ0lBMUJBbXNoQ2tFQUlSSkJBQ0FPYXlFVUlBMUJBV3NpRHlBT2JFSFlBV3doRXdOQUlBQW9BcndKSUJOcUlCSkIyQUZzYWlJR0lDc2dEeUFTSUFrZ0RCQU5JQVpCQVRZQ3hBRWdBQ0FBS0FLMENVRUJhallDdEFrQ1FDQVBSUTBBSUFZZ0ZFSFlBV3dpR21vaUNDQXJJQW9nRWlBSklBd1FEU0FLSVFjRFFDQUdJQnBxUVFFMkFzUUJJQUFnQUNnQ3RBbEJBV28yQXJRSklBZEZEUUVnQ0NJR0lCcHFJZ2dnS3lBSFFRRnJJZ2NnRWlBSklBd1FEUXdBQ3dBTElCSkJBV29pRWlBT1J3MEFDd3NnRFVFQmFpSUdJQkZQRFFFZ0RrVU5BUU5BSUFBb0Fyd0pJQVlnRG14QjJBRnNhaUVLUVFBaEJ3TkFJQW9nQjBIWUFXeHFJZ2dvQXNRQlJRUkFJQWdnS3lBR0lBY2dDU0FNRUEwZ0NFRUJOZ0xFQVNBQUlBQW9BclFKUVFGcU5nSzBDUXNnQjBFQmFpSUhJQTVIRFFBTElBWkJBV29pQmlBUlJ3MEFDd3dCQ3dKQUFrQUNRQUpBQWtBZ0NVRUNhdzRHQUFFQkFRRUFBUXNnQUNnQ3VCcEZEUUVMSUF3TkFRc2dLeWdDQUVHQUFTQU9JQkZzUVlBRGJCQURHZ3dCQ3lBcktBSUFJQXdnRGlBUmJFR0FBMndRQnhvTElBQWdBQ2dDbUFraUNUWUN0QWtnQ1VVTkFDQUpRUWR4SVFZZ0FDZ0N2QWtoQ0VFQUlRY2dDVUVCYTBFSFR3UkFJQWxCZUhFaERBTkFJQWdnQjBIWUFXeHFRUUUyQWdnZ0NDQUhRUUZ5UWRnQmJHcEJBVFlDQ0NBSUlBZEJBbkpCMkFGc2FrRUJOZ0lJSUFnZ0IwRURja0hZQVd4cVFRRTJBZ2dnQ0NBSFFRUnlRZGdCYkdwQkFUWUNDQ0FJSUFkQkJYSkIyQUZzYWtFQk5nSUlJQWdnQjBFR2NrSFlBV3hxUVFFMkFnZ2dDQ0FIUVFkeVFkZ0JiR3BCQVRZQ0NDQUhRUWhxSVFjZ0RFRUlheUlNRFFBTEN5QUdSUTBBQTBBZ0NDQUhRZGdCYkdwQkFUWUNDQ0FIUVFGcUlRY2dCa0VCYXlJR0RRQUxDeUFBUVFFMkFwQWFRUUFoQmtFQUlUSU1BZ3NnQUVFQU5nS2NDU0FBUVFBMkFxUUpDMEVBSVFwQkFDRU1Ba0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFJQk1PQ0FJTEN3c0NDd0FCQ3dzZ0MwSG9BR3BCQUVIY0FCQURHaUFMS0FJTUlRWUNRQ0FMS0FJVVFRTjBJZ2dnQ3lnQ0dDSUpheUlLUVNCT0JFQWdCaWdBQUNJSFFSaDBJQWRCQ0hSQmdJRDhCM0Z5SUFkQkNIWkJnUDREY1NBSFFSaDJjbkloQnlBTEtBSVFJZ3BGRFFFZ0J5QUtkQ0FHTFFBRVFRZ2dDbXQyY2lFSERBRUxJQXBCQVVnRVFFRUFJUWNNQVFzZ0JpMEFBQ0FMS0FJUUlneEJHR29pRFhRaEJ5QUtJQXhxUVFocklncEJBVWdOQUFOQUlBWXRBQUVnRFVFSWF5SU5kQ0FIY2lFSElBcEJDRW9oRENBR1FRRnFJUVlnQ2tFSWF5RUtJQXdOQUFzTElBc2dDVUVIY1NJTU5nSVFJQXNnQ1VFSWFpSUdOZ0lZSUFZZ0NFc05CeUFMSUFkQkdIWTJBbWdnQ3lBTEtBSUlJZzRnQmtFRGRtbzJBZ3dnQ1VFSmFpSUdJQWhOQkVBZ0N5QU9JQVpCQTNacU5nSU1DeUFMSUFsQkNtb2lCallDR0NBTElBWkJCM0VpQnpZQ0VDQUdJQWhOQkVBZ0N5QU9JQVpCQTNacU5nSU1Dd0pBSUFnZ0Jtc2lCa0VCYTBFZVN3MEFJQVlnQjJwQkNHc2lCa0VCU0EwQUEwQWdCa0VJU2lFSElBWkJDR3NoQmlBSERRQUxDeUFMSUFsQkMyb2lCallDR0NBTElBWkJCM0VpQnpZQ0VDQUdJQWhMRFFjZ0N5QU9JQVpCQTNacU5nSU1Ba0FnQ0NBR2F5SUdRUUZyUVI1TERRQWdCaUFIYWtFSWF5SUdRUUZJRFFBRFFDQUdRUWhLSVFjZ0JrRUlheUVHSUFjTkFBc0xJQXNnRERZQ0VDQUxJQWxCRUdvaUJ6WUNHQ0FISUFoTERRY2dDeUFPSUFkQkEzWnFJZ1kyQWd3Q1FDQUlJQWRySWdwQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBeEZEUUVnQnlBTWRDQUdMUUFFUVFnZ0RHdDJjaUVIREFFTElBcEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQU1RUmh5SWcxMElRY2dDaUFNYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVJJZ0JrRUJhaUVHSUFwQkNHc2hDaUFTRFFBTEN5QUxJQXcyQWhBZ0N5QUpRUmhxSWdZMkFoZ2dCaUFJU3cwSElBc2dCMEVZZGpZQ2JDQUxJQTRnQmtFRGRtbzJBZ3dnQzBFSWFpQmRFQUlOQnlBTEtBSndRUjlMRFFjZ0MwRUlhaUFMUWV3QmFoQUNEUWNnQ3lnQzdBRWlCa0VNU3cwSElBdEJBU0FHUVFScWREWUNkQ0FMUVFocUlBdEI3QUZxRUFJTkJ5QUxLQUxzQVNJR1FRSkxEUWNnQ3lBR05nSjRBa0FDUUFKQUlBWU9BZ0FCQWdzZ0MwRUlhaUFMUWV3QmFoQUNEUWtnQ3lnQzdBRWlCa0VNU3cwSklBdEJBU0FHUVFScWREWUNmQXdCQ3lBTEtBSU1JUVlDUUNBTEtBSVVRUU4wSWdrZ0N5Z0NHQ0lNYXlJSVFTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QUxLQUlRSWdoRkRRRWdCeUFJZENBR0xRQUVRUWdnQ0d0MmNpRUhEQUVMSUFoQkFVZ0VRRUVBSVFjTUFRc2dCaTBBQUNBTEtBSVFJZ3BCR0dvaURYUWhCeUFJSUFwcVFRaHJJZ3BCQVVnTkFBTkFJQVl0QUFFZ0RVRUlheUlOZENBSGNpRUhJQXBCQ0VvaENDQUdRUUZxSVFZZ0NrRUlheUVLSUFnTkFBc0xJQXNnREVFQmFpSUdOZ0lZSUFzZ0JrRUhjVFlDRUNBR0lBbExEUWdnQ3lBSFFSOTJOZ0tBQVNBTElBc29BZ2dnQmtFRGRtbzJBZ3dnQzBFQU5nTFFBU0FMUVFocUlBdEIwQUZxRUFJaEJpQUxBbjhnQ3lnQzBBRWlCMEYvUmdSQVFZQ0FnSUI0SUFZTkFSb01DZ3NnQmcwSklBZEJBV3BCQVhZaUJrRUFJQVpySUFkQkFYRWJDellDaEFFZ0MwRUFOZ0xRQVNBTFFRaHFJQXRCMEFGcUVBSWhCaUFMQW44Z0N5Z0MwQUVpQjBGL1JnUkFRWUNBZ0lCNElBWU5BUm9NQ2dzZ0JnMEpJQWRCQVdwQkFYWWlCa0VBSUFacklBZEJBWEViQ3pZQ2lBRWdDMEVJYWlCY0VBSU5DQ0FMS0FLTUFTSUdRZjhCU3cwSUlBWUVRQ0FMSUFaQkFuUVFDQ0lITmdLUUFTQUhSUTBKUVFBaEJnTkFJQXRCQURZQzBBRWdDMEVJYWlBTFFkQUJhaEFDSVFnZ0J5QUdRUUowYWdKL0lBc29BdEFCSWdkQmYwWUVRRUdBZ0lDQWVDQUlEUUVhREF3TElBZ05DeUFIUVFGcVFRRjJJZ2hCQUNBSWF5QUhRUUZ4R3dzMkFnQWdCa0VCYWlJR0lBc29Bb3dCVHcwQ0lBc29BcEFCSVFjTUFBc0FDeUFMUVFBMkFwQUJDeUFMUVFocUlGc1FBZzBISUFzb0FwUUJRUkJMRFFjZ0N5Z0NEQ0VHQWtBZ0N5Z0NGRUVEZENJSklBc29BaGdpREdzaUNFRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRY2dDeWdDRUNJSVJRMEJJQWNnQ0hRZ0JpMEFCRUVJSUFocmRuSWhCd3dCQ3lBSVFRRklCRUJCQUNFSERBRUxJQVl0QUFBZ0N5Z0NFQ0lLUVJocUlnMTBJUWNnQ0NBS2FrRUlheUlLUVFGSURRQURRQ0FHTFFBQklBMUJDR3NpRFhRZ0IzSWhCeUFLUVFoS0lRZ2dCa0VCYWlFR0lBcEJDR3NoQ2lBSURRQUxDeUFMSUF4QkFXb2lCallDR0NBTElBWkJCM0UyQWhBZ0JpQUpTdzBISUFzZ0IwRWZkallDbUFFZ0N5QUxLQUlJSUFaQkEzWnFOZ0lNSUF0QkNHb2dDMEhzQVdvUUFnMEhJQXNnQ3lnQzdBRkJBV28yQXB3QklBdEJDR29nQzBIc0FXb1FBZzBISUFzZ0N5Z0M3QUZCQVdvaUdEWUNvQUVnQ3lnQ0RDRUdBa0FnQ3lnQ0ZFRURkQ0lJSUFzb0FoZ2lER3NpQ1VFZ1RnUkFJQVlvQUFBaUIwRVlkQ0FIUVFoMFFZQ0EvQWR4Y2lBSFFRaDJRWUQrQTNFZ0IwRVlkbkp5SVFjZ0N5Z0NFQ0lKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFKUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ3lnQ0VDSUtRUmhxSWcxMElRY2dDU0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQXhCQVdvaUJqWUNHQ0FMSUFaQkIzRWlDVFlDRUNBR0lBaExEUWNnQ3lBTEtBSUlJZzRnQmtFRGRtbzJBZ3dnQjBGL1NnMEhBa0FnQ0NBR2F5SUdRUUZyUVI1TERRQWdCaUFKYWtFSWF5SUdRUUZJRFFBRFFDQUdRUWhLSVFjZ0JrRUlheUVHSUFjTkFBc0xJQXNnREVFQ2FpSUhOZ0lZSUFzZ0IwRUhjU0lKTmdJUUlBY2dDRXNOQnlBTElBNGdCMEVEZG1vaUJqWUNEQUpBSUFnZ0Iyc2lDa0VnVGdSQUlBWW9BQUFpQjBFWWRDQUhRUWgwUVlDQS9BZHhjaUFIUVFoMlFZRCtBM0VnQjBFWWRuSnlJUWNnQ1VVTkFTQUhJQWwwSUFZdEFBUkJDQ0FKYTNaeUlRY01BUXNnQ2tFQlNBUkFRUUFoQnd3QkN5QUdMUUFBSUFsQkdISWlEWFFoQnlBSklBcHFRUWhySWdwQkFVZ05BQU5BSUFZdEFBRWdEVUVJYXlJTmRDQUhjaUVISUFwQkNFb2hDU0FHUVFGcUlRWWdDa0VJYXlFS0lBa05BQXNMSUFzZ0RFRURhaUlHTmdJWUlBc2dCa0VIY1RZQ0VDQUdJQWhMRFFjZ0N5QUhRUjkyTmdLa0FTQUxJQTRnQmtFRGRtbzJBZ3dDUUNBSFFRQk9CRUFnQ3lnQ25BRWhEUXdCQ3lBTFFRaHFJRm9RQWcwSUlBdEJDR29nV1JBQ0RRZ2dDMEVJYWlCWUVBSU5DQ0FMUVFocUlGY1FBZzBJSUFzb0FxZ0JJQXNvQXF3QlFYOXpJQXNvQXB3QklnMUJBM1JxU2cwSUlBc29BckFCSUFzb0FyUUJRWDl6SUFzb0FxQUJJaGhCQTNScVNnMElDMEhqQUNFS1FZQ2tDU0VIUWYvLy8vOEhJUVlDUUFKQUFrQUNRQUpBQWtBQ1FBSkFBa0FDUUFKQUFrQWdDeWdDYkVFS2F3NHFDZ0FCQVFzTEN3c0xDd0VDQXdzTEN3c0xDd3NEQkFVTEN3c0xDd3NMQmdZSEN3c0xDd3NMQ3dnSkN3dEJqQU1oQ2tHQWpCVWhCd3dKQzBHTUF5RUtRWURZTnlFSERBZ0xRWmdHSVFwQmdMRHZBQ0VIREFjTFFkUU1JUXBCZ095OUFTRUhEQVlMUVpBY0lRcEJnUENsQXlFSERBVUxRWUFvSVFwQmdJRGdBeUVIREFRTFFZREFBQ0VLUVlDQWdBWWhCd3dEQzBHQXhBQWhDa0dBZ0xBR0lRY01BZ3RCd0t3QklRcEJnTUNiRkNFSERBRUxRWUNnQWlFS1FZQ0E0Q0VoQndzZ0NpQU5JQmhzSWdoSkRRQWdCeUFJUVlBRGJHNGlCa0VRSUFaQkVFa2JJUVlMSUFzZ0N5Z0NsQUVpQnlBSElBWWdCaUFIU1JzZ0JrSC8vLy8vQjBZYklnWTJBdXdCSUFzZ0JqWUN3QUVnQ3lnQ0RDRUdBa0FnQ3lnQ0ZFRURkQ0lKSUFzb0FoZ2lER3NpQ0VFZ1RnUkFJQVlvQUFBaUIwRVlkQ0FIUVFoMFFZQ0EvQWR4Y2lBSFFRaDJRWUQrQTNFZ0IwRVlkbkp5SVFjZ0N5Z0NFQ0lJUlEwQklBY2dDSFFnQmkwQUJFRUlJQWhyZG5JaEJ3d0JDeUFJUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ3lnQ0VDSUtRUmhxSWcxMElRY2dDQ0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFnZ0JrRUJhaUVHSUFwQkNHc2hDaUFJRFFBTEN5QUxJQXhCQVdvaUJqWUNHQ0FMSUFaQkIzRTJBaEFnQmlBSlN3MEhJQXNnQjBFZmRqWUN1QUVnQ3lBTEtBSUlJQVpCQTNacU5nSU1Ba0FnQjBGL1NnMEFJQXRCdUFjUUNDSUdOZ0s4QVNBR1JRMElJQVpCQUVHNEJ4QURJUWdnQ3lnQ0RDRUdBa0FnQ3lnQ0ZFRURkQ0lTSUFzb0FoZ2lFV3NpQ1VFZ1RnUkFJQVlvQUFBaUIwRVlkQ0FIUVFoMFFZQ0EvQWR4Y2lBSFFRaDJRWUQrQTNFZ0IwRVlkbkp5SVFjZ0N5Z0NFQ0lKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFKUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ3lnQ0VDSUtRUmhxSWcxMElRY2dDU0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQkZCQVdvaURUWUNHQ0FMSUExQkIzRWlERFlDRUNBTklCSkxEUWdnQ3lBTEtBSUlJZzRnRFVFRGRtb2lCallDRENBSUlBZEJIM1kyQWdBQ1FDQUhRWDlLRFFBQ1FDQVNJQTFySWdsQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBeEZEUUVnQnlBTWRDQUdMUUFFUVFnZ0RHdDJjaUVIREFFTElBbEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQU1RUmh5SWcxMElRY2dDU0FNYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQXcyQWhBZ0N5QVJRUWxxSWcwMkFoZ2dEU0FTU3cwSklBc2dEaUFOUVFOMmFpSUdOZ0lNSUFnZ0IwRVlkaUlITmdJRUlBZEIvd0ZIRFFBQ1FDQVNJQTFySWdwQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBeEZEUUVnQnlBTWRDQUdMUUFFUVFnZ0RHdDJjaUVIREFFTElBcEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQU1RUmh5SWdsMElRY2dDaUFNYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUFsQkNHc2lDWFFnQjNJaEJ5QUtRUWhLSVF3Z0JrRUJhaUVHSUFwQkNHc2hDaUFNRFFBTEN5QUxJQTFCQjNFaUNUWUNFQ0FMSUJGQkdXb2lERFlDR0NBTUlCSkxEUWtnQ3lBT0lBeEJBM1pxSWdZMkFnd2dDQ0FIUVJCMk5nSUlBa0FnRWlBTWF5SUtRU0JPQkVBZ0JpZ0FBQ0lIUVJoMElBZEJDSFJCZ0lEOEIzRnlJQWRCQ0haQmdQNERjU0FIUVJoMmNuSWhCeUFKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFLUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ1VFWWNpSU5kQ0VISUFrZ0NtcEJDR3NpQ2tFQlNBMEFBMEFnQmkwQUFTQU5RUWhySWcxMElBZHlJUWNnQ2tFSVNpRUpJQVpCQVdvaEJpQUtRUWhySVFvZ0NRMEFDd3NnQ3lBTVFRZHhJZ3cyQWhBZ0N5QVJRU2xxSWcwMkFoZ2dEU0FTU3cwSklBc2dEaUFOUVFOMmFpSUdOZ0lNSUFnZ0IwRVFkallDREFzQ1FDQVNJQTFySWdwQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBeEZEUUVnQnlBTWRDQUdMUUFFUVFnZ0RHdDJjaUVIREFFTElBcEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQU1RUmh5SWdsMElRY2dDaUFNYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUFsQkNHc2lDWFFnQjNJaEJ5QUtRUWhLSVF3Z0JrRUJhaUVHSUFwQkNHc2hDaUFNRFFBTEN5QUxJQTFCQVdvaUNUWUNHQ0FMSUFsQkIzRWlDallDRUNBSklCSkxEUWdnQ3lBT0lBbEJBM1pxSWdZMkFnd2dDQ0FIUVI5Mk5nSVFJQWRCZjB3RVFBSkFJQklnQ1dzaURFRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRY2dDa1VOQVNBSElBcDBJQVl0QUFSQkNDQUthM1p5SVFjTUFRc2dERUVCU0FSQVFRQWhCd3dCQ3lBR0xRQUFJQXBCR0hJaUNYUWhCeUFLSUF4cVFRaHJJZ3BCQVVnTkFBTkFJQVl0QUFFZ0NVRUlheUlKZENBSGNpRUhJQXBCQ0VvaERDQUdRUUZxSVFZZ0NrRUlheUVLSUF3TkFBc0xJQXNnRFVFQ2FpSUpOZ0lZSUFzZ0NVRUhjU0lLTmdJUUlBa2dFa3NOQ1NBTElBNGdDVUVEZG1vaUJqWUNEQ0FJSUFkQkgzWTJBaFFMQWtBZ0VpQUpheUlNUVNCT0JFQWdCaWdBQUNJSFFSaDBJQWRCQ0hSQmdJRDhCM0Z5SUFkQkNIWkJnUDREY1NBSFFSaDJjbkloQnlBS1JRMEJJQWNnQ25RZ0JpMEFCRUVJSUFwcmRuSWhCd3dCQ3lBTVFRRklCRUJCQUNFSERBRUxJQVl0QUFBZ0NrRVljaUlOZENFSElBb2dER3BCQ0dzaUNrRUJTQTBBQTBBZ0JpMEFBU0FOUVFocklnMTBJQWR5SVFjZ0NrRUlTaUVNSUFaQkFXb2hCaUFLUVFocklRb2dEQTBBQ3dzZ0N5QUpRUUZxSWcwMkFoZ2dDeUFOUVFkeElnbzJBaEFnRFNBU1N3MElJQXNnRGlBTlFRTjJhaUlHTmdJTUlBZ2dCMEVmZGpZQ0dDQUlBbjhDUUNBSFFYOU1CRUFDUUNBU0lBMXJJZ3hCSUU0RVFDQUdLQUFBSWdkQkdIUWdCMEVJZEVHQWdQd0hjWElnQjBFSWRrR0EvZ054SUFkQkdIWnljaUVISUFwRkRRRWdCeUFLZENBR0xRQUVRUWdnQ210MmNpRUhEQUVMSUF4QkFVZ0VRRUVBSVFjTUFRc2dCaTBBQUNBS1FSaHlJZzEwSVFjZ0NpQU1ha0VJYXlJS1FRRklEUUFEUUNBR0xRQUJJQTFCQ0dzaURYUWdCM0loQnlBS1FRaEtJUXdnQmtFQmFpRUdJQXBCQ0dzaENpQU1EUUFMQ3lBTElBbEJCR29pRERZQ0dDQUxJQXhCQjNFaUNqWUNFQ0FNSUJKTERRc2dDeUFPSUF4QkEzWnFJZ1kyQWd3Z0NDQUhRUjEyTmdJY0FrQWdFaUFNYXlJTVFTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QUtSUTBCSUFjZ0NuUWdCaTBBQkVFSUlBcHJkbkloQnd3QkN5QU1RUUZJQkVCQkFDRUhEQUVMSUFZdEFBQWdDa0VZY2lJTmRDRUhJQW9nREdwQkNHc2lDa0VCU0EwQUEwQWdCaTBBQVNBTlFRaHJJZzEwSUFkeUlRY2dDa0VJU2lFTUlBWkJBV29oQmlBS1FRaHJJUW9nREEwQUN3c2dDeUFKUVFWcUlndzJBaGdnQ3lBTVFRZHhJZ28yQWhBZ0RDQVNTdzBMSUFzZ0RpQU1RUU4yYWlJR05nSU1JQWdnQjBFZmRqWUNJQUpBSUJJZ0RHc2lERUVnVGdSQUlBWW9BQUFpQjBFWWRDQUhRUWgwUVlDQS9BZHhjaUFIUVFoMlFZRCtBM0VnQjBFWWRuSnlJUWNnQ2tVTkFTQUhJQXAwSUFZdEFBUkJDQ0FLYTNaeUlRY01BUXNnREVFQlNBUkFRUUFoQnd3QkN5QUdMUUFBSUFwQkdISWlEWFFoQnlBS0lBeHFRUWhySWdwQkFVZ05BQU5BSUFZdEFBRWdEVUVJYXlJTmRDQUhjaUVISUFwQkNFb2hEQ0FHUVFGcUlRWWdDa0VJYXlFS0lBd05BQXNMSUFzZ0NVRUdhaUlOTmdJWUlBc2dEVUVIY1NJS05nSVFJQTBnRWtzTkN5QUxJQTRnRFVFRGRtb2lCallDRENBSUlBZEJIM1kyQWlRZ0IwRi9TZzBCQWtBZ0VpQU5heUlIUVNCT0JFQWdCaWdBQUNJSFFSaDBJQWRCQ0hSQmdJRDhCM0Z5SUFkQkNIWkJnUDREY1NBSFFSaDJjbkloRFNBS1JRMEJJQTBnQ25RZ0JpMEFCRUVJSUFwcmRuSWhEUXdCQ3lBSFFRRklCRUJCQUNFTkRBRUxJQVl0QUFBZ0NrRVljaUlNZENFTklBY2dDbXBCQ0dzaUIwRUJTQTBBQTBBZ0JpMEFBU0FNUVFocklneDBJQTF5SVEwZ0IwRUlTaUVSSUFaQkFXb2hCaUFIUVFocklRY2dFUTBBQ3dzZ0N5QUtOZ0lRSUFzZ0NVRU9haUlNTmdJWUlBd2dFa3NOQ3lBTElBNGdERUVEZG1vaUJqWUNEQ0FJSUExQkdIWTJBaWdDUUNBU0lBeHJJaEZCSUU0RVFDQUdLQUFBSWdkQkdIUWdCMEVJZEVHQWdQd0hjWElnQjBFSWRrR0EvZ054SUFkQkdIWnljaUVISUFwRkRRRWdCeUFLZENBR0xRQUVRUWdnQ210MmNpRUhEQUVMSUJGQkFVZ0VRRUVBSVFjTUFRc2dCaTBBQUNBS1FSaHlJZzEwSVFjZ0NpQVJha0VJYXlJS1FRRklEUUFEUUNBR0xRQUJJQTFCQ0dzaURYUWdCM0loQnlBS1FRaEtJUkVnQmtFQmFpRUdJQXBCQ0dzaENpQVJEUUFMQ3lBTElBeEJCM0VpQ2pZQ0VDQUxJQWxCRm1vaUREWUNHQ0FNSUJKTERRc2dDeUFPSUF4QkEzWnFJZ1kyQWd3Z0NDQUhRUmgyTmdJc0FrQWdFaUFNYXlJUlFTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QUtSUTBCSUFjZ0NuUWdCaTBBQkVFSUlBcHJkbkloQnd3QkN5QVJRUUZJQkVCQkFDRUhEQUVMSUFZdEFBQWdDa0VZY2lJTmRDRUhJQW9nRVdwQkNHc2lDa0VCU0EwQUEwQWdCaTBBQVNBTlFRaHJJZzEwSUFkeUlRY2dDa0VJU2lFUklBWkJBV29oQmlBS1FRaHJJUW9nRVEwQUN3c2dDeUFNUVFkeElnbzJBaEFnQ3lBSlFSNXFJZzAyQWhnZ0RTQVNTdzBMSUFzZ0RpQU5RUU4yYWlJR05nSU1JQWRCR0hZTUFnc2dDRUVGTmdJY0N5QUlRb0tBZ0lBZ053TW9RUUlMTmdJd0FrQWdFaUFOYXlJTVFTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QUtSUTBCSUFjZ0NuUWdCaTBBQkVFSUlBcHJkbkloQnd3QkN5QU1RUUZJQkVCQkFDRUhEQUVMSUFZdEFBQWdDa0VZY2lJSmRDRUhJQW9nREdwQkNHc2lDa0VCU0EwQUEwQWdCaTBBQVNBSlFRaHJJZ2wwSUFkeUlRY2dDa0VJU2lFTUlBWkJBV29oQmlBS1FRaHJJUW9nREEwQUN3c2dDeUFOUVFGcUlnMDJBaGdnQ3lBTlFRZHhOZ0lRSUEwZ0Vrc05DQ0FMSUE0Z0RVRURkbW9pQmpZQ0RDQUlJQWRCSDNZMkFqUWdCMEYvVEFSQUlBdEJDR29nQ0VFNGFoQUNEUWtnQ0NnQ09FRUZTdzBKSUF0QkNHb2dDRUU4YWhBQ0RRa2dDQ2dDUEVFRlN3MEpJQXNvQWhSQkEzUWhFaUFMS0FJWUlRMGdDeWdDRENFR0N3SkFJQklnRFdzaUNrRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRY2dDeWdDRUNJSlJRMEJJQWNnQ1hRZ0JpMEFCRUVJSUFscmRuSWhCd3dCQ3lBS1FRRklCRUJCQUNFSERBRUxJQVl0QUFBZ0N5Z0NFQ0lNUVJocUlnbDBJUWNnQ2lBTWFrRUlheUlLUVFGSURRQURRQ0FHTFFBQklBbEJDR3NpQ1hRZ0IzSWhCeUFLUVFoS0lRd2dCa0VCYWlFR0lBcEJDR3NoQ2lBTURRQUxDeUFMSUExQkFXb2lDVFlDR0NBTElBbEJCM0VpR0RZQ0VDQUpJQkpMRFFnZ0N5QUxLQUlJSWc0Z0NVRURkbW9pQmpZQ0RDQUlJQWRCSDNZMkFrQWdCMEYvVEFSQUFrQWdFaUFKYXlJS1FTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QVlSUTBCSUFjZ0dIUWdCaTBBQkVFSUlCaHJkbkloQnd3QkN5QUtRUUZJQkVCQkFDRUhEQUVMSUFZdEFBQWdHRUVZY2lJSmRDRUhJQW9nR0dwQkNHc2lDa0VCU0EwQUEwQWdCaTBBQVNBSlFRaHJJZ2wwSUFkeUlRY2dDa0VJU2lFTUlBWkJBV29oQmlBS1FRaHJJUW9nREEwQUN3c2dDeUFZTmdJUUlBc2dEVUVoYWlJTU5nSVlJQXdnRWtzTkNTQUxJQTRnREVFRGRtb2lCallDRENBSFJRMEpJQWdnQnpZQ1JBSkFJQklnREdzaUNrRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRY2dHRVVOQVNBSElCaDBJQVl0QUFSQkNDQVlhM1p5SVFjTUFRc2dDa0VCU0FSQVFRQWhCd3dCQ3lBR0xRQUFJQmhCR0hJaUNYUWhCeUFLSUJocVFRaHJJZ3BCQVVnTkFBTkFJQVl0QUFFZ0NVRUlheUlKZENBSGNpRUhJQXBCQ0VvaEVTQUdRUUZxSVFZZ0NrRUlheUVLSUJFTkFBc0xJQXNnREVFSGNTSUtOZ0lRSUFzZ0RVSEJBR29pQ1RZQ0dDQUpJQkpMRFFrZ0N5QU9JQWxCQTNacUlnWTJBZ3dnQjBVTkNTQUlJQWMyQWtnQ1FDQVNJQWxySWd4QklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBcEZEUUVnQnlBS2RDQUdMUUFFUVFnZ0NtdDJjaUVIREFFTElBeEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQUtRUmh5SWdsMElRY2dDaUFNYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUFsQkNHc2lDWFFnQjNJaEJ5QUtRUWhLSVF3Z0JrRUJhaUVHSUFwQkNHc2hDaUFNRFFBTEN5QUxJQTFCd2dCcUlnazJBaGdnQ3lBSlFRZHhJaGcyQWhBZ0NTQVNTdzBKSUFzZ0RpQUpRUU4yYWlJR05nSU1JQWdnQjBFZmRqWUNUQXNDUUNBU0lBbHJJZ3BCSUU0RVFDQUdLQUFBSWdkQkdIUWdCMEVJZEVHQWdQd0hjWElnQjBFSWRrR0EvZ054SUFkQkdIWnljaUVISUJoRkRRRWdCeUFZZENBR0xRQUVRUWdnR0d0MmNpRUhEQUVMSUFwQkFVZ0VRRUVBSVFjTUFRc2dCaTBBQUNBWVFSaHlJZzEwSVFjZ0NpQVlha0VJYXlJS1FRRklEUUFEUUNBR0xRQUJJQTFCQ0dzaURYUWdCM0loQnlBS1FRaEtJUXdnQmtFQmFpRUdJQXBCQ0dzaENpQU1EUUFMQ3lBTElBbEJBV29pRERZQ0dDQUxJQXhCQjNFMkFoQWdEQ0FTU3cwSUlBc2dEaUFNUVFOMmFpSUdOZ0lNSUFnZ0IwRWZkallDVUFKQUlBZEJmMHdFUUNBTFFRaHFJQWhCMUFCcUVCNE5DaUFMS0FJVVFRTjBJUklnQ3lnQ0dDRU1JQXNvQWd3aEJnd0JDeUFJUXBpQWdJQ0FBemNENkFNZ0NFS1lnSUNBZ0FNM0ErQURJQWhCZ1pDcWlRRTJBdUFCSUFoQmdaQ3FpUUUyQW1BZ0NFRUJOZ0pVQ3dKQUlCSWdER3NpQ1VFZ1RnUkFJQVlvQUFBaUIwRVlkQ0FIUVFoMFFZQ0EvQWR4Y2lBSFFRaDJRWUQrQTNFZ0IwRVlkbkp5SVFjZ0N5Z0NFQ0lKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFKUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ3lnQ0VDSUtRUmhxSWcxMElRY2dDU0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQXhCQVdvaUJqWUNHQ0FMSUFaQkIzRTJBaEFnQmlBU1N3MElJQXNnQ3lnQ0NDQUdRUU4yYWpZQ0RDQUlJQWRCSDNZMkF2QURBa0FnQjBGL1RBUkFJQXRCQ0dvZ0NFSDBBMm9RSGtVTkFRd0tDeUFJUXBpQWdJQ0FBemNEaUFjZ0NFS1lnSUNBZ0FNM0E0QUhJQWhCZ2JpNDhnQTJBb0FGSUFoQmdiaTQ4Z0EyQW9BRUlBaEJBVFlDOUFNTEFrQUNRQ0FJS0FKUURRQWdDQ2dDOEFNTkFDQUxLQUlVUVFOMElSSWdDeWdDR0NFTUlBc29BZ3doQmd3QkN5QUxLQUlNSVFZQ1FDQUxLQUlVUVFOMEloSWdDeWdDR0NJTWF5SUpRU0JPQkVBZ0JpZ0FBQ0lIUVJoMElBZEJDSFJCZ0lEOEIzRnlJQWRCQ0haQmdQNERjU0FIUVJoMmNuSWhCeUFMS0FJUUlnbEZEUUVnQnlBSmRDQUdMUUFFUVFnZ0NXdDJjaUVIREFFTElBbEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQUxLQUlRSWdwQkdHb2lEWFFoQnlBSklBcHFRUWhySWdwQkFVZ05BQU5BSUFZdEFBRWdEVUVJYXlJTmRDQUhjaUVISUFwQkNFb2hDU0FHUVFGcUlRWWdDa0VJYXlFS0lBa05BQXNMSUFzZ0RFRUJhaUlNTmdJWUlBc2dERUVIY1RZQ0VDQU1JQkpMRFFrZ0N5QUxLQUlJSUF4QkEzWnFJZ1kyQWd3Z0NDQUhRUjkyTmdLUUJ3c0NRQ0FTSUF4cklnbEJJRTRFUUNBR0tBQUFJZ2RCR0hRZ0IwRUlkRUdBZ1B3SGNYSWdCMEVJZGtHQS9nTnhJQWRCR0haeWNpRUhJQXNvQWhBaUNVVU5BU0FISUFsMElBWXRBQVJCQ0NBSmEzWnlJUWNNQVFzZ0NVRUJTQVJBUVFBaEJ3d0JDeUFHTFFBQUlBc29BaEFpQ2tFWWFpSU5kQ0VISUFrZ0NtcEJDR3NpQ2tFQlNBMEFBMEFnQmkwQUFTQU5RUWhySWcxMElBZHlJUWNnQ2tFSVNpRUpJQVpCQVdvaEJpQUtRUWhySVFvZ0NRMEFDd3NnQ3lBTVFRRnFJZ28yQWhnZ0N5QUtRUWR4SWdrMkFoQWdDaUFTU3cwSUlBc2dDeWdDQ0NJT0lBcEJBM1pxSWdZMkFnd2dDQ0FIUVI5Mk5nS1VCd0pBSUJJZ0Ntc2lDa0VnVGdSQUlBWW9BQUFpQjBFWWRDQUhRUWgwUVlDQS9BZHhjaUFIUVFoMlFZRCtBM0VnQjBFWWRuSnlJUWNnQ1VVTkFTQUhJQWwwSUFZdEFBUkJDQ0FKYTNaeUlRY01BUXNnQ2tFQlNBUkFRUUFoQnd3QkN5QUdMUUFBSUFsQkdISWlEWFFoQnlBSklBcHFRUWhySWdwQkFVZ05BQU5BSUFZdEFBRWdEVUVJYXlJTmRDQUhjaUVISUFwQkNFb2hDU0FHUVFGcUlRWWdDa0VJYXlFS0lBa05BQXNMSUFzZ0RFRUNhaUlLTmdJWUlBc2dDa0VIY1NJSk5nSVFJQW9nRWtzTkNDQUxJQTRnQ2tFRGRtb2lCallDRENBSUlBZEJIM1kyQXBnSEFrQWdCMEYvVEFSQUFrQWdFaUFLYXlJS1FTQk9CRUFnQmlnQUFDSUhRUmgwSUFkQkNIUkJnSUQ4QjNGeUlBZEJDSFpCZ1A0RGNTQUhRUmgyY25JaEJ5QUpSUTBCSUFjZ0NYUWdCaTBBQkVFSUlBbHJkbkloQnd3QkN5QUtRUUZJQkVCQkFDRUhEQUVMSUFZdEFBQWdDVUVZY2lJTmRDRUhJQWtnQ21wQkNHc2lDa0VCU0EwQUEwQWdCaTBBQVNBTlFRaHJJZzEwSUFkeUlRY2dDa0VJU2lFSklBWkJBV29oQmlBS1FRaHJJUW9nQ1EwQUN3c2dDeUFNUVFOcUlnWTJBaGdnQ3lBR1FRZHhOZ0lRSUFZZ0Vrc05DaUFMSUE0Z0JrRURkbW8yQWd3Z0NDQUhRUjkyTmdLY0J5QUxRUWhxSUFoQm9BZHFFQUlOQ2lBSUtBS2dCMEVRU3cwS0lBdEJDR29nQ0VHa0Iyb1FBZzBLSUFnb0FxUUhRUkJMRFFvZ0MwRUlhaUFJUWFnSGFoQUNEUW9nQ0NnQ3FBZEJFRXNOQ2lBTFFRaHFJQWhCckFkcUVBSU5DaUFJS0FLc0IwRVFTdzBLSUF0QkNHb2dDRUd3QjJvUUFnMEtJQXRCQ0dvZ0NFRzBCMm9RQWcwS0RBRUxJQWhCRURZQ3RBY2dDRUtRZ0lDQWdBSTNBcXdISUFoQ2dZQ0FnSUFDTndLa0J5QUlRb0dBZ0lBZ053S2NCd3NnQ3lnQ3ZBRWlCeWdDbUFkRkRRQWdCeWdDdEFjaUJpQUhLQUt3QjBrTkNDQUdJQXNvQXBRQlNRMElJQVlnQ3lnQ3dBRkxEUWdnQ3lBR1FRRWdCaHMyQXNBQkMwRUlJQXNvQWhBaUJtc2hCd0pBSUFzb0FoUkJBM1FpQ0NBTEtBSVlJZ2xySWdwQkFXdEJIa3NOQUNBR0lBcHFRUWhySWdaQkFVZ05BQU5BSUFaQkNFb2hDaUFHUVFocklRWWdDZzBBQ3dzZ0N5QUhJQWxxSWdZMkFoZ2dDeUFHUVFkeE5nSVFJQVlnQ0UwRVFDQUxJQXNvQWdnZ0JrRURkbW8yQWd3TEFrQWdBQ0FMS0FKd0lnWkJBblJxSWdjb0FoUWlDRVVFUUNBSFFkd0FFQWdpQmpZQ0ZDQUdEUUVNQ0FzZ0FDZ0NDQ0FHUmdSQUFrQUNRQ0FMS0FKb0lBQW9BaEFpQmlnQ0FFY05BQ0FMS0FKc0lBWW9BZ1JIRFFBZ0N5Z0NkQ0FHS0FJTVJ3MEFJQXNvQW5naUNTQUdLQUlRUncwQUlBc29BcFFCSUFZb0FpeEhEUUFnQ3lnQ21BRWdCaWdDTUVjTkFDQUxLQUtjQVNBR0tBSTBSdzBBSUFzb0FxQUJJQVlvQWpoSERRQWdDeWdDcEFFaUNpQUdLQUk4UncwQUlBc29BcmdCSUFZb0FsQkhEUUFDUUFKQUFrQWdDUTRDQVFBQ0N5QUxLQUtBQVNBR0tBSVlSdzBDSUFzb0FvUUJJQVlvQWh4SERRSWdDeWdDaUFFZ0JpZ0NJRWNOQWlBTEtBS01BU0lKSUFZb0FpUkhEUUlnQ1VVTkFTQUdLQUlvSVF4QkFDRU5JQXNvQXBBQklRNERRQ0FPSUExQkFuUWlFbW9vQWdBZ0RDQVNhaWdDQUVjTkF5QUpJQTFCQVdvaURVY05BQXNNQVFzZ0N5Z0NmQ0FHS0FJVVJ3MEJDeUFLUlEwQklBc29BcWdCSUFZb0FrQkhEUUFnQ3lnQ3JBRWdCaWdDUkVjTkFDQUxLQUt3QVNBR0tBSklSdzBBSUFzb0FyUUJJQVlvQWt4R0RRRUxJQWdvQWlnUUJDQUhLQUlVUVFBMkFpZ2dCeWdDRkNnQ1ZCQUVJQWNvQWhSQkFEWUNWQ0FBUVFBMkFoQWdBRUdCQWpZQ0JDQUFRaUUzQWdnTUFnc2dDeWdDa0FFUUJFRUFJUW9nQzBFQU5nS1FBU0FMS0FLOEFSQUVJQXRCQURZQ3ZBRkJBQ0VNREF3TElBZ29BaWdRQkNBSEtBSVVRUUEyQWlnZ0J5Z0NGQ2dDVkJBRUlBY29BaFJCQURZQ1ZBc2dCeWdDRkNBTFFlZ0Fha0hjQUJBSEdnd0dDeUFMUVNCcUlnWkJBRUhJQUJBREdpQUxRUWhxSUFZUUFnMENJQXNvQWlCQi93RkxEUUlnQzBFSWFpQmZFQUlOQWlBTEtBSWtRUjlMRFFJZ0N5Z0NEQ0VHQWtBZ0N5Z0NGRUVEZENJTUlBc29BaGdpRG1zaUNFRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRY2dDeWdDRUNJSVJRMEJJQWNnQ0hRZ0JpMEFCRUVJSUFocmRuSWhCd3dCQ3lBSVFRRklCRUJCQUNFSERBRUxJQVl0QUFBZ0N5Z0NFQ0lKUVJocUlnMTBJUWNnQ0NBSmFrRUlheUlLUVFGSURRQURRQ0FHTFFBQklBMUJDR3NpRFhRZ0IzSWhCeUFLUVFoS0lRZ2dCa0VCYWlFR0lBcEJDR3NoQ2lBSURRQUxDeUFMSUE1QkFXb2lDVFlDR0NBTElBbEJCM0VpQ0RZQ0VDQUpJQXhMRFFJZ0N5QUxLQUlJSWhJZ0NVRURkbW9pQmpZQ0RDQUhRUUJJRFFJQ1FDQU1JQWxySWdsQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBaEZEUUVnQnlBSWRDQUdMUUFFUVFnZ0NHdDJjaUVIREFFTElBbEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQUlRUmh5SWcxMElRY2dDQ0FKYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFnZ0JrRUJhaUVHSUFwQkNHc2hDaUFJRFFBTEN5QUxJQTVCQW1vaUJqWUNHQ0FMSUFaQkIzRTJBaEFnQmlBTVN3MENJQXNnQjBFZmRqWUNLQ0FMSUJJZ0JrRURkbW8yQWd3Z0MwRUlhaUFMUWV3QmFoQUNEUUlnQ3lBTEtBTHNBVUVCYWlJR05nSXNJQVpCQ0VzTkFpQUdRUUpKRFFFZ0MwRUlhaUJlRUFJTkFpQUxLQUl3SWdaQkJrc05BZ0pBQWtBQ1FBSkFJQVlPQndBRkFRSUNBZ01GQ3lBTElBc29BaXdpQjBFQ2RCQUlJZ2cyQWpRZ0NFVU5CVUVBSVFZZ0IwVU5CQU5BSUF0QkNHb2dDMEhzQVdvUUFnMEdJQWdnQmtFQ2RHb2dDeWdDN0FGQkFXbzJBZ0FnQmtFQmFpSUdJQWRIRFFBTERBUUxJQXNnQ3lnQ0xDSUdRUUowUVFScklnZ1FDQ0lITmdJNElBc2dDQkFJSWdnMkFqd2dCMFVOQkNBSVJRMEVJQVpCQVVZTkF5QUdRUUZySVFsQkFDRUdBMEFnQzBFSWFpQUxRZXdCYWhBQ0RRVWdCeUFHUVFKMElncHFJQXNvQXV3Qk5nSUFJQXRCQ0dvZ0MwSHNBV29RQWcwRklBZ2dDbW9nQ3lnQzdBRTJBZ0FnQmtFQmFpSUdJQWxIRFFBTERBTUxJQXNvQWd3aEJnSkFJQXNvQWhSQkEzUWlDU0FMS0FJWUlneHJJZ2hCSUU0RVFDQUdLQUFBSWdkQkdIUWdCMEVJZEVHQWdQd0hjWElnQjBFSWRrR0EvZ054SUFkQkdIWnljaUVISUFzb0FoQWlDRVVOQVNBSElBaDBJQVl0QUFSQkNDQUlhM1p5SVFjTUFRc2dDRUVCU0FSQVFRQWhCd3dCQ3lBR0xRQUFJQXNvQWhBaUNrRVlhaUlOZENFSElBZ2dDbXBCQ0dzaUNrRUJTQTBBQTBBZ0JpMEFBU0FOUVFocklnMTBJQWR5SVFjZ0NrRUlTaUVJSUFaQkFXb2hCaUFLUVFocklRb2dDQTBBQ3dzZ0N5QU1RUUZxSWdZMkFoZ2dDeUFHUVFkeE5nSVFJQVlnQ1VzTkF5QUxJQWRCSDNZMkFrQWdDeUFMS0FJSUlBWkJBM1pxTmdJTUlBdEJDR29nQzBIc0FXb1FBZzBESUFzZ0N5Z0M3QUZCQVdvMkFrUU1BZ3NnQzBFSWFpQUxRZXdCYWhBQ0RRSWdDeUFMS0FMc0FTSU9RUUZxSWdZMkFrZ2dDeUFHUVFKMEVBZ2lDRFlDVENBSVJRMENJQVpGRFFGQklDQUxLQUlzSWhKQkFuUkJuREZxS0FJQUloRnJJUTlCQUNFTUlBc29BZ3doQmlBTEtBSUlJUm9EUUFKQUlBc29BaFJCQTNRaUZDQUxLQUlZSWhocklnbEJJRTRFUUNBR0tBQUFJZ2RCR0hRZ0IwRUlkRUdBZ1B3SGNYSWdCMEVJZGtHQS9nTnhJQWRCR0haeWNpRUhJQXNvQWhBaUNVVU5BU0FISUFsMElBWXRBQVJCQ0NBSmEzWnlJUWNNQVFzZ0NVRUJTQVJBUVFBaEJ3d0JDeUFHTFFBQUlBc29BaEFpQ2tFWWFpSU5kQ0VISUFrZ0NtcEJDR3NpQ2tFQlNBMEFBMEFnQmkwQUFTQU5RUWhySWcxMElBZHlJUWNnQ2tFSVNpRUpJQVpCQVdvaEJpQUtRUWhySVFvZ0NRMEFDd3NnQ3lBUklCaHFJZ1kyQWhnZ0N5QUdRUWR4TmdJUUlBWWdGRXNFUUNBSUlBeEJBblJxUVg4MkFnQU1CQXNnQ3lBYUlBWkJBM1pxSWdZMkFnd2dDQ0FNUVFKMGFpQUhJQTkySWdjMkFnQWdCeUFTVHcwRElBd2dEa1loQnlBTVFRRnFJUXdnQjBVTkFBc01BUXNnQUNnQ25Ba05DQ0FBUVFFMkFxQUpBa0FDUUFKQUFrQUNRQUpBQWtBQ1FBSkFBa0FnQUNnQ3BBa05BQ0FBUWdBM0FyUUpJQXNnQ3lnQ0dEWUM0QUVnQ3lBTEtRTVFOd1BZQVNBTElBc3BBd2czQTlBQkFrQWdDMEhRQVdvZ0MwSHNBV29RQWcwQUlBdEIwQUZxSUF0QjdBRnFFQUlOQUNBTFFkQUJhaUFMUWV3QmFoQUNEUUFnUFNBTEtBTHNBU0lHSUFaQi93RkxHeUU5QzBFRUlRd2dBQ0E5UVFKMGFpZ0NsQUVpQmtVTkNTQUFJQVlvQWdRaUNFRUNkR29pQ1NnQ0ZDSUhSUTBKSUFBb0FnZ2hEd0pBSUFZb0Fnd2lEa0VDU1EwQUlBY29BalFpRFNBSEtBSTRiQ0VIQWtBQ1FBSkFBa0FnQmlnQ0VDSVJEZ01CQXdBREN5QU9RUUZySVJFZ0JpZ0NIQ0VVSUFZb0FoZ2hKd3dCQ3lBR0tBSVVJUTBEUUNBTklBcEJBblJxS0FJQUlBZExEUTBnRGlBS1FRRnFJZ3BIRFFBTERBSUxBMEFnSnlBS1FRSjBJZzVxS0FJQUloZ2dEaUFVYWlnQ0FDSU9TdzBNSUFjZ0RrME5EQ0FZSUExd0lBNGdEWEJMRFF3Z0VTQUtRUUZxSWdwSERRQUxEQUVMSUJGQkEydEJBazBFUUNBR0tBSWtJQWRMRFFzTUFRc2dFVUVHUncwQUlBWW9BaWdnQjBrTkNnc0NRQUpBSUFBb0FnUWlCMEdBQWtZRVFDQUFJQVkyQWd3Z0FDQTlOZ0lFSUFBZ0NEWUNDQ0FBSUFrb0FoUWlCallDRUNBR0tBSTBJUWNnQmlnQ09DRUdJQUJCQVRZQ3RCb2dBQ0FHTmdMQUNpQUFJQWMyQXJ3S0lBQWdCaUFIYkRZQ21Ba01BUXNnQUNnQ3RCb0VRQ0FBUVFBMkFyUWFJQUFvQXJ3SkVBUWdBRUVBTmdLOENTQUFLQUtVQ1JBRUlBQWdBQ2dDbUFraURrSFlBV3dpQnhBSUlnWTJBcndKSUFBZ0RrRUNkQkFJSWdnMkFwUUpRUVVoRENBR1JRME1JQWhGRFF3Z0JrRUFJQWNRQXlFUklBQW9BaEFoQ2lBT0JFQkJBU0FLS0FJMElnaHJJUlFnQ0VFQmF5RVlRUUFnQ0dzaEV5QVJRZGdCYXlFY0lCRWdDRUYvYzBIWUFXeHFJUmRCQUNFSFFRQWhEVUVBSVFrRFFDQVJJQWxCMkFGc0lncHFJZ1lnQ2lBY2FrRUFJQWNiTmdMSUFTQUdBbjhnRFVVRVFDQUdRZ0EzQXN3QlFRQU1BUXNnQmlBR0lCTkIyQUZzYWpZQ3pBRWdCaUFHSUJSQjJBRnNha0VBSUFjZ0dFa2JOZ0xRQVNBS0lCZHFRUUFnQnhzTE5nTFVBVUVBSUFkQkFXb2lCaUFHSUFoR0lnWWJJUWNnQmlBTmFpRU5JQWxCQVdvaUNTQU9SdzBBQ3lBQUtBSVFJUW9MUVFFaEdFRUFJUWNDZjBFQUlBQW9Bc0FKRFFBYVFRQWdDaWdDRUVFQ1JnMEFHZ0pBSUFvb0FsQkZEUUFnQ2lnQ1ZDSUdLQUtZQjBVTkFFRUFJQVlvQXJBSFJRMEJHZ3RCQUNFWVFRRUxJUWtnQ2lnQ05DRW5JQW9vQWpnaERpQUtLQUlNSVEwZ0NpZ0NMQ0VJSUFvb0FsZ2hFUUpBSURnb0FnQWlCa1VOQUVFQUlRb2dCaUVISUFBb0F1QUpRWDlHRFFBRFFDQUhJQXBCS0d3aUJtb29BZ1FRQkNBQUtBTEVDU0lISUFacVFRQTJBZ1FnQ2tFQmFpSUtJQUFvQXVBSlFRRnFTUTBBQ3dzZ0J4QUVJQUJCQURZQ3hBa2dBQ2dDeUFrUUJDQUFRUUEyQXNnSklBQW9BdEFKRUFRZ0FFSC8vd00yQXVnSklBQkJBRFlDMEFrZ0FDQVlOZ0w4Q1NBQUlBMDJBdVFKSUFBZ0VTQUlRUUVnQ0VFQlN4c2lCeUFKR3lJR05nTGdDU0FBSUFjMkF0d0pJQUJCQURZQzlBa2dBRUlBTndMc0NTQUFRYWdGRUFnaUJ6WUN4QWtnQjBVTkRFRUFJUW9nQjBFQVFhZ0ZFQU1oQ0NBR1FYOUhCRUFnRGlBbmJFR0FBMnhCTDNJaENRTkFJQWdnQ2tFb2JHb2lEaUFKRUFnaUJ6WUNCQ0FIUlEwT0lBNGdCMEVBSUFkclFRaHhhallDQUNBR0lBcEhJUWNnQ2tFQmFpRUtJQWNOQUFzTElBQkJ4QUFRQ0NJSE5nTElDU0FBSUFaQkJIUkJFR29RQ0NJR05nTFFDU0FHUlEwTUlBZEZEUXdnQjBFQVFjUUFFQU1hSUFCQ0FEY0MxQWtnQUNnQ0NDRUlEQUVMSUFjZ1BVWU5BeUFJSUE5R0RRRWdHa0VGUncwTElBQWdCallDRENBQUlEMDJBZ1FnQUNBSU5nSUlJQUFnQ1NnQ0ZDSUdOZ0lRSUFZb0FqUWhCeUFHS0FJNElRWWdBRUVCTmdLMEdpQUFJQVkyQXNBS0lBQWdCellDdkFvZ0FDQUdJQWRzTmdLWUNRc2dDQ0FQUmcwQlFRQWhDaUFBS0FJQUlnWkJIMDBFUUNBQUlBWkJBblJxS0FJVUlRb0xJQUFvQWhBaEJ5QUFRUUUyQXBBYUlCcEJCVWNOQnlBQUtBSU1JUWdnQ3lBTEtBSVlOZ0xnQVNBTElBc3BBeEEzQTlnQklBc2dDeWtEQ0RjRDBBRkJBU0VHSUF0QjBBRnFJQXRCekFGcUVBSUVRRUVCSVEwTUJ3c2dDMEhRQVdvZ0MwSE1BV29RQWdSQVFRRWhEUXdIQ3lBTFFkQUJhaUFMUWN3QmFoQUNCRUJCQVNFTkRBY0xRUjhnQnlnQ0RHY2lEbXNoRVNBTEtBTFVBU0VOQWtBZ0N5Z0MzQUZCQTNRaUR5QUxLQUxnQVNJYWF5SUpRU0JPQkVBZ0RTZ0FBQ0lKUVJoMElBbEJDSFJCZ0lEOEIzRnlJQWxCQ0haQmdQNERjU0FKUVJoMmNuSWhEQ0FMS0FMWUFTSUpSUTBCSUF3Z0NYUWdEUzBBQkVFSUlBbHJkbkloREF3QkN5QUpRUUZJQkVCQkFDRU1EQUVMSUEwdEFBQWdDeWdDMkFFaUZFRVlhaUlTZENFTUlBa2dGR3BCQ0dzaUNVRUJTQTBBQTBBZ0RTMEFBU0FTUVFockloSjBJQXh5SVF3Z0NVRUlTaUVVSUExQkFXb2hEU0FKUVFocklRa2dGQTBBQ3dzZ0N5QVJJQnBxSWdrMkF1QUJJQXNnQ1VFSGNUWUMyQUZCQVNFTklBa2dEMHNOQmlBTElBc29BdEFCSUFsQkEzWnFOZ0xVQVNBTUlBNUJBV3AyUVg5R0RRWWdDMEhRQVdvZ0MwSE1BV29RQWcwR0lBY29BaEFpQmcwRVFSOGdCeWdDRkdjaURtc2hFU0FMS0FMVUFTRUdBa0FnQ3lnQzNBRkJBM1FpRHlBTEtBTGdBU0lhYXlJSlFTQk9CRUFnQmlnQUFDSUpRUmgwSUFsQkNIUkJnSUQ4QjNGeUlBbEJDSFpCZ1A0RGNTQUpRUmgyY25JaERDQUxLQUxZQVNJSlJRMEJJQXdnQ1hRZ0JpMEFCRUVJSUFscmRuSWhEQXdCQ3lBSlFRRklCRUJCQUNFTURBRUxJQVl0QUFBZ0N5Z0MyQUVpRkVFWWFpSVNkQ0VNSUFrZ0ZHcEJDR3NpQ1VFQlNBMEFBMEFnQmkwQUFTQVNRUWhySWhKMElBeHlJUXdnQ1VFSVNpRVVJQVpCQVdvaEJpQUpRUWhySVFrZ0ZBMEFDd3NnQ3lBUklCcHFJZ1kyQXVBQklBc2dCa0VIY1RZQzJBRWdCaUFQU3dSQVFRRWhCZ3dIQ3lBTElBc29BdEFCSUFaQkEzWnFOZ0xVQVVFQklRWWdEQ0FPUVFGcWRrRi9SZzBHSUFnb0FnaEZEUVVnQzBFQU5nTHNBU0FMUWRBQmFpQUxRZXdCYWhBQ0lRa0NRQ0FMS0FMc0FVRi9SZ1JBSUFsRkRRRU1CUXNnQ1VVTkJBc01CZ3NnQUNBR05nSU1JQUFnUFRZQ0JBdEJBQ0VLSUFBb0FyUWFSUTBBUVFNaERBd1JDeUFBS0FJTUlRY2dBQ2dDRUNFR0lGVkJBRUhjQnhBRElSTWdCaWdDTkNFSUlBWW9BamdoQ1NBTFFRaHFJQXRCekFGcUVBSU5EeUFUSUFzb0Fzd0JJZ28yQWdBZ0NpQUlJQWxzSWcxUERROGdDMEVJYWlBTFFjd0JhaEFDRFE4Z0FDQUxLQUxNQVNJSU5nSzRFZ0pBQWtBZ0NBNElBQkVCRVJFQUVRRVJDeUFhUVFWR0RSQWdCaWdDTEVVTkVBc2dDMEVJYWlBTFFjd0JhaEFDRFE4Z0FDQUxLQUxNQVNJSU5nSzhFaUFJSUFjb0FnQkhEUTlCSHlBR0tBSU1aeUluYXlFTUlBc29BZ3doQ1FKQUlBc29BaFJCQTNRaUVTQUxLQUlZSWc5cklncEJJRTRFUUNBSktBQUFJZ2hCR0hRZ0NFRUlkRUdBZ1B3SGNYSWdDRUVJZGtHQS9nTnhJQWhCR0haeWNpRU9JQXNvQWhBaUNFVU5BU0FPSUFoMElBa3RBQVJCQ0NBSWEzWnlJUTRNQVFzZ0NrRUJTQVJBUVFBaERnd0JDeUFKTFFBQUlBc29BaEFpRkVFWWFpSUlkQ0VPSUFvZ0ZHcEJDR3NpR0VFQlNBMEFBMEFnQ1MwQUFTQUlRUWhySWdoMElBNXlJUTRnR0VFSVNpRUtJQWxCQVdvaENTQVlRUWhySVJnZ0NnMEFDd3NnQ3lBTUlBOXFJZ2cyQWhnZ0N5QUlRUWR4TmdJUUlBZ2dFVXNORHlBTElBc29BZ2dnQ0VFRGRtbzJBZ3dnRGlBblFRRnFkaUlJUVg5R0RROGdHa0VGUnlJS1FRRWdDQnRGRFE4Z0FDQUlOZ0xBRWlBS1JRUkFJQXRCQ0dvZ0MwSE1BV29RQWcwUUlBQWdDeWdDekFFaUNEWUN4QklnQ0VILy93TkxEUkFMQWtBZ0JpZ0NFQ0lJQkg4Z0NBVkJIeUFHS0FJVVp5SU1heUVQSUFzb0Fnd2hDUUpBSUFzb0FoUkJBM1FpRkNBTEtBSVlJaWRySWdoQklFNEVRQ0FKS0FBQUlnaEJHSFFnQ0VFSWRFR0FnUHdIY1hJZ0NFRUlka0dBL2dOeElBaEJHSFp5Y2lFT0lBc29BaEFpQ0VVTkFTQU9JQWgwSUFrdEFBUkJDQ0FJYTNaeUlRNE1BUXNnQ0VFQlNBUkFRUUFoRGd3QkN5QUpMUUFBSUFzb0FoQWlHRUVZYWlJUmRDRU9JQWdnR0dwQkNHc2lHRUVCU0EwQUEwQWdDUzBBQVNBUlFRaHJJaEYwSUE1eUlRNGdHRUVJU2lFSUlBbEJBV29oQ1NBWVFRaHJJUmdnQ0EwQUN3c2dDeUFQSUNkcUlnZzJBaGdnQ3lBSVFRZHhOZ0lRSUFnZ0ZFc05FU0FMSUFzb0FnZ2dDRUVEZG1vMkFnd2dEaUFNUVFGcWRpSUlRWDlHRFJFZ0FDQUlOZ0xJRWlBSEtBSUlCRUFnQzBFQU5nTFFBU0FMUVFocUlBdEIwQUZxRUFJaENBSkFJQXNvQXRBQklnbEJmMFlFUUVHQWdJQ0FlQ0VZSUFoRkRSUU1BUXNnQ0EwVElBbEJBV3BCQVhZaUNFRUFJQWhySUFsQkFYRWJJUmdMSUFBZ0dEWUN6QklMSUFwRkJFQWdBQ2dDeUJJaUNDQUdLQUlVUVFGMlN3MFNJQWhCQUNBQUtBTE1FaUlKUVI5MUlBbHhhMGNORWdzZ0JpZ0NFQXRCQVVjTkFDQUdLQUlZRFFBZ0MwRUFOZ0xRQVNBTFFRaHFJQXRCMEFGcUVBSWhDQUpBSUFzb0F0QUJJZ2xCZjBZRVFFR0FnSUNBZUNFWUlBaEZEUklNQVFzZ0NBMFJJQWxCQVdwQkFYWWlDRUVBSUFocklBbEJBWEViSVJnTElBQWdHRFlDMEJJZ0J5Z0NDQVJBSUF0QkFEWUMwQUVnQzBFSWFpQUxRZEFCYWhBQ0lRZ0NRQ0FMS0FMUUFTSUpRWDlHQkVCQmdJQ0FnSGdoR0NBSVJRMFREQUVMSUFnTkVpQUpRUUZxUVFGMklnaEJBQ0FJYXlBSlFRRnhHeUVZQ3lBQUlCZzJBdFFTQ3lBS0RRQWdBQ2dDMEJJaUNDQUFLQUxVRWlBSUlBWW9BaUJxYWlJSklBZ2dDVWdiRFJBTElBY29Ba1FFUUNBTFFRaHFJQXRCekFGcUVBSU5FQ0FBSUFzb0Fzd0JJZ2cyQXRnU0lBaEIvd0JMRFJBTEFrQUNRQ0FBS0FLNEVpSW5EZ1lBQVFFQkFRQUJDeUFMS0FJTUlRa0NRQ0FMS0FJVVFRTjBJZ3dnQ3lnQ0dDSVBheUlJUVNCT0JFQWdDU2dBQUNJSVFSaDBJQWhCQ0hSQmdJRDhCM0Z5SUFoQkNIWkJnUDREY1NBSVFSaDJjbkloRGlBTEtBSVFJZ2hGRFFFZ0RpQUlkQ0FKTFFBRVFRZ2dDR3QyY2lFT0RBRUxJQWhCQVVnRVFFRUFJUTRNQVFzZ0NTMEFBQ0FMS0FJUUloUkJHR29pRVhRaERpQUlJQlJxUVFockloaEJBVWdOQUFOQUlBa3RBQUVnRVVFSWF5SVJkQ0FPY2lFT0lCaEJDRW9oQ0NBSlFRRnFJUWtnR0VFSWF5RVlJQWdOQUFzTElBc2dEMEVCYWlJSU5nSVlJQXNnQ0VFSGNUWUNFQ0FJSUF4TERSQWdDeUFMS0FJSUlBaEJBM1pxTmdJTUlBQWdEa0VmZGpZQzNCSUNRQ0FPUVg5TUJFQWdDMEVJYWlBTFFjd0JhaEFDRFJJZ0N5Z0N6QUVpQ0VFUFN3MFNJQWhCQVdvaENTQUFLQUs0RWlFbkRBRUxJQWNvQWpBaUNVRVFTdzBSQ3lBQUlBazJBdUFTQ3dKQUFrQWdKdzRHQUFFQkFRRUFBUXNnQ3lnQ0RDRUpBa0FnQ3lnQ0ZFRURkQ0lNSUFzb0FoZ2lEMnNpQ0VFZ1RnUkFJQWtvQUFBaUNFRVlkQ0FJUVFoMFFZQ0EvQWR4Y2lBSVFRaDJRWUQrQTNFZ0NFRVlkbkp5SVE0Z0N5Z0NFQ0lJUlEwQklBNGdDSFFnQ1MwQUJFRUlJQWhyZG5JaERnd0JDeUFJUVFGSUJFQkJBQ0VPREFFTElBa3RBQUFnQ3lnQ0VDSVVRUmhxSWhGMElRNGdDQ0FVYWtFSWF5SVlRUUZJRFFBRFFDQUpMUUFCSUJGQkNHc2lFWFFnRG5JaERpQVlRUWhLSVFnZ0NVRUJhaUVKSUJoQkNHc2hHQ0FJRFFBTEN5QUdLQUlNSVJFZ0FDZ0M0QkloRkNBTElBOUJBV29pQ0RZQ0dDQUxJQWhCQjNFMkFoQWdDQ0FNU3cwUUlBc2dDeWdDQ0NBSVFRTjJhallDRENBQUlBNUJIM1kyQXZnU0lBNUJmMG9OQUVFQUlRa0RRQ0FKSUJSTERSRWdDMEVJYWlBTFFld0JhaEFDRFJFZ0N5Z0M3QUVpQ0VFRFN3MFJJQUFnQ1VFTWJHb2lERUg4RW1vZ0NEWUNBQ0FJUVFGTkJFQWdDMEVJYWlBTFFkQUJhaEFDRFJJZ0N5Z0MwQUVpQ0NBUlR3MFNJQXhCZ0JOcUlBaEJBV28yQWdBZ0NVRUJhaUVKREFFTElBaEJBa1lFUUNBTFFRaHFJQXRCMEFGcUVBSU5FaUFNUVlRVGFpQUxLQUxRQVRZQ0FDQUpRUUZxSVFrTUFRc0xJQWxGRFJBTEFrQWdFa1VOQUNBTEtBSU1JUWdDUUNBTEtBSVVRUU4wSWc4Z0N5Z0NHQ0luYXlJTVFTQk9CRUFnQ0NnQUFDSUpRUmgwSUFsQkNIUkJnSUQ4QjNGeUlBbEJDSFpCZ1A0RGNTQUpRUmgyY25JaERpQUxLQUlRSWdsRkRRRWdEaUFKZENBSUxRQUVRUWdnQ1d0MmNpRU9EQUVMSUF4QkFVZ0VRRUVBSVE0TUFRc2dDQzBBQUNBTEtBSVFJaFJCR0dvaUVYUWhEaUFJSVFrZ0RDQVVha0VJYXlJWVFRRklEUUFEUUNBSkxRQUJJQkZCQ0dzaUVYUWdEbkloRGlBWVFRaEtJUXdnQ1VFQmFpRUpJQmhCQ0dzaEdDQU1EUUFMQ3lBR0tBSXNJUlFnQ3lBblFRRnFJZ3cyQWhnZ0N5QU1RUWR4SWdZMkFoQkJmeUVKSUF3Z0QwMEVRQ0FMSUFzb0FnZ2dERUVEZG1vaUNEWUNEQ0FPUVI5MklRa0xJQXBGQkVBZ0NVRi9SZzBSSUFBZ0NUWUN5QlFDUUNBUElBeHJJZ3BCSUU0RVFDQUlLQUFBSWdsQkdIUWdDVUVJZEVHQWdQd0hjWElnQ1VFSWRrR0EvZ054SUFsQkdIWnljaUVKSUFaRkRRRWdDU0FHZENBSUxRQUVRUWdnQm10MmNpRUpEQUVMSUFwQkFVZ0VRRUVBSVFrTUFRc2dDQzBBQUNBR1FSaHlJaGgwSVFrZ0JpQUtha0VJYXlJS1FRRklEUUFEUUNBSUxRQUJJQmhCQ0dzaUdIUWdDWEloQ1NBS1FRaEtJUVlnQ0VFQmFpRUlJQXBCQ0dzaENpQUdEUUFMQ3lBTElDZEJBbW9pQmpZQ0dDQUxJQVpCQjNFMkFoQWdCaUFQU3cwUklBc2dDeWdDQ0NBR1FRTjJhallDRENBQUlBbEJIM1kyQXN3VUlCUU5BU0FKUVg5TURSRU1BUXNnQ1VGL1JnMFFJQUFnQ1RZQzBCUWdDVVVOQUNBVVFRRjBRUU5xSVE5QkFDRUpRUUFoSjBFQUlRNUJBQ0VJUVFBaEVRTkFJQWtnRDBZTkVTQUxRUWhxSUF0QjdBRnFFQUlORVNBTEtBTHNBU0lHUVFaTERSRWdBQ0FKUVJSc2FpSUtRZFFVYWlBR05nSUFJQVpCZlhGQkFVWUVRQ0FMUVFocUlBdEIwQUZxRUFJTkVpQUtRZGdVYWlBTEtBTFFBVUVCYWpZQ0FBc0NRQUpBQWtBQ1FDQUdRUUpyRGdVQUFRSURBUU1MSUF0QkNHb2dDMEhRQVdvUUFnMFVJQXBCM0JScUlBc29BdEFCTmdJQURBSUxJQXRCQ0dvZ0MwSFFBV29RQWcwVElBcEI0QlJxSUFzb0F0QUJOZ0lBSUFaQkJFY05BUXNnQzBFSWFpQUxRZEFCYWhBQ0RSSWdDeWdDMEFFaURDQVVTdzBTSUFwQjVCUnFJQXhCQVd0Qi8vOERJQXdiTmdJQUlDZEJBV29oSndzZ0NVRUJhaUVKSUFnZ0JrRUdSbW9oQ0NBT0lBWkJCVVpxSVE0Z0VTQUdRUUZyUVFOSmFpRVJJQVlOQUFzZ0owRUJTdzBRSUE1QkFVc05FQ0FJUVFGTERSQWdFVVVOQUNBT0RSQUxJQXRCQURZQzBBRWdDMEVJYWlBTFFkQUJhaEFDSVFZQ1FDQUxLQUxRQVNJSVFYOUdCRUJCZ0lDQWdIZ2hDU0FHUlEwUkRBRUxJQVlORUNBSVFRRnFRUUYySWdaQkFDQUdheUFJUVFGeEd5RUpDeUFBSUFrMkF1UVNJQWNvQWpRZ0NXcEJNMHNORHdKQUlBY29BanhGRFFBZ0MwRUlhaUFMUWN3QmFoQUNEUkFnQUNBTEtBTE1BU0lHTmdMb0VpQUdRUUpMRFJBZ0JrRUJSZzBBSUF0QkFEWUMwQUVnQzBFSWFpQUxRZEFCYWhBQ0lRZ2dDeWdDMEFFaUJrRi9SZzBRSUFnTkVDQUdRUUZxUVFGMklnaEJBQ0FJYXlBR1FRRnhHeUlHUVFacVFReExEUkFnQUNBR1FRRjBOZ0xzRWlBTFFRQTJBdEFCSUF0QkNHb2dDMEhRQVdvUUFpRUlJQXNvQXRBQklnWkJmMFlORUNBSURSQWdCa0VCYWtFQmRpSUlRUUFnQ0dzZ0JrRUJjUnNpQmtFR2FrRU1TdzBRSUFBZ0JrRUJkRFlDOEJJTEFrQWdCeWdDREVFQ1NRMEFJQWNvQWhCQkEydEJBa3NOQUVFQlFRSWdEU0FOSUFjb0FpUWlCMjRpQmlBSGJFWWJJQVpxSVFoQkFDRUtBMEFnQ0NBS0lnWkJBV29pQ25ZTkFBc2dDaUFHSUFoQmZ5QUdkRUYvYzNFYklRZ2dDeWdDRENFS0FrQWdDeWdDRkVFRGRDSU9JQXNvQWhnaUVXc2lCa0VnVGdSQUlBb29BQUFpQmtFWWRDQUdRUWgwUVlDQS9BZHhjaUFHUVFoMlFZRCtBM0VnQmtFWWRuSnlJUXdnQ3lnQ0VDSUdSUTBCSUF3Z0JuUWdDaTBBQkVFSUlBWnJkbkloREF3QkN5QUdRUUZJQkVCQkFDRU1EQUVMSUFvdEFBQWdDeWdDRUNJSlFSaHFJaGgwSVF3Z0JpQUpha0VJYXlJSlFRRklEUUFEUUNBS0xRQUJJQmhCQ0dzaUdIUWdESEloRENBSlFRaEtJUVlnQ2tFQmFpRUtJQWxCQ0dzaENTQUdEUUFMQ3lBTElBZ2dFV29pQmpZQ0dDQUxJQVpCQjNFMkFoQWdCaUFPU3dSQUlBdEJmellDekFFTUVRc2dDeUFMS0FJSUlBWkJBM1pxTmdJTUlBeEJJQ0FJYTNZaUJrRi9SZzBRSUFBZ0JqWUM5QklnQmlBSElBMXFRUUZySUFkdVN3MFFDeUFBS0FLa0NVVUVRQUpBSUJwQkJVWU5BQ0FBS0FJUUtBSXdJUVlnQUVJQU53TFVDU0FHUlEwQUFrQUNRQUpBQWtBZ0FDZ0M5QWtpQ2lBQUtBTEFFaUluUndSQUlDY2dDa0VCYWlBQUtBTGtDU0lPY0NJR1J3UkFJQUFvQXNRSklBQW9BdUFKUVNoc2FpZ0NBQ0VSQTBBQ1FBSkFBa0FDUUNBQUtBTHNDU0lLQkVBZ0NrRUJjU0VKSUFBb0FzUUpJUWRCQUNFTkFrQWdDa0VCUmlJUFJRUkFJQXBCZm5FaERBTkFJQWNnRFVFb2JHb2lDQ2dDRkVFQmEwRUJUUVJBSUFnZ0NDZ0NEQ0lJSUE1QkFDQUdJQWhKRzJzMkFnZ0xJQWNnRFVFQmNrRW9iR29pQ0NnQ0ZFRUJhMEVDU1FSQUlBZ2dDQ2dDRENJSUlBNUJBQ0FHSUFoSkcyczJBZ2dMSUExQkFtb2hEU0FNUVFKcklnd05BQXNnQ1VVTkFRc2dCeUFOUVNoc2FpSUlLQUlVUVFGclFRRkxEUUFnQ0NBSUtBSU1JZ2dnRGtFQUlBWWdDRWtiYXpZQ0NBc2dDaUFBS0FMY0NVa05CQ0FQUlEwQlFRQWhHRUYvSVF4QkFDRUlEQUlMUVFBaENpQUFLQUxjQ1EwRFFRTWhEQXdkQzBGL0lReEJBQ0VOUVFBaEdDQUtRWDV4SWdnaERnTkFJQWNnRFVFb2JHb2lEeWdDRkVFQmEwRUJUUVJBSUE4b0FnZ2lEeUFZSUF4QmYwWWdEeUFZU0hJaUR4c2hHQ0FOSUF3Z0R4c2hEQXNnQnlBTlFRRnlJZzlCS0d4cUloUW9BaFJCQVd0QkFra0VRQ0FVS0FJSUloUWdHQ0FNUVg5R0lCUWdHRWh5SWhRYklSZ2dEeUFNSUJRYklRd0xJQTFCQW1vaERTQU9RUUpySWc0TkFBc2dDVVVOQVFzZ0J5QUlRU2hzYWlJSktBSVVRUUZyUVFGTERRQWdDQ0FJSUF3Z0RFRi9SaHNnQ1NnQ0NDQVlTQnNoREFzZ0RFRUFTQTBaSUFjZ0RFRW9iR29pQjBFQU5nSVVJQUFnQ2tFQmF5SUtOZ0xzQ1NBSEtBSVlEUUFnQUNBQUtBTHdDVUVCYXpZQzhBa0xBa0FnQUNnQzhBa2lDQ0FBS0FMZ0NTSUhTUVJBSUFBb0FzUUpJUThNQVFzZ0FDZ0MvQWtOQkNBQUtBTEVDU0VQQTBCQkFDRVlRZi8vLy84SElReEJBQ0VOQTBBZ0R5QU5RU2hzYWlJSktBSVlCRUFnQ1NBWUlBa29BaEFpQ1NBTVNDSU9HeUVZSUFrZ0RDQU9HeUVNQ3lBTlFRRnFJZzBnQjAwTkFBc2dHQVJBSUFBb0F0QUpJQUFvQXRRSklneEJCSFJxSWdrZ0dDZ0NBRFlDQUNBSklCZ29BaVEyQWd3Z0NTQVlLQUljTmdJRUlBa2dHQ2dDSURZQ0NDQUFJQXhCQVdvMkF0UUpJQmhCQURZQ0dDQUlJQmdvQWhSRmF5RUlDeUFISUFoTkRRQUxDeUFQSUFkQktHeHFJZ2tnQmpZQ0RDQUpRb0NBZ0lBUU53SVFJQWxCQURZQ0dDQUpJQVkyQWdnZ0FDQUtRUUZxTmdMc0NTQUFJQWhCQVdvMkF2QUpJQThnQjBFQmFoQWRJQVpCQVdvZ0FDZ0M1QWtpRG5BaUJpQW5SdzBBQ3lBQUtBTFVDU0lJUlEwRElBQW9Bc1FKSWdrZ0FDZ0M0QWtpQmtFb2JHb2lEQ2dDQUNFSElBQW9BdEFKSVExQkFDRUtBMEFnQnlBTklBcEJCSFJxS0FJQVJ3UkFJQWdnQ2tFQmFpSUtSdzBCREFVTEMwRUFJUW9nQmtVTkF3TkFJQkVnQ1NBS1FTaHNhaUlJS0FJQVJ3UkFJQVlnQ2tFQmFpSUtSdzBCREFVTEN5QUlJQWMyQWdBZ0RDQVJOZ0lBREFNTElCSU5CQXdEQzBFQUlRb2dFa1VOQkVFRElRd01GZ3NEUUF3QUN3QUxJQklOQVNBQUtBTDBDU0VLQ3lBS0lDZEdEUUVnRGlBbmFrRUJheUFPY0NFbkN5QUFJQ2MyQXZRSkN5QUFJQUFvQXNRSklBQW9BdUFKUVNoc2FpSUdOZ0xNQ1NBQUlBWW9BZ0EyQXJnS0N5QldJQk5CM0FjUUJ5RXZJQUJCQVRZQ3BBa2dBQ0FhclNBU3JVSWdob1EzQXRBS0lBQW9BaEFpQmlnQ09DSU9JQVlvQWpRaUVtd2hHQ0FBS0FLVUNTRVBBa0FnQUNnQ0RDSUdLQUlNSWdwQkFVWUVRQ0FQUVFBZ0dFRUNkQkFER2d3QkMwRUFJUTBDUUFKQUlBWW9BaEFpQjBFRGEwRUNUUVJBSUFZb0FpUWdBQ2dDbUF0c0lnZ2dHQ0FJSUJoSkd5RWFJQVlvQWlBaENDQUhRWDV4UVFSSERRRWdHQ0FhYXlBYUlBZ2JJUTBMQWtBQ1FBSkFBa0FDUUFKQUlBY09CZ0VDQXdBRkJBQUxJQmhGRFFjZ0dFRURjU0VKSUFZb0Fpd2hCMEVBSVFZZ0dFRUJhMEVEVHdSQUlCaEJmSEVoREFOQUlBOGdCa0VDZENJSWFpQUhJQWhxS0FJQU5nSUFJQThnQ0VFRWNpSUthaUFISUFwcUtBSUFOZ0lBSUE4Z0NFRUljaUlLYWlBSElBcHFLQUlBTmdJQUlBOGdDRUVNY2lJSWFpQUhJQWhxS0FJQU5nSUFJQVpCQkdvaEJpQU1RUVJySWd3TkFBc0xJQWxGRFFjRFFDQVBJQVpCQW5RaUNHb2dCeUFJYWlnQ0FEWUNBQ0FHUVFGcUlRWWdDVUVCYXlJSkRRQUxEQWNMSUFwRkRRVWdCaWdDRkNFSVFRQWhCd05BUVFBaERTQUhJQmhQRFFjRFFBSkFJQWdnRFVFQ2RHb2lEQ2dDQUNJSlJRUkFRUUFoQ1F3QkMwRUFJUVpCQUNBWUlBZHJJZzRnRGlBWVN4c2lEa1VOQUFOQUlBOGdCaUFIYWtFQ2RHb2dEVFlDQUNBR1FRRnFJZ1lnRENnQ0FDSUpUdzBCSUFZZ0RrY05BQXNMSUFvZ0RVRUJhaUlOUzBFQUlCZ2dCeUFKYWlJSFN4c05BQXNnQnlBWVNRMEFDd3dHQ3lBWVJRMEZRUUFoQmdOQUlBOGdCa0VDZEdvZ0JpQVNiaUlISUFwc1FRRjJJQVlnQnlBU2JHdHFJQXB3TmdJQUlBWkJBV29pQmlBWVJ3MEFDd3dGQ3lBR0tBSWNJUTRnQmlnQ0dDRVJBa0FnR0VVTkFDQUtRUUZySVFZZ0dFRUhjU0VKUVFBaERTQVlRUUZyUVFkUEJFQWdHRUY0Y1NFTUEwQWdEeUFOUVFKMElnZHFJQVkyQWdBZ0R5QUhRUVJ5YWlBR05nSUFJQThnQjBFSWNtb2dCallDQUNBUElBZEJESEpxSUFZMkFnQWdEeUFIUVJCeWFpQUdOZ0lBSUE4Z0IwRVVjbW9nQmpZQ0FDQVBJQWRCR0hKcUlBWTJBZ0FnRHlBSFFSeHlhaUFHTmdJQUlBMUJDR29oRFNBTVFRaHJJZ3dOQUFzTElBbEZEUUFEUUNBUElBMUJBblJxSUFZMkFnQWdEVUVCYWlFTklBbEJBV3NpQ1EwQUN3c2dDa0VDYXlFR0EwQUNRQ0FSSUFZaUIwRUNkQ0lHYWlnQ0FDSUlJQkp1SWd3Z0JpQU9haWdDQUNJR0lCSnVJaGhMRFFBZ0NDQU1JQkpzYXlJSUlBWWdFaUFZYkdzaUNVc05BQU5BSUF3Z0Vtd2hDaUFJSVFZRFFDQVBJQVlnQ21wQkFuUnFJQWMyQWdBZ0JrRUJhaUlHSUFsTkRRQUxJQXhCQVdvaURDQVlUUTBBQ3dzZ0IwRUJheUVHSUFjTkFBc01CQXNnRWtVTkF5QU9SUTBEUVFFZ0JpZ0NJQ0lZYXlFUklBNUJmbkVoQ2lBT1FRRnhJUnBCQUNFSVFRQWhDUU5BSUFnaEJrRUFJUWNnQ2lFTUlBNUJBVWNFUUFOQUlBOGdCeUFTYkNBSmFrRUNkR29nR0NBUklBWWdEVWtiTmdJQUlBOGdCMEVCY2lBU2JDQUpha0VDZEdvZ0dDQVJJQVpCQVdvZ0RVa2JOZ0lBSUFkQkFtb2hCeUFHUVFKcUlRWWdERUVDYXlJTURRQUxDeUFhQkVBZ0R5QUhJQkpzSUFscVFRSjBhaUFZSUJFZ0JpQU5TUnMyQWdBTElBZ2dEbW9oQ0NBSlFRRnFJZ2tnRWtjTkFBc01Bd3NnR0VVTkFrRUJJQVlvQWlBaUIyc2hDQ0FZUVFOeElReEJBQ0VHSUJoQkFXdEJBMDhFUUNBWVFYeHhJUklEUUNBUElBWkJBblJxSUFjZ0NDQUdJQTFKR3pZQ0FDQVBJQVpCQVhJaUNVRUNkR29nQnlBSUlBa2dEVWtiTmdJQUlBOGdCa0VDY2lJSlFRSjBhaUFISUFnZ0NTQU5TUnMyQWdBZ0R5QUdRUU55SWhoQkFuUnFJQWNnQ0NBTklCaExHellDQUNBR1FRUnFJUVlnRWtFRWF5SVNEUUFMQ3lBTVJRMENBMEFnRHlBR1FRSjBhaUFISUFnZ0JpQU5TUnMyQWdBZ0JrRUJhaUVHSUF4QkFXc2lEQTBBQ3d3Q0N3SkFJQmhGRFFBZ0dFRUhjU0VOUVFBaEJ5QVlRUUZyUVFkUEJFQWdHRUY0Y1NFSkEwQWdEeUFIUVFKMElnWnFRUUUyQWdBZ0R5QUdRUVJ5YWtFQk5nSUFJQThnQmtFSWNtcEJBVFlDQUNBUElBWkJESEpxUVFFMkFnQWdEeUFHUVJCeWFrRUJOZ0lBSUE4Z0JrRVVjbXBCQVRZQ0FDQVBJQVpCR0hKcVFRRTJBZ0FnRHlBR1FSeHlha0VCTmdJQUlBZEJDR29oQnlBSlFRaHJJZ2tOQUFzTElBMUZEUUFEUUNBUElBZEJBblJxUVFFMkFnQWdCMEVCYWlFSElBMUJBV3NpRFEwQUN3c2dHa1VOQVNBU1FRRnJJUlFnRGtFQmF5RVRRUUVnQ0VFQmRDSUdheUVLSUFaQkFXc2hEQ0FJUVFGcklRZEJBQ0VKSUE0Z0NHdEJBWFlpRGlFbklCSWdDR3RCQVhZaUVTRU5JQTRoR0NBUklRWURRQ0FQSUJJZ0dHd2dCbXBCQW5ScUlod29BZ0FpRjBFQlJnUkFJQnhCQURZQ0FBc2dGMEVCUmlFY0FrQUNRQ0FIUVg5SERRQWdCaUFOUncwQVFRQWhCeUFNSVFnZ0RVRUJJQTFCQVVvYlFRRnJJZ1loRFF3QkN3SkFJQWRCQVVjTkFDQUdJQkZIRFFCQkFDRUhJQW9oQ0NBUlFRRnFJZ1lnRkNBR0lCUklHeUlHSVJFTUFRc0NRQ0FJUVg5SERRQWdHQ0FuUncwQVFRQWhDQ0FLSVFjZ0owRUJJQ2RCQVVvYlFRRnJJaGdoSnd3QkN3SkFJQWhCQVVjTkFDQU9JQmhIRFFCQkFDRUlJQXdoQnlBT1FRRnFJZzRnRXlBT0lCTklHeUlZSVE0TUFRc2dDQ0FZYWlFWUlBWWdCMm9oQmdzZ0NTQWNhaUlKSUJwSkRRQUxEQUVMSUJoRkRRQURRQXdBQ3dBTEFrQWdBQ2dDN0FraUNFVUVRQ0FBS0FLRUN5RVNJQUFvQXVRS0lRd01BUXNnQ0VFRGNTRUtRUUFoQmlBSVFRRnJRUU5QQkVBZ0NFRjhjU0VIQTBBZ0FDZ0N5QWtnQmtFQ2RHb2dBQ2dDeEFrZ0JrRW9iR28yQWdBZ0FDZ0N5QWtnQmtFQmNpSUpRUUowYWlBQUtBTEVDU0FKUVNoc2FqWUNBQ0FBS0FMSUNTQUdRUUp5SWdsQkFuUnFJQUFvQXNRSklBbEJLR3hxTmdJQUlBQW9Bc2dKSUFaQkEzSWlDVUVDZEdvZ0FDZ0N4QWtnQ1VFb2JHbzJBZ0FnQmtFRWFpRUdJQWRCQkdzaUJ3MEFDd3NnQ2dSQUEwQWdBQ2dDeUFrZ0JrRUNkR29nQUNnQ3hBa2dCa0VvYkdvMkFnQWdCa0VCYWlFR0lBcEJBV3NpQ2cwQUN3c2dBQ2dDaEFzaEVpQUFLQUxrQ2lFTUlBaEZEUUFnT0NnQ0FDRUpRUUFoQmdOQUlBa2dCa0VvYkdvaUJ5Z0NGRUVCYTBFQlRRUkFJQWNnRENBSEtBSU1JZ2RKQkg4Z0J5QUFLQUxrQ1dzRklBY0xOZ0lJQ3lBR1FRRnFJZ1lnQ0VjTkFBc0xBa0FnQUNnQ25BdEZEUUJCQUNFWUlBd2hDQ0FBS0FLZ0N5SUdRUUpMRFFBRFFBSkFBa0FDUUFKQUFrQUNRQUpBSUFZT0F3QUJBd0VMSUFnZ0FDQVlRUXhzYWtHa0Myb29BZ0JySWdoQmYwb05BU0FBS0FMa0NTQUlhaUVJREFFTElBQWdHRUVNYkdwQnBBdHFLQUlBSUFocUlnWkJBQ0FBS0FMa0NTSUhJQVlnQjBnYmF5RUlDeUFJSWc0Z0RFc0VRQ0FJSUFBb0F1UUpheUVPQ3lBQUtBTGNDU0lKUlEwVklEZ29BZ0FoQjBFQUlRWURRQ0FISUFaQktHeHFJZ29vQWhRaURVRUJhMEVCVFFSQUlBb29BZ2dnRGtZTkF3dEJBQ0VLSUFaQkFXb2lCaUFKUncwQUMwRURJUXdNRmdzZ0FDZ0MzQWtpQ1VVTkZDQUFJQmhCREd4cVFhZ0xhaWdDQUNFT0lEZ29BZ0FoQjBFQUlRWURRQ0FISUFaQktHeHFJZ29vQWhSQkEwWUVRQ0FLS0FJSUlBNUdEUU1MUVFBaENpQUdRUUZxSWdZZ0NVY05BQXRCQXlFTURCVUxRUUFoQ2lBR1FRQklCRUJCQXlFTURCVUxJQTFCQVVzTkFVRURJUXdNRkF0QkFDRUtJQVpCQUU0TkFFRURJUXdNRXdzZ0VpQVlTd1JBSUJJaUNpQVlhMEVEY1NJSEJFQURRQ0FBS0FMSUNTSUpJQXBCQW5ScUlBa2dDa0VCYXlJS1FRSjBhaWdDQURZQ0FDQUhRUUZySWdjTkFBc0xJQklnR0VGL2MycEJBMDhFUUFOQUlBQW9Bc2dKSWdrZ0NrRUNkQ0lIYWlBSklBZEJCR3NpRG1vb0FnQTJBZ0FnQUNnQ3lBa2lDU0FPYWlBSklBZEJDR3NpRG1vb0FnQTJBZ0FnQUNnQ3lBa2lDU0FPYWlBSklBZEJER3NpQjJvb0FnQTJBZ0FnQnlBQUtBTElDU0lKYWlBSklBcEJCR3NpQ2tFQ2RHb29BZ0EyQWdBZ0NpQVlTdzBBQ3dzZ09DZ0NBQ0VIQ3lBQUtBTElDU0FZUVFKMGFpQUhJQVpCS0d3aUNXbzJBZ0FnR0VFQmFpSVlJUW9nRWlBWUlnWlBCRUFEUUNBQUtBTElDU0lISUFaQkFuUnFLQUlBSWc0Z0FDZ0N4QWtnQ1dwSEJFQWdCeUFLUVFKMGFpQU9OZ0lBSUFwQkFXb2hDZ3NnQmtFQmFpSUdJQkpORFFBTEN5QUFJQmhCREd4cVFhQUxhaWdDQUNJR1FRTkpEUUFMQ3dKL0lBdEJDR29oSUVFQUlUbEJBQ0UwSXdCQjhBTnJJaDhrQUNBdktBSUFJU29nQUNnQ3NCb2hGaUFmUVFBMkFnd2dBRUd3Q1dwQkFEWUNBQ0FBSUFBb0FxZ0pRUUZxTmdLb0NTQVdRWWdRYWlFMklCWkJ5QXBxSVJzZ0ZrR0lDbW9oTnlBV1FjZ0phaUU2SUJaQmlBbHFJVDRnRmtISUNHb2hQeUFXUVlnSWFpRkFJQlpCeUFkcUlVRWdGa0dJQjJvaFFpQVdRY2dHYWlGRElCWkJpQVpxSVVRZ0ZrSElCV29oUlNBV1FZZ0ZhaUZHSUJaQnlBUnFJVWNnRmtHSUJHb2hTQ0FXUWNnRGFpRkpJQlpCaUFOcUlVb2dGa0hJRDJvaEtDQVdRY2dDYWlFVUlCWkJtQTlxSVVzZ0ZrR0lEMm9oVENBV1FjZ09haUZOSUJaQkRHb2hUaUF2S0FJd0lBQW9BZ3dvQWpScUlTMGdBQ2dDdkFraERpQVdRY3dLYWlGUElCWkJqQXRxSVRzZ0ZrR01FR29oVUNBV1Fjd0xhaUZSSUJaQmtCQnFJVklnRmtHTURHb2hZU0FXUVpRUWFpRmlJQlpCekF4cUlXTWdGa0dZRUdvaFpDQVdRWXdOYWlGbElCWkJuQkJxSVdZZ0ZrSE1EV29oWnlBV1FhQVFhaUZvSUJaQmpBNXFJV2tnRmtHa0VHb2hhaUFXUVpBQ2FpSWpJV3NDUUFOQUFrQWdMeWdDSkEwQUlBNGdLa0hZQVd4cUtBTEVBVVVOQUVFQklRWU1BZ3NnTHlrQ05DRnVJQzhvQWp3aEJ5QUFLQUtvQ1NFSUlBNGdLa0hZQVd3aU1Xb2lCaUFBS0FJTUtBSTROZ0lZSUFZZ0J6WUNFQ0FHSUc0M0FnZ2dCaUFJTmdJRUFrQWdMeWdDQkNJR1FRSkdEUUFnQmtFSFJnMEFJRGtOQUVFQklRWWdJQ0FmUVF4cUVBSU5BaUFmS0FJTUlnY2dBQ2dDbUFrZ0ttdExEUUlnQjBVRVFFRUFJVGtNQVFzZ1RrRUFRYVFCRUFNYUlCWkJBRFlDQUVFQklUa0xBa0FnSHlnQ0RDSUdCRUFnSHlBR1FRRnJOZ0lNREFFTElDOG9BaXdoRFNBQUtBSzhDU0VSSUM4b0FnUWhCaUFXUVFCQnFCQVFBeUVLSUNBZ0gwSE1BMm9RQWlFSEFrQUNRQUpBSUFaQkFtc09CZ0FCQVFFQkFBRUxRUUVoQmlBZktBTE1BMEVHYWlJSlFSOUxEUVFnQjBVTkFRd0VDMEVCSVFZZ0h5Z0N6QU5CQVdvaUNVRWZTdzBESUFjTkF3c2dDaUFKTmdJQUFrQWdDVUVmUmdSQUlDQW9BZ2doRXdOQUlDQW9BZ1FoQmlBVFJRUkFRUUFoQ2lBVUlRY0RRQUpBSUNBb0FneEJBM1FpRGlBZ0tBSVFJZ3hySWdsQklFNEVRQ0FHS0FBQUlnaEJHSFFnQ0VFSWRFR0FnUHdIY1hJZ0NFRUlka0dBL2dOeElBaEJHSFp5Y2lFSUlDQW9BZ2dpQ1VVTkFTQUlJQWwwSUFZdEFBUkJDQ0FKYTNaeUlRZ01BUXNnQ1VFQlNBUkFRUUFoQ0F3QkN5QUdMUUFBSUNBb0FnZ2lEVUVZYWlJYWRDRUlJQWtnRFdwQkNHc2lDVUVCU0EwQUEwQWdCaTBBQVNBYVFRaHJJaHAwSUFoeUlRZ2dDVUVJU2lFTklBWkJBV29oQmlBSlFRaHJJUWtnRFEwQUN3c2dJQ0FNUVFkeE5nSUlJQ0FnREVFSWFpSUdOZ0lRSUFZZ0Rrc0VRRUVCSVFZTUNBc2dJQ0FnS0FJQUlBWkJBM1pxSWdZMkFnUWdCeUFJUVJoMk5nSUFJQWRCQkdvaEJ5QUtRUUZxSWdwQmdBTkhEUUFMREFNTEFrQWdJQ2dDREVFRGRDSUtJQ0FvQWhBaURHc2lCMEVnVGdSQUlBWW9BQUFpQjBFWWRDQUhRUWgwUVlDQS9BZHhjaUFIUVFoMlFZRCtBM0VnQjBFWWRuSnlJQk4wSUFZdEFBUkJDQ0FUYTNaeUlRZ01BUXNnQjBFQlNBUkFRUUFoQ0F3QkN5QUdMUUFBSUJOQkdHb2lHblFoQ0NBSElCTnFRUWhySWdsQkFVZ05BQU5BSUFZdEFBRWdHa0VJYXlJYWRDQUljaUVJSUFsQkNFb2hCeUFHUVFGcUlRWWdDVUVJYXlFSklBY05BQXNMUVFFaEJpQWdJQXhCQVdvaUJ6WUNFQ0FnSUFkQkIzRWlFellDQ0NBSElBcExEUVVnSUNBZ0tBSUFJQWRCQTNacU5nSUVJQWhCZjBvTkFBc01CQXRCQWlBSlFRWkhJZzhnQ1VFR1NSc2hFZ0pBQWtBQ1FDQUpRWDV4UVFSR0JFQWdJQ0FmUWRRRGFoQUNCRUJCQVNFSURBUUxJQjhvQXRRRElnWkJBMHNFUUVFQklRZ01CQXNnQ2lBR05nS3dBU0FnSUI5QjFBTnFFQUlFUUVFQklRZ01CQXNnSHlnQzFBTWlCa0VEU3dSQVFRRWhDQXdFQ3lBS0lBWTJBclFCSUNBZ0gwSFVBMm9RQWdSQVFRRWhDQXdFQ3lBZktBTFVBeUlHUVFOTEJFQkJBU0VJREFRTElBb2dCallDdUFFZ0lDQWZRZFFEYWhBQ0JFQkJBU0VJREFRTElCOG9BdFFESWdaQkEwc0VRRUVCSVFnTUJBc2dDaUFHTmdLOEFTQU5RUUpKRFFJZ0NVRUZSdzBCREFJTEFrQUNmd0pBQWtBQ1FDQVNRUUZyRGdJRUFRQUxJQ0FvQWdRaEJnSkFJQ0FvQWd4QkEzUWdJQ2dDRUdzaUIwRWdUZ1JBSUFZb0FBQWlCMEVZZENBSFFRaDBRWUNBL0FkeGNpQUhRUWgyUVlEK0EzRWdCMEVZZG5KeUlRZ2dJQ2dDQ0NJSFJRMEJJQWdnQjNRZ0JpMEFCRUVJSUFkcmRuSWhDQXdCQ3lBSFFRQk1CRUJCQUNFSUlBcEJBRFlDREF3REN5QUdMUUFBSUNBb0FnZ2lDVUVZYWlJVGRDRUlJQWNnQ1dwQkNHc2lDVUVCU0EwQUEwQWdCaTBBQVNBVFFRaHJJaE4wSUFoeUlRZ2dDVUVJU2lFSElBWkJBV29oQmlBSlFRaHJJUWtnQncwQUN3c2dDaUFJUVI5Mk5nSU1JQWhCZjBvTkFTQUlRUUYwSVFsQkFBd0NDeUFOUVFKUEJFQkJBeUVHSUFsQkEwMEVRQ0FKUVFKMFFmd3FhaWdDQUNFR0MwRUFJUXdEUUNBR0lRY0NRQ0FOUVFKTkJFQWdJQ2dDQkNFR0FrQWdJQ2dDREVFRGRDSWFJQ0FvQWhBaUhHc2lDRUVnVGdSQUlBWW9BQUFpQ0VFWWRDQUlRUWgwUVlDQS9BZHhjaUFJUVFoMlFZRCtBM0VnQ0VFWWRuSnlJUk1nSUNnQ0NDSUlSUTBCSUJNZ0NIUWdCaTBBQkVFSUlBaHJkbkloRXd3QkN5QUlRUUZJQkVCQkFDRVREQUVMSUFZdEFBQWdJQ2dDQ0NJWFFSaHFJZzUwSVJNZ0NDQVhha0VJYXlJSVFRRklEUUFEUUNBR0xRQUJJQTVCQ0dzaURuUWdFM0loRXlBSVFRaEtJUmNnQmtFQmFpRUdJQWhCQ0dzaENDQVhEUUFMQzBFQklRZ2dJQ0FjUVFGcUlnWTJBaEFnSUNBR1FRZHhOZ0lJSUFZZ0drc05DU0FnSUNBb0FnQWdCa0VEZG1vMkFnUWdIeUFUUVg5elFSOTJJZ1kyQXRRRERBRUxJQ0FnSDBIVUEyb1FBZ1JBUVFFaENBd0pDeUFmS0FMVUF5RUdDeUFHSUExUEJFQkJBU0VJREFnTElBb2dERUVDZEdvZ0JqWUNrQUVnQjBFQmF5RUdJQXhCQVdvaERDQUhEUUFMQzBFRElRaEJBQ0VHSUFsQkEwMEVRQ0FKUVFKMFFmd3FhaWdDQUNFSUN3SkFBa0FEUUNBSUlRY2dIMEVBTmdMWUF5QWdJQjlCMkFOcUVBSWhDQUovSUI4b0F0Z0RJZ2xCZjBZRVFFR0FnSUNBZUNBSURRRWFEQVFMSUFnTkF5QUpRUUZxUVFGMklnaEJBQ0FJYXlBSlFRRnhHd3NoQ0NBS0lBWkJBblJxSWdrZ0NEc0JvQUVnSDBFQU5nTFlBeUFnSUI5QjJBTnFFQUloQ0NBSkFuOGdIeWdDMkFNaUNVRi9SZ1JBUVlDQWdJQjRJQWdOQVJvTUF3c2dDQTBDSUFsQkFXcEJBWFlpQ0VFQUlBaHJJQWxCQVhFYkN6c0JvZ0VnQjBFQmF5RUlJQVpCQVdvaEJpQUhEUUFMUVFBaENBd0hDMEVCSVFnTUJndEJBU0VJREFVTElBb2dDRUVjZGpZQ1RDQUlRUVIwSVFsQkFRc2hCaUFLSUFsQkgzWTJBaEFnQ2lBSlFYOU1CSDhnQ1VFQmRBVWdDaUFKUVJ4Mk5nSlFJQVpCQVdvaEJpQUpRUVIwQ3lJSFFSOTJOZ0lVSUFvZ0IwRUFTQVIvSUFkQkFYUUZJQW9nQjBFY2RqWUNWQ0FHUVFGcUlRWWdCMEVFZEFzaUIwRWZkallDR0NBS0lBZEJBRWdFZnlBSFFRRjBCU0FLSUFkQkhIWTJBbGdnQmtFQmFpRUdJQWRCQkhRTElnZEJIM1kyQWh3Z0NpQUhRUUJJQkg4Z0IwRUJkQVVnQ2lBSFFSeDJOZ0pjSUFaQkFXb2hCaUFIUVFSMEN5SUhRUjkyTmdJZ0lBb2dCMEVBU0FSL0lBZEJBWFFGSUFvZ0IwRWNkallDWUNBR1FRRnFJUVlnQjBFRWRBc2lCMEVmZGpZQ0pDQUtJQWRCQUVnRWZ5QUhRUUYwQlNBS0lBZEJISFkyQW1RZ0JrRUJhaUVHSUFkQkJIUUxJZ2RCSDNZMkFpZ2dCMEVBVGdSQUlBb2dCMEVjZGpZQ2FDQUdRUUZxSVFZTElDQWdJQ2dDRUNBR1FRTnNha0VJYWlJSk5nSVFJQ0FnQ1VFSGNTSUhOZ0lJUVFFaENDQWdLQUlNUVFOMElnd2dDVWtOQXlBZ0lDQW9BZ0FpRFNBSlFRTjJhaUlHTmdJRUFuOENRQUpBSUF3Z0NXc2lDVUVnVGdSQUlBWW9BQUFpQ1VFWWRDQUpRUWgwUVlDQS9BZHhjaUFKUVFoMlFZRCtBM0VnQ1VFWWRuSnlJUk1nQjBVTkFTQVRJQWQwSUFZdEFBUkJDQ0FIYTNaeUlSTU1BUXNnQ1VFQVRBUkFRUUFoRXlBS1FRQTJBaXdNQWdzZ0JpMEFBQ0FIUVJoeUlnNTBJUk1nQnlBSmFrRUlheUlKUVFGSURRQURRQ0FHTFFBQklBNUJDR3NpRG5RZ0UzSWhFeUFKUVFoS0lRY2dCa0VCYWlFR0lBbEJDR3NoQ1NBSERRQUxDeUFLSUJOQkgzWTJBaXdnRTBGL1NnMEFJQk5CQVhRaENVRUFEQUVMSUFvZ0UwRWNkallDYkNBVFFRUjBJUWxCQVFzaEJpQUtJQWxCSDNZMkFqQWdDaUFKUVFCSUJIOGdDVUVCZEFVZ0NpQUpRUngyTmdKd0lBWkJBV29oQmlBSlFRUjBDeUlIUVI5Mk5nSTBJQW9nQjBFQVNBUi9JQWRCQVhRRklBb2dCMEVjZGpZQ2RDQUdRUUZxSVFZZ0IwRUVkQXNpQjBFZmRqWUNPQ0FLSUFkQkFFZ0VmeUFIUVFGMEJTQUtJQWRCSEhZMkFuZ2dCa0VCYWlFR0lBZEJCSFFMSWdkQkgzWTJBandnQ2lBSFFRQklCSDhnQjBFQmRBVWdDaUFIUVJ4Mk5nSjhJQVpCQVdvaEJpQUhRUVIwQ3lJSFFSOTJOZ0pBSUFvZ0IwRUFTQVIvSUFkQkFYUUZJQW9nQjBFY2RqWUNnQUVnQmtFQmFpRUdJQWRCQkhRTElnZEJIM1kyQWtRZ0NpQUhRUUJJQkg4Z0IwRUJkQVVnQ2lBSFFSeDJOZ0tFQVNBR1FRRnFJUVlnQjBFRWRBc2lCMEVmZGpZQ1NDQUhRUUJJQkg4Z0IwRUJkQVVnQ2lBSFFSeDJOZ0tJQVNBR1FRRnFJUVlnQjBFRWRBc2hCeUFnSUNBb0FoQWdCa0VEYkdwQkNHb2lCallDRUNBZ0lBWkJCM0UyQWdnZ0JpQWdLQUlNUVFOMFN3MERJQ0FnRFNBR1FRTjJhallDQkNBZklBYzJBdFFEQzBFQklRZ2dJQ0FmUWRRRGFoQUNEUUlnSHlnQzFBTWlCa0VEU3cwQ0lBb2dCallDakFGQkFDRUlEQUlMSUNBZ0gwSFVBMm9nRFVFQ1N5SUdFQkVFUUVFQklRZ01BZ3NnRFNBZktBTFVBeUlIVFFSQVFRRWhDQXdDQ3lBS0lBYzJBc0FCSUNBZ0gwSFVBMm9nQmhBUkJFQkJBU0VJREFJTElBMGdIeWdDMUFNaUIwMEVRRUVCSVFnTUFnc2dDaUFITmdMRUFTQWdJQjlCMUFOcUlBWVFFUVJBUVFFaENBd0NDeUFOSUI4b0F0UURJZ2ROQkVCQkFTRUlEQUlMSUFvZ0J6WUN5QUVnSUNBZlFkUURhaUFHRUJFRVFFRUJJUWdNQWdzZ0RTQWZLQUxVQXlJR1RRUkFRUUVoQ0F3Q0N5QUtJQVkyQXN3QkN5QWZJQW9vQXJBQklnbEJBazBFZnlBSlFRSjBRZkFxYWlnQ0FBVkJBd3MyQXRRRFFRQWhCZ0pBQWtBRFFDQWZRUUEyQXRnRElDQWdIMEhZQTJvUUFpRUhBbjhnSHlnQzJBTWlDRUYvUmdSQVFZQ0FnSUI0SUFjTkFSb01CQXNnQncwRElBaEJBV3BCQVhZaUIwRUFJQWRySUFoQkFYRWJDeUVISUFvZ0JrRUNkR29pQ1NBSE93SFFBU0FmUVFBMkF0Z0RJQ0FnSDBIWUEyb1FBaUVJSUFrQ2Z5QWZLQUxZQXlJSlFYOUdCRUJCZ0lDQWdIZ2dDQTBCR2d3REN5QUlEUUlnQ1VFQmFrRUJkaUlIUVFBZ0Iyc2dDVUVCY1JzTElnazdBZElCSUI4Z0h5Z0MxQU1pQjBFQmF6WUMxQU1nQmtFQmFpRUdJQWNOQUFzZ0h5QUtLQUswQVNJR1FRTkpCSDhnQmtFQ2RFSHdLbW9vQWdBRlFRTUxOZ0xVQTBFQUlRWUNRQU5BSUI5QkFEWUMyQU1nSUNBZlFkZ0RhaEFDSVFjQ1FDQWZLQUxZQXlJSVFYOUdCRUJCZ0lDQWdIZ2hDQ0FIUlEwRkRBRUxJQWNOQkNBSVFRRnFRUUYySWdkQkFDQUhheUFJUVFGeEd5RUlDeUFLSUFaQkFuUnFJZ2tnQ0RzQjRBRWdIMEVBTmdMWUF5QWdJQjlCMkFOcUVBSWhCeUFKQW44Z0h5Z0MyQU1pQ1VGL1JnUkFRWUNBZ0lCNElBY05BUm9NQXdzZ0J3MENJQWxCQVdwQkFYWWlCMEVBSUFkcklBbEJBWEViQ3lJSk93SGlBU0FmSUI4b0F0UURJZ2RCQVdzMkF0UURJQVpCQVdvaEJpQUhEUUFMSUI4Z0NUWUMwQU1nSHlBS0tBSzRBU0lHUVFKTkJIOGdCa0VDZEVId0ttb29BZ0FGUVFNTE5nTFVBMEVBSVFZRFFDQWdJQjlCMEFOcUVCQUVRRUVCSVFnTUJRc2dDaUFHUVFKMGFpSUhJQjhvQXRBRE93SHdBU0FnSUI5QjBBTnFFQkFFUUVFQklRZ01CUXNnQnlBZktBTFFBenNCOGdFZ0h5QWZLQUxVQXlJSFFRRnJOZ0xVQXlBR1FRRnFJUVlnQncwQUN5QWZJQW9vQXJ3QklnWkJBazBFZnlBR1FRSjBRZkFxYWlnQ0FBVkJBd3MyQXRRRFFRQWhCZ05BSUNBZ0gwSFFBMm9RRUFSQVFRRWhDQXdGQ3lBS0lBWkJBblJxSWdjZ0h5Z0MwQU03QVlBQ0lDQWdIMEhRQTJvUUVBUkFRUUVoQ0F3RkN5QUhJQjhvQXRBRE93R0NBaUFmSUI4b0F0UURJZ2RCQVdzMkF0UURJQVpCQVdvaEJrRUFJUWdnQncwQUN3d0RDeUFmSUFnMkF0QURRUUVoQ0F3Q0N5QWZJQWMyQXRBRFFRRWhDQXdCQ3lBZklBazJBdEFEUVFFaENBdEJBU0VHSUFnTkF3SkFJQkpCQVVjRVFDQWdJQjlCMkFOcUVBSU5CU0FmS0FMWUF5SUhRVEJQRFFVZ0NrSFFQMEdnUHlBUEd5QUhhaTBBQUNJSE5nSUVJQWRGRFFJTUFRc2dDaUFLS0FJQUlnZEJCMnNpQ0VFQ2RFRndjU0lKUVRCcklBa2dDRUVMU3h0QkQwRUFJQWRCRWtzYmNqWUNCQXNnSDBFQU5nTFlBeUFnSUI5QjJBTnFFQUloQ0NBZktBTFlBeUlIUVg5R0RRTWdDQTBESUFkQkFXcEJBWFlpQ0VFQUlBaHJJQWRCQVhFYklnZEJaa2dOQXlBSFFSbEtEUU1nRVNBeGFpRU1JQW9nQnpZQ0NDQUtLQUlFSVFnQ1FBSkFJQW9vQWdCQkIwa0VRRUVBSVFsQkF5RUdBMEFnQmlFSElBaEJBWEVFUUNBaklBbEJBblJxUWJnTmFpQWdJQ01nQ1VFR2RHcEJPR29nRENBSklDTVFDa0VRRUFZaUJrRVFkallDQUNBR1FROXhEUVFnSXlBSlFRRjBhaUFHUVFSMlFmOEJjVHNCQUNBaklBbEJBWElpRGtFQ2RHcEJ1QTFxSUNBZ0l5QU9RUVowYWtFNGFpQU1JQTRnSXhBS1FSQVFCaUlHUVJCMk5nSUFJQVpCRDNFTkJDQWpJQTVCQVhScUlBWkJCSFpCL3dGeE93RUFJQ01nQ1VFQ2NpSU9RUUowYWtHNERXb2dJQ0FqSUE1QkJuUnFRVGhxSUF3Z0RpQWpFQXBCRUJBR0lnWkJFSFkyQWdBZ0JrRVBjUTBFSUNNZ0RrRUJkR29nQmtFRWRrSC9BWEU3QVFBZ0l5QUpRUU55SWc1QkFuUnFRYmdOYWlBZ0lDTWdEa0VHZEdwQk9Hb2dEQ0FPSUNNUUNrRVFFQVlpQmtFUWRqWUNBQ0FHUVE5eERRUWdDaUFPUVFGMGFpQUdRUVIyUWY4QmNUc0JrQUlMSUFoQkFYWWhDQ0FIUVFGcklRWWdDVUVFYWlFSklBY05BQXNNQVFzZ0lDQk5JQXhCQUNBakVBcEJFQkFHSWdaQkQzRU5BU0FLSUFaQkJIWkIvd0Z4T3dIQUFrRUFJUWxCQXlFR0EwQWdCaUVISUFoQkFYRUVRQ0FqSUFsQkFuUnFRYmdOYWlBZ0lDTWdDVUVHZEdwQlBHb2dEQ0FKSUNNUUNrRVBFQVlpQmtFUGRqWUNBQ0FHUVE5eERRTWdJeUFKUVFGMGFpQUdRUVIyUWY4QmNUc0JBQ0FqSUFsQkFYSWlEa0VDZEdwQnVBMXFJQ0FnSXlBT1FRWjBha0U4YWlBTUlBNGdJeEFLUVE4UUJpSUdRUTkyTmdJQUlBWkJEM0VOQXlBaklBNUJBWFJxSUFaQkJIWkIvd0Z4T3dFQUlDTWdDVUVDY2lJT1FRSjBha0c0RFdvZ0lDQWpJQTVCQm5ScVFUeHFJQXdnRGlBakVBcEJEeEFHSWdaQkQzWTJBZ0FnQmtFUGNRMERJQ01nRGtFQmRHb2dCa0VFZGtIL0FYRTdBUUFnSXlBSlFRTnlJZzVCQW5ScVFiZ05haUFnSUNNZ0RrRUdkR3BCUEdvZ0RDQU9JQ01RQ2tFUEVBWWlCa0VQZGpZQ0FDQUdRUTl4RFFNZ0NpQU9RUUYwYWlBR1FRUjJRZjhCY1RzQmtBSUxJQWhCQVhZaENDQUhRUUZySVFZZ0NVRUVhaUVKSUFjTkFBc0xJQWhCQTNFRVFDQWdJRXhCZjBFRUVBWWlCa0VQY1EwQklBb2dCa0VFZGtIL0FYRTdBY0lDSUNBZ1MwRi9RUVFRQmlJR1FROXhEUUVnQ2lBR1FRUjJRZjhCY1RzQnhBSUxRUUFoQmlBSVFRSnhSUTBBSUNBZ1R5QU1RUkFnSXhBS1FROFFCaUlIUVE5eEJFQWdCeUVHREFFTElBcEJpQkJxSUFkQkQzWTJBZ0FnRmlBSFFRUjJRZjhCY1RzQnNBSWdJQ0E3SUF4QkVTQWpFQXBCRHhBR0lnZEJEM0VFUUNBSElRWU1BUXNnVUNBSFFROTJOZ0lBSUJZZ0IwRUVka0gvQVhFN0FiSUNJQ0FnVVNBTVFSSWdJeEFLUVE4UUJpSUhRUTl4QkVBZ0J5RUdEQUVMSUZJZ0IwRVBkallDQUNBV0lBZEJCSFpCL3dGeE93RzBBaUFnSUdFZ0RFRVRJQ01RQ2tFUEVBWWlCMEVQY1FSQUlBY2hCZ3dCQ3lCaUlBZEJEM1kyQWdBZ0ZpQUhRUVIyUWY4QmNUc0J0Z0lnSUNCaklBeEJGQ0FqRUFwQkR4QUdJZ2RCRDNFRVFDQUhJUVlNQVFzZ1pDQUhRUTkyTmdJQUlCWWdCMEVFZGtIL0FYRTdBYmdDSUNBZ1pTQU1RUlVnSXhBS1FROFFCaUlIUVE5eEJFQWdCeUVHREFFTElHWWdCMEVQZGpZQ0FDQVdJQWRCQkhaQi93RnhPd0c2QWlBZ0lHY2dERUVXSUNNUUNrRVBFQVlpQjBFUGNRUkFJQWNoQmd3QkN5Qm9JQWRCRDNZMkFnQWdGaUFIUVFSMlFmOEJjVHNCdkFJZ0lDQnBJQXhCRnlBakVBcEJEeEFHSWdkQkQzRUVRQ0FISVFZTUFRc2dhaUFIUVE5Mk5nSUFJQllnQjBFRWRrSC9BWEU3QWI0Q0N5QWdJQ0FvQWdnZ0lDZ0NCQ0FnS0FJQWEwRURkR28yQWhBZ0JnMERDMEVBSVRrTElBQW9BZ3dvQWtBaEpDQUFLQUs4Q1NJcElERnFJZzRnRmlnQ0FDSU1OZ0lBSUE0Z0RpZ0N4QUZCQVdvaUJ6WUN4QUVnS3lBcktBSUFJZ2dnS2lBcktBSUVJZ2x3SWdaQkJIUnFJQ29nQm1zaUNrRUlkR28yQWd3Z0t5QUlJQWtnS3lnQ0NHd2lDVUVJZEdvZ0NrRUdkR29nQmtFRGRHb2lCallDRUNBcklBWWdDVUVHZEdvMkFoUUNRQUpBQWtBQ1FBSkFBbjhDUUFKQUFuOENRQUpBQWtBQ2Z3SkFBa0FDUUFKQUFrQUNRQUpBSUF3RVFDQU1RUjlHQkVBZ0tTQXhhaUlHUVFBMkFoUWdCa0VjYWlFSUlBZEJBazhOQWtFWElSb2dIMEVRYWlFR0lCUWhDUU5BSUFoQkVEc0JBQ0FHSUFrb0FnQTZBQUFnQmlBSktBSUVPZ0FCSUFZZ0NTZ0NDRG9BQWlBR0lBa29BZ3c2QUFNZ0JpQUpLQUlRT2dBRUlBWWdDU2dDRkRvQUJTQUdJQWtvQWhnNkFBWWdCaUFKS0FJY09nQUhJQVlnQ1NnQ0lEb0FDQ0FHSUFrb0FpUTZBQWtnQmlBSktBSW9PZ0FLSUFZZ0NTZ0NMRG9BQ3lBR0lBa29BakE2QUF3Z0JpQUpLQUkwT2dBTklBWWdDU2dDT0RvQURpQUdJQWtvQWp3NkFBOGdHaUlIUVFGcklSb2dDRUVDYWlFSUlBWkJFR29oQmlBSlFVQnJJUWtnQncwQUN5QXJJQjlCRUdvUUR3d1ZDeUFwSURGcUloY2dJeWtDQURjQ0hDQVhJQ01wQVM0M0FVb2dGeUJyS1FJb053SkVJQmNnSXlrQ0lEY0NQQ0FYSUNNcEFoZzNBalFnRnlBaktRSVFOd0lzSUJjZ0l5a0NDRGNDSkFKQUlCWW9BZ2dpQmtVTkFBSkFJQVlnTFdvaUxVRUFTQVJBUVRRaEJnd0JDMEZNSVFZZ0xVRTBTQTBCQ3lBR0lDMXFJUzBMSUJkQkhHb2hCeUFYSUMwMkFoUUNRQUpBSUF4QkJrMEVRQ0FITHdFQVJRMEJJQlFnTFVFQUlDZ29BZ0FRQlVVTkFrRUJJUVlNR1F0QnNDb2hHa0VQSVFZZ0Z5OEJUQVJBSUJZb0FvQVBJZ2dnRmlnQzdBNGlDV29pQ2lBV0tBS0VEeUlTSUJZb0F2QU9JaEZxSWc5cklRMGdDU0FJYXlJSUlCRWdFbXNpQ1dzaEVpQUlJQWxxSVJFZ0NpQVBhaUVQSUJZb0F2UU9JZ2dnRmlnQzFBNGlDV29pQ2lBV0tBTDhEaUljSUJZb0F1Z09JaFZxSWhCcklSTWdDU0FJYXlJSUlCVWdIR3NpQ1dzaEhDQUlJQWxxSVJVZ0NpQVFhaUVRSUJZb0F1UU9JZ2dnRmlnQzBBNGlDV29pQ2lBV0tBTDREaUllSUJZb0F0Z09JaUZxSWlKcklSa2dDU0FJYXlJSUlDRWdIbXNpQ1dzaEhpQUlJQWxxSVNFZ0NpQWlhaUVpSUJZb0F0d09JZ2dnRmlnQ3lBNGlDV29pQ2lBV0tBTGdEaUlsSUJZb0Fzd09JaXhxSWk1cklSMGdDU0FJYXlJSUlDd2dKV3NpQ1dzaEpTQUlJQWxxSVN3Z0NpQXVhaUV1SUMxQmdEeHFMUUFBSVFvZ0xVR1FQV290QUFCQkRHeEJ3RHhxS0FJQUlRZ2dGZ0ovSUMxQkRFOEVRQ0FXSUFnZ0NrRUNhM1FpQ0NBUUlDNXFJZ2tnRHlBaWFpSUthMncyQXZnT0lCWWdMaUFRYXlJUUlDSWdEMnNpRDJzZ0NHdzJBdWdPSUJZZ0R5QVFhaUFJYkRZQzJBNGdGaUFKSUFwcUlBaHNOZ0xJRGlBV0lCVWdMR29pQ1NBUklDRnFJZ3BySUFoc05nTDhEaUFXSUN3Z0ZXc2lEeUFoSUJGckloRnJJQWhzTmdMc0RpQVdJQThnRVdvZ0NHdzJBdHdPSUJZZ0NTQUthaUFJYkRZQ3pBNGdGaUFjSUNWcUlna2dFaUFlYWlJS2F5QUliRFlDZ0E4Z0ZpQWxJQnhySWhFZ0hpQVNheUlTYXlBSWJEWUM4QTRnRmlBUklCSnFJQWhzTmdMZ0RpQVdJQWtnQ21vZ0NHdzJBdEFPSUJZZ0hTQVRheUlKSUJrZ0RXc2lDbXNnQ0d3MkF2UU9JQllnQ1NBS2FpQUliRFlDNUE0Z0ZpQU5JQmxxSWdrZ0V5QWRhaUlLYWlBSWJEWUMxQTRnQ2lBSmF5QUliQXdCQ3lBV1FRRkJBaUF0UVFaclFRWkpHeUlKSUJBZ0xtb2lKaUFQSUNKcUlqTnJJQWhzYWtFQ0lBcHJJZ3AxTmdMNERpQVdJQzRnRUdzaUVDQWlJQTlySWc5cklBaHNJQWxxSUFwMU5nTG9EaUFXSUE4Z0VHb2dDR3dnQ1dvZ0NuVTJBdGdPSUJZZ0ppQXphaUFJYkNBSmFpQUtkVFlDeUE0Z0ZpQVZJQ3hxSWc4Z0VTQWhhaUlRYXlBSWJDQUphaUFLZFRZQy9BNGdGaUFzSUJWckloVWdJU0FSYXlJUmF5QUliQ0FKYWlBS2RUWUM3QTRnRmlBUklCVnFJQWhzSUFscUlBcDFOZ0xjRGlBV0lBOGdFR29nQ0d3Z0NXb2dDblUyQXN3T0lCWWdIQ0FsYWlJUklCSWdIbW9pRDJzZ0NHd2dDV29nQ25VMkFvQVBJQllnSlNBY2F5SWNJQjRnRW1zaUVtc2dDR3dnQ1dvZ0NuVTJBdkFPSUJZZ0VpQWNhaUFJYkNBSmFpQUtkVFlDNEE0Z0ZpQVBJQkZxSUFoc0lBbHFJQXAxTmdMUURpQVdJQjBnRTJzaUVpQVpJQTFySWhGcklBaHNJQWxxSUFwMU5nTDBEaUFXSUJFZ0Vtb2dDR3dnQ1dvZ0NuVTJBdVFPSUJZZ0RTQVphaUlOSUJNZ0hXb2lFbW9nQ0d3Z0NXb2dDblUyQXRRT0lCSWdEV3NnQ0d3Z0NXb2dDblVMTmdLRUR3c2dGQ0VKSUNnaENBTkFJQVloQ2lBSklCWWdHaWdDQUVFQ2RHcEJ5QTVxS0FJQUlnWTJBZ0FDUUFKQUlBWkZCRUFnQnk4QkFFVU5BUXRCQVNFR0lBa2dGeWdDRkVFQklBZ29BZ0FRQlVVTkFRd2JDeUFKUWYvLy93YzJBZ0FMSUJwQkJHb2hHaUFLUVFGcklRWWdDRUVFYWlFSUlBZEJBbW9oQnlBSlFVQnJJUWtnQ2cwQUN3d0VDeUFVUWYvLy93YzJBZ0FMQWtBZ0Z5OEJIZ1JBSUVvZ0Z5Z0NGRUVBSUJZb0Fzd1BFQVZGRFFGQkFTRUdEQmdMSUVwQi8vLy9CellDQUFzQ1FDQVhMd0VnQkVBZ1NTQVhLQUlVUVFBZ0ZpZ0MwQThRQlVVTkFVRUJJUVlNR0FzZ1NVSC8vLzhITmdJQUN3SkFJQmN2QVNJRVFDQklJQmNvQWhSQkFDQVdLQUxVRHhBRlJRMEJRUUVoQmd3WUN5QklRZi8vL3djMkFnQUxBa0FnRnk4QkpBUkFJRWNnRnlnQ0ZFRUFJQllvQXRnUEVBVkZEUUZCQVNFR0RCZ0xJRWRCLy8vL0J6WUNBQXNDUUNBWEx3RW1CRUFnUmlBWEtBSVVRUUFnRmlnQzNBOFFCVVVOQVVFQklRWU1HQXNnUmtILy8vOEhOZ0lBQ3dKQUlCY3ZBU2dFUUNCRklCY29BaFJCQUNBV0tBTGdEeEFGUlEwQlFRRWhCZ3dZQ3lCRlFmLy8vd2MyQWdBTEFrQWdGeThCS2dSQUlFUWdGeWdDRkVFQUlCWW9BdVFQRUFWRkRRRkJBU0VHREJnTElFUkIvLy8vQnpZQ0FBc0NRQ0FYTHdFc0JFQWdReUFYS0FJVVFRQWdGaWdDNkE4UUJVVU5BVUVCSVFZTUdBc2dRMEgvLy84SE5nSUFDd0pBSUJjdkFTNEVRQ0JDSUJjb0FoUkJBQ0FXS0FMc0R4QUZSUTBCUVFFaEJnd1lDeUJDUWYvLy93YzJBZ0FMQWtBZ0Z5OEJNQVJBSUVFZ0Z5Z0NGRUVBSUJZb0F2QVBFQVZGRFFGQkFTRUdEQmdMSUVGQi8vLy9CellDQUFzQ1FDQVhMd0V5QkVBZ1FDQVhLQUlVUVFBZ0ZpZ0M5QThRQlVVTkFVRUJJUVlNR0FzZ1FFSC8vLzhITmdJQUN3SkFJQmN2QVRRRVFDQS9JQmNvQWhSQkFDQVdLQUw0RHhBRlJRMEJRUUVoQmd3WUN5QS9RZi8vL3djMkFnQUxBa0FnRnk4Qk5nUkFJRDRnRnlnQ0ZFRUFJQllvQXZ3UEVBVkZEUUZCQVNFR0RCZ0xJRDVCLy8vL0J6WUNBQXNDUUNBWEx3RTRCRUFnT2lBWEtBSVVRUUFnRmlnQ2dCQVFCVVVOQVVFQklRWU1HQXNnT2tILy8vOEhOZ0lBQ3lBWEx3RTZCRUFnTmlFSUlCc2hDU0EzSUJjb0FoUkJBQ0FXS0FLRUVCQUZSUTBEUVFFaEJnd1hDeUEzUWYvLy93YzJBZ0FnTmlFSUlCc2hDUXdDQ3lBcElERnFJZ1pDQURjQ0hDQUdJQzAyQWhRZ0JrSUFOd0ZLSUFaQ0FEY0NSQ0FHUWdBM0Fqd2dCa0lBTndJMElBWkNBRGNDTENBR1FnQTNBaVFnSHlBcktBSUVJZ1kyQXR3RElCOGdLeWdDQ0RZQzRBTWdLaUFHYmlJSFFRUjBJUmtnS2lBR0lBZHNhMEVFZENFZVFRQWhIQXdDQ3lBSVFSQTdBUUFnQmtFUU93RktJQVpCa0lEQUFEWUJSaUFHUXBDQXdJQ0Fnb0FJTndFK0lBWkNrSURBZ0lDQ2dBZzNBVFlnQmtLUWdNQ0FnSUtBQ0RjQkxpQUdRcENBd0lDQWdvQUlOd0VtSUFaQ2tJREFnSUNDZ0FnM0FSNE1FZ3NnRnlnQ0dDQVhLQUlVYWlJR1FUTWdCa0V6U0JzaUJrRUFJQVpCQUVvYklnZEJBblJCMEQxcUtBSUFJUW9DUUFKQUlCY3ZBVTROQUNBWEx3RlFEUUFnVENnQ0FDRUhEQUVMSUFwQmtEMXFMUUFBUVF4c1FjQThhaWdDQUNFR1FRRWhFeUFIUVFaclFTMU5CRUJCQUNFVElBWWdDa0dBUEdvdEFBQkJBV3QwSVFZTElCWWdGaWdDaUE4aUJ5QVdLQUtRRHlJTmF5SVNJQllvQW93UEloRWdGaWdDbEE4aUQyc2lHbXNnQm13Z0UzVTJBcFFQSUJZZ0VpQWFhaUFHYkNBVGRUWUNrQThnRmlBSElBMXFJZ2NnRHlBUmFpSU5heUFHYkNBVGRUWUNqQThnRmlBSElBMXFJQVpzSUJOMUlnYzJBb2dQSUJZZ0ZpZ0NwQThpRFNBV0tBS2NEeUlTYWlJUklCWW9BcUFQSWc4Z0ZpZ0NtQThpR21vaUhHb2dCbXdnRTNVMkFwZ1BJQllnRWlBTmF5SU5JQm9nRDJzaUVtb2dCbXdnRTNVMkFxQVBJQllnSENBUmF5QUdiQ0FUZFRZQ25BOGdGaUFTSUExcklBWnNJQk4xTmdLa0R3c2dDU0FITmdJQUFrQUNRQ0FIUlFSQUlCY3ZBVHhGRFFFTFFRRWhCaUFKSUFwQkFTQUlLQUlBRUFWRkRRRU1GUXNnQ1VILy8vOEhOZ0lBQ3lBSklCWW9Bb3dQSWdZMkFrQWdDVUZBYXlFSEFrQUNRQ0FHUlFSQUlCY3ZBVDVGRFFFTFFRRWhCaUFISUFwQkFTQUlLQUlFRUFWRkRRRU1GUXNnQjBILy8vOEhOZ0lBQ3lBSklCWW9BcEFQSWdZMkFvQUJJQWxCZ0FGcUlRY0NRQUpBSUFaRkJFQWdGMEZBYXk4QkFFVU5BUXRCQVNFR0lBY2dDa0VCSUFnb0FnZ1FCVVVOQVF3VkN5QUhRZi8vL3djMkFnQUxJQWtnRmlnQ2xBOGlCallDd0FFZ0NVSEFBV29oQndKQUFrQWdCa1VFUUNBWEx3RkNSUTBCQzBFQklRWWdCeUFLUVFFZ0NDZ0NEQkFGUlEwQkRCVUxJQWRCLy8vL0J6WUNBQXNnQ1NCTEtBSUFJZ1kyQW9BQ0lBbEJnQUpxSVFjQ1FBSkFJQVpGQkVBZ0Z5OEJSRVVOQVF0QkFTRUdJQWNnQ2tFQklBZ29BaEFRQlVVTkFRd1ZDeUFIUWYvLy93YzJBZ0FMSUFrZ0ZpZ0NuQThpQmpZQ3dBSWdDVUhBQW1vaEJ3SkFBa0FnQmtVRVFDQVhMd0ZHUlEwQkMwRUJJUVlnQnlBS1FRRWdDQ2dDRkJBRlJRMEJEQlVMSUFkQi8vLy9CellDQUFzZ0NTQVdLQUtnRHlJR05nS0FBeUFKUVlBRGFpRUhBa0FDUUNBR1JRUkFJQmN2QVVoRkRRRUxRUUVoQmlBSElBcEJBU0FJS0FJWUVBVkZEUUVNRlFzZ0IwSC8vLzhITmdJQUN5QUpJQllvQXFRUElnWTJBc0FESUFsQndBTnFJUWNDUUFKQUlBWkZCRUFnRnk4QlNrVU5BUXRCQVNFR0lBY2dDa0VCSUFnb0Fod1FCVVVOQVF3VkN5QUhRZi8vL3djMkFnQUxJQXhCQms4RVFDQU9JUWtnSDBFUWFpRVpRUUFoRTBFQUlROGpBRUhRQUdzaUVDUUFBa0FnS2tVTkFDQXJLQUlBSWcwZ0tpQXJLQUlFSWdwdUloRWdDbXdpQmtFSWRHb2dLaUFHYXlJTVFRUjBhaUVJSUFwQkJIUWhCeUFyS0FJSUlRNGdFRUVnYWlFU0lBb2dLa3NpR2tVRVFDQVFJQWdnQjBGL2Myb2lCaTBBQURvQUlDQVFJQWdnQjJzdEFBQTZBQ0VnRUNBR0xRQUNPZ0FpSUJBZ0JpMEFBem9BSXlBUUlBWXRBQVE2QUNRZ0VDQUdMUUFGT2dBbElCQWdCaTBBQmpvQUppQVFJQVl0QUFjNkFDY2dFQ0FHTFFBSU9nQW9JQkFnQmkwQUNUb0FLU0FRSUFZdEFBbzZBQ29nRUNBR0xRQUxPZ0FySUJBZ0JpMEFERG9BTENBUUlBWXRBQTA2QUMwZ0VDQUdMUUFPT2dBdUlCQWdCaTBBRHpvQUx5QVFJQVl0QUJBNkFEQWdFQ0FHTFFBUk9nQXhJQkFnQmkwQUVqb0FNaUFRSUFZdEFCTTZBRE1nRUNBR0xRQVVPZ0EwSUJCQk5Xb2hFZ3NnQ2lBT2JDRU9JQXdFZnlBUUlBaEJBV3NpQmkwQUFEb0FBQ0FRSUFZZ0Iyb2lCaTBBQURvQUFTQVFJQVlnQjJvaUJpMEFBRG9BQWlBUUlBWWdCMm9pQmkwQUFEb0FBeUFRSUFZZ0Iyb2lCaTBBQURvQUJDQVFJQVlnQjJvaUJpMEFBRG9BQlNBUUlBWWdCMm9pQmkwQUFEb0FCaUFRSUFZZ0Iyb2lCaTBBQURvQUJ5QVFJQVlnQjJvaUJpMEFBRG9BQ0NBUUlBWWdCMm9pQmkwQUFEb0FDU0FRSUFZZ0Iyb2lCaTBBQURvQUNpQVFJQVlnQjJvaUJpMEFBRG9BQ3lBUUlBWWdCMm9pQmkwQUFEb0FEQ0FRSUFZZ0Iyb2lCaTBBQURvQURTQVFJQVlnQjJvaUJpMEFBRG9BRGlBUUlBWWdCMm90QUFBNkFBOGdFRUVRYWdVZ0VBc2hCaUFOSUE1QkNIUnFJQkVnQ2tFRGRDSUhiRUVEZEdvZ0RFRURkR29oRFNBSFFmai8vLzhIY1NFSElCcEZCRUFnRWlBTklBZEJmM05xSWdndEFBQTZBQUFnRWlBTklBZHJMUUFBT2dBQklCSWdDQzBBQWpvQUFpQVNJQWd0QUFNNkFBTWdFaUFJTFFBRU9nQUVJQklnQ0MwQUJUb0FCU0FTSUFndEFBWTZBQVlnRWlBSUxRQUhPZ0FISUJJZ0NFRUlhaUlJTFFBQU9nQUlJQklnRGtFR2RDQUlhaUlJUVFockxRQUFPZ0FKSUJJZ0NFRUhheTBBQURvQUNpQVNJQWhCQm1zdEFBQTZBQXNnRWlBSVFRVnJMUUFBT2dBTUlCSWdDRUVFYXkwQUFEb0FEU0FTSUFoQkEyc3RBQUE2QUE0Z0VpQUlRUUpyTFFBQU9nQVBJQklnQ0VFQmF5MEFBRG9BRUNBU0lBZ3RBQUE2QUJFTElBeEZEUUFnQmlBTlFRRnJJZ2d0QUFBNkFBQWdCaUFISUFocUlnZ3RBQUE2QUFFZ0JpQUhJQWhxSWdndEFBQTZBQUlnQmlBSElBaHFJZ2d0QUFBNkFBTWdCaUFISUFocUlnZ3RBQUE2QUFRZ0JpQUhJQWhxSWdndEFBQTZBQVVnQmlBSElBaHFJZ2d0QUFBNkFBWWdCaUFISUFocUlnZ3RBQUE2QUFjZ0JpQUhJQWhxSUE0Z0NtdEJCblJxSWdndEFBQTZBQWdnQmlBSElBaHFJZ2d0QUFBNkFBa2dCaUFISUFocUlnZ3RBQUE2QUFvZ0JpQUhJQWhxSWdndEFBQTZBQXNnQmlBSElBaHFJZ2d0QUFBNkFBd2dCaUFISUFocUlnZ3RBQUE2QUEwZ0JpQUhJQWhxSWdndEFBQTZBQTRnQmlBSElBaHFMUUFBT2dBUEN3SkFBa0FnQ1NnQ0FDSUtRUWRQQkVBQ1FDQUpLQUxJQVNJR1JRUkFRUUFoQ0NBa1FRQkhJUklNQVFzZ0pFRUFSeUVTSUFrb0FnUWlCeUFHS0FJRUlneEdJUWdnQnlBTVJ3MEFJQ1JGRFFCQkFDQUlJQVlvQWdCQkJra2JJUWhCQVNFU0MwRUFJUkVDUUNBSktBTE1BU0lHUlEwQUlBa29BZ1FnQmlnQ0JFWWlFU0FTY1VVTkFFRUFJQkVnQmlnQ0FFRUdTUnNoRVFzQ1FDQUpLQUxVQVNJR1JRMEFJQWtvQWdRZ0JpZ0NCRVlpRHlBU2NVVU5BQ0FHS0FJQVFRVkxJUThMUVFFaEJ3SkFBa0FDUUFKQUFrQWdDa0VCYWtFRGNRNERBQUVDQXdzZ0VVVU5Ca0VBSVJFZ0VDMEFNQ0VHSUJBdEFDOGhCeUFRTFFBdUlRZ2dFQzBBTFNFS0lCQXRBQ3doRENBUUxRQXJJUTRnRUMwQUtpRU5JQkF0QUNraEVpQVFMUUFvSVE4Z0VDMEFKeUVhSUJBdEFDWWhIQ0FRTFFBbElSY2dFQzBBSkNFVklCQXRBQ01oSGlBUUxRQWlJU0VnRUMwQUlTRWlJQmtoRXdOQUlCTWdCam9BRHlBVElBYzZBQTRnRXlBSU9nQU5JQk1nQ2pvQURDQVRJQXc2QUFzZ0V5QU9PZ0FLSUJNZ0RUb0FDU0FUSUJJNkFBZ2dFeUFQT2dBSElCTWdHam9BQmlBVElCdzZBQVVnRXlBWE9nQUVJQk1nRlRvQUF5QVRJQjQ2QUFJZ0V5QWhPZ0FCSUJNZ0lqb0FBQ0FUUVJCcUlSTWdFVUVCYWlJUlFSQkhEUUFMREFNTElBaEZEUVVnR1NBUU1RQUFRb0dDaElpUW9NQ0FBWDRpYmpjQUNDQVpJRzQzQUFBZ0dTQVFNUUFCUW9HQ2hJaVFvTUNBQVg0aWJqY0FHQ0FaSUc0M0FCQWdHU0FRTVFBQ1FvR0NoSWlRb01DQUFYNGliamNBS0NBWklHNDNBQ0FnR1NBUU1RQURRb0dDaElpUW9NQ0FBWDRpYmpjQU9DQVpJRzQzQURBZ0dTQVFNUUFFUW9HQ2hJaVFvTUNBQVg0aWJqY0FTQ0FaSUc0M0FFQWdHU0FRTVFBRlFvR0NoSWlRb01DQUFYNGliamNBV0NBWklHNDNBRkFnR1NBUU1RQUdRb0dDaElpUW9NQ0FBWDRpYmpjQWFDQVpJRzQzQUdBZ0dTQVFNUUFIUW9HQ2hJaVFvTUNBQVg0aWJqY0FlQ0FaSUc0M0FIQWdHU0FRTVFBSVFvR0NoSWlRb01DQUFYNGliamNBaUFFZ0dTQnVOd0NBQVNBWklCQXhBQWxDZ1lLRWlKQ2d3SUFCZmlKdU53Q1lBU0FaSUc0M0FKQUJJQmtnRURFQUNrS0Jnb1NJa0tEQWdBRitJbTQzQUtnQklCa2diamNBb0FFZ0dTQVFNUUFMUW9HQ2hJaVFvTUNBQVg0aWJqY0F1QUVnR1NCdU53Q3dBU0FaSUJBeEFBeENnWUtFaUpDZ3dJQUJmaUp1TndESUFTQVpJRzQzQU1BQklCa2dFREVBRFVLQmdvU0lrS0RBZ0FGK0ltNDNBTmdCSUJrZ2JqY0EwQUVnR1NBUU1RQU9Rb0dDaElpUW9NQ0FBWDRpYmpjQTZBRWdHU0J1TndEZ0FTQVpJQkF4QUE5Q2dZS0VpSkNnd0lBQmZpSnVOd0Q0QVNBWklHNDNBUEFCREFJTElCa0Nmd0pBSUFoRkRRQWdFVVVOQUNBUUxRQVBJQkF0QURBZ0VDMEFEaUFRTFFBdklCQXRBQTBnRUMwQUxpQVFMUUFNSUJBdEFDMGdFQzBBQ3lBUUxRQXNJQkF0QUFvZ0VDMEFLeUFRTFFBSklCQXRBQ29nRUMwQUNDQVFMUUFwSUJBdEFBY2dFQzBBS0NBUUxRQUdJQkF0QUNjZ0VDMEFCU0FRTFFBbUlCQXRBQVFnRUMwQUpTQVFMUUFESUJBdEFDUWdFQzBBQWlBUUxRQWpJQkF0QUFFZ0VDMEFJaUFRTFFBaElCQXRBQUJxYW1wcWFtcHFhbXBxYW1wcWFtcHFhbXBxYW1wcWFtcHFhbXBxYW1wcVFSQnFRUVYyREFFTElBZ0VRQ0FRTFFBUElCQXRBQTRnRUMwQURTQVFMUUFNSUJBdEFBc2dFQzBBQ2lBUUxRQUpJQkF0QUFnZ0VDMEFCeUFRTFFBR0lCQXRBQVVnRUMwQUJDQVFMUUFESUJBdEFBSWdFQzBBQUNBUUxRQUJhbXBxYW1wcWFtcHFhbXBxYW1wcVFRaHFRUVIyREFFTFFZQUJJQkZGRFFBYUlCQXRBREFnRUMwQUx5QVFMUUF1SUJBdEFDMGdFQzBBTENBUUxRQXJJQkF0QUNvZ0VDMEFLU0FRTFFBb0lCQXRBQ2NnRUMwQUppQVFMUUFsSUJBdEFDUWdFQzBBSXlBUUxRQWhJQkF0QUNKcWFtcHFhbXBxYW1wcWFtcHFhbXBCQ0dwQkJIWUxRWUFDRUFNYURBRUxJQWhCQUVjZ0VVRUFSM0VnRDNGRkRRTWdFQzBBQ0NBUUxRQUdheUFRTFFBUElnWWdFQzBBSUNJSGEwRURkR29nRUMwQUNTQVFMUUFGYTBFQmRHb2dFQzBBQ2lBUUxRQUVhMEVEYkdvZ0VDMEFDeUFRTFFBRGEwRUNkR29nRUMwQURDQVFMUUFDYTBFRmJHb2dFQzBBRFNBUUxRQUJhMEVHYkdvZ0VDMEFEaUFRTFFBQWEwRUhiR3BCQld4QklHcEJCblVoQ2lBUUxRQXBJQkF0QUNkcklCQXRBQ29nRUMwQUptdEJBWFJxSUJBdEFDc2dFQzBBSld0QkEyeHFJQkF0QUN3Z0VDMEFKR3RCQW5ScUlCQXRBQzBnRUMwQUkydEJCV3hxSUJBdEFDNGdFQzBBSW10QkJteHFJQkF0QUM4Z0VDMEFJV3RCQjJ4cUlCQXRBREFpRENBSGEwRURkR3BCQld4QklHcEJCblVpQ0VFRGRDRU9JQWhCQjJ3aERTQUlRUVpzSVJFZ0NFRUZiQ0VQSUFoQkEyd2hHaUFJUVgxc0lSTWdDRUY3YkNFY0lBaEJlbXdoRnlBSVFYbHNJUlZCQUNBSVFRRjBJaDVySVNGQkFDQUlRUUowSWlKcklTa2dCaUFNYWtFRWRFRVFhaUVNUVFBaEVnTkFJQmtnRWtFRWRHb2lCaUFNSUJKQkIyc2dDbXhxSWdkQkJYVWlIVUgvQVNBZFFmOEJTQnNpSFVFQUlCMUJBRW9iT2dBSElBWWdCeUFYYWtFRmRTSWRRZjhCSUIxQi93RklHeUlkUVFBZ0hVRUFTaHM2QUFFZ0JpQUhJQlZxUVFWMUloMUIvd0VnSFVIL0FVZ2JJaDFCQUNBZFFRQktHem9BQUNBR0lBY2dIR3BCQlhVaUhVSC9BU0FkUWY4QlNCc2lIVUVBSUIxQkFFb2JPZ0FDSUFZZ0J5QXBha0VGZFNJZFFmOEJJQjFCL3dGSUd5SWRRUUFnSFVFQVNoczZBQU1nQmlBSElCTnFRUVYxSWgxQi93RWdIVUgvQVVnYkloMUJBQ0FkUVFCS0d6b0FCQ0FHSUFjZ0lXcEJCWFVpSFVIL0FTQWRRZjhCU0JzaUhVRUFJQjFCQUVvYk9nQUZJQVlnQnlBSWEwRUZkU0lkUWY4QklCMUIvd0ZJR3lJZFFRQWdIVUVBU2hzNkFBWWdCaUFISUFocVFRVjFJaDFCL3dFZ0hVSC9BVWdiSWgxQkFDQWRRUUJLR3pvQUNDQUdJQWNnSG1wQkJYVWlIVUgvQVNBZFFmOEJTQnNpSFVFQUlCMUJBRW9iT2dBSklBWWdCeUFhYWtFRmRTSWRRZjhCSUIxQi93RklHeUlkUVFBZ0hVRUFTaHM2QUFvZ0JpQUhJQ0pxUVFWMUloMUIvd0VnSFVIL0FVZ2JJaDFCQUNBZFFRQktHem9BQ3lBR0lBY2dEMnBCQlhVaUhVSC9BU0FkUWY4QlNCc2lIVUVBSUIxQkFFb2JPZ0FNSUFZZ0J5QVJha0VGZFNJZFFmOEJJQjFCL3dGSUd5SWRRUUFnSFVFQVNoczZBQTBnQmlBSElBMXFRUVYxSWgxQi93RWdIVUgvQVVnYkloMUJBQ0FkUVFCS0d6b0FEaUFHSUFjZ0RtcEJCWFVpQmtIL0FTQUdRZjhCU0JzaUJrRUFJQVpCQUVvYk9nQVBJQkpCQVdvaUVrRVFSdzBBQ3dzZ0dTQVdRY2dDYWtFQUVBc2dHU0FXUVlnRGFrRUJFQXNnR1NBV1FjZ0Rha0VDRUFzZ0dTQVdRWWdFYWtFREVBc2dHU0FXUWNnRWFrRUVFQXNnR1NBV1FZZ0Zha0VGRUFzZ0dTQVdRY2dGYWtFR0VBc2dHU0FXUVlnR2FrRUhFQXNnR1NBV1FjZ0dha0VJRUFzZ0dTQVdRWWdIYWtFSkVBc2dHU0FXUWNnSGFrRUtFQXNnR1NBV1FZZ0lha0VMRUFzZ0dTQVdRY2dJYWtFTUVBc2dHU0FXUVlnSmFrRU5FQXNnR1NBV1FjZ0pha0VPRUFzZ0dTQVdRWWdLYWtFUEVBc01BUXNnQ1VISUFXb2hDaUFKUWN3QmFpRU1JQWxCMEFGcUlRNGdDVUhVQVdvaERRTkFJQW9oQnlBSklRaEJBQ0VHUVFBaEVRSkFBa0FDUUFKQUFrQUNRQ0FUUVFOMEloSkJvQ3RxS1FNQUltNm5EZ1VEQUFFQ0JBVUxJQXdoQnd3Q0N5QU9JUWNNQVFzZ0RTRUhDeUFIS0FJQUlnZ05BQXdCQ3lBSktBSUVJZ1lnQ0NnQ0JDSUhSaUVSQWtBZ0JpQUhSdzBBSUNSRkRRQkJBQ0FSSUFnb0FnQkJCa2tiSVJFTElBZ2hCZ3NnQ2lFSElBa2hDQUpBQWtBQ1FBSkFBa0FDUUFKQUlCSkI0Q3hxS1FNQUltK25EZ1VEQUFFQ0JRUUxJQXdoQnd3Q0N5QU9JUWNNQVFzZ0RTRUhDeUFIS0FJQUlnZ05BUXRCQUNFaElCRkJBRWNoRjBFQ0lRZEJBQ0VwREFFTElBa29BZ1FpQnlBSUtBSUVJZzlHSVJ3Q1FDQUhJQTlIRFFBZ0pFVU5BRUVBSUJ3Z0NDZ0NBRUVHU1JzaEhBdEJBQ0VoSUJ4QkFFY2hLU0FSUVFCSElSZEJBaUVISUJGRkRRQWdIRVVOQUVFQ0lSRUNmeUFHS0FJQVFRWkdCRUFnQmlCdVFpQ0lwMEgvQVhGcUxRQlNJUWNMSUFjTEFuOGdDQ2dDQUVFR1JnUkFJQWdnYjBJZ2lLZEIvd0Z4YWkwQVVpRVJDeUFSQ3lBSElCRkpHeUVIUVFFaElVRUJJU2xCQVNFWEN5QVdJQk5CQW5RaUVXb2lCaWdDREVVRVFDQUdLQUpNSWdZZ0JpQUhUMm9oQndzZ0NTQVRhaUFIT2dCU1FRQWhGU0FLSVFZZ0NTRUlRUUFoSGdKQUFrQUNRQUpBQWtBQ1FDQVNRYUF1YWlnQ0FBNEZBd0FCQWdRRkN5QU1JUVlNQWdzZ0RpRUdEQUVMSUEwaEJnc2dCaWdDQUNJSVJRMEJDeUFKS0FJRUlnWWdDQ2dDQkNJUFJpRWVJQVlnRDBjTkFDQWtSUTBBUVFBZ0hpQUlLQUlBUVFaSkd5RWVDeUFLSVFZZ0NTRUlBa0FDUUFKQUFrQUNRQUpBSUJKQjRDOXFLQUlBRGdVREFBRUNCQVVMSUF3aEJnd0NDeUFPSVFZTUFRc2dEU0VHQ3lBR0tBSUFJZ2hGRFFFTElBa29BZ1FpQmlBSUtBSUVJaEpHSVJVZ0JpQVNSdzBBSUNSRkRRQkJBQ0FWSUFnb0FnQkJCa2tiSVJVTElCRkI4Q2xxS0FJQUlTWWdFVUd3S1dvb0FnQWhNd0pBUVlVS0lCTjJRUUZ4SWk0RVFDQVFJQ1pxSWhGQkEyb2hFaUFSUVFKcUlRZ2dFVUVCYWlFR0RBRUxJQ1pCQkhRZ00yb2dHV29pRVVFdmFpRVNJQkZCSDJvaENDQVJRUTlxSVFZZ0VVRUJheUVSQ3lBSUxRQUFJUjBnRWkwQUFDRUlJQVl0QUFBaEpTQVJMUUFBSVN3Q1FFRXpJQk4yUVFGeEJFQWdFRUVnYWlBemFpSVJMUUFJSVE4Z0VTMEFCeUV3SUJFdEFBWWhJaUFSTFFBRklUVWdFUzBBQkNFU0lCRXRBQU1oSENBUkxRQUNJUm9nRVMwQUFTRUdEQUVMSUJrZ0prRUJheUpUUVFSMElETnFhaUlSTFFBQUlRWWdFUzBBQnlFUElCRXRBQVloTUNBUkxRQUZJU0lnRVMwQUJDRTFJQkV0QUFNaEVpQVJMUUFDSVJ3Z0VTMEFBU0VhSUM0RVFDQVFJRk5xSVJFTUFRc2dFVUVCYXlFUkN5QVJMUUFBSVM0Q1FBSkFBa0FDUUFKQUFrQUNRQUpBQWtBQ1FDQUhEZ2dBQVFJREJBVUdCd2dMSUNsRkJFQkJBU0VIREF3TElBWkIvd0Z4SUJwQi93RnhRUWgwY2lBY1FmOEJjVUVRZEhJZ0VrRVlkSEloS1NBR0lnY2hIaUFhSWhjaElTQWNJaEVoQ0NBU0loVWhEd3dJQ3lBWFJRUkFRUUVoQnd3TEN5QUlRWUdDaEFoc0lTa2dIVUdCZ29RSWJDSWVRUmgySVE4Z0hrRVFkaUVJSUI1QkNIWWhJU0FsUVlHQ2hBaHNJZ1pCR0hZaEZTQUdRUkIySVJFZ0JrRUlkaUVYSUN4QmdZS0VDR3dpQjBFWWRpRVNJQWRCRUhZaEhDQUhRUWgySVJvTUJ3c0NmeUFsSUN4cUlBaHFJQjFxSUJKQi93RnhhaUFjUWY4QmNXb2dHa0gvQVhGcUlBWkIvd0Z4YWtFRWFrSDQvd054UVFOMklDRU5BQm9nSlNBc2FpQUlhaUFkYWtFQ2FrRUNkaUFYRFFBYVFZQUJJQ2xGRFFBYUlCSkIvd0Z4SUJ4Qi93RnhhaUFhUWY4QmNXb2dCa0gvQVhGcVFRSnFRUUoyQ3lJSFFmOEJjVUdCZ29RSWJDRXBJQWNpR2lJY0loSWlCaUVYSUFZaUVTSVZJaDRpSVNJSUlROE1CZ3NnS1VVRVFFRUJJUWNNQ1FzZ0hrVUVRQ0FTSWc4aU1DSWlJVFVMSUNKQi93RnhJZ2NnRDBIL0FYRWlFV29nTUVIL0FYRWlEMEVCZEdwQkFtb2lGMEVPZEVHQWdQd0hjU0FTUWY4QmNTSWVRUUpxSWlFZ0Iyb2dOVUgvQVhFaUNFRUJkR3BCQW5ZaUVpQVBRUUpxSWc4Z0NHb2dCMEVCZEdwQkFuWWlGVUVJZEhKQi8vOERjWElnRHlBUlFRTnNha0VXZEVHQWdJQjRjWEloS1NBWFFRSjJJUThnSEVIL0FYRWlFVUVDYWlJY0lBWkIvd0Z4YWlBYVFmOEJjU0lHUVFGMGFrRUNkaUVISUFZZ0lXb2dFVUVCZEdwQkFuWWlHaUVHSUJ3Z0hrRUJkR29nQ0dwQkFuWWlIQ0VYSUJ3aEhpQVNJaEVoSVNBVklRZ01CUXRCQVNFSElDRWdGVUVBUjNGRkRRY2dMQ0FsUVFGMGFpQWRha0VDYWlJUlFRWjBRWUQrQTNFZ0JrSC9BWEVpRDBFQ2FpSVhJQ3hxSUM1QkFYUnFRUUoySWdkQkdIUWdKVUVDYWlJR0lDeEJBWFJxSUM1cVFRSjJJaUZCRUhSeWNpQUdJQWhxSUIxQkFYUnFRUUoyY2lFcElCcEIvd0Z4SWdoQkFtb2lHaUFTUWY4QmNXb2dIRUgvQVhFaUhFRUJkR3BCQW5ZaEVpQVJRUUoySVI0Z0lTRUdJQm9nRDBFQmRHb2dMbXBCQW5ZaUdpRVJJQWhCQVhRZ0hHb2dGMnBCQW5ZaUhDRVZJQWNpRnlFSUlCb2hEd3dFQzBFQklRY2dJU0FWUVFCSGNVVU5CaUFhUWY4QmNTSVBRUUpxSWdjZ0JrSC9BWEVpQ0VFQmRHb2dMbXBCQW5ZaUYwRVFkQ0FJUVFKcUlnWWdMR29nTGtFQmRHb2lHa0VHZEVHQS9nTnhjaUFHSUJ4Qi93RnhJZ1lnRDBFQmRHcHFRUUoySWhGQkdIUnlJQ3dnSlVFQmRHb2dIV3BCQW1wQkFuWnlJU2tnQmtFQmFpSWNJQkpCL3dGeEloVnFRUUYySVJJZ0pTQXNRUUYwYWlBdWFrRUNha0VDZGlFZUlBY2dGV29nQmtFQmRHcEJBblloRlNBYVFRSjJJUVlnQ0NBdWFrRUJha0VCZGlJSElTRWdDQ0FQYWtFQmFrRUJkaUlhSVFnZ0R5QWNha0VCZGlJY0lROE1Bd3RCQVNFSElDRWdGVUVBUjNGRkRRVWdKVUVDYWlJUElBaHFJQjFCQVhScVFRWjBRWUQrQTNFZ0xFRUNhaUlISUNWQkFYUnFJQjFxUVFKMklpRkJHSFFnSFNBbGFrRUJha0VCZGlJZVFSQjBjbklnQ0NBZGFrRUJha0VCZG5JaEtTQUdRZjhCY1NJR0lCeEIvd0Z4YWlBYVFmOEJjU0lJUVFGMGFrRUNha0VDZGlFU0lBZ2dCa0VCZEdvZ0xtcEJBbXBCQW5ZaEhDQUdJQWRxSUM1QkFYUnFRUUoySWhVaEdpQXNRUUZxSWdZZ0xtcEJBWFlpQnlFUklBWWdKV3BCQVhZaUJpRUlJQThnTEVFQmRHb2dMbXBCQW5ZaUZ5RVBEQUlMSUNsRkJFQkJBU0VIREFVTElCSkIvd0Z4SWlGQkFtb2lFU0FpSUJJZ0hodEIvd0Z4SWdkcUlEVWdFaUFlRzBIL0FYRWlDRUVCZEdvaUZVRU9kRUdBZ1B3SGNTQVJJQnBCL3dGeElocHFJQnhCL3dGeEloeEJBWFJxUVFKMkloY2dIRUVDYWlJaUlBaHFJQ0ZCQVhScVFRSjJJaEZCQ0hSeVFmLy9BM0Z5SUFnZ01DQVNJQjRiUWY4QmNXb2dCMEVCZEdwQkZuUkJnSUNBQkdwQmdJQ0FlSEZ5SVNrZ0J5QUlha0VCYWtFQmRpRVBJQlZCQW5ZaEZTQWFJQVpCL3dGeElnWnFRUUZxUVFGMklRY2dCaUFpYWlBYVFRRjBha0VDZGlFR0lCb2dIR3BCQVdwQkFYWWlHaUVlSUNGQkFXb2lFaUFjYWtFQmRpSWNJU0VnQ0NBU2FrRUJkaUlTSVFnTUFRc2dGMFVFUUVFQklRY01CQXNnQ0VFSWRDQUljaUFJUVJCMGNpQUlRUmgwY2lFcElCMUJBbW9pRHlBc2FpQWxRUUYwYWtFQ2RpRWFJQ1ZCQVdvaUJpQXNha0VCZGlFSElBWWdIV3BCQVhZaUhDRUdJQWdnSldvZ0hVRUJkR3BCQW1wQkFuWWlFaUVYSUFnZ0hXcEJBV3BCQVhZaUVTRWVJQThnQ0VFRGJHcEJBbllpRlNFaElBZ2hEd3NnR1NBbVFRUjBJRE5xYWlJaUlDazJBakFnSWlBZVFmOEJjU0FQUVJoMElBaEIvd0Z4UVJCMGNpQWhRZjhCY1VFSWRISnlOZ0lnSUNJZ0JrSC9BWEVnRlVFWWRDQVJRZjhCY1VFUWRISWdGMEgvQVhGQkNIUnljallDRUNBaUlBZEIvd0Z4SUJKQkdIUWdIRUgvQVhGQkVIUnlJQnBCL3dGeFFRaDBjbkkyQWdBZ0dTQVdJQk5CQm5ScVFjZ0NhaUFURUFzZ0UwRUJhaUlUUVJCSERRQUxDd0pBSUFrb0FzZ0JJZ1pGQkVCQkFDRU9JQ1JCQUVjaEVRd0JDeUFrUVFCSElSRWdDU2dDQkNJSElBWW9BZ1FpQ0VZaERpQUhJQWhIRFFBZ0pFVU5BRUVBSUE0Z0JpZ0NBRUVHU1JzaERrRUJJUkVMUVFBaEUwRUFJUmNDUUNBSktBTE1BU0lHUlEwQUlBa29BZ1FnQmlnQ0JFWWlGeUFSY1VVTkFFRUFJQmNnQmlnQ0FFRUdTUnNoRndzZ0ZpZ0NqQUVoR2dKQUlBa29BdFFCSWdaRkRRQWdDU2dDQkNBR0tBSUVSaUlUSUJGeFJRMEFJQVlvQWdCQkJVc2hFd3NnRmtISUNtb2hIQ0FaUVlBQ2FpRUdJQkJCRUdvaEhpQVFRVFZxSVNKQkFDRUtJQTVCQUVjZ0YwRUFSM0VpRlNBVGNTRWhRUkFoRWdOQUFrQUNRQUpBQWtBQ1FDQWFEZ01BQVFJREN5QUdBbjhnRlFSQUlCNHRBQU1nSGkwQUFpQWVMUUFCSUI0dEFBQWdJaTBBQkNBaUxRQURJQ0l0QUFFZ0lpMEFBbXBxYW1wcWFtcEJCR3BCQTNZaEVTQWlMUUFJSUNJdEFBY2dJaTBBQlNBaUxRQUdhbXBxUVFKcVFRSjJEQUVMSUJjRVFDQWlMUUFFSUNJdEFBTWdJaTBBQVNBaUxRQUNhbXBxUVFKcVFRSjJJUkVnSWkwQUNDQWlMUUFISUNJdEFBVWdJaTBBQm1wcWFrRUNha0VDZGd3QkN5QU9SUVJBUVlBQklSRkJnQUVNQVFzZ0hpMEFBeUFlTFFBQ0lCNHRBQUFnSGkwQUFXcHFha0VDYWtFQ2RpSVJDMEgvQVhGQmdZS0VDR3dpQnpZQUhDQUdJQkZCL3dGeFFZR0NoQWhzSWdnMkFCZ2dCaUFITmdBVUlBWWdDRFlBRUNBR0lBYzJBQXdnQmlBSU5nQUlJQVlnQnpZQUJDQUdJQWcyQUFBZ0JnSi9JQTRFUUNBZUxRQUhJQjR0QUFZZ0hpMEFCU0FlTFFBRWFtcHFJZ2RCQW1wQkFuWWlFU0FYUlEwQkdpQWlMUUFJSUNJdEFBY2dJaTBBQmlBSElDSXRBQVZxYW1wcVFRUnFRUU4yREFFTElCZEZCRUJCZ0FFaEVVR0FBUXdCQ3lBaUxRQUVJQ0l0QUFNZ0lpMEFBU0FpTFFBQ2FtcHFRUUpxUVFKMklSRWdJaTBBQ0NBaUxRQUhJQ0l0QUFVZ0lpMEFCbXBxYWtFQ2FrRUNkZ3RCL3dGeFFZR0NoQWhzSWdjMkFEd2dCaUFSUWY4QmNVR0Jnb1FJYkNJSU5nQTRJQVlnQnpZQU5DQUdJQWcyQURBZ0JpQUhOZ0FzSUFZZ0NEWUFLQ0FHSUFjMkFDUWdCaUFJTmdBZ1FRQWhDQXdEQ3lBT1JRUkFRUUVoQnd3RkN5QUdJQjR4QUFCQ2dZS0VpSkNnd0lBQmZqY0FBQ0FHSUI0eEFBRkNnWUtFaUpDZ3dJQUJmamNBQ0NBR0lCNHhBQUpDZ1lLRWlKQ2d3SUFCZmpjQUVDQUdJQjR4QUFOQ2dZS0VpSkNnd0lBQmZqY0FHQ0FHSUI0eEFBUkNnWUtFaUpDZ3dJQUJmamNBSUNBR0lCNHhBQVZDZ1lLRWlKQ2d3SUFCZmpjQUtDQUdJQjR4QUFaQ2dZS0VpSkNnd0lBQmZqY0FNQ0FHSUI0eEFBZENnWUtFaUpDZ3dJQUJmamNBT0VFQUlRZ01BZ3NnRjBVRVFFRUJJUWNNQkFzZ0JpQWlMUUFCSWdjNkFEZ2dCaUFIT2dBd0lBWWdCem9BS0NBR0lBYzZBQ0FnQmlBSE9nQVlJQVlnQnpvQUVDQUdJQWM2QUFnZ0JpQUhPZ0FBSUFZZ0lpMEFBaUlIT2dBNUlBWWdCem9BTVNBR0lBYzZBQ2tnQmlBSE9nQWhJQVlnQnpvQUdTQUdJQWM2QUJFZ0JpQUhPZ0FKSUFZZ0J6b0FBU0FHSUNJdEFBTWlCem9BT2lBR0lBYzZBRElnQmlBSE9nQXFJQVlnQnpvQUlpQUdJQWM2QUJvZ0JpQUhPZ0FTSUFZZ0J6b0FDaUFHSUFjNkFBSWdCaUFpTFFBRUlnYzZBRHNnQmlBSE9nQXpJQVlnQnpvQUt5QUdJQWM2QUNNZ0JpQUhPZ0FiSUFZZ0J6b0FFeUFHSUFjNkFBc2dCaUFIT2dBRElBWWdJaTBBQlNJSE9nQThJQVlnQnpvQU5DQUdJQWM2QUN3Z0JpQUhPZ0FrSUFZZ0J6b0FIQ0FHSUFjNkFCUWdCaUFIT2dBTUlBWWdCem9BQkNBR0lDSXRBQVlpQnpvQVBTQUdJQWM2QURVZ0JpQUhPZ0F0SUFZZ0J6b0FKU0FHSUFjNkFCMGdCaUFIT2dBVklBWWdCem9BRFNBR0lBYzZBQVVnQmlBaUxRQUhJZ2M2QUQ0Z0JpQUhPZ0EySUFZZ0J6b0FMaUFHSUFjNkFDWWdCaUFIT2dBZUlBWWdCem9BRmlBR0lBYzZBQTRnQmlBSE9nQUdJQVlnSWkwQUNDSUhPZ0EvSUFZZ0J6b0FOeUFHSUFjNkFDOGdCaUFIT2dBbklBWWdCem9BSHlBR0lBYzZBQmNnQmlBSE9nQVBJQVlnQnpvQUIwRUFJUWdNQVFzZ0lVVUVRRUVCSVFjTUF3c2dJaTBBQlNBaUxRQURheUFpTFFBR0lDSXRBQUpyUVFGMGFpQWlMUUFISUNJdEFBRnJRUU5zYWlBaUxRQUlJZ2NnSWkwQUFDSUlhMEVDZEdwQkVXeEJFR3BCQlhVaURFRjliQ0VOSUFjZ0hpMEFCeUlSYWtFRWRDQWVMUUFFSUI0dEFBSnJJQkVnQ0d0QkFuUnFJQjR0QUFVZ0hpMEFBV3RCQVhScUlCNHRBQVlnSGkwQUFHdEJBMnhxUVJGc1FSQnFRUVYxSWhGQmZXeHFRUkJxSVE5QkNDRUhJQVloRXdOQUlCTWdEU0FQYWlJSVFRVjFRY0ExYWkwQUFEb0FBQ0FUSUFnZ0RHb2lDRUVGZFVIQU5Xb3RBQUE2QUFFZ0V5QUlJQXhxSWdoQkJYVkJ3RFZxTFFBQU9nQUNJQk1nQ0NBTWFpSUlRUVYxUWNBMWFpMEFBRG9BQXlBVElBZ2dER29pQ0VFRmRVSEFOV290QUFBNkFBUWdFeUFJSUF4cUlnaEJCWFZCd0RWcUxRQUFPZ0FGSUJNZ0NDQU1haUlJUVFWMVFjQTFhaTBBQURvQUJpQVRJQWdnREdwQkJYVkJ3RFZxTFFBQU9nQUhJQThnRVdvaER5QVRRUWhxSVJOQkFDRUlJQWRCQVdzaUJ3MEFDd3NEUUNBY0lBaEJCblJxSWdjb0FnQWlFVUgvLy84SFJ3UkFJQWNvQWdRaER5QUdJQklnRWtFRGNTQVNRUkJKSWd3YlFRSjBJaE5COENscUtBSUFRUkJCQ0NBTUd5SU5iR29nRTBHd0tXb29BZ0JxSWd3Z0VTQU1MUUFBYWtIQU5Xb3RBQUE2QUFBZ0J5Z0NDQ0VSSUF3Z0R5QU1MUUFCYWtIQU5Xb3RBQUE2QUFFZ0J5Z0NEQ0VQSUF3Z0VTQU1MUUFDYWtIQU5Xb3RBQUE2QUFJZ0RDQVBJQXd0QUFOcVFjQTFhaTBBQURvQUF5QUhLQUlVSVJFZ0RDQU5haUlNSUFjb0FoQWdEQzBBQUdwQndEVnFMUUFBT2dBQUlBY29BaGdoRHlBTUlCRWdEQzBBQVdwQndEVnFMUUFBT2dBQklBY29BaHdoRVNBTUlBOGdEQzBBQW1wQndEVnFMUUFBT2dBQ0lBd2dFU0FNTFFBRGFrSEFOV290QUFBNkFBTWdCeWdDSkNFUklBd2dEV29pRENBSEtBSWdJQXd0QUFCcVFjQTFhaTBBQURvQUFDQUhLQUlvSVE4Z0RDQVJJQXd0QUFGcVFjQTFhaTBBQURvQUFTQUhLQUlzSVJFZ0RDQVBJQXd0QUFKcVFjQTFhaTBBQURvQUFpQU1JQkVnREMwQUEycEJ3RFZxTFFBQU9nQURJQWNvQWpRaEVTQU1JQTFxSWd3Z0J5Z0NNQ0FNTFFBQWFrSEFOV290QUFBNkFBQWdCeWdDT0NFTklBd2dFU0FNTFFBQmFrSEFOV290QUFBNkFBRWdCeWdDUENFSElBd2dEU0FNTFFBQ2FrSEFOV290QUFBNkFBSWdEQ0FISUF3dEFBTnFRY0ExYWkwQUFEb0FBd3NnRWtFQmFpRVNJQWhCQVdvaUNFRUVSdzBBQ3lBY1FZQUNhaUVjSUI1QkNHb2hIaUFpUVFscUlTSWdCa0ZBYXlFR0lBb2hCMEVCSVFvZ0IwVU5BQXRCQUNFSElBa29Bc1FCUVFGTERRQWdLeUFaRUE4TElCQkIwQUJxSkFBZ0J5SUdSUTBTREJRTElBNG9BZ0FoSENBZklDc29BZ1FpQmpZQzNBTWdIeUFyS0FJSU5nTGdBeUFxSUFadUlnZEJCSFFoR1NBcUlBWWdCMnhyUVFSMElSNGdIQTRFQUFBQkFnTUxJQ2tnTVdvaURTZ0NCQ0VHSUJZb0FwQUJJUkpCQVNFS1FYOGhFRUVBSVFsQkFDRWFRUUFoQ0VFQklRY0NmMEYvSUEwb0FzZ0JJZ3hGRFFBYVFYOGdEQ2dDQkNBR1J3MEFHa0VBSVFkQmZ5QU1LQUlBUVFWTERRQWFJQXdvQXBnQklnaEJFSFloR2lBTUtBSm9DeUVSQWtBZ0RTZ0N6QUVpREVVRVFFRUFJUlVNQVFzZ0JpQU1LQUlFUndSQVFRQWhGUXdCQzBFQUlRb2dEQ2dDQUVFRlN3UkFRUUFoRlF3QkN5QU1LQUtzQVNJVlFSQjJJUWtnRENnQ2JDRVFDeUFjUlFSQVFRQWhIQ0FISUFweUJFQkJBQ0VNREE4TElCRWdDRUgvL3dOeElCcEJFSFJ5Y2tVRVFFRUFJUXdNRHd0QkFDRU1JQkFnRlVILy93TnhJQWxCRUhSeWNrVU5EZ3NnRmk4Qm9nRWhEeUFXTHdHZ0FTRVRBbjhDUUFKQUlBMG9BdEFCSWd4RkRRQWdEQ2dDQkNBR1J3MEFJQXdvQWdCQkJVME5BUXdOQ3dKQUlBMG9BdFFCSWd4RkRRQWdEQ2dDQkNBR1J3MEFJQXdvQWdCQkJVc05EU0FNUWNBQmFpRWNJQXhCOEFCcURBSUxJQWNnQ2tFQmMzSU5EQXdPQ3lBTVFhd0JhaUVjSUF4QjdBQnFDeWdDQUNFSElCd29BZ0FNQ3dzZ0Z5Z0NCQ0VTSUJZb0FwQUJJUTFCZnlFSUFrQUNRQUpBSUJjb0Fzd0JJZ1pGQkVCQkFDRWFEQUVMUVFBaEdpQUdLQUlFSUJKR0RRRUxRUUFoREVFQUlRa01BUXRCQVNFSklBWW9BZ0JCQlVzRVFFRUFJUXdNQVFzZ0JpZ0NyQUVpREVFUWRpRWFJQVlvQW13aENBc2dGaThCb2dFaEVTQVdMd0dnQVNFUElBZ2dEVVlFUUNBYUlRWWdEQ0VJREFrTFFRRWhFRUYvSVJWQkFDRUdBa0FnRnlnQ3lBRWlCMFVFUUVFQUlRZ01BUXNnRWlBSEtBSUVSd1JBUVFBaENBd0JDMEVBSVJBZ0J5Z0NBRUVGU3dSQVFRQWhDQXdCQ3lBSEtBS1lBU0lJUVJCMklRWWdCeWdDYUNFVkN3Si9Ba0FDUUNBWEtBTFFBU0lIUlEwQUlBY29BZ1FnRWtjTkFDQUhLQUlBUVFWTkRRRU1DUXNDUUNBWEtBTFVBU0lIUlEwQUlBY29BZ1FnRWtjTkFDQUhLQUlBUVFWTERRa2dCMEhBQVdvaEVDQUhRZkFBYWd3Q0N5QUpJQkJ5RFFnTUNnc2dCMEdzQVdvaEVDQUhRZXdBYWdzb0FnQWhDaUFRS0FJQURBY0xJQmNvQWdRaERTQVdLQUtRQVNFSlFRRWhDa0YvSVFoQkFDRVRBa0FnRnlnQ3lBRWlCa1VFUUVFQUlRd01BUXNnRFNBR0tBSUVSd1JBUVFBaERBd0JDMEVBSVFvZ0JpZ0NBRUVGU3dSQVFRQWhEQXdCQ3lBR0tBS1lBU0lNUVJCMklSTWdCaWdDYUNFSUN5QVdMd0dpQVNFU0lCWXZBYUFCSVJFZ0NDQUpSZzBEQW44Q1FBSkFJQmNvQXN3QklnZEZEUUFnQnlnQ0JDQU5SdzBBSUFjb0FnQkJCVTBOQVF3RUN3SkFJQmNvQXRRQklnZEZEUUFnQnlnQ0JDQU5SdzBBSUFjb0FnQkJCVXNOQkNBSFFjQUJhaUVRUVFBaEJrRi9JUlZCQUF3Q0N5QUtSUTBGREFNTElBZEJ2QUZxSVJBZ0J5Z0NiQ0VWSUFjb0Fxd0JJZ1pCRUhZTElRZ2dCeWdDY0NFS0lCQW9BZ0FNQWdzZ0YwSElBV29oRFNBWFFjd0JhaUVTSUJkQjBBRnFJUkVnRjBIVUFXb2hEMEVBSVNFRFFFRUVJU0lnRmlBaFFRSjBJaVJxSWlVaU15Z0NzQUVpQmtFQ1RRUkFJQVpCQW5SQmpDdHFLQUlBSVNJTElCY2dKR29pQnlBbEtBTEFBVFlDWkFKQUFrQWdKU2dDd0FFaUhFRVFTdzBBSUFBb0FzZ0pJQnhCQW5ScUtBSUFJZ1pGRFFBZ0JpZ0NGRUVCU3cwQkN5QXBJQ3BCMkFGc2FpQWhRUUowYWtFQU5nSjBEQTBMSUFjZ0JpZ0NBQ0lHTmdKMElBWkZEUXdDUUNBaVJRMEFJQmNnSVVFRWRDSXdhaUlkSVRVZ0pFRURjaUZUUVFBaEdnTkFJQllnTUdvZ0drRUNkR29oTEVFQklTNUJmeUVtSUEwaENpQU9JUVpCQUNFSVFRQWhDVUYvSVJVQ1FBSkFBa0FDUUFKQUFrQWdJVUVIZENBektBS3dBU0pzUVFWMGFpQWFRUU4wYWlJVFFiQVphaWdDQUE0RkF3QUJBZ1FGQ3lBU0lRb01BZ3NnRVNFS0RBRUxJQThoQ2dzZ0NpZ0NBQ0VHQ3dKQUlBWkZEUUFnQmlnQ0JDQVhLQUlFUncwQlFRQWhMaUFHS0FJQVFRVkxEUUFnQmlBVFFiUVphaTBBQUNJSFFRSjBhaWdDaEFFaUNVRVFkaUVJSUFZZ0IwSDhBWEZxS0FKa0lSVUxDMEVBSVF3Z0RTRUhJQTRoQmtFQUlRcEJBQ0VRQWtBQ1FBSkFBa0FDUUFKQUlCTkJzQjFxS0FJQURnVURBQUVDQkFVTElCSWhCd3dDQ3lBUklRY01BUXNnRHlFSEN5QUhLQUlBSVFZTElBWkZEUUFnQmlnQ0JDQVhLQUlFUncwQVFRRWhFQ0FHS0FJQVFRVkxEUUFnQmlBVFFiUWRhaTBBQUNJSFFRSjBhaWdDaEFFaUNrRVFkaUVNSUFZZ0IwSDhBWEZxS0FKa0lTWUxJQ3d2QWRJQklXMGdMQzhCMEFFaExDQU5JUWNnRGlFR0FrQUNmd0pBQW44Q1FBSkFBa0FDUUFKQUFrQUNRQ0FUUWJBaGFpZ0NBQTRGQXdBQkFnUUZDeUFTSVFjTUFnc2dFU0VIREFFTElBOGhCd3NnQnlnQ0FDRUdDeUFHUlEwQUlBWW9BZ1FnRnlnQ0JFY05BQ0FHS0FJQVFRVk5EUUVNQXdzZ0RTRUhJQTRoQmdKQUFrQUNRQUpBQWtBQ1FDQVRRYkFsYWlnQ0FBNEZBd0FCQWdRRkN5QVNJUWNNQWdzZ0VTRUhEQUVMSUE4aEJ3c2dCeWdDQUNFR0N5QUdSUTBBSUFZb0FnUWdGeWdDQkVjTkFDQUdLQUlBUVFWTERRTWdCaUFUUWJRbGFpMEFBQ0lUUVFKMGFrR0VBV29NQWdzZ0VDQXVjZzBDREFRTElBWWdFMEcwSVdvdEFBQWlFMEVDZEdwQmhBRnFDeUVISUFZZ0UwSDhBWEZxS0FKa0lSQWdCeWdDQUF3QkMwRi9JUkJCQUFzaEJpQWNJQ1pHSWhNZ0ZTQWNSaUlIYWlBUUlCeEdha0VCUndSQUlBd2dDQ0FNUVJCMFFSQjFJZ3dnQ0VFUWRFRVFkU0lIU2lJSUd5SVRJQWNnRENBSElBY2dERW9iSUFnYklnZ2dCa0VRZFNJSElBY2dDRWdiSUJOQkVIUkJFSFVnQjBnYklRZ2dDaUFKSUFwQkVIUkJFSFVpQ2lBSlFSQjBRUkIxSWdkS0lna2JJZ3hCLy84RGNTQUhJQW9nQnlBSElBcEtHeUFKR3lJSElBWkJFSFJCRUhVaUJpQUdJQWRJR3lBTVFSQjBRUkIxSUFaSUd5RUpEQUVMSUFrZ0NpQUhHeUVKSUFnZ0RDQUhHeUVJSUFjTkFDQVREUUFnQmtFUWRpRUlJQVloQ1FzZ0NTQXNhaUlHUVJCMFFSQjFRWUJBYTBILy93QkxEUTRnQ0NCdGFpSUhRUkIwUVJCMVFZQVFha0gvSDBzTkRnSkFJQmNDZndKQUFrQUNRQUpBSUd3T0JBQUJBZ01GQ3lBZElBWTdBWVFCSUIwZ0J6c0JoZ0VnSFNBR093R0lBU0FkSUFjN0FZb0JJQjBnQmpzQmpBRWdOU0FIT3dHT0FTQlREQU1MSUJjZ0drRUJkQ0FrYWlJSVFRSjBhaUlKSUFjN0FZWUJJQWtnQmpzQmhBRWdDRUVCY2d3Q0N5QVhJQm9nSkdvaUNFRUNkR29pQ1NBSE93R0dBU0FKSUFZN0FZUUJJQWhCQW1vTUFRc2dHaUFrYWd0QkFuUnFJZ2dnQnpzQmhnRWdDQ0FHT3dHRUFRc2dHa0VCYWlJYUlDSkdEUUVnSlNnQ3dBRWhIQXdBQ3dBTElDRkJBV29pSVVFRVJ3MEFDMEVBSVFZRFFDQWZJQmNnQmtFQ2RDSUphaWdDZERZQzJBTWdCa0VCUzBFRGRDRUhJQVpCQTNSQkNIRWhDQUpBQWtBQ1FBSkFBa0FnQ1NBV2FpZ0NzQUVPQXdBQkFnTUxJQjlCRUdvZ0Z5QUdRUVIwYWtHRUFXb2dIMEhZQTJvZ0hpQVpJQWdnQjBFSVFRZ1FEQXdEQ3lBZlFSQnFJZ2tnRnlBR1FRUjBhaUlLUVlRQmFpQWZRZGdEYWlJTUlCNGdHU0FJSUFkQkNFRUVFQXdnQ1NBS1FZd0JhaUFNSUI0Z0dTQUlJQWRCQkhKQkNFRUVFQXdNQWdzZ0gwRVFhaUlKSUJjZ0JrRUVkR29pQ2tHRUFXb2dIMEhZQTJvaURDQWVJQmtnQ0NBSFFRUkJDQkFNSUFrZ0NrR0lBV29nRENBZUlCa2dDRUVFY2lBSFFRUkJDQkFNREFFTElCOUJFR29pQ1NBWElBWkJCSFJxSWdwQmhBRnFJQjlCMkFOcUlnd2dIaUFaSUFnZ0IwRUVRUVFRRENBSklBcEJpQUZxSUF3Z0hpQVpJQWhCQkhJaURTQUhRUVJCQkJBTUlBa2dDa0dNQVdvZ0RDQWVJQmtnQ0NBSFFRUnlJZ2RCQkVFRUVBd2dDU0FLUVpBQmFpQU1JQjRnR1NBTklBZEJCRUVFRUF3TElBWkJBV29pQmtFRVJ3MEFDd3dNQzBGL0lRcEJmeUVWUVFBaEJrRUFJUWhCQUFzaEJ5QUpJQlZHSWc4Z0NTQUtSbXBCQVVjRVFDQUlJQk1nQ0VFUWRFRVFkU0lLSUJOQkVIUkJFSFVpQ0VvaUR4c2lHaUFJSUFvZ0NDQUlJQXBLR3lBUEd5SUtJQWRCRUhVaUNDQUlJQXBJR3lBYVFSQjBRUkIxSUFoSUd5RUlJQVlnRENBR1FSQjBRUkIxSWdvZ0RFRVFkRUVRZFNJR1NpSU1HeUlQUWYvL0EzRWdCaUFLSUFZZ0JpQUtTaHNnREJzaUNpQUhRUkIwUVJCMUlnWWdCaUFLU0JzZ0QwRVFkRUVRZFNBR1NCc2hCZ3dDQ3lBUERRRWdCMEVRZGlFSUlBY2hCZ3dCQ3lBVElRZ2dEQ0VHQ3lBR0lCRnFJZ2RCRUhSQkVIVkJnRUJyUWYvL0FFc05CeUFJSUJKcUlnaEJFSFJCRUhWQmdCQnFRZjhmU3cwSElBbEJFRXNOQnlBQUtBTElDU0FKUVFKMGFpZ0NBQ0lHUlEwSElBWW9BaFJCQWtrTkJ5QUdLQUlBSWhKRkRRY2dGeUFJT3dHeUFTQVhJQWM3QWJBQklCY2dFallDZENBWElBazJBbVFnRnlBU05nSjhJQmNnQ1RZQ2JDQVhJQmNvQXJBQklnWTJBcXdCSUJjZ0JqWUNxQUVnRnlBR05nS2tBU0FYSUFZMkFwQUJJQmNnQmpZQ2pBRWdGeUFHTmdLSUFTQVhJQVkyQW9RQklCWW9BcFFCSVFnQ1FBSi9BbjhDUUNBWEtBTFFBU0lIUlEwQUlBY29BZ1FnRFVjTkFDQUhLQUlBUVFWTEJFQkJBQ0VjUVg4TUF3c2dCMEdzQVdvTUFRdEJBU0VWUVg4aERFRUFJUndnRnlnQ3pBRWlCMFVOQWlBSEtBSUVJQTFIRFFKQkFDRVZJQWNvQWdCQkJVc05BaUFIUWJBQmFnc29BZ0FoSENBSEtBSnNDeUVNUVFBaEZRc2dGaThCcGdFaEVTQVdMd0drQVNFUEFrQUNRQ0FJSUF4R0RRQWdCa0VRZGlFSEFuOENRQUpBSUJjb0Fzd0JJZ3BGRFFBZ0NpZ0NCQ0FOUncwQUlBb29BZ0JCQlVzTkFTQUtLQUs4QVNJVlFSQjJJUm9nQ2lnQ2NBd0NDeUFWRFFNTFFRQWhGVUVBSVJwQmZ3c2hDaUFJSUFsR0lna2dDQ0FLUm1wQkFVY0VRQ0FhSUFjZ0drRVFkRUVRZFNJSklBZEJFSFJCRUhWS0lnb2JJZ3dnQmtFUWRTSUhJQWtnQnlBSElBbEtHeUFLR3lJSklCeEJFSFVpQnlBSElBbElHeUFNUVJCMFFSQjFJQWRJR3lFSElCVWdCaUFWUVJCMFFSQjFJZ2tnQmtFUWRFRVFkU0lHU2lJS0d5SU1RZi8vQTNFZ0JpQUpJQVlnQmlBSlNoc2dDaHNpQ1NBY1FSQjBRUkIxSWdZZ0JpQUpTQnNnREVFUWRFRVFkU0FHU0JzaEJnd0NDeUFKRFFFZ0NDQUtSdzBBSUJWQi8vOERjU0FhUVJCMGNpRUdJQm9oQnd3QkN5QWNRUkIySVFjZ0hDRUdDeUFHSUE5cUlnbEJFSFJCRUhWQmdFQnJRZi8vQUVzTkJ5QUhJQkZxSWdkQkVIUkJFSFZCZ0JCcVFmOGZTdzBISUFoQkVFc05CeUFBS0FMSUNTQUlRUUowYWlnQ0FDSUdSUTBISUFZb0FoUkJBa2tOQnlBR0tBSUFJZ1pGRFFjZ0Z5QUhPd0hDQVNBWElBazdBY0FCSUJjZ0JqWUNnQUVnRnlBR05nSjRJQmNnQ0RZQ2NDQVhJQWcyQW1nZ0Z5QVhLQUxBQVNJR05nSzhBU0FYSUFZMkFyZ0JJQmNnQmpZQ3RBRWdGeUFHTmdLZ0FTQVhJQVkyQXB3QklCY2dCallDbUFFZ0YwR1VBV29pQnlBR05nSUFJQjhnRWpZQzJBTWdIMEVRYWlJR0lCZEJoQUZxSUI5QjJBTnFJZ2dnSGlBWlFRQkJBRUVJUVJBUURDQWZJQmNvQW5nMkF0Z0RJQVlnQnlBSUlCNGdHVUVJUVFCQkNFRVFFQXdNQ0F0QmZ5RUtRUUFMSVFjZ0RTQVZSaUlKSUFvZ0RVWnFRUUZIQkVBZ0dpQUdJQnBCRUhSQkVIVWlDU0FHUVJCMFFSQjFJZ1pLSWdvYklob2dCaUFKSUFZZ0JpQUpTaHNnQ2hzaUNTQUhRUkIxSWdZZ0JpQUpTQnNnR2tFUWRFRVFkU0FHU0JzaEJpQU1JQWdnREVFUWRFRVFkU0lKSUFoQkVIUkJFSFVpQ0VvaUNoc2lERUgvL3dOeElBZ2dDU0FJSUFnZ0NVb2JJQW9iSWdnZ0IwRVFkRUVRZFNJSElBY2dDRWdiSUF4QkVIUkJFSFVnQjBnYklRZ01BUXNnQ1EwQUlBZEJFSFloQmlBSElRZ0xJQWdnRDJvaUIwRVFkRUVRZFVHQVFHdEIvLzhBU3cwRUlBWWdFV29pQ0VFUWRFRVFkVUdBRUdwQi94OUxEUVFnRFVFUVN3MEVJQUFvQXNnSklBMUJBblJxS0FJQUlnWkZEUVFnQmlnQ0ZFRUNTUTBFSUFZb0FnQWlDVVVOQkNBWElBZzdBYUlCSUJjZ0J6c0JvQUVnRnlBSk5nSjBJQmNnRFRZQ1pDQVhJQWsyQW5nZ0Z5QU5OZ0pvSUJjZ0Z5Z0NvQUVpQmpZQ25BRWdGeUFHTmdLWUFTQVhJQVkyQXBRQklCY2dCallDa0FFZ0Z5QUdOZ0tNQVNBWElBWTJBb2dCSUJjZ0JqWUNoQUVnRmlnQ2xBRWhDQ0FXTHdHbUFTRVJJQll2QWFRQklROENmd0pBQWtBQ1FDQVhLQUxJQVNJSEJFQWdFaUFIS0FJRVJnUkFJQWNvQWdCQkJVMEVRQ0FIS0FLNEFTSUtRUkIySVJNZ0J5Z0NjQ0FJUncwRUlBb2hEQXdEQzBGL0lSVkJBQ0VNUVFBaEUwRUFJUXBCQUNFSElBaEJmMFlOQWd3RUMwRi9JUlZCQUNFTVFRQWhFMEVBSVFwQkFDRUhJQWhCZjBZTkFRd0RDMEYvSVJWQkFDRU1RUUFoRTBFQUlRcEJBQ0VISUFoQmYwY05BZ3NnREVILy93TnhJQk5CRUhSeURBSUxJQWNvQW1naEZTQUhLQUtnQVNFSElCTWhEQXNnQmtFUWRpRVNJQWdnRFVZaURTQUlJQlZHYWtFQlJ3UkFJQklnRENBTVFSQjBRUkIxSWd3Z0VrRVFkRUVRZFVnaURSc2lFaUFNSUFaQkVIVWlHaUFNSUF3Z0drb2JJQTBiSWcwZ0IwRVFkU0lNSUF3Z0RVZ2JJQkpCRUhSQkVIVWdERWdiSVJNZ0JpQUtJQXBCRUhSQkVIVWlDaUFHUVJCMFFSQjFJZ1pJSWd3YklnMUIvLzhEY1NBS0lBWWdDaUFHSUFwSUd5QU1HeUlLSUFkQkVIUkJFSFVpQmlBR0lBcElHeUFOUVJCMFFSQjFJQVpJR3d3QkN5QVNJQWRCRUhZZ0RSc2hFeUFHSUFjZ0RSc0xJQTlxSWdkQkVIUkJFSFZCZ0VCclFmLy9BRXNOQkNBUklCTnFJZ3BCRUhSQkVIVkJnQkJxUWY4ZlN3MEVJQWhCRUVzTkJDQUFLQUxJQ1NBSVFRSjBhaWdDQUNJR1JRMEVJQVlvQWhSQkFra05CQ0FHS0FJQUlnWkZEUVFnRnlBS093SENBU0FYSUFjN0FjQUJJQmNnQmpZQ2dBRWdGeUFHTmdKOElCY2dDRFlDY0NBWElBZzJBbXdnRnlBWEtBTEFBU0lHTmdLOEFTQVhJQVkyQXJnQklCY2dCallDdEFFZ0Z5QUdOZ0t3QVNBWElBWTJBcXdCSUJjZ0JqWUNxQUVnRjBHa0FXb2lCeUFHTmdJQUlCOGdDVFlDMkFNZ0gwRVFhaUlHSUJkQmhBRnFJQjlCMkFOcUlnZ2dIaUFaUVFCQkFFRVFRUWdRRENBZklCY29BbncyQXRnRElBWWdCeUFJSUI0Z0dVRUFRUWhCRUVFSUVBd01CUXRCZnlFSFFRQUxJUVlnRUNBU1JpSU1JQkVnRWtZaUNtb2dCeUFTUm1wQkFVY0VRQ0FKSUJvZ0NVRVFkRUVRZFNJSklCcEJFSFJCRUhVaUIwb2lDaHNpRENBSElBa2dCeUFISUFsS0d5QUtHeUlKSUFaQkVIVWlCeUFISUFsSUd5QU1RUkIwUVJCMUlBZElHeUVhSUJVZ0NDQVZRUkIwUVJCMUlna2dDRUVRZEVFUWRTSUhTaUlJR3lJS1FmLy9BM0VnQnlBSklBY2dCeUFKU2hzZ0NCc2lCeUFHUVJCMFFSQjFJZ1lnQmlBSFNCc2dDa0VRZEVFUWRTQUdTQnNoQ0F3QkN5QUlJQlVnQ2hzaENDQWFJQWtnQ2hzaEdpQUtEUUFnREEwQUlBWkJFSFloR2lBR0lRZ0xJQWdnRTJvaUhFRVFkRUVRZFVHQVFHdEIvLzhBU3cwQklBOGdHbW9pREVFUWRFRVFkVUdBRUdwQi94OUxEUUVMSUJKQkVFc05BQ0FBS0FMSUNTQVNRUUowYWlnQ0FDSUdSUTBBSUFZb0FoUkJBa2tOQUNBR0tBSUFJZ2RGRFFBZ0RTQU1Pd0hDQVNBTklCdzdBY0FCSUEwZ0J6WUNkQ0FOSUJJMkFtUWdEU0FITmdLQUFTQU5JQWMyQW53Z0RTQUhOZ0o0SUEwZ0VqWUNjQ0FOSUJJMkFtd2dEU0FTTmdKb0lBMGdEU2dDd0FFaUJqWUN2QUVnRFNBR05nSzRBU0FOSUFZMkFyUUJJQTBnQmpZQ3NBRWdEU0FHTmdLc0FTQU5JQVkyQXFnQklBMGdCallDcEFFZ0RTQUdOZ0tnQVNBTklBWTJBcHdCSUEwZ0JqWUNtQUVnRFNBR05nS1VBU0FOSUFZMkFwQUJJQTBnQmpZQ2pBRWdEU0FHTmdLSUFTQU5JQVkyQW9RQklCOGdCellDMkFNZ0gwRVFhaUFOUVlRQmFpQWZRZGdEYWlBZUlCbEJBRUVBUVJCQkVCQU1EQUVMUVFFaEJnd0RDeUFPS0FMRUFVRUJTdzBBSUE0b0FnQUVRQ0FyS0FJQUlnd2dLaUFxSUNzb0FnUWlDWEFpQm1zaUIwRUlkR29nQmtFRWRHb2hEaUFKUVFSMElRb2dDVUVDZEVIOC8vLy9BM0VoRFNBR1FRTjBJUklnS3lnQ0NDQUpiQ0lSUVFoMElROGdCMEVHZENFVFFRQWhHZ05BSUE0Z0drRUNkQ0lHUWZBcGFpZ0NBQ0lISUFwc2FpQUdRYkFwYWlnQ0FDSUdhaUVJSUI5QkVHb2dCMEVFZEdvZ0Jtb2hCZ0pBSUJZZ0drRUdkR29pQnlnQ3lBSWlIRUgvLy84SFJ3UkFJQWNvQXN3Q0lSY2dCaTBBQVNFVklBZ2dIQ0FHTFFBQWFrSEFOV290QUFBNkFBQWdCeWdDMEFJaEhDQUdMUUFDSVJBZ0NDQVZJQmRxUWNBMWFpMEFBRG9BQVNBSEtBTFVBaUVYSUFZdEFBTWhGU0FJSUJBZ0hHcEJ3RFZxTFFBQU9nQUNJQWdnRlNBWGFrSEFOV290QUFBNkFBTWdCeWdDM0FJaEhDQUdMUUFSSVJjZ0NDQUthaUlJSUFjb0F0Z0NJQVl0QUJCcVFjQTFhaTBBQURvQUFDQUhLQUxnQWlFVklBWXRBQkloRUNBSUlCY2dIR3BCd0RWcUxRQUFPZ0FCSUFjb0F1UUNJUndnQmkwQUV5RVhJQWdnRUNBVmFrSEFOV290QUFBNkFBSWdDQ0FYSUJ4cVFjQTFhaTBBQURvQUF5QUhLQUxzQWlFY0lBWXRBQ0VoRnlBSUlBcHFJZ2dnQnlnQzZBSWdCaTBBSUdwQndEVnFMUUFBT2dBQUlBY29BdkFDSVJVZ0JpMEFJaUVRSUFnZ0Z5QWNha0hBTldvdEFBQTZBQUVnQnlnQzlBSWhIQ0FHTFFBaklSY2dDQ0FRSUJWcVFjQTFhaTBBQURvQUFpQUlJQmNnSEdwQndEVnFMUUFBT2dBRElBY29BdndDSVJ3Z0JpMEFNU0VYSUFnZ0Ntb2lDQ0FIS0FMNEFpQUdMUUF3YWtIQU5Xb3RBQUE2QUFBZ0J5Z0NnQU1oRlNBR0xRQXlJUkFnQ0NBWElCeHFRY0ExYWkwQUFEb0FBU0FIS0FLRUF5RUhJQVl0QURNaEJpQUlJQkFnRldwQndEVnFMUUFBT2dBQ0lBZ2dCaUFIYWtIQU5Xb3RBQUE2QUFNTUFRc2dCaWdDRUNFY0lBZ2dCaWdDQURZQ0FDQUlJQTFCQW5RaUIyb2lDQ0FjTmdJQUlBWW9BakFoSENBSElBaHFJZ2dnQmlnQ0lEWUNBQ0FISUFocUlCdzJBZ0FMSUJwQkFXb2lHa0VRUncwQUN5QVJRUVowSVE0Z0NVRURkRUg0Ly8vL0IzRWlDa0VDZGlFTklBd2dEMm9nRTJvZ0Vtb2hERUVRSVFnRFFDQU1JQTVCQUNBSVFSTkxJZ1liYWlBSVFRSjBRUXh4SWdkQjhDbHFLQUlBSWhJZ0Ntd2dCMEd3S1dvb0FnQWlCMnBxSVFrZ0gwRVFha0hBQWtHQUFpQUdHMm9nRWtFRGRDQUhhbW9oQmdKQUlCWWdDRUVHZEdvaUJ5Z0N5QUlpRWtILy8vOEhSd1JBSUFjb0Fzd0NJUkVnQmkwQUFTRVBJQWtnRWlBR0xRQUFha0hBTldvdEFBQTZBQUFnQnlnQzBBSWhFaUFHTFFBQ0lSb2dDU0FQSUJGcVFjQTFhaTBBQURvQUFTQUhLQUxVQWlFUklBWXRBQU1oRHlBSklCSWdHbXBCd0RWcUxRQUFPZ0FDSUFrZ0R5QVJha0hBTldvdEFBQTZBQU1nQnlnQzNBSWhFaUFHTFFBSklSRWdDU0FLYWlJSklBY29BdGdDSUFZdEFBaHFRY0ExYWkwQUFEb0FBQ0FIS0FMZ0FpRVBJQVl0QUFvaEdpQUpJQkVnRW1wQndEVnFMUUFBT2dBQklBY29BdVFDSVJJZ0JpMEFDeUVSSUFrZ0R5QWFha0hBTldvdEFBQTZBQUlnQ1NBUklCSnFRY0ExYWkwQUFEb0FBeUFIS0FMc0FpRVNJQVl0QUJFaEVTQUpJQXBxSWdrZ0J5Z0M2QUlnQmkwQUVHcEJ3RFZxTFFBQU9nQUFJQWNvQXZBQ0lROGdCaTBBRWlFYUlBa2dFU0FTYWtIQU5Xb3RBQUE2QUFFZ0J5Z0M5QUloRWlBR0xRQVRJUkVnQ1NBUElCcHFRY0ExYWkwQUFEb0FBaUFKSUJFZ0VtcEJ3RFZxTFFBQU9nQURJQWNvQXZ3Q0lSSWdCaTBBR1NFUklBa2dDbW9pQ1NBSEtBTDRBaUFHTFFBWWFrSEFOV290QUFBNkFBQWdCeWdDZ0FNaER5QUdMUUFhSVJvZ0NTQVJJQkpxUWNBMWFpMEFBRG9BQVNBSEtBS0VBeUVISUFZdEFCc2hCaUFKSUE4Z0dtcEJ3RFZxTFFBQU9nQUNJQWtnQmlBSGFrSEFOV290QUFBNkFBTU1BUXNnQmlnQ0NDRVNJQWtnQmlnQ0FEWUNBQ0FKSUExQkFuUWlCMm9pQ1NBU05nSUFJQVlvQWhnaEVpQUhJQWxxSWdrZ0JpZ0NFRFlDQUNBSElBbHFJQkkyQWdBTElBaEJBV29pQ0VFWVJ3MEFDd3dCQ3lBcklCOUJFR29RRHdzZ0FDZ0N2QWtpRGlBeGFpZ0N4QUZCQVVZaENnSi9RUUFnSUNnQ0RFRURkQ0FnS0FJUWF5SUhSUTBBR2tFQklBZEJDRXNOQUJvZ0lDZ0NCQ0lHTFFBQUlDQW9BZ2dpQ1VFWWFpSWFkQ0VJSUFjZ0NXcEJDR3NpQ1VFQlRnUkFBMEFnQmkwQUFTQWFRUWhySWhwMElBaHlJUWdnQ1VFSVNpRU1JQVpCQVdvaEJpQUpRUWhySVFrZ0RBMEFDd3RCQVNBSFFRRnJkQ0FJUVNBZ0IydDJSd3NnSHlnQ0RISWhCZ0pBQWtBZ0x5Z0NCRUVDYXc0R0FBRUJBUUVBQVFzZ0FDQXFOZ0t3Q1FzZ0NpQTBhaUUwSUFaQkFFY2hDQ0FBS0FLWUNTSUhJQ3BCQVdvaUJpQUdJQWRKR3lFR0lBQW9BcFFKSWdrZ0trRUNkR29vQWdBaENnTkFBa0FnQnlBcVFRRnFJaXBOQkVBZ0JpRXFEQUVMSUFrZ0trRUNkR29vQWdBZ0NrY05BUXNMUVFFaEJrRUFJQWhCQUNBcUlBY2dLa1liSWlvYkRRRWdDQTBBQ3lBSElBQkJyQWxxS0FJQUlEUnFJZ2hKRFFBZ0FDQUlOZ0tzQ1VFQUlRWUxJQjlCOEFOcUpBQWdCZ3NFUUNBQUtBS29DU0VKSUFBb0F0Z0tJUVlDUUNBQUtBS3dDU0lIUlEwQUlBWWdCMEVCYXlJS1R3UkFJQW9oQmd3QkN5QUFLQUs4Q1NFSFFRQWhEUU5BQWtBZ0J5QUtRZGdCYkdvb0FnUWdDVWNOQUNBTlFRRnFJZzBnQUNnQ0VDZ0NOQ0lJUVFvZ0NFRUtTeHRKRFFBZ0NpRUdEQUlMSUFwQkFXc2lDaUFHU3cwQUN3c2dBQ2dDdkFraERBTkFRUUFoQ2lBSklBd2dCa0hZQVd4cUlnY29BZ1JIQkVCQkF5RU1EQk1MSUFjb0FzUUJJZ2hGQkVCQkF5RU1EQk1MSUFjZ0NFRUJhellDeEFFZ0FDZ0NtQWtpQ0NBR1FRRnFJZ2NnQnlBSVNSc2hCeUFBS0FLVUNTSU9JQVpCQW5ScUtBSUFJUTBEUUFKQUlBZ2dCa0VCYWlJR1RRUkFJQWNoQmd3QkN5QU9JQVpCQW5ScUtBSUFJQTFIRFFFTEMwRUFJQVlnQmlBSVJoc2lCZzBBQzBFRElRd01FUXNnQUNnQy9Bb0VRRUVBSVFwQkFDRU5Ba0FnQUNnQ21Ba2lHRVVOQUNBWVFRTnhJUXdnQUNnQ3ZBa2hCMEVBSVFrZ0dFRUJhMEVEVHdSQVFRQWhCaUFZUVh4eElna2hFZ05BSUEwZ0J5QUdRZGdCYkdvb0FzUUJRUUJIYWlBSElBWkJBWEpCMkFGc2FpZ0N4QUZCQUVkcUlBY2dCa0VDY2tIWUFXeHFLQUxFQVVFQVIyb2dCeUFHUVFOeVFkZ0JiR29vQXNRQlFRQkhhaUVOSUFaQkJHb2hCaUFTUVFSckloSU5BQXNMSUF4RkRRQURRQ0FOSUFjZ0NVSFlBV3hxS0FMRUFVRUFSMm9oRFNBSlFRRnFJUWtnREVFQmF5SU1EUUFMQzBFQklRWWdEU0FZUmcwUFFRQWhEQXdSQzBFQUlRcEJBU0VHSUFBb0Fxd0pJQUFvQXBnSlJnME9RUUFoREF3UUN5QUhLQUlRSVFZTElBWkJBVWNOQUNBSEtBSVlEUUFnQzBFQU5nTHNBU0FMUWRBQmFpQUxRZXdCYWhBQ0lRWUNRQUpBSUFzb0F1d0JRWDlHQkVBZ0JrVU5BUXdDQ3lBR1JRMEJDMEVCSVFZTUFnc2dDQ2dDQ0VVTkFDQUxRUUEyQXV3QklBdEIwQUZxSUF0QjdBRnFFQUloQmdKQUlBc29BdXdCUVg5R0JFQWdCZzBDREFFTElBWkZEUUVMUVFFaEJnd0JDeUFJS0FKRUJFQkJBU0VHSUF0QjBBRnFJQXRCekFGcUVBSU5BUXNnQ3lnQzFBRWhCZ0pBSUFzb0F0d0JRUU4wSWd3Z0N5Z0M0QUVpRG1zaUNFRWdUZ1JBSUFZb0FBQWlDRUVZZENBSVFRaDBRWUNBL0FkeGNpQUlRUWgyUVlEK0EzRWdDRUVZZG5KeUlRa2dDeWdDMkFFaUNFVU5BU0FKSUFoMElBWXRBQVJCQ0NBSWEzWnlJUWtNQVFzZ0NFRUJTQVJBUVFBaENRd0JDeUFHTFFBQUlBc29BdGdCSWcxQkdHb2lNblFoQ1NBSUlBMXFRUWhySWcxQkFVZ05BQU5BSUFZdEFBRWdNa0VJYXlJeWRDQUpjaUVKSUExQkNFb2hDQ0FHUVFGcUlRWWdEVUVJYXlFTklBZ05BQXNMSUFzZ0RrRUJhaUlJTmdMZ0FVRi9JUVlnQ0NBTVRRUkFJQXNnQ3lnQzBBRWdDRUVEZG1vMkF0UUJJQWxCSDNZaEJnc2dCa0YvUmlFTkN5QUdJQTF5RFFBZ0FDZ0MvQWtOQUNBS1JRMEFJQW9vQWpRZ0J5Z0NORWNOQUNBS0tBSTRJQWNvQWpoSERRQWdDaWdDV0NBSEtBSllSZzBCQ3lBQVFRQTJBb0FLREFFTElBQW9Bc1FKSWdsRkRRQWdBRUVCTmdLQUNpQUFLQUxnQ1NFTUEwQkJBQ0VHUWYvLy8vOEhJUWRCQUNFS0EwQWdDU0FLUVNoc2FpSUlLQUlZQkVBZ0NDQUdJQWdvQWhBaUNDQUhTQ0lPR3lFR0lBZ2dCeUFPR3lFSEN5QUtRUUZxSWdvZ0RFME5BQ0FHUlEwQ0lBQW9BdEFKSUFBb0F0UUpJZ2hCQkhScUlnY2dCaWdDQURZQ0FDQUhJQVlvQWlRMkFnd2dCeUFHS0FJY05nSUVJQWNnQmlnQ0lEWUNDQ0FBSUFoQkFXbzJBdFFKUVFBaENpQUdRUUEyQWhnZ0JpZ0NGQ0VJUVFBaEJrSC8vLy8vQnlFSElBZ05BQXNnQUNBQUtBTHdDVUVCYXpZQzhBa01BQXNBQ3lBQUlBQW9BZ2cyQWdCQkFpRU1RUUFoTWtFQUlRb01DUXNnQUVLQWdvQ0FnQVEzQWdSQkFDRUtJQUJCQURZQ3RCb2dBRUlBTndJTURBZ0xJQXRCQ0dvZ0MwSHNBV29RQWcwQUlBc29BdXdCSWdaQkgwc05BQ0FMSUFaQkFXbzJBbEFnQzBFSWFpQUxRZXdCYWhBQ0RRQWdDeWdDN0FGQkgwc05BQ0FMS0FJTUlRWUNRQ0FMS0FJVVFRTjBJZ3dnQ3lnQ0dDSU9heUlJUVNCT0JFQWdCaWdBQUNJSFFSaDBJQWRCQ0hSQmdJRDhCM0Z5SUFkQkNIWkJnUDREY1NBSFFSaDJjbkloQnlBTEtBSVFJZ2hGRFFFZ0J5QUlkQ0FHTFFBRVFRZ2dDR3QyY2lFSERBRUxJQWhCQVVnRVFFRUFJUWNNQVFzZ0JpMEFBQ0FMS0FJUUlnbEJHR29pRFhRaEJ5QUlJQWxxUVFocklncEJBVWdOQUFOQUlBWXRBQUVnRFVFSWF5SU5kQ0FIY2lFSElBcEJDRW9oQ0NBR1FRRnFJUVlnQ2tFSWF5RUtJQWdOQUFzTElBc2dEa0VCYWlJSk5nSVlJQXNnQ1VFSGNTSUlOZ0lRSUFrZ0RFc05BQ0FMSUFzb0FnZ2lFaUFKUVFOMmFpSUdOZ0lNSUFkQkFFZ05BQUpBSUF3Z0NXc2lDVUVnVGdSQUlBWW9BQUFpQjBFWWRDQUhRUWgwUVlDQS9BZHhjaUFIUVFoMlFZRCtBM0VnQjBFWWRuSnlJUWNnQ0VVTkFTQUhJQWgwSUFZdEFBUkJDQ0FJYTNaeUlRY01BUXNnQ1VFQlNBUkFRUUFoQnd3QkN5QUdMUUFBSUFoQkdISWlEWFFoQnlBSUlBbHFRUWhySWdwQkFVZ05BQU5BSUFZdEFBRWdEVUVJYXlJTmRDQUhjaUVISUFwQkNFb2hDQ0FHUVFGcUlRWWdDa0VJYXlFS0lBZ05BQXNMSUFzZ0RrRURhaUlHTmdJWUlBc2dCa0VIY1RZQ0VDQUdJQXhMRFFBZ0N5QVNJQVpCQTNacU5nSU1JQWRCLy8vLy8zdExEUUFnQzBFQU5nTFFBU0FMUVFocUlBdEIwQUZxRUFJaEJ5QUxLQUxRQVNJR1FYOUdEUUFnQncwQUlBWkJBV3BCQVhZaUIwRUFJQWRySUFaQkFYRWJRUnBxSWdaQk0wc05BQ0FMSUFZMkFsUWdDMEVBTmdMUUFTQUxRUWhxSUF0QjBBRnFFQUloQnlBTEtBTFFBU0lHUVg5R0RRQWdCdzBBSUFaQkFXcEJBWFlpQjBFQUlBZHJJQVpCQVhFYlFScHFRVE5MRFFBZ0MwRUFOZ0xRQVNBTFFRaHFJQXRCMEFGcUVBSWhCeUFMS0FMUUFTSUdRWDlHRFFBZ0J3MEFJQVpCQVdwQkFYWWlCMEVBSUFkcklBWkJBWEViSWdaQkRHcEJHRXNOQUNBTElBWTJBbGdnQ3lnQ0RDRUdBa0FnQ3lnQ0ZFRURkQ0lJSUFzb0FoZ2lER3NpQ1VFZ1RnUkFJQVlvQUFBaUIwRVlkQ0FIUVFoMFFZQ0EvQWR4Y2lBSFFRaDJRWUQrQTNFZ0IwRVlkbkp5SVFjZ0N5Z0NFQ0lKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFKUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ3lnQ0VDSUtRUmhxSWcxMElRY2dDU0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQXhCQVdvaUNqWUNHQ0FMSUFwQkIzRWlDVFlDRUNBSUlBcEpEUUFnQ3lBSFFSOTJOZ0pjSUFzZ0N5Z0NDQ0lPSUFwQkEzWnFJZ1kyQWd3Q1FDQUlJQXBySWdwQklFNEVRQ0FHS0FBQUlnZEJHSFFnQjBFSWRFR0FnUHdIY1hJZ0IwRUlka0dBL2dOeElBZEJHSFp5Y2lFSElBbEZEUUVnQnlBSmRDQUdMUUFFUVFnZ0NXdDJjaUVIREFFTElBcEJBVWdFUUVFQUlRY01BUXNnQmkwQUFDQUpRUmh5SWcxMElRY2dDU0FLYWtFSWF5SUtRUUZJRFFBRFFDQUdMUUFCSUExQkNHc2lEWFFnQjNJaEJ5QUtRUWhLSVFrZ0JrRUJhaUVHSUFwQkNHc2hDaUFKRFFBTEN5QUxJQXhCQW1vaUNqWUNHQ0FMSUFwQkIzRWlDVFlDRUNBSUlBcEpEUUFnQ3lBSFFSOTJOZ0pnSUFzZ0RpQUtRUU4yYWlJR05nSU1Ba0FnQ0NBS2F5SUtRU0JPQkVBZ0JpZ0FBQ0lIUVJoMElBZEJDSFJCZ0lEOEIzRnlJQWRCQ0haQmdQNERjU0FIUVJoMmNuSWhCeUFKUlEwQklBY2dDWFFnQmkwQUJFRUlJQWxyZG5JaEJ3d0JDeUFLUVFGSUJFQkJBQ0VIREFFTElBWXRBQUFnQ1VFWWNpSU5kQ0VISUFrZ0NtcEJDR3NpQ2tFQlNBMEFBMEFnQmkwQUFTQU5RUWhySWcxMElBZHlJUWNnQ2tFSVNpRUpJQVpCQVdvaEJpQUtRUWhySVFvZ0NRMEFDd3NnQ3lBTVFRTnFJZ1kyQWhnZ0N5QUdRUWR4SWdrMkFoQWdCaUFJU3cwQUlBc2dCMEVmZGpZQ1pDQUxJQTRnQmtFRGRtbzJBZ3dDUUNBSUlBWnJJZ1pCQVd0Qkhrc05BQ0FHSUFscVFRaHJJZ1pCQVVnTkFBTkFJQVpCQ0VvaEJ5QUdRUWhySVFZZ0J3MEFDd3NnQ3lBTUlBbHJRUXRxSWdZMkFoZ2dDeUFHUVFkeE5nSVFJQVlnQ0UwRVFDQUxJQTRnQmtFRGRtbzJBZ3dMSUFBZ0N5Z0NJQ0lIUVFKMGFpSUdLQUtVQVNJSURRRWdCa0hJQUJBSUlnbzJBcFFCSUFwRkRRTU1BZ3NnQ3lnQ05CQUVRUUFoQ2lBTFFRQTJBalFnQ3lnQ09CQUVJQXRCQURZQ09DQUxLQUk4RUFRZ0MwRUFOZ0k4SUFzb0Frd1FCRUVESVF3TUJnc0NRQ0FISUFBb0FnUkhEUUFnQ3lnQ0pDQUFLQUlJUmcwQUlBQkJnUUkyQWdRTElBZ29BaFFRQkNBR0tBS1VBVUVBTmdJVUlBWW9BcFFCS0FJWUVBUWdCaWdDbEFGQkFEWUNHQ0FHS0FLVUFTZ0NIQkFFSUFZb0FwUUJRUUEyQWh3Z0JpZ0NsQUVvQWl3UUJDQUdLQUtVQVVFQU5nSXNJQVlvQXBRQklRb0xJQW9nQzBFZ2FrSElBQkFIR2d0QkFDRUtRUUFoREF3REN5QUxLQUtRQVJBRVFRQWhDaUFMUVFBMkFwQUJJQXNvQXJ3QkVBUkJBeUVNREFJTElBQWdCallDbkFrZ0FDZ0N2QWtoRGtFQUlTSkJBQ0U1SXdCQnNBRnJJZzBrQUNBcktBSUlJaEVFUUNBcktBSUVJaDlCQm5RaFN5QWZRVEJzSVV3Z0gwRUZkQ0VnSUI5QlVHd2hMQ0FSSUI5c0lnWkJCblFoVFNBR1FRaDBJVTVCQUNBZlFRTjBJaHBySWhkQkFYUWhLa0VBSUI5QkJIUWlObXNpSTBFQ2RDRlBJQ05CQVhRaExnTkFBa0FnRGlnQ0NDSUdRUUZHRFFBQ1FBSkFBa0FDUUNBT0tBTElBU0lVUlFSQVFRRWhCd3dCQzBFRklRY2dCa0VDUncwQVFRVkJBU0FPS0FJRUloSWdGQ2dDQkVZYklRY2dEaWdDekFFaUNBMEJRUUFoQ0F3REN5QU9LQUxNQVNJSVJRUkFRUUFoQ0F3REN5QUdRUUpIRFFFZ0RpZ0NCQ0VTQ3lBU0lBZ29BZ1JIRFFFTElBZEJBbkloQndzQ2Z3SkFBbjhnQjBFQ2NTSS9CRUFDUUNBT0tBSUFRUVZOQkVBZ0NDZ0NBRUVHU1EwQkN5QU5RUVEyQWtBZ0RVRUVOZ0pJSUExQkJEWUNPQ0FOUVFRMkFqQU1Bd3RCQWlFTVFRSWhFZ0pBSUE0dkFSd05BQ0FJTHdFd0RRQkJBU0VTSUE0b0FuUWdDQ2dDZkVjTkFDQU9MZ0dFQVNBSUxnR3NBV3NpQmlBR1FSOTFJZ1pxSUFaelFRTkxEUUFnRGk0QmhnRWdDQzRCcmdGcklnWWdCa0VmZFNJR2FpQUdjMEVEU3lFU0N5QU5JQkkyQWpBQ1FDQU9Md0VlRFFBZ0NDOEJNZzBBUVFFaERDQU9LQUowSUFnb0FueEhEUUFnRGk0QmlBRWdDQzRCc0FGcklnWWdCa0VmZFNJR2FpQUdjMEVEU3cwQUlBNHVBWW9CSUFndUFiSUJheUlHSUFaQkgzVWlCbW9nQm5OQkEwc2hEQXNnRFNBTU5nSTRRUUloRTBFQ0lSd0NRQ0FPTHdFa0RRQWdDQzhCT0EwQVFRRWhIQ0FPS0FKNElBZ29Bb0FCUncwQUlBNHVBWlFCSUFndUFid0JheUlHSUFaQkgzVWlCbW9nQm5OQkEwc05BQ0FPTGdHV0FTQUlMZ0crQVdzaUJpQUdRUjkxSWdacUlBWnpRUU5MSVJ3TElBMGdIRFlDUUFKQUlBNHZBU1lOQUNBSUx3RTZEUUJCQVNFVElBNG9BbmdnQ0NnQ2dBRkhEUUFnRGk0Qm1BRWdDQzRCd0FGcklnWWdCa0VmZFNJR2FpQUdjMEVEU3cwQUlBNHVBWm9CSUFndUFjSUJheUlHSUFaQkgzVWlCbW9nQm5OQkEwc2hFd3NnRFNBVE5nSklJQXdnRW5JTkFpQVRJQnh5RFFKQkFBd0JDeUFOUVFBMkFrQWdEVUVBTmdKSUlBMUJBRFlDT0NBTlFRQTJBakJCQUFzaEVrRUJEQUVMUVFFaEVrRUFDeUVKQWtBQ1FBSkFJQWRCQkhFaVFBUkFBa0FnRGlnQ0FDSUhRUVZOQkVBZ0ZDZ0NBRUVHU1EwQkN5QU5RUVEyQW5RZ0RVRUVOZ0tVQVNBTlFRUTJBbFFnRFVFRU5nSTBRUUVoRWd3Q0MwRUNJUVpCQWlFY0FrQWdEaThCSEEwQUlCUXZBU1lOQUVFQklSd2dEaWdDZENBVUtBSjRSdzBBSUE0dUFZUUJJQlF1QVpnQmF5SUtJQXBCSDNVaUNtb2dDbk5CQTBzTkFDQU9MZ0dHQVNBVUxnR2FBV3NpQ2lBS1FSOTFJZ3BxSUFwelFRTkxJUndMSUEwZ0hEWUNOQUpBSUE0dkFTQU5BQ0FVTHdFcURRQkJBU0VHSUE0b0FuUWdGQ2dDZUVjTkFDQU9MZ0dNQVNBVUxnR2dBV3NpQ2lBS1FSOTFJZ3BxSUFwelFRTkxEUUFnRGk0QmpnRWdGQzRCb2dGcklnWWdCa0VmZFNJR2FpQUdjMEVEU3lFR0N5QU5JQVkyQWxSQkFpRVBRUUloRXdKQUlBNHZBU3dOQUNBVUx3RTJEUUJCQVNFVElBNG9BbndnRkNnQ2dBRkhEUUFnRGk0QnBBRWdGQzRCdUFGcklnb2dDa0VmZFNJS2FpQUtjMEVEU3cwQUlBNHVBYVlCSUJRdUFib0JheUlLSUFwQkgzVWlDbW9nQ25OQkEwc2hFd3NnRFNBVE5nSjBBa0FnRGk4Qk1BMEFJQlF2QVRvTkFFRUJJUThnRGlnQ2ZDQVVLQUtBQVVjTkFDQU9MZ0dzQVNBVUxnSEFBV3NpQ2lBS1FSOTFJZ3BxSUFwelFRTkxEUUFnRGk0QnJnRWdGQzRCd2dGcklnb2dDa0VmZFNJS2FpQUtjMEVEU3lFUEN5QU5JQTgyQXBRQlFRRWhFaUFKUlEwQ0lBWWdISElOQWlBUElCTnlEUUpCQUNFU0RBSUxJQTFCQURZQ2RDQU5RUUEyQXBRQklBMUJBRFlDVkNBTlFRQTJBalFnRGlnQ0FDRUhDeUFIUVFaSkRRQWdEVUVETmdLZ0FTQU5Rb09BZ0lBd053S2tBU0FOUVFNMkFwQUJJQTFCQXpZQ2NDQU5RUU0yQXF3QklBMUNnNENBZ0RBM0E1Z0JJQTFDZzRDQWdEQTNBNGdCSUExQ2c0Q0FnREEzQTRBQklBMUNnNENBZ0RBM0EzZ2dEVUtEZ0lDQU1EY0RhQ0FOUW9PQWdJQXdOd05nSUExQ2c0Q0FnREEzQTFnZ0RVS0RnSUNBTURjQ1RDQU5RUU0yQWtRZ0RVRUROZ0k4REFFTEFrQWdCMEVCVFFSQUlBMENmd0pBSUE0dkFTQWlOQTBBSUE0dkFSd05BRUVBREFFTFFRSUxJZ2MyQWxBZ0RRSi9Ba0FnRGk4QklpSWxEUUFnRGk4QkhnMEFRUUFNQVF0QkFnc2lERFlDV0NBTkFuOENRQ0FPTHdFb0lna05BQ0FPTHdFa0RRQkJBQXdCQzBFQ0N5SWNOZ0pnSUEwQ2Z3SkFJQTR2QVNvaUpnMEFJQTR2QVNZTkFFRUFEQUVMUVFJTEloTTJBbWhCQWlFUElBMUJBaUEwUVFCSFFRRjBJQTR2QVN3aU1Sc2lGallDY0NBTlFRSWdKVUVBUjBFQmRDQU9Md0V1SWgwYkloazJBbmdnRFVFQ0lBbEJBRWRCQVhRZ0RpOEJOQ0lWR3lJZU5nS0FBU0FOUVFJZ0prRUFSMEVCZENBT0x3RTJJaThiSWlRMkFvZ0JJQTBnRGk4Qk1DSXpJREZ5UVFCSFFRRjBJZ28yQXBBQklBMGdEaThCTWlJaElCMXlRUUJIUVFGMElpMDJBcGdCSUEwZ0RpOEJPQ0lvSUJWeVFRQkhRUUYwSWhzMkFxQUJJQTBnRGk4Qk9pSVFJQzl5UVFCSFFRRjBJaWsyQXFnQlFRSWhCaUFPTHdFZVJRUkFRUUFoRHlBT0x3RWNRUUJIUVFGMElRWUxJQTBnQmpZQ1BDQU5RUUlnRHlBT0x3RWtJakFiSWc4MkFrUWdEaThCSmlFMUlBMGdFQ0FvY2tFQVIwRUJkQ0lRTmdLc0FTQU5JQ0VnS0hKQkFFZEJBWFFpS0RZQ3BBRWdEU0FoSUROeVFRQkhRUUYwSWlFMkFwd0JJQTBnRlNBdmNrRUFSMEVCZENJdk5nS01BU0FOSUJVZ0hYSkJBRWRCQVhRaUZUWUNoQUVnRFNBZElERnlRUUJIUVFGMElqRTJBbndnRFNBSklDWnlRUUJIUVFGMEloMDJBbXdnRFNBSklDVnlRUUJIUVFGMElnazJBbVFnRFNBbElEUnlRUUJIUVFGMElpVTJBbHdnRFNBd0lEVnlRUUJIUVFGMElqUTJBa3dNQVFzQ2Z3SkFJQTBDZndKQUFrQUNRQUpBQWtBZ0IwRUNhdzRDQUFFQ0N5QU5BbjhDUUNBT0x3RWdJaVVOQUNBT0x3RWNEUUJCQUF3QkMwRUNDeUlITmdKUUlBMENmd0pBSUE0dkFTSWlGUTBBSUE0dkFSNE5BRUVBREFFTFFRSUxJZ3cyQWxnZ0RRSi9Ba0FnRGk4QktDSUpEUUFnRGk4QkpBMEFRUUFNQVF0QkFnc2lIRFlDWUNBTkFuOENRQ0FPTHdFcUloME5BQ0FPTHdFbURRQkJBQXdCQzBFQ0N5SVROZ0pvSUEwQ2Z3SkFJQTR2QVRBaUx3MEFJQTR2QVN3TkFFRUFEQUVMUVFJTElnbzJBcEFCSUEwQ2Z3SkFJQTR2QVRJaUlRMEFJQTR2QVM0TkFFRUFEQUVMUVFJTElpMDJBcGdCSUEwQ2Z3SkFJQTR2QVRnaUtBMEFJQTR2QVRRTkFFRUFEQUVMUVFJTEloczJBcUFCSUEwQ2Z3SkFJQTR2QVRvaUpnMEFJQTR2QVRZTkFFRUFEQUVMUVFJTElpazJBcWdCUVFJaEdVRUNJUllDUUNBbElBNHZBU3dpTTNJTkFFRUJJUllnRGk0QnBBRWdEaTRCakFGcklnWWdCa0VmZFNJR2FpQUdjMEVEU3cwQUlBNHVBYVlCSUE0dUFZNEJheUlHSUFaQkgzVWlCbW9nQm5OQkEwc05BQ0FPS0FKOElBNG9BblJISVJZTElBMGdGallDY0FKQUlCVWdEaThCTGlJMGNnMEFRUUVoR1NBT0xnR29BU0FPTGdHUUFXc2lCaUFHUVI5MUlnWnFJQVp6UVFOTERRQWdEaTRCcWdFZ0RpNEJrZ0ZySWdZZ0JrRWZkU0lHYWlBR2MwRURTdzBBSUE0b0Fud2dEaWdDZEVjaEdRc2dEU0FaTmdKNFFRSWhKRUVDSVI0Q1FDQUpJQTR2QVRRaU1YSU5BRUVCSVI0Z0RpNEJ0QUVnRGk0Qm5BRnJJZ1lnQmtFZmRTSUdhaUFHYzBFRFN3MEFJQTR1QWJZQklBNHVBWjRCYXlJR0lBWkJIM1VpQm1vZ0JuTkJBMHNOQUNBT0tBS0FBU0FPS0FKNFJ5RWVDeUFOSUI0MkFvQUJBa0FnSFNBT0x3RTJJakJ5RFFCQkFTRWtJQTR1QWJnQklBNHVBYUFCYXlJR0lBWkJIM1VpQm1vZ0JuTkJBMHNOQUNBT0xnRzZBU0FPTGdHaUFXc2lCaUFHUVI5MUlnWnFJQVp6UVFOTERRQWdEaWdDZ0FFZ0RpZ0NlRWNoSkFzZ0RTQWtOZ0tJQVNBT0x3RWVEUUlnRGk4QkhBUkFRUUloQmlBTlFRSTJBandnRGk4QkpDSVFEUVpCQUNFUFFRQU1Cd3RCQUNFR0lBMUJBRFlDUEVFQUlROUJBQ0FPTHdFa0loQkZEUVlhREFVTElBMENmd0pBSUE0dkFTQWlEdzBBSUE0dkFSd05BRUVBREFFTFFRSUxJZ2MyQWxBZ0RRSi9Ba0FnRGk4QklpSVZEUUFnRGk4QkhnMEFRUUFNQVF0QkFnc2lERFlDV0NBTkFuOENRQ0FPTHdFb0lpZ05BQ0FPTHdFa0RRQkJBQXdCQzBFQ0N5SWNOZ0pnSUEwQ2Z3SkFJQTR2QVNvaUhRMEFJQTR2QVNZTkFFRUFEQUVMUVFJTEloTTJBbWdnRFNBT0x3RXNJZ2tnRDNKQkFFZEJBWFFpRmpZQ2NDQU5JQTR2QVM0aUppQVZja0VBUjBFQmRDSVpOZ0o0SUEwZ0RpOEJOQ0l6SUNoeVFRQkhRUUYwSWg0MkFvQUJJQTBnRGk4Qk5pSWxJQjF5UVFCSFFRRjBJaVEyQW9nQklBMUJBaUFKUVFCSFFRRjBJQTR2QVRBaUlSc2lDallDa0FFZ0RVRUNJQ1pCQUVkQkFYUWdEaThCTWlJMUd5SXROZ0tZQVNBTlFRSWdNMEVBUjBFQmRDQU9Md0U0SWpjYkloczJBcUFCSUExQkFpQWxRUUJIUVFGMElBNHZBVG9pRUJzaUtUWUNxQUVnRFFKL0FrQWdEaThCSGlJNkRRQWdEaThCSEEwQVFRQU1BUXRCQWdzaUJqWUNQQ0FPTHdFbUJFQWdEaThCSkNFd0RBTUxJQTR2QVNRaU1BMENRUUFoTUVFQURBTUxJQTR1QVlZQklRWWdEaTRCamdFaENVRUNJUXdnRFFKL1FRSWdEaThCSUNKQklBNHZBUndpTzNJTkFCcEJBU0FPTGdHTUFTQU9MZ0dFQVdzaUJ5QUhRUjkxSWdkcUlBZHpRUU5MRFFBYUlBa2dCbXNpQnlBSFFSOTFJZ2RxSUFkelFRTkxDeUlITmdKUUlBNHVBWW9CSVIwZ0RpNEJrZ0VoRlFKQUlBNHZBU0lpTHlBT0x3RWVJaVZ5RFFCQkFTRU1JQTR1QVpBQklBNHVBWWdCYXlJS0lBcEJIM1VpQ21vZ0NuTkJBMHNOQUNBVklCMXJJZ29nQ2tFZmRTSUthaUFLYzBFRFN5RU1DeUFOSUF3MkFsZ2dEaTRCbGdFaE5DQU9MZ0dlQVNFUVFRSWhFeUFOQW45QkFpQU9Md0VvSWpFZ0RpOEJKQ0pDY2cwQUdrRUJJQTR1QVp3QklBNHVBWlFCYXlJS0lBcEJIM1VpQ21vZ0NuTkJBMHNOQUJvZ0VDQTBheUlLSUFwQkgzVWlDbW9nQ25OQkEwc0xJaHcyQW1BZ0RpNEJtZ0VoUXlBT0xnR2lBU0VtQWtBZ0RpOEJLaUpFSUE0dkFTWWlVSElOQUVFQklSTWdEaTRCb0FFZ0RpNEJtQUZySWdvZ0NrRWZkU0lLYWlBS2MwRURTdzBBSUNZZ1Eyc2lDaUFLUVI5MUlncHFJQXB6UVFOTElSTUxJQTBnRXpZQ2FDQU9MZ0dtQVNFelFRSWhHVUVDSVJZQ1FDQkJJQTR2QVN3aVJYSU5BRUVCSVJZZ0RpNEJwQUVnRGk0QmpBRnJJZ29nQ2tFZmRTSUthaUFLYzBFRFN3MEFJRE1nQ1dzaUNpQUtRUjkxSWdwcUlBcHpRUU5MRFFBZ0RpZ0NmQ0FPS0FKMFJ5RVdDeUFOSUJZMkFuQWdEaTRCcWdFaElRSkFJQzhnRGk4QkxpSXdjZzBBUVFFaEdTQU9MZ0dvQVNBT0xnR1FBV3NpQ2lBS1FSOTFJZ3BxSUFwelFRTkxEUUFnSVNBVmF5SUtJQXBCSDNVaUNtb2dDbk5CQTBzTkFDQU9LQUo4SUE0b0FuUkhJUmtMSUEwZ0dUWUNlQ0FPTGdHMkFTRW9RUUloSkVFQ0lSNENRQ0F4SUE0dkFUUWlOWElOQUVFQklSNGdEaTRCdEFFZ0RpNEJuQUZySWdvZ0NrRWZkU0lLYWlBS2MwRURTdzBBSUNnZ0VHc2lDaUFLUVI5MUlncHFJQXB6UVFOTERRQWdEaWdDZ0FFZ0RpZ0NlRWNoSGdzZ0RTQWVOZ0tBQVNBT0xnRzZBU0UzQWtBZ1JDQU9Md0UySWtaeURRQkJBU0VrSUE0dUFiZ0JJQTR1QWFBQmF5SUtJQXBCSDNVaUNtb2dDbk5CQTBzTkFDQTNJQ1pySWdvZ0NrRWZkU0lLYWlBS2MwRURTdzBBSUE0b0FvQUJJQTRvQW5oSElTUUxJQTBnSkRZQ2lBRWdEaTRCcmdFaFIwRUNJUzBnRFFKL1FRSWdSU0FPTHdFd0lsRnlEUUFhUVFFZ0RpNEJyQUVnRGk0QnBBRnJJZ29nQ2tFZmRTSUthaUFLYzBFRFN3MEFHaUJISUROcklnb2dDa0VmZFNJS2FpQUtjMEVEU3dzaUNqWUNrQUVnRGk0QnNnRWhPZ0pBSURBZ0RpOEJNaUpJY2cwQVFRRWhMU0FPTGdHd0FTQU9MZ0dvQVdzaUR5QVBRUjkxSWc5cUlBOXpRUU5MRFFBZ09pQWhheUlQSUE5QkgzVWlEMm9nRDNOQkEwc2hMUXNnRFNBdE5nS1lBU0FPTGdHK0FTRStRUUloS1NBTkFuOUJBaUExSUE0dkFUZ2lTWElOQUJwQkFTQU9MZ0c4QVNBT0xnRzBBV3NpRHlBUFFSOTFJZzlxSUE5elFRTkxEUUFhSUQ0Z0tHc2lEeUFQUVI5MUlnOXFJQTl6UVFOTEN5SWJOZ0tnQVNBT0xnSENBU0ZLQWtBZ1JpQU9Md0U2SWxKeURRQkJBU0VwSUE0dUFjQUJJQTR1QWJnQmF5SVBJQTlCSDNVaUQyb2dEM05CQTBzTkFDQktJRGRySWc4Z0QwRWZkU0lQYWlBUGMwRURTeUVwQ3lBTklDazJBcWdCUVFJaER5QU5BbjlCQWlBbElEdHlEUUFhUVFFZ0RpNEJpQUVnRGk0QmhBRnJJanNnTzBFZmRTSTdhaUE3YzBFRFN3MEFHaUFkSUFacklnWWdCa0VmZFNJR2FpQUdjMEVEU3dzaUJqWUNQQUpBSUNVZ1FuSU5BRUVCSVE4Z0RpNEJsQUVnRGk0QmlBRnJJaVVnSlVFZmRTSWxhaUFsYzBFRFN3MEFJRFFnSFdzaUhTQWRRUjkxSWgxcUlCMXpRUU5MRFFBZ0RpZ0NlQ0FPS0FKMFJ5RVBDeUFOSUE4MkFrUkJBaUVsSUEwQ2YwRUNJRUlnVUhJTkFCcEJBU0FPTGdHWUFTQU9MZ0dVQVdzaUhTQWRRUjkxSWgxcUlCMXpRUU5MRFFBYUlFTWdOR3NpSFNBZFFSOTFJaDFxSUIxelFRTkxDeUkwTmdKTUFrQWdMeUJCY2cwQVFRRWhKU0FPTGdHUUFTQU9MZ0dNQVdzaUhTQWRRUjkxSWgxcUlCMXpRUU5MRFFBZ0ZTQUpheUlKSUFsQkgzVWlDV29nQ1hOQkEwc2hKUXNnRFNBbE5nSmNRUUloSFVFQ0lRa0NRQ0F2SURGeURRQkJBU0VKSUE0dUFad0JJQTR1QVpBQmF5SXZJQzlCSDNVaUwyb2dMM05CQTBzTkFDQVFJQlZySWhVZ0ZVRWZkU0lWYWlBVmMwRURTdzBBSUE0b0FuZ2dEaWdDZEVjaENRc2dEU0FKTmdKa0FrQWdNU0JFY2cwQVFRRWhIU0FPTGdHZ0FTQU9MZ0djQVdzaUZTQVZRUjkxSWhWcUlCVnpRUU5MRFFBZ0ppQVFheUlWSUJWQkgzVWlGV29nRlhOQkEwc2hIUXNnRFNBZE5nSnNRUUloRlNBTkFuOUJBaUF3SUVWeURRQWFRUUVnRGk0QnFBRWdEaTRCcEFGckloQWdFRUVmZFNJUWFpQVFjMEVEU3cwQUdpQWhJRE5ySWhBZ0VFRWZkU0lRYWlBUWMwRURTd3NpTVRZQ2ZBSkFJREFnTlhJTkFFRUJJUlVnRGk0QnRBRWdEaTRCcUFGckloQWdFRUVmZFNJUWFpQVFjMEVEU3cwQUlDZ2dJV3NpRUNBUVFSOTFJaEJxSUJCelFRTkxEUUFnRGlnQ2dBRWdEaWdDZkVjaEZRc2dEU0FWTmdLRUFVRUNJU0VnRFFKL1FRSWdOU0JHY2cwQUdrRUJJQTR1QWJnQklBNHVBYlFCYXlJUUlCQkJIM1VpRUdvZ0VITkJBMHNOQUJvZ055QW9heUlRSUJCQkgzVWlFR29nRUhOQkEwc0xJaTgyQW93QkFrQWdTQ0JSY2cwQVFRRWhJU0FPTGdHd0FTQU9MZ0dzQVdzaUVDQVFRUjkxSWhCcUlCQnpRUU5MRFFBZ09pQkhheUlRSUJCQkgzVWlFR29nRUhOQkEwc2hJUXNnRFNBaE5nS2NBVUVDSVJCQkFpRW9Ba0FnU0NCSmNnMEFRUUVoS0NBT0xnRzhBU0FPTGdHd0FXc2lKaUFtUVI5MUlpWnFJQ1p6UVFOTERRQWdQaUE2YXlJbUlDWkJIM1VpSm1vZ0puTkJBMHNOQUNBT0tBS0FBU0FPS0FKOFJ5RW9DeUFOSUNnMkFxUUJBa0FnU1NCU2NnMEFRUUVoRUNBT0xnSEFBU0FPTGdHOEFXc2lKaUFtUVI5MUlpWnFJQ1p6UVFOTERRQWdTaUErYXlJUUlCQkJIM1VpRUdvZ0VITkJBMHNoRUFzZ0RTQVFOZ0tzQVF3RkMwRUNJUVlnRFVFQ05nSThJQTR2QVNRaEVBd0NDMEVDQ3lJME5nSk1JQTBnRUNBM2NrRUFSMEVCZENJUU5nS3NBU0FOSUNFZ05YSkJBRWRCQVhRaUlUWUNuQUVnRFNBbElETnlRUUJIUVFGMElpODJBb3dCSUEwZ0NTQW1ja0VBUjBFQmRDSXhOZ0o4UVFJaENTQU5RUUlnS0VFQVIwRUJkQ0FkR3lJZE5nSnNJQTFCQWlBUFFRQkhRUUYwSUJVYklpVTJBbHhCQWlFUEFrQWdNQ0E2Y2cwQVFRRWhEeUFPTGdHVUFTQU9MZ0dJQVdzaU1DQXdRUjkxSWpCcUlEQnpRUU5MRFFBZ0RpNEJsZ0VnRGk0QmlnRnJJakFnTUVFZmRTSXdhaUF3YzBFRFN3MEFJQTRvQW5nZ0RpZ0NkRWNoRHdzZ0RTQVBOZ0pFQWtBZ0ZTQW9jZzBBUVFFaENTQU9MZ0djQVNBT0xnR1FBV3NpRlNBVlFSOTFJaFZxSUJWelFRTkxEUUFnRGk0Qm5nRWdEaTRCa2dGckloVWdGVUVmZFNJVmFpQVZjMEVEU3cwQUlBNG9BbmdnRGlnQ2RFY2hDUXNnRFNBSk5nSmtRUUloS0VFQ0lSVUNRQ0FtSUROeURRQkJBU0VWSUE0dUFiUUJJQTR1QWFnQmF5SW1JQ1pCSDNVaUptb2dKbk5CQTBzTkFDQU9MZ0cyQVNBT0xnR3FBV3NpSmlBbVFSOTFJaVpxSUNaelFRTkxEUUFnRGlnQ2dBRWdEaWdDZkVjaEZRc2dEU0FWTmdLRUFRSkFJRFVnTjNJTkFFRUJJU2dnRGk0QnZBRWdEaTRCc0FGcklpWWdKa0VmZFNJbWFpQW1jMEVEU3cwQUlBNHVBYjRCSUE0dUFiSUJheUltSUNaQkgzVWlKbW9nSm5OQkEwc05BQ0FPS0FLQUFTQU9LQUo4UnlFb0N5QU5JQ2cyQXFRQkRBSUxRUUloRHlBUUN5RTFJQTBnRHpZQ1JDQU9Md0VtSVRjZ0RTQW1JQ2h5UVFCSFFRRjBJaEEyQXF3QklBMGdJU0FvY2tFQVIwRUJkQ0lvTmdLa0FTQU5RUUlnTDBFQVIwRUJkQ0FoR3lJaE5nS2NBU0FOUVFJZ0NVRUFSMEVCZENBZEd5SWROZ0pzSUExQkFpQVZRUUJIUVFGMElBa2JJZ2syQW1RZ0RVRUNJQ1ZCQUVkQkFYUWdGUnNpSlRZQ1hDQU5JREFnTVhKQkFFZEJBWFFpTHpZQ2pBRWdEU0F4SURSeVFRQkhRUUYwSWhVMkFvUUJJQTBnTXlBMGNrRUFSMEVCZENJeE5nSjhJQTBnTnlBMVFmLy9BM0Z5UVFCSFFRRjBJalEyQWt3TElCSU5BQ0FIRFFBZ0RBMEFJQndOQUNBVERRQWdGZzBBSUJrTkFDQWVEUUFnSkEwQUlBb05BQ0F0RFFBZ0d3MEFJQ2tOQUNBR0RRQWdEdzBBSURRTkFDQWxEUUFnQ1EwQUlCME5BQ0F4RFFBZ0ZRMEFJQzhOQUNBaERRQWdLQTBBSUJCRkRRRUxJQTRvQWd3aEJ5QU5JQTRvQWhBaUNTQU9LQUlVSWdacUlncEJNeUFLUVROSUd5SUtRUUFnQ2tFQVNodEIwQmRxTFFBQUlnbzJBaUFnRFNBR0lBZHFJZ3hCTXlBTVFUTklHeUlNUVFBZ0RFRUFTaHNpRWtHUUYyb3RBQUFpRERZQ0hDQU5JQkpCQTJ4QmtCaHFJaEUyQWhnZ1B3UkFJQTBDZnlBR0lBZ29BaFFpQ0VjRVFDQU5JQVlnQ0dwQkFXcEJBWFlpQ0NBSmFpSVNRVE1nRWtFelNCc2lFa0VBSUJKQkFFb2JRZEFYYWkwQUFEWUNDQ0FOSUFjZ0NHb2lDRUV6SUFoQk0wZ2JJZ2hCQUNBSVFRQktHeUlJUVpBWGFpMEFBRFlDQkNBSVFRTnNRWkFZYWd3QkN5QU5JQW8yQWdnZ0RTQU1OZ0lFSUJFTE5nSUFDeUJBQkVBQ1FDQUdJQlFvQWhRaUNFY0VRQ0FOSUFZZ0NHcEJBV3BCQVhZaUJpQUphaUlJUVRNZ0NFRXpTQnNpQ0VFQUlBaEJBRW9iUWRBWGFpMEFBRFlDRkNBTklBWWdCMm9pQmtFeklBWkJNMGdiSWdaQkFDQUdRUUJLR3lJR1FaQVhhaTBBQURZQ0VDQUdRUU5zUVpBWWFpRVJEQUVMSUEwZ0NqWUNGQ0FOSUF3MkFoQUxJQTBnRVRZQ0RBc2dLeWdDQUNBZklEbHNJaDVCQ0hScUlDSkJCSFJxSVFsQkFDRWJRUU1oQnlBTlFUQnFJUThEUUNBUEtBSUVJZ1lFUUNBSklBWWdEU2dDRENBTktBSVFJQTBvQWhRZ05oQVRDeUFQS0FJTUlnWUVRQ0FKUVFScUlBWWdEU2dDR0NBTktBSWNJQTBvQWlBZ05oQVRDeUFQS0FJVUlnWUVRQ0FKUVFocUlBWWdEU2dDR0NBTktBSWNJQTBvQWlBZ05oQVRDeUFQS0FJY0lnWUVRQ0FKUVF4cUlBWWdEU2dDR0NBTktBSWNJQTBvQWlBZ05oQVRDeUFISVF3Q1FBSkFBa0FnRHlnQ0FDSUdJQThvQWdnaUVVY05BQ0FHSUE4b0FoQkhEUUFnQmlBUEtBSVlSdzBBSUFaRkRRSWdEU0FiUVF4c2FpSUhLQUlJSVJJZ0J5Z0NCQ0VRSUFaQkJFa05BU0FRUVFKMlFRSnFJUmxCRUNFUklBa2hCd05BQWtBZ0J5QWphaUlHTFFBQUloUWdCeTBBQUNJVGF5SUlJQWhCSDNVaUNHb2dDSE1pQ0NBUVR3MEFJQWNnTG1vaUlTMEFBQ0ljSUJScklnb2dDa0VmZFNJS2FpQUtjeUFTVHcwQUlBY2dObW9pSkMwQUFDSVZJQk5ySWdvZ0NrRWZkU0lLYWlBS2N5QVNUdzBBQW44Q1FDQUlJQmxKQkVBZ0J5QWdhaUlJTFFBQUlSc0NmeUFTSUFjZ0xHb2lDaTBBQUNJV0lCUnJJaWdnS0VFZmRTSW9haUFvYzBzRVFDQUdJQlVnRXlBVWFpQWNhaUlHUVFGMGFpQVdha0VFYWtFRGRqb0FBQ0FoSUFZZ0ZtcEJBbXBCQW5ZNkFBQWdCaUFXUVFOc2FpQUhJRTlxTFFBQVFRRjBha0VFYWtFRGRnd0JDeUFHSVFvZ0ZDQVZhaUFjUVFGMGFrRUNha0VDZGdzaEJpQUtJQVk2QUFBZ0d5QVRheUlHSUFaQkgzVWlCbW9nQm5NZ0VrOE5BU0FISUJ3Z0ZDQVZhaUFUYWlJR1FRRjBhaUFiYWtFRWFrRURkam9BQUNBa0lBWWdHMnBCQW1wQkFuWTZBQUFnQmlBYlFRTnNhaUFISUV4cUxRQUFRUUYwYWtFRWFrRURkZ3dDQ3lBR0lCUWdGV29nSEVFQmRHcEJBbXBCQW5ZNkFBQUxJQWNoQ0NBVElCeHFJQlZCQVhScVFRSnFRUUoyQ3lFR0lBZ2dCam9BQUFzZ0IwRUJhaUVISUJGQkFXc2lFUTBBQ3d3Q0N3Si9JQVlFUUNBTklCdEJER3hxSWhZaEdVRUVJUklnQmlBV0tBSUFha0VCYXkwQUFDSUlRUUZxSVFwQkFDQUlheUVjSUFraEJ3TkFBa0FnRmlnQ0JDQUhJQ05xSWlFdEFBQWlGQ0FITFFBQUloTnJJZ1lnQmtFZmRTSUdhaUFHYzAwTkFDQVpLQUlJSWhFZ0J5QXVhaUlrTFFBQUloVWdGR3NpQmlBR1FSOTFJZ1pxSUFaelRRMEFJQWNnTm1vaUtDMEFBQ0lRSUJOcklnWWdCa0VmZFNJR2FpQUdjeUFSVHcwQUlBZ2hCaUFSSUFjZ0xHb3RBQUFpTFNBVWF5SXBJQ2xCSDNVaUtXb2dLWE5MQkVBZ0pDQVZJQndnQ0NBVElCUnFRUUZxUVFGMklCVkJBWFJySUMxcVFRRjFJZ1lnQmlBSVNoc2dCaUFjU0J0cU9nQUFJQmtvQWdnaEVTQUtJUVlMSUNFQ2Z5QVJJQWNnSUdvdEFBQWlJU0FUYXlJa0lDUkJIM1VpSkdvZ0pITkxCRUFnS0NBUUlCd2dDQ0FUSUJScVFRRnFRUUYySUJCQkFYUnJJQ0ZxUVFGMUloRWdDQ0FSU0JzZ0VTQWNTQnRxT2dBQUlBWkJBV29oQmd0QkFDQUdheUloQ3lBR0lCVWdFR3NnRXlBVWEwRUNkR3BCQkdwQkEzVWlFU0FHSUJGSUd5QVJJQ0ZJR3lJR0lCUnFRY0ExYWkwQUFEb0FBQ0FISUJNZ0JtdEJ3RFZxTFFBQU9nQUFDeUFIUVFGcUlRY2dFa0VCYXlJU0RRQUxJQThvQWdnaEVRc2dFUXNFUUVFRUlSSWdDVUVFYWlFSElBMGdHMEVNYkdvaUZpRVpJQkVnRmlnQ0FHcEJBV3N0QUFBaUNFRUJhaUVLUVFBZ0NHc2hIQU5BQWtBZ0ZpZ0NCQ0FISUNOcUlpRXRBQUFpRkNBSExRQUFJaE5ySWdZZ0JrRWZkU0lHYWlBR2MwME5BQ0FaS0FJSUloRWdCeUF1YWlJa0xRQUFJaFVnRkdzaUJpQUdRUjkxSWdacUlBWnpUUTBBSUFjZ05tb2lLQzBBQUNJUUlCTnJJZ1lnQmtFZmRTSUdhaUFHY3lBUlR3MEFJQWdoQmlBUklBY2dMR290QUFBaUxTQVVheUlwSUNsQkgzVWlLV29nS1hOTEJFQWdKQ0FWSUJ3Z0NDQVRJQlJxUVFGcVFRRjJJQlZCQVhScklDMXFRUUYxSWdZZ0JpQUlTaHNnQmlBY1NCdHFPZ0FBSUJrb0FnZ2hFU0FLSVFZTElDRUNmeUFSSUFjZ0lHb3RBQUFpSVNBVGF5SWtJQ1JCSDNVaUpHb2dKSE5MQkVBZ0tDQVFJQndnQ0NBVElCUnFRUUZxUVFGMklCQkJBWFJySUNGcVFRRjFJaEVnQ0NBUlNCc2dFU0FjU0J0cU9nQUFJQVpCQVdvaEJndEJBQ0FHYXlJaEN5QUdJQlVnRUdzZ0V5QVVhMEVDZEdwQkJHcEJBM1VpRVNBR0lCRklHeUFSSUNGSUd5SUdJQlJxUWNBMWFpMEFBRG9BQUNBSElCTWdCbXRCd0RWcUxRQUFPZ0FBQ3lBSFFRRnFJUWNnRWtFQmF5SVNEUUFMQ3lBUEtBSVFJZ1lFUUNBSlFRaHFJUWNnRFNBYlFReHNhaUlXSVJsQkJDRVNJQVlnRmlnQ0FHcEJBV3N0QUFBaUNFRUJhaUVLUVFBZ0NHc2hIQU5BQWtBZ0ZpZ0NCQ0FISUNOcUlpRXRBQUFpRkNBSExRQUFJaE5ySWdZZ0JrRWZkU0lHYWlBR2MwME5BQ0FaS0FJSUloRWdCeUF1YWlJa0xRQUFJaFVnRkdzaUJpQUdRUjkxSWdacUlBWnpUUTBBSUFjZ05tb2lLQzBBQUNJUUlCTnJJZ1lnQmtFZmRTSUdhaUFHY3lBUlR3MEFJQWdoQmlBUklBY2dMR290QUFBaUxTQVVheUlwSUNsQkgzVWlLV29nS1hOTEJFQWdKQ0FWSUJ3Z0NDQVRJQlJxUVFGcVFRRjJJQlZCQVhScklDMXFRUUYxSWdZZ0JpQUlTaHNnQmlBY1NCdHFPZ0FBSUJrb0FnZ2hFU0FLSVFZTElDRUNmeUFSSUFjZ0lHb3RBQUFpSVNBVGF5SWtJQ1JCSDNVaUpHb2dKSE5MQkVBZ0tDQVFJQndnQ0NBVElCUnFRUUZxUVFGMklCQkJBWFJySUNGcVFRRjFJaEVnQ0NBUlNCc2dFU0FjU0J0cU9nQUFJQVpCQVdvaEJndEJBQ0FHYXlJaEN5QUdJQlVnRUdzZ0V5QVVhMEVDZEdwQkJHcEJBM1VpRVNBR0lCRklHeUFSSUNGSUd5SUdJQlJxUWNBMWFpMEFBRG9BQUNBSElCTWdCbXRCd0RWcUxRQUFPZ0FBQ3lBSFFRRnFJUWNnRWtFQmF5SVNEUUFMQ3lBUEtBSVlJZ1pGRFFFZ0NVRU1haUVISUEwZ0cwRU1iR29pRUNFV1FRUWhFaUFHSUJBb0FnQnFRUUZyTFFBQUlnaEJBV29oQ2tFQUlBaHJJUndEUUFKQUlCQW9BZ1FnQnlBamFpSVpMUUFBSWhRZ0J5MEFBQ0lUYXlJR0lBWkJIM1VpQm1vZ0JuTk5EUUFnRmlnQ0NDSVJJQWNnTG1vaUlTMEFBQ0lWSUJScklnWWdCa0VmZFNJR2FpQUdjMDBOQUNBSElEWnFJaVF0QUFBaUd5QVRheUlHSUFaQkgzVWlCbW9nQm5NZ0VVOE5BQ0FJSVFZZ0VTQUhJQ3hxTFFBQUlpZ2dGR3NpTFNBdFFSOTFJaTFxSUMxelN3UkFJQ0VnRlNBY0lBZ2dFeUFVYWtFQmFrRUJkaUFWUVFGMGF5QW9ha0VCZFNJR0lBWWdDRW9iSUFZZ0hFZ2Jham9BQUNBV0tBSUlJUkVnQ2lFR0N5QVpBbjhnRVNBSElDQnFMUUFBSWhrZ0Uyc2lJU0FoUVI5MUlpRnFJQ0Z6U3dSQUlDUWdHeUFjSUFnZ0V5QVVha0VCYWtFQmRpQWJRUUYwYXlBWmFrRUJkU0lSSUFnZ0VVZ2JJQkVnSEVnYmFqb0FBQ0FHUVFGcUlRWUxRUUFnQm1zaUdRc2dCaUFWSUJ0cklCTWdGR3RCQW5ScVFRUnFRUU4xSWhFZ0JpQVJTQnNnRVNBWlNCc2lCaUFVYWtIQU5Xb3RBQUE2QUFBZ0J5QVRJQVpyUWNBMWFpMEFBRG9BQUFzZ0IwRUJhaUVISUJKQkFXc2lFZzBBQ3d3QkN5QUdJQWNvQWdCcVFRRnJMUUFBSWdaQkFXb2hDa0VBSUFacklSeEJFQ0VSSUFraEJ3TkFBa0FnQnlBamFpSVdMUUFBSWhRZ0J5MEFBQ0lUYXlJSUlBaEJIM1VpQ0dvZ0NITWdFRThOQUNBSElDNXFJaGt0QUFBaUZTQVVheUlJSUFoQkgzVWlDR29nQ0hNZ0VrOE5BQ0FISURacUlpRXRBQUFpR3lBVGF5SUlJQWhCSDNVaUNHb2dDSE1nRWs4TkFDQUdJUWdnRWlBSElDeHFMUUFBSWlRZ0ZHc2lLQ0FvUVI5MUlpaHFJQ2h6U3dSQUlCa2dGU0FjSUFZZ0V5QVVha0VCYWtFQmRpQVZRUUYwYXlBa2FrRUJkU0lJSUFZZ0NFZ2JJQWdnSEVnYmFqb0FBQ0FLSVFnTElCWWdGQUovSUJJZ0J5QWdhaTBBQUNJV0lCTnJJaGtnR1VFZmRTSVphaUFaYzBzRVFDQWhJQnNnSENBR0lCTWdGR3BCQVdwQkFYWWdHMEVCZEdzZ0ZtcEJBWFVpRmlBR0lCWklHeUFXSUJ4SUcybzZBQUFnQ0VFQmFpRUlDMEVBSUFockloWUxJQWdnRlNBYmF5QVRJQlJyUVFKMGFrRUVha0VEZFNJVklBZ2dGVWdiSUJVZ0ZrZ2JJZ2hxUWNBMWFpMEFBRG9BQUNBSElCTWdDR3RCd0RWcUxRQUFPZ0FBQ3lBSFFRRnFJUWNnRVVFQmF5SVJEUUFMQ3lBTVFRRnJJUWNnRDBFZ2FpRVBJQWtnUzJvaENVRUNJUnNnREEwQUN5QU9LQUlNSVFZZ0RTQU9LQUlRSWdrZ0RpZ0NGQ0lLSUE0b0FoZ2lER29pQjBFeklBZEJNMGdiSWdkQkFDQUhRUUJLRzBFQ2RFSFFQV29vQWdBaUIyb2lDRUV6SUFoQk0wZ2JJZ2hCQUNBSVFRQktHMEhRRjJvdEFBQWlFallDSUNBTklBWWdCMm9pQ0VFeklBaEJNMGdiSWdoQkFDQUlRUUJLR3lJSVFaQVhhaTBBQUNJUk5nSWNJQTBnQ0VFRGJFR1FHR29pQ0RZQ0dDQS9CRUFnRFFKL0lBb2dEaWdDekFFb0FoUWlEMGNFUUNBTklBY2dEQ0FQYWlJUFFUTWdEMEV6U0JzaUQwRUFJQTlCQUVvYlFRSjBRZEE5YWlnQ0FHcEJBV3BCQVhZaUR5QUphaUlVUVRNZ0ZFRXpTQnNpRkVFQUlCUkJBRW9iUWRBWGFpMEFBRFlDQ0NBTklBWWdEMm9pRDBFeklBOUJNMGdiSWc5QkFDQVBRUUJLR3lJUFFaQVhhaTBBQURZQ0JDQVBRUU5zUVpBWWFnd0JDeUFOSUJJMkFnZ2dEU0FSTmdJRUlBZ0xOZ0lBQ3lCQUJFQUNRQ0FLSUE0b0FzZ0JLQUlVSWc5SEJFQWdEU0FISUF3Z0Qyb2lDRUV6SUFoQk0wZ2JJZ2hCQUNBSVFRQktHMEVDZEVIUVBXb29BZ0JxUVFGcVFRRjJJZ2NnQ1dvaUNFRXpJQWhCTTBnYklnaEJBQ0FJUVFCS0cwSFFGMm90QUFBMkFoUWdEU0FHSUFkcUlnWkJNeUFHUVROSUd5SUdRUUFnQmtFQVNoc2lCa0dRRjJvdEFBQTJBaEFnQmtFRGJFR1FHR29oQ0F3QkN5QU5JQkkyQWhRZ0RTQVJOZ0lRQ3lBTklBZzJBZ3dMSUNzb0FnQWdUbW9nSGtFR2RHb2dJa0VEZEdvaUJ5Qk5haUVTUVFFaEhFRUFJUVlnRFVFd2FpRVJBMEFDUUNBUktBSUVJZ2xGRFFBQ1FDQU5LQUlRSWdnZ0IwRUJheUlUTFFBQUlnb2dCeTBBQUNJTWF5SVBJQTlCSDNVaUQyb2dEM05ORFFBZ0RTZ0NGQ0lWSUFkQkFtc3RBQUFpRHlBS2F5SVVJQlJCSDNVaUZHb2dGSE5ORFFBZ0ZTQUhMUUFCSWhRZ0RHc2lHeUFiUVI5MUlodHFJQnR6VFEwQUlBY0NmeUFKUVFOTkJFQWdFeUFKSUEwb0FneHFRUUZyTFFBQUlnaEJmM01pRXlBSVFRRnFJaFVnRENBS2EwRUNkQ0FVYXlBUGFrRUVha0VEZFNJSUlBZ2dGVW9iSUFnZ0UwZ2JJZ2dnQ21wQndEVnFMUUFBT2dBQUlBd2dDR3RCd0RWcUxRQUFEQUVMSUJNZ0NpQVVhaUFQUVFGMGFrRUNha0VDZGpvQUFDQU1JQlJCQVhScUlBOXFRUUpxUVFKMkN6b0FBQ0FOS0FJUUlRZ0xBa0FnQnlBYWFpSUtRUUZySWhVdEFBQWlEQ0FLTFFBQUlnOXJJaFFnRkVFZmRTSVVhaUFVY3lBSVR3MEFJQTBvQWhRaUd5QUtRUUpyTFFBQUloUWdER3NpRXlBVFFSOTFJaE5xSUJOelRRMEFJQnNnQ2kwQUFTSVRJQTlySWhBZ0VFRWZkU0lRYWlBUWMwME5BQ0FLQW44Z0NVRURUUVJBSUJVZ0NTQU5LQUlNYWtFQmF5MEFBQ0lJUVg5eklna2dDRUVCYWlJS0lBOGdER3RCQW5RZ0Uyc2dGR3BCQkdwQkEzVWlDQ0FJSUFwS0d5QUlJQWxJR3lJSUlBeHFRY0ExYWkwQUFEb0FBQ0FQSUFoclFjQTFhaTBBQUF3QkN5QVZJQXdnRTJvZ0ZFRUJkR3BCQW1wQkFuWTZBQUFnRHlBVFFRRjBhaUFVYWtFQ2FrRUNkZ3M2QUFBZ0RTZ0NFQ0VJQ3lBUktBSUVJUWtDUUNBU1FRRnJJaE10QUFBaUNpQVNMUUFBSWd4cklnOGdEMEVmZFNJUGFpQVBjeUFJVHcwQUlBMG9BaFFpRlNBU1FRSnJMUUFBSWc4Z0Ntc2lGQ0FVUVI5MUloUnFJQlJ6VFEwQUlCVWdFaTBBQVNJVUlBeHJJaHNnRzBFZmRTSWJhaUFiYzAwTkFDQVNBbjhnQ1VFRFRRUkFJQk1nQ1NBTktBSU1ha0VCYXkwQUFDSUlRWDl6SWhNZ0NFRUJhaUlWSUF3Z0NtdEJBblFnRkdzZ0QycEJCR3BCQTNVaUNDQUlJQlZLR3lBSUlCTklHeUlJSUFwcVFjQTFhaTBBQURvQUFDQU1JQWhyUWNBMWFpMEFBQXdCQ3lBVElBb2dGR29nRDBFQmRHcEJBbXBCQW5ZNkFBQWdEQ0FVUVFGMGFpQVBha0VDYWtFQ2RnczZBQUFnRFNnQ0VDRUlDeUFJSUJJZ0dtb2lDa0VCYXlJVExRQUFJZ3dnQ2kwQUFDSVBheUlVSUJSQkgzVWlGR29nRkhOTkRRQWdEU2dDRkNJVklBcEJBbXN0QUFBaUNDQU1heUlVSUJSQkgzVWlGR29nRkhOTkRRQWdGU0FLTFFBQkloUWdEMnNpR3lBYlFSOTFJaHRxSUJ0elRRMEFJQW9DZnlBSlFRTk5CRUFnRXlBSklBMG9BZ3hxUVFGckxRQUFJZ2xCZjNNaUNpQUpRUUZxSWdrZ0R5QU1hMEVDZENBVWF5QUlha0VFYWtFRGRTSUlJQWdnQ1VvYklBZ2dDa2diSWdnZ0RHcEJ3RFZxTFFBQU9nQUFJQThnQ0d0QndEVnFMUUFBREFFTElCTWdEQ0FVYWlBSVFRRjBha0VDYWtFQ2Rqb0FBQ0FQSUJSQkFYUnFJQWhxUVFKcVFRSjJDem9BQUFzQ1FDQVJLQUlrSWdwRkRRQUNRQ0FOS0FJUUlnZ2dCeUEyYWlJSlFRRnJJaFV0QUFBaURDQUpMUUFBSWc5ckloUWdGRUVmZFNJVWFpQVVjMDBOQUNBTktBSVVJaHNnQ1VFQ2F5MEFBQ0lVSUF4ckloTWdFMEVmZFNJVGFpQVRjMDBOQUNBYklBa3RBQUVpRXlBUGF5SVFJQkJCSDNVaUVHb2dFSE5ORFFBZ0NRSi9JQXBCQTAwRVFDQVZJQW9nRFNnQ0RHcEJBV3N0QUFBaUNFRi9jeUlWSUFoQkFXb2lHeUFQSUF4clFRSjBJQk5ySUJScVFRUnFRUU4xSWdnZ0NDQWJTaHNnQ0NBVlNCc2lDQ0FNYWtIQU5Xb3RBQUE2QUFBZ0R5QUlhMEhBTldvdEFBQU1BUXNnRlNBTUlCTnFJQlJCQVhScVFRSnFRUUoyT2dBQUlBOGdFMEVCZEdvZ0ZHcEJBbXBCQW5ZTE9nQUFJQTBvQWhBaENBc0NRQ0FKSUJwcUlnbEJBV3NpRlMwQUFDSU1JQWt0QUFBaUQyc2lGQ0FVUVI5MUloUnFJQlJ6SUFoUERRQWdEU2dDRkNJYklBbEJBbXN0QUFBaUZDQU1heUlUSUJOQkgzVWlFMm9nRTNOTkRRQWdHeUFKTFFBQkloTWdEMnNpRUNBUVFSOTFJaEJxSUJCelRRMEFJQWtDZnlBS1FRTk5CRUFnRlNBS0lBMG9BZ3hxUVFGckxRQUFJZ2hCZjNNaUNTQUlRUUZxSWdvZ0R5QU1hMEVDZENBVGF5QVVha0VFYWtFRGRTSUlJQWdnQ2tvYklBZ2dDVWdiSWdnZ0RHcEJ3RFZxTFFBQU9nQUFJQThnQ0d0QndEVnFMUUFBREFFTElCVWdEQ0FUYWlBVVFRRjBha0VDYWtFQ2Rqb0FBQ0FQSUJOQkFYUnFJQlJxUVFKcVFRSjJDem9BQUNBTktBSVFJUWdMSUJFb0FpUWhDZ0pBSUJJZ05tb2lDVUVCYXlJVkxRQUFJZ3dnQ1MwQUFDSVBheUlVSUJSQkgzVWlGR29nRkhNZ0NFOE5BQ0FOS0FJVUloc2dDVUVDYXkwQUFDSVVJQXhySWhNZ0UwRWZkU0lUYWlBVGMwME5BQ0FiSUFrdEFBRWlFeUFQYXlJUUlCQkJIM1VpRUdvZ0VITk5EUUFnQ1FKL0lBcEJBMDBFUUNBVklBb2dEU2dDREdwQkFXc3RBQUFpQ0VGL2N5SVZJQWhCQVdvaUd5QVBJQXhyUVFKMElCTnJJQlJxUVFScVFRTjFJZ2dnQ0NBYlNoc2dDQ0FWU0JzaUNDQU1ha0hBTldvdEFBQTZBQUFnRHlBSWEwSEFOV290QUFBTUFRc2dGU0FNSUJOcUlCUkJBWFJxUVFKcVFRSjJPZ0FBSUE4Z0UwRUJkR29nRkdwQkFtcEJBbllMT2dBQUlBMG9BaEFoQ0FzZ0NDQUpJQnBxSWdsQkFXc2lFeTBBQUNJTUlBa3RBQUFpRDJzaUZDQVVRUjkxSWhScUlCUnpUUTBBSUEwb0FoUWlGU0FKUVFKckxRQUFJZ2dnREdzaUZDQVVRUjkxSWhScUlCUnpUUTBBSUJVZ0NTMEFBU0lVSUE5ckloc2dHMEVmZFNJYmFpQWJjMDBOQUNBSkFuOGdDa0VEVFFSQUlCTWdDaUFOS0FJTWFrRUJheTBBQUNJSlFYOXpJZ29nQ1VFQmFpSUpJQThnREd0QkFuUWdGR3NnQ0dwQkJHcEJBM1VpQ0NBSUlBbEtHeUFJSUFwSUd5SUlJQXhxUWNBMWFpMEFBRG9BQUNBUElBaHJRY0ExYWkwQUFBd0JDeUFUSUF3Z0ZHb2dDRUVCZEdwQkFtcEJBblk2QUFBZ0R5QVVRUUYwYWlBSWFrRUNha0VDZGdzNkFBQUxBa0FnRVNnQ0ZDSUpSUTBBSUFkQkJHb2hFd0pBSUEwb0Fod2lDQ0FITFFBRElnb2dCeTBBQkNJTWF5SVBJQTlCSDNVaUQyb2dEM05ORFFBZ0RTZ0NJQ0lWSUFjdEFBSWlEeUFLYXlJVUlCUkJIM1VpRkdvZ0ZITk5EUUFnRlNBSExRQUZJaFFnREdzaUd5QWJRUjkxSWh0cUlCdHpUUTBBSUJNQ2Z5QUpRUU5OQkVBZ0J5QUpJQTBvQWhocVFRRnJMUUFBSWdoQmYzTWlGU0FJUVFGcUloc2dEQ0FLYTBFQ2RDQVVheUFQYWtFRWFrRURkU0lJSUFnZ0cwb2JJQWdnRlVnYklnZ2dDbXBCd0RWcUxRQUFPZ0FESUF3Z0NHdEJ3RFZxTFFBQURBRUxJQWNnQ2lBVWFpQVBRUUYwYWtFQ2FrRUNkam9BQXlBTUlCUkJBWFJxSUE5cVFRSnFRUUoyQ3pvQUFDQU5LQUljSVFnTEFrQWdFeUFhYWlJS1FRRnJJaFV0QUFBaURDQUtMUUFBSWc5ckloUWdGRUVmZFNJVWFpQVVjeUFJVHcwQUlBMG9BaUFpR3lBS1FRSnJMUUFBSWhRZ0RHc2lFeUFUUVI5MUloTnFJQk56VFEwQUlCc2dDaTBBQVNJVElBOXJJaEFnRUVFZmRTSVFhaUFRYzAwTkFDQUtBbjhnQ1VFRFRRUkFJQlVnQ1NBTktBSVlha0VCYXkwQUFDSUlRWDl6SWdrZ0NFRUJhaUlLSUE4Z0RHdEJBblFnRTJzZ0ZHcEJCR3BCQTNVaUNDQUlJQXBLR3lBSUlBbElHeUlJSUF4cVFjQTFhaTBBQURvQUFDQVBJQWhyUWNBMWFpMEFBQXdCQ3lBVklBd2dFMm9nRkVFQmRHcEJBbXBCQW5ZNkFBQWdEeUFUUVFGMGFpQVVha0VDYWtFQ2RnczZBQUFnRFNnQ0hDRUlDeUFTUVFScUlSTWdFU2dDRkNFSkFrQWdFaTBBQXlJS0lCSXRBQVFpREdzaUR5QVBRUjkxSWc5cUlBOXpJQWhQRFFBZ0RTZ0NJQ0lWSUJJdEFBSWlEeUFLYXlJVUlCUkJIM1VpRkdvZ0ZITk5EUUFnRlNBU0xRQUZJaFFnREdzaUd5QWJRUjkxSWh0cUlCdHpUUTBBSUJNQ2Z5QUpRUU5OQkVBZ0VpQUpJQTBvQWhocVFRRnJMUUFBSWdoQmYzTWlGU0FJUVFGcUloc2dEQ0FLYTBFQ2RDQVVheUFQYWtFRWFrRURkU0lJSUFnZ0cwb2JJQWdnRlVnYklnZ2dDbXBCd0RWcUxRQUFPZ0FESUF3Z0NHdEJ3RFZxTFFBQURBRUxJQklnQ2lBVWFpQVBRUUYwYWtFQ2FrRUNkam9BQXlBTUlCUkJBWFJxSUE5cVFRSnFRUUoyQ3pvQUFDQU5LQUljSVFnTElBZ2dFeUFhYWlJS1FRRnJJaE10QUFBaURDQUtMUUFBSWc5ckloUWdGRUVmZFNJVWFpQVVjMDBOQUNBTktBSWdJaFVnQ2tFQ2F5MEFBQ0lJSUF4ckloUWdGRUVmZFNJVWFpQVVjMDBOQUNBVklBb3RBQUVpRkNBUGF5SWJJQnRCSDNVaUcyb2dHM05ORFFBZ0NnSi9JQWxCQTAwRVFDQVRJQWtnRFNnQ0dHcEJBV3N0QUFBaUNVRi9jeUlLSUFsQkFXb2lDU0FQSUF4clFRSjBJQlJySUFocVFRUnFRUU4xSWdnZ0NDQUpTaHNnQ0NBS1NCc2lDQ0FNYWtIQU5Xb3RBQUE2QUFBZ0R5QUlhMEhBTldvdEFBQU1BUXNnRXlBTUlCUnFJQWhCQVhScVFRSnFRUUoyT2dBQUlBOGdGRUVCZEdvZ0NHcEJBbXBCQW5ZTE9nQUFDd0pBSUJFb0FqUWlDa1VOQUNBSElEWnFJZ2xCQkdvaEZBSkFJQTBvQWh3aUNDQUpMUUFESWd3Z0NTMEFCQ0lQYXlJVElCTkJIM1VpRTJvZ0UzTk5EUUFnRFNnQ0lDSWJJQlJCQW1zdEFBQWlFeUFNYXlJVklCVkJIM1VpRldvZ0ZYTk5EUUFnR3lBSkxRQUZJaFVnRDJzaUVDQVFRUjkxSWhCcUlCQnpUUTBBSUJRQ2Z5QUtRUU5OQkVBZ0NTQUtJQTBvQWhocVFRRnJMUUFBSWdoQmYzTWlDU0FJUVFGcUloc2dEeUFNYTBFQ2RDQVZheUFUYWtFRWFrRURkU0lJSUFnZ0cwb2JJQWdnQ1VnYklnZ2dER3BCd0RWcUxRQUFPZ0FESUE4Z0NHdEJ3RFZxTFFBQURBRUxJQWtnRENBVmFpQVRRUUYwYWtFQ2FrRUNkam9BQXlBUElCVkJBWFJxSUJOcVFRSnFRUUoyQ3pvQUFDQU5LQUljSVFnTEFrQWdGQ0FhYWlJSlFRRnJJaFV0QUFBaURDQUpMUUFBSWc5ckloUWdGRUVmZFNJVWFpQVVjeUFJVHcwQUlBMG9BaUFpR3lBSlFRSnJMUUFBSWhRZ0RHc2lFeUFUUVI5MUloTnFJQk56VFEwQUlCc2dDUzBBQVNJVElBOXJJaEFnRUVFZmRTSVFhaUFRYzAwTkFDQUpBbjhnQ2tFRFRRUkFJQlVnQ2lBTktBSVlha0VCYXkwQUFDSUlRWDl6SWdrZ0NFRUJhaUlLSUE4Z0RHdEJBblFnRTJzZ0ZHcEJCR3BCQTNVaUNDQUlJQXBLR3lBSUlBbElHeUlJSUF4cVFjQTFhaTBBQURvQUFDQVBJQWhyUWNBMWFpMEFBQXdCQ3lBVklBd2dFMm9nRkVFQmRHcEJBbXBCQW5ZNkFBQWdEeUFUUVFGMGFpQVVha0VDYWtFQ2RnczZBQUFnRFNnQ0hDRUlDeUFTSURacUlnbEJCR29oRkNBUktBSTBJUW9DUUNBSkxRQURJZ3dnQ1MwQUJDSVBheUlUSUJOQkgzVWlFMm9nRTNNZ0NFOE5BQ0FOS0FJZ0loc2dGRUVDYXkwQUFDSVRJQXhySWhVZ0ZVRWZkU0lWYWlBVmMwME5BQ0FiSUFrdEFBVWlGU0FQYXlJUUlCQkJIM1VpRUdvZ0VITk5EUUFnRkFKL0lBcEJBMDBFUUNBSklBb2dEU2dDR0dwQkFXc3RBQUFpQ0VGL2N5SUpJQWhCQVdvaUd5QVBJQXhyUVFKMElCVnJJQk5xUVFScVFRTjFJZ2dnQ0NBYlNoc2dDQ0FKU0JzaUNDQU1ha0hBTldvdEFBQTZBQU1nRHlBSWEwSEFOV290QUFBTUFRc2dDU0FNSUJWcUlCTkJBWFJxUVFKcVFRSjJPZ0FESUE4Z0ZVRUJkR29nRTJwQkFtcEJBbllMT2dBQUlBMG9BaHdoQ0FzZ0NDQVVJQnBxSWdsQkFXc2lFeTBBQUNJTUlBa3RBQUFpRDJzaUZDQVVRUjkxSWhScUlCUnpUUTBBSUEwb0FpQWlGU0FKUVFKckxRQUFJZ2dnREdzaUZDQVVRUjkxSWhScUlCUnpUUTBBSUJVZ0NTMEFBU0lVSUE5ckloc2dHMEVmZFNJYmFpQWJjMDBOQUNBSkFuOGdDa0VEVFFSQUlCTWdDaUFOS0FJWWFrRUJheTBBQUNJSlFYOXpJZ29nQ1VFQmFpSUpJQThnREd0QkFuUWdGR3NnQ0dwQkJHcEJBM1VpQ0NBSUlBbEtHeUFJSUFwSUd5SUlJQXhxUWNBMWFpMEFBRG9BQUNBUElBaHJRY0ExYWkwQUFBd0JDeUFUSUF3Z0ZHb2dDRUVCZEdwQkFtcEJBblk2QUFBZ0R5QVVRUUYwYWlBSWFrRUNha0VDZGdzNkFBQUxBa0FDUUNBUktBSUFJZ2dnRVNnQ0NDSU1SdzBBSUFnZ0VTZ0NFRWNOQUNBSUlCRW9BaGhIRFFBZ0NFVU5BU0FISUFnZ0RTQUdRUXhzYWlJR0lCb1FIeUFTSUJFb0FnQWdCaUFhRUI4TUFRc2dDQVJBSUEwZ0JrRU1iR29pQ1NFS0lBZ2dDU2dDQUdwQkFXc3RBQUFpQ0VGL2N5RU1JQWhCQVdvaER3SkFJQWtvQWdRaUNDQUhJQmRxSWhVdEFBQWlGQ0FITFFBQUloTnJJaHNnRzBFZmRTSWJhaUFiYzAwTkFDQUtLQUlJSWhzZ0J5QXFhaTBBQUNJUUlCUnJJaFlnRmtFZmRTSVdhaUFXYzAwTkFDQWJJQWNnR21vdEFBQWlGaUFUYXlJWklCbEJIM1VpR1dvZ0dYTk5EUUFnRlNBTUlBOGdFeUFVYTBFQ2RDQVdheUFRYWtFRWFrRURkU0lJSUFnZ0Qwb2JJQWdnREVnYklnZ2dGR3BCd0RWcUxRQUFPZ0FBSUFjZ0V5QUlhMEhBTldvdEFBQTZBQUFnQ1NnQ0JDRUlDd0pBSUFkQkFXb2lGQ0FYYWlJYkxRQUFJaE1nQnkwQUFTSVZheUlRSUJCQkgzVWlFR29nRUhNZ0NFOE5BQ0FLS0FJSUloQWdGQ0FxYWkwQUFDSVdJQk5ySWhrZ0dVRWZkU0laYWlBWmMwME5BQ0FRSUJRZ0dtb3RBQUFpR1NBVmF5SWVJQjVCSDNVaUhtb2dIbk5ORFFBZ0d5QU1JQThnRlNBVGEwRUNkQ0FaYXlBV2FrRUVha0VEZFNJSUlBZ2dEMG9iSUFnZ0RFZ2JJZ2dnRTJwQndEVnFMUUFBT2dBQUlCUWdGU0FJYTBIQU5Xb3RBQUE2QUFBZ0NTZ0NCQ0VJQ3lBUktBSUFJQWtvQWdCcVFRRnJMUUFBSWc5QmYzTWhEQ0FQUVFGcUlROENRQ0FTSUJkcUloVXRBQUFpRkNBU0xRQUFJaE5ySWhzZ0cwRWZkU0liYWlBYmN5QUlUdzBBSUFvb0FnZ2lHeUFTSUNwcUxRQUFJaEFnRkdzaUZpQVdRUjkxSWhacUlCWnpUUTBBSUJzZ0VpQWFhaTBBQUNJV0lCTnJJaGtnR1VFZmRTSVphaUFaYzAwTkFDQVZJQXdnRHlBVElCUnJRUUowSUJacklCQnFRUVJxUVFOMUlnZ2dDQ0FQU2hzZ0NDQU1TQnNpQ0NBVWFrSEFOV290QUFBNkFBQWdFaUFUSUFoclFjQTFhaTBBQURvQUFDQUpLQUlFSVFnTEFrQWdDQ0FTUVFGcUlna2dGMm9pRlMwQUFDSVVJQkl0QUFFaUUyc2lHeUFiUVI5MUlodHFJQnR6VFEwQUlBb29BZ2dpQ0NBSklDcHFMUUFBSWdvZ0ZHc2lHeUFiUVI5MUlodHFJQnR6VFEwQUlBZ2dDU0FhYWkwQUFDSWJJQk5ySWhBZ0VFRWZkU0lRYWlBUWMwME5BQ0FWSUJRZ0RDQVBJQk1nRkd0QkFuUWdHMnNnQ21wQkJHcEJBM1VpQ0NBSUlBOUtHeUFJSUF4SUd5SUlha0hBTldvdEFBQTZBQUFnQ1NBVElBaHJRY0ExYWkwQUFEb0FBQXNnRVNnQ0NDRU1Dd0pBSUF4RkRRQWdEU0FHUVF4c2FpSUlJUWtnRENBSUtBSUFha0VCYXkwQUFDSU1RWDl6SVFvZ0RFRUJhaUVQQWtBZ0NDZ0NCQ0lNSUFkQkFtb2lGQ0FYYWlJYkxRQUFJaE1nQnkwQUFpSVZheUlRSUJCQkgzVWlFR29nRUhOTkRRQWdDU2dDQ0NJUUlCUWdLbW90QUFBaUZpQVRheUlaSUJsQkgzVWlHV29nR1hOTkRRQWdFQ0FVSUJwcUxRQUFJaGtnRldzaUhpQWVRUjkxSWg1cUlCNXpUUTBBSUJzZ0NpQVBJQlVnRTJ0QkFuUWdHV3NnRm1wQkJHcEJBM1VpRENBTUlBOUtHeUFLSUF4S0d5SU1JQk5xUWNBMWFpMEFBRG9BQUNBVUlCVWdER3RCd0RWcUxRQUFPZ0FBSUFnb0FnUWhEQXNDUUNBSFFRTnFJaFFnRjJvaUd5MEFBQ0lUSUFjdEFBTWlGV3NpRUNBUVFSOTFJaEJxSUJCeklBeFBEUUFnQ1NnQ0NDSVFJQlFnS21vdEFBQWlGaUFUYXlJWklCbEJIM1VpR1dvZ0dYTk5EUUFnRUNBVUlCcHFMUUFBSWhrZ0ZXc2lIaUFlUVI5MUloNXFJQjV6VFEwQUlCc2dDaUFQSUJVZ0UydEJBblFnR1dzZ0ZtcEJCR3BCQTNVaURDQU1JQTlLR3lBS0lBeEtHeUlLSUJOcVFjQTFhaTBBQURvQUFDQVVJQlVnQ210QndEVnFMUUFBT2dBQUlBZ29BZ1FoREFzZ0VTZ0NDQ0FJS0FJQWFrRUJheTBBQUNJUFFYOXpJUW9nRDBFQmFpRVBBa0FnRWtFQ2FpSVVJQmRxSWhzdEFBQWlFeUFTTFFBQ0loVnJJaEFnRUVFZmRTSVFhaUFRY3lBTVR3MEFJQWtvQWdnaUVDQVVJQ3BxTFFBQUloWWdFMnNpR1NBWlFSOTFJaGxxSUJselRRMEFJQkFnRkNBYWFpMEFBQ0laSUJWckloNGdIa0VmZFNJZWFpQWVjMDBOQUNBYklBb2dEeUFWSUJOclFRSjBJQmxySUJacVFRUnFRUU4xSWd3Z0RDQVBTaHNnQ2lBTVNoc2lEQ0FUYWtIQU5Xb3RBQUE2QUFBZ0ZDQVZJQXhyUWNBMWFpMEFBRG9BQUNBSUtBSUVJUXdMSUF3Z0VrRURhaUlJSUJkcUloVXRBQUFpRkNBU0xRQURJaE5ySWhzZ0cwRWZkU0liYWlBYmMwME5BQ0FKS0FJSUlna2dDQ0FxYWkwQUFDSU1JQlJySWhzZ0cwRWZkU0liYWlBYmMwME5BQ0FKSUFnZ0dtb3RBQUFpR3lBVGF5SVFJQkJCSDNVaUVHb2dFSE5ORFFBZ0ZTQUtJQThnRXlBVWEwRUNkQ0FiYXlBTWFrRUVha0VEZFNJSklBa2dEMG9iSUFrZ0NrZ2JJZ2tnRkdwQndEVnFMUUFBT2dBQUlBZ2dFeUFKYTBIQU5Xb3RBQUE2QUFBTEFrQWdFU2dDRUNJS1JRMEFJQTBnQmtFTWJHb2lDQ0VKSUFvZ0NDZ0NBR3BCQVdzdEFBQWlERUYvY3lFS0lBeEJBV29oRHdKQUlBZ29BZ1FpRENBSFFRUnFJaFFnRjJvaUd5MEFBQ0lUSUFjdEFBUWlGV3NpRUNBUVFSOTFJaEJxSUJCelRRMEFJQWtvQWdnaUVDQVVJQ3BxTFFBQUloWWdFMnNpR1NBWlFSOTFJaGxxSUJselRRMEFJQkFnRkNBYWFpMEFBQ0laSUJWckloNGdIa0VmZFNJZWFpQWVjMDBOQUNBYklBb2dEeUFWSUJOclFRSjBJQmxySUJacVFRUnFRUU4xSWd3Z0RDQVBTaHNnQ2lBTVNoc2lEQ0FUYWtIQU5Xb3RBQUE2QUFBZ0ZDQVZJQXhyUWNBMWFpMEFBRG9BQUNBSUtBSUVJUXdMQWtBZ0IwRUZhaUlVSUJkcUloc3RBQUFpRXlBSExRQUZJaFZySWhBZ0VFRWZkU0lRYWlBUWN5QU1UdzBBSUFrb0FnZ2lFQ0FVSUNwcUxRQUFJaFlnRTJzaUdTQVpRUjkxSWhscUlCbHpUUTBBSUJBZ0ZDQWFhaTBBQUNJWklCVnJJaDRnSGtFZmRTSWVhaUFlYzAwTkFDQWJJQW9nRHlBVklCTnJRUUowSUJscklCWnFRUVJxUVFOMUlnd2dEQ0FQU2hzZ0NpQU1TaHNpQ2lBVGFrSEFOV290QUFBNkFBQWdGQ0FWSUFwclFjQTFhaTBBQURvQUFDQUlLQUlFSVF3TElCRW9BaEFnQ0NnQ0FHcEJBV3N0QUFBaUQwRi9jeUVLSUE5QkFXb2hEd0pBSUJKQkJHb2lGQ0FYYWlJYkxRQUFJaE1nRWkwQUJDSVZheUlRSUJCQkgzVWlFR29nRUhNZ0RFOE5BQ0FKS0FJSUloQWdGQ0FxYWkwQUFDSVdJQk5ySWhrZ0dVRWZkU0laYWlBWmMwME5BQ0FRSUJRZ0dtb3RBQUFpR1NBVmF5SWVJQjVCSDNVaUhtb2dIbk5ORFFBZ0d5QUtJQThnRlNBVGEwRUNkQ0FaYXlBV2FrRUVha0VEZFNJTUlBd2dEMG9iSUFvZ0RFb2JJZ3dnRTJwQndEVnFMUUFBT2dBQUlCUWdGU0FNYTBIQU5Xb3RBQUE2QUFBZ0NDZ0NCQ0VNQ3lBTUlCSkJCV29pQ0NBWGFpSVZMUUFBSWhRZ0VpMEFCU0lUYXlJYklCdEJIM1VpRzJvZ0czTk5EUUFnQ1NnQ0NDSUpJQWdnS21vdEFBQWlEQ0FVYXlJYklCdEJIM1VpRzJvZ0czTk5EUUFnQ1NBSUlCcHFMUUFBSWhzZ0Uyc2lFQ0FRUVI5MUloQnFJQkJ6VFEwQUlCVWdDaUFQSUJNZ0ZHdEJBblFnRzJzZ0RHcEJCR3BCQTNVaUNTQUpJQTlLR3lBSklBcElHeUlKSUJScVFjQTFhaTBBQURvQUFDQUlJQk1nQ1d0QndEVnFMUUFBT2dBQUN5QVJLQUlZSWdwRkRRQWdEU0FHUVF4c2FpSUlJUWtnQ2lBSUtBSUFha0VCYXkwQUFDSUdRWDl6SVFvZ0JrRUJhaUVNQWtBZ0NDZ0NCQ0lHSUFkQkJtb2lEeUFYYWlJVkxRQUFJaFFnQnkwQUJpSVRheUliSUJ0QkgzVWlHMm9nRzNOTkRRQWdDU2dDQ0NJYklBOGdLbW90QUFBaUVDQVVheUlXSUJaQkgzVWlGbW9nRm5OTkRRQWdHeUFQSUJwcUxRQUFJaFlnRTJzaUdTQVpRUjkxSWhscUlCbHpUUTBBSUJVZ0NpQU1JQk1nRkd0QkFuUWdGbXNnRUdwQkJHcEJBM1VpQmlBR0lBeEtHeUFHSUFwSUd5SUdJQlJxUWNBMWFpMEFBRG9BQUNBUElCTWdCbXRCd0RWcUxRQUFPZ0FBSUFnb0FnUWhCZ3NDUUNBSFFRZHFJZzhnRjJvaUZTMEFBQ0lVSUFjdEFBY2lFMnNpR3lBYlFSOTFJaHRxSUJ0eklBWlBEUUFnQ1NnQ0NDSWJJQThnS21vdEFBQWlFQ0FVYXlJV0lCWkJIM1VpRm1vZ0ZuTk5EUUFnR3lBUElCcHFMUUFBSWhZZ0Uyc2lHU0FaUVI5MUlobHFJQmx6VFEwQUlCVWdDaUFNSUJNZ0ZHdEJBblFnRm1zZ0VHcEJCR3BCQTNVaUJpQUdJQXhLR3lBR0lBcElHeUlHSUJScVFjQTFhaTBBQURvQUFDQVBJQk1nQm10QndEVnFMUUFBT2dBQUlBZ29BZ1FoQmdzZ0VTZ0NHQ0FJS0FJQWFrRUJheTBBQUNJTVFYOXpJUW9nREVFQmFpRU1Ba0FnRWtFR2FpSVBJQmRxSWhVdEFBQWlGQ0FTTFFBR0loTnJJaHNnRzBFZmRTSWJhaUFiY3lBR1R3MEFJQWtvQWdnaUd5QVBJQ3BxTFFBQUloQWdGR3NpRmlBV1FSOTFJaFpxSUJaelRRMEFJQnNnRHlBYWFpMEFBQ0lXSUJOckloa2dHVUVmZFNJWmFpQVpjMDBOQUNBVklBb2dEQ0FUSUJSclFRSjBJQlpySUJCcVFRUnFRUU4xSWdZZ0JpQU1TaHNnQmlBS1NCc2lCaUFVYWtIQU5Xb3RBQUE2QUFBZ0R5QVRJQVpyUWNBMWFpMEFBRG9BQUNBSUtBSUVJUVlMSUFZZ0VrRUhhaUlJSUJkcUloTXRBQUFpRHlBU0xRQUhJaFJySWhVZ0ZVRWZkU0lWYWlBVmMwME5BQ0FKS0FJSUlnWWdDQ0FxYWkwQUFDSUpJQTlySWhVZ0ZVRWZkU0lWYWlBVmMwME5BQ0FHSUFnZ0dtb3RBQUFpRlNBVWF5SWJJQnRCSDNVaUcyb2dHM05ORFFBZ0V5QVBJQW9nRENBVUlBOXJRUUowSUJWcklBbHFRUVJxUVFOMUlnWWdCaUFNU2hzZ0JpQUtTQnNpQm1wQndEVnFMUUFBT2dBQUlBZ2dGQ0FHYTBIQU5Xb3RBQUE2QUFBTElCSWdJR29oRWlBSElDQnFJUWNnRVVGQWF5RVJJQnhCQVhFaENFRUFJUnhCQWlFR0lBZ05BQXNnS3lnQ0NDRVJDMEVBSUNKQkFXb2lCaUFHSUI5R0lnWWJJU0lnRGtIWUFXb2hEaUFHSURscUlqa2dFVWtOQUFzTElBMUJzQUZxSkFBZ0FFSUFOd0tvQ1FKQUlBQW9BcGdKSWdsRkRRQWdDVUVEY1NFSElBQW9BcndKSVFoQkFDRUdJQWxCQVd0QkEwOEVRQ0FKUVh4eElRMERRQ0FJSUFaQjJBRnNhaUlKUVFBMkFzUUJJQWxCQURZQ0JDQUlJQVpCQVhKQjJBRnNhaUlKUVFBMkFzUUJJQWxCQURZQ0JDQUlJQVpCQW5KQjJBRnNhaUlKUVFBMkFzUUJJQWxCQURZQ0JDQUlJQVpCQTNKQjJBRnNhaUlKUVFBMkFzUUJJQWxCQURZQ0JDQUdRUVJxSVFZZ0RVRUVheUlORFFBTEN5QUhSUTBBQTBBZ0NDQUdRZGdCYkdvaUNVRUFOZ0xFQVNBSlFRQTJBZ1FnQmtFQmFpRUdJQWRCQVdzaUJ3MEFDd3NnQUNnQ0VDRUlRUUFoQmtFQklSRUNRQ0FBS0FMMERFVU5BQU5BQWtBQ1FDQUFJQVpCRkd4cVFmZ01haWdDQUE0R0F3QUFBQUFCQUFzZ0JrRUJhaUVHREFFTEMwRUFJUkVMQWtBQ2Z3SkFBa0FDUUFKQUFrQWdDQ2dDRUE0Q0FBRUNDeUFBS0FMUUNpSVBRUVZHQkVBZ0FFSUFOd0tFQ2lBQUtBTHNDaUVHUVFBaENnd0VDeUFBS0FLRUNpSUtJQUFvQXV3S0lnWk5EUU1nQ2lBR2F5QUlLQUlVSWdkQkFYWkpEUU1nQUNnQ2lBb2dCMm9NQkF0QkFDRUdBbjlCQUNBQUtBTFFDaUlQUVFWR0RRQWFJQUFvQXBBS0lnY2dBQ2dDakFvZ0FDZ0M1QXBORFFBYUlBZ29BZ3dnQjJvTElSb0NmeUFJS0FJa0lnNEVRQ0FBS0FMa0NpQWFhaUVHQ3lBR0lBQW9BdFFLSWhORklBWkJBRWR4YXlJVUN3UkFJQlJCQVdzaUJpQUdJQTV1SWljZ0RteHJJUmdMUVFBaEIwRUFJUW9DUUNBT1JRMEFJQTVCQTNFaEVpQUlLQUlvSVFaQkFDRUpJQTVCQVd0QkEwOEVRRUVBSVF3Z0RrRjhjU0lKSVE0RFFDQUdJQXhCQW5RaURVRU1jbW9vQWdBZ0JpQU5RUWh5YWlnQ0FDQUdJQTFCQkhKcUtBSUFJQVlnRFdvb0FnQWdDbXBxYW1vaENpQU1RUVJxSVF3Z0RrRUVheUlPRFFBTEN5QVNSUTBBQTBBZ0JpQUpRUUowYWlnQ0FDQUthaUVLSUFsQkFXb2hDU0FTUVFGckloSU5BQXNMSUJRRVFDQUtJQ2RzSVFjZ0NDZ0NLQ0VKUVFBaEJnTkFJQWtnQmtFQ2RHb29BZ0FnQjJvaEJ5QUdRUUZxSWdZZ0dFME5BQXNMSUJORkJFQWdDQ2dDSENBSGFpRUhDeUFSUlEwQklBZ29BaUFoQmlBQUtBTDRDaUVJSUFBZ0dqWUNrQW9nQUNBQUtBTGtDallDakFvZ0FDZ0M5QW9nQmlBSWFpSUdRUjkxSUFaeElBZHFhaUVHREFRTFFRQWhDa0VBSVFZZ0FDZ0MwQW9pRDBFRlJ3UkFJQUFvQXBBS0lRb2dBQ2dDNUFvaUJpQUFLQUtNQ2trRVFDQUlLQUlNSUFwcUlRb0xJQVlnQ21wQkFYUWdBQ2dDMUFwRmF5RUdDeUFSUlEwQUlBQWdDallDa0FvZ0FDQUFLQUxrQ2pZQ2pBb01Bd3NnQUVJQU53S01Da0VBSVFZTUFnc0NRQ0FHSUFwTkRRQWdCaUFLYXlBSUtBSVVJZ2RCQVhaTkRRQWdBQ2dDaUFvZ0Iyc01BUXNnQUNnQ2lBb0xJUWdnQUNnQzFBcEZCRUFnQmlBSWFpQUFLQUx3Q2lJR1FSOTFJQVp4YWlFR0RBRUxJQUFnQ0RZQ2lBb2dBQ2dDOEFvaEJ5QVJSUVJBUVFBaEJpQUFRUUEyQW9nS0lBQkJBQ0FIYXlBSFFSOTFjVFlDaEFvTUFRc2dBQ0FHTmdLRUNpQUdJQWhxSUFkQkgzVWdCM0ZxSVFZTEFrQWdBQ2dDcEFsRkRRQWdEMEVGUmlFSElBQW9BcmdLSVFnZ0FDZ0N0QWtoQ1NBQUtBSzRDU0VLSUFBb0F1UUtJUXdnQUNnQzFBb0VRQ0E0SUZRZ0NDQU1JQVlnQnlBS0lBa1FIQXdCQ3lBNFFRQWdDQ0FNSUFZZ0J5QUtJQWtRSEFzZ0FFSUFOd0tnQ1VFQklRcEJBU0VNREFFTFFRQWhDa0VESVF3TElBeEJCWEZGRFFBTElBb0VRQ0FFSUFBb0FoQWlBU2dDTkVFRWREWUNBQ0FGSUFFb0FqaEJCSFEyQWdBZ0FDQUFLQUxZQ1NJQlFRRnFOZ0xZQ1NBRElBQW9BdEFKSUFGQkJIUnFLQUlBTmdJQUN5QUxRZkFCYWlRQUlBd0xUQUVDZjBFQklRSWdBRUVBUWNRYUVBTWlBRUcwQ21wQkFUWUNBQ0FBUW9DQ2dJQ0FCRGNDQkNBQVFjQVFFQWdpQXpZQ3NCb2dBd1IvSUFFRVFDQUFRUUUyQXNBSkMwRUFCVUVCQ3dzTHhqSWFBRUdHQ0F2S0JXWWdKaEFHQ0dVWVpSaERFRU1RUXhCREVFTVFReEJERUVNUUlnZ2lDQ0lJSWdnaUNDSUlJZ2dpQ0NJSUlnZ2lDQ0lJSWdnaUNDSUlJZ2dBQUFBQUFBQUFBR3BBU2pBcUtBb2dhVGhwT0Vrb1NTZ3BJQ2tnQ1JnSkdHZ3dhREJvTUdnd1NDQklJRWdnU0NBb0dDZ1lLQmdvR0FnUUNCQUlFQWdRWnlobktHY29aeWhuS0djb1p5aG5LRWNZUnhoSEdFY1lSeGhIR0VjWVJ4aHVZRTVZTGxBT1VHNVlUbEF1U0E1SURVQU5RRTFJVFVndFFDMUFEVGdOT0cxUWJWQk5RRTFBTFRndE9BMHdEVEJyU0d0SWEwaHJTR3RJYTBoclNHdElTemhMT0VzNFN6aExPRXM0U3poTE9Dc3dLekFyTUNzd0t6QXJNQ3N3S3pBTEtBc29DeWdMS0Fzb0N5Z0xLQXNvQUFBQUFDOW9MMmdRZ0ZDQU1JQVFlSENBVUhnd2VCQndjSGhRY0RCd0VHaHZjRzl3VDJoUGFDOWdMMkFQWUE5Z2IyaHZhRTlnVDJBdldDOVlEMWdQV0FBQUFBQUFBQUFBWmpoR0lDWWdCaEJtTUVZWUpoZ0dDR1VvWlNnbEVDVVFaQ0JrSUdRZ1pDQmtHR1FZWkJoa0dFTVFReEJERUVNUVF4QkRFRU1RUXhBQUFBQUFBQUFBQUdsSVNUZ3BPQWt3Q0NnSUtFZ3dTREFvTUNnd0NDQUlJR2RBWjBCblFHZEFSeWhIS0Vjb1J5Z25LQ2NvSnlnbktBY1lCeGdIR0FjWUFBQUFBRzE0YlhodWdFNkFMb0FPZ0M1NERuaE9lQzV3VFhCTmNBMXdEWEJ0Y0cxd1RXaE5hQzFvTFdnTmFBMW9iV2h0YUUxZ1RXQXRZQzFnRFdBTllBeFlERmdNV0F4WVRGaE1XRXhZVEZnc1dDeFlMRmdzV0F4UURGQU1VQXhRYkdCc1lHeGdiR0JNVUV4UVRGQk1VQ3hRTEZBc1VDeFFERWdNU0F4SURFaHJXR3RZYTFocldHdFlhMWhyV0d0WVMwaExTRXRJUzBoTFNFdElTMGhMU0N0SUswZ3JTQ3RJSzBnclNDdElLMGdMUUF0QUMwQUxRQXRBQzBBTFFBdEFhMUJyVUd0UWExQnJVR3RRYTFCclVFdEFTMEJMUUV0QVMwQkxRRXRBUzBBclFDdEFLMEFyUUN0QUswQXJRQ3RBQ3pnTE9BczRDemdMT0FzNEN6Z0xPQUJCNEEwTHJna0dHRVk0SmpnR0VHWklSakFtTUFZSUpTZ2xLRVVvUlNnbElDVWdSU0JGSUNVWUpSaGxRR1ZBUlJoRkdDVVFKUkJrT0dRNFpEaGtPR1F3WkRCa01HUXdaQ2hrS0dRb1pDaGtJR1FnWkNCa0lHUVlaQmhrR0dRWVJCQkVFRVFRUkJBa0NDUUlKQWdrQ0FRQUJBQUVBQVFBQUFBS2dHcUFTb0FxZ0FwNGFuaEtlQ3A0Q25CcWNFcHdLbkFLYUNsb0tXZ0pZQWxnU1doSmFDbGdLV0FKV0FsWWFXaHBhRWxnU1dBcFdDbFlDVkFKVUdoZ2FHQm9ZR2hnU0ZoSVdFaFlTRmdvVUNoUUtGQW9VQWhJQ0VnSVNBaElhRmhvV0doWWFGaElVRWhRU0ZCSVVDaElLRWdvU0NoSUNFQUlRQWhBQ0VBSE9BYzRCemdIT0FjNEJ6Z0hPQWM0QnpBSE1BY3dCekFITUFjd0J6QUhNRWRJUjBoSFNFZElSMGhIU0VkSVIwZ0hLQWNvQnlnSEtBY29CeWdIS0Fjb1oxQm5VR2RRWjFCblVHZFFaMUJuVUVkQVIwQkhRRWRBUjBCSFFFZEFSMEFuUUNkQUowQW5RQ2RBSjBBblFDZEFCeUFISUFjZ0J5QUhJQWNnQnlBSElBWUlKZ2dBQUFZQUJoQW1FRVlRQUFBR0dDWVlSaGhtR0FZZ0ppQkdJR1lnQmlnbUtFWW9aaWdHTUNZd1JqQm1NQVk0SmpoR09HWTRCa0FtUUVaQVprQUdTQ1pJUmtobVNBWlFKbEJHVUdaUUJsZ21XRVpZWmxnR1lDWmdSbUJtWUFab0ptaEdhR1pvQm5BbWNFWndabkFHZUNaNFJuaG1lQWFBSm9CR2dHYUFBQUJERUFJQUFnQWhDQ0VJSVFnaENHY2daeUJJSUNnZ1J4aEhHQ2NZSnhnR0lBWWdCaUFHSUFZWUJoZ0dHQVlZQmhBR0VBWVFCaEJtR0dZWVpoaG1HQ1lRSmhBbUVDWVFCZ2dHQ0FZSUJnZ0FBR1ZWUkVRME5DTWpJeU1URXhNVEFRRUJBUUVCQVFFQkFRRUJBUUVCQVFENTZkbkl5TGk0cDZlbnA1ZVhsNWVHaG9hR2hvYUdobloyZG5aMmRuWjI1dGJHdHFXbGxaV0VoSVNFZEhSMGRHUmtaR1JVVkZSVVEwTkRRME5EUTBNek16TXpNek16TXlNakl5TWpJeU1qRXhNVEV4TVRFeE1EQXdNREF3TURBOWEyeGNXbHBaV1ZoSVNFaEZSVVZGUkVSRVJFQkFRRUJITnpjM056YzNOelkyTmpZMk5qWTJNek16TXpNek16TXlNakl5TWpJeU1qRXhNVEV4TVRFeFBGdGFVRmxKUjBkRFEwSkNTRGc0T0RZMk5qWTFOVFUxTkRRME5ERXhNVEU3V1ZwS1NFaENRa0ZCUUVCSE56YzNOalkyTmpVMU5UVTBORFEwTXpNek16cGdZVkZZU0VoSVNUazVPVGs1T1RrM056YzNOemMzTnpZMk5qWTJOalkyTlRVMU5UVTFOVFUwTkRRME5EUTBORE16TXpNek16TXpNakl5TWpJeU1qSTVZR0ZSVjBkSFIwZzRPRGc0T0RnNE5qWTJOalkyTmpZME5EUTBORFEwTkRNek16TXpNek16TWpJeU1qSXlNakkxSlNVbEpTVWxKU1VsSlNVbEpTVWxLR0JpVWxGQlFVRkhOemMzTnpjM056WTJOalkyTmpZMk16TXpNek16TXpNMUpTVWxKU1VsSlNVbEpTVWxKU1VsSkNRa0pDUWtKQ1FrSkNRa0pDUWtKQ0ZnWjFkU1FrSkNSVFUxTlRVMU5UVTJKaVltSmlZbUppWW1KaVltSmlZbUpDUWtKQ1FrSkNRa0pDUWtKQ1FrSkNNakl5TWpJeU1qSXlNakl5TWpJeU1oVUZaR1FqSXlNalVsSlNVbEpTVWxKQ1FrSkNRa0pDUWpJeU1qSXlNakl5QkJRakl6TXpVMU5CUVVGQlFVRkJRUVFVUTBNaUlpSWlNVEV4TVRFeE1URURFekl5SVNFaElRSVNJU0VSQVNJU0FRRXlJaElDUXpNaUloSVNBZ0pUUXpNakVoSUNBaE1qUXpOalV3SUNBRUdnRndza0JBUUZCZ2NJQ1FvTURROFJGQllaSENBa0tDMHlPRDlIVUZwbGNYK1FvcmJMNHYvL0FFSGdGd3NrQWdJQ0F3TURBd1FFQkFZR0J3Y0lDQWtKQ2dvTEN3d01EUTBPRGc4UEVCQVJFUklTQUVIRkdBdUVBUUVBQUFFQUFBRUFBQUVBQVFFQUFRRUJBUUVCQVFFQkFRRUJBUUVCQVFJQkFRSUJBUUlCQVFJQkFnTUJBZ01DQWdNQ0FnUUNBd1FDQXdRREF3VURCQVlEQkFZRUJRY0VCUWdFQmdrRkJ3b0dDQXNHQ0EwSENnNElDeEFKREJJS0RSUUxEeGNORVJrQUFBQUFBQUFBQUFVQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQS93QkIxQmtMRlFVQUFBQUFBQUFBQndBQUFQOEFBQUFBQUFBQS93QkI5QmtMRlFVQUFBQUVBQUFBQUFBQUFQOEFBQUFBQUFBQS93QkJsQm9MQlFVQUFBQUVBRUdrR2d1bEFRY0FBQUFFQUFBQUFnQUFBQVFBQUFBQkFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUJBQUFBQUVBQUFBRUFBQUFBd0FBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUFFQUFBQUFRQUFBQVFBQUFBRUFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBUUFBQUFCQUFBQUJBQUFBQVFBQUFBRUFBQUFBd0FBQUFRQUFBQUdBQUFBQUFBQUFBMEFBQUQvQUFBQUFBQUFBUDhBQUFBQUFBQUEvd0JCMUJzTEZRMEFBQUFBQUFBQUR3QUFBUDhBQUFBQUFBQUEvd0JCOUJzTEZRMEFBQUFFQUFBQUNBQUFBUDhBQUFBQUFBQUEvd0JCbEJ3THRRc05BQUFBQkFBQUFBZ0FBQUFBQUFBQUR3QUFBQVFBQUFBS0FBQUFCQUFBQUFrQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFBRUFBQUFDUUFBQUFRQUFBQUxBQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBQVFBQUFBSkFBQUFCQUFBQUF3QUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUJBQUFBQWtBQUFBRUFBQUFEQUFBQUFRQUFBQUxBQUFBQkFBQUFBNEFBQUFCQUFBQUNnQUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBRUFBQUFLQUFBQUJBQUFBQUFBQUFEL0FBQUFBQUFBQVA4QUFBQUFBQUFBQVFBQUFBb0FBQUFCQUFBQUN3QUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBQUJBQUFBQ2dBQUFBRUFBQUFMQUFBQUJBQUFBQUFBQUFBRUFBQUFBUUFBQUFFQUFBQU9BQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBUDhBQUFBQUFBQUFBUUFBQUE0QUFBQUVBQUFBQkFBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFBQkFBQUFEZ0FBQUFFQUFBQVBBQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBQUVBQUFBT0FBQUFBUUFBQUE4QUFBQUVBQUFBQkFBQUFBUUFBQUFGQUFBQUJBQUFBQUlBQUFEL0FBQUFBQUFBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUFFQUFBQUFnQUFBQVFBQUFBSUFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBUUFBQUFDQUFBQUJBQUFBQU1BQUFEL0FBQUFBQUFBQVA4QUFBQUFBQUFBQkFBQUFBSUFBQUFFQUFBQUF3QUFBQVFBQUFBSUFBQUFCQUFBQUFrQUFBQUVBQUFBQmdBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFEL0FBQUFBQUFBQUFRQUFBQUdBQUFBQkFBQUFBd0FBQUQvQUFBQUFBQUFBUDhBQUFBQUFBQUFCQUFBQUFZQUFBQUVBQUFBQndBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFBRUFBQUFCZ0FBQUFRQUFBQUhBQUFBQkFBQUFBd0FBQUFFQUFBQURRQUFBQUVBQUFBT0FBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUFRQUFBQTRBQUFEL0FBQUFCQUFBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUFCQUFBQUN3QUFBQUVBQUFBT0FBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBRUFBQUFMQUFBQUFRQUFBQTRBQUFBRUFBQUFBUUFBQVA4QUFBQUVBQUFBQWdBQUFBb0FBQUQvQUFBQUFBQUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBQUNBQUFBQ2dBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFEL0FBQUFBQUFBQUFFQUFBQVBBQUFBQWdBQUFBb0FBQUQvQUFBQUFBQUFBUDhBQUFBQUFBQUFBUUFBQUE4QUFBQUNBQUFBQ2dBQUFBUUFBQUFGQUFBQS93QUFBQUFBQUFBRUFBQUFCZ0FBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBQVFBQUFBR0FBQUEvd0FBQUF3QUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUJBQUFBQU1BQUFBRUFBQUFCZ0FBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUFFQUFBQUF3QUFBQVFBQUFBR0FBQUFCQUFBQUFrQUFBRC9BQUFBREFBQUFQOEFBQUFDQUFBQS93QUFBQUFBQUFEL0FBQUFBQUFBQVA4QUFBQUFBQUFBL3dBQUFBSUFBQUQvQUFBQUNBQUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBQUVBQUFBQndBQUFQOEFBQUFDQUFBQS93QUFBQUFBQUFEL0FBQUFBQUFBQUFRQUFBQUhBQUFBL3dBQUFBSUFBQUFFQUFBQURRQUFBUDhBQUFBSUFBQUFBd0FBQUE4QUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQS93QUFBQUFBQUFBREFBQUFEd0FBQUFBQUFBQUZBQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBQU1BQUFBUEFBQUFBUUFBQUFvQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUF3QUFBQThBQUFBQkFBQUFDZ0FBQUFBQUFBQUZBQUFBQkFBQUFBQUFBQUFCQUFBQUN3QUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBRUFBQUFMQUFBQUJBQUFBQUVBQUFEL0FBQUFBQUFBQVA4QUFBQUFBQUFBQVFBQUFBc0FBQUFCQUFBQURnQUFBUDhBQUFBQUFBQUEvd0FBQUFBQUFBQUJBQUFBQ3dBQUFBRUFBQUFPQUFBQUJBQUFBQUVBQUFBRUFBQUFCQUFBQUFBQUFBQUhBQUFBL3dBQUFBQUFBQUQvQUFBQUFBQUFBUDhBUWRRbkN4VUhBQUFBQUFBQUFBMEFBQUQvQUFBQUFBQUFBUDhBUWZRbkN4VUhBQUFBQkFBQUFBSUFBQUQvQUFBQUFBQUFBUDhBUVpRb0M5a0JCd0FBQUFRQUFBQUNBQUFBQUFBQUFBMEFBQUFFQUFBQUNBQUFBQVFBQUFBREFBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFQOEFBQUFBQUFBQUJBQUFBQU1BQUFBRUFBQUFDUUFBQVA4QUFBQUFBQUFBL3dBQUFBQUFBQUFFQUFBQUF3QUFBQVFBQUFBR0FBQUEvd0FBQUFBQUFBRC9BQUFBQUFBQUFBUUFBQUFEQUFBQUJBQUFBQVlBQUFBRUFBQUFDUUFBQUFRQUFBQU1BQUFBQUFBQUFBUUFBQUFBQUFBQUJBQUFBQWdBQUFBTUFBQUFDQUFBQUF3QUFBQUFBQUFBQkFBQUFBQUFBQUFFQUFBQUNBQUFBQXdBQUFBSUFBQUFEQUJCK0NrTEJRUUFBQUFFQUVHSUtndHhCQUFBQUFRQUFBQUlBQUFBQ0FBQUFBd0FBQUFNQUFBQUNBQUFBQWdBQUFBTUFBQUFEQUFBQUFBQUFBQUJBQUFBQkFBQUFBVUFBQUFDQUFBQUF3QUFBQVlBQUFBSEFBQUFDQUFBQUFrQUFBQU1BQUFBRFFBQUFBb0FBQUFMQUFBQURnQUFBQThBQUFBQUFBQUFBUUFBQUFFQVFZUXJDeEVCQUFBQUFRQUFBQUVBQUFBQ0FBQUFBZ0JCcENzTEJRVUFBQUFFQUVHMEt3dUpCZ2NBQUFBRUFBQUFBZ0FBQUFRQUFBQUJBQUFBQkFBQUFBUUFBQUFFQUFBQUF3QUFBQVFBQUFBR0FBQUFBQUFBQUEwQUFBQUVBQUFBQ0FBQUFBQUFBQUFQQUFBQUJBQUFBQW9BQUFBRUFBQUFDUUFBQUFRQUFBQU1BQUFBQkFBQUFBc0FBQUFFQUFBQURnQUFBQUFBQUFBUkFBQUFCQUFBQUJBQUFBQUFBQUFBRXdBQUFBUUFBQUFTQUFBQUFBQUFBQlVBQUFBRUFBQUFGQUFBQUFBQUFBQVhBQUFBQkFBQUFCWUFBQUFCQUFBQUNnQUFBQUVBQUFBTEFBQUFCQUFBQUFBQUFBQUVBQUFBQVFBQUFBRUFBQUFPQUFBQUFRQUFBQThBQUFBRUFBQUFCQUFBQUFRQUFBQUZBQUFBQkFBQUFBSUFBQUFFQUFBQUF3QUFBQVFBQUFBSUFBQUFCQUFBQUFrQUFBQUVBQUFBQmdBQUFBUUFBQUFIQUFBQUJBQUFBQXdBQUFBRUFBQUFEUUFBQUFFQUFBQVNBQUFBQVFBQUFCTUFBQUFFQUFBQUVBQUFBQVFBQUFBUkFBQUFBUUFBQUJZQUFBQUJBQUFBRndBQUFBUUFBQUFVQUFBQUJBQUFBQlVBQUFBQkFBQUFDd0FBQUFFQUFBQU9BQUFBQkFBQUFBRUFBQUQvQUFBQUJBQUFBQUVBQUFBUEFBQUFBZ0FBQUFvQUFBQUVBQUFBQlFBQUFQOEFBQUFBQUFBQUJBQUFBQU1BQUFBRUFBQUFCZ0FBQUFRQUFBQUpBQUFBL3dBQUFBd0FBQUFFQUFBQUJ3QUFBUDhBQUFBQ0FBQUFCQUFBQUEwQUFBRC9BQUFBQ0FBQUFBRUFBQUFUQUFBQUFnQUFBQklBQUFBRUFBQUFFUUFBQVA4QUFBQVFBQUFBQVFBQUFCY0FBQUFDQUFBQUZnQUFBQVFBQUFBVkFBQUEvd0FBQUJRQUFBQURBQUFBRHdBQUFBRUFBQUFLQUFBQUFBQUFBQVVBQUFBRUFBQUFBQUFBQUFFQUFBQUxBQUFBQVFBQUFBNEFBQUFFQUFBQUFRQUFBQVFBQUFBRUFBQUFBQUFBQUFjQUFBQUVBQUFBQWdBQUFBQUFBQUFOQUFBQUJBQUFBQWdBQUFBRUFBQUFBd0FBQUFRQUFBQUdBQUFBQkFBQUFBa0FBQUFFQUFBQURBQUFBQU1BQUFBVEFBQUFBUUFBQUJJQUFBQUFBQUFBRVFBQUFBUUFBQUFRQUFBQUF3QUFBQmNBQUFBQkFBQUFGZ0FBQUFBQUFBQVZBQUFBQkFBQUFCUUFBQUFCQUFBQUFRQUFBQUlBQUFBQ0FBQUFBd0FBQUFNQUFBQURBQUFBQXdCQndUVUx2QVlCQWdNRUJRWUhDQWtLQ3d3TkRnOFFFUklURkJVV0Z4Z1pHaHNjSFI0ZklDRWlJeVFsSmljb0tTb3JMQzB1THpBeE1qTTBOVFkzT0RrNk96dzlQajlBUVVKRFJFVkdSMGhKU2t0TVRVNVBVRkZTVTFSVlZsZFlXVnBiWEYxZVgyQmhZbU5rWldabmFHbHFhMnh0Ym05d2NYSnpkSFYyZDNoNWVudDhmWDUvZ0lHQ2c0U0Zob2VJaVlxTGpJMk9qNUNSa3BPVWxaYVhtSm1hbTV5ZG5wK2dvYUtqcEtXbXA2aXBxcXVzcmE2dnNMR3lzN1MxdHJlNHVicTd2TDIrdjhEQndzUEV4Y2JIeU1uS3k4ek56cy9RMGRMVDFOWFcxOWpaMnR2YzNkN2Y0T0hpNCtUbDV1Zm82ZXJyN08zdTcvRHg4dlAwOWZiMytQbjYrL3o5L3YvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL3dBQUFBQUJBQUFBQWdBQUFBTUFBQUFFQUFBQUJRQUFBQVlBQUFBSEFBQUFDQUFBQUFrQUFBQUtBQUFBQ3dBQUFBd0FBQUFOQUFBQURnQUFBQThBUVlZOEN5NEJBUUVCQVFFQ0FnSUNBZ0lEQXdNREF3TUVCQVFFQkFRRkJRVUZCUVVHQmdZR0JnWUhCd2NIQndjSUNBZ0lBRUhBUEF0RkNnQUFBQTBBQUFBUUFBQUFDd0FBQUE0QUFBQVNBQUFBRFFBQUFCQUFBQUFVQUFBQURnQUFBQklBQUFBWEFBQUFFQUFBQUJRQUFBQVpBQUFBRWdBQUFCY0FBQUFkQUVHUlBRc3pBUUlEQkFVQUFRSURCQVVBQVFJREJBVUFBUUlEQkFVQUFRSURCQVVBQVFJREJBVUFBUUlEQkFVQUFRSURCQVVBQVFJREFFSFVQUXVzQWdFQUFBQUNBQUFBQXdBQUFBUUFBQUFGQUFBQUJnQUFBQWNBQUFBSUFBQUFDUUFBQUFvQUFBQUxBQUFBREFBQUFBMEFBQUFPQUFBQUR3QUFBQkFBQUFBUkFBQUFFZ0FBQUJNQUFBQVVBQUFBRlFBQUFCWUFBQUFYQUFBQUdBQUFBQmtBQUFBYUFBQUFHd0FBQUJ3QUFBQWRBQUFBSFFBQUFCNEFBQUFmQUFBQUlBQUFBQ0FBQUFBaEFBQUFJZ0FBQUNJQUFBQWpBQUFBSXdBQUFDUUFBQUFrQUFBQUpRQUFBQ1VBQUFBbEFBQUFKZ0FBQUNZQUFBQW1BQUFBSndBQUFDY0FBQUFuQUFBQUp3QUFBQzhmRHdBWEd4MGVCd3NORGljckxTNFFBd1VLREJNVkdod2pKU29zQVFJRUNCRVNGQmdHQ1JZWklDRWlKQ2dtS1FBUUFRSUVDQ0FEQlFvTUR5OEhDdzBPQmdrZkl5VXFMQ0VpSkNnbkt5MHVFUklVR0JNVkdod1hHeDBlRmhrbUtRQkJnY0FBQ3dJaVVBPT0iOwoKICAgICAgaWYgKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKSB7CiAgICAgICAgd2FzbUJpbmFyeUZpbGUgPSBsb2NhdGVGaWxlKHdhc21CaW5hcnlGaWxlKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gZ2V0QmluYXJ5KGZpbGUpIHsKICAgICAgICB0cnkgewogICAgICAgICAgaWYgKGZpbGUgPT0gd2FzbUJpbmFyeUZpbGUgJiYgd2FzbUJpbmFyeSkgewogICAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkod2FzbUJpbmFyeSk7CiAgICAgICAgICB9CgogICAgICAgICAgdmFyIGJpbmFyeSA9IHRyeVBhcnNlQXNEYXRhVVJJKGZpbGUpOwoKICAgICAgICAgIGlmIChiaW5hcnkpIHsKICAgICAgICAgICAgcmV0dXJuIGJpbmFyeTsKICAgICAgICAgIH0KCiAgICAgICAgICBpZiAocmVhZEJpbmFyeSkgewogICAgICAgICAgICByZXR1cm4gcmVhZEJpbmFyeShmaWxlKTsKICAgICAgICAgIH0gZWxzZSB7CiAgICAgICAgICAgIHRocm93ICJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZCI7CiAgICAgICAgICB9CiAgICAgICAgfSBjYXRjaCAoZXJyKSB7CiAgICAgICAgICBhYm9ydChlcnIpOwogICAgICAgIH0KICAgICAgfQoKICAgICAgZnVuY3Rpb24gZ2V0QmluYXJ5UHJvbWlzZSgpIHsKICAgICAgICBpZiAoIXdhc21CaW5hcnkgJiYgKEVOVklST05NRU5UX0lTX1dPUktFUikpIHsKICAgICAgICAgIGlmICh0eXBlb2YgZmV0Y2ggPT09ICJmdW5jdGlvbiIpIHsKICAgICAgICAgICAgcmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLCB7CiAgICAgICAgICAgICAgY3JlZGVudGlhbHM6ICJzYW1lLW9yaWdpbiIKICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsKICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlWyJvayJdKSB7CiAgICAgICAgICAgICAgICB0aHJvdyAiZmFpbGVkIHRvIGxvYWQgd2FzbSBiaW5hcnkgZmlsZSBhdCAnIiArIHdhc21CaW5hcnlGaWxlICsgIiciOwogICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlWyJhcnJheUJ1ZmZlciJdKCk7CiAgICAgICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHsKICAgICAgICAgICAgICByZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKTsKICAgICAgICAgICAgfSk7CiAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCkudGhlbihmdW5jdGlvbiAoKSB7CiAgICAgICAgICByZXR1cm4gZ2V0QmluYXJ5KHdhc21CaW5hcnlGaWxlKTsKICAgICAgICB9KTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gY3JlYXRlV2FzbSgpIHsKICAgICAgICB2YXIgaW5mbyA9IHsKICAgICAgICAgICJhIjogYXNtTGlicmFyeUFyZwogICAgICAgIH07CgogICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVJbnN0YW5jZShpbnN0YW5jZSwgbW9kdWxlKSB7CiAgICAgICAgICB2YXIgZXhwb3J0cyA9IGluc3RhbmNlLmV4cG9ydHM7CiAgICAgICAgICBNb2R1bGVbImFzbSJdID0gZXhwb3J0czsKICAgICAgICAgIHdhc21NZW1vcnkgPSBNb2R1bGVbImFzbSJdWyJjIl07CiAgICAgICAgICB1cGRhdGVHbG9iYWxCdWZmZXJBbmRWaWV3cyh3YXNtTWVtb3J5LmJ1ZmZlcik7CiAgICAgICAgICB3YXNtVGFibGUgPSBNb2R1bGVbImFzbSJdWyJsIl07CiAgICAgICAgICBhZGRPbkluaXQoTW9kdWxlWyJhc20iXVsiZCJdKTsKICAgICAgICAgIHJlbW92ZVJ1bkRlcGVuZGVuY3koKTsKICAgICAgICB9CgogICAgICAgIGFkZFJ1bkRlcGVuZGVuY3koKTsKCiAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQocmVzdWx0KSB7CiAgICAgICAgICByZWNlaXZlSW5zdGFuY2UocmVzdWx0WyJpbnN0YW5jZSJdKTsKICAgICAgICB9CgogICAgICAgIGZ1bmN0aW9uIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIocmVjZWl2ZXIpIHsKICAgICAgICAgIHJldHVybiBnZXRCaW5hcnlQcm9taXNlKCkudGhlbihmdW5jdGlvbiAoYmluYXJ5KSB7CiAgICAgICAgICAgIHJldHVybiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZShiaW5hcnksIGluZm8pOwogICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAoaW5zdGFuY2UpIHsKICAgICAgICAgICAgcmV0dXJuIGluc3RhbmNlOwogICAgICAgICAgfSkudGhlbihyZWNlaXZlciwgZnVuY3Rpb24gKHJlYXNvbikgewogICAgICAgICAgICBlcnIoImZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICIgKyByZWFzb24pOwogICAgICAgICAgICBhYm9ydChyZWFzb24pOwogICAgICAgICAgfSk7CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKCkgewogICAgICAgICAgaWYgKCF3YXNtQmluYXJ5ICYmIHR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyA9PT0gImZ1bmN0aW9uIiAmJiAhaXNEYXRhVVJJKHdhc21CaW5hcnlGaWxlKSAmJiB0eXBlb2YgZmV0Y2ggPT09ICJmdW5jdGlvbiIpIHsKICAgICAgICAgICAgcmV0dXJuIGZldGNoKHdhc21CaW5hcnlGaWxlLCB7CiAgICAgICAgICAgICAgY3JlZGVudGlhbHM6ICJzYW1lLW9yaWdpbiIKICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbiAocmVzcG9uc2UpIHsKICAgICAgICAgICAgICB2YXIgcmVzdWx0ID0gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcocmVzcG9uc2UsIGluZm8pOwogICAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCwgZnVuY3Rpb24gKHJlYXNvbikgewogICAgICAgICAgICAgICAgZXJyKCJ3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogIiArIHJlYXNvbik7CiAgICAgICAgICAgICAgICBlcnIoImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uIik7CiAgICAgICAgICAgICAgICByZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihyZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdCk7CiAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgIH0pOwogICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgcmV0dXJuIGluc3RhbnRpYXRlQXJyYXlCdWZmZXIocmVjZWl2ZUluc3RhbnRpYXRpb25SZXN1bHQpOwogICAgICAgICAgfQogICAgICAgIH0KCiAgICAgICAgaWYgKE1vZHVsZVsiaW5zdGFudGlhdGVXYXNtIl0pIHsKICAgICAgICAgIHRyeSB7CiAgICAgICAgICAgIHZhciBleHBvcnRzID0gTW9kdWxlWyJpbnN0YW50aWF0ZVdhc20iXShpbmZvLCByZWNlaXZlSW5zdGFuY2UpOwogICAgICAgICAgICByZXR1cm4gZXhwb3J0czsKICAgICAgICAgIH0gY2F0Y2ggKGUpIHsKICAgICAgICAgICAgZXJyKCJNb2R1bGUuaW5zdGFudGlhdGVXYXNtIGNhbGxiYWNrIGZhaWxlZCB3aXRoIGVycm9yOiAiICsgZSk7CiAgICAgICAgICAgIHJldHVybiBmYWxzZTsKICAgICAgICAgIH0KICAgICAgICB9CgogICAgICAgIGluc3RhbnRpYXRlQXN5bmMoKS5jYXRjaChyZWFkeVByb21pc2VSZWplY3QpOwogICAgICAgIHJldHVybiB7fTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gY2FsbFJ1bnRpbWVDYWxsYmFja3MoY2FsbGJhY2tzKSB7CiAgICAgICAgd2hpbGUgKGNhbGxiYWNrcy5sZW5ndGggPiAwKSB7CiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBjYWxsYmFja3Muc2hpZnQoKTsKCiAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrID09ICJmdW5jdGlvbiIpIHsKICAgICAgICAgICAgY2FsbGJhY2soTW9kdWxlKTsKICAgICAgICAgICAgY29udGludWU7CiAgICAgICAgICB9CgogICAgICAgICAgdmFyIGZ1bmMgPSBjYWxsYmFjay5mdW5jOwoKICAgICAgICAgIGlmICh0eXBlb2YgZnVuYyA9PT0gIm51bWJlciIpIHsKICAgICAgICAgICAgaWYgKGNhbGxiYWNrLmFyZyA9PT0gdW5kZWZpbmVkKSB7CiAgICAgICAgICAgICAgd2FzbVRhYmxlLmdldChmdW5jKSgpOwogICAgICAgICAgICB9IGVsc2UgewogICAgICAgICAgICAgIHdhc21UYWJsZS5nZXQoZnVuYykoY2FsbGJhY2suYXJnKTsKICAgICAgICAgICAgfQogICAgICAgICAgfSBlbHNlIHsKICAgICAgICAgICAgZnVuYyhjYWxsYmFjay5hcmcgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBjYWxsYmFjay5hcmcpOwogICAgICAgICAgfQogICAgICAgIH0KICAgICAgfQoKICAgICAgZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fbWVtY3B5X2JpZyhkZXN0LCBzcmMsIG51bSkgewogICAgICAgIEhFQVBVOC5jb3B5V2l0aGluKGRlc3QsIHNyYywgc3JjICsgbnVtKTsKICAgICAgfQoKICAgICAgZnVuY3Rpb24gZW1zY3JpcHRlbl9yZWFsbG9jX2J1ZmZlcihzaXplKSB7CiAgICAgICAgdHJ5IHsKICAgICAgICAgIHdhc21NZW1vcnkuZ3JvdyhzaXplIC0gYnVmZmVyLmJ5dGVMZW5ndGggKyA2NTUzNSA+Pj4gMTYpOwogICAgICAgICAgdXBkYXRlR2xvYmFsQnVmZmVyQW5kVmlld3Mod2FzbU1lbW9yeS5idWZmZXIpOwogICAgICAgICAgcmV0dXJuIDE7CiAgICAgICAgfSBjYXRjaCAoZSkge30KICAgICAgfQoKICAgICAgZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAocmVxdWVzdGVkU2l6ZSkgewogICAgICAgIHZhciBvbGRTaXplID0gSEVBUFU4Lmxlbmd0aDsKICAgICAgICByZXF1ZXN0ZWRTaXplID0gcmVxdWVzdGVkU2l6ZSA+Pj4gMDsKICAgICAgICB2YXIgbWF4SGVhcFNpemUgPSAyMTQ3NDgzNjQ4OwoKICAgICAgICBpZiAocmVxdWVzdGVkU2l6ZSA+IG1heEhlYXBTaXplKSB7CiAgICAgICAgICByZXR1cm4gZmFsc2U7CiAgICAgICAgfQoKICAgICAgICBmb3IgKHZhciBjdXREb3duID0gMTsgY3V0RG93biA8PSA0OyBjdXREb3duICo9IDIpIHsKICAgICAgICAgIHZhciBvdmVyR3Jvd25IZWFwU2l6ZSA9IG9sZFNpemUgKiAoMSArIC4yIC8gY3V0RG93bik7CiAgICAgICAgICBvdmVyR3Jvd25IZWFwU2l6ZSA9IE1hdGgubWluKG92ZXJHcm93bkhlYXBTaXplLCByZXF1ZXN0ZWRTaXplICsgMTAwNjYzMjk2KTsKICAgICAgICAgIHZhciBuZXdTaXplID0gTWF0aC5taW4obWF4SGVhcFNpemUsIGFsaWduVXAoTWF0aC5tYXgocmVxdWVzdGVkU2l6ZSwgb3Zlckdyb3duSGVhcFNpemUpLCA2NTUzNikpOwogICAgICAgICAgdmFyIHJlcGxhY2VtZW50ID0gZW1zY3JpcHRlbl9yZWFsbG9jX2J1ZmZlcihuZXdTaXplKTsKCiAgICAgICAgICBpZiAocmVwbGFjZW1lbnQpIHsKICAgICAgICAgICAgcmV0dXJuIHRydWU7CiAgICAgICAgICB9CiAgICAgICAgfQoKICAgICAgICByZXR1cm4gZmFsc2U7CiAgICAgIH0KCiAgICAgIHZhciBkZWNvZGVCYXNlNjQgPSB0eXBlb2YgYXRvYiA9PT0gImZ1bmN0aW9uIiA/IGF0b2IgOiBmdW5jdGlvbiAoaW5wdXQpIHsKICAgICAgICB2YXIga2V5U3RyID0gIkFCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89IjsKICAgICAgICB2YXIgb3V0cHV0ID0gIiI7CiAgICAgICAgdmFyIGNocjEsIGNocjIsIGNocjM7CiAgICAgICAgdmFyIGVuYzEsIGVuYzIsIGVuYzMsIGVuYzQ7CiAgICAgICAgdmFyIGkgPSAwOwogICAgICAgIGlucHV0ID0gaW5wdXQucmVwbGFjZSgvW15BLVphLXowLTlcK1wvXD1dL2csICIiKTsKCiAgICAgICAgZG8gewogICAgICAgICAgZW5jMSA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTsKICAgICAgICAgIGVuYzIgPSBrZXlTdHIuaW5kZXhPZihpbnB1dC5jaGFyQXQoaSsrKSk7CiAgICAgICAgICBlbmMzID0ga2V5U3RyLmluZGV4T2YoaW5wdXQuY2hhckF0KGkrKykpOwogICAgICAgICAgZW5jNCA9IGtleVN0ci5pbmRleE9mKGlucHV0LmNoYXJBdChpKyspKTsKICAgICAgICAgIGNocjEgPSBlbmMxIDw8IDIgfCBlbmMyID4+IDQ7CiAgICAgICAgICBjaHIyID0gKGVuYzIgJiAxNSkgPDwgNCB8IGVuYzMgPj4gMjsKICAgICAgICAgIGNocjMgPSAoZW5jMyAmIDMpIDw8IDYgfCBlbmM0OwogICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIxKTsKCiAgICAgICAgICBpZiAoZW5jMyAhPT0gNjQpIHsKICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIyKTsKICAgICAgICAgIH0KCiAgICAgICAgICBpZiAoZW5jNCAhPT0gNjQpIHsKICAgICAgICAgICAgb3V0cHV0ID0gb3V0cHV0ICsgU3RyaW5nLmZyb21DaGFyQ29kZShjaHIzKTsKICAgICAgICAgIH0KICAgICAgICB9IHdoaWxlIChpIDwgaW5wdXQubGVuZ3RoKTsKCiAgICAgICAgcmV0dXJuIG91dHB1dDsKICAgICAgfTsKCiAgICAgIGZ1bmN0aW9uIGludEFycmF5RnJvbUJhc2U2NChzKSB7CiAgICAgICAgdHJ5IHsKICAgICAgICAgIHZhciBkZWNvZGVkID0gZGVjb2RlQmFzZTY0KHMpOwogICAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoZGVjb2RlZC5sZW5ndGgpOwoKICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGVjb2RlZC5sZW5ndGg7ICsraSkgewogICAgICAgICAgICBieXRlc1tpXSA9IGRlY29kZWQuY2hhckNvZGVBdChpKTsKICAgICAgICAgIH0KCiAgICAgICAgICByZXR1cm4gYnl0ZXM7CiAgICAgICAgfSBjYXRjaCAoXykgewogICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCJDb252ZXJ0aW5nIGJhc2U2NCBzdHJpbmcgdG8gYnl0ZXMgZmFpbGVkLiIpOwogICAgICAgIH0KICAgICAgfQoKICAgICAgZnVuY3Rpb24gdHJ5UGFyc2VBc0RhdGFVUkkoZmlsZW5hbWUpIHsKICAgICAgICBpZiAoIWlzRGF0YVVSSShmaWxlbmFtZSkpIHsKICAgICAgICAgIHJldHVybjsKICAgICAgICB9CgogICAgICAgIHJldHVybiBpbnRBcnJheUZyb21CYXNlNjQoZmlsZW5hbWUuc2xpY2UoZGF0YVVSSVByZWZpeC5sZW5ndGgpKTsKICAgICAgfQoKICAgICAgdmFyIGFzbUxpYnJhcnlBcmcgPSB7CiAgICAgICAgImIiOiBfZW1zY3JpcHRlbl9tZW1jcHlfYmlnLAogICAgICAgICJhIjogX2Vtc2NyaXB0ZW5fcmVzaXplX2hlYXAKICAgICAgfTsKICAgICAgY3JlYXRlV2FzbSgpOwoKICAgICAgTW9kdWxlWyJfX193YXNtX2NhbGxfY3RvcnMiXSA9IGZ1bmN0aW9uICgpIHsKICAgICAgICByZXR1cm4gKE1vZHVsZVsiX19fd2FzbV9jYWxsX2N0b3JzIl0gPSBNb2R1bGVbImFzbSJdWyJkIl0pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7CiAgICAgIH07CgogICAgICBNb2R1bGVbIl9oMjY0YnNkSW5pdCJdID0gZnVuY3Rpb24gKCkgewogICAgICAgIHJldHVybiAoTW9kdWxlWyJfaDI2NGJzZEluaXQiXSA9IE1vZHVsZVsiYXNtIl1bImUiXSkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsKICAgICAgfTsKCiAgICAgIE1vZHVsZVsiX21hbGxvYyJdID0gZnVuY3Rpb24gKCkgewogICAgICAgIHJldHVybiAoTW9kdWxlWyJfbWFsbG9jIl0gPSBNb2R1bGVbImFzbSJdWyJmIl0pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7CiAgICAgIH07CgogICAgICBNb2R1bGVbIl9mcmVlIl0gPSBmdW5jdGlvbiAoKSB7CiAgICAgICAgcmV0dXJuIChNb2R1bGVbIl9mcmVlIl0gPSBNb2R1bGVbImFzbSJdWyJnIl0pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7CiAgICAgIH07CgogICAgICBNb2R1bGVbIl9oMjY0YnNkRGVjb2RlIl0gPSBmdW5jdGlvbiAoKSB7CiAgICAgICAgcmV0dXJuIChNb2R1bGVbIl9oMjY0YnNkRGVjb2RlIl0gPSBNb2R1bGVbImFzbSJdWyJoIl0pLmFwcGx5KG51bGwsIGFyZ3VtZW50cyk7CiAgICAgIH07CgogICAgICBNb2R1bGVbIl9oMjY0YnNkU2h1dGRvd24iXSA9IGZ1bmN0aW9uICgpIHsKICAgICAgICByZXR1cm4gKE1vZHVsZVsiX2gyNjRic2RTaHV0ZG93biJdID0gTW9kdWxlWyJhc20iXVsiaSJdKS5hcHBseShudWxsLCBhcmd1bWVudHMpOwogICAgICB9OwoKICAgICAgTW9kdWxlWyJfaDI2NGJzZEFsbG9jIl0gPSBmdW5jdGlvbiAoKSB7CiAgICAgICAgcmV0dXJuIChNb2R1bGVbIl9oMjY0YnNkQWxsb2MiXSA9IE1vZHVsZVsiYXNtIl1bImoiXSkuYXBwbHkobnVsbCwgYXJndW1lbnRzKTsKICAgICAgfTsKCiAgICAgIE1vZHVsZVsiX2gyNjRic2RGcmVlIl0gPSBmdW5jdGlvbiAoKSB7CiAgICAgICAgcmV0dXJuIChNb2R1bGVbIl9oMjY0YnNkRnJlZSJdID0gTW9kdWxlWyJhc20iXVsiayJdKS5hcHBseShudWxsLCBhcmd1bWVudHMpOwogICAgICB9OwoKICAgICAgTW9kdWxlWyJnZXRWYWx1ZSJdID0gZ2V0VmFsdWU7CiAgICAgIHZhciBjYWxsZWRSdW47CgogICAgICBkZXBlbmRlbmNpZXNGdWxmaWxsZWQgPSBmdW5jdGlvbiBydW5DYWxsZXIoKSB7CiAgICAgICAgaWYgKCFjYWxsZWRSdW4pIHJ1bigpOwogICAgICAgIGlmICghY2FsbGVkUnVuKSBkZXBlbmRlbmNpZXNGdWxmaWxsZWQgPSBydW5DYWxsZXI7CiAgICAgIH07CgogICAgICBmdW5jdGlvbiBydW4oYXJncykgewoKICAgICAgICBpZiAocnVuRGVwZW5kZW5jaWVzID4gMCkgewogICAgICAgICAgcmV0dXJuOwogICAgICAgIH0KCiAgICAgICAgcHJlUnVuKCk7CgogICAgICAgIGlmIChydW5EZXBlbmRlbmNpZXMgPiAwKSB7CiAgICAgICAgICByZXR1cm47CiAgICAgICAgfQoKICAgICAgICBmdW5jdGlvbiBkb1J1bigpIHsKICAgICAgICAgIGlmIChjYWxsZWRSdW4pIHJldHVybjsKICAgICAgICAgIGNhbGxlZFJ1biA9IHRydWU7CiAgICAgICAgICBNb2R1bGVbImNhbGxlZFJ1biJdID0gdHJ1ZTsKICAgICAgICAgIGlmIChBQk9SVCkgcmV0dXJuOwogICAgICAgICAgaW5pdFJ1bnRpbWUoKTsKICAgICAgICAgIHJlYWR5UHJvbWlzZVJlc29sdmUoTW9kdWxlKTsKICAgICAgICAgIGlmIChNb2R1bGVbIm9uUnVudGltZUluaXRpYWxpemVkIl0pIE1vZHVsZVsib25SdW50aW1lSW5pdGlhbGl6ZWQiXSgpOwogICAgICAgICAgcG9zdFJ1bigpOwogICAgICAgIH0KCiAgICAgICAgaWYgKE1vZHVsZVsic2V0U3RhdHVzIl0pIHsKICAgICAgICAgIE1vZHVsZVsic2V0U3RhdHVzIl0oIlJ1bm5pbmcuLi4iKTsKICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkgewogICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHsKICAgICAgICAgICAgICBNb2R1bGVbInNldFN0YXR1cyJdKCIiKTsKICAgICAgICAgICAgfSwgMSk7CiAgICAgICAgICAgIGRvUnVuKCk7CiAgICAgICAgICB9LCAxKTsKICAgICAgICB9IGVsc2UgewogICAgICAgICAgZG9SdW4oKTsKICAgICAgICB9CiAgICAgIH0KCiAgICAgIE1vZHVsZVsicnVuIl0gPSBydW47CgogICAgICBpZiAoTW9kdWxlWyJwcmVJbml0Il0pIHsKICAgICAgICBpZiAodHlwZW9mIE1vZHVsZVsicHJlSW5pdCJdID09ICJmdW5jdGlvbiIpIE1vZHVsZVsicHJlSW5pdCJdID0gW01vZHVsZVsicHJlSW5pdCJdXTsKCiAgICAgICAgd2hpbGUgKE1vZHVsZVsicHJlSW5pdCJdLmxlbmd0aCA+IDApIHsKICAgICAgICAgIE1vZHVsZVsicHJlSW5pdCJdLnBvcCgpKCk7CiAgICAgICAgfQogICAgICB9CgogICAgICBydW4oKTsKICAgICAgcmV0dXJuIE1vZHVsZS5yZWFkeTsKICAgIH07CiAgfSgpOwoKICB2YXIgaDI2NERlY29kZXJzID0ge307CgogIGZ1bmN0aW9uIGluaXQoKSB7CiAgICByZXR1cm4gTW9kdWxlKCkudGhlbihmdW5jdGlvbiAodGlueUgyNjQpIHsKICAgICAgc2VsZi5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgZnVuY3Rpb24gKGUpIHsKICAgICAgICB2YXIgbWVzc2FnZSA9IGUuZGF0YTsKICAgICAgICB2YXIgcmVuZGVyU3RhdGVJZCA9IG1lc3NhZ2UucmVuZGVyU3RhdGVJZDsKICAgICAgICB2YXIgbWVzc2FnZVR5cGUgPSBtZXNzYWdlLnR5cGU7CgogICAgICAgIHN3aXRjaCAobWVzc2FnZVR5cGUpIHsKICAgICAgICAgIGNhc2UgJ2RlY29kZSc6CiAgICAgICAgICAgIHsKICAgICAgICAgICAgICB2YXIgZGVjb2RlciA9IGgyNjREZWNvZGVyc1tyZW5kZXJTdGF0ZUlkXTsKCiAgICAgICAgICAgICAgaWYgKCFkZWNvZGVyKSB7CiAgICAgICAgICAgICAgICBkZWNvZGVyID0gbmV3IFRpbnlIMjY0RGVjb2Rlcih0aW55SDI2NCwgZnVuY3Rpb24gKG91dHB1dCwgd2lkdGgsIGhlaWdodCkgewogICAgICAgICAgICAgICAgICBwb3N0TWVzc2FnZSh7CiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3BpY3R1cmVSZWFkeScsCiAgICAgICAgICAgICAgICAgICAgd2lkdGg6IHdpZHRoLAogICAgICAgICAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LAogICAgICAgICAgICAgICAgICAgIHJlbmRlclN0YXRlSWQ6IHJlbmRlclN0YXRlSWQsCiAgICAgICAgICAgICAgICAgICAgZGF0YTogb3V0cHV0LmJ1ZmZlcgogICAgICAgICAgICAgICAgICB9LCBbb3V0cHV0LmJ1ZmZlcl0pOwogICAgICAgICAgICAgICAgfSk7CiAgICAgICAgICAgICAgICBoMjY0RGVjb2RlcnNbcmVuZGVyU3RhdGVJZF0gPSBkZWNvZGVyOwogICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgZGVjb2Rlci5kZWNvZGUobmV3IFVpbnQ4QXJyYXkobWVzc2FnZS5kYXRhLCBtZXNzYWdlLm9mZnNldCwgbWVzc2FnZS5sZW5ndGgpKTsKICAgICAgICAgICAgICBicmVhazsKICAgICAgICAgICAgfQoKICAgICAgICAgIGNhc2UgJ3JlbGVhc2UnOgogICAgICAgICAgICB7CiAgICAgICAgICAgICAgdmFyIF9kZWNvZGVyID0gaDI2NERlY29kZXJzW3JlbmRlclN0YXRlSWRdOwoKICAgICAgICAgICAgICBpZiAoX2RlY29kZXIpIHsKICAgICAgICAgICAgICAgIF9kZWNvZGVyLnJlbGVhc2UoKTsKCiAgICAgICAgICAgICAgICBkZWxldGUgaDI2NERlY29kZXJzW3JlbmRlclN0YXRlSWRdOwogICAgICAgICAgICAgIH0KCiAgICAgICAgICAgICAgYnJlYWs7CiAgICAgICAgICAgIH0KICAgICAgICB9CiAgICAgIH0pOwogICAgICBzZWxmLnBvc3RNZXNzYWdlKHsKICAgICAgICAndHlwZSc6ICdkZWNvZGVyUmVhZHknCiAgICAgIH0pOwogICAgfSk7CiAgfQoKICBpbml0KCk7Cgp9KSgpOwoK', null, false);
  /* eslint-enable */

  /** Detect free variable `global` from Node.js. */
  var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

  var freeGlobal$1 = freeGlobal;

  /** Detect free variable `self`. */
  var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

  /** Used as a reference to the global object. */
  var root = freeGlobal$1 || freeSelf || Function('return this')();

  var root$1 = root;

  /** Built-in value references. */
  var Symbol$1 = root$1.Symbol;

  var Symbol$2 = Symbol$1;

  /** Used for built-in method references. */
  var objectProto$1 = Object.prototype;

  /** Used to check objects for own properties. */
  var hasOwnProperty = objectProto$1.hasOwnProperty;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString$1 = objectProto$1.toString;

  /** Built-in value references. */
  var symToStringTag$1 = Symbol$2 ? Symbol$2.toStringTag : undefined;

  /**
   * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the raw `toStringTag`.
   */
  function getRawTag(value) {
    var isOwn = hasOwnProperty.call(value, symToStringTag$1),
        tag = value[symToStringTag$1];

    try {
      value[symToStringTag$1] = undefined;
      var unmasked = true;
    } catch (e) {}

    var result = nativeObjectToString$1.call(value);
    if (unmasked) {
      if (isOwn) {
        value[symToStringTag$1] = tag;
      } else {
        delete value[symToStringTag$1];
      }
    }
    return result;
  }

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var nativeObjectToString = objectProto.toString;

  /**
   * Converts `value` to a string using `Object.prototype.toString`.
   *
   * @private
   * @param {*} value The value to convert.
   * @returns {string} Returns the converted string.
   */
  function objectToString(value) {
    return nativeObjectToString.call(value);
  }

  /** `Object#toString` result references. */
  var nullTag = '[object Null]',
      undefinedTag = '[object Undefined]';

  /** Built-in value references. */
  var symToStringTag = Symbol$2 ? Symbol$2.toStringTag : undefined;

  /**
   * The base implementation of `getTag` without fallbacks for buggy environments.
   *
   * @private
   * @param {*} value The value to query.
   * @returns {string} Returns the `toStringTag`.
   */
  function baseGetTag(value) {
    if (value == null) {
      return value === undefined ? undefinedTag : nullTag;
    }
    return (symToStringTag && symToStringTag in Object(value))
      ? getRawTag(value)
      : objectToString(value);
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return value != null && typeof value == 'object';
  }

  /** `Object#toString` result references. */
  var symbolTag = '[object Symbol]';

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && baseGetTag(value) == symbolTag);
  }

  /**
   * Checks if `value` is classified as an `Array` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an array, else `false`.
   * @example
   *
   * _.isArray([1, 2, 3]);
   * // => true
   *
   * _.isArray(document.body.children);
   * // => false
   *
   * _.isArray('abc');
   * // => false
   *
   * _.isArray(_.noop);
   * // => false
   */
  var isArray = Array.isArray;

  var isArray$1 = isArray;

  /** Used to match a single whitespace character. */
  var reWhitespace = /\s/;

  /**
   * Used by `_.trim` and `_.trimEnd` to get the index of the last non-whitespace
   * character of `string`.
   *
   * @private
   * @param {string} string The string to inspect.
   * @returns {number} Returns the index of the last non-whitespace character.
   */
  function trimmedEndIndex(string) {
    var index = string.length;

    while (index-- && reWhitespace.test(string.charAt(index))) {}
    return index;
  }

  /** Used to match leading whitespace. */
  var reTrimStart = /^\s+/;

  /**
   * The base implementation of `_.trim`.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} Returns the trimmed string.
   */
  function baseTrim(string) {
    return string
      ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, '')
      : string;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return value != null && (type == 'object' || type == 'function');
  }

  /** Used as references for various `Number` constants. */
  var NAN = 0 / 0;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = baseTrim(value);
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_INTEGER = 1.7976931348623157e+308;

  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  /** `Object#toString` result references. */
  var asyncTag = '[object AsyncFunction]',
      funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      proxyTag = '[object Proxy]';

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    if (!isObject(value)) {
      return false;
    }
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 9 which returns 'object' for typed arrays and other constructors.
    var tag = baseGetTag(value);
    return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER$1 = 9007199254740991;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    var type = typeof value;
    length = length == null ? MAX_SAFE_INTEGER$1 : length;

    return !!length &&
      (type == 'number' ||
        (type != 'symbol' && reIsUint.test(value))) &&
          (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /** Used as references for various `Number` constants. */
  var MAX_SAFE_INTEGER = 9007199254740991;

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeCeil = Math.ceil,
      nativeMax = Math.max;

  /**
   * The base implementation of `_.range` and `_.rangeRight` which doesn't
   * coerce arguments.
   *
   * @private
   * @param {number} start The start of the range.
   * @param {number} end The end of the range.
   * @param {number} step The value to increment or decrement by.
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Array} Returns the range of numbers.
   */
  function baseRange(start, end, step, fromRight) {
    var index = -1,
        length = nativeMax(nativeCeil((end - start) / (step || 1)), 0),
        result = Array(length);

    while (length--) {
      result[fromRight ? length : ++index] = start;
      start += step;
    }
    return result;
  }

  /**
   * Creates a `_.range` or `_.rangeRight` function.
   *
   * @private
   * @param {boolean} [fromRight] Specify iterating from right to left.
   * @returns {Function} Returns the new range function.
   */
  function createRange(fromRight) {
    return function(start, end, step) {
      if (step && typeof step != 'number' && isIterateeCall(start, end, step)) {
        end = step = undefined;
      }
      // Ensure the sign of `-0` is preserved.
      start = toFinite(start);
      if (end === undefined) {
        end = start;
        start = 0;
      } else {
        end = toFinite(end);
      }
      step = step === undefined ? (start < end ? 1 : -1) : toFinite(step);
      return baseRange(start, end, step, fromRight);
    };
  }

  /**
   * Creates an array of numbers (positive and/or negative) progressing from
   * `start` up to, but not including, `end`. A step of `-1` is used if a negative
   * `start` is specified without an `end` or `step`. If `end` is not specified,
   * it's set to `start` with `start` then set to `0`.
   *
   * **Note:** JavaScript follows the IEEE-754 standard for resolving
   * floating-point values which can produce unexpected results.
   *
   * @static
   * @since 0.1.0
   * @memberOf _
   * @category Util
   * @param {number} [start=0] The start of the range.
   * @param {number} end The end of the range.
   * @param {number} [step=1] The value to increment or decrement by.
   * @returns {Array} Returns the range of numbers.
   * @see _.inRange, _.rangeRight
   * @example
   *
   * _.range(4);
   * // => [0, 1, 2, 3]
   *
   * _.range(-4);
   * // => [0, -1, -2, -3]
   *
   * _.range(1, 5);
   * // => [1, 2, 3, 4]
   *
   * _.range(0, 20, 5);
   * // => [0, 5, 10, 15]
   *
   * _.range(0, -4, -1);
   * // => [0, -1, -2, -3]
   *
   * _.range(1, 4, 0);
   * // => [1, 1, 1]
   *
   * _.range(0);
   * // => []
   */
  var range = createRange();

  var range$1 = range;

  // Unique ID creation requires a high quality random # generator. In the browser we therefore
  // require the crypto API and do not support built-in fallback to lower quality random number
  // generators (like Math.random()).
  var getRandomValues;
  var rnds8 = new Uint8Array(16);
  function rng() {
    // lazy load so that environments that need to polyfill have a chance to do so
    if (!getRandomValues) {
      // getRandomValues needs to be invoked in a context where "this" is a Crypto implementation. Also,
      // find the complete implementation of crypto (msCrypto) on IE11.
      getRandomValues = typeof crypto !== 'undefined' && crypto.getRandomValues && crypto.getRandomValues.bind(crypto) || typeof msCrypto !== 'undefined' && typeof msCrypto.getRandomValues === 'function' && msCrypto.getRandomValues.bind(msCrypto);

      if (!getRandomValues) {
        throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
      }
    }

    return getRandomValues(rnds8);
  }

  var REGEX = /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;

  function validate(uuid) {
    return typeof uuid === 'string' && REGEX.test(uuid);
  }

  /**
   * Convert array of 16 byte values to UUID string format of the form:
   * XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX
   */

  var byteToHex = [];

  for (var i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).substr(1));
  }

  function stringify(arr) {
    var offset = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    // Note: Be careful editing this code!  It's been tuned for performance
    // and works in ways you may not expect. See https://github.com/uuidjs/uuid/pull/434
    var uuid = (byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + '-' + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + '-' + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + '-' + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + '-' + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]]).toLowerCase(); // Consistency check for valid UUID.  If this throws, it's likely due to one
    // of the following:
    // - One or more input array values don't map to a hex octet (leading to
    // "undefined" in the uuid)
    // - Invalid input values for the RFC `version` or `variant` fields

    if (!validate(uuid)) {
      throw TypeError('Stringified UUID is invalid');
    }

    return uuid;
  }

  function v4(options, buf, offset) {
    options = options || {};
    var rnds = options.random || (options.rng || rng)(); // Per 4.4, set bits for version and `clock_seq_hi_and_reserved`

    rnds[6] = rnds[6] & 0x0f | 0x40;
    rnds[8] = rnds[8] & 0x3f | 0x80; // Copy bytes to buffer, if provided

    if (buf) {
      offset = offset || 0;

      for (var i = 0; i < 16; ++i) {
        buf[offset + i] = rnds[i];
      }

      return buf;
    }

    return stringify(rnds);
  }

  function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }

  function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
  var VDecoder = /*#__PURE__*/function (_EventEmitter) {
    _inherits(VDecoder, _EventEmitter);

    var _super = _createSuper(VDecoder);

    function VDecoder(_ref) {
      var _this;

      _ref.chunkSize;
          var _ref$maxChip = _ref.maxChip,
          maxChip = _ref$maxChip === void 0 ? 100 : _ref$maxChip;

      _classCallCheck(this, VDecoder);

      _this = _super.call(this); // this.cacheSegmentCount = cacheSegmentCount;
      // this.chunkSize = chunkSize;

      _this.cacheBuffer = [];
      _this.cacheBufferTotal = null;
      _this.worker = new WorkerFactory();

      _this.initWorker();

      _this.tempVideos = [];
      _this.ready = false;
      _this.decoding = false;
      _this.decodingId = null;
      _this.start = null;
      _this.maxChip = maxChip;
      return _this;
    }

    _createClass(VDecoder, [{
      key: "initWorker",
      value: function initWorker() {
        var _this2 = this;

        this.worker.addEventListener("message", function (e) {
          var message =
          /** @type {{type:string, width:number, height:number, data:ArrayBuffer, renderStateId:number}} */
          e.data;

          switch (message.type) {
            case "pictureReady":
              //   onPictureReady(message);
              // console.log(
              //   "[VDecoder]::decodeData",
              //   Object.assign(message, { clipId: this.decodingId })
              // );
              _this2.emit("decodeData", Object.assign(message, {
                clipId: _this2.decodingId
              }));

              if (_this2.decoding && _this2.decodingId) {
                _this2.decodeNext(_this2.decodingId);
              }

              break;

            case "decoderReady":
              _this2.ready = true;

              _this2.emit("ready");

              break;
          }
        });
      }
      /**
       *
       * @param {*} rangeArray array [2,100]
       */

    }, {
      key: "fetch",
      value: function (_fetch) {
        function fetch(_x) {
          return _fetch.apply(this, arguments);
        }

        fetch.toString = function () {
          return _fetch.toString();
        };

        return fetch;
      }(function (_ref2) {
        var _this3 = this;

        var path = _ref2.path,
            rangeArray = _ref2.range,
            _ref2$decode = _ref2.decode,
            decode = _ref2$decode === void 0 ? true : _ref2$decode;

        if (!this.ready) {
          throw new Error("decoder is not ready");
        }

        var url = path;

        if (!(isArray$1(rangeArray) && rangeArray.length === 2)) {
          throw new Error("range must is an array!");
        }

        if (this.tempVideos.length > this.maxChip) {
          this.flush();
          console.log("flush");
        }

        var rangeFetch = [];

        if (rangeArray[0] < 0 || rangeArray[1] < 0) {
          console.error("[VDecoder]:range: 非法", "".concat([rangeArray[0], rangeArray[1]]));
          return;
        }

        if (rangeArray[0] < rangeArray[1]) {
          rangeFetch = range$1(rangeArray[0], rangeArray[1] + 1);
          console.log("[VDecoder]:顺时 +", rangeFetch);
        } else {
          rangeFetch = range$1(rangeArray[1], rangeArray[0] + 1).reverse();
          console.log("[VDecoder]:逆时 -", rangeFetch);
        }

        var allFetch = rangeFetch.map(function (i) {
          return fetch("".concat(url, "/").concat(i)).then(function (response) {
            return response.arrayBuffer().then(function (buffer) {
              return new Uint8Array(buffer);
            });
          });
        });
        return Promise.all(allFetch).then(function (data) {
          var clip = {
            id: v4(),
            data: data
          };

          if (data.length > 0) {
            _this3.emit("fetchDone", clip);

            _this3.cacheBuffer = data.slice();

            _this3.tempVideos.push(clip);

            console.log("[VDecoder]:获取clip,", clip);

            if (decode) {
              _this3.start = Date.now();
              _this3.cacheBufferTotal = clip.data.length;

              _this3.decodeNext(clip.id);
            }

            return Promise.resolve(clip);
          } else {
            console.warn("[VDecoder]:fetch取帧为空", rangeFetch);
          }
        }).catch(function (error) {
          console.log("error", error);
        });
      }
      /**
       * @param {Uint8Array} h264Nal
       */
      )
    }, {
      key: "decode",
      value: function decode(h264Nal, id) {
        this.worker.postMessage({
          type: "decode",
          data: h264Nal.buffer,
          offset: h264Nal.byteOffset,
          length: h264Nal.byteLength,
          renderStateId: id
        }, [h264Nal.buffer]);
      }
    }, {
      key: "decodeNext",
      value: function decodeNext(clipId) {
        var _this4 = this;

        var nextFrame = this.cacheBuffer.shift();
        this.decodingId = clipId;
        this.decoding = true;
        var tempId = this.cacheBufferTotal - this.cacheBuffer.length - 1;

        if (nextFrame) {
          this.decode(nextFrame, tempId);
        } else {
          console.log("tempVideos", this.tempVideos.length);
          var clip = this.tempVideos.find(function (_ref3) {
            var id = _ref3.id;
            return id === _this4.decodingId;
          });

          if (clip) {
            var fps = 1000 / (Date.now() - this.start) * clip.data.length;
            console.log("Decoded ".concat(clip.data.length, " frames in ").concat(Date.now() - this.start, "ms @ ").concat(fps >> 0, "FPS"));
          } else {
            console.warn("不存在clip");
          }

          this.decoding = false; // this.decodingId = null;

          tempId = 0;
          clip && clip.id && this.emit("decodeDone", clip.id);
        }
      }
    }, {
      key: "flush",
      value: function flush() {
        this.tempVideos = [];
      }
    }, {
      key: "preloader",
      value: function preloader(preload) {}
    }], [{
      key: "isSupport",
      value: function isSupport() {
        return !!( // UC and Quark browser (iOS/Android) support wasm/asm limited,
        // its iOS version make wasm/asm performance very slow （maybe hook something）
        // its Android version removed support for wasm/asm, it just run pure javascript codes,
        // so it is very easy to cause memory leaks
        !/UCBrowser|Quark/.test(window.navigator.userAgent) && window.fetch && window.ReadableStream && window.Promise && window.URL && window.URL.createObjectURL && window.Blob && window.Worker && !!new Audio().canPlayType("audio/aac;").replace(/^no$/, "") && (window.AudioContext || window.webkitAudioContext));
      }
    }]);

    return VDecoder;
  }(eventemitter3);

  var ShaderProgram = /*#__PURE__*/function () {
    /**
     * @param {WebGLRenderingContext}gl
     */
    function ShaderProgram(gl) {
      _classCallCheck(this, ShaderProgram);

      this.gl = gl;
      this.program = this.gl.createProgram();
    }
    /**
     * @param {WebGLShader}shader
     */


    _createClass(ShaderProgram, [{
      key: "attach",
      value: function attach(shader) {
        this.gl.attachShader(this.program, shader);
      }
    }, {
      key: "link",
      value: function link() {
        this.gl.linkProgram(this.program); // If creating the shader program failed, alert.

        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
          console.error('Unable to initialize the shader program.');
        }
      }
    }, {
      key: "use",
      value: function use() {
        this.gl.useProgram(this.program);
      }
      /**
       * @param {string}name
       * @return {number}
       */

    }, {
      key: "getAttributeLocation",
      value: function getAttributeLocation(name) {
        return this.gl.getAttribLocation(this.program, name);
      }
      /**
       * @param {string}name
       * @return {WebGLUniformLocation | null}
       */

    }, {
      key: "getUniformLocation",
      value: function getUniformLocation(name) {
        return this.gl.getUniformLocation(this.program, name);
      }
      /**
       * @param {WebGLUniformLocation}uniformLocation
       * @param {Array<number>}array
       */

    }, {
      key: "setUniformM4",
      value: function setUniformM4(uniformLocation, array) {
        this.gl.uniformMatrix4fv(uniformLocation, false, array);
      }
    }]);

    return ShaderProgram;
  }();

  /**
   * Represents a WebGL shader object and provides a mechanism to load shaders from HTML
   * script tags.
   */
  var ShaderCompiler = /*#__PURE__*/function () {
    function ShaderCompiler() {
      _classCallCheck(this, ShaderCompiler);
    }

    _createClass(ShaderCompiler, null, [{
      key: "compile",
      value:
      /**
       * @param {WebGLRenderingContext}gl
       * @param {{type: string, source: string}}script
       * @return {WebGLShader}
       */
      function compile(gl, script) {
        var shader; // Now figure out what type of shader script we have, based on its MIME type.

        if (script.type === 'x-shader/x-fragment') {
          shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (script.type === 'x-shader/x-vertex') {
          shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
          throw new Error('Unknown shader type: ' + script.type);
        } // Send the source to the shader object.


        gl.shaderSource(shader, script.source); // Compile the shader program.

        gl.compileShader(shader); // See if it compiled successfully.

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          throw new Error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
        }

        return shader;
      }
    }]);

    return ShaderCompiler;
  }();

  /**
   * @type {{type: string, source: string}}
   */
  var vertexQuad = {
    type: 'x-shader/x-vertex',
    source: "\n  precision mediump float;\n\n  uniform mat4 u_projection;\n  attribute vec2 a_position;\n  attribute vec2 a_texCoord;\n  varying vec2 v_texCoord;\n  void main(){\n      v_texCoord = a_texCoord;\n      gl_Position = u_projection * vec4(a_position, 0.0, 1.0);\n  }\n"
  };
  /**
   * @type {{type: string, source: string}}
   */

  var fragmentYUV = {
    type: 'x-shader/x-fragment',
    source: "\n  precision lowp float;\n  \n  varying vec2 v_texCoord;\n  \n  uniform sampler2D yTexture;\n  uniform sampler2D uTexture;\n  uniform sampler2D vTexture;\n    \n  const mat4 conversion = mat4(\n    1.0,     0.0,     1.402,  -0.701,\n    1.0,    -0.344,  -0.714,   0.529,\n    1.0,     1.772,   0.0,    -0.886,\n    0.0,     0.0,     0.0,     0.0\n  );\n\n  void main(void) {\n    float yChannel = texture2D(yTexture, v_texCoord).x;\n    float uChannel = texture2D(uTexture, v_texCoord).x;\n    float vChannel = texture2D(vTexture, v_texCoord).x;\n    vec4 channels = vec4(yChannel, uChannel, vChannel, 1.0);\n    vec3 rgb = (channels * conversion).xyz;\n    gl_FragColor = vec4(rgb, 1.0);\n  }\n"
  };

  var YUVSurfaceShader = /*#__PURE__*/function () {
    function YUVSurfaceShader(gl, vertexBuffer, shaderArgs, program) {
      _classCallCheck(this, YUVSurfaceShader);

      this.gl = gl;
      this.vertexBuffer = vertexBuffer;
      this.shaderArgs = shaderArgs;
      this.program = program;
    }
    /**
     *
     * @param {Texture} textureY
     * @param {Texture} textureU
     * @param {Texture} textureV
     */


    _createClass(YUVSurfaceShader, [{
      key: "setTexture",
      value: function setTexture(textureY, textureU, textureV) {
        var gl = this.gl;
        gl.uniform1i(this.shaderArgs.yTexture, 0);
        gl.uniform1i(this.shaderArgs.uTexture, 1);
        gl.uniform1i(this.shaderArgs.vTexture, 2);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textureY.texture);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textureU.texture);
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, textureV.texture);
      }
    }, {
      key: "use",
      value: function use() {
        this.program.use();
      }
    }, {
      key: "release",
      value: function release() {
        var gl = this.gl;
        gl.useProgram(null);
      }
      /**
       * @param {{w:number, h:number}}encodedFrameSize
       * @param {{maxXTexCoord:number, maxYTexCoord:number}} h264RenderState
       */

    }, {
      key: "updateShaderData",
      value: function updateShaderData(encodedFrameSize, h264RenderState) {
        var w = encodedFrameSize.w,
            h = encodedFrameSize.h;
        this.gl.viewport(0, 0, w, h);
        this.program.setUniformM4(this.shaderArgs.u_projection, [2.0 / w, 0, 0, 0, 0, 2.0 / -h, 0, 0, 0, 0, 1, 0, -1, 1, 0, 1]);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([// First triangle
        // top left:
        0, 0, 0, 0, // top right:
        w, 0, h264RenderState.maxXTexCoord, 0, // bottom right:
        w, h, h264RenderState.maxXTexCoord, h264RenderState.maxYTexCoord, // Second triangle
        // bottom right:
        w, h, h264RenderState.maxXTexCoord, h264RenderState.maxYTexCoord, // bottom left:
        0, h, 0, h264RenderState.maxYTexCoord, // top left:
        0, 0, 0, 0]), this.gl.DYNAMIC_DRAW);
        this.gl.vertexAttribPointer(this.shaderArgs.a_position, 2, this.gl.FLOAT, false, 16, 0);
        this.gl.vertexAttribPointer(this.shaderArgs.a_texCoord, 2, this.gl.FLOAT, false, 16, 8);
      }
    }, {
      key: "draw",
      value: function draw() {
        var gl = this.gl;
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
        gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 6);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }], [{
      key: "create",
      value:
      /**
       *
       * @param {WebGLRenderingContext} gl
       * @returns {YUVSurfaceShader}
       */
      function create(gl) {
        var program = this._initShaders(gl);

        var shaderArgs = this._initShaderArgs(gl, program);

        var vertexBuffer = this._initBuffers(gl);

        return new YUVSurfaceShader(gl, vertexBuffer, shaderArgs, program);
      }
    }, {
      key: "_initShaders",
      value: function _initShaders(gl) {
        var program = new ShaderProgram(gl);
        program.attach(ShaderCompiler.compile(gl, vertexQuad));
        program.attach(ShaderCompiler.compile(gl, fragmentYUV));
        program.link();
        program.use();
        return program;
      }
    }, {
      key: "_initShaderArgs",
      value: function _initShaderArgs(gl, program) {
        // find shader arguments
        var shaderArgs = {};
        shaderArgs.yTexture = program.getUniformLocation('yTexture');
        shaderArgs.uTexture = program.getUniformLocation('uTexture');
        shaderArgs.vTexture = program.getUniformLocation('vTexture');
        shaderArgs.u_projection = program.getUniformLocation('u_projection');
        shaderArgs.a_position = program.getAttributeLocation('a_position');
        gl.enableVertexAttribArray(shaderArgs.a_position);
        shaderArgs.a_texCoord = program.getAttributeLocation('a_texCoord');
        gl.enableVertexAttribArray(shaderArgs.a_texCoord);
        return shaderArgs;
      }
    }, {
      key: "_initBuffers",
      value: function _initBuffers(gl) {
        // Create vertex buffer object.
        return gl.createBuffer();
      }
    }]);

    return YUVSurfaceShader;
  }();

  // Copyright 2019 Erik De Rijcke
  //
  // This file is part of Greenfield.
  //
  // Greenfield is free software: you can redistribute it and/or modify
  // it under the terms of the GNU Affero General Public License as published by
  // the Free Software Foundation, either version 3 of the License, or
  // (at your option) any later version.
  //
  // Greenfield is distributed in the hope that it will be useful,
  // but WITHOUT ANY WARRANTY; without even the implied warranty of
  // MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  // GNU Affero General Public License for more details.
  //
  // You should have received a copy of the GNU Affero General Public License
  // along with Greenfield.  If not, see <https://www.gnu.org/licenses/>.

  /**
   * Represents a WebGL texture object.
   */
  var Texture = /*#__PURE__*/function () {
    /**
     * Use Texture.create(..) instead.
     * @param {WebGLRenderingContext}gl
     * @param {number}format
     * @param {WebGLTexture}texture
     * @private
     */
    function Texture(gl, format, texture) {
      _classCallCheck(this, Texture);

      /**
       * @type {WebGLRenderingContext}
       */
      this.gl = gl;
      /**
       * @type {WebGLTexture}
       */

      this.texture = texture;
      /**
       * @type {number}
       */

      this.format = format;
    }
    /**
     * @param {!Uint8Array|HTMLVideoElement}buffer
     * @param {!Rect}geo
     * @param {number}stride
     */


    _createClass(Texture, [{
      key: "subImage2dBuffer",
      value: function subImage2dBuffer(buffer, x, y, width, height) {
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, width, height, this.format, gl.UNSIGNED_BYTE, buffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
      /**
       * @param {!Uint8Array|HTMLVideoElement}buffer
       * @param {number}width
       * @param {number}height
       */

    }, {
      key: "image2dBuffer",
      value: function image2dBuffer(buffer, width, height) {
        var gl = this.gl;
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, this.format, width, height, 0, this.format, gl.UNSIGNED_BYTE, buffer);
        gl.bindTexture(gl.TEXTURE_2D, null);
      }
    }, {
      key: "delete",
      value: function _delete() {
        this.gl.deleteTexture(this.texture);
        this.texture = null;
      }
    }], [{
      key: "create",
      value:
      /**
       * @param {!WebGLRenderingContext}gl
       * @param {!number}format
       * @return {!Texture}
       */
      function create(gl, format) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return new Texture(gl, format, texture);
      }
    }]);

    return Texture;
  }();

  var canvas = null;
  var yuvSurfaceShader = null;
  var yTexture = null;
  var uTexture = null;
  var vTexture = null;

  function initWebGLCanvas() {
    canvas = document.createElement("canvas");
    canvas.id = "test_canvas";
    canvas.style = "position: fixed;top:0;left: 0;z-index: 100;";
    var gl = canvas.getContext("webgl");
    yuvSurfaceShader = YUVSurfaceShader.create(gl);
    yTexture = Texture.create(gl, gl.LUMINANCE);
    uTexture = Texture.create(gl, gl.LUMINANCE);
    vTexture = Texture.create(gl, gl.LUMINANCE);
    document.body.append(canvas);
  }

  function draw(buffer, width, height) {
    canvas.width = width;
    canvas.height = height; // the width & height returned are actually padded, so we have to use the frame size to get the real image dimension
    // when uploading to texture

    var stride = width; // stride
    // height is padded with filler rows
    // if we knew the size of the video before encoding, we could cut out the black filler pixels. We don't, so just set
    // it to the size after encoding

    var sourceWidth = width;
    var sourceHeight = height;
    var maxXTexCoord = sourceWidth / stride;
    var maxYTexCoord = sourceHeight / height;
    var lumaSize = stride * height;
    var chromaSize = lumaSize >> 2;
    var yBuffer = buffer.subarray(0, lumaSize);
    var uBuffer = buffer.subarray(lumaSize, lumaSize + chromaSize);
    var vBuffer = buffer.subarray(lumaSize + chromaSize, lumaSize + 2 * chromaSize); //   console.log("yBuffer", 1);
    //   window.updateTexture(yBuffer);

    var chromaHeight = height >> 1;
    var chromaStride = stride >> 1; // we upload the entire image, including stride padding & filler rows. The actual visible image will be mapped
    // from texture coordinates as to crop out stride padding & filler rows using maxXTexCoord and maxYTexCoord.

    yTexture.image2dBuffer(yBuffer, stride, height);
    uTexture.image2dBuffer(uBuffer, chromaStride, chromaHeight);
    vTexture.image2dBuffer(vBuffer, chromaStride, chromaHeight);
    yuvSurfaceShader.setTexture(yTexture, uTexture, vTexture);
    yuvSurfaceShader.updateShaderData({
      w: width,
      h: height
    }, {
      maxXTexCoord,
      maxYTexCoord
    }); // debugger
    // data = window.changeTexture(data);
    // window.updateTexture( data );

    yuvSurfaceShader.draw();
  }

  var socket = io("ws://192.168.0.150:3000", {
    reconnectionDelayMax: 10000
  });
  socket.on("connect", function (data) {
    console.log("socket connect");
  });
  var vDecoder = new VDecoder({
    maxChip: 100
  });
  vDecoder.on("ready", function () {
    console.log("ready"); // 测试canvas

    initWebGLCanvas(); //   vDecoder.fetch({
    //     path: "https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/1011",
    //     range: [0, 66],
    //   });

    vDecoder.on("fetchDone", function (clip) {
      console.log("fetchDone", clip);
    }); //监听 decodeData

    vDecoder.on("decodeData", function (data) {
      // console.log("decodeData", data);
      var width = data.width,
          height = data.height,
          buffer = data.data;
      draw(new Uint8Array(buffer), width, height); // window.updateTexture( new Uint8Array(buffer) );
      // window.up
    });
    vDecoder.on("decodeDone", /*#__PURE__*/function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee(id) {
        return regenerator.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                // vDecoder.fetch({
                //   path: "https://laser-data.oss-cn-shenzhen.aliyuncs.com/test-video/1011",
                //   range: [0, 66],
                // });
                // console.log("clipId", clipId);

              case 1:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x) {
        return _ref.apply(this, arguments);
      };
    }());
  });
  var rtc = new RTCPeerConnection();
  socket.on("offer", /*#__PURE__*/function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regenerator.mark(function _callee2(data) {
      var offer, answer;
      return regenerator.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              offer = new RTCSessionDescription({
                sdp: data.sdp,
                type: data.type
              });
              console.log("offer", offer);
              rtc.setRemoteDescription(offer);
              _context2.next = 6;
              return rtc.createAnswer();

            case 6:
              answer = _context2.sent;
              console.log("send-answer", answer);
              rtc.setLocalDescription(answer);
              socket.emit("answer", JSON.stringify(answer));

            case 10:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    }));

    return function (_x2) {
      return _ref2.apply(this, arguments);
    };
  }());
  socket.on("candidate", function (data) {
    if (/172\./.test(data.candidate)) return;
    var candidate = new RTCIceCandidate(data);
    rtc.addIceCandidate(candidate);
    console.log("candidate", candidate);
  });

  rtc.ondatachannel = function (data) {
    console.log("DataChannel from ", data);
    var inputChannel = data.channel;

    inputChannel.onopen = function (data) {
      console.warn("onopen", data);
    };

    inputChannel.onmessage = function (data) {
      var id = 0;

      if (data.data) {
        var h264Nal = new Uint8Array(data.data); // console.warn("onmessage", data);

        vDecoder.worker.postMessage({
          type: "decode",
          data: h264Nal.buffer,
          offset: h264Nal.byteOffset,
          length: h264Nal.byteLength,
          renderStateId: id
        }, [h264Nal.buffer]);
        id++;
      }
    };

    inputChannel.onclose = function (data) {
      console.warn("onclose", data);
    };
  };

  console.log("rtc", rtc);

  rtc.oniceconnectionstatechange = function (data) {
    console.log("oniceconnectionstatechange", data);
  };

  rtc.onicegatheringstatechange = function (data) {
    console.log("onicegatheringstatechange", data);
  };

  rtc.onicecandidate = function (data) {
    console.log("onicecandidate", data);
    socket.emit("ice_candidate", data.candidate);
  };

}));
//# sourceMappingURL=video.js.map
