function initSlides() {
    document.addEventListener('DOMContentLoaded', () => {
        const slidesCount = document.querySelector('.slide-viewport').childElementCount;
        document.querySelector('.slide-viewport').querySelectorAll('.slide-wrapper').forEach(prepareSlide);
        document.addEventListener('scroll', scrollHandler);
    });
}

function prepareSlide(node, number) {
    node.style.setProperty('--slide-number', number + 1);
}

function scrollHandler(event) {
    event.target.querySelectorAll('.slide-wrapper').forEach((node, number) => {
        // debugger;
        if (number === 0) return;
        const sectionOffset = window.innerHeight * number;
        const dimmThreshold = sectionOffset - window.innerHeight;
        // if (number === 2) console.log(document.body.scrollTop, sectionOffset, dimmThreshold);
        let dim = 0;
        if (document.body.scrollTop < dimmThreshold) dim = 100;
        else if (document.body.scrollTop > sectionOffset) dim = 0;
        else {
            // if (number === 2) console.log('section: 3', 'scrollTop: ' + document.body.scrollTop, 'sectionOffset: ' + sectionOffset,'sectionOffset-scrollTop:'+(sectionOffset-document.body.scrollTop),'opacityCoefficient: '+((sectionOffset-document.body.scrollTop)/(window.innerHeight/100)));
            dim = ((sectionOffset - document.body.scrollTop) / (window.innerHeight / 100));
            // if (number === 2) console.log(opacity, document.body.scrollTop, sectionOffset);
            // slideContent.style.opacity = opacity;
            // node.style.setProperty('--dimm-opacity', (100-opacity)/100);
            // console.log(opacity);
        }
        // console.log(dim);
        if (node.dim !== dim) {
            node.style.setProperty('--dimm-opacity', dim / 100);
            node.dim = dim;
        }
    })
}

initSlides();