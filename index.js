"use strict";

window.exports = window.exports || {};

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.debounce = debounce;
exports["default"] = void 0;

function _createForOfIteratorHelper(o, allowArrayLike) {
    var it;
    if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
        if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
            if (it) o = it;
            var i = 0;
            var F = function F() {
            };
            return {
                s: F, n: function n() {
                    if (i >= o.length) return {done: true};
                    return {done: false, value: o[i++]};
                }, e: function e(_e) {
                    throw _e;
                }, f: F
            };
        }
        throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }
    var normalCompletion = true, didErr = false, err;
    return {
        s: function s() {
            it = o[Symbol.iterator]();
        }, n: function n() {
            var step = it.next();
            normalCompletion = step.done;
            return step;
        }, e: function e(_e2) {
            didErr = true;
            err = _e2;
        }, f: function f() {
            try {
                if (!normalCompletion && it["return"] != null) it["return"]();
            } finally {
                if (didErr) throw err;
            }
        }
    };
}

function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) {
        arr2[i] = arr[i];
    }
    return arr2;
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

var SlideScroll = /*#__PURE__*/function () {
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
        this.eventHandlers = {
            ready: [],
            active: []
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

            this.activeSlideWorker(this.slidesList[1]);
            this.scrollEventHandler();
            this.triggerEvent('ready');
        }
    }, {
        key: "scrollEventHandler",
        value: function scrollEventHandler() {
            var _iterator = _createForOfIteratorHelper(this.slidesList),
                _step;

            try {
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                    var slideNode = _step.value;
                    if (this.options.iOS) SlideScroll.calcSlideOffsets(slideNode);

                    if (document.scrollingElement.scrollTop > slideNode.dimThreshold && document.scrollingElement.scrollTop < slideNode.sectionOffsetEnd && document.scrollingElement.scrollTop < slideNode.sectionOffset) {
                        // Грядущий слайд
                        this.activeSlideWorker(slideNode);
                        break;
                    }
                }
            } catch (err) {
                _iterator.e(err);
            } finally {
                _iterator.f();
            }
        }
    }, {
        key: "activeSlideWorker",
        value: function activeSlideWorker(slideNode) {
            var _this = this;

            var slidesState = [];

            if (this.options.lazyDisplayOffset) {
                // Lazy Display offset
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
                dim: 100 - (slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 2 / 100),
                display: true,
                active: true
            }; // Активный слайд (Выходит за экран вверх, но частично виден)

            slidesState[slideNode.order] = {
                dim: (slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100),
                display: true
            }; // Грядущий слайд (Частично виден, затемнен)

            slidesState[slideNode.order + 1] = {
                dim: 100,
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

                _this.setSlideActive(slideNode, slideState.active);

                SlideScroll.setSlideDisplay(slideNode, _this.options.lazyDisplayOffset ? slideState.display : true);
            });
        }
    }, {
        key: "setSlideActive",
        value: function setSlideActive(slideNode, state) {
            // Устанавливем активный слайд
            if (slideNode.classList.contains('active') === state) return true;
            slideNode.classList.toggle('active', state);
            if (state) this.triggerEvent('active', slideNode);
            return true;
        }
    }, {
        key: "loadSectionsList",
        value: function loadSectionsList() {
            // Выборка и кэширование списка слайдов
            this.slidesList = Array.from(this.options.sliderNode.querySelectorAll('[data-slide-wrapper]'));
            this.slidesList.forEach(function (slideNode, number) {
                slideNode.dim = 100;
                slideNode.order = number;
                slideNode.style.setProperty('--slide-number', number + 1);
                SlideScroll.calcSlideOffsets(slideNode);
            });
            this.console.debug("".concat(this.slidesList.length, " slides loaded"), this.slidesList);
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
    }, {
        key: "setOption",
        value: function setOption(option, value) {
            this.options[option] = value;
        }
    }, {
        key: "triggerEvent",
        value: function triggerEvent(event, data) {
            var _this3 = this;

            if (!this.eventHandlers[event]) return true;
            this.eventHandlers[event].forEach(function (handler) {
                try {
                    handler(data);
                } catch (e) {
                    _this3.console.error(e);
                }
            });
            return true;
        }
    }, {
        key: "onReady",
        value: function onReady(handler) {
            this.eventHandlers.ready.push(handler);
        }
    }, {
        key: "onActive",
        value: function onActive(handler) {
            this.eventHandlers.active.push(handler);
        }
    }], [{
        key: "setSlideDisplay",
        value: function setSlideDisplay(slideNode, state) {
            // Устанавливем отображение слайда
            if (!slideNode) return false;
            if (slideNode.classList.contains('display') === state) return true;
            slideNode.classList.toggle('display', state);
            return true;
        }
    }, {
        key: "setSlideDim",
        value: function setSlideDim(slideNode, dim) {
            // Устанавливем прозрачность затемнения
            if (!slideNode) return false;
            if (slideNode.dim && slideNode.dim === dim) return true;
            slideNode.style.setProperty('--dim-opacity', 1 - dim / 100);
            slideNode.dim = dim;
            return true;
        }
    }, {
        key: "calcSlideOffsets",
        value: function calcSlideOffsets(slideNode) {
            if (!slideNode) return false;
            slideNode.sectionOffset = window.innerHeight * slideNode.order;
            slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
            slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
            return true;
        }
    }]);

    return SlideScroll;
}();

exports["default"] = SlideScroll;

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
