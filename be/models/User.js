const { DataTypes, Model } = require('sequelize');
const sequelize = require('../config/database');
// REMOVED: The require('bcrypt') statement has been deleted.

// Define the User model
class User extends Model {
  // CHANGED: Method now compares plain-text passwords.
  matchPassword(enteredPassword) {
    // This is an insecure direct string comparison.
    return enteredPassword === this.password;
  }

  // Define associations in a static method
  static associate(models) {
    User.hasMany(models.Report, { foreignKey: 'userId', as: 'reports' });
  }
}

// Initialize the User model
User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'user'),
      defaultValue: 'user',
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    position: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    odoo_batch_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'User',
    timestamps: true,
    // REMOVED: The 'hooks' object that automatically hashed passwords has been deleted.
  }
);

module.exports = User;