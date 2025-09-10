import React, { useState } from 'react';
import { useRouter } from 'next/router';
import BaseLayout from '@components/layouts/base';

const AddUserModule: React.FC = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('user');
  const [position, setPosition] = useState('');
  const [odooBatchId, setOdooBatchId] = useState('');
  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const router = useRouter();

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if password and confirmPassword match
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }

    try {
          // Retrieve username and password from local storage
      const storedUsername = localStorage.getItem('username');
      const storedPassword = localStorage.getItem('password');

      if (!storedUsername || !storedPassword) {
        alert('Authentication credentials are missing.');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          username: storedUsername, // Include username from local storage
          password: storedPassword, // Include password from local storage
        },
        body: JSON.stringify({
          username,
          firstName,
          lastName,
          password,
          role,
          position,
          odooBatchId,
        }),
      });

      if (response.ok) {
        alert('User added successfully!');
        // Clear fields after successful save
        setUsername('');
        setFirstName('');
        setLastName('');
        setPassword('');
        setConfirmPassword('');
        setRole('user');
        setPosition('');
        setOdooBatchId('');
      } else {
        alert('Failed to add user.');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      alert('An error occurred while adding the user.');
    }
  };

  return (
    <BaseLayout>
    <div className="p-6 bg-red-800 min-h-screen flex justify-center items-center pt-20">
      <div className="w-full max-w-md bg-gray-100 p-4 sm:p-6 rounded-lg shadow-md">
        <button
          onClick={() => router.push('/user-management')}
          className="bg-green-500 text-white font-bold py-2 px-4 rounded mb-4 w-full text-center"
        >
          Back to User Management
        </button>
        <form onSubmit={handleAddUser}>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-4xl sm:text-6xl text-gray-500">👤</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold mb-1">Username:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Position:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={position}
                onChange={(e) => setPosition(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">First Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Last Name:</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Password:</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full p-2 border rounded"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-2 top-2 text-sm text-gray-600"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Confirm Password:</label>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full p-2 border rounded"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Role:</label>
              <select
                className="w-full p-2 border rounded"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Odoo Batch ID (if applicable):</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={odooBatchId}
                onChange={(e) => setOdooBatchId(e.target.value)}
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-red-600 text-white py-2 rounded font-bold mt-4 hover:bg-red-700 transition duration-300"
          >
            Save
          </button>
        </form>
      </div>
    </div>
    </BaseLayout>
  );
};

export default AddUserModule;
