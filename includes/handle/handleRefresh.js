module.exports = function ({ api, models, Users, Threads, Currencies }) {

    return function ({ event }) {

        if (!event.messageReply) return;

        const { handleReply, commands } = global.client;
        const { threadID, messageID, messageReply } = event;

        const data = handleReply.find(e => e.messageID == messageReply.messageID);
        if (!data) return;

        const cmd = commands.get(data.name);
        if (!cmd || !cmd.handleReply) return;

        try {

            cmd.handleReply({
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReply: data
            });

        } catch (err) {
            api.sendMessage("❌ Reply error", threadID, messageID);
        }
    };
};
