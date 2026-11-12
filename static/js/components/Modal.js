/**
 * Modal Component
 * Overlay modal with backdrop, close button, focus trap
 */
export class Modal {
    /**
     * Create a modal
     * @param {Object} config
     * @param {string} config.title - Modal title
     * @param {string} config.content - Modal content (HTML)
     * @param {string} [config.footer] - Footer content (HTML)
     * @param {Function} [config.onClose] - Close callback
     * @param {boolean} [config.closeOnBackdrop=true] - Close when clicking backdrop
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the modal
     */
    init() {
        this.render();
    }

    /**
     * Render modal HTML
     */
    render() {
        // Backdrop
        this.backdrop = document.createElement('div');
        this.backdrop.className = 'modal-backdrop';

        // Modal content
        this.element = document.createElement('div');
        this.element.className = 'modal-content';
        this.element.setAttribute('role', 'dialog');
        this.element.setAttribute('aria-modal', 'true');

        const header = document.createElement('div');
        header.className = 'flex-between mb-md';
        header.innerHTML = `
            <h2 class="text-xl font-semibold">${this.config.title}</h2>
            <button class="btn btn-ghost btn-icon" id="modal-close" aria-label="Close modal">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            </button>
        `;
        this.element.appendChild(header);

        const body = document.createElement('div');
        body.innerHTML = this.config.content;
        this.element.appendChild(body);

        if (this.config.footer) {
            const footer = document.createElement('div');
            footer.className = 'flex-end gap-sm mt-lg';
            footer.innerHTML = this.config.footer;
            this.element.appendChild(footer);
        }
    }

    /**
     * Show the modal
     */
    show() {
        const root = document.getElementById('modal-root') || document.body;
        root.appendChild(this.backdrop);
        root.appendChild(this.element);

        // Animate in
        requestAnimationFrame(() => {
            this.backdrop.classList.add('open');
            this.element.classList.add('open');
        });

        // Event listeners
        this.element.querySelector('#modal-close').addEventListener('click', () => this.close());
        if (this.config.closeOnBackdrop !== false) {
            this.backdrop.addEventListener('click', () => this.close());
        }

        // Escape key
        document.addEventListener('keydown', this.handleEscape);
        this.focusTrap();
    }

    /**
     * Close the modal
     */
    close() {
        this.backdrop.classList.remove('open');
        this.element.classList.remove('open');
        setTimeout(() => {
            this.backdrop.remove();
            this.element.remove();
            document.removeEventListener('keydown', this.handleEscape);
            if (this.config.onClose) this.config.onClose();
        }, 200);
    }

    /**
     * Handle escape key
     */
    handleEscape = (e) => {
        if (e.key === 'Escape') this.close();
    }

    /**
     * Focus trap (basic)
     */
    focusTrap() {
        const focusable = this.element.querySelectorAll('button, input, [tabindex]:not([tabindex="-1"])');
        if (focusable.length) {
            focusable[0].focus();
        }
    }

    /**
     * Static helper to show modal
     */
    static show(title, content, config = {}) {
        const modal = new Modal({ title, content, ...config });
        modal.show();
        return modal;
    }

    /**
     * Static helper for confirm dialog
     */
    static confirm(title, message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                content: `<p>${message}</p>`,
                footer: `
                    <button class="btn btn-ghost" id="modal-cancel">${cancelText}</button>
                    <button class="btn btn-primary" id="modal-confirm">${confirmText}</button>
                `,
                onClose: () => resolve(false)
            });
            modal.show();

            // Override close behavior
            modal.element.querySelector('#modal-cancel').addEventListener('click', () => {
                modal.close();
                resolve(false);
            });
            modal.element.querySelector('#modal-confirm').addEventListener('click', () => {
                modal.close();
                resolve(true);
            });
        });
    }
}

export default Modal;
