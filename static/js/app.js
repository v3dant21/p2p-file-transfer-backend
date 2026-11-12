/**
 * Application Entry Point
 * Initializes all components and the app orchestrator
 */
import { bus } from './utils/EventBus.js';
import { initEntranceAnimations, initScrollAnimations, smoothScroll } from './utils/animations.js';
import { isMobile } from './utils/helpers.js';

class App {
    constructor() {
        this.navbar = document.getElementById('navbar');
        this.mainContent = document.getElementById('main-content');
        this.footer = document.getElementById('footer');
        this.toastContainer = document.getElementById('toast-container');
        this.modalRoot = document.getElementById('modal-root');
    }

    /**
     * Initialize the application
     */
    init() {
        // Initialize animations
        initEntranceAnimations();
        initScrollAnimations();

        // Handle route/hash changes if needed
        this.handleUrlParams();

        // Log initialization
        console.log('[App] Initialized', {
            mobile: isMobile(),
            theme: document.documentElement.dataset.theme || 'light'
        });
    }

    /**
     * Handle URL parameters (e.g., transfer ID)
     */
    handleUrlParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const transferId = urlParams.get('id');
        if (transferId) {
            // Store for use by receive component
            bus.emit('app:url-transfer-id', { transferId });
        }
    }

    /**
     * Get element by ID helper
     * @param {string} id - Element ID
     * @returns {Element}
     */
    getElement(id) {
        return document.getElementById(id);
    }
}

// Initialize when DOM is ready
const app = new App();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => app.init());
} else {
    app.init();
}

export default app;
