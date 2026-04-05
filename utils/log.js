const chalk = require('chalk');
const gradient = require("gradient-string");

const themes = [
  'rainbow', 'pastel', 'cristal', 'teen', 'summer', 'hacker'
];

const theme = themes[Math.floor(Math.random() * themes.length)];

let co;
let error = chalk.red.bold;

switch (theme) {
  case "rainbow":
    co = gradient.rainbow;
    break;
  case "pastel":
    co = gradient.pastel;
    break;
  case "cristal":
    co = gradient.cristal;
    break;
  case "teen":
    co = gradient.teen;
    break;
  case "summer":
    co = gradient.summer;
    break;
  case "hacker":
    co = gradient('#47a127', '#0eed19', '#27f231');
    break;
  default:
    co = gradient("#00c6ff", "#0072ff");
}

module.exports = (text, type = "KuRuMi-V3") => {
  switch (type) {
    case "error":
      console.log(error(`[ ERROR ] ➜ ${text}`));
      break;
    case "warn":
      console.log(chalk.yellow(`[ WARNING ] ➜ ${text}`));
      break;
    default:
      console.log(co(`[ ${type} ] ➜ ${text}`));
  }
};

module.exports.loader = (data, option) => {
  switch (option) {
    case "error":
      console.log(error(`[ ERROR ] ➜ ${data}`));
      break;
    case "warn":
      console.log(chalk.yellow(`[ WARNING ] ➜ ${data}`));
      break;
    default:
      console.log(co(`[ LOADING ] ➜ ${data}`));
  }
};

module.exports.load = (data, option) => {
  switch (option) {to
    case "error":
      console.log(error(`[ LOGIN ERROR ] ➜ ${data}`));
      break;
    default:
      console.log(co(`[ LOGIN ] ➜ ${data}`));
  }
};
module.exports = function (msg, tag) {
  console.log(tag || "[ LOG ]", msg);
};
