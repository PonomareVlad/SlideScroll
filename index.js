"use strict";

window.exports = window.exports || {};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debounce = debounce;
exports.default = void 0;

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
    var self = this, args = arguments;
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
  return Constructor;
}

var SlideScroll =
    /*#__PURE__*/
    function () {
      function SlideScroll() {
        var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
            _ref$sliderNode = _ref.sliderNode,
            sliderNode = _ref$sliderNode === void 0 ? '[data-slider-viewport]' : _ref$sliderNode,
            _ref$lazyLoader = _ref.lazyLoader,
            lazyLoader = _ref$lazyLoader === void 0 ? true : _ref$lazyLoader,
            _ref$scrollEventDelay = _ref.scrollEventDelay,
            scrollEventDelay = _ref$scrollEventDelay === void 0 ? 1 : _ref$scrollEventDelay,
            _ref$debug = _ref.debug,
            debug = _ref$debug === void 0 ? false : _ref$debug,
            _ref$activeHook = _ref.activeHook,
            activeHook = _ref$activeHook === void 0 ? false : _ref$activeHook;

        _classCallCheck(this, SlideScroll);

        this.options = {
          sliderNode: sliderNode,
          lazyLoader: lazyLoader,
          scrollEventDelay: scrollEventDelay,
          iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
          debug: debug,
          activeHook: activeHook
        };
        this.attachConsoleProxy();

        Array.prototype.forEachAsync =
            /*#__PURE__*/
            function () {
              var _ref2 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee(fn) {
                    var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, t;

                    return regeneratorRuntime.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 3;
                            _iterator = this[Symbol.iterator]();

                          case 5:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                              _context.next = 12;
                              break;
                            }

                            t = _step.value;
                            _context.next = 9;
                            return fn(t);

                          case 9:
                            _iteratorNormalCompletion = true;
                            _context.next = 5;
                            break;

                          case 12:
                            _context.next = 18;
                            break;

                          case 14:
                            _context.prev = 14;
                            _context.t0 = _context["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context.t0;

                          case 18:
                            _context.prev = 18;
                            _context.prev = 19;

                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                              _iterator.return();
                            }

                          case 21:
                            _context.prev = 21;

                            if (!_didIteratorError) {
                              _context.next = 24;
                              break;
                            }

                            throw _iteratorError;

                          case 24:
                            return _context.finish(21);

                          case 25:
                            return _context.finish(18);

                          case 26:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, this, [[3, 14, 18, 26], [19, , 21, 25]]);
                  }));

              return function (_x) {
                return _ref2.apply(this, arguments);
              };
            }();

        document.readyState === 'complete' ? this.init() : this.listenEvent('load', this.init);
      }

      _createClass(SlideScroll, [{
        key: "init",
        value: function init() {
          this.options.sliderNode = this.options.sliderNode instanceof Node ? this.options.sliderNode : document.querySelector(this.options.sliderNode); // Кэширование списка слайдов

          this.loadSectionsList(); // Событие прокрутки на целевом узле

          this.listenEvent('scroll', this.scrollEventHandler, document);
          if (this.options.lazyLoader) this.initLazyLoader(this.options.lazyLoader);
        }
      }, {
        key: "scrollEventHandler",
        value: function scrollEventHandler() {
          var _this = this;

          // Ограничение такта вызова обработчика события скролла
          return debounce(function () {
            // Перебор всех закэшированных слайдов
            _this.slidesList.forEach(function (slideNode, number) {
              if (_this.options.iOS) {
                slideNode.sectionOffset = window.innerHeight * number;
                slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
                slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
              } // До слайда расстояние больше чем высота одного слайда (ниже, через один от активного)


              if (document.scrollingElement.scrollTop < slideNode.dimThreshold) return _this.setSlideDim(slideNode, 100) && _this.setSlideActive(slideNode, false); // До слайда расстояние больше чем высота одного слайда (выше, следующий за активным)
              else if (document.scrollingElement.scrollTop > slideNode.sectionOffsetEnd) return _this.setSlideDim(slideNode, 0) && _this.setSlideActive(slideNode, false); // Активный слайд, расстояние меньше чем высота одного слайда
              else if (document.scrollingElement.scrollTop > slideNode.sectionOffset) return _this.setSlideDim(slideNode, 0) && _this.setSlideActive(slideNode, true); // До слайда расстояние меньше чем высота одного слайда (ниже, следующий за активным)
              else _this.setSlideDim(slideNode, (slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100)) && _this.setSlideActive(slideNode, false);
            }); // Установка времени задержки для ограничения такта

          }, this.options.scrollEventDelay)();
        }
      }, {
        key: "setSlideActive",
        value: function setSlideActive(slideNode, state) {
          // Устанавливем активный слайд
          if (slideNode.classList.contains('active') === state) return true;
          slideNode.classList.toggle('active', state);
          if (this.options.activeHook) try {
            if (slideNode.classList.contains('active') !== state) return true;
            this.options.activeHook(slideNode);
          } catch (e) {
            this.console.error(e);
          }
        }
      }, {
        key: "setSlideDim",
        value: function setSlideDim(slideNode, dim) {
          // Устанавливем прозрачность затемнения
          if (slideNode.dim === dim) return true;
          slideNode.style.setProperty('--dim-opacity', dim / 100);
          slideNode.dim = dim;
        }
      }, {
        key: "loadSectionsList",
        value: function loadSectionsList() {
          // Выборка и кэширование списка слайдов
          this.slidesList = this.options.sliderNode.querySelectorAll('[data-slide-wrapper]');
          this.slidesList.forEach(function (slideNode, number) {
            slideNode.order = number;
            slideNode.style.setProperty('--slide-number', number + 1);
            slideNode.sectionOffset = window.innerHeight * number;
            slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
            slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
            slideNode.dim = 0;
          });
          this.console.debug("".concat(this.slidesList.length, " slides loaded"), this.slidesList);
        }
      }, {
        key: "initLazyLoader",
        value: function initLazyLoader(mode) {
          this.lazyBuffer = this.options.sliderNode.querySelectorAll('[data-slide-lazy-src]');
          Array.from(this.lazyBuffer).forEachAsync(this.scheduleImageLoad.bind(this));
        }
      }, {
        key: "scheduleImageLoad",
        value: function scheduleImageLoad(imgNode) {
          var self = this;
          return new Promise(function (resolve, reject) {
            var newImgNode = new Image();
            newImgNode.className = imgNode.className;
            newImgNode.lazyNode = imgNode;

            newImgNode.onload = function () {
              if (this.lazyNode.parentNode) this.lazyNode.parentNode.replaceChild(this, this.lazyNode);
              resolve(true);
              self.console.debug("Image ".concat(this.src, " successfully loaded"));
            };

            newImgNode.onerror = function () {
              resolve(true);
            };

            newImgNode.src = imgNode.getAttribute('data-slide-lazy-src');
          });
        }
      }, {
        key: "listenEvent",
        value: function listenEvent(event, listener) {
          var target = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : window;
          return target.addEventListener.call(target, event, listener.bind(this));
        }
      }, {
        key: "attachConsoleProxy",
        value: function attachConsoleProxy() {
          var _this2 = this;

          this.console = ['log', 'debug', 'error'].reduce(function (proxyObject, method) {
            return (proxyObject[method] = function () {
              var _console$method;

              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }

              return _this2.options.debug ? (_console$method = console[method]).call.apply(_console$method, [console].concat(args)) : null;
            }) && proxyObject;
          }, {});
        }
      }]);

      return SlideScroll;
    }();

exports.default = SlideScroll;

function debounce(func, wait) {
  // Уменьшение тактов вызова функции
  var timeout;
  return function () {
    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var context = this;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
      return func.apply(context, args);
    }, wait);
  };
} // Проброс класса в глобальную область видимости


window.SlideScroll = SlideScroll;
