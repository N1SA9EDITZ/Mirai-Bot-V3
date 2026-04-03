module.exports = {
  config: {
    name: "money",
    version: "1.0",
    author: "N1SA9",
    cooldowns: 5,
    hasPermssion: 0,
    usePrefix:false,
    commandCategory: "Economy",
    usages: "",
    description: "Check your balance"
  },

  run: async function ({ api, event, Currencies }) {

    const { threadID, senderID } = event;

    const data = await Currencies.getData(senderID) || { money: 0, exp: 0 };

    return api.sendMessage(
      `💰 Balance: ${data.money}$\n⭐ EXP: ${data.exp}`,
      threadID
    );
  }
};
