const User = require('../models/User');

const userService = {
  /**
   * Retrieves all users from the database, excluding their passwords.
   * @returns {Promise<Array>} A promise that resolves to an array of user objects.
   */
  getAllUsers: async () => {
    return await User.findAll({ attributes: { exclude: ['password'] } });
  },

  /**
   * Retrieves a single user by their ID.
   * @param {string} id - The UUID of the user.
   * @returns {Promise<Object|null>} A promise that resolves to the user object or null if not found.
   */
  getUserById: async (id) => {
    const user = await User.findByPk(id, { attributes: { exclude: ['password'] } });
    return user;
  },

  /**
   * Creates a new user.
   * @param {Object} userData - The data for the new user.
   * @returns {Promise<Object>} A promise that resolves to the newly created user object.
   * @throws {Error} If username already exists or required fields are missing.
   */
  createUser: async (userData) => {
    const { username, role, password, firstName, lastName, position, odooBatchId } = userData;

    if (!username || !role || !password) {
      const error = new Error('Username, role, and password are required');
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      const error = new Error('Username already exists');
      error.statusCode = 400; // Bad Request
      throw error;
    }

    const newUser = await User.create({
      username,
      role,
      password,
      first_name: firstName,
      last_name: lastName,
      position,
      odoo_batch_id: odooBatchId,
    });

    const { password: _, ...userWithoutPassword } = newUser.get({ plain: true });
    return userWithoutPassword;
  },

  /**
   * Updates an existing user's information.
   * @param {string} id - The UUID of the user to update.
   * @param {Object} updateData - The new data for the user.
   * @returns {Promise<Object|null>} A promise that resolves to the updated user object or null if not found.
   */
  updateUser: async (id, updateData) => {
    const user = await User.findByPk(id);
    if (!user) return null;

    await user.update(updateData);
    
    const { password: _, ...userWithoutPassword } = user.get({ plain: true });
    return userWithoutPassword;
  },

  /**
   * Deletes a user by their ID.
   * @param {string} id - The UUID of the user to delete.
   * @returns {Promise<boolean>} A promise that resolves to true if deleted, false if not found.
   */
  deleteUser: async (id) => {
    const user = await User.findByPk(id);
    if (!user) return false;
    
    await user.destroy();
    return true;
  },

  /**
   * Checks for and creates an initial admin user if one doesn't exist.
   */
  createInitialAdmin: async () => {
    try {
      const adminExists = await User.findOne({ where: { username: 'admin' } });
      if (!adminExists) {
        await User.create({
          username: process.env.ADMIN_USER ,
          password: process.env.ADMIN_PASSWORD,
          role: 'admin',
        });
        console.log('Initial admin user created.');
      } else {
        console.log('Admin user already exists.');
      }
    } catch (error) {
      console.error('Error creating initial admin user:', error);
    }
  },
};

module.exports = userService;

