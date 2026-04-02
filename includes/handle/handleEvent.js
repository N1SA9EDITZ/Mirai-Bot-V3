module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");
    const moment = require("moment-timezone");

    return function ({ event }) {

        const time = moment.tz("Asia/Dhaka").format("HH:mm:ss");

        const { userBanned, threadBanned } = global.data;
        const { events } = global.client;

        let { senderID, threadID } = event;

        senderID = String(senderID);
        threadID = String(threadID);

        if (userBanned.has(senderID) || threadBanned.has(threadID)) return;

        for (const [key, value] of events.entries()) {

            if (!value.config?.eventType?.includes(event.logMessageType)) continue;

            try {

                value.run({
                    api,
                    event,
                    models,
                    Users,
                    Threads,
                    Currencies
                });

            } catch (err) {
                logger(`Event error: ${key}`, "error");
            }
        }
    };
};
