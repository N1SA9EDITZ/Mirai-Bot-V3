module.exports.config = {
    name: "leaveNoti",
    eventType: ["log:unsubscribe"],
    version: "2.0.0",
    credits: "N1SA9",
    description: "Notify when a user leaves the group",
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
};

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = require("fs-extra");
    const { join } = require("path");

    const path = join(__dirname, "cache", "leaveGif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    const path2 = join(__dirname, "cache", "leaveGif", "randomgif");
    if (!existsSync(path2)) mkdirSync(path2, { recursive: true });
};

module.exports.run = async function ({ api, event, Users }) {
    try {
        const { threadID } = event;
        const iduser = event.logMessageData.leftParticipantFbId;

        if (iduser == api.getCurrentUserID()) return;

        const moment = require("moment-timezone");
        const time = moment.tz("Asia/Dhaka").format("DD/MM/YYYY || HH:mm:ss");

        const userData = await Users.getData(event.author);
        const nameAuthor = userData?.name || "Admin";
        const name = global.data.userName.get(iduser) || await Users.getNameUser(iduser);

        const type = (event.author == iduser)
            ? "left the group 😢"
            : `was removed by ${nameAuthor} ❌`;

        let msg =
`💔 Goodbye ${name}

📌 ${type}

🕒 Time: ${time}
🔗 https://www.facebook.com/profile.php?id=${iduser}

✨ Kurumi will miss you...`;

        return api.sendMessage(msg, threadID);

    } catch (e) {
        console.log(e);
    }
};
