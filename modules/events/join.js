module.exports.config = {
	name: "joinNoti",
	eventType: ["log:subscribe"],
	version: "2.0.0",
	credits: "N1SA9",
	description: "Notify when users or bot join the group",
	dependencies: {
		"fs-extra": ""
	}
};

module.exports.run = async function({ api, event, Users }) {
	const { join } = global.nodemodule["path"];
	const { threadID } = event;

	// BOT JOIN
	if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
		api.changeNickname(
			`✨ ${global.config.BOTNAME || "Kurumi"} ✨`,
			threadID,
			api.getCurrentUserID()
		);

		return api.sendMessage(
`✨ Hello everyone 👋

🤖 ${global.config.BOTNAME || "Kurumi-V3"} Bot is now connected!

📌 Prefix: ${global.config.PREFIX}
💬 Type "${global.config.PREFIX}help" to view commands

💖 Enjoy using Kurumi-V3!`,
			threadID
		);
	}

	// USER JOIN
	else {
		try {
			const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];
			let { threadName, participantIDs } = await api.getThreadInfo(threadID);

			const threadData = global.data.threadData.get(parseInt(threadID)) || {};
			const path = join(__dirname, "cache", "joinGif");
			const pathGif = join(path, `${threadID}.gif`);

			let mentions = [], nameArray = [], memLength = [], i = 0;

			for (let user of event.logMessageData.addedParticipants) {
				const userName = user.fullName;
				const id = user.userFbId;

				nameArray.push(userName);
				mentions.push({ tag: userName, id });
				memLength.push(participantIDs.length - i++);

				if (!global.data.allUserID.includes(id)) {
					await Users.createData(id, { name: userName, data: {} });
					global.data.allUserID.push(id);
				}
			}

			memLength.sort((a, b) => a - b);

			let msg = threadData.customJoin ||
`👋 Welcome {name}!

🎉 {type} joined **{threadName}**
👥 Member No: {soThanhVien}

✨ Enjoy your stay with Kurumi!`;

			msg = msg
				.replace(/\{name}/g, nameArray.join(', '))
				.replace(/\{type}/g, (memLength.length > 1) ? 'They have' : 'You have')
				.replace(/\{soThanhVien}/g, memLength.join(', '))
				.replace(/\{threadName}/g, threadName);

			if (!existsSync(path)) mkdirSync(path, { recursive: true });

			let formPush;
			if (existsSync(pathGif)) {
				formPush = { body: msg, attachment: createReadStream(pathGif), mentions };
			} else {
				formPush = { body: msg, mentions };
			}

			return api.sendMessage(formPush, threadID);

		} catch (e) {
			console.log(e);
		}
	}
};
