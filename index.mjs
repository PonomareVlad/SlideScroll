export default class SlideScroll {
    constructor({
                    sliderNode = '[data-slider-viewport]',
                    scrollEventDelay = 1,
                    lazyDisplayOffset = 3,
                    debug = false,
                    activeHook = false
                } = {}) {

        this.options = {
            sliderNode,
            scrollEventDelay,
            lazyDisplayOffset,
            iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
            debug,
            activeHook
        };

        this.eventHandlers = {ready: [], active: []};

        this.attachConsoleProxy();

        document.readyState === 'complete' ? this.init() :
            this.listenEvent('load', this.init);
    }

    static setSlideDisplay(slideNode, state) {
        // Устанавливем отображение слайда
        if (!slideNode) return false;
        if (slideNode.classList.contains('display') === state) return true;
        slideNode.classList.toggle('display', state);
        return true
    }

    static setSlideDim(slideNode, dim) {
        // Устанавливем прозрачность затемнения
        if (!slideNode) return false;
        if (slideNode.dim && slideNode.dim === dim) return true;
        slideNode.style.setProperty('--dim-opacity', 1 - (dim / 100));
        slideNode.dim = dim;
        return true;
    }

    static calcSlideOffsets(slideNode) {
        if (!slideNode) return false;
        slideNode.sectionOffset = window.innerHeight * slideNode.order;
        slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
        slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
        return true;
    }

    init() {

        this.options.sliderNode = this.options.sliderNode instanceof Node ? this.options.sliderNode : document.querySelector(this.options.sliderNode);

        this.loadSectionsList();
        // Кэширование списка слайдов

        this.listenEvent('scroll', this.options.scrollEventDelay ? debounce(this.scrollEventHandler, this.options.scrollEventDelay) : this.scrollEventHandler, document);
        // Событие прокрутки на целевом узле

        this.activeSlideWorker(this.slidesList[1]);

        this.scrollEventHandler();

        this.triggerEvent('ready');

    }

    scrollEventHandler() {

        for (const slideNode of this.slidesList) {

            if (this.options.iOS) SlideScroll.calcSlideOffsets(slideNode);

            if (document.scrollingElement.scrollTop > slideNode.dimThreshold && document.scrollingElement.scrollTop < slideNode.sectionOffsetEnd && document.scrollingElement.scrollTop < slideNode.sectionOffset) {
                // Грядущий слайд
                this.activeSlideWorker(slideNode);
                break;
            }

        }

    }

    activeSlideWorker(slideNode) {

        const slidesState = [];

        if (this.options.lazyDisplayOffset) {
            // Lazy Display offset
            for (let i = slideNode.order; i < slideNode.order + this.options.lazyDisplayOffset; i++) slidesState[i] = {display: true};
            for (let i = slideNode.order; i > slideNode.order - this.options.lazyDisplayOffset; i--) slidesState[i] = {display: true};
        }

        slidesState[slideNode.order - 2] = {dim: 0, display: true}; // Предыдущий слайд (Выходит за экран на расстояние, превышающее высоту одного экрана (слайда), не виден)

        slidesState[slideNode.order - 1] = {
            dim: 100 - ((slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 2 / 100)),
            display: true,
            active: true
        }; // Активный слайд (Выходит за экран вверх, но частично виден)

        slidesState[slideNode.order] = {
            dim: ((slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100)),
            display: true
        }; // Грядущий слайд (Частично виден, затемнен)

        slidesState[slideNode.order + 1] = {dim: 100, display: true}; // Будущий слайд (Не виден)

        this.slidesList.forEach(slideNode => {
            let slideState = {dim: 100, display: false, active: false};
            Object.assign(slideState, slidesState[slideNode.order] || {});
            SlideScroll.setSlideDim(slideNode, slideState.dim);
            this.setSlideActive(slideNode, slideState.active);
            SlideScroll.setSlideDisplay(slideNode, this.options.lazyDisplayOffset ? slideState.display : true);
        });

    }

    setSlideActive(slideNode, state) {
        // Устанавливем активный слайд
        if (slideNode.classList.contains('active') === state) return true;
        slideNode.classList.toggle('active', state);
        if (state) this.triggerEvent('active', slideNode);
        return true;
    }

    loadSectionsList() {

        // Выборка и кэширование списка слайдов
        this.slidesList = Array.from(this.options.sliderNode.querySelectorAll('[data-slide-wrapper]'));

        this.slidesList.forEach((slideNode, number) => {
            slideNode.dim = 100;
            slideNode.order = number;
            slideNode.style.setProperty('--slide-number', number + 1);
            SlideScroll.calcSlideOffsets(slideNode);

        });

        this.console.debug(`${this.slidesList.length} slides loaded`, this.slidesList);

    }

    listenEvent(event, listener, target = window) {

        return target.addEventListener.call(target, event, listener.bind(this));

    }

    attachConsoleProxy() {

        this.console = ['log', 'debug', 'error'].reduce((proxyObject, method) =>
            (proxyObject[method] = (...args) => (this.options.debug ? console[method].call(console, ...args) : null)) && proxyObject, {})

    }

    setOption(option, value) {
        this.options[option] = value;
    }

    triggerEvent(event, data) {
        if (!this.eventHandlers[event]) return true;
        this.eventHandlers[event].forEach(handler => {
            try {
                handler(data);
            } catch (e) {
                this.console.error(e);
            }
        });
        return true;
    }

    onReady(handler) {
        this.eventHandlers.ready.push(handler);
    }

    onActive(handler) {
        this.eventHandlers.active.push(handler);
    }
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

window.SlideScroll = SlideScroll; // Проброс класса в глобальную область видимости
