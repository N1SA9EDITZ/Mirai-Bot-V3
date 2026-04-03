const { spawn } = require("child_process");
const logger = require("./utils/log");

global.countRestart = 0;

function startBot(message) {
  if (message) logger(message, "[ KuRuMi-V3 ]");

  const child = spawn("node", ["kurumi.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (codeExit) => {
    if ((codeExit !== 0) && global.countRestart < 5) {
      global.countRestart++;
      startBot("🔄 Restarting KuRuMi-V3...");
    }
  });

  child.on("error", (error) => {
    logger("Error: " + JSON.stringify(error), "[ KuRuMi-V3 ]");
  });
}

startBot();
