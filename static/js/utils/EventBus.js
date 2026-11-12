/**
 * EventBus - Simple pub/sub for vanilla JS component communication
 */
class EventBus {
    constructor() {
        this.events = new Map();
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     * @returns {Function} Unsubscribe function
     */
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
        return () => this.off(event, callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    off(event, callback) {
        if (!this.events.has(event)) return;
        const handlers = this.events.get(event);
        const index = handlers.indexOf(callback);
        if (index > -1) {
            handlers.splice(index, 1);
        }
        if (handlers.length === 0) {
            this.events.delete(event);
        }
    }

    /**
     * Emit an event with data
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    emit(event, data) {
        if (!this.events.has(event)) return;
        // Clone to prevent mutation during iteration
        const handlers = [...this.events.get(event)];
        handlers.forEach(callback => callback(data));
    }

    /**
     * Subscribe once and auto-unsubscribe
     * @param {string} event - Event name
     * @param {Function} callback - Callback function
     */
    once(event, callback) {
        const wrapper = (data) => {
            callback(data);
            this.off(event, wrapper);
        };
        this.on(event, wrapper);
    }

    /**
     * Clear all listeners for an event (or all events)
     * @param {string} [event] - Optional event name
     */
    clear(event) {
        if (event) {
            this.events.delete(event);
        } else {
            this.events.clear();
        }
    }
}

export const bus = new EventBus();
