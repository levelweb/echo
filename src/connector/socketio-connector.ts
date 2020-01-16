import { Connector } from './connector';
import { SocketIoChannel, SocketIoPrivateChannel, SocketIoPresenceChannel } from './../channel';

/**
 * This class creates a connnector to a Socket.io server.
 */
export class SocketIoConnector extends Connector {
    /**
     * The Socket.io connection instance.
     */
    socket: any;

    /**
     * All of the subscribed channel names.
     */
    channels: any = {};

    /**
     * Create a fresh Socket.io connection.
     */
    connect(): void {
        let io = this.getSocketIO();

        this.socket = io(this.options.host, this.options);

        return this.socket;
    }

    /**
     * Get socket.io module from global scope or options.
     */
    getSocketIO(): any {
        if (typeof this.options.client !== 'undefined') {
            return this.options.client;
        }

        if (typeof io !== 'undefined') {
            return io;
        }

        throw new Error('Socket.io client not found. Should be globally available or passed via options.client');
    }

    /**
     * Listen for an event on a channel instance.
     */
    listen(name: string, event: string, callback: Function): SocketIoChannel {
        return this.channel(name).listen(event, callback);
    }

    /**
     * Get a channel instance by name.
     */
    channel(name: string): SocketIoChannel {
        if (!this.options.keyPrefix + this.channels[name]) {
            this.channels[this.options.keyPrefix + name] = new SocketIoChannel(this.socket, this.options.keyPrefix + name, this.options);
        }

        return this.channels[this.options.keyPrefix + name];
    }

    /**
     * Get a private channel instance by name.
     */
    privateChannel(name: string): SocketIoPrivateChannel {
        if (!this.channels[this.options.keyPrefix + 'private-' + name]) {
            this.channels[this.options.keyPrefix + 'private-' + name] = new SocketIoPrivateChannel(this.socket, this.options.keyPrefix + 'private-' + name, this.options);
        }

        return this.channels[this.options.keyPrefix + 'private-' + name];
    }

    /**
     * Get a presence channel instance by name.
     */
    presenceChannel(name: string): SocketIoPresenceChannel {
        if (!this.channels[this.options.keyPrefix + 'presence-' + name]) {
            this.channels[this.options.keyPrefix + 'presence-' + name] = new SocketIoPresenceChannel(
                this.socket,
                this.options.keyPrefix + 'presence-' + name,
                this.options
            );
        }

        return this.channels[this.options.keyPrefix + 'presence-' + name];
    }

    /**
     * Leave the given channel, as well as its private and presence variants.
     */
    leave(name: string): void {
        let channels = [this.options.keyPrefix + name, this.options.keyPrefix + 'private-' + name, this.options.keyPrefix + 'presence-' + name];

        channels.forEach(name => {
            this.leaveChannel(name);
        });
    }

    /**
     * Leave the given channel.
     */
    leaveChannel(name: string): void {
        if (this.channels[name]) {
            this.channels[name].unsubscribe();

            delete this.channels[name];
        }
    }

    /**
     * Get the socket ID for the connection.
     */
    socketId(): string {
        return this.socket.id;
    }

    /**
     * Disconnect Socketio connection.
     */
    disconnect(): void {
        this.socket.disconnect();
    }
}
