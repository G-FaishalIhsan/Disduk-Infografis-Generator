/**
 * Export State Machine & Queue Manager (Phase 9 — Social Export Engine V2)
 * Controls standardized export states, notifications, and concurrency locking.
 * Prevents duplicate clicks and simultaneous export executions.
 */

export const EXPORT_STATES = {
    IDLE: 'idle',
    PREPARING: 'preparing',
    LOADING_TEMPLATE: 'loading-template',
    LOADING_DATASET: 'loading-dataset',
    BINDING: 'binding',
    RENDERING: 'rendering',
    COMPRESSING: 'compressing',
    FINISHED: 'finished',
    ERROR: 'error'
};

export class ExportState {
    constructor() {
        this.currentState = EXPORT_STATES.IDLE;
        this.currentStepText = 'Siap Ekspor';
        this.progressPercent = 0;
        this._isExporting = false;
        this.listeners = new Set();
    }

    /**
     * Checks if an export is currently in progress
     * @returns {boolean}
     */
    get isExporting() {
        return this._isExporting;
    }

    /**
     * Subscribes a listener callback to state changes
     * @param {Function} listener - Callback (state, stepText, percent) => {}
     * @returns {Function} Unsubscribe function
     */
    subscribe(listener) {
        if (typeof listener === 'function') {
            this.listeners.add(listener);
            // Immediately notify listener of current state
            listener(this.currentState, this.currentStepText, this.progressPercent);
        }
        return () => this.listeners.delete(listener);
    }

    /**
     * Requests concurrency lock before starting an export operation
     * @returns {boolean} True if lock acquired, false if another export is running
     */
    acquireLock() {
        if (this._isExporting) {
            console.warn('[ExportState] Request rejected: Export already running.');
            return false;
        }
        this._isExporting = true;
        this.setState(EXPORT_STATES.PREPARING, 'Mempersiapkan ekspor...', 5);
        return true;
    }

    /**
     * Releases concurrency lock and returns state to IDLE or FINISHED
     */
    releaseLock() {
        this._isExporting = false;
    }

    /**
     * Updates current export state and notifies all listeners
     * @param {string} state - Valid state from EXPORT_STATES
     * @param {string} stepText - Human-readable progress description
     * @param {number} percent - Progress percentage (0-100)
     */
    setState(state, stepText = '', percent = 0) {
        this.currentState = state;
        this.currentStepText = stepText || state;
        this.progressPercent = Math.min(Math.max(percent, 0), 100);

        if (state === EXPORT_STATES.FINISHED || state === EXPORT_STATES.ERROR || state === EXPORT_STATES.IDLE) {
            this.releaseLock();
        }

        this.notify();
    }

    /**
     * Resets state back to IDLE
     */
    reset() {
        this.releaseLock();
        this.setState(EXPORT_STATES.IDLE, 'Siap Ekspor', 0);
    }

    /**
     * Notifies all registered listeners
     */
    notify() {
        this.listeners.forEach(listener => {
            try {
                listener(this.currentState, this.currentStepText, this.progressPercent);
            } catch (err) {
                console.error('[ExportState] Listener error:', err);
            }
        });
    }
}

// Global Export State Singleton instance
export const globalExportState = new ExportState();
