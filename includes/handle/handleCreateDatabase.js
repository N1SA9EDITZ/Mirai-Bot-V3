module.exports = function ({ Users, Threads, Currencies }) {
    const logger = require("../../utils/log.js");

    return async function ({ event }) {

        if (!global.config.autoCreateDB) return;

        const { allUserID, allThreadID, userName } = global.data;

        let { senderID, threadID } = event;

        senderID = String(senderID);
        threadID = String(threadID);

        try {

            if (event.isGroup && !allThreadID.includes(threadID)) {

                const info = await Threads.getInfo(threadID);

                await Threads.setData(threadID, { threadInfo: info, data: {} });

                allThreadID.push(threadID);

                logger(`New Group: ${info.threadName}`, "DATABASE");
            }

            if (!allUserID.includes(senderID)) {

                const user = await Users.getInfo(senderID);

                await Users.createData(senderID, {
                    name: user.name
                });

                allUserID.push(senderID);
                userName.set(senderID, user.name);

                logger(`New User: ${user.name}`, "DATABASE");
            }

            if (!global.data.allCurrenciesID.includes(senderID)) {
                await Currencies.createData(senderID, { data: {} });
                global.data.allCurrenciesID.push(senderID);
            }

        } catch (e) {
            console.log(e);
        }
    };
};
