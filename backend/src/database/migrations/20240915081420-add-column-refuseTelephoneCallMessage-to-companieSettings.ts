import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.addColumn("CompaniesSettings", "refuseTelephoneCallMessage", {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("CompaniesSettings", "refuseTelephoneCallMessage");
  }
};
