const axios = require("axios");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

module.exports = {
    config: {
        name: "note",
        version: "0.0.2",
        hasPermssion: 3,
        credits: "N1SA9",
        description: "Upload / edit file via note API",
        commandCategory: "Admin",
        usages: "[fileName] [url]",
        prefix: false,
        cooldowns: 3
    },

    run: async function (o) {
        const send = (msg) =>
            new Promise(res =>
                o.api.sendMessage(msg, o.event.threadID, (err, info) => res(info), o.event.messageID)
            );

        try {
            const fileName = o.args[0];
            const url = o.event?.messageReply?.args?.[0] || o.args[1];

            if (!fileName) {
                return send("❎ Please provide file name");
            }

            let path = `${__dirname}/${fileName}`;

            // ================= UPLOAD FROM URL =================
            if (url && /^https?:\/\//.test(url)) {
                return send(
                    `🔗 File: ${path}\n\n⚠️ React to confirm replacing content`
                ).then(res => {
                    global.client.handleReaction.push({
                        name: module.exports.config.name,
                        messageID: res.messageID,
                        path,
                        url,
                        action: "replace_file",
                        o
                    });
                });
            }

            // ================= EXPORT FILE =================
            if (!fs.existsSync(path)) {
                return send("❎ File not found");
            }

            const uuid = uuidv4();
            const rawUrl = `https://api.dungkon.id.vn/note/${uuid}`;

            await axios.put(rawUrl, fs.readFileSync(path, "utf8"));

            const viewUrl = `${rawUrl}?view=true`;

            return send(
                `📝 RAW URL:\n${viewUrl}\n\n✏️ EDIT URL:\n${rawUrl}\n\n📁 File: ${fileName}\n\n⚠️ React to upload file again`
            ).then(res => {
                global.client.handleReaction.push({
                    name: module.exports.config.name,
                    messageID: res.messageID,
                    path,
                    url: rawUrl,
                    action: "replace_file",
                    o
                });
            });
        } catch (e) {
            console.error(e);
            return o.api.sendMessage(e.toString(), o.event.threadID, o.event.messageID);
        }
    },

    handleReaction: async function (o) {
        const data = o.handleReaction;

        const send = (msg) =>
            new Promise(res =>
                o.api.sendMessage(msg, o.event.threadID, (err, info) => res(info), o.event.messageID)
            );

        try {
            // security check
            if (o.event.userID !== data.o.event.senderID) return;

            switch (data.action) {

                // ================= REPLACE FILE =================
                case "replace_file": {
                    const content = (await axios.get(data.url, {
                        responseType: "text"
                    })).data;

                    fs.writeFileSync(data.path, content);

                    return send(`✅ File updated successfully\n📁 ${data.path}`);
                }
            }
        } catch (e) {
            console.error(e);
            return o.api.sendMessage(e.toString(), o.event.threadID, o.event.messageID);
        }
    }
};
