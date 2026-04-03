module.exports.config = {
  name: "run",
  version: "1.0.3",
  hasPermssion: 2,
  credits: "N1SA9",
  description: "Execute JavaScript code dynamically (Admin only)",
  commandCategory: "Admin",
  usages: "[code]",
  cooldowns: 5
};

module.exports.run = async function ({
  api,
  event,
  args,
  Threads,
  Users,
  Currencies,
  models,
  permssion
}) {
  const axios = require("axios");
  const fs = require("fs");

  const send = (msg) =>
    api.sendMessage(msg, event.threadID, event.messageID);

  const formatOutput = (data) => {
    if (typeof data === "object" && data !== null) {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  };

  try {
    if (!args[0]) {
      return send("⚠️ Please provide code to run.");
    }

    const code = args.join(" ");

    const result = await eval(`(async () => { ${code} })()`);

    return send(formatOutput(result));

  } catch (error) {
    try {
      const translate = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=en&dt=t&q=${encodeURIComponent(
          error.message
        )}`
      );

      return send(
        `❎ Error:\n${error.message}\n\n📝 Translation:\n${translate.data[0][0][0]}`
      );
    } catch (e) {
      return send(`❎ Error:\n${error.message}`);
    }
  }
};
