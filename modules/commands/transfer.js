module.exports = {
  config: {
    name: "pay",
    version: "1.0",
    author: "N1SA9",
    cooldowns: 5,
    hasPermssion: 0,
    commandCategory: "Economy",
    description: "Transfer money"
  },

  run: async function ({ api, event, args, Currencies }) {

    const { threadID, senderID, mentions } = event;

    const amount = parseInt(args[1]);

    const targetID = Object.keys(mentions)[0];

    if (!targetID) return api.sendMessage("❌ Mention user", threadID);
    if (!amount || amount <= 0) return api.sendMessage("❌ Invalid amount", threadID);

    let senderData = await Currencies.getData(senderID);
    let targetData = await Currencies.getData(targetID);

    if (!senderData || senderData.money < amount) {
      return api.sendMessage("❌ Not enough money", threadID);
    }

    await Currencies.setData(senderID, {
      money: senderData.money - amount
    });

    await Currencies.setData(targetID, {
      money: (targetData?.money || 0) + amount
    });

    return api.sendMessage(`✅ Sent ${amount}$`, threadID);
  }
};
