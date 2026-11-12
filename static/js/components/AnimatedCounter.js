/**
 * AnimatedCounter Component
 * Rolling number animation for stats
 */
export class AnimatedCounter {
    /**
     * Create an animated counter
     * @param {Object} config
     * @param {number} config.target - Target number
     * @param {number} [config.duration=2000] - Animation duration in ms
     * @param {string} [config.prefix=''] - Text before number
     * @param {string} [config.suffix=''] - Text after number
     * @param {Function} [config.formatter] - Custom formatter function
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.startTime = null;
        this.init();
    }

    /**
     * Initialize the counter
     */
    init() {
        this.render();
    }

    /**
     * Render the counter
     */
    render() {
        this.element = document.createElement('span');
        this.element.className = 'animated-counter';
        this.element.textContent = this.formatNumber(0);
    }

    /**
     * Format number with prefix/suffix
     * @param {number} num - Number to format
     * @returns {string}
     */
    formatNumber(num) {
        let formatted = num.toLocaleString();
        if (this.config.formatter) {
            formatted = this.config.formatter(num);
        }
        return `${this.config.prefix || ''}${formatted}${this.config.suffix || ''}`;
    }

    /**
     * Start counting animation
     */
    start() {
        this.startTime = null;
        requestAnimationFrame((timestamp) => this.update(timestamp));
    }

    /**
     * Update animation frame
     * @param {number} timestamp - Current timestamp
     */
    update(timestamp) {
        if (!this.startTime) this.startTime = timestamp;
        const elapsed = timestamp - this.startTime;
        const duration = this.config.duration || 2000;
        const progress = Math.min(elapsed / duration, 1);

        // Ease-out function
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(this.config.target * easeOut);

        this.element.textContent = this.formatNumber(current);

        if (progress < 1) {
            requestAnimationFrame((ts) => this.update(ts));
        }
    }

    /**
     * Set target and restart
     * @param {number} target - New target
     */
    setTarget(target) {
        this.config.target = target;
        this.start();
    }

    /**
     * Mount to container
     * @param {Element} container - Parent element
     */
    mount(container) {
        container.appendChild(this.element);
        return this.element;
    }

    /**
     * Remove counter
     */
    destroy() {
        this.element.remove();
    }
}

export default AnimatedCounter;
