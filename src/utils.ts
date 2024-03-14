export class Utils {
    /**
     * Allowed client events patterns.
     *
     * @type {string[]}
     */
    protected static _clientEventPatterns: string[] = [
        'client-*',
    ];

    /**
     * Channels and patters for private channels.
     *
     * @type {string[]}
     */
    protected static _privateChannelPatterns: string[] = [
        'private-*',
        'private-encrypted-*',
        'presence-*',
    ];

    /**
     * Channels with patters for caching channels.
     *
     * @type {string[]}
     */
    protected static _cachingChannelPatterns: string[] = [
        'cache-*',
        'private-cache-*',
        'private-encrypted-cache-*',
        'presence-cache-*',
    ];

    /**
     * Get the amount of bytes from given parameters.
     */
    static dataToBytes(...data: any): number {
        return data.reduce((totalBytes, element) => {
            element = typeof element === 'string' ? element : JSON.stringify(element);

            try {
                return totalBytes += Buffer.byteLength(element, 'utf8');
            } catch (e) {
                return totalBytes;
            }
        }, 0);
    }

    /**
     * Get the amount of kilobytes from given parameters.
     */
    static dataToKilobytes(...data: any): number {
        return this.dataToBytes(...data) / 1024;
    }

    /**
     * Get the amount of megabytes from given parameters.
     */
    static dataToMegabytes(...data: any): number {
        return this.dataToKilobytes(...data) / 1024;
    }

    /**
     * Check if the given channel name is private.
     */
    static isPrivateChannel(channel: string): boolean {
        let isPrivate = false;

        this._privateChannelPatterns.forEach(pattern => {
            let regex = new RegExp(pattern.replace('*', '.*'));

            if (regex.test(channel)) {
                isPrivate = true;
            }
        });

        return isPrivate;
    }

    /**
     * Check if the given channel name is a presence channel.
     */
    static isPresenceChannel(channel: string): boolean {
        return channel.lastIndexOf('presence-', 0) === 0;
    }

    /**
     * Check if the given channel name is a encrypted private channel.
     */
    static isEncryptedPrivateChannel(channel: string): boolean {
        return channel.lastIndexOf('private-encrypted-', 0) === 0;
    }

    /**
     * Check if the given channel accepts caching.
     */
    static isCachingChannel(channel: string): boolean {
        let isCachingChannel = false;

        this._cachingChannelPatterns.forEach(pattern => {
            let regex = new RegExp(pattern.replace('*', '.*'));

            if (regex.test(channel)) {
                isCachingChannel = true;
            }
        });

        return isCachingChannel;
    }

    /**
     * Check if client is a client event.
     */
    static isClientEvent(event: string): boolean {
        let isClientEvent = false;

        this._clientEventPatterns.forEach(pattern => {
            let regex = new RegExp(pattern.replace('*', '.*'));

            if (regex.test(event)) {
                isClientEvent = true;
            }
        });

        return isClientEvent;
    }

    /**
     * Check if the channel name is restricted for connections from the client.
     * Read: https://pusher.com/docs/channels/using_channels/channels/#channel-naming-conventions
     */
    static restrictedChannelName(name: string) {
        return /^#?[-a-zA-Z0-9_=@,.;]+$/.test(name) === false;
    }
}
