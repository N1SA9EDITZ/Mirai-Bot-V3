const moment = require('moment-timezone');
const os = require('os');

module.exports = {
    config: {
        name: "uptime",
        version: "1.0.1",
        credits: "N1SA9",
        description: "View system and bot uptime information",
        commandCategory: "System",
        cooldowns: 5
    },

    run: async ({ api, event }) => {

        // 👉 Uptime
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);

        // 👉 Memory
        const totalMem = os.totalmem();
        const freeMem = os.freemem();
        const usedMem = totalMem - freeMem;
        const memoryUsage = ((usedMem / totalMem) * 100).toFixed(2);

        // 👉 System Info
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();
        const hostname = os.hostname();

        // 👉 Time (optional nice touch)
        const timeNow = moment().tz("Asia/Dhaka").format("HH:mm:ss | DD/MM/YYYY");

        const replyMsg =
`🤖 SYSTEM STATUS 🤖

⏱️ Uptime: ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}
🕒 Time: ${timeNow}

💻 System:
• Platform: ${platform}
• Hostname: ${hostname}
• CPU: ${cpuModel}

🔋 Memory:
• Total: ${(totalMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Used: ${(usedMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Free: ${(freeMem / 1024 / 1024 / 1024).toFixed(2)} GB
• Usage: ${memoryUsage}%`;

        return api.sendMessage(replyMsg, event.threadID, event.messageID);
    }
};
