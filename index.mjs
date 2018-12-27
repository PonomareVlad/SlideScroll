export default class SlideScroll {
    constructor({
                    sliderNode = '[data-slider-viewport]',
                    lazyLoader = true,
                    scrollEventDelay = 1,
                    debug = false
                } = {}) {
        this.options = {
            sliderNode,
            lazyLoader,
            scrollEventDelay,
            iOS: /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream,
            debug
        };

        this.attachConsoleProxy();

        document.readyState === 'complete' ? this.init() :
            this.listenEvent('load', this.init);
    }

    init() {

        this.options.sliderNode = this.options.sliderNode instanceof Node ? this.options.sliderNode : document.querySelector(this.options.sliderNode);

        // Кэширование списка слайдов
        this.loadSectionsList();

        // Событие прокрутки на целевом узле
        this.listenEvent('scroll', this.scrollEventHandler, document);

        if (this.options.lazyLoader) this.initLazyLoader(this.options.lazyLoader);

    }

    scrollEventHandler() {

        // Ограничение такта вызова обработчика события скролла
        return debounce(() => {

            // Перебор всех закэшированных слайдов
            this.slidesList.forEach((slideNode, number) => {

                if (this.options.iOS) {
                    slideNode.sectionOffset = window.innerHeight * number;
                    slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
                    slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
                }

                // До слайда расстояние больше чем высота одного слайда (ниже, через один от активного)
                if (document.scrollingElement.scrollTop < slideNode.dimThreshold) return this.setSlideDim(slideNode, 100) && this.setSlideActive(slideNode, false);

                // До слайда расстояние больше чем высота одного слайда (выше, следующий за активным)
                else if (document.scrollingElement.scrollTop > slideNode.sectionOffsetEnd) return this.setSlideDim(slideNode, 0) && this.setSlideActive(slideNode, false);

                // Активный слайд, расстояние меньше чем высота одного слайда
                else if (document.scrollingElement.scrollTop > slideNode.sectionOffset) return this.setSlideDim(slideNode, 0) && this.setSlideActive(slideNode, true);

                // До слайда расстояние меньше чем высота одного слайда (ниже, следующий за активным)
                else this.setSlideDim(slideNode, ((slideNode.sectionOffset - document.scrollingElement.scrollTop) / (window.innerHeight / 100))) && this.setSlideActive(slideNode, false);

            });

            // Установка времени задержки для ограничения такта
        }, this.options.scrollEventDelay)()

    }

    setSlideActive(slideNode, state) {
        // Устанавливем активный слайд
        if (slideNode.classList.contains('active') === state) return true;
        slideNode.classList.toggle('active', state);
    }

    setSlideDim(slideNode, dim) {
        // Устанавливем прозрачность затемнения
        if (slideNode.dim === dim) return true;
        slideNode.style.setProperty('--dim-opacity', dim / 100);
        slideNode.dim = dim;
    }

    loadSectionsList() {

        // Выборка и кэширование списка слайдов
        this.slidesList = this.options.sliderNode.querySelectorAll('[data-slide-wrapper]');

        this.slidesList.forEach((slideNode, number) => {
            slideNode.style.setProperty('--slide-number', number + 1);
            slideNode.sectionOffset = window.innerHeight * number;
            slideNode.sectionOffsetEnd = slideNode.sectionOffset + window.innerHeight;
            slideNode.dimThreshold = slideNode.sectionOffset - window.innerHeight;
            slideNode.dim = 0;
        });

        this.console.debug(`${this.slidesList.length} slides loaded`, this.slidesList)

    }

    initLazyLoader(mode) {
        this.lazyBuffer = this.options.sliderNode.querySelectorAll('[data-slide-lazy-src]');

        this.lazyBuffer.forEach(async imgNode => {
            return await new Promise((resolve, reject) => {
                const newImgNode = new Image();
                newImgNode.lazyNode = imgNode;
                newImgNode.onload = () => {
                    if (this.lazyNode.parentNode) this.lazyNode.parentNode.replaceChild(this, this.lazyNode);
                    resolve(true);
                };
                newImgNode.src = imgNode.getAttribute('data-slide-lazy-src');
            })
        })
    }

    listenEvent(event, listener, target = window) {

        return target.addEventListener.call(target, event, listener.bind(this));

    }

    attachConsoleProxy() {

        this.console = ['log', 'debug', 'error'].reduce((proxyObject, method) =>
            (proxyObject[method] = (...args) => (this.options.debug ? console[method].call(console, ...args) : null)) && proxyObject, {})

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

// Проброс класса в глобальную область видимости
window.SlideScroll = SlideScroll;