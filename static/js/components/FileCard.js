/**
 * FileCard Component
 * File preview with icon, name, size, type, remove button
 */
import { Icon } from './Icon.js';
import { formatFileSize } from '../utils/helpers.js';

export class FileCard {
    /**
     * Create a file card
     * @param {Object} config
     * @param {string} config.name - File name
     * @param {number} config.size - File size in bytes
     * @param {string} [config.mimeType='application/octet-stream'] - MIME type
     * @param {Function} [config.onRemove] - Remove callback
     * @param {boolean} [config.showRemove=true] - Show remove button
     */
    constructor(config) {
        this.config = config;
        this.element = null;
        this.init();
    }

    /**
     * Initialize the file card
     */
    init() {
        this.render();
        if (this.config.onRemove) {
            this.setupEvents();
        }
    }

    /**
     * Render file card HTML
     */
    render() {
        this.element = document.createElement('div');
        this.element.className = 'file-card';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'file-card-icon';
        iconDiv.innerHTML = this.getFileIcon();

        const infoDiv = document.createElement('div');
        infoDiv.className = 'file-card-info';
        infoDiv.innerHTML = `
            <div class="file-card-name">${this.config.name}</div>
            <div class="file-card-meta">
                <div class="file-card-dot"></div>
                ${formatFileSize(this.config.size)} • ${this.getFileType()}
            </div>
        `;

        this.element.appendChild(iconDiv);
        this.element.appendChild(infoDiv);

        if (this.config.showRemove !== false) {
            const removeBtn = document.createElement('button');
            removeBtn.className = 'btn btn-ghost btn-icon';
            removeBtn.setAttribute('aria-label', 'Remove file');
            removeBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
                </svg>
            `;
            removeBtn.addEventListener('click', () => {
                if (this.config.onRemove) this.config.onRemove();
            });
            this.element.appendChild(removeBtn);
        }
    }

    /**
     * Get appropriate icon based on MIME type
     * @returns {string} SVG HTML
     */
    getFileIcon() {
        const type = this.config.mimeType || 'application/octet-stream';
        const mainType = type.split('/')[0];

        const icons = {
            'image': 'image',
            'video': 'video',
            'audio': 'music',
            'text': 'file-text',
            'application': 'file'
        };

        const iconName = icons[mainType] || 'file';
        return new Icon(iconName, { size: 20 }).render();
    }

    /**
     * Get readable file type
     * @returns {string}
     */
    getFileType() {
        const type = this.config.mimeType || 'application/octet-stream';
        return type.split('/')[1] || 'File';
    }

    /**
     * Setup remove button event
     */
    setupEvents() {
        // Already handled in render
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
     * Remove file card
     */
    destroy() {
        this.element.remove();
    }
}

export default FileCard;
