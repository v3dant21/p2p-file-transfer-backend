/**
 * HeroSection Component
 * Main landing page hero with headline, subheadline, CTAs, and visual
 */
import { Button } from '../components/Button.js';
import { bus } from '../utils/EventBus.js';

export class HeroSection {
    constructor() {
        this.element = null;
        this.init();
    }

    init() {
        this.render();
    }

    render() {
        this.element = document.createElement('section');
        this.element.className = 'section relative overflow-hidden';
        this.element.id = 'hero';

        this.element.innerHTML = `
            <!-- Background gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-[#667eea] to-[#764ba2] opacity-5"></div>

            <div class="container relative z-10">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-xl items-center">
                    <!-- Text Content -->
                    <div class="text-center md:text-left">
                        <div class="hero-badge mb-lg" data-animate>
                            <span class="badge badge-primary text-xs">
                                No Signup Required • End-to-End Encrypted
                            </span>
                        </div>

                        <h1 class="text-4xl md:text-5xl font-extrabold leading-tight mb-lg" data-animate>
                            Send any file,<br>
                            <span class="text-transparent bg-clip-text bg-gradient-to-r from-[#667eea] to-[#764ba2]">instantly.</span>
                        </h1>

                        <p class="text-lg text-muted leading-relaxed mb-xl" data-animate>
                            Peer-to-peer file transfers directly in your browser.
                            No accounts. No cloud storage. No size limits.
                            Just fast, secure transfers between devices.
                        </p>

                        <div class="flex flex-wrap gap-md justify-center md:justify-start" data-animate>
                            <button class="btn btn-primary btn-lg" id="hero-cta-primary">
                                Start Transferring Free
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="ml-sm">
                                    <path d="m9 18 6-6-6-6"/>
                                </svg>
                            </button>
                            <button class="btn btn-outline btn-lg" id="hero-cta-secondary">
                                See How It Works
                            </button>
                        </div>

                        <div class="mt-xl text-sm text-muted" data-animate>
                            <div class="flex items-center justify-center md:justify-start gap-md">
                                <div class="flex -space-x-2">
                                    <div class="w-6 h-6 rounded-full bg-primary/20 border-2 border-card"></div>
                                    <div class="w-6 h-6 rounded-full bg-accent/20 border-2 border-card"></div>
                                    <div class="w-6 h-6 rounded-full bg-success/20 border-2 border-card"></div>
                                </div>
                                <span>Trusted by <strong>10,000+</strong> transfers</span>
                            </div>
                        </div>
                    </div>

                    <!-- Hero Visual -->
                    <div class="relative" data-animate>
                        <div class="relative mx-auto max-w-lg">
                            <!-- Animated file transfer illustration -->
                            <div class="relative aspect-square">
                                <!-- Floating file cards -->
                                <div class="absolute top-8 left-8 w-20 h-28 bg-card rounded-lg shadow-lg transform -rotate-6 animate-float">
                                    <div class="p-3">
                                        <div class="w-12 h-12 bg-primary/10 rounded-md mb-2 flex items-center justify-center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/>
                                            </svg>
                                        </div>
                                        <div class="h-2 bg-muted/30 rounded w-full mb-1"></div>
                                        <div class="h-2 bg-muted/30 rounded w-3/4"></div>
                                    </div>
                                </div>

                                <div class="absolute bottom-8 right-8 w-20 h-28 bg-card rounded-lg shadow-lg transform rotate-6 animate-float" style="animation-delay: 1s;">
                                    <div class="p-3">
                                        <div class="w-12 h-12 bg-accent/10 rounded-md mb-2 flex items-center justify-center">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/>
                                            </svg>
                                        </div>
                                        <div class="h-2 bg-muted/30 rounded w-full mb-1"></div>
                                        <div class="h-2 bg-muted/30 rounded w-3/4"></div>
                                    </div>
                                </div>

                                <!-- Center connection -->
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <div class="w-24 h-24 bg-primary rounded-full shadow-glow flex items-center justify-center animate-pulse">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-primary-foreground">
                                            <path d="M12 20h.01"/>
                                            <path d="M2 8.82a15 15 0 0 1 20 0"/>
                                            <path d="M5 12.859a10 10 0 0 1 14 0"/>
                                            <path d="M8.5 16.429a5 5 0 0 1 7 0"/>
                                        </svg>
                                    </div>
                                </div>

                                <!-- Connection lines -->
                                <svg class="absolute inset-0 w-full h-full" viewBox="0 0 400 400">
                                    <line x1="100" y1="100" x2="300" y2="300" stroke="url(#gradient)" stroke-width="2" stroke-dasharray="8,4" opacity="0.5">
                                        <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite"/>
                                    </line>
                                    <line x1="300" y1="300" x2="100" y2="100" stroke="url(#gradient)" stroke-width="2" stroke-dasharray="8,4" opacity="0.5">
                                        <animate attributeName="stroke-dashoffset" from="24" to="0" dur="1.5s" repeatCount="indefinite"/>
                                    </line>
                                    <defs>
                                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" style="stop-color:#667eea"/>
                                            <stop offset="100%" style="stop-color:#764ba2"/>
                                        </linearGradient>
                                    </defs>
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Setup CTA button handlers
        const primaryCta = this.element.querySelector('#hero-cta-primary');
        const secondaryCta = this.element.querySelector('#hero-cta-secondary');

        if (primaryCta) {
            primaryCta.addEventListener('click', () => {
                bus.emit('hero:cta-click', { type: 'primary' });
                document.getElementById('transfer-app')?.scrollIntoView({ behavior: 'smooth' });
            });
        }

        if (secondaryCta) {
            secondaryCta.addEventListener('click', () => {
                bus.emit('hero:cta-click', { type: 'secondary' });
                document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
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
