const cron = require('node-cron');
const fs = require('fs');
const moment = require('moment-timezone');
const path = require('path');

module.exports = function ({ api, Threads }) {

  cron.schedule('*/10 * * * *', async () => {

    const file = path.join(__dirname, '../../utils/data/check_data.json');
    const now = moment().tz('Asia/Dhaka').format('YYYY-MM-DD HH:mm:ss');

    let last = null;

    if (fs.existsSync(file)) {
      last = JSON.parse(fs.readFileSync(file)).datetime;
    }

    if (!last || moment(now).diff(moment(last), 'minutes') >= 10) {

      const list = await api.getThreadList(50, null, ['INBOX']);

      for (const t of list.filter(i => i.isGroup)) {
        const info = await api.getThreadInfo(t.threadID);
        await Threads.setData(t.threadID, { threadInfo: info });
      }

      fs.writeFileSync(file, JSON.stringify({ datetime: now }, null, 2));
      console.log("✅ Auto data refresh done");
    }
  });

};
