export default class UrlScroll {

    constructor({
                    scrollNode = document, // DOM узел, который будет скроллится или его селектор
                    scrollEventNode = document,
                    pathAttribute = 'id', // Аттрибут для поиска путей в секциях
                    headerSection = true, // Прокрутка на начало страницы будет добавлять шаг в историю с корневым URL
                    scrollEventDelay = 20, // Задержка вызова события прокрутки
                    debug = false // Отображение логов
                } = {}) {

        // Установка параметров плагина
        this.options = {
            scrollNode: scrollNode instanceof Node ? scrollNode : document.querySelector(scrollNode),
            scrollEventNode,
            pathAttribute,
            headerSection,
            scrollEventDelay,
            debug
        };

        // Привязка консольных методов через прокси (вывод происходит если options.debug = true)
        this.attachConsoleProxy();

        // Событие перехода по истории (Назад, Вперед)
        this.listenEvent('popstate', this.routingHandler);

        // Вызов инициализации, в зависимости от статуса загрузки страницы
        document.readyState === 'complete' ? this.init() :
            this.listenEvent('load', this.init);

    }

    init() {

        // Кэширование списка секций, участвующих в смене URL
        this.loadSectionsList();

        // Запуск маршрутизации
        this.routingHandler();

        // Событие прокрутки на целевом узле
        if (this.options.scrollEventNode) this.listenEvent('scroll', this.scrollEventHandler, this.options.scrollEventNode);

    }

    routingHandler(event) {

        this.console.debug('Routing start', event);

        // Временное отключение обработчика прокрутки (Защита от создавания лишних шагов в истории)
        this.disableScrollEvent();

        // Целевой путь URL
        let targetPath = this.currentStateData(event).sectionPath || this.currentPath();

        // Узел секции ассоцированный с целевым путем URL
        let targetSectionNode = this.options.scrollNode.querySelector(`[${this.options.pathAttribute}="${targetPath}"]`);

        // Прокрутка в начало целевой секции, или, в случае ее отсутствия, в начало страницы
        targetSectionNode ? this.asyncThread(() => targetSectionNode.scrollIntoView()) :
            this.asyncThread(() => document.body.scrollTo(0, 0));

        if (targetSectionNode) this.console.debug(`Scrolled to ${targetPath}`, targetSectionNode);

    }

    scrollEventHandler() {

        // Ограничение такта вызова обработчика события скролла
        return debounce(() => {

            if (this.disabledScrollEvent) return;

            let historyChanged = false;

            // Перебор всех закэшированных секций
            this.sectionsList.forEach(sectionNode => {

                if (historyChanged) return;

                // Проверка нахождения секции в фрейме окна
                if (!isScrolledIntoView(sectionNode)) return;

                historyChanged = true;

                return this.setSectionState(sectionNode);

            });

            // Вызов обработчика Шапки, если все секции находятся за пределами фрейма окна
            if (!historyChanged) return this.headerState()

            // Установка времени задержки для ограничения такта
        }, this.options.scrollEventDelay)()

    }

    setSectionState(sectionNode) {

        // Путь URL назаченный для текущей секции
        let sectionPath = sectionNode.getAttribute(this.options.pathAttribute);

        // Проверка пути URL
        if (!this.checkPath(sectionPath)) return;

        this.console.log(`Section changed to: ${sectionPath}`);

        // Добавление шага в историю браузера и смена URL
        return this.changeState({sectionPath})

    }

    headerState() {

        // Проверка параметра допускающего добавление шага истории для шапки и текущего пути URL
        if (!this.options.headerSection || !this.currentStateData().sectionPath) return false;

        this.console.log('Changed to Header');

        // Добавление шага в историю и смена URL
        return this.changeState();

    }

    changeState(stateData = {}) {

        try {

            // Web History API
            history.pushState(stateData, null, stateData.sectionPath || '/');

        } catch (e) {

            // Обработчик на случай срабатывания ограничения в Safari
            this.console.error('Необходимо повысить значение задержки троттлинга (throttleDelay)', e)

        }

    }

    asyncThread(func) {

        // Вызов функции в отдельном потоке
        return setTimeout(func, 1);
    }

    checkPath(sectionPath) { // TODO: Optimise conditions

        if (history.state && history.state.sectionPath === '' && history.state.sectionPath === sectionPath) return false; // URL и значение аттрибута пустое

        if (history.state && history.state.sectionPath && history.state.sectionPath === sectionPath) return false; // URL и значение аттрибута идентичны

        return true;

    }

    currentStateData(event) {

        // Возврат данных из события или из текущего шага истории
        return (event && event.state) ? event.state : history.state || {}

    }

    disableScrollEvent(delay = this.options.scrollEventDelay * 2) {

        // Отключение обработчика события прокрутки
        this.disabledScrollEvent = true;

        // Включение обработчика события прокрутки после задержки
        setTimeout(() => this.disabledScrollEvent = false, delay);

    }

    currentPath(pathname = location.pathname) {

        // Возврат пути URL без начального слэша
        return pathname[0] === '/' ? pathname.substr(1) : pathname

    }

    loadSectionsList() {

        // Выборка и кэширование списка секций, содержащих аттрибут для поиска путей
        this.sectionsList = this.options.scrollNode.querySelectorAll(`[${this.options.pathAttribute}]`);

        this.console.debug(`${this.sectionsList.length} sections loaded`, this.sectionsList)

    }

    listenEvent(event, listener, target = window) {

        return target.addEventListener.call(target, event, listener.bind(this));

    }

    attachConsoleProxy() {

        this.console = ['log', 'debug', 'error'].reduce((proxyObject, method) =>
            (proxyObject[method] = (...args) => (this.options.debug ? console[method].call(console, ...args) : null)) && proxyObject, {})

    }

}

export function isScrolledIntoView(elementNode) {
    // Проверка попадания блока в зону видимости
    let rect = elementNode.getBoundingClientRect();
    let elemTop = rect.top;
    let elemBottom = rect.bottom;
    let halfWindowHeight = parseInt(window.innerHeight / 2);
    // Алгоритм подсчета можно откорректировать под себя
    return (elemTop <= halfWindowHeight + 1 && elemBottom >= halfWindowHeight - 1);
}

export function debounce(func, wait) {
    // Уменьшение тактов вызова функции
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait)
    }
}

// Проброс класса в глобальную область видимости
window.UrlScroll = UrlScroll;