const { spawn } = require("child_process");
const logger = require("./utils/log");

global.countRestart = 0;

function startBot() {
  const child = spawn("node", ["kurumi.js"], {
    cwd: __dirname,
    stdio: "inherit",
    shell: true
  });

  child.on("close", (code) => {
    if (code !== 0 && global.countRestart < 5) {
      global.countRestart++;
      logger("🔄 Restarting KuRuMi-V3...", "[ SYSTEM ]");
      startBot();
    }
  });

  child.on("error", (err) => {
    logger("❌ Error: " + err, "[ SYSTEM ]");
  });
}

startBot();
