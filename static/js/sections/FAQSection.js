/**
 * FAQSection Component
 * Accordion with common questions
 */
import { Accordion } from '../components/Accordion.js';

export class FAQSection {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'section section-alt';
        this.element.id = 'faq';

        this.element.innerHTML = `
            <div class="container">
                <div class="text-center mb-3xl" data-animate>
                    <h2 class="text-3xl font-bold mb-md">Frequently Asked Questions</h2>
                    <p class="text-lg text-muted max-w-2xl mx-auto">
                        Everything you need to know about P2P file transfers.
                    </p>
                </div>

                <div class="max-w-3xl mx-auto" data-animate id="faq-accordion">
                    <!-- Accordion will be injected here -->
                </div>
            </div>
        `;

        // Mount accordion
        const accordionContainer = this.element.querySelector('#faq-accordion');
        if (accordionContainer) {
            const accordion = new Accordion({
                allowMultiple: false,
                items: [
                    {
                        title: 'Is there a file size limit?',
                        content: '<p>No artificial limits. You can send any file size that fits in your browser\'s memory. For extremely large files (10GB+), we recommend using a stable connection.</p>'
                    },
                    {
                        title: 'Do you store my files?',
                        content: '<p>Absolutely not. Files are transferred directly between browsers through our WebSocket relay. The server only connects the sender and receiver — it never touches, stores, or logs your data.</p>'
                    },
                    {
                        title: 'Is it really free?',
                        content: '<p>Yes, completely free. There are no premium tiers, no ads, and no hidden fees. The project is open source and maintained by the community.</p>'
                    },
                    {
                        title: 'What browsers are supported?',
                        content: '<p>Any modern browser with WebSocket support: Chrome, Firefox, Safari, and Edge (latest 2 versions). Internet Explorer is not supported.</p>'
                    },
                    {
                        title: 'Can I resume interrupted transfers?',
                        content: '<p>Currently, transfers restart if interrupted. For large files, we recommend using a stable connection. Resume support is on our roadmap.</p>'
                    },
                    {
                        title: 'How do I know my transfer is secure?',
                        content: '<p>All transfers use WSS (WebSocket Secure), which encrypts the connection with TLS. The server cannot read your file contents.</p>'
                    },
                    {
                        title: 'Can I self-host this?',
                        content: '<p>Yes! The entire project is open source on GitHub. Clone the repository, run the Rust backend with <code>cargo run</code>, and open the frontend in your browser.</p>'
                    }
                ]
            });
            accordion.mount(accordionContainer);
        }
    }

    mount(container) {
        container.appendChild(this.element);
        return this.element;
    }

    destroy() {
        this.element.remove();
    }
}
