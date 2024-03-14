import { App, AppInterface } from '../app';
import { JoinResponse, PublicChannelManager } from './public-channel-manager';
import { PusherMessage } from '../message';
import { WebSocket } from 'uWebSockets.js';

const Pusher = require('pusher');

export class PrivateChannelManager extends PublicChannelManager {
    /**
     * Join the connection to the channel.
     */
    join(ws: WebSocket<AppInterface>, channel: string, message?: PusherMessage): Promise<JoinResponse> {
        let passedSignature = message?.data?.auth;

        return this.signatureIsValid(ws.app, ws.id, message, passedSignature).then(isValid => {
            if (!isValid) {
                return {
                    ws,
                    success: false,
                    errorCode: 4009,
                    errorMessage: 'The connection is unauthorized.',
                    authError: true,
                    type: 'AuthError',
                };
            }

            return super.join(ws, channel, message).then(joinResponse => {
                // If the users joined to a private channel with authentication,
                // proceed clearing the authentication timeout.
                if (joinResponse.success && ws.userAuthenticationTimeout) {
                    clearTimeout(ws.userAuthenticationTimeout);
                }

                return joinResponse;
            });
        });
    }

    /**
     * Check is an incoming connection can subscribe.
     */
    protected signatureIsValid(app: App, socketId: string, message: PusherMessage, signatureToCheck: string): Promise<boolean> {
        return this.getExpectedSignature(app, socketId, message).then(expectedSignature => {
            return signatureToCheck === expectedSignature;
        });
    }

    /**
     * Get the signed token from the given message, by the Socket.
     */
    protected getExpectedSignature(app: App, socketId: string, message: PusherMessage): Promise<string> {
        return new Promise(resolve => {
            let token = new Pusher.Token(app.key, app.secret);

            resolve(
                app.key + ':' + token.sign(this.getDataToSignForSignature(socketId, message))
            );
        });
    }

    /**
     * Get the data to sign for the token for specific channel.
     */
    protected getDataToSignForSignature(socketId: string, message: PusherMessage): string {
        return `${socketId}:${message.data.channel}`;
    }
}
