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
        const sectionOffset = window.innerHeight * number;
        const dimmThreshold = sectionOffset - window.innerHeight;
        // if (number === 2) console.log(document.body.scrollTop, sectionOffset, dimmThreshold);
        const slideContent = node.querySelector('.slide-content');
        if (document.body.scrollTop < dimmThreshold) slideContent.style.opacity = 0;
        else if (document.body.scrollTop > sectionOffset) slideContent.style.opacity = 1;
        else {
            const opacity = ((document.body.scrollTop) / (sectionOffset / 100)) / 100;
            if (number === 2) console.log(opacity, document.body.scrollTop, sectionOffset);
            slideContent.style.opacity = opacity;
            // console.log(opacity);
        }
    })
}

initSlides();