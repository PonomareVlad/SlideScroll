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
                _ref$debug = _ref.debug,
                debug = _ref$debug === void 0 ? false : _ref$debug;

            _classCallCheck(this, SlideScroll);

            this.options = {
                sliderNode: sliderNode instanceof Node ? sliderNode : document.querySelector(sliderNode),
                scrollEventDelay: scrollEventDelay,
                debug: debug
            };
            this.attachConsoleProxy();
            document.readyState === 'complete' ? this.init() : this.listenEvent('load', this.init);
        }

        _createClass(SlideScroll, [{
            key: "init",
            value: function init() {
                // Кэширование списка слайдов
                this.loadSectionsList(); // Событие прокрутки на целевом узле

                this.listenEvent('scroll', this.scrollEventHandler, document);
            }
        }, {
            key: "scrollEventHandler",
            value: function scrollEventHandler() {
                var _this = this;

                // Ограничение такта вызова обработчика события скролла
                return debounce(function () {
                    // Перебор всех закэшированных слайдов
                    _this.slidesList.forEach(function (slideNode) {
                        if (document.scrollingElement.scrollTop < slideNode.dimThreshold) return _this.setSlideDim(slideNode, 100); else if (document.scrollingElement.scrollTop > slideNode.sectionOffset) return _this.setSlideDim(slideNode, 0); else _this.setSlideDim(slideNode, (slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100));
                    }); // Установка времени задержки для ограничения такта

                }, this.options.scrollEventDelay)();
            }
        }, {
            key: "setSlideDim",
            value: function setSlideDim(slideNode, dim) {
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
                    slideNode.style.setProperty('--slide-number', number + 1);
                    slideNode.sectionOffset = window.innerHeight * number;
                    slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
                    slideNode.dim = 0;
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
