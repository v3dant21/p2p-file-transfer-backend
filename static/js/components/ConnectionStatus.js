/**
 * ConnectionStatus Component
 * WiFi icon with animated rings (idle, connecting, connected, error)
 */
export class ConnectionStatus {
    /**
     * Create connection status
     * @param {Object} config
     * @param {string} [config.state='idle'] - State: idle, connecting, connected, error
     * @param {string} [config.message=''] - Status message
     * @param {boolean} [config.showMessage=true] - Show message text
     */
    constructor(config) {
        this.config = config;
        this.state = this.config.state || 'idle';
        this.element = null;
        this.init();
    }

    /**
     * Initialize the component
     */
    init() {
        this.render();
        this.updateState(this.state);
    }

    /**
     * Render the component
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'wifi-animation';

        // Create 3 rings
        for (let i = 1; i <= 3; i++) {
            const ring = document.createElement('div');
            ring.className = `wifi-ring wifi-ring-${i}`;
            this.element.appendChild(ring);
        }

        // Icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'wifi-icon-container';
        iconContainer.innerHTML = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 20h.01"/>
                <path d="M2 8.82a15 15 0 0 1 20 0"/>
                <path d="M5 12.859a10 10 0 0 1 14 0"/>
                <path d="M8.5 16.429a5 5 0 0 1 7 0"/>
            </svg>
        `;
        this.element.appendChild(iconContainer);

        // Message
        if (this.config.showMessage !== false) {
            this.messageEl = document.createElement('p');
            this.messageEl.className = 'text-sm text-muted mt-md';
            this.messageEl.textContent = this.config.message || '';
            this.element.appendChild(this.messageEl);
        }
    }

    /**
     * Update connection state
     * @param {string} state - New state
     */
    updateState(state) {
        this.state = state;
        this.element.classList.remove('active', 'error');

        if (state === 'connecting') {
            this.element.classList.add('active');
            this.setMessage(this.config.connectingMessage || 'Connecting...');
        } else if (state === 'connected') {
            this.element.classList.add('active');
            this.element.classList.add('connected');
            this.setMessage(this.config.connectedMessage || 'Connected');
        } else if (state === 'error') {
            this.element.classList.add('error');
            this.setMessage(this.config.errorMessage || 'Connection failed');
        } else {
            this.setMessage(this.config.message || '');
        }
    }

    /**
     * Set message text
     * @param {string} message - Message
     */
    setMessage(message) {
        if (this.messageEl) {
            this.messageEl.textContent = message;
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
     * Get current state
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * Remove component
     */
    destroy() {
        this.element.remove();
    }
}

export default ConnectionStatus;
