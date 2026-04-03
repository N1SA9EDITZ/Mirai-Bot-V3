const fs = require("fs");

module.exports.config = {
  name: "admin",
  version: "1.0.1",
  hasPermssion: 1,
  credits: "N1SA9",
  usePrefix: true,
  description: "Manage bot admins (list/add/remove)",
  commandCategory: "Admin",
  usages: "admin list/add/remove [userID]",
  cooldowns: 2
};

module.exports.run = async function ({ api, event, args }) {
  const configPath = "./config.json";

  let config;
  try {
    config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    return api.sendMessage(
      "❌ Config file error!",
      event.threadID,
      event.messageID
    );
  }

  if (!Array.isArray(config.NDH)) config.NDH = [];

  const admins = config.NDH;

  switch (args[0]) {

    case "list":
      if (admins.length === 0) {
        return api.sendMessage(
          "❌ No admins found.",
          event.threadID,
          event.messageID
        );
      }

      return api.sendMessage(
        "👑 Admin List:\n" + admins.map(id => `- ${id}`).join("\n"),
        event.threadID,
        event.messageID
      );

    case "add": {
      const newAdminID = String(args[1]);

      if (!newAdminID) {
        return api.sendMessage(
          "⚠️ Please provide a user ID to add.",
          event.threadID,
          event.messageID
        );
      }

      if (admins.includes(newAdminID)) {
        return api.sendMessage(
          "⚠️ This user is already an admin.",
          event.threadID,
          event.messageID
        );
      }

      admins.push(newAdminID);
      config.NDH = admins;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return api.sendMessage(
        `✅ Added admin: ${newAdminID}`,
        event.threadID,
        event.messageID
      );
    }

    case "remove": {
      const removeID = String(args[1]);

      if (!removeID) {
        return api.sendMessage(
          "⚠️ Please provide a user ID to remove.",
          event.threadID,
          event.messageID
        );
      }

      if (!admins.includes(removeID)) {
        return api.sendMessage(
          "❌ This user is not an admin.",
          event.threadID,
          event.messageID
        );
      }

      config.NDH = admins.filter(id => id !== removeID);

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      return api.sendMessage(
        `✅ Removed admin: ${removeID}`,
        event.threadID,
        event.messageID
      );
    }

    default:
      return api.sendMessage(
        "📌 Usage:\nadmin list\nadmin add [userID]\nadmin remove [userID]",
        event.threadID,
        event.messageID
      );
  }
};
