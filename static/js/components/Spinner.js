/**
 * Spinner Component
 * Loading spinner (border, dots, pulse variants)
 */
export class Spinner {
    /**
     * Create a spinner
     * @param {Object} config
     * @param {string} [config.type='border'] - Type: border, dots, pulse
     * @param {string} [config.size='md'] - Size: sm, md, lg
     * @param {string} [config.color='currentColor'] - Color
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the spinner
     */
    init() {
        this.render();
    }

    /**
     * Render spinner HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'spinner-wrapper';

        const sizeMap = {
            sm: 16,
            md: 24,
            lg: 32
        };
        const size = sizeMap[this.config.size || 'md'];

        switch (this.config.type || 'border') {
            case 'border':
                this.element.innerHTML = `
                    <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${this.config.color || 'currentColor'}" stroke-width="2" class="animate-spin">
                        <line x1="12" x2="12" y1="2" y2="6"/>
                        <line x1="12" x2="12" y1="18" y2="22"/>
                        <line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/>
                        <line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/>
                        <line x1="2" x2="6" y1="12" y2="12"/>
                        <line x1="18" x2="22" y1="12" y2="12"/>
                        <line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/>
                        <line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/>
                    </svg>
                `;
                break;
            case 'dots':
                this.element.innerHTML = `
                    <div class="spinner-dots" style="width:${size}px;height:${size/4}px;display:flex;gap:${size/8}px;justify-content:center;align-items:center;">
                        <div style="width:${size/4}px;height:${size/4}px;border-radius:50%;background:${this.config.color || 'currentColor'};animation: pulse 1.4s infinite;"></div>
                        <div style="width:${size/4}px;height:${size/4}px;border-radius:50%;background:${this.config.color || 'currentColor'};animation: pulse 1.4s infinite 0.2s;"></div>
                        <div style="width:${size/4}px;height:${size/4}px;border-radius:50%;background:${this.config.color || 'currentColor'};animation: pulse 1.4s infinite 0.4s;"></div>
                    </div>
                `;
                break;
            case 'pulse':
                this.element.innerHTML = `
                    <div style="width:${size}px;height:${size}px;border-radius:50%;background:${this.config.color || 'currentColor'};animation: pulse 1.5s cubic-bezier(0.4,0,0.6,1) infinite;"></div>
                `;
                break;
        }
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
     * Remove spinner
     */
    destroy() {
        this.element.remove();
    }
}

export default Spinner;
