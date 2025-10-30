const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/database");

const Ad = sequelize.define(
  "Ad",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    merchantId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Merchants",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
      comment: "Reference to the merchant who created this ad",
    },
    rate: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0.0001,
      },
      comment: "Exchange rate for the trade",
    },
    minOrder: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Minimum order amount",
    },
    maxOrder: {
      type: DataTypes.DECIMAL(20, 8),
      allowNull: false,
      validate: {
        min: 0,
      },
      comment: "Maximum order amount",
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      comment: "Whether the ad is currently active",
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "ads",
    timestamps: true,
    indexes: [
      {
        fields: ["merchantId"],
      },
      {
        fields: ["rate"],
      },
      {
        fields: ["minOrder", "maxOrder"],
      },
      {
        fields: ["isActive"],
      },
      {
        fields: ["createdAt"],
      },
    ],
    validate: {
      minOrderLessThanMaxOrder() {
        if (this.minOrder >= this.maxOrder) {
          throw new Error(
            "Minimum order cannot be greater than or equal to maximum order"
          );
        }
      },
    },
  }
);

module.exports = Ad;
