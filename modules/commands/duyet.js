const fs = require("fs");
const path = require("path");

module.exports.config = {
  name: "duyet",
  version: "1.0.3",
  hasPermssion: 2,
  credits: "N1SA9",
  description: "Approve or manage bot groups",
  commandCategory: "Admin",
  cooldowns: 5,
  prefix: true
};

const dataPath = path.resolve(__dirname, "../../utils/data/approvedThreads.json");
const pendingPath = path.resolve(__dirname, "../../utils/data/pendingThreads.json");

// Ensure JSON files exist
function loadJSON(file, fallback = []) {
  try {
    if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(fallback, null, 2));
    return JSON.parse(fs.readFileSync(file));
  } catch {
    return fallback;
  }
}

function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

module.exports.handleReply = async function ({ event, api, handleReply }) {
  if (handleReply.author !== event.senderID) return;

  const { body, threadID, messageID } = event;

  let approved = loadJSON(dataPath);
  let pending = loadJSON(pendingPath);

  // ===== APPROVE PENDING =====
  if (handleReply.type === "pending") {
    if (body.trim().toLowerCase() === "all") {
      approved = approved.concat(pending);
      saveJSON(dataPath, approved);
      saveJSON(pendingPath, []);

      for (const id of pending) {
        api.sendMessage(
          "✅ Your group has been approved!\nEnjoy using the bot 🚀",
          id
        );
      }

      return api.sendMessage(
        `✅ Approved all groups: ${pending.length}`,
        threadID,
        messageID
      );
    }

    const nums = body
      .split(" ")
      .map(n => parseInt(n))
      .filter(n => !isNaN(n));

    let count = 0;

    for (const num of nums) {
      const index = num - 1;
      if (index >= 0 && index < pending.length) {
        const id = pending[index];

        approved.push(id);
        pending.splice(index, 1);

        api.sendMessage(
          "✅ Your group has been approved!\nEnjoy using the bot 🚀",
          id
        );

        count++;
      }
    }

    saveJSON(dataPath, approved);
    saveJSON(pendingPath, pending);

    return api.sendMessage(
      count > 0
        ? `✅ Successfully approved ${count} group(s)`
        : "❎ Invalid selection",
      threadID,
      messageID
    );
  }

  // ===== REMOVE APPROVED =====
  if (handleReply.type === "remove") {
    const indexes = body
      .split(" ")
      .map(n => parseInt(n) - 1)
      .filter(i => !isNaN(i));

    let removed = [];

    for (const i of indexes) {
      if (approved[i]) {
        removed.push(approved[i]);
        await api.removeUserFromGroup(api.getCurrentUserID(), approved[i]);
        approved[i] = null;
      }
    }

    approved = approved.filter(Boolean);
    saveJSON(dataPath, approved);

    return api.sendMessage(
      removed.length
        ? `✅ Removed groups:\n${removed.join("\n")}`
        : "❎ No valid group selected",
      threadID,
      messageID
    );
  }
};

module.exports.run = async function ({ event, api, args, Threads }) {
  const { threadID, messageID } = event;

  let approved = loadJSON(dataPath);
  let pending = loadJSON(pendingPath);

  const idBox = args[0] || threadID;

  // ===== LIST APPROVED =====
  if (args[0] === "list" || args[0] === "l") {
    let msg = "📌 Approved Groups:\n";

    for (let i = 0; i < approved.length; i++) {
      const id = approved[i];
      const info = await Threads.getData(id);
      const name = info?.threadInfo?.name || "Unknown";

      msg += `\n${i + 1}. ${name}\nID: ${id}`;
    }

    return api.sendMessage(msg, threadID, messageID);
  }

  // ===== LIST PENDING =====
  if (args[0] === "pending" || args[0] === "p") {
    let msg = "📌 Pending Groups:\n";

    for (let i = 0; i < pending.length; i++) {
      const id = pending[i];
      const info = await Threads.getData(id);
      const name = info?.threadInfo?.threadName || "Unknown";

      msg += `\n${i + 1}. ${name}\nID: ${id}`;
    }

    return api.sendMessage(msg, threadID, messageID);
  }

  // ===== HELP =====
  if (args[0] === "help" || args[0] === "h") {
    const prefix =
      (await Threads.getData(String(threadID))).data.PREFIX ||
      global.config.PREFIX;

    return api.sendMessage(
      `📌 DUYET COMMAND HELP\n\n` +
        `${prefix}duyet list -> show approved groups\n` +
        `${prefix}duyet pending -> show pending groups\n` +
        `${prefix}duyet del <id> -> remove group\n` +
        `${prefix}duyet <id> -> approve group`,
      threadID,
      messageID
    );
  }

  // ===== DELETE GROUP =====
  if (args[0] === "del" || args[0] === "d") {
    const id = args[1] || threadID;

    if (!approved.includes(id)) {
      return api.sendMessage("❎ Group not approved", threadID, messageID);
    }

    approved = approved.filter(x => x !== id);
    saveJSON(dataPath, approved);

    await api.removeUserFromGroup(api.getCurrentUserID(), id);

    return api.sendMessage(
      `✅ Removed group: ${id}`,
      threadID,
      messageID
    );
  }

  // ===== APPROVE GROUP =====
  if (isNaN(parseInt(idBox))) {
    return api.sendMessage("❎ Invalid ID", threadID, messageID);
  }

  if (approved.includes(idBox)) {
    return api.sendMessage("❎ Already approved", threadID, messageID);
  }

  approved.push(idBox);
  pending = pending.filter(id => id !== idBox);

  saveJSON(dataPath, approved);
  saveJSON(pendingPath, pending);

  api.sendMessage(
    "✅ Your group has been approved!\nEnjoy using the bot 🚀",
    idBox
  );

  return api.sendMessage(
    `✅ Approved group: ${idBox}`,
    threadID,
    messageID
  );
};
