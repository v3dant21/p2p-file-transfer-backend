/**
 * Animation utilities for scroll-triggered and entrance animations
 */

/**
 * Intersection Observer options
 */
const defaultObserverOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

/**
 * Create intersection observer for scroll animations
 * @param {Function} callback - Callback when elements intersect
 * @param {Object} options - Observer options
 * @returns {IntersectionObserver}
 */
export function createIntersectionObserver(callback, options = {}) {
    const mergedOptions = { ...defaultObserverOptions, ...options };
    return new IntersectionObserver(callback, mergedOptions);
}

/**
 * Observe elements for scroll-in animation
 * @param {string|Element} selector - CSS selector or element
 * @param {string} animationClass - CSS class to add on intersect (default: 'animate-in')
 * @param {Object} options - Observer options
 */
export function observeForAnimation(selector, animationClass = 'animate-in', options = {}) {
    const elements = typeof selector === 'string'
        ? document.querySelectorAll(selector)
        : [selector];

    if (!elements.length) return;

    const callback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add(animationClass);
                observer.unobserve(entry.target);
            }
        });
    };

    const observer = createIntersectionObserver(callback, options);
    elements.forEach(el => observer.observe(el));
}

/**
 * Staggered animation for child elements
 * @param {Element} parent - Parent element
 * @param {number} staggerDelay - Delay between children in ms
 * @param {string} animationClass - CSS class to add
 */
export function staggerChildren(parent, staggerDelay = 100, animationClass = 'animate-in') {
    if (!parent) return;
    const children = parent.children;

    children.forEach((child, index) => {
        setTimeout(() => {
            child.classList.add(animationClass);
        }, index * staggerDelay);
    });
}

/**
 * Smooth scroll to element
 * @param {Element|string} target - Element or selector
 * @param {Object} options - Scroll options
 */
export function smoothScroll(target, options = { behavior: 'smooth', block: 'start' }) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (element) {
        element.scrollIntoView(options);
    }
}

/**
 * Add parallax effect to element
 * @param {Element} element - Element to apply parallax
 * @param {number} rate - Parallax rate (0-1, lower = more subtle)
 */
export function addParallax(element, rate = 0.5) {
    if (!element) return;

    let ticking = false;
    const update = () => {
        const scrolled = window.scrollY;
        element.style.transform = `translateY(${scrolled * rate}px)`;
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    });
}

/**
 * Pulse animation (uses Web Animations API for better performance)
 * @param {Element} element - Element to animate
 * @param {Object} options - Animation options
 */
export function pulseAnimation(element, options = {}) {
    const keyframes = [
        { opacity: 1 },
        { opacity: 0.3 }
    ];
    const timing = {
        duration: options.duration || 1500,
        iterations: Infinity,
        easing: 'cubic-bezier(0.4, 0, 0.6, 1)'
    };
    return element.animate(keyframes, timing);
}

/**
 * Confetti burst animation (simple CSS-based, no external lib)
 * @param {Element} container - Container element
 * @param {number} count - Number of particles
 */
export function confettiBurst(container, count = 50) {
    if (!container) return;

    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'confetti-particle';
        particle.style.width = `${Math.random() * 10 + 5}px`;
        particle.style.height = `${Math.random() * 5 + 3}px`;
        particle.style.background = `hsl(${Math.random() * 360}, 70%, 60%)`;
        particle.style.animation = `confettiFall ${Math.random() * 2 + 1}s ease-out forwards`;
        particle.style.animationDelay = `${Math.random() * 0.5}s`;
        container.appendChild(particle);

        // Clean up
        setTimeout(() => particle.remove(), 3500);
    }
}

/**
 * Initialize page entrance animations
 * @param {string} selector - Elements to animate
 */
export function initEntranceAnimations(selector = '[data-animate]') {
    observeForAnimation(selector, 'animate-in', {
        rootMargin: '0px 0px -10% 0px',
        threshold: 0.1
    });
}

/**
 * Initialize scroll-triggered sections
 */
export function initScrollAnimations() {
    // Animate sections when they scroll into view
    const sections = document.querySelectorAll('.section-animate');
    sections.forEach(section => {
        const children = section.querySelectorAll('[data-animate-child]');
        children.forEach(child => child.classList.add('pre-animate'));
        observeForAnimation(section, 'animate-in', {
            rootMargin: '-10% 0px -10% 0px',
            threshold: 0.1
        });
        // Once parent animates, stagger children
        const observer = new IntersectionObserver((entries, obs) => {
            if (entries[0].isIntersecting) {
                staggerChildren(section, 100, 'animate-in');
                obs.disconnect();
            }
        });
        observer.observe(section);
    });
}
