/**
 * TransferLink Component
 * Copy-to-clipboard link display with success feedback
 */
import { copyToClipboard } from '../utils/helpers.js';
import { bus } from '../utils/EventBus.js';

export class TransferLink {
    /**
     * Create a transfer link
     * @param {Object} config
     * @param {string} config.value - Link value
     * @param {string} [config.label='Transfer Link'] - Label text
     * @param {boolean} [config.showCopy=true] - Show copy button
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the component
     */
    init() {
        this.render();
        this.setupEvents();
    }

    /**
     * Render the component
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'transfer-link-container';

        if (this.config.label) {
            const label = document.createElement('p');
            label.className = 'text-sm font-medium mb-xs';
            label.textContent = this.config.label;
            this.element.appendChild(label);
        }

        const linkGroup = document.createElement('div');
        linkGroup.className = 'input-group';

        this.input = document.createElement('input');
        this.input.type = 'text';
        this.input.className = 'input font-mono text-sm';
        this.input.value = this.config.value || '';
        this.input.readOnly = true;
        this.input.setAttribute('aria-label', 'Transfer link');
        linkGroup.appendChild(this.input);

        if (this.config.showCopy !== false) {
            this.copyBtn = document.createElement('button');
            this.copyBtn.className = 'btn btn-secondary input-button';
            this.copyBtn.setAttribute('aria-label', 'Copy link');
            this.copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                </svg>
            `;
            linkGroup.appendChild(this.copyBtn);
        }

        this.element.appendChild(linkGroup);
    }

    /**
     * Setup event listeners
     */
    setupEvents() {
        if (this.copyBtn) {
            this.copyBtn.addEventListener('click', async () => {
                const success = await copyToClipboard(this.input.value);
                if (success) {
                    this.showCopySuccess();
                    bus.emit('toast', { message: 'Link copied to clipboard!', type: 'success' });
                } else {
                    bus.emit('toast', { message: 'Failed to copy link', type: 'error' });
                }
            });
        }
    }

    /**
     * Show copy success state
     */
    showCopySuccess() {
        const originalHTML = this.copyBtn.innerHTML;
        this.copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6 9 17l-5-5"/>
            </svg>
        `;
        this.copyBtn.classList.remove('btn-secondary');
        this.copyBtn.classList.add('btn-primary');

        setTimeout(() => {
            this.copyBtn.innerHTML = originalHTML;
            this.copyBtn.classList.remove('btn-primary');
            this.copyBtn.classList.add('btn-secondary');
        }, 2000);
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
     * Set link value
     * @param {string} value - New link value
     */
    setValue(value) {
        this.input.value = value;
    }

    /**
     * Get current value
     * @returns {string}
     */
    getValue() {
        return this.input.value;
    }

    /**
     * Remove component
     */
    destroy() {
        this.element.remove();
    }
}

export default TransferLink;
