/**
 * Card Component
 * Container with header, body, footer slots
 */
export class Card {
    /**
     * Create a card
     * @param {Object} config
     * @param {string} [config.title] - Card title (header)
     * @param {string} [config.description] - Card description
     * @param {string} [config.content] - Body content (HTML)
     * @param {string} [config.footer] - Footer content (HTML)
     * @param {boolean} [config.hoverable=false] - Enable hover animation
     * @param {string} [config.className=''] - Additional classes
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the card
     */
    init() {
        this.render();
    }

    /**
     * Render card HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = `card ${this.config.hoverable ? 'hoverable' : ''} ${this.config.className || ''}`;

        if (this.config.title || this.config.description) {
            const header = document.createElement('div');
            header.className = 'card-header';
            if (this.config.title) {
                const title = document.createElement('h3');
                title.className = 'text-lg font-semibold';
                title.textContent = this.config.title;
                header.appendChild(title);
            }
            if (this.config.description) {
                const desc = document.createElement('p');
                desc.className = 'text-sm text-muted';
                desc.textContent = this.config.description;
                header.appendChild(desc);
            }
            this.element.appendChild(header);
        }

        if (this.config.content) {
            const body = document.createElement('div');
            body.className = 'card-body';
            body.innerHTML = this.config.content;
            this.element.appendChild(body);
        }

        if (this.config.footer) {
            const footer = document.createElement('div');
            footer.className = 'card-footer';
            footer.innerHTML = this.config.footer;
            this.element.appendChild(footer);
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
     * Update content
     * @param {string} content - New content
     */
    updateContent(content) {
        const body = this.element.querySelector('.card-body');
        if (body) {
            body.innerHTML = content;
        }
    }

    /**
     * Remove card
     */
    destroy() {
        this.element.remove();
    }
}
