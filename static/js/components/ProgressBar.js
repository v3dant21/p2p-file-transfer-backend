/**
 * ProgressBar Component
 * Animated progress with percentage, label, shimmer effect
 */
export class ProgressBar {
    /**
     * Create a progress bar
     * @param {Object} config
     * @param {string} [config.label=''] - Label text
     * @param {boolean} [config.showPercentage=true] - Show percentage
     * @param {string} [config.type='default'] - Type: default, success, warning, error
     */
    constructor(config) {
        this.config = config;
        this.progress = 0;
        this.element = null;
        this.fill = null;
        this.percentageEl = null;
        this.init();
    }

    /**
     * Initialize the progress bar
     */
    init() {
        this.render();
    }

    /**
     * Render progress bar HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'progress-container';

        // Label row
        const labelRow = document.createElement('div');
        labelRow.className = 'progress-text flex-between mb-xs';
        labelRow.innerHTML = `
            <span class="text-sm">${this.config.label || ''}</span>
            <span class="text-sm text-muted" id="progress-percentage">0%</span>
        `;
        this.element.appendChild(labelRow);
        this.percentageEl = labelRow.querySelector('#progress-percentage');

        // Track
        const track = document.createElement('div');
        track.className = 'progress-track';
        this.fill = document.createElement('div');
        this.fill.className = 'progress-fill';
        this.fill.style.width = '0%';

        // Apply type color
        if (this.config.type === 'success') {
            this.fill.style.background = 'linear-gradient(90deg, var(--color-success), hsl(var(--color-success-hsl) / 0.8))';
        } else if (this.config.type === 'warning') {
            this.fill.style.background = 'linear-gradient(90deg, var(--color-warning), hsl(var(--color-warning-hsl) / 0.8))';
        } else if (this.config.type === 'error') {
            this.fill.style.background = 'linear-gradient(90deg, var(--color-error), hsl(var(--color-error-hsl) / 0.8))';
        }

        track.appendChild(this.fill);
        this.element.appendChild(track);
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
     * Set progress
     * @param {number} progress - 0-100
     */
    setProgress(progress) {
        this.progress = Math.max(0, Math.min(100, progress));
        this.fill.style.width = `${this.progress}%`;
        this.percentageEl.textContent = `${Math.round(this.progress)}%`;
    }

    /**
     * Set label
     * @param {string} label - Label text
     */
    setLabel(label) {
        const labelEl = this.element.querySelector('.progress-text span:first-child');
        if (labelEl) {
            labelEl.textContent = label;
        }
    }

    /**
     * Complete the progress bar
     */
    complete() {
        this.setProgress(100);
    }

    /**
     * Reset to 0
     */
    reset() {
        this.setProgress(0);
    }

    /**
     * Get current progress
     * @returns {number}
     */
    getProgress() {
        return this.progress;
    }

    /**
     * Remove progress bar
     */
    destroy() {
        this.element.remove();
    }
}

export default ProgressBar;
