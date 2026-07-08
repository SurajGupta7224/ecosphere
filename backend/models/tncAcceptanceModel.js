const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const TncAcceptance = sequelize.define("TncAcceptance", {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },
  user_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // JSON object: { tnc_agree: true, accuracy_agree: true, copyright_agree: true, promo_agree: true }
  accepted_checkboxes: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  accepted_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  ip_address: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
}, {
  tableName: "tnc_acceptances",
  timestamps: false,
});

module.exports = TncAcceptance;
