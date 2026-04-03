module.exports.config = {
	name: "shell",
	version: "1.0.1",
	hasPermssion: 3,
	credits: "N1SA9",
	description: "Execute shell commands",
	commandCategory: "Admin",
	usages: "[command]",
	cooldowns: 0,
	prefix: true
};

module.exports.run = async ({ api, event, args }) => {
	const { exec } = require("child_process");

	if (!args.length) {
		return api.sendMessage("⚠️ Please enter a command to execute.", event.threadID, event.messageID);
	}

	exec(args.join(" "), (err, stdout, stderr) => {
		let output = "";

		if (err) output = `❌ Error:\n${err.message}`;
		else if (stderr) output = `⚠️ Stderr:\n${stderr}`;
		else output = `✅ Output:\n${stdout || "No output"}`;

		// Prevent too long message crash
		if (output.length > 2000) {
			output = output.slice(0, 2000) + "\n...";
		}

		api.sendMessage(output, event.threadID, event.messageID);
	});
};
