module.exports = function ({ api, models, Users, Threads, Currencies }) {

  const stringSimilarity = require('string-similarity');
  const logger = require("../../utils/log.js");
  const moment = require("moment-timezone");

  const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return async function ({ event }) {

    const dateNow = Date.now();
    const time = moment.tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    const { PREFIX, ADMINBOT, NDH, DeveloperMode } = global.config;
    const { userBanned, threadBanned, threadData, commandBanned } = global.data;
    const { commands, cooldowns } = global.client;

    let { body, senderID, threadID, messageID } = event;

    senderID = String(senderID);
    threadID = String(threadID);
    body = body || "";

    const threadSetting = threadData.get(threadID) || {};
    const prefix = threadSetting.PREFIX || PREFIX;

    const prefixRegex = new RegExp(`^(<@!?${senderID}>|${escapeRegex(prefix)})\\s*`);

    // ===== BAN CHECK =====
    if (!ADMINBOT.includes(senderID)) {

      if (userBanned.has(senderID)) {
        return api.sendMessage("🚫 You are banned!", threadID, messageID);
      }

      if (threadBanned.has(threadID)) {
        return api.sendMessage("🚫 This group is banned!", threadID, messageID);
      }
    }

    // ===== PARSE COMMAND =====
    const [matchedPrefix] = body.match(prefixRegex) || [''];
    let args = body.slice(matchedPrefix.length).trim().split(/ +/);
    let commandName = args.shift()?.toLowerCase();

    let command = commands.get(commandName);

    // ===== COMMAND NOT FOUND =====
    if (!command) {

      if (!body.startsWith(prefix)) return;

      const allCommands = Array.from(commands.keys());
      const check = stringSimilarity.findBestMatch(commandName, allCommands);

      if (check.bestMatch.rating >= 0.5) {
        command = commands.get(check.bestMatch.target);
      } else {
        return api.sendMessage(
          `❎ Command not found!\n🔍 Similar: ${check.bestMatch.target}`,
          threadID,
          messageID
        );
      }
    }

    // ===== COMMAND BAN =====
    if (!ADMINBOT.includes(senderID)) {
      const bannedThreadCmd = commandBanned.get(threadID) || [];
      const bannedUserCmd = commandBanned.get(senderID) || [];

      if (bannedThreadCmd.includes(command.config.name)) {
        return api.sendMessage("🚫 Command disabled in this group!", threadID, messageID);
      }

      if (bannedUserCmd.includes(command.config.name)) {
        return api.sendMessage("🚫 You cannot use this command!", threadID, messageID);
      }
    }

    // ===== PERMISSION =====
    let permission = 0;

    if (ADMINBOT.includes(senderID)) permission = 2;
    else if (NDH.includes(senderID)) permission = 3;
    else {
      try {
        const threadInfo = (await Threads.getData(threadID)).threadInfo;
        const isAdmin = threadInfo.adminIDs.some(el => el.id == senderID);
        if (isAdmin) permission = 1;
      } catch {}
    }

    if (command.config.hasPermssion > permission) {
      return api.sendMessage(
        `🚫 You don't have permission to use "${command.config.name}"`,
        threadID,
        messageID
      );
    }

    // ===== COOLDOWN =====
    if (!cooldowns.has(command.config.name)) {
      cooldowns.set(command.config.name, new Map());
    }

    const timestamps = cooldowns.get(command.config.name);
    const cooldownTime = (command.config.cooldowns || 1) * 1000;

    if (timestamps.has(senderID)) {
      const expire = timestamps.get(senderID) + cooldownTime;
      if (dateNow < expire) {
        return api.setMessageReaction("⏳", messageID, () => {}, true);
      }
    }

    // ===== EXECUTE =====
    try {

      command.run({
        api,
        event,
        args,
        models,
        Users,
        Threads,
        Currencies,
        permssion: permission
      });

      timestamps.set(senderID, dateNow);

      if (DeveloperMode) {
        logger(
          `Executed ${commandName} by ${senderID} in ${threadID}`,
          "DEV"
        );
      }

    } catch (err) {
      console.log(err);
      return api.sendMessage(
        `❌ Error while executing command: ${commandName}`,
        threadID,
        messageID
      );
    }

  };
};
