module.exports = function ({ sequelize, Sequelize }) {

  const Threads = sequelize.define("Threads", {

    num: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    threadID: {
      type: Sequelize.STRING, // FIXED
      unique: true,
      allowNull: false
    },

    threadInfo: {
      type: Sequelize.JSON,
      defaultValue: {}
    },

    data: {
      type: Sequelize.JSON,
      defaultValue: {}
    }

  });

  return Threads;
};
