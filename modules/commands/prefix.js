const moment = require("moment-timezone");

module.exports.config = {
  name: "prefix",
  version: "2.0.2",
  hasPermission: 0,
  credits: "N1SA9",
  description: "Show bot prefix information",
  commandCategory: "system",
  usages: "prefix",
  cooldowns: 0
};

module.exports.handleEvent = async function ({ api, event }) {
  try {
    const { threadID, messageID, body } = event;
    if (!body) return;

    const systemPrefix = global.config?.PREFIX || "/";

    const threadData =
      global.data?.threadData?.get(threadID) || {};

    const prefix = threadData.PREFIX || systemPrefix;

    const text = body.toLowerCase().trim();

    const triggers = [
      "prefix",
      "what is prefix",
      "bot prefix",
      "prefix bot",
      "how to use bot",
      "prefix?"
    ];

    if (!triggers.includes(text)) return;

    return api.sendMessage(
      `📌 PREFIX INFORMATION

✏️ Group Prefix: ${prefix}
📎 System Prefix: ${systemPrefix}

💡 Use: ${prefix}help to see all commands`,
      threadID,
      messageID
    );

  } catch (e) {
    console.error(e);
  }
};

module.exports.run = async function () {};
