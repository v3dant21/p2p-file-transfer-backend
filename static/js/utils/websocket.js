/**
 * WebSocket Manager - Handles connection lifecycle, message routing, and reconnection
 */
import { bus } from './EventBus.js';
import { getWebSocketUrl, safeJsonParse } from './helpers.js';

export class WebSocketManager {
    /**
     * Create a WebSocket manager
     * @param {string} [url] - WebSocket URL (defaults to auto-detected)
     */
    constructor(url = getWebSocketUrl()) {
        this.url = url;
        this.socket = null;
        this.role = null; // 'sender' or 'receiver'
        this.connectionId = null;
        this.reconnectAttempts = 0;
        this.maxReconnects = 3;
        this.reconnectDelay = 1000; // ms
        this.isIntentionallyClosed = false;

        // Event handlers registry
        this.handlers = new Map();
    }

    /**
     * Connect to WebSocket server
     * @param {string} role - 'sender' or 'receiver'
     * @param {string} connectionId - Transfer ID for pairing
     */
    connect(role, connectionId) {
        this.role = role;
        this.connectionId = connectionId;
        this.isIntentionallyClosed = false;

        try {
            this.socket = new WebSocket(this.url);
            this.setupSocketEvents();
        } catch (error) {
            bus.emit('ws:error', { message: 'Failed to create WebSocket connection', error });
        }
    }

    /**
     * Setup WebSocket event handlers
     */
    setupSocketEvents() {
        this.socket.onopen = () => {
            this.reconnectAttempts = 0;
            console.log('[WS] Connected, registering as', this.role);
            this.register();
            bus.emit('ws:connected', { role: this.role });
        };

        this.socket.onmessage = (event) => {
            if (typeof event.data === 'string') {
                const data = safeJsonParse(event.data);
                if (data) {
                    this.handleMessage(data);
                }
            } else {
                // Binary data — emit raw for transfer handling
                bus.emit('ws:binary', { data: event.data, role: this.role });
            }
        };

        this.socket.onclose = () => {
            bus.emit('ws:disconnected', { role: this.role });
            if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnects) {
                this.attemptReconnect();
            } else if (this.reconnectAttempts >= this.maxReconnects) {
                bus.emit('ws:reconnect-failed', { role: this.role });
            }
        };

        this.socket.onerror = (error) => {
            console.error('[WS] Error:', error);
            bus.emit('ws:error', { message: 'WebSocket error', error });
        };
    }

    /**
     * Register with server
     */
    register() {
        const message = {
            type: 'register',
            connectionId: this.connectionId,
            role: this.role
        };
        this.sendJson(message);
    }

    /**
     * Handle JSON message
     * @param {Object} data - Parsed JSON data
     */
    handleMessage(data) {
        console.log('[WS] Received:', data);
        // Emit specific event by type, with data
        bus.emit(`ws:${data.type}`, { data, role: this.role });
    }

    /**
     * Send JSON message
     * @param {Object} data - Data to send
     */
    sendJson(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(JSON.stringify(data));
        } else {
            console.warn('[WS] Cannot send, socket not open');
        }
    }

    /**
     * Send binary data
     * @param {ArrayBuffer} data - Binary data to send
     */
    sendBinary(data) {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
            this.socket.send(data);
        }
    }

    /**
     * Send target_id then binary (protocol for file chunks)
     * @param {string} targetId - Transfer ID
     * @param {ArrayBuffer} chunk - Binary chunk
     */
    sendChunk(targetId, chunk) {
        this.sendJson({ target_id: targetId });
        this.sendBinary(chunk);
    }

    /**
     * Attempt reconnection with exponential backoff
     */
    attemptReconnect() {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnects})`);
        setTimeout(() => {
            if (!this.isIntentionallyClosed) {
                this.connect(this.role, this.connectionId);
            }
        }, delay);
    }

    /**
     * Close connection intentionally
     */
    close() {
        this.isIntentionallyClosed = true;
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }

    /**
     * Get current connection state
     * @returns {number} readyState
     */
    getState() {
        return this.socket ? this.socket.readyState : WebSocket.CLOSED;
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.getState() === WebSocket.OPEN;
    }
}

export const wsManager = new WebSocketManager();
