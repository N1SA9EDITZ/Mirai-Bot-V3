module.exports = function ({ Sequelize, sequelize }) {

  const Users = require("./models/users")({ Sequelize, sequelize });
  const Threads = require("./models/threads")({ Sequelize, sequelize });
  const Currencies = require("./models/currencies")({ Sequelize, sequelize });

  const init = async () => {
    try {
      await Users.sync();
      await Threads.sync();
      await Currencies.sync();
      console.log("✅ Database synced successfully");
    } catch (err) {
      console.log("❌ Database error:", err);
    }
  };

  init();

  return {
    model: {
      Users,
      Threads,
      Currencies
    },

    use(name) {
      return this.model[name];
    }
  };
};
