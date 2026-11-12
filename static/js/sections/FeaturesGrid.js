/**
 * FeaturesGrid Component
 * 3-column feature cards
 */
export class FeaturesGrid {
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
        this.element.id = 'features';

        this.element.innerHTML = `
            <div class="container">
                <div class="text-center mb-3xl" data-animate>
                    <h2 class="text-3xl font-bold mb-md">Why P2P Transfer?</h2>
                    <p class="text-lg text-muted max-w-2xl mx-auto">
                        The fastest, most private way to send files between devices.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-lg" data-animate>
                    <!-- Feature 1: Direct Connection -->
                    <div class="card hoverable" data-animate-child>
                        <div class="p-lg">
                            <div class="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-md text-primary">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M12 20h.01"/>
                                    <path d="M2 8.82a15 15 0 0 1 20 0"/>
                                    <path d="M5 12.859a10 10 0 0 1 14 0"/>
                                    <path d="M8.5 16.429a5 5 0 0 1 7 0"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold mb-sm">Direct Connection</h3>
                            <p class="text-muted text-sm leading-relaxed">
                                Files travel straight from your device to theirs.
                                No middleman, no waiting for uploads.
                                Your data never touches a cloud server.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 2: Any Size -->
                    <div class="card hoverable" data-animate-child>
                        <div class="p-lg">
                            <div class="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-md text-accent">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14,2 14,8 20,8"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold mb-sm">Any Size</h3>
                            <p class="text-muted text-sm leading-relaxed">
                                From a photo to a 10GB video.
                                Your browser handles the chunks automatically.
                                No artificial limits or premium tiers.
                            </p>
                        </div>
                    </div>

                    <!-- Feature 3: Privacy First -->
                    <div class="card hoverable" data-animate-child>
                        <div class="p-lg">
                            <div class="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-md text-success">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                            </div>
                            <h3 class="text-lg font-semibold mb-sm">Privacy First</h3>
                            <p class="text-muted text-sm leading-relaxed">
                                We don't store your files.
                                We don't even see them.
                                The server only connects the dots — then forgets.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    mount(container) {
        container.appendChild(this.element);
        return this.element;
    }

    destroy() {
        this.element.remove();
    }
}
