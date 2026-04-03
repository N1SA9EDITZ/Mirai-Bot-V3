module.exports = {
    config: {
        name: "uid",
        version: "1.0.1",
        hasPermssion: 0,
        credits: "N1SA9",
        description: "Get user ID",
        commandCategory: "Tools",
        cooldowns: 0,
        images: []
    },

    run: async function({ api, event, args }) {

        // 👉 Reply case
        if (event.type === "message_reply") {
            const uid = event.messageReply.senderID;
            return api.sendMessage(`${uid}`, event.threadID, event.messageID);
        }

        // 👉 No args = your UID
        if (!args[0]) {
            return api.sendMessage(`${event.senderID}`, event.threadID, event.messageID);
        }

        // 👉 Link case
        if (args[0].includes(".com/")) {
            try {
                const res_ID = await api.getUID(args[0]);
                return api.sendMessage(`${res_ID}`, event.threadID, event.messageID);
            } catch (error) {
                return api.sendMessage(`❌ Unable to get UID from this link!`, event.threadID, event.messageID);
            }
        }

        // 👉 Mention case
        if (Object.keys(event.mentions).length > 0) {
            let msg = "";
            for (const [id, name] of Object.entries(event.mentions)) {
                msg += `${name.replace('@', '')}: ${id}\n`;
            }
            return api.sendMessage(msg.trim(), event.threadID, event.messageID);
        }

        // 👉 Fallback
        return api.sendMessage(`⚠️ Invalid input!`, event.threadID, event.messageID);
    },

    handleEvent: async ({ api, event }) => {
        if (!event.body) return;

        const bodyLower = event.body.toLowerCase().trim();

        // 👉 Auto trigger "uid"
        if (bodyLower === "uid") {
            await module.exports.run({ api, event, args: [] });
        }
    }
};
