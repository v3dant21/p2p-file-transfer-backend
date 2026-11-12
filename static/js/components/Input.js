/**
 * Input Component
 * Text input with label, error state, helper text, icon support
 */
export class Input {
    /**
     * Create an input
     * @param {Object} config
     * @param {string} config.id - Input ID
     * @param {string} [config.label] - Label text
     * @param {string} [config.placeholder=''] - Placeholder text
     * @param {string} [config.type='text'] - Input type
     * @param {string} [config.value=''] - Default value
     * @param {string} [config.helperText=''] - Helper text below input
     * @param {string} [config.error=''] - Error message
     * @param {string} [config.icon=''] - Optional SVG icon (left)
     * @param {string} [config.iconRight=''] - Optional SVG icon (right)
     * @param {boolean} [config.required=false] - Required attribute
     * @param {boolean} [config.disabled=false] - Disabled state
     * @param {string} [config.className=''] - Additional classes
     * @param {Function} [config.onInput] - Input event handler
     * @param {Function} [config.onChange] - Change event handler
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.input = null;
        this.init();
    }

    /**
     * Initialize the input
     */
    init() {
        this.render();
        if (this.config.onInput) {
            this.input.addEventListener('input', (e) => this.config.onInput(e.target.value, e));
        }
        if (this.config.onChange) {
            this.input.addEventListener('change', (e) => this.config.onChange(e.target.value, e));
        }
    }

    /**
     * Render input HTML
     */
    render() {
        const wrapper = document.createElement('div');
        wrapper.className = `input-wrapper ${this.config.className || ''}`;

        // Label
        if (this.config.label) {
            const label = document.createElement('label');
            label.htmlFor = this.config.id;
            label.className = 'text-sm font-medium mb-sm block';
            label.textContent = this.config.label;
            if (this.config.required) {
                label.innerHTML += ' <span class="text-error">*</span>';
            }
            wrapper.appendChild(label);
        }

        // Input group (for icons)
        const inputGroup = document.createElement('div');
        inputGroup.className = 'input-group relative';

        // Left icon
        if (this.config.icon) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'absolute left-md top-1/2 transform -translate-y-1/2 text-muted';
            iconSpan.innerHTML = this.config.icon;
            inputGroup.appendChild(iconSpan);
        }

        // Input
        this.input = document.createElement('input');
        this.input.type = this.config.type || 'text';
        this.input.id = this.config.id;
        this.input.placeholder = this.config.placeholder || '';
        this.input.value = this.config.value || '';
        this.input.className = 'input';
        if (this.config.icon) {
            this.input.style.paddingLeft = '2.5rem';
        }
        if (this.config.required) this.input.required = true;
        if (this.config.disabled) this.input.disabled = true;
        if (this.config.error) {
            this.input.classList.add('border-error');
        }
        inputGroup.appendChild(this.input);

        // Right icon
        if (this.config.iconRight) {
            const iconSpan = document.createElement('span');
            iconSpan.className = 'absolute right-md top-1/2 transform -translate-y-1/2 text-muted';
            iconSpan.innerHTML = this.config.iconRight;
            inputGroup.appendChild(iconSpan);
        }

        wrapper.appendChild(inputGroup);

        // Helper text
        if (this.config.helperText && !this.config.error) {
            const helper = document.createElement('p');
            helper.className = 'text-xs text-muted mt-xs';
            helper.textContent = this.config.helperText;
            wrapper.appendChild(helper);
        }

        // Error text
        if (this.config.error) {
            const error = document.createElement('p');
            error.className = 'text-xs text-error mt-xs';
            error.textContent = this.config.error;
            wrapper.appendChild(error);
        }

        this.element = wrapper;
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
     * Get current value
     * @returns {string}
     */
    getValue() {
        return this.input.value;
    }

    /**
     * Set value
     * @param {string} value - New value
     */
    setValue(value) {
        this.input.value = value;
    }

    /**
     * Set error
     * @param {string} error - Error message
     */
    setError(error) {
        this.config.error = error;
        this.render();
    }

    /**
     * Clear error
     */
    clearError() {
        this.config.error = '';
        this.render();
    }

    /**
     * Focus input
     */
    focus() {
        this.input.focus();
    }

    /**
     * Remove input
     */
    destroy() {
        this.element.remove();
    }
}
