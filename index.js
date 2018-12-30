"use strict";

window.exports = window.exports || {};

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debounce = debounce;
exports.default = void 0;

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
            _ref$scrollEventDelay = _ref.scrollEventDelay,
            scrollEventDelay = _ref$scrollEventDelay === void 0 ? 1 : _ref$scrollEventDelay,
            _ref$lazyDisplayOffse = _ref.lazyDisplayOffset,
            lazyDisplayOffset = _ref$lazyDisplayOffse === void 0 ? 3 : _ref$lazyDisplayOffse,
            _ref$debug = _ref.debug,
            debug = _ref$debug === void 0 ? false : _ref$debug,
            _ref$activeHook = _ref.activeHook,
            activeHook = _ref$activeHook === void 0 ? false : _ref$activeHook;

        _classCallCheck(this, SlideScroll);

        this.options = {
          sliderNode: sliderNode,
          scrollEventDelay: scrollEventDelay,
          lazyDisplayOffset: lazyDisplayOffset,
          iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
          debug: debug,
          activeHook: activeHook
        };
        this.attachConsoleProxy();
        document.readyState === 'complete' ? this.init() : this.listenEvent('load', this.init);
      }

      _createClass(SlideScroll, [{
        key: "init",
        value: function init() {
          this.options.sliderNode = this.options.sliderNode instanceof Node ? this.options.sliderNode : document.querySelector(this.options.sliderNode);
          this.loadSectionsList(); // Кэширование списка слайдов

          this.listenEvent('scroll', this.options.scrollEventDelay ? debounce(this.scrollEventHandler, this.options.scrollEventDelay) : this.scrollEventHandler, document); // Событие прокрутки на целевом узле
        }
      }, {
        key: "scrollEventHandler",
        value: function scrollEventHandler() {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = this.slidesList[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var slideNode = _step.value;

              if (this.options.iOS) {
                slideNode.sectionOffset = window.innerHeight * slideNode.order;
                slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
                slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
              }

              if (document.scrollingElement.scrollTop > slideNode.dimThreshold && document.scrollingElement.scrollTop < slideNode.sectionOffsetEnd && document.scrollingElement.scrollTop < slideNode.sectionOffset) {
                this.activeSlideWorker(slideNode);
                break;
              }
            }
          } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion && _iterator.return != null) {
                _iterator.return();
              }
            } finally {
              if (_didIteratorError) {
                throw _iteratorError;
              }
            }
          }
        }
      }, {
        key: "activeSlideWorker",
        value: function activeSlideWorker(slideNode) {
          var _this = this;

          var slidesState = [];

          if (this.options.lazyDisplayOffset) {
            for (var i = slideNode.order; i < slideNode.order + this.options.lazyDisplayOffset; i++) {
              slidesState[i] = {
                display: true
              };
            }

            for (var _i = slideNode.order; _i > slideNode.order - this.options.lazyDisplayOffset; _i--) {
              slidesState[_i] = {
                display: true
              };
            }
          }

          slidesState[slideNode.order - 2] = {
            dim: 0,
            display: true
          }; // Предыдущий слайд (Выходит за экран на расстояние, превышающее высоту одного экрана (слайда), не виден)

          slidesState[slideNode.order - 1] = {
            dim: 0,
            display: true,
            active: true
          }; // Активный слайд (Выходит за экран вверх, но частично виден)

          slidesState[slideNode.order] = {
            dim: (slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100),
            display: true
          }; // Грядущий слайд (Частично виден, затемнен)

          slidesState[slideNode.order + 1] = {
            dim: 0,
            display: true
          }; // Будущий слайд (Не виден)

          this.slidesList.forEach(function (slideNode) {
            var slideState = {
              dim: 100,
              display: false,
              active: false
            };
            Object.assign(slideState, slidesState[slideNode.order] || {});

            SlideScroll.setSlideDim(slideNode, slideState.dim);

            SlideScroll.setSlideDisplay(slideNode, slideState.display);

            _this.setSlideActive(slideNode, slideState.active);
          });
        }
      }, {
        key: "setSlideDisplay",
        value: function setSlideDisplay(slideNode, state) {
          // Устанавливем отображение слайда
          if (slideNode.classList.contains('display') === state) return true;
          slideNode.classList.toggle('display', state);
        }
      }, {
        key: "setSlideActive",
        value: function setSlideActive(slideNode, state) {
          // Устанавливем активный слайд
          if (slideNode.classList.contains('active') === state) return true;
          slideNode.classList.toggle('active', state);
          if (state && this.options.activeHook) try {
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
          slideNode.style.setProperty('--dim-opacity', 1 - dim / 100);
          slideNode.dim = dim;
        }
      }, {
        key: "loadSectionsList",
        value: function loadSectionsList() {
          // Выборка и кэширование списка слайдов
          this.slidesList = Array.from(this.options.sliderNode.querySelectorAll('[data-slide-wrapper]'));
          this.slidesList.forEach(function (slideNode, number) {
            slideNode.order = number;
            slideNode.style.setProperty('--slide-number', number + 1);
            slideNode.sectionOffset = window.innerHeight * number;
            slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
            slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
            slideNode.dim = 100;
          });
          this.console.debug("".concat(this.slidesList.length, " slides loaded"), this.slidesList);
          this.activeSlideWorker(this.slidesList[1]); // Устанавливем первый слайд как активный
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
}

window.SlideScroll = SlideScroll; // Проброс класса в глобальную область видимости
