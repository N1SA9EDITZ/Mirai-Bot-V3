module.exports.config = {
    name: "cmd",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "N1SA9",
    description: "Manage and control all bot modules",
    commandCategory: "Admin",
    usages: "[load/unload/loadall/unloadall/info] [module name]",
    cooldowns: 5,
    prefix: false
};

const loadCommand = function ({ moduleList, threadID, messageID }) {
    const { writeFileSync } = require("fs-extra");
    const { mainPath, api } = global.client;
    const logger = require(mainPath + "/utils/log");

    const errorList = [];

    delete require.cache[require.resolve(process.cwd() + "/config.json")];
    const configValue = require(process.cwd() + "/config.json");

    for (const nameModule of moduleList) {
        if (!nameModule) {
            errorList.push("- Empty module name");
            continue;
        }

        try {
            const dirModule = __dirname + "/" + nameModule + ".js";

            delete require.cache[require.resolve(dirModule)];
            const command = require(dirModule);

            global.client.commands.delete(nameModule);

            if (!command.config || !command.run)
                throw new Error("Invalid module format");

            global.client.eventRegistered =
                global.client.eventRegistered.filter(
                    (i) => i !== command.config.name
                );

            // env config
            if (command.config.envConfig && typeof command.config.envConfig === "object") {
                for (const [key, value] of Object.entries(command.config.envConfig)) {
                    if (!global.configModule[command.config.name])
                        global.configModule[command.config.name] = {};
                    if (!configValue[command.config.name])
                        configValue[command.config.name] = {};

                    global.configModule[command.config.name][key] =
                        configValue[command.config.name][key] || value || "";

                    configValue[command.config.name][key] =
                        configValue[command.config.name][key] || value || "";
                }
                logger.loader("Loaded config " + command.config.name);
            }

            if (command.onLoad) command.onLoad({ configValue });

            if (command.handleEvent)
                global.client.eventRegistered.push(command.config.name);

            if (
                global.config.commandDisabled.includes(nameModule + ".js")
            ) {
                global.config.commandDisabled.splice(
                    global.config.commandDisabled.indexOf(nameModule + ".js"),
                    1
                );
            }

            if (
                configValue.commandDisabled.includes(nameModule + ".js")
            ) {
                configValue.commandDisabled.splice(
                    configValue.commandDisabled.indexOf(nameModule + ".js"),
                    1
                );
            }

            global.client.commands.set(command.config.name, command);

            logger.loader("Loaded command " + command.config.name);
        } catch (error) {
            errorList.push(`- ${nameModule}: ${error.message}`);
        }
    }

    if (errorList.length) {
        api.sendMessage(
            "❌ Load errors:\n" + errorList.join("\n"),
            threadID,
            messageID
        );
    }

    api.sendMessage(
        `✅ Loaded ${moduleList.length - errorList.length} module(s)`,
        threadID,
        messageID
    );

    writeFileSync(
        process.cwd() + "/config.json",
        JSON.stringify(configValue, null, 4),
        "utf8"
    );
};

const unloadModule = function ({ moduleList, threadID, messageID }) {
    const { writeFileSync } = require("fs-extra");
    const { api } = global.client;

    delete require.cache[require.resolve(process.cwd() + "/config.json")];
    const configValue = require(process.cwd() + "/config.json");

    for (const nameModule of moduleList) {
        if (!nameModule) continue;

        global.client.commands.delete(nameModule);

        global.client.eventRegistered =
            global.client.eventRegistered.filter((i) => i !== nameModule);

        configValue.commandDisabled.push(`${nameModule}.js`);
        global.config.commandDisabled.push(`${nameModule}.js`);
    }

    writeFileSync(
        process.cwd() + "/config.json",
        JSON.stringify(configValue, null, 4),
        "utf8"
    );

    return api.sendMessage(
        `✅ Unloaded ${moduleList.length} module(s)`,
        threadID,
        messageID
    );
};

module.exports.run = function ({ event, args, api }) {
    const { readdirSync } = require("fs-extra");
    const { threadID, messageID } = event;

    const command = args[0];
    const moduleList = args.slice(1).map((i) => i.trim()).filter(Boolean);

    switch (command) {

        case "load":
            if (!moduleList.length)
                return api.sendMessage(
                    "❌ Module name required!",
                    threadID,
                    messageID
                );
            return loadCommand({ moduleList, threadID, messageID });

        case "unload":
            if (!moduleList.length)
                return api.sendMessage(
                    "❌ Module name required!",
                    threadID,
                    messageID
                );
            return unloadModule({ moduleList, threadID, messageID });

        case "loadall": {
            const modules = readdirSync(__dirname)
                .filter((f) => f.endsWith(".js") && !f.includes("example"))
                .map((f) => f.replace(".js", ""));

            return loadCommand({ moduleList: modules, threadID, messageID });
        }

        case "unloadall": {
            const modules = readdirSync(__dirname)
                .filter(
                    (f) =>
                        f.endsWith(".js") &&
                        !f.includes("example") &&
                        !f.includes("cmd")
                )
                .map((f) => f.replace(".js", ""));

            return unloadModule({ moduleList: modules, threadID, messageID });
        }

        case "info": {
            const name = moduleList.join("");
            const cmd = global.client.commands.get(name);

            if (!cmd)
                return api.sendMessage(
                    "❌ Module not found!",
                    threadID,
                    messageID
                );

            const {
                version,
                hasPermssion,
                credits,
                cooldowns,
                dependencies
            } = cmd.config;

            return api.sendMessage(
                `=== ${cmd.config.name.toUpperCase()} ===\n` +
                    `- Author: ${credits}\n` +
                    `- Version: ${version}\n` +
                    `- Permission: ${
                        hasPermssion === 0
                            ? "User"
                            : hasPermssion === 1
                            ? "Admin"
                            : "Bot Operator"
                    }\n` +
                    `- Cooldown: ${cooldowns}s\n` +
                    `- Dependencies: ${
                        Object.keys(dependencies || {}).join(", ") ||
                        "None"
                    }`,
                threadID,
                messageID
            );
        }

        default:
            return global.utils.throwError(this.config.name, threadID, messageID);
    }
};
