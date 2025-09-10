const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');

class Report extends Model {
  static associate(models) {
    // This defines the relationship to the User model
    Report.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
  }
}

Report.init(
  {
    // ADDED: A unique primary key for the report itself
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    // CHANGED: The foreign key type must match the User's primary key type (UUID)
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users', // Conventionally, the table name is plural
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    // REMOVED: The 'username' field is redundant. It can be accessed via the User association.
    location: {
      type: DataTypes.STRING,
      allowNull: false, // Made this required as an example
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false, // Made this required as an example
    },
    photo: {
      type: DataTypes.STRING, // Storing a URL or file path is best
      allowNull: true,
    },
    // CHANGED: Using DATE stores the full timestamp (date and time), which is more useful
    submissionTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    // CHANGED: Also using DATE for the end time for consistency
    endTime: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false, // Descriptions are usually essential
    },
  },
  {
    sequelize,
    modelName: 'Report',
    timestamps: true,
  }
);

module.exports = Report;