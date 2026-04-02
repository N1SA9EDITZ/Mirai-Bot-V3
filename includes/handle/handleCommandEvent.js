module.exports = function ({ api, models, Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    return async function ({ event }) {
        const { allowInbox } = global.config;
        const { userBanned, threadBanned } = global.data;
        const { commands, eventRegistered } = global.client;
        const { senderID, threadID, messageID } = event;

        const sender = String(senderID);
        const thread = String(threadID);

        if (userBanned.has(sender) || threadBanned.has(thread) || (allowInbox && sender === thread)) return;

        for (const name of eventRegistered) {
            const cmd = commands.get(name);
            if (!cmd || !cmd.handleEvent) continue;

            try {
                cmd.handleEvent({
                    event,
                    api,
                    models,
                    Users,
                    Threads,
                    Currencies
                });
            } catch (err) {
                logger(`Event error: ${name}`, "error");
            }
        }
    };
};
