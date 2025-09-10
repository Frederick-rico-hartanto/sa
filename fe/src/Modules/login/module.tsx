import React, { useState } from 'react';

interface LoginModuleProps {
  onLoginSuccess: (username: string, role: string) => void; // Pass role instead of password
}

const LoginModule: React.FC<LoginModuleProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // --- FIX 1: Guard Clause ---
    // This is the most important fix. It stops the function and prevents the API
    // call if the username or password fields are empty. This will stop the
    // repeated "Authentication failed" logs on your server.
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important for sending/receiving session cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // --- FIX 2: Better Error Handling ---
        // Use the error message from the server's response if it exists.
        throw new Error(data.message || `Login failed with status: ${response.status}`);
      }

      if (data.role) {
        // --- FIX 3: CRITICAL SECURITY FIX ---
        // NEVER store the user's password in localStorage. It's not secure.
        // Only store non-sensitive information like username and role.
        localStorage.setItem('username', username);
        localStorage.setItem('role', data.role);
        
        // Pass the role to the success callback
        onLoginSuccess(username, data.role);
      } else {
        throw new Error('Role is missing in the server response.');
      }
    } catch (err: any) {
      console.error('Error during login:', err);
      setError(err.message || 'Error connecting to the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-red-800">
      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-lg shadow-lg text-center max-w-sm w-full">
        <img loading="eager" src="/logo.svg" className="mb-8 mx-auto w-32" alt="Logo" />

        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4 text-left">
          <label htmlFor="username" className="block text-gray-700 font-bold mb-2">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            aria-label="Username"
          />
        </div>

        <div className="mb-6 text-left relative">
          <label htmlFor="password" className="block text-gray-700 font-bold mb-2">Password:</label>
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            required
            aria-label="Password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-11 text-sm text-gray-500"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <button
          type="submit"
          className={`w-full bg-green-500 text-white py-2 rounded-lg font-bold ${isLoading ? 'cursor-not-allowed opacity-50' : 'hover:bg-green-600'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'LOGIN'}
        </button>
      </form>
    </div>
  );
};

export default LoginModule;
