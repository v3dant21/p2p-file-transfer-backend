/**
 * SocialProofBar Component
 * Trust badges and animated counter
 */
import { AnimatedCounter } from '../components/AnimatedCounter.js';

export class SocialProofBar {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'section-alt py-md border-y border-border';

        this.element.innerHTML = `
            <div class="container">
                <div class="flex flex-wrap items-center justify-center gap-xl text-center md:text-left">
                    <!-- Transfer Counter -->
                    <div class="flex flex-col items-center md:items-start" data-animate>
                        <div class="text-3xl font-bold text-primary" id="transfer-counter"></div>
                        <div class="text-sm text-muted">Files Transferred</div>
                    </div>

                    <!-- Divider (hidden on mobile) -->
                    <div class="hidden md:block w-px h-12 bg-border"></div>

                    <!-- Trust Badges -->
                    <div class="flex flex-wrap justify-center gap-lg" data-animate>
                        <div class="flex items-center gap-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <span class="text-sm font-medium">Open Source</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <span class="text-sm font-medium">No Server Storage</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <span class="text-sm font-medium">WebSocket Encrypted</span>
                        </div>
                        <div class="flex items-center gap-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                <path d="M20 6 9 17l-5-5"/>
                            </svg>
                            <span class="text-sm font-medium">Free Forever</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Mount animated counter
        const counterEl = this.element.querySelector('#transfer-counter');
        if (counterEl) {
            const counter = new AnimatedCounter({
                target: 10000,
                suffix: '+',
                duration: 2000
            });
            counter.mount(counterEl);
            counter.start();
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
