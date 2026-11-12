/**
 * Navbar Component
 * Sticky nav with mobile hamburger menu
 */
import { bus } from '../utils/EventBus.js';
import ThemeToggle from './ThemeToggle.js';

export class Navbar {
    /**
     * Create a navbar
     * @param {Object} config
     * @param {string} config.logo - Logo text or HTML
     * @param {Array} [config.links] - Nav links [{text, href}]
     * @param {Object} [config.cta] - CTA button {text, href, onClick}
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.mobileMenuOpen = false;
        this.init();
    }

    /**
     * Initialize the navbar
     */
    init() {
        this.render();
        this.setupEvents();
    }

    /**
     * Render the navbar
     */
    render() {
        this.element = document.createElement('nav');
        this.element.id = 'navbar';

        this.element.innerHTML = `
            <div class="navbar-content">
                <div class="navbar-brand">
                    <a href="/" class="font-bold text-lg">${this.config.logo || 'P2P Transfer'}</a>
                </div>
                <div class="navbar-links hidden md:flex">
                    ${(this.config.links || []).map(link => `
                        <a href="${link.href}" class="text-sm text-muted hover:text-foreground transition-colors px-3 py-2">${link.text}</a>
                    `).join('')}
                </div>
                <div class="navbar-actions flex items-center gap-md">
                    <div id="theme-toggle-container"></div>
                    ${this.config.cta ? `
                        <a href="${this.config.cta.href || '#'}" class="btn btn-primary btn-sm" id="navbar-cta">${this.config.cta.text}</a>
                    ` : ''}
                    <button class="btn btn-ghost btn-icon md:hidden" id="mobile-menu-toggle" aria-label="Open menu">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="mobile-menu" id="mobile-menu">
                <div class="mobile-menu-backdrop" id="mobile-menu-backdrop"></div>
                <div class="mobile-menu-content">
                    ${(this.config.links || []).map(link => `
                        <a href="${link.href}" class="block py-md text-lg">${link.text}</a>
                    `).join('')}
                    <div class="pt-md border-t">
                        <div id="theme-toggle-container-mobile"></div>
                    </div>
                </div>
            </div>
        `;

        // Mount theme toggles
        const toggleDesktop = this.element.querySelector('#theme-toggle-container');
        const toggleMobile = this.element.querySelector('#theme-toggle-container-mobile');
        if (toggleDesktop) new ThemeToggle(toggleDesktop);
        if (toggleMobile) new ThemeToggle(toggleMobile);
    }

    /**
     * Setup event listeners
     */
    setupEvents() {
        // Scroll behavior
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                this.element.classList.add('scrolled');
            } else {
                this.element.classList.remove('scrolled');
            }
        });

        // Mobile menu toggle
        const toggle = this.element.querySelector('#mobile-menu-toggle');
        const menu = this.element.querySelector('#mobile-menu');
        const backdrop = this.element.querySelector('#mobile-menu-backdrop');

        if (toggle && menu && backdrop) {
            toggle.addEventListener('click', () => {
                this.mobileMenuOpen = !this.mobileMenuOpen;
                menu.classList.toggle('open');
                backdrop.style.display = this.mobileMenuOpen ? 'block' : 'none';
            });

            backdrop.addEventListener('click', () => {
                this.mobileMenuOpen = false;
                menu.classList.remove('open');
                backdrop.style.display = 'none';
            });
        }

        // CTA click
        const cta = this.element.querySelector('#navbar-cta');
        if (cta && this.config.cta && this.config.cta.onClick) {
            cta.addEventListener('click', (e) => {
                e.preventDefault();
                this.config.cta.onClick();
            });
        }

        // Smooth scroll for nav links
        const links = this.element.querySelectorAll('a[href^="#"]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                    if (this.mobileMenuOpen) {
                        this.mobileMenuOpen = false;
                        menu.classList.remove('open');
                        backdrop.style.display = 'none';
                    }
                }
            });
        });
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
     * Remove navbar
     */
    destroy() {
        this.element.remove();
    }
}

export default Navbar;
