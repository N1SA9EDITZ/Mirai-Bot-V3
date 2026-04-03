module.exports.config = {
  name: "anti",
  version: "4.1.6",
  hasPermssion: 1,
  credits: "N1SA9",
  description: "Anti group change protection system",
  commandCategory: "Box chat",
  usages: "anti (reply options)",
  cooldowns: 5,
  dependencies: {
    "fs-extra": ""
  }
};

const {
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  unlinkSync
} = require("fs-extra");

const path = require("path");
const fs = require("fs");
const axios = require("axios");

module.exports.handleReply = async function ({
  api,
  event,
  args,
  handleReply,
  Threads
}) {
  const { senderID, threadID, messageID } = event;
  const { author, permssion } = handleReply;

  const time = require("moment-timezone")
    .tz("Asia/Ho_Chi_Minh")
    .format("HH:mm:ss || DD/MM/YYYY");

  const pathData = global.anti;
  const dataAnti = JSON.parse(readFileSync(pathData, "utf8"));

  if (author !== senderID)
    return api.sendMessage(
      "❎ You are not allowed to use this command.",
      threadID,
      messageID
    );

  const number = (event.body || "").match(/\d+/g);

  if (!number) return;

  for (const num of number) {
    switch (num) {

      // ================= NAME BOX =================
      case "1": {
        if (permssion < 1)
          return api.sendMessage(
            "⚠️ You don't have permission.",
            threadID,
            messageID
          );

        const exist = dataAnti.boxname.find(i => i.threadID === threadID);

        if (exist) {
          dataAnti.boxname = dataAnti.boxname.filter(
            i => i.threadID !== threadID
          );

          api.sendMessage(
            "☑️ Anti group name change DISABLED",
            threadID,
            messageID
          );
        } else {
          const threadName = (await api.getThreadInfo(threadID)).threadName;

          dataAnti.boxname.push({
            threadID,
            name: threadName
          });

          api.sendMessage(
            "☑️ Anti group name change ENABLED",
            threadID,
            messageID
          );
        }

        writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
        break;
      }

      // ================= BOX IMAGE =================
      case "2": {
        if (permssion < 1)
          return api.sendMessage(
            "⚠️ You don't have permission.",
            threadID,
            messageID
          );

        const exist = dataAnti.boximage.find(i => i.threadID === threadID);

        if (exist) {
          dataAnti.boximage = dataAnti.boximage.filter(
            i => i.threadID !== threadID
          );

          api.sendMessage(
            "☑️ Anti group image change DISABLED",
            threadID,
            messageID
          );
        } else {
          const info = await api.getThreadInfo(threadID);
          const url = info.imageSrc;

          let response = await global.api.imgur(url);

          dataAnti.boximage.push({
            threadID,
            url: response.link
          });

          api.sendMessage(
            "☑️ Anti group image change ENABLED",
            threadID,
            messageID
          );
        }

        writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
        break;
      }

      // ================= NICKNAME =================
      case "3": {
        if (permssion < 1)
          return api.sendMessage(
            "⚠️ You don't have permission.",
            threadID,
            messageID
          );

        const exist = dataAnti.antiNickname.find(
          i => i.threadID === threadID
        );

        if (exist) {
          dataAnti.antiNickname = dataAnti.antiNickname.filter(
            i => i.threadID !== threadID
          );

          api.sendMessage(
            "☑️ Anti nickname change DISABLED",
            threadID,
            messageID
          );
        } else {
          const nickName = (await api.getThreadInfo(threadID)).nicknames;

          dataAnti.antiNickname.push({
            threadID,
            data: nickName
          });

          api.sendMessage(
            "☑️ Anti nickname change ENABLED",
            threadID,
            messageID
          );
        }

        writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
        break;
      }

      // ================= ANTI OUT =================
      case "4": {
        if (permssion < 1)
          return api.sendMessage(
            "⚠️ You don't have permission.",
            threadID,
            messageID
          );

        dataAnti.antiout[threadID] = !dataAnti.antiout[threadID];

        api.sendMessage(
          `☑️ Anti-out ${dataAnti.antiout[threadID] ? "ENABLED" : "DISABLED"}`,
          threadID,
          messageID
        );

        writeFileSync(pathData, JSON.stringify(dataAnti, null, 4));
        break;
      }

      // ================= EMOJI =================
      case "5": {
        const filepath = path.join(__dirname, "data", "antiemoji.json");
        let data = JSON.parse(fs.readFileSync(filepath, "utf8"));

        let emoji = "";
        try {
          let info = await api.getThreadInfo(threadID);
          emoji = info.emoji;
        } catch {}

        if (!data[threadID]) {
          data[threadID] = {
            emoji,
            emojiEnabled: true
          };
        } else {
          data[threadID].emojiEnabled = !data[threadID].emojiEnabled;

          if (data[threadID].emojiEnabled) {
            data[threadID].emoji = emoji;
          }
        }

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

        api.sendMessage(
          `☑️ Anti emoji ${data[threadID].emojiEnabled ? "ENABLED" : "DISABLED"}`,
          threadID,
          messageID
        );
        break;
      }

      // ================= THEME =================
      case "6": {
        const filepath = path.join(__dirname, "data", "antitheme.json");
        let data = JSON.parse(fs.readFileSync(filepath, "utf8"));

        let theme = "";
        try {
          const info = await Threads.getInfo(threadID);
          theme = info.threadTheme.id;
        } catch {}

        if (!data[threadID]) {
          data[threadID] = {
            themeid: theme,
            themeEnabled: true
          };
        } else {
          data[threadID].themeEnabled = !data[threadID].themeEnabled;

          if (data[threadID].themeEnabled) {
            data[threadID].themeid = theme;
          }
        }

        fs.writeFileSync(filepath, JSON.stringify(data, null, 2));

        api.sendMessage(
          `☑️ Anti theme ${data[threadID].themeEnabled ? "ENABLED" : "DISABLED"}`,
          threadID,
          messageID
        );
        break;
      }

      // ================= QTV =================
      case "7": {
        const file = __dirname + "/data/antiqtv.json";

        const info = await api.getThreadInfo(threadID);

        if (
          !info.adminIDs.some(i => i.id == api.getCurrentUserID())
        )
          return api.sendMessage(
            "❎ Bot needs admin permission.",
            threadID,
            messageID
          );

        let data = JSON.parse(fs.readFileSync(file));

        data[threadID] = !data[threadID];

        fs.writeFileSync(file, JSON.stringify(data, null, 4));

        api.sendMessage(
          `☑️ Anti QTV ${data[threadID] ? "ENABLED" : "DISABLED"}`,
          threadID,
          messageID
        );
        break;
      }

      // ================= STATUS CHECK =================
      case "9": {
        const antiImage = dataAnti.boximage.find(
          i => i.threadID === threadID
        );
        const antiBoxname = dataAnti.boxname.find(
          i => i.threadID === threadID
        );
        const antiNickname = dataAnti.antiNickname.find(
          i => i.threadID === threadID
        );

        return api.sendMessage(
          `[ ANTI STATUS ]\n` +
            `1. Name: ${antiBoxname ? "ON" : "OFF"}\n` +
            `2. Image: ${antiImage ? "ON" : "OFF"}\n` +
            `3. Nickname: ${antiNickname ? "ON" : "OFF"}\n` +
            `4. Anti-out: ${dataAnti.antiout[threadID] ? "ON" : "OFF"}`,
          threadID
        );
      }

      default:
        return api.sendMessage(
          "❎ Invalid option selected.",
          threadID
        );
    }
  }
};

// ================= MAIN MENU =================
module.exports.run = async ({ api, event, Threads }) => {
  const { threadID, messageID, senderID } = event;

  return api.sendMessage(
    `╭───── ANTI SYSTEM ─────╮
│ 1. Anti Name Change
│ 2. Anti Group Image
│ 3. Anti Nickname
│ 4. Anti Out
│ 5. Anti Emoji
│ 6. Anti Theme
│ 7. Anti QTV
│ 9. Check Status
╰──────────────────────╯
Reply with number to toggle.`,
    threadID,
    (err, info) => {
      global.client.handleReply.push({
        name: this.config.name,
        messageID: info.messageID,
        author: senderID,
        permssion: event.permssion
      });
    },
    messageID
  );
};
