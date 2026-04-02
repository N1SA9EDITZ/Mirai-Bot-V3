module.exports = function({
  api,
  models
}) {
  const fs = require('fs');
  const path = require('path');

  const Users = require("./controllers/users")({ models, api });
  const Threads = require("./controllers/threads")({ models, api });
  const Currencies = require("./controllers/currencies")({ models });

  const logger = require("../utils/log.js");

  (async () => {
    try {
      logger.loader("Loading user & thread data...");

      const [threads, users, currencies] = await Promise.all([
        Threads.getAll(),
        Users.getAll(['userID', 'name', 'data']),
        Currencies.getAll(['userID'])
      ]);

      for (const data of threads) {
        const idThread = String(data.threadID);
        global.data.allThreadID.push(idThread);
        global.data.threadData.set(idThread, data.data || {});
        global.data.threadInfo.set(idThread, data.threadInfo || {});
      }

      for (const dataU of users) {
        const idUsers = String(dataU.userID);
        global.data.allUserID.push(idUsers);
        if (dataU.name) global.data.userName.set(idUsers, dataU.name);
      }

      for (const dataC of currencies) {
        global.data.allCurrenciesID.push(String(dataC.userID));
      }

      logger.loader(`Loaded ${global.data.allThreadID.length} threads`);
      logger.loader(`Loaded ${global.data.allUserID.length} users`);

    } catch (err) {
      logger("Data load error: " + err, "error");
    }
  })();

  const handlers = fs.readdirSync(path.join(__dirname, './handle')).reduce((acc, file) => {
    return {
      ...acc,
      [path.basename(file, '.js')]: require(`./handle/${file}`)({
        api,
        models,
        Users,
        Threads,
        Currencies
      })
    };
  }, {});

  return async function(event) {

    const approvedPath = path.join(__dirname, '/../utils/data/approvedThreads.json');
    const pendingPath = path.join(__dirname, '/../utils/data/pendingThreads.json');
    const premiumPath = path.join(__dirname, '/../utils/data/premiumUsers.json');

    // create files if not exist
    if (!fs.existsSync(approvedPath)) fs.writeFileSync(approvedPath, JSON.stringify([]));
    if (!fs.existsSync(pendingPath)) fs.writeFileSync(pendingPath, JSON.stringify([]));
    if (!fs.existsSync(premiumPath)) fs.writeFileSync(premiumPath, JSON.stringify([]));

    const approved = JSON.parse(fs.readFileSync(approvedPath));
    const pending = JSON.parse(fs.readFileSync(pendingPath));
    const premiumUsers = JSON.parse(fs.readFileSync(premiumPath));

    const admins = global.config.ADMINBOT || [];
    const ndh = global.config.NDH || [];
    const boxAdmin = global.config.BOXADMIN;

    const senderID = String(event.senderID);
    const threadID = String(event.threadID);

    const isAdmin = admins.includes(senderID);
    const isNDH = ndh.includes(senderID);
    const isPremium = premiumUsers.includes(senderID);

    // ===== APPROVED SYSTEM =====
    if (!approved.includes(threadID) && !isAdmin && !isNDH) {

      if (event.body && event.body.toLowerCase() === "duyetbox") {

        api.sendMessage(
          `📩 Approval request from group:\n🆔 ${threadID}`,
          boxAdmin
        );

        return api.sendMessage(
          "✅ Request sent to admin!",
          threadID,
          async (err, info) => {
            setTimeout(() => api.unsendMessage(info.messageID), 10000);

            if (!pending.includes(threadID)) {
              pending.push(threadID);
              fs.writeFileSync(pendingPath, JSON.stringify(pending, null, 2));
            }
          }
        );
      }

      if (event.body && event.body.startsWith(global.config.PREFIX)) {
        return api.sendMessage(
          "❎ This group is not approved!\nType 'duyetbox' to request approval.",
          threadID,
          async (err, info) => {
            setTimeout(() => api.unsendMessage(info.messageID), 10000);
          }
        );
      }
    }

    // ===== PREMIUM SYSTEM =====
    if (event.body && event.body.startsWith(global.config.PREFIX)) {
      if (!isAdmin && !isNDH && !isPremium) {
        return api.sendMessage(
          "🚫 Premium only command!\n💎 Contact admin.",
          threadID,
          event.messageID
        );
      }
    }

    // ===== PREMIUM COMMAND =====
    if (event.body && event.body.startsWith(".addpremium")) {
      if (!isAdmin) return;

      const uid = event.body.split(" ")[1];
      if (!uid) return api.sendMessage("❌ UID missing!", threadID);

      if (!premiumUsers.includes(uid)) {
        premiumUsers.push(uid);
        fs.writeFileSync(premiumPath, JSON.stringify(premiumUsers, null, 2));
      }

      return api.sendMessage("✅ Added to premium!", threadID);
    }

    if (event.body && event.body.startsWith(".removepremium")) {
      if (!isAdmin) return;

      const uid = event.body.split(" ")[1];
      const newList = premiumUsers.filter(id => id !== uid);

      fs.writeFileSync(premiumPath, JSON.stringify(newList, null, 2));

      return api.sendMessage("❌ Removed from premium!", threadID);
    }

    // ===== HANDLER =====
    await handlers['handleCreateDatabase']({ event });

    switch (event.type) {
      case "message":
      case "message_reply":
        await Promise.all([
          handlers['handleCommand']({ event }),
          handlers['handleReply']({ event }),
          handlers['handleCommandEvent']({ event })
        ]);
        break;

      case "event":
        await handlers['handleEvent']({ event });
        break;

      case "message_reaction":
        await handlers['handleReaction']({ event });
        break;
    }

  };
};
