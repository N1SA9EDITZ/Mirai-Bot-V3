module.exports.config = {
    name: "rs",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "N1SA9",
    description: "Restart the bot",
    commandCategory: "Admin",
    cooldowns: 0,
    images: []
};

module.exports.run = async function ({ event, api }) {
    try {
        return api.sendMessage(
            "🔄 Restarting bot...",
            event.threadID,
            () => {
                process.exit(1);
            },
            event.messageID
        );
    } catch (e) {
        console.error(e);
        return api.sendMessage(
            "❎ Failed to restart bot",
            event.threadID,
            event.messageID
        );
    }
};
