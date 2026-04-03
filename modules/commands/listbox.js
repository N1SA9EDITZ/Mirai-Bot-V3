const moment = require("moment-timezone");

module.exports.config = {
    name: "listbox",
    version: "1.0.2",
    credits: "N1SA9",
    hasPermssion: 3,
    description: "Manage bot groups (ban / unban / out)",
    commandCategory: "System",
    usages: "[page/all]",
    cooldowns: 5
};

// ===== BANGLADESH TIME =====
function now() {
    return moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
}

module.exports.handleReply = async function ({ api, event, handleReply, Threads }) {
    if (event.senderID !== handleReply.author) return;

    const { threadID, messageID, body } = event;

    const args = body.split(" ");
    const nums = args.map(n => parseInt(n)).filter(n => !isNaN(n));

    let groupid = handleReply.groupid;
    let groupName = handleReply.groupName;

    const action = args[0]?.toLowerCase();

    // ================= BAN =================
    if (handleReply.type === "reply" && action === "ban") {
        let msg = "";

        for (let num of nums.slice(1)) {
            let id = groupid[num - 1];
            let name = groupName[num - 1];

            if (!id) continue;

            let data = (await Threads.getData(id)).data || {};
            data.banned = true;
            data.dateAdded = now();

            await Threads.setData(id, { data });
            global.data.threadBanned.set(id, { dateAdded: data.dateAdded });

            msg += `🚫 BANNED\n${name}\nID: ${id}\n\n`;

            api.sendMessage("❌ Your group has been banned by admin.", id);
        }

        return api.sendMessage(`✅ BAN COMPLETED\n\n${msg}`, threadID, messageID);
    }

    // ================= UNBAN =================
    if (handleReply.type === "reply" && (action === "unban" || action === "ub")) {
        let msg = "";

        for (let num of nums.slice(1)) {
            let id = groupid[num - 1];
            let name = groupName[num - 1];

            if (!id) continue;

            let data = (await Threads.getData(id)).data || {};
            data.banned = false;
            data.dateAdded = null;

            await Threads.setData(id, { data });
            global.data.threadBanned.delete(id);

            msg += `✅ UNBANNED\n${name}\nID: ${id}\n\n`;

            api.sendMessage("✅ Your group has been unbanned.", id);
        }

        return api.sendMessage(`✅ UNBAN COMPLETED\n\n${msg}`, threadID, messageID);
    }

    // ================= OUT =================
    if (handleReply.type === "reply" && action === "out") {
        let msg = "";

        for (let num of nums.slice(1)) {
            let id = groupid[num - 1];
            let name = groupName[num - 1];

            if (!id) continue;

            await api.removeUserFromGroup(api.getCurrentUserID(), id);

            msg += `🚪 LEFT GROUP\n${name}\nID: ${id}\n\n`;
        }

        return api.sendMessage(`✅ OUT COMPLETED\n\n${msg}`, threadID, messageID);
    }
};

module.exports.run = async function ({ api, event, args }) {
    const allowed = ["100074278195157"];

    if (!allowed.includes(event.senderID)) {
        return api.sendMessage("❌ You don't have permission", event.threadID, event.messageID);
    }

    const inbox = await api.getThreadList(100, null, ["INBOX"]);
    let list = inbox.filter(g => g.isGroup && g.isSubscribed);

    let groups = list.map(g => ({
        id: g.threadID,
        name: g.name || "No Name",
        participants: g.participants?.length || 0,
        messageCount: g.messageCount || 0
    }));

    groups.sort((a, b) => b.participants - a.participants);

    const page = parseInt(args[0]) || 1;
    const limit = 50;

    const start = (page - 1) * limit;
    const end = start + limit;

    let show = groups.slice(start, end);

    let msg = `📋 GROUP LIST (Bangladesh Time)\n🕒 ${now()}\n━━━━━━━━━━━━━━\n`;

    let groupid = [];
    let groupName = [];

    show.forEach((g, i) => {
        msg += `\n${start + i + 1}. ${g.name}\nID: ${g.id}\nMembers: ${g.participants}\nMessages: ${g.messageCount}\n`;

        groupid.push(g.id);
        groupName.push(g.name);
    });

    msg += `\n━━━━━━━━━━━━━━\nPage: ${page}\nReply: ban / unban / out + number`;

    return api.sendMessage(msg, event.threadID, (err, info) => {
        global.client.handleReply.push({
            name: this.config.name,
            messageID: info.messageID,
            author: event.senderID,
            groupid,
            groupName,
            type: "reply"
        });
    });
};
