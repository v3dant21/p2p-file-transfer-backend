/**
 * Button Component
 * Variants: primary, secondary, ghost, outline, danger
 * Sizes: sm, md, lg, icon
 */
export class Button {
    /**
     * Create a button
     * @param {Object} config
     * @param {string} config.text - Button text
     * @param {string} [config.variant='primary'] - Variant: primary, secondary, ghost, outline, danger
     * @param {string} [config.size='md'] - Size: sm, md, lg, icon
     * @param {string} [config.type='button'] - Button type attribute
     * @param {string} [config.icon] - Optional SVG icon
     * @param {string} [config.iconPosition='left'] - Icon position
     * @param {boolean} [config.disabled=false] - Disabled state
     * @param {string} [config.className=''] - Additional classes
     * @param {Function} [config.onClick] - Click handler
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the button
     */
    init() {
        this.render();
        if (this.config.onClick) {
            this.element.addEventListener('click', this.config.onClick);
        }
    }

    /**
     * Render button HTML
     */
    render() {
        const btn = document.createElement('button');
        btn.type = this.config.type || 'button';
        btn.className = this.getClasses();
        if (this.config.disabled) {
            btn.disabled = true;
            btn.classList.add('disabled');
        }

        const text = this.config.text || '';
        const icon = this.config.icon || '';
        const iconPosition = this.config.iconPosition || 'left';

        if (icon && iconPosition === 'left') {
            btn.innerHTML = `${icon}<span>${text}</span>`;
        } else if (icon && iconPosition === 'right') {
            btn.innerHTML = `<span>${text}</span>${icon}`;
        } else {
            btn.innerHTML = `<span>${text}</span>`;
        }

        this.element = btn;
    }

    /**
     * Get computed CSS classes
     * @returns {string} Class string
     */
    getClasses() {
        let classes = ['btn'];
        classes.push(`btn-${this.config.variant || 'primary'}`);
        classes.push(`btn-${this.config.size || 'md'}`);
        if (this.config.className) {
            classes.push(this.config.className);
        }
        return classes.join(' ');
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
     * Update button state
     * @param {Object} updates - Properties to update
     */
    update(updates) {
        Object.assign(this.config, updates);
        this.render();
    }

    /**
     * Remove button
     */
    destroy() {
        this.element.remove();
    }
}
