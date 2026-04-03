module.exports.config = {
	name: "setname",
	version: "2.0.0",
	hasPermssion: 0,
	credits: "N1SA9",
	description: "Change nickname in group (yourself or tagged user)",
	commandCategory: "Group",
	usages: "[blank/tag/check/all/del/call] + name",
	cooldowns: 5
}

module.exports.run = async ({ api, event, args, Users }) => {
	let { threadID, messageReply, senderID, mentions, type, participantIDs } = event;

	switch(args[0]){
        case 'call':
        case 'Call': {
            const dataNickName = (await api.getThreadInfo(threadID)).nicknames;
            const objKeys = Object.keys(dataNickName);
            const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));
            const mentionsList = [];
            
            let tag = '';
            for (let i = 0; i < notFoundIds.length; i++) {
                const id = notFoundIds[i];
                const name = await Users.getNameUser(id);
                mentionsList.push({ tag: name, id });
                
                tag += `${i + 1}. @${name}\n`;
            }
        
            const bd = '📣 Please set your nickname so everyone can recognize you easily';

            const message = {
                body: `${bd}\n\n${tag}`,
                mentions: mentionsList
            };
            api.sendMessage(message, threadID);
            return;
        }                          

		case 'del':
		case 'Del': {
			const threadInfo = await api.getThreadInfo(threadID);
			if (!threadInfo.adminIDs.some(admin => admin.id === senderID)) {
				return api.sendMessage(`⚠️ Only group admins can use this command`, threadID);
			}
			const dataNickName = threadInfo.nicknames;
			const objKeys = Object.keys(dataNickName);
			const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));

			await notFoundIds.map(async (id)=> {
				try{
					api.removeUserFromGroup(id, threadID);
				}catch(e){
					console.log(e);
				}
			});
			return api.sendMessage(`✅ Successfully removed members without nickname`, threadID);
		}

		case 'check':
		case 'Check': {
			const dataNickName = (await api.getThreadInfo(threadID)).nicknames;
			const objKeys = Object.keys(dataNickName);
			const notFoundIds = participantIDs.filter(id => !objKeys.includes(id));

			var msg = '📝 List of users without nickname:\n';
			let num = 1;

			for (const id of notFoundIds) {
				const name = await Users.getNameUser(id);
				msg += `\n${num++}. ${name}`;
			}

            msg += `\n\n📌 React to this message to remove them from the group`;

			return api.sendMessage(msg, threadID,(error, info) => {
                global.client.handleReaction.push({
                    name: this.config.name,
                    messageID: info.messageID,
                    author: event.senderID,
                    abc: notFoundIds
                });
            });
		}

		case 'help':
            return api.sendMessage(
                `1. setname + name → Change your nickname\n` +
                `2. setname @tag + name → Change tagged user's nickname\n` +
                `3. setname all + name → Change nickname for all members\n` +
                `4. setname check → Show users without nickname\n` +
                `5. setname del → Remove users without nickname (admin only)\n` +
                `6. setname call → Mention users to set nickname`, 
                threadID
            );

		case 'all':
		case 'All': {
			try{
				const name = (event.body).split('all')[1];
				let num = 1;

				for(const i of participantIDs){
					num++;
					try{
						api.changeNickname(name, threadID, i);
					}catch(e){
						console.log(num + " " + e);
					}
				}
				return api.sendMessage(`✅ Successfully changed nickname for all members`, threadID);
			}catch(e) {
				return console.log(e,threadID);
			}
		}
	}

	const delayUnsend = 60;

	if (type == "message_reply") {
		let name2 = await Users.getNameUser(messageReply.senderID);
		const name = args.join(" ");
		return api.changeNickname(`${name}`, threadID, messageReply.senderID),
			api.sendMessage(`✅ Changed ${name2}'s nickname to ${name || "default"}`, threadID, (err, info) =>
			setTimeout(() => {api.unsendMessage(info.messageID)}, delayUnsend * 1000));
	}
	else {
		const mention = Object.keys(mentions)[0];
		const name2 = await Users.getNameUser(mention || senderID);

		if (args.join().indexOf('@') !== -1 ) {
			const name = args.join(' ');
			return api.changeNickname(`${name.replace(mentions[mention],"")}`, threadID, mention),
				api.sendMessage(`✅ Changed ${name2}'s nickname to ${name.replace(mentions[mention],"") || "default"}`, threadID, (err, info) =>
				setTimeout(() => {api.unsendMessage(info.messageID)}, delayUnsend * 1000));
		} else {
			const name = args.join(" ");
			return api.changeNickname(`${name}`, threadID, senderID),
				api.sendMessage(`✅ Changed your nickname to ${name || "default"}`, threadID, (err, info) =>
				setTimeout(() => {api.unsendMessage(info.messageID)}, delayUnsend * 1000));
		}
	}
}

module.exports.handleReaction = async function({ api, event, handleReaction }) {
    if (event.userID != handleReaction.author) return;

    if (Array.isArray(handleReaction.abc) && handleReaction.abc.length > 0) {
        let errorMessage = '';
        let successMessage = `✅ Successfully removed ${handleReaction.abc.length} users without nickname`;
        let errorOccurred = false;

        for (let i = 0; i < handleReaction.abc.length; i++) {
            const userID = handleReaction.abc[i];
            try {
                await api.removeUserFromGroup(userID, event.threadID);
            } catch (error) {
                errorOccurred = true;
                errorMessage += `⚠️ Error removing ${userID}\n`;
            }
        }
        api.sendMessage(errorOccurred ? errorMessage : successMessage, event.threadID);
    } else {
        api.sendMessage(`No users found!`, event.threadID);
    }
};
