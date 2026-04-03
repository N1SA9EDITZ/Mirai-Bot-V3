module.exports = {
  config: {
    name: "work",
    version: "1.0",
    author: "N1SA9",
    cooldowns: 10,
    hasPermssion: 0,
    usePrefix: true,
    commandCategory: "Economy",
    description: "Work to earn money"
  },

  run: async function ({ api, event, Currencies }) {

    const { senderID, threadID } = event;

    let data = await Currencies.getData(senderID) || { money: 0 };

    const earn = Math.floor(Math.random() * 200) + 50;

    await Currencies.setData(senderID, {
      money: data.money + earn
    });

    return api.sendMessage(`💼 You earned ${earn}$`, threadID);
  }
};
