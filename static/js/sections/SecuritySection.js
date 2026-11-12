/**
 * SecuritySection Component
 * Architecture diagram and trust points
 */
export class SecuritySection {
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
        this.element.id = 'security';

        this.element.innerHTML = `
            <div class="container">
                <div class="text-center mb-3xl" data-animate>
                    <h2 class="text-3xl font-bold mb-md">Your files, your control</h2>
                    <p class="text-lg text-muted max-w-2xl mx-auto">
                        Built on privacy-first architecture. Here's how it works.
                    </p>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-xl items-center" data-animate>
                    <!-- Diagram -->
                    <div class="card p-lg bg-card" data-animate-child>
                        <h3 class="text-lg font-semibold mb-md text-center">How P2P Transfer Works</h3>
                        <div class="space-y-md font-mono text-sm">
                            <!-- Sender -->
                            <div class="flex items-center gap-md">
                                <div class="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary font-bold">S</div>
                                <div class="flex-1 p-sm bg-secondary rounded">
                                    <div class="text-xs text-muted">Sender Browser</div>
                                    <div class="font-semibold">File Data</div>
                                </div>
                            </div>

                            <!-- Arrow down -->
                            <div class="text-center text-muted">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
                                    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
                                </svg>
                            </div>

                            <!-- WebSocket Server -->
                            <div class="flex items-center gap-md">
                                <div class="w-10 h-10 rounded bg-warning/20 flex items-center justify-center text-warning font-bold">W</div>
                                <div class="flex-1 p-sm bg-secondary rounded">
                                    <div class="text-xs text-muted">WebSocket Server</div>
                                    <div class="font-semibold">Relay Only (No Storage)</div>
                                </div>
                            </div>

                            <!-- Arrow down -->
                            <div class="text-center text-muted">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="mx-auto">
                                    <path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>
                                </svg>
                            </div>

                            <!-- Receiver -->
                            <div class="flex items-center gap-md">
                                <div class="w-10 h-10 rounded bg-success/20 flex items-center justify-center text-success font-bold">R</div>
                                <div class="flex-1 p-sm bg-secondary rounded">
                                    <div class="text-xs text-muted">Receiver Browser</div>
                                    <div class="font-semibold">File Received</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Trust Points -->
                    <div class="space-y-lg" data-animate-child>
                        <div class="flex gap-md">
                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-sm">No Server Storage</h4>
                                <p class="text-sm text-muted">
                                    Files are transferred in real-time through the WebSocket connection.
                                    The server never stores, caches, or logs your data.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-md">
                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-sm">End-to-End Encrypted</h4>
                                <p class="text-sm text-muted">
                                    All data travels over WSS (WebSocket Secure) connections.
                                    The connection is encrypted from sender to receiver.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-md">
                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-sm">Open Source</h4>
                                <p class="text-sm text-muted">
                                    The entire codebase is public on GitHub.
                                    You can audit the code, self-host, or contribute.
                                </p>
                            </div>
                        </div>

                        <div class="flex gap-md">
                            <div class="flex-shrink-0 w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="text-success">
                                    <path d="M20 6 9 17l-5-5"/>
                                </svg>
                            </div>
                            <div>
                                <h4 class="font-semibold mb-sm">No Tracking</h4>
                                <p class="text-sm text-muted">
                                    No cookies, no analytics, no fingerprinting.
                                    We don't know who you are or what you're sending.
                                </p>
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
