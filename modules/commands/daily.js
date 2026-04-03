module.exports = {
  config: {
    name: "daily",
    version: "1.0",
    author: "N1SA9",
    cooldowns: 5,
    hasPermssion: 0,
    commandCategory: "Economy",
    description: "Daily reward"
  },

  run: async function ({ api, event, Currencies }) {

    const { senderID, threadID } = event;

    let data = await Currencies.getData(senderID) || { money: 0, data: {} };

    const now = Date.now();
    const last = data.data?.lastDaily || 0;

    if (now - last < 86400000) {
      return api.sendMessage("⏳ You already claimed today!", threadID);
    }

    const reward = Math.floor(Math.random() * 500) + 100;

    await Currencies.setData(senderID, {
      money: data.money + reward,
      data: {
        ...data.data,
        lastDaily: now
      }
    });

    return api.sendMessage(`🎁 You got ${reward}$`, threadID);
  }
};
