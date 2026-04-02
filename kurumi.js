const { readdirSync, readFileSync, writeFileSync } = require("fs-extra");
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

const langFile = (readFileSync(`${__dirname}/languages/en.lang`, { encoding: 'utf-8' })).split(/\r?\n|\r/);

for (const item of langFile) {
    if (item.startsWith('#') || item === '') continue;
    const [key, value] = item.split('=');
    const head = key.split('.')[0];
    const subKey = key.replace(head + '.', '');
    if (!global.language[head]) global.language[head] = {};
    global.language[head][subKey] = value;
}

function startBot() {
    login({ appState: global.utils.parseCookies(fs.readFileSync('./cookie.txt', 'utf8'))}, async (err, api) => {
        if (err) return console.log(err);

        api.setOptions(global.config.FCAOption);
        global.client.api = api;

        const userId = api.getCurrentUserID();
        const user = await api.getUserInfo([userId]);

        console.log("🚀 KuRuMi-V3 Connected as:", user[userId]?.name);

        const load = (path, type) => {
            const files = readdirSync(path).filter(f => f.endsWith(".js"));
            for (const file of files) {
                try {
                    const cmd = require(join(path, file));
                    global.client[type].set(cmd.config.name, cmd);
                } catch (e) {
                    console.log("Error loading:", file);
                }
            }
        };

        load('./modules/commands', 'commands');
        load('./modules/events', 'events');

        const listener = require('./includes/listen')({ api });

        api.listenMqtt((err, event) => {
            if (err) return console.log(err);
            listener(event);
        });
    });
}

startBot();
