/**
 * Footer Component
 * Links, license, built-with credits
 */
export class Footer {
    /**
     * Create a footer
     * @param {Object} config
     * @param {string} [config.copyright] - Copyright text
     * @param {Array} [config.links] - Footer links [{text, href}]
     * @param {Array} [config.socials] - Social links [{name, href, icon}]
     * @param {string} [config.builtWith] - "Built with" text
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the footer
     */
    init() {
        this.render();
    }

    /**
     * Render the footer
     */
    render() {
        this.element = document.createElement('footer');
        this.element.id = 'footer';

        const currentYear = new Date().getFullYear();
        const copyright = this.config.copyright || `© ${currentYear} P2P Transfer. All rights reserved.`;

        this.element.innerHTML = `
            <div class="container">
                <div class="footer-links">
                    ${(this.config.links || []).map(link => `
                        <a href="${link.href}" target="${link.external ? '_blank' : '_self'}" rel="${link.external ? 'noopener noreferrer' : ''}">${link.text}</a>
                    `).join('')}
                </div>
                ${this.config.socials && this.config.socials.length ? `
                    <div class="flex-center gap-md mb-md">
                        ${this.config.socials.map(social => `
                            <a href="${social.href}" target="_blank" rel="noopener noreferrer" aria-label="${social.name}" class="text-muted hover:text-primary transition-colors">
                                ${social.icon}
                            </a>
                        `).join('')}
                    </div>
                ` : ''}
                <p class="text-sm text-muted">${copyright}</p>
                ${this.config.builtWith ? `<p class="text-xs text-muted mt-sm">${this.config.builtWith}</p>` : ''}
            </div>
        `;
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
     * Remove footer
     */
    destroy() {
        this.element.remove();
    }
}

export default Footer;
