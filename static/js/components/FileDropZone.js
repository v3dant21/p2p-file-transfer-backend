/**
 * FileDropZone Component
 * Drag & drop area with states (idle, dragover, uploading, success, error)
 */
import { bus } from '../utils/EventBus.js';

export class FileDropZone {
    /**
     * Create a file drop zone
     * @param {Object} config
     * @param {string} config.id - Unique ID
     * @param {string} [config.title='Drop file here'] - Main text
     * @param {string} [config.subtitle='or click to browse'] - Secondary text
     * @param {string} [config.icon='upload'] - Icon name
     * @param {boolean} [config.multiple=false] - Allow multiple files
     * @param {Function} config.onFileSelect - Callback when file selected
     * @param {number} [config.maxSize=Infinity] - Max file size in bytes
     * @param {string[]} [config.accept=[]] - Accepted file types
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.input = null;
        this.state = 'idle'; // idle, dragover, uploading, success, error
        this.init();
    }

    /**
     * Initialize the drop zone
     */
    init() {
        this.render();
        this.setupEvents();
    }

    /**
     * Render drop zone HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'file-drop-zone';
        this.element.setAttribute('role', 'button');
        this.element.setAttribute('tabindex', '0');
        this.element.setAttribute('aria-label', this.config.title);

        // Hidden file input
        this.input = document.createElement('input');
        this.input.type = 'file';
        this.input.id = `${this.config.id}-input`;
        this.input.style.display = 'none';
        if (this.config.multiple) this.input.multiple = true;
        if (this.config.accept && this.config.accept.length) {
            this.input.accept = this.config.accept.join(',');
        }

        // Icon
        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-drop-icon';
        iconDiv.innerHTML = this.getIcon();

        // Text
        const text = document.createElement('div');
        text.innerHTML = `
            <p class="font-medium">${this.config.title}</p>
            <p class="text-sm text-muted">${this.config.subtitle}</p>
        `;

        this.element.appendChild(this.input);
        this.element.appendChild(iconDiv);
        this.element.appendChild(text);
    }

    /**
     * Get SVG icon
     * @returns {string}
     */
    getIcon() {
        return `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
        </svg>`;
    }

    /**
     * Setup drag & drop events
     */
    setupEvents() {
        // Click to browse
        this.element.addEventListener('click', () => {
            this.input.click();
        });

        // Keyboard support (Enter/Space)
        this.element.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.input.click();
            }
        });

        // File input change
        this.input.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files && files.length > 0) {
                this.handleFiles(files);
            }
        });

        // Drag events
        this.element.addEventListener('dragenter', (e) => {
            e.preventDefault();
            this.setState('dragover');
        });

        this.element.addEventListener('dragover', (e) => {
            e.preventDefault();
        });

        this.element.addEventListener('dragleave', (e) => {
            e.preventDefault();
            this.setState('idle');
        });

        this.element.addEventListener('drop', (e) => {
            e.preventDefault();
            this.setState('idle');
            const files = e.dataTransfer.files;
            if (files && files.length > 0) {
                this.handleFiles(files);
            }
        });
    }

    /**
     * Handle selected files
     * @param {FileList} files - Files
     */
    handleFiles(files) {
        const file = files[0];

        // Validate size
        if (this.config.maxSize && file.size > this.config.maxSize) {
            this.setState('error');
            bus.emit('toast', {
                message: `File too large. Maximum size: ${formatFileSize(this.config.maxSize)}`,
                type: 'error'
            });
            return;
        }

        this.setState('uploading');

        // Simulate brief delay for UX
        setTimeout(() => {
            this.setState('success');
            this.config.onFileSelect(file);
        }, 300);
    }

    /**
     * Set drop zone state
     * @param {string} state - State name
     */
    setState(state) {
        this.state = state;
        this.element.className = 'file-drop-zone';

        if (state === 'dragover') {
            this.element.classList.add('dragover');
        } else if (state === 'uploading') {
            this.element.classList.add('animate-pulse');
        } else if (state === 'error') {
            this.element.classList.add('animate-shake');
            this.element.style.borderColor = 'var(--color-error)';
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
     * Reset the drop zone
     */
    reset() {
        this.input.value = '';
        this.setState('idle');
    }

    /**
     * Get current state
     * @returns {string}
     */
    getState() {
        return this.state;
    }

    /**
     * Remove drop zone
     */
    destroy() {
        this.element.remove();
    }
}

// Import helper at module level
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default FileDropZone;
