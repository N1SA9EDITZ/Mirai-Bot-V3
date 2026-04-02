const { spawn } = require("child_process");
const logger = require("./utils/log");

function startBot(message) {
    if (message) logger(message, "[ KuRuMi-V3 ]");

    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "kurumi.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });

    child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("🔄 Restarting KuRuMi-V3...");
            global.countRestart += 1;
            return;
        }
    });

    child.on("error", function (error) {
        logger("Error: " + JSON.stringify(error), "[ KuRuMi-V3 ]");
    });
};

startBot();
