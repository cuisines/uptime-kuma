const NotificationProvider = require("./notification-provider");
const axios = require("axios");
const { DOWN, UP } = require("../../src/util");
const { setting } = require("../util-server");

class Teams extends NotificationProvider {
    name = "teams";

    /**
     * Generate the message to send
     * @param {const} status The status constant
     * @param {string} monitorName Name of monitor
     * @param {string} monitorUrl URL of monitor
     * @param {number} monitorMaxRetries Number of retries before notification
     * @param {number} monitorInterval Time between checks
     * @returns {string} Status message
     */
    _statusMessageFactory = (status, monitorName, monitorUrl, monitorMaxRetries, monitorInterval) => {

        let downtime = (monitorMaxRetries * monitorInterval + monitorInterval) / 60;

        if (status === DOWN) {
            if (downtime === 1) {
                return `🔴 "${monitorName}" (${monitorUrl}) is offline for ${downtime} minute!`;
            } else if (downtime > 0) {
                return `🔴 "${monitorName}" (${monitorUrl}) is offline for ${downtime} minutes!`;
            } else {
                return `🔴 "${monitorName}" (${monitorUrl}) is offline!`;
            }
        } else if (status === UP) {
            return `✅ "${monitorName}" (${monitorUrl}) is back online!`;
        }
        return "Notification";
    };

    /**
     * Select theme color to use based on status
     * @param {const} status The status constant
     * @returns {string} Selected color in hex RGB format
     */
    _getThemeColor = (status) => {
        if (status === DOWN) {
            return "ff0000";
        }
        if (status === UP) {
            return "00e804";
        }
        return "008cff";
    };

    /**
     * Generate payload for notification
     * @param {object} args Method arguments
     * @param {const} args.status The status of the monitor
     * @param {string} args.monitorMessage Message to send
     * @param {string} args.monitorName Name of monitor affected
     * @param {string} args.monitorUrl URL of monitor affected
     * @param {number} args.monitorId ID of monitor affected
     * @param {number} args.monitorMaxRetries Number of retries before notification
     * @param {number} args.monitorInterval Time between checks
     * @returns {object} Notification payload
     */
    _notificationPayloadFactory = async ({
        status,
        monitorMessage,
        monitorName,
        monitorUrl,
        monitorId,
        monitorMaxRetries,
        monitorInterval,
    }) => {
        const notificationMessage = this._statusMessageFactory(
            status,
            monitorName,
            monitorUrl,
            monitorMaxRetries,
            monitorInterval
        );

        const baseURL = await setting("primaryBaseURL");
        const devopsDirectory = await setting("devopsDirectory");

        const actions = [];

        if (baseURL) {
            actions.push({
                "@type": "OpenUri",
                name: "View dashboard",
                targets: [
                    {
                        os: "default",
                        uri: baseURL + "/dashboard",
                    },
                ],
            });

            actions.push({
                "@type": "OpenUri",
                name: "View monitor",
                targets: [
                    {
                        os: "default",
                        uri: baseURL + "/dashboard/" + monitorId,
                    },
                ],
            });
        }

        if (devopsDirectory) {
            if (status === UP) {
                actions.push({
                    "@type": "OpenUri",
                    name: "Search for DevOps Tickets",
                    targets: [
                        {
                            os: "default",
                            uri:
                                "https://dev.azure.com/" + devopsDirectory + "/_workitems/recentlyupdated/",
                        },
                    ],
                });
            }

            if (status === DOWN) {
                actions.push({
                    "@type": "OpenUri",
                    name: "Create DevOps Ticket",
                    targets: [
                        {
                            os: "default",
                            uri:
                                "https://dev.azure.com/" + devopsDirectory + "/_workitems/create/Issue?[System.Title]=" + monitorName + "%20(" + monitorUrl + ")%20is%20down&[System.Description]=" + monitorMessage + "&[System.IterationPath]=" + devopsDirectory,
                        },
                    ],
                });
            }
        }

        return {
            "@context": "https://schema.org/extensions",
            "@type": "MessageCard",
            themeColor: this._getThemeColor(status),
            summary: notificationMessage,
            sections: [
                {
                    activityTitle: notificationMessage,
                    activitySubtitle: "Reason: " + monitorMessage,
                },
            ],
            "potentialAction": actions,
        };
    };

    /**
     * Send the notification
     * @param {string} webhookUrl URL to send the request to
     * @param {object} payload Payload generated by _notificationPayloadFactory
     * @returns {Promise<void>}
     */
    _sendNotification = async (webhookUrl, payload) => {
        await axios.post(webhookUrl, payload);
    };

    /**
     * Send a general notification
     * @param {string} webhookUrl URL to send request to
     * @param {string} msg Message to send
     * @returns {Promise<void>}
     */
    _handleGeneralNotification = async (webhookUrl, msg) => {
        const payload = await this._notificationPayloadFactory({
            monitorMessage: msg
        });

        return this._sendNotification(webhookUrl, payload);
    };

    /**
     * @inheritdoc
     */
    async send(notification, msg, monitorJSON = null, heartbeatJSON = null) {
        const okMsg = "Sent Successfully.";

        try {
            if (heartbeatJSON == null) {
                await this._handleGeneralNotification(notification.webhookUrl, msg);
                return okMsg;
            }

            let url;

            switch (monitorJSON["type"]) {
                case "http":
                case "keywork":
                    url = monitorJSON["url"];
                    break;
                case "docker":
                    url = monitorJSON["docker_host"];
                    break;
                default:
                    url = monitorJSON["hostname"];
                    break;
            }

            const payload = await this._notificationPayloadFactory({
                monitorMessage: heartbeatJSON.msg,
                monitorName: monitorJSON.name,
                monitorUrl: url,
                monitorId: monitorJSON.id,
                monitorMaxRetries: monitorJSON.maxretries,
                monitorInterval: monitorJSON.interval,
                status: heartbeatJSON.status,
            });

            await this._sendNotification(notification.webhookUrl, payload);
            return okMsg;
        } catch (error) {
            this.throwGeneralAxiosError(error);
        }
    }
}

module.exports = Teams;
