/**
 * Toast Notification System
 * Auto-dismissing notifications positioned top-right
 */
export class Toast {
    /**
     * Create a toast
     * @param {Object} config
     * @param {string} config.message - Toast message
     * @param {string} [config.type='info'] - Type: success, error, warning, info
     * @param {number} [config.duration=5000] - Duration in ms (0 = permanent)
     * @param {Function} [config.onClose] - Close callback
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize and show the toast
     */
    init() {
        this.render();
        this.show();
    }

    /**
     * Render toast HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = `toast toast-${this.config.type || 'info'}`;

        const icons = {
            success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17l-5-5"/></svg>',
            error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>',
            warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
            info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>'
        };

        this.element.innerHTML = `
            ${icons[this.config.type || 'info']}
            <span>${this.config.message}</span>
            <button class="btn btn-ghost btn-icon ml-auto" onclick="this.parentElement.remove()" aria-label="Close">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            </button>
        `;
    }

    /**
     * Show the toast
     */
    show() {
        const container = document.getElementById('toast-container') || document.body;
        container.appendChild(this.element);

        if (this.config.duration !== 0) {
            setTimeout(() => {
                this.element.classList.add('animate-fade-out');
                setTimeout(() => {
                    this.element.remove();
                    if (this.config.onClose) this.config.onClose();
                }, 300);
            }, this.config.duration || 5000);
        }
    }

    /**
     * Close the toast
     */
    close() {
        this.element.remove();
    }

    /**
     * Static helper for quick toasts
     * @param {string} message - Toast message
     * @param {string} [type='info'] - Type
     * @param {number} [duration=5000] - Duration
     */
    static show(message, type = 'info', duration = 5000) {
        return new Toast({ message, type, duration });
    }

    /**
     * Static helper for success toast
     */
    static success(message, duration = 5000) {
        return new Toast({ message, type: 'success', duration });
    }

    /**
     * Static helper for error toast
     */
    static error(message, duration = 5000) {
        return new Toast({ message, type: 'error', duration });
    }

    /**
     * Static helper for warning toast
     */
    static warning(message, duration = 5000) {
        return new Toast({ message, type: 'warning', duration });
    }

    /**
     * Static helper for info toast
     */
    static info(message, duration = 5000) {
        return new Toast({ message, type: 'info', duration });
    }
}

export default Toast;
