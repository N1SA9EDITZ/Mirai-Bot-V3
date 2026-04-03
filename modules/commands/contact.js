module.exports.config = {
    name: "contact",
    version: "1.0.1",
    hasPermssion: 0,
    credits: "N1SA9",
    description: "Share a user's contact in group",
    commandCategory: "Utility",
    usages: "[@mention | reply | uid]",
    cooldowns: 5,
    prefix: false
};

module.exports.run = async function ({
    api,
    event,
    args
}) {
    const { threadID, messageReply, senderID, mentions, type } = event;

    let id;

    try {
        // If user replies to a message
        if (type === "message_reply") {
            id = messageReply.senderID;
        }

        // If user mentions someone
        else if (Object.keys(mentions || {}).length > 0) {
            id = Object.keys(mentions)[0].replace(
                /\&mibextid=ZbWKwL/g,
                ""
            );
        }

        // If user gives UID or profile link
        else if (args[0]) {
            if (isNaN(args[0])) {
                id = await global.utils.getUID(args[0]);
            } else {
                id = args[0];
            }
        }

        // Default to sender
        else {
            id = senderID;
        }

        if (!id)
            return api.sendMessage(
                "❌ Cannot find user ID!",
                threadID,
                event.messageID
            );

        api.shareContact("", id, threadID);

    } catch (e) {
        return api.sendMessage(
            "❌ Error while sharing contact!",
            threadID,
            event.messageID
        );
    }
};
