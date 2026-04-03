module.exports = function ({ sequelize, Sequelize }) {

  const Users = sequelize.define("Users", {

    num: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    userID: {
      type: Sequelize.STRING, // FIXED
      unique: true,
      allowNull: false
    },

    name: {
      type: Sequelize.STRING,
      defaultValue: "Unknown"
    },

    gender: {
      type: Sequelize.STRING,
      defaultValue: "unknown"
    },

    data: {
      type: Sequelize.JSON,
      defaultValue: {}
    }

  });

  return Users;
};
