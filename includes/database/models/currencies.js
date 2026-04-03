module.exports = function ({ sequelize, Sequelize }) {

  const Currencies = sequelize.define("Currencies", {

    num: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    userID: {
      type: Sequelize.STRING, // FIXED (BIGINT → STRING)
      unique: true,
      allowNull: false
    },

    money: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },

    exp: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },

    data: {
      type: Sequelize.JSON,
      defaultValue: {}
    }

  });

  return Currencies;
};
