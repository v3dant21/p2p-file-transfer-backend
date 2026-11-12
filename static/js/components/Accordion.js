/**
 * Accordion Component
 * Collapsible sections for FAQ
 */
export class Accordion {
    /**
     * Create an accordion
     * @param {Object} config
     * @param {Array} config.items - Array of {title, content} objects
     * @param {boolean} [config.allowMultiple=false] - Allow multiple open
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.items = [];
        this.init();
    }

    /**
     * Initialize the accordion
     */
    init() {
        this.render();
    }

    /**
     * Render the accordion
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'accordion';

        this.config.items.forEach((item, index) => {
            const itemEl = this.createItem(item, index);
            this.element.appendChild(itemEl);
            this.items.push(itemEl);
        });
    }

    /**
     * Create accordion item
     * @param {Object} item - Item data
     * @param {number} index - Item index
     * @returns {Element}
     */
    createItem(item, index) {
        const itemEl = document.createElement('div');
        itemEl.className = 'accordion-item';
        itemEl.dataset.index = index;

        const header = document.createElement('button');
        header.className = 'accordion-header';
        header.setAttribute('aria-expanded', 'false');
        header.innerHTML = `
            <span>${item.title}</span>
            <svg class="accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
            </svg>
        `;

        const content = document.createElement('div');
        content.className = 'accordion-content';
        content.innerHTML = item.content;

        header.addEventListener('click', () => {
            this.toggleItem(itemEl);
        });

        itemEl.appendChild(header);
        itemEl.appendChild(content);

        return itemEl;
    }

    /**
     * Toggle accordion item
     * @param {Element} itemEl - Item element
     */
    toggleItem(itemEl) {
        const isOpen = itemEl.classList.contains('open');
        const header = itemEl.querySelector('.accordion-header');

        // Close others if not allowing multiple
        if (!this.config.allowMultiple && !isOpen) {
            this.items.forEach(el => {
                el.classList.remove('open');
                el.querySelector('.accordion-header').setAttribute('aria-expanded', 'false');
            });
        }

        // Toggle current
        itemEl.classList.toggle('open');
        header.setAttribute('aria-expanded', !isOpen);
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
     * Remove accordion
     */
    destroy() {
        this.element.remove();
    }
}

export default Accordion;
