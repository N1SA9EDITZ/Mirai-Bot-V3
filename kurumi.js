require("./server");

const { readdirSync, readFileSync } = require("fs-extra");
const { join } = require("path");
const logger = require("./utils/log.js");
const login = require('@dongdev/fca-unofficial');
const fs = require('fs-extra');
const moment = require('moment-timezone');

if (!fs.existsSync('./utils/data')) {
  fs.mkdirSync('./utils/data', { recursive: true });
}

global.client = {
  commands: new Map(),
  events: new Map(),
  cooldowns: new Map(),
  eventRegistered: [],
  handleReaction: [],
  handleReply: [],
  mainPath: process.cwd(),
  configPath: "",
  getTime: option => moment.tz("Asia/Dhaka").format({
    seconds: "ss",
    minutes: "mm",
    hours: "HH",
    date: "DD",
    month: "MM",
    year: "YYYY",
    fullHour: "HH:mm:ss",
    fullYear: "DD/MM/YYYY",
    fullTime: "HH:mm:ss DD/MM/YYYY"
  }[option])
};

global.data = {
  threadInfo: new Map(),
  threadData: new Map(),
  userName: new Map()
};

global.utils = require("./utils/func");
global.config = require('./config.json');
global.language = {};

// ✅ Load language
const langFile = readFileSync(`${__dirname}/languages/en.lang`, "utf-8").split(/\r?\n|\r/);
for (const item of langFile) {
  if (!item || item.startsWith('#')) continue;
  const [key, value] = item.split('=');
  const head = key.split('.')[0];
  const subKey = key.replace(head + '.', '');
  if (!global.language[head]) global.language[head] = {};
  global.language[head][subKey] = value;
}

// ✅ Multiple cookie support
const cookieFiles = [
  "./cookie.txt",
  "./cookie2.txt"
];

function startBot(index = 0) {
  if (index >= cookieFiles.length) {
    return console.log("❌ All cookies failed!");
  }

  let appState;
  try {
    const raw = fs.readFileSync(cookieFiles[index], "utf8");
    appState = global.utils.parseCookies(raw);
  } catch (e) {
    console.log(`⚠️ Cannot read ${cookieFiles[index]}, trying next...`);
    return startBot(index + 1);
  }

  login({ appState }, async (err, api) => {
    if (err) {
      console.log(`⚠️ Cookie ${index + 1} failed, switching...`);
      return startBot(index + 1);
    }

    api.setOptions(global.config.FCAOption);
    global.client.api = api;

    const userId = api.getCurrentUserID();
    const user = await api.getUserInfo([userId]);

    console.log(`🚀 KuRuMi-V3 Connected as: ${user[userId]?.name}`);

    // ✅ Load commands/events
    const load = (path, type) => {
      const files = readdirSync(path).filter(f => f.endsWith(".js"));
      for (const file of files) {
        try {
          const cmd = require(join(path, file));
          if (cmd.config?.name) {
            global.client[type].set(cmd.config.name, cmd);
          }
        } catch (e) {
          console.log("❌ Error loading:", file);
        }
      }
    };

    load('./modules/commands', 'commands');
    load('./modules/events', 'events');

    const listener = require('./includes/listen')({ api });

    api.listenMqtt((err, event) => {
      if (err) {
        console.log("⚠️ Connection lost, switching account...");
        return startBot(index + 1);
      }
      listener(event);
    });
  });
}

startBot();
