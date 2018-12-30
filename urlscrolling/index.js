"use strict";

window.exports = window.exports || {};

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.isScrolledIntoView = isScrolledIntoView;
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

var UrlScroll =
    /*#__PURE__*/
    function () {
        function UrlScroll() {
            var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                _ref$scrollNode = _ref.scrollNode,
                scrollNode = _ref$scrollNode === void 0 ? document : _ref$scrollNode,
                _ref$scrollEventNode = _ref.scrollEventNode,
                scrollEventNode = _ref$scrollEventNode === void 0 ? document : _ref$scrollEventNode,
                _ref$beforeRouterScro = _ref.beforeRouterScrollHook,
                beforeRouterScrollHook = _ref$beforeRouterScro === void 0 ? false : _ref$beforeRouterScro,
                _ref$customRouterScro = _ref.customRouterScrollWorker,
                customRouterScrollWorker = _ref$customRouterScro === void 0 ? false : _ref$customRouterScro,
                _ref$pathAttribute = _ref.pathAttribute,
                pathAttribute = _ref$pathAttribute === void 0 ? 'id' : _ref$pathAttribute,
                _ref$headerSection = _ref.headerSection,
                headerSection = _ref$headerSection === void 0 ? true : _ref$headerSection,
                _ref$scrollEventDelay = _ref.scrollEventDelay,
                scrollEventDelay = _ref$scrollEventDelay === void 0 ? 20 : _ref$scrollEventDelay,
                _ref$debug = _ref.debug,
                debug = _ref$debug === void 0 ? false : _ref$debug;

            _classCallCheck(this, UrlScroll);

            // Установка параметров плагина
            this.options = {
                scrollNode: scrollNode instanceof Node ? scrollNode : document.querySelector(scrollNode),
                scrollEventNode: scrollEventNode,
                beforeRouterScrollHook: beforeRouterScrollHook,
                customRouterScrollWorker: customRouterScrollWorker,
                pathAttribute: pathAttribute,
                headerSection: headerSection,
                scrollEventDelay: scrollEventDelay,
                debug: debug
            }; // Привязка консольных методов через прокси (вывод происходит если options.debug = true)

            this.attachConsoleProxy(); // Событие перехода по истории (Назад, Вперед)

            this.listenEvent('popstate', this.routingHandler); // Вызов инициализации, в зависимости от статуса загрузки страницы

            document.readyState === 'complete' ? this.init() : this.listenEvent('load', this.init);
        }

        _createClass(UrlScroll, [{
            key: "init",
            value: function init() {
                // Кэширование списка секций, участвующих в смене URL
                this.loadSectionsList(); // Запуск маршрутизации

                this.routingHandler(); // Событие прокрутки на целевом узле

                if (this.options.scrollEventNode) this.listenEvent('scroll', this.scrollEventHandler, this.options.scrollEventNode);
            }
        }, {
            key: "scrollEventHandler",
            value: function scrollEventHandler() {
                var _this = this;

                // Ограничение такта вызова обработчика события скролла
                return debounce(function () {
                    if (_this.disabledScrollEvent) return;
                    var historyChanged = false; // Перебор всех закэшированных секций

                    _this.sectionsList.forEach(function (sectionNode) {
                        if (historyChanged) return; // Проверка нахождения секции в фрейме окна

                        if (!isScrolledIntoView(sectionNode)) return;
                        historyChanged = true;
                        return _this.setSectionState(sectionNode);
                    }); // Вызов обработчика Шапки, если все секции находятся за пределами фрейма окна


                    if (!historyChanged) return _this.headerState(); // Установка времени задержки для ограничения такта
                }, this.options.scrollEventDelay)();
            }
        }, {
            key: "setSectionState",
            value: function setSectionState(sectionNode) {
                // Путь URL назаченный для текущей секции
                var sectionPath = sectionNode.getAttribute(this.options.pathAttribute); // Проверка пути URL

                if (!this.checkPath(sectionPath)) return;
                this.console.log("Section changed to: ".concat(sectionPath)); // Добавление шага в историю браузера и смена URL

                return this.changeState({
                    sectionPath: sectionPath
                });
            }
        }, {
            key: "headerState",
            value: function headerState() {
                // Проверка параметра допускающего добавление шага истории для шапки и текущего пути URL
                if (!this.options.headerSection || !this.currentStateData().sectionPath) return false;
                this.console.log('Changed to Header'); // Добавление шага в историю и смена URL

                return this.changeState();
            }
        }, {
            key: "changeState",
            value: function changeState() {
                var stateData = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

                try {
                    // Web History API
                    history.pushState(stateData, null, stateData.sectionPath || '/');
                } catch (e) {
                    // Обработчик на случай срабатывания ограничения в Safari
                    this.console.error('Необходимо повысить значение задержки троттлинга (throttleDelay)', e);
                }
            }
        }, {
            key: "routingHandler",
            value: function routingHandler(event) {
                this.console.debug('Routing start', event); // Временное отключение обработчика прокрутки (Защита от создавания лишних шагов в истории)

                this.disableScrollEvent(); // Целевой путь URL

                var targetPath = this.currentStateData(event).sectionPath || this.currentPath(); // Узел секции ассоцированный с целевым путем URL

                var targetSectionNode = this.options.scrollNode.querySelector("[".concat(this.options.pathAttribute, "=\"").concat(targetPath, "\"]"));
                if (this.options.beforeRouterScrollHook) try {
                    this.options.beforeRouterScrollHook(targetSectionNode);
                } catch (e) {
                    this.console.error(e);
                }

                if (this.options.customRouterScrollWorker) {
                    try {
                        this.options.customRouterScrollWorker(targetSectionNode);
                    } catch (e) {
                        this.console.error(e);
                    }
                } else targetSectionNode ? UrlScroll.asyncThread(function () {
                    return targetSectionNode.scrollIntoView();
                }) : UrlScroll.asyncThread(function () {
                    return document.body.scrollTo(0, 0);
                });

                if (targetSectionNode) this.console.debug("Scrolled to ".concat(targetPath), targetSectionNode);
            }
        }, {
            key: "checkPath",
            value: function checkPath(sectionPath) {
                // TODO: Optimise conditions
                if (history.state && history.state.sectionPath === '' && history.state.sectionPath === sectionPath) return false; // URL и значение аттрибута пустое

                if (history.state && history.state.sectionPath && history.state.sectionPath === sectionPath) return false; // URL и значение аттрибута идентичны

                return true;
            }
        }, {
            key: "currentStateData",
            value: function currentStateData(event) {
                // Возврат данных из события или из текущего шага истории
                return event && event.state ? event.state : history.state || {};
            }
        }, {
            key: "disableScrollEvent",
            value: function disableScrollEvent() {
                var _this2 = this;

                var delay = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.options.scrollEventDelay * 2;
                // Отключение обработчика события прокрутки
                this.disabledScrollEvent = true; // Включение обработчика события прокрутки после задержки

                setTimeout(function () {
                    return _this2.disabledScrollEvent = false;
                }, delay);
            }
        }, {
            key: "currentPath",
            value: function currentPath() {
                var pathname = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : location.pathname;
                // Возврат пути URL без начального слэша
                return pathname[0] === '/' ? pathname.substr(1) : pathname;
            }
        }, {
            key: "loadSectionsList",
            value: function loadSectionsList() {
                // Выборка и кэширование списка секций, содержащих аттрибут для поиска путей
                this.sectionsList = this.options.scrollNode.querySelectorAll("[".concat(this.options.pathAttribute, "]"));
                this.console.debug("".concat(this.sectionsList.length, " sections loaded"), this.sectionsList);
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
                var _this3 = this;

                this.console = ['log', 'debug', 'error'].reduce(function (proxyObject, method) {
                    return (proxyObject[method] = function () {
                        var _console$method;

                        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                            args[_key] = arguments[_key];
                        }

                        return _this3.options.debug ? (_console$method = console[method]).call.apply(_console$method, [console].concat(args)) : null;
                    }) && proxyObject;
                }, {});
            }
        }], [{
            key: "asyncThread",
            value: function asyncThread(func) {
                var timeout = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
                // Вызов функции в отдельном потоке
                return setTimeout(func, timeout);
            }
        }]);

        return UrlScroll;
    }();

exports.default = UrlScroll;

function isScrolledIntoView(elementNode) {
    // Проверка попадания блока в зону видимости
    var rect = elementNode.getBoundingClientRect();
    var elemTop = rect.top;
    var elemBottom = rect.bottom;
    var halfWindowHeight = parseInt(window.innerHeight / 2); // Алгоритм подсчета можно откорректировать под себя

    return elemTop <= halfWindowHeight + 1 && elemBottom >= halfWindowHeight - 1;
}

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


window.UrlScroll = UrlScroll;
