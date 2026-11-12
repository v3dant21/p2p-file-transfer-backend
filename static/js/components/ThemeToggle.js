/**
 * ThemeToggle Component
 * Handles dark/light theme with localStorage persistence
 */
import { bus } from '../utils/EventBus.js';

export class ThemeToggle {
    constructor(container) {
        this.container = container;
        this.theme = localStorage.getItem('theme') || this.detectSystemTheme();
        this.init();
    }

    /**
     * Detect system preference
     */
    detectSystemTheme() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    /**
     * Initialize theme on load
     */
    init() {
        this.applyTheme(this.theme);
        this.render();
        this.setupListeners();
    }

    /**
     * Apply theme to html element
     * @param {string} theme - 'light' or 'dark'
     */
    applyTheme(theme) {
        document.documentElement.dataset.theme = theme;
        localStorage.setItem('theme', theme);
        bus.emit('theme:changed', { theme });
    }

    /**
     * Toggle current theme
     */
    toggle() {
        this.theme = this.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(this.theme);
    }

    /**
     * Render the toggle button
     */
    render() {
        this.container.innerHTML = `
            <button class="btn btn-ghost btn-icon" id="theme-toggle" aria-label="Toggle theme" title="Toggle theme">
                ${this.getIcon(this.theme === 'light' ? 'moon' : 'sun')}
            </button>
        `;
    }

    /**
     * Get SVG icon
     * @param {string} type - 'sun' or 'moon'
     */
    getIcon(type) {
        if (type === 'sun') {
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"/>
                    <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
            `;
        } else {
            return `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
            `;
        }
    }

    /**
     * Setup event listeners
     */
    setupListeners() {
        const button = this.container.querySelector('#theme-toggle');
        button.addEventListener('click', () => {
            this.toggle();
            this.render();
        });

        // Listen for system preference changes
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
                this.applyTheme(e.matches ? 'dark' : 'light');
                this.render();
            }
        });
    }
}

// Export singleton that can be initialized anywhere
export default ThemeToggle;
