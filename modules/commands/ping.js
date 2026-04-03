module.exports.config = {
    name: "ping",
    version: "1.0.6",
    hasPermssion: 1,
    credits: "N1SA9",
    description: "Tag all group members",
    commandCategory: "group",
    usages: "[text]",
    cooldowns: 80
};

module.exports.run = async function ({ api, event, args }) {
    try {
        const botID = api.getCurrentUserID();

        let afkList = [];

        if (
            global.moduleData?.afk?.afkList &&
            typeof global.moduleData.afk.afkList === "object"
        ) {
            afkList = Object.keys(global.moduleData.afk.afkList);
        }

        // get all members
        let listUserID = (event.participantIDs || [])
            .filter(id => id && id !== botID && id !== event.senderID)
            .filter(id => !afkList.includes(id));

        if (listUserID.length === 0) {
            return api.sendMessage("❎ No members to tag", event.threadID, event.messageID);
        }

        const text = args.length > 0
            ? args.join(" ")
            : "📢 You have been mentioned by admin.";

        let mentions = [];

        // FIXED mention system (NO negative index bug)
        let body = text + "\n";

        for (const id of listUserID) {
            mentions.push({
                id,
                tag: "@member"
            });
        }

        return api.sendMessage(
            {
                body,
                mentions
            },
            event.threadID,
            event.messageID
        );

    } catch (e) {
        console.error(e);
        return api.sendMessage("❎ Error in ping command", event.threadID, event.messageID);
    }
};
