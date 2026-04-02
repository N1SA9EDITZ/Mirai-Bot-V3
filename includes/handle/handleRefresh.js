module.exports = function ({ api, Threads }) {

    return async function ({ event }) {

        const { threadID, logMessageType, logMessageData } = event;

        try {

            let data = await Threads.getData(threadID);
            if (!data) return;

            let info = data.threadInfo || {};

            if (logMessageType === "log:thread-name") {
                info.threadName = logMessageData.name;
                await Threads.setData(threadID, { threadInfo: info });
            }

            if (logMessageType === "log:unsubscribe") {
                const uid = logMessageData.leftParticipantFbId;

                info.participantIDs = info.participantIDs.filter(id => id != uid);
                info.adminIDs = info.adminIDs.filter(a => a.id != uid);

                await Threads.setData(threadID, { threadInfo: info });
            }

        } catch (e) {
            console.log(e);
        }
    };
};
