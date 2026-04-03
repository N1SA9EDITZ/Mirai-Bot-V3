const axios = require("axios");
const stringSimilarity = require("string-similarity");

module.exports.config = {
    name: "help",
    version: "1.1.2",
    hasPermssion: 0,
    credits: "N1SA9",
    description: "Show bot commands and details",
    commandCategory: "General",
    usages: "[command/all]",
    cooldowns: 5,
    images: []
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID: tid, messageID: mid } = event;

    const type = args[0] ? args[0].toLowerCase() : "";
    const cmds = global.client.commands;

    const threadData = global.data.threadData.get(tid) || {};
    const prefix = threadData.PREFIX || global.config.PREFIX;

    const botName = global.config.BOTNAME;
    const version = this.config.version;
    const adminList = global.config.ADMINBOT;

    let msg = "";

    // ===== SHOW ALL COMMANDS =====
    if (type === "all") {
        let i = 0;
        for (const cmd of cmds.values()) {
            msg += `${++i}. ${cmd.config.name}\n→ ${cmd.config.description}\n──────────────────\n`;
        }
        return api.sendMessage(msg, tid, mid);
    }

    // ===== COMMAND DETAIL =====
    if (type) {
        const cmd = cmds.get(type);

        // command not found
        if (!cmd) {
            const allNames = [...cmds.keys()];
            const best = stringSimilarity.findBestMatch(type, allNames);

            if (best.bestMatch.rating >= 0.5) {
                return api.sendMessage(
                    `❎ Command not found: "${type}"\n📌 Did you mean: "${best.bestMatch.target}" ?`,
                    tid,
                    mid
                );
            }

            return api.sendMessage(
                `❎ Command "${type}" not found in system.`,
                tid,
                mid
            );
        }

        const config = cmd.config;
        const images = config.images || [];

        let attachments = [];

        // load images if available
        for (const url of images) {
            try {
                const stream = (
                    await axios.get(url, { responseType: "stream" })
                ).data;
                attachments.push(stream);
            } catch {}
        }

        msg =
`📌 COMMAND INFO
────────────────
🧩 Name: ${config.name}
👤 Author: ${config.credits}
📦 Version: ${config.version}
🔐 Permission: ${formatPerm(config.hasPermssion)}
📝 Description: ${config.description}
📂 Category: ${config.commandCategory}
⌨️ Usage: ${config.usages}
⏱ Cooldown: ${config.cooldowns}s
────────────────
💡 Use ${prefix}help all to see all commands`;

        return api.sendMessage(
            { body: msg, attachment: attachments },
            tid,
            mid
        );
    }

    // ===== GROUPED COMMAND LIST =====
    const categories = {};

    for (const cmd of cmds.values()) {
        const cat = cmd.config.commandCategory || "Other";

        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(cmd.config.name);
    }

    msg += `🤖 BOT COMMAND LIST\n──────────────────\n`;

    for (const cat in categories) {
        msg += `\n📂 ${cat.toUpperCase()}\n→ ${categories[cat].join(", ")}\n`;
    }

    msg +=
`\n──────────────────
📊 Total commands: ${cmds.size}
👑 Admins: ${adminList.length}
🤖 Bot: ${botName}
🔖 Version: ${version}
──────────────────
📌 ${prefix}help <command> - command details
📌 ${prefix}help all - full list`;

    return api.sendMessage(msg, tid, mid);
};

// ===== PERMISSION TEXT =====
function formatPerm(p) {
    return p === 0
        ? "Member"
        : p === 1
        ? "Group Admin"
        : p === 2
        ? "Bot Admin"
        : "Full Access";
}
