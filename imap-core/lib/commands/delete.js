'use strict';

const imapTools = require('../imap-tools');

// tag DELETE "mailbox"

module.exports = {
    state: ['Authenticated', 'Selected'],

    schema: [
        {
            name: 'mailbox',
            type: 'string'
        }
    ],

    handler(command, callback) {
        let mailbox = Buffer.from((command.attributes[0] && command.attributes[0].value) || '', 'binary').toString();
        mailbox = imapTools.normalizeMailbox(mailbox, !this.acceptUTF8Enabled);

        // Check if DELETE method is set
        if (typeof this._server.onDelete !== 'function') {
            return callback(null, {
                response: 'NO',
                message: 'DELETE not implemented'
            });
        }

        if (!mailbox) {
            // nothing to check for if mailbox is not defined
            return callback(null, {
                response: 'NO',
                code: 'CANNOT',
                message: 'No folder name given'
            });
        }

        if (mailbox === 'INBOX') {
            // nothing to check for if mailbox is not defined
            return callback(null, {
                response: 'NO',
                code: 'CANNOT',
                message: 'INBOX can not be deleted'
            });
        }

        this._server.onDelete(mailbox, this.session, (err, success) => {
            if (err) {
                return callback(err);
            }

            if (success !== true) {
                return callback(null, {
                    response: 'NO',
                    code: typeof success === 'string' ? success.toUpperCase() : false
                });
            }

            this._server.notifier.fire(this.session.user.username, mailbox, {
                action: 'DELETE',
                mailbox
            });

            callback(null, {
                response: 'OK'
            });
        });
    }
};
