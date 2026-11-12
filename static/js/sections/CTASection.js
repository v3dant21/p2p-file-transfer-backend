/**
 * CTASection Component
 * Final call-to-action before footer
 */
export class CTASection {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'section';
        this.element.id = 'cta';

        this.element.innerHTML = `
            <div class="container">
                <div class="text-center" data-animate>
                    <h2 class="text-3xl font-bold mb-md">Ready to send your first file?</h2>
                    <p class="text-lg text-muted mb-xl max-w-2xl mx-auto">
                        Join thousands of users who trust P2P Transfer for fast, private file sharing.
                    </p>
                    <button class="btn btn-primary btn-lg" id="cta-final">
                        Start Transferring Free
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-sm">
                            <path d="m9 18 6-6-6-6"/>
                        </svg>
                    </button>
                    <p class="text-sm text-muted mt-md">No signup required • Free forever • Open source</p>
                </div>
            </div>
        `;

        const cta = this.element.querySelector('#cta-final');
        if (cta) {
            cta.addEventListener('click', () => {
                document.getElementById('transfer-app')?.scrollIntoView({ behavior: 'smooth' });
            });
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
