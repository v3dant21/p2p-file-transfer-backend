/**
 * HowItWorks Component
 * 3-step vertical timeline
 */
export class HowItWorks {
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
        this.element.id = 'how-it-works';

        this.element.innerHTML = `
            <div class="container">
                <div class="text-center mb-3xl" data-animate>
                    <h2 class="text-3xl font-bold mb-md">Three clicks. One transfer.</h2>
                    <p class="text-lg text-muted max-w-2xl mx-auto">
                        Sending files has never been this simple.
                    </p>
                </div>

                <div class="max-w-3xl mx-auto">
                    <div class="relative">
                        <!-- Vertical line -->
                        <div class="absolute left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2 hidden md:block"></div>

                        <div class="space-y-2xl">
                            <!-- Step 1 -->
                            <div class="relative flex flex-col md:flex-row items-center gap-lg" data-animate-child>
                                <div class="md:w-1/2 md:text-right md:pr-xl">
                                    <div class="flex items-center justify-center md:justify-end gap-md mb-sm">
                                        <div class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
                                        <h3 class="text-xl font-semibold">Drop</h3>
                                    </div>
                                    <p class="text-muted">
                                        Drag your file into the browser or click to browse.
                                        Supports any file type and size.
                                    </p>
                                </div>
                                <div class="hidden md:block w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 relative z-10"></div>
                                <div class="md:w-1/2 md:pl-xl">
                                    <div class="card p-lg bg-card">
                                        <div class="w-full h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17,8 12,3 7,8"/><line x1="12" x2="12" y1="3" y2="15"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 2 -->
                            <div class="relative flex flex-col md:flex-row-reverse items-center gap-lg" data-animate-child>
                                <div class="md:w-1/2 md:text-left md:pl-xl">
                                    <div class="flex items-center gap-md mb-sm">
                                        <div class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
                                        <h3 class="text-xl font-semibold">Share</h3>
                                    </div>
                                    <p class="text-muted">
                                        Copy the auto-generated secure link.
                                        Send it via text, email, or chat.
                                    </p>
                                </div>
                                <div class="hidden md:block w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 relative z-10"></div>
                                <div class="md:w-1/2 md:pr-xl">
                                    <div class="card p-lg bg-card">
                                        <div class="w-full h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted">
                                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Step 3 -->
                            <div class="relative flex flex-col md:flex-row items-center gap-lg" data-animate-child>
                                <div class="md:w-1/2 md:text-right md:pr-xl">
                                    <div class="flex items-center justify-center md:justify-end gap-md mb-sm">
                                        <div class="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
                                        <h3 class="text-xl font-semibold">Receive</h3>
                                    </div>
                                    <p class="text-muted">
                                        Recipient opens the link and receives the file instantly.
                                        No signup, no download, no waiting.
                                    </p>
                                </div>
                                <div class="hidden md:block w-12 h-12 rounded-full bg-primary/10 flex-shrink-0 relative z-10"></div>
                                <div class="md:w-1/2 md:pl-xl">
                                    <div class="card p-lg bg-card">
                                        <div class="w-full h-32 bg-muted/20 rounded-lg flex items-center justify-center">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-muted">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" x2="12" y1="15" y2="3"/>
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
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
