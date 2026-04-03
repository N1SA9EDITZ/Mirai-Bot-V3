module.exports.config = {
    name: "qtv",
    version: "1.0.3",
    hasPermssion: 1,
    credits: "N1SA9",
    description: "Add or remove group admin",
    commandCategory: "group",
    usages: "admin add/remove [tag or reply]",
    cooldowns: 5
};

module.exports.run = async function ({ event, api, args, Users, Threads }) {
    try {
        if (!args[0]) {
            return api.sendMessage(
                "⚠️ Usage: admin add OR admin remove [tag/reply]",
                event.threadID,
                event.messageID
            );
        }

        const threadInfo = (await Threads.getData(event.threadID)).threadInfo;

        const isBotAdmin = threadInfo.adminIDs.some(i => i.id == api.getCurrentUserID());
        const isUserAdmin = threadInfo.adminIDs.some(i => i.id == event.senderID);

        if (!isBotAdmin && !isUserAdmin) {
            return api.sendMessage(
                "❎ You don't have permission to use this command",
                event.threadID,
                event.messageID
            );
        }

        let targetID;

        // ================= GET TARGET USER =================
        if (event.type === "message_reply") {
            targetID = event.messageReply.senderID;
        } else if (Object.keys(event.mentions || {}).length > 0) {
            targetID = Object.keys(event.mentions)[0];
        } else {
            targetID = event.senderID;
        }

        const type = args[0].toLowerCase();

        if (type !== "add" && type !== "remove") {
            return api.sendMessage(
                "⚠️ Invalid command. Use: admin add OR admin remove",
                event.threadID,
                event.messageID
            );
        }

        return api.sendMessage(
            "📌 React to confirm admin action",
            event.threadID,
            (err, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    type,
                    messageID: info.messageID,
                    author: event.senderID,
                    userID: targetID,
                    threadID: event.threadID
                });
            }
        );

    } catch (e) {
        console.error(e);
        return api.sendMessage(
            "❎ Error occurred",
            event.threadID,
            event.messageID
        );
    }
};

// ================= HANDLE REACTION =================
module.exports.handleReaction = async function ({ event, api, handleReaction, Users }) {
    try {
        if (event.userID !== handleReaction.author) return;

        const name = (await Users.getData(handleReaction.userID)).name;

        const isAdd = handleReaction.type === "add";

        api.changeAdminStatus(
            handleReaction.threadID,
            handleReaction.userID,
            isAdd,
            (err) => {
                if (err) {
                    return api.sendMessage(
                        "❎ Bot does not have permission to change admin status",
                        handleReaction.threadID
                    );
                }

                return api.sendMessage(
                    isAdd
                        ? `✅ Successfully added ${name} as ADMIN`
                        : `✅ Successfully removed ADMIN role from ${name}`,
                    handleReaction.threadID
                );
            }
        );

    } catch (e) {
        console.error(e);
    }
};
