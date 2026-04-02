module.exports = function ({ api, models, Users, Threads, Currencies }) {

    return function ({ event }) {

        const { handleReaction, commands } = global.client;
        const { messageID, threadID } = event;

        const data = handleReaction.find(e => e.messageID == messageID);
        if (!data) return;

        const cmd = commands.get(data.name);
        if (!cmd || !cmd.handleReaction) return;

        try {

            cmd.handleReaction({
                api,
                event,
                models,
                Users,
                Threads,
                Currencies,
                handleReaction: data
            });

        } catch (err) {
            api.sendMessage("❌ Reaction error", threadID, messageID);
        }
    };
};
