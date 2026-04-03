const Sequelize = require("sequelize");
const { resolve } = require("path");

const storage = resolve(__dirname, "../data.sqlite");

const sequelize = new Sequelize({
  dialect: "sqlite",
  storage,

  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },

  retry: {
    max: 10,
    match: [/SQLITE_BUSY/]
  },

  logging: false,

  define: {
    freezeTableName: true,
    timestamps: true,
    charset: "utf8"
  }
});

module.exports = {
  sequelize,
  Sequelize
};
