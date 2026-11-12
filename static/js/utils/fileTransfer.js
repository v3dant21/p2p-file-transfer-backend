/**
 * Chunked File Transfer - Handles sending and receiving files in chunks via WebSocket
 */
import { bus } from './EventBus.js';
import { wsManager } from './websocket.js';

export class ChunkedTransfer {
    /**
     * Create transfer instance
     * @param {number} chunkSize - Size of chunks in bytes (default: 64KB)
     */
    constructor(chunkSize = 65536) {
        this.chunkSize = chunkSize;
        this.cancelled = false;
        this.senderFile = null;
        this.receivedChunks = [];
        this.fileMetadata = null;
        this.totalBytesReceived = 0;
        this.targetId = null;
    }

    /**
     * Send a file to target
     * @param {File} file - File object
     * @param {string} targetId - Transfer ID
     */
    async send(file, targetId) {
        this.senderFile = file;
        this.targetId = targetId;
        this.cancelled = false;

        // Send file metadata first
        const metadata = {
            type: 'file_info',
            target_id: targetId,
            name: file.name,
            size: file.size,
            mime_type: file.type || 'application/octet-stream'
        };
        wsManager.sendJson(metadata);

        // Read file in chunks
        let offset = 0;
        const fileReader = new FileReader();

        return new Promise((resolve, reject) => {
            fileReader.onload = (e) => {
                if (this.cancelled || !wsManager.isConnected()) {
                    reject(new Error('Transfer cancelled or disconnected'));
                    return;
                }

                const chunk = e.target.result;
                wsManager.sendChunk(this.targetId, chunk);

                offset += chunk.byteLength;
                const progress = Math.min(100, Math.floor((offset / this.senderFile.size) * 100));

                bus.emit('transfer:progress', {
                    progress,
                    offset,
                    total: this.senderFile.size,
                    fileName: this.senderFile.name
                });

                if (offset < this.senderFile.size) {
                    const slice = this.senderFile.slice(offset, offset + this.chunkSize);
                    fileReader.readAsArrayBuffer(slice);
                } else {
                    // Complete
                    wsManager.sendJson({ type: 'transfer_complete', target_id: this.targetId });
                    resolve({
                        bytesSent: offset,
                        duration: null // could calculate
                    });
                }
            };

            fileReader.onerror = (e) => {
                reject(e);
            };

            // Start reading
            const slice = this.senderFile.slice(0, this.chunkSize);
            fileReader.readAsArrayBuffer(slice);
        });
    }

    /**
     * Start receiving (listens to binary from wsManager)
     * @param {string} targetId - Expected transfer ID
     */
    receive(targetId) {
        this.receivedChunks = [];
        this.fileMetadata = null;
        this.totalBytesReceived = 0;
        this.targetId = targetId;

        // Listen for metadata
        const metadataHandler = bus.on('ws:file_info', ({ data }) => {
            this.fileMetadata = data;
            bus.emit('transfer:metadata', {
                name: data.name,
                size: data.size,
                mime_type: data.mime_type
            });
        });

        // Listen for binary chunks
        const binaryHandler = bus.on('ws:binary', ({ data }) => {
            if (!this.fileMetadata) return;

            this.receivedChunks.push(data);
            this.totalBytesReceived += data.byteLength;

            const progress = Math.min(100, Math.floor((this.totalBytesReceived / this.fileMetadata.size) * 100));
            bus.emit('transfer:progress', {
                progress,
                offset: this.totalBytesReceived,
                total: this.fileMetadata.size,
                fileName: this.fileMetadata.name
            });

            if (this.totalBytesReceived >= this.fileMetadata.size) {
                this.completeReceive();
            }
        });

        // Cleanup on complete
        this.cleanup = () => {
            metadataHandler();
            binaryHandler();
        };
    }

    /**
     * Complete the receive and assemble Blob
     */
    completeReceive() {
        if (this.receivedChunks.length === 0) return;
        const blob = new Blob(this.receivedChunks, { type: this.fileMetadata.mime_type || 'application/octet-stream' });
        bus.emit('transfer:complete', {
            blob,
            metadata: this.fileMetadata,
            chunks: this.receivedChunks.length
        });
        this.cleanup();
    }

    /**
     * Cancel transfer
     */
    cancel() {
        this.cancelled = true;
        this.cleanup();
        bus.emit('transfer:cancelled');
    }

    /**
     * Download a blob as a file
     * @param {Blob} blob - Blob to download
     * @param {string} fileName - File name
     */
    downloadBlob(blob, fileName) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        // Use setTimeout to revoke after download is triggered
        setTimeout(() => URL.revokeObjectURL(url), 100);
    }

    /**
     * Reset for new transfer
     */
    reset() {
        this.receivedChunks = [];
        this.fileMetadata = null;
        this.totalBytesReceived = 0;
        this.senderFile = null;
        this.cancelled = false;
    }
}

export const fileTransfer = new ChunkedTransfer();
