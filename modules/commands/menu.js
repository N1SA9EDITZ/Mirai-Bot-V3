module.exports.config = {
    name: 'menu',
    version: '1.1.2',
    hasPermssion: 0,
    credits: 'N1SA9',
    description: 'View command categories and command info',
    commandCategory: 'Box chat',
    usages: '[command name|all]',
    cooldowns: 5,
    images: [],
    envConfig: {
        autoUnsend: {
            status: true,
            timeOut: 60
        }
    }
};

const axios = require("axios");
const moment = require("moment-timezone");
const { findBestMatch } = require("string-similarity");

module.exports.run = async function ({ api, event, args }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid } = event;
    const cmds = global.client.commands;

    const autoUnsend =
        global.config?.menu?.autoUnsend ||
        this.config.envConfig.autoUnsend;

    const url = 'https://files.catbox.moe/amblv9.gif';
    const img = (await axios.get(url, { responseType: "stream" })).data;

    // ✅ BANGLADESH TIME FIX
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss || DD/MM/YYYY");

    // ========== COMMAND DETAIL ==========
    if (args.length >= 1) {
        const cmdName = args.join(" ").toLowerCase();

        if (cmds.has(cmdName)) {
            const body = infoCmds(cmds.get(cmdName).config);
            return send({ body }, tid, mid);
        }

        if (cmdName === "all") {
            let txt = "╭─────────────⭓\n";
            let count = 0;

            for (const cmd of cmds.values()) {
                txt += `│ ${++count}. ${cmd.config.name} | ${cmd.config.description}\n`;
            }

            txt += `\n├────────⭔\n│ ⏳ Auto unsend: ${autoUnsend.timeOut}s\n╰─────────────⭓`;

            return send({ body: txt, attachment: img }, tid, (err, info) => {
                if (autoUnsend.status) {
                    setTimeout(() => un(info.messageID), autoUnsend.timeOut * 1000);
                }
            });
        }

        // ========== SIMILAR COMMAND SEARCH ==========
        const allNames = [...cmds.values()].map(c => c.config.name);
        const similar = findBestMatch(cmdName, allNames);

        if (similar.bestMatch.rating >= 0.3) {
            return send(
                `❎ Not found: "${cmdName}"\n🔎 Did you mean: "${similar.bestMatch.target}" ?`,
                tid,
                mid
            );
        }

        return send(`❎ Command not found: ${cmdName}`, tid, mid);
    }

    // ========== CATEGORY MENU ==========
    const data = commandsGroup();
    let txt = '╭─────────────⭓\n';
    let count = 0;

    for (const item of data) {
        txt += `│ ${++count}. ${item.commandCategory} || ${item.commandsName.length} commands\n`;
    }

    txt += `├────────⭔\n`;
    txt += `│ 📝 Total: ${cmds.size} commands\n`;
    txt += `│ ⏰ Time: ${time}\n`;
    txt += `│ 🔎 Reply 1-${data.length} for details\n`;
    txt += `│ ⏳ Auto unsend: ${autoUnsend.timeOut}s\n`;
    txt += `╰─────────────⭓`;

    return send({ body: txt, attachment: img }, tid, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: sid,
            type: "category",
            data
        });

        if (autoUnsend.status) {
            setTimeout(() => un(info.messageID), autoUnsend.timeOut * 1000);
        }
    });
};

// ================= HANDLE REPLY =================
module.exports.handleReply = async function ({ handleReply: $, api, event }) {
    const { sendMessage: send, unsendMessage: un } = api;
    const { threadID: tid, messageID: mid, senderID: sid, body } = event;

    if (sid !== $.author) {
        return send("⛔ You are not allowed to use this menu", tid, mid);
    }

    const axios = require("axios");
    const url = 'https://files.catbox.moe/amblv9.gif';
    const img = (await axios.get(url, { responseType: "stream" })).data;

    const choice = parseInt(body);

    // ========== CATEGORY SELECT ==========
    if ($.type === "category") {
        const data = $.data[choice - 1];
        if (!data) return send("❎ Invalid number", tid, mid);

        un($.messageID);

        let txt = `╭─────────────⭓\n│ ${data.commandCategory}\n├─────⭔\n`;
        let i = 0;

        for (const name of data.commandsName) {
            const cmdInfo = global.client.commands.get(name).config;
            txt += `│ ${++i}. ${name} | ${cmdInfo.description}\n`;
        }

        txt += `╰─────────────⭓`;

        return send({ body: txt, attachment: img }, tid, (err, info) => {
            global.client.handleReply.push({
                name: this.config.name,
                messageID: info.messageID,
                author: sid,
                type: "command",
                data: data.commandsName
            });

            if (global.config?.menu?.autoUnsend?.status) {
                setTimeout(() => un(info.messageID), 60000);
            }
        });
    }

    // ========== COMMAND INFO ==========
    if ($.type === "command") {
        const cmdName = $.data[choice - 1];
        const cmd = global.client.commands.get(cmdName);

        if (!cmd) return send("❎ Command not found", tid, mid);

        un($.messageID);

        return send(infoCmds(cmd.config), tid, mid);
    }
};

// ================= GROUP COMMANDS =================
function commandsGroup() {
    const array = [];
    const cmds = global.client.commands.values();

    for (const cmd of cmds) {
        const { name, commandCategory } = cmd.config;

        let found = array.find(i => i.commandCategory === commandCategory);

        if (!found) {
            array.push({
                commandCategory,
                commandsName: [name]
            });
        } else {
            found.commandsName.push(name);
        }
    }

    return array.sort((a, b) => b.commandsName.length - a.commandsName.length);
}

// ================= INFO UI =================
function infoCmds(a) {
    return `╭── INFO ────⭓
│ 📔 Name: ${a.name}
│ 🌴 Version: ${a.version}
│ 🔐 Permission: ${permText(a.hasPermssion)}
│ 👤 Author: ${a.credits}
│ 🌾 Description: ${a.description}
│ 📎 Category: ${a.commandCategory}
│ 📝 Usage: ${a.usages}
│ ⏳ Cooldown: ${a.cooldowns}s
╰─────────────⭓`;
}

function permText(p) {
    return p == 0 ? "User" : p == 1 ? "Group Admin" : p == 2 ? "Bot Admin" : "Owner";
}
