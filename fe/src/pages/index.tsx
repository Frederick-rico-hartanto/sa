import { useRouter } from 'next/router';
import React, { useState } from 'react';
import LoginModule from '@modules/login/module';

const LoginPage: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onLoginSuccess = (username: string, password: string): void => {
    (async () => {
      try {
        // Fetch user details based on username
        const response = await fetch(
          `http://localhost:5000/api/users?username=${username}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }

        const data = await response.json();
        const user = Array.isArray(data)
          ? data.find((user: any) => user.username === username)
          : data.users?.find((user: any) => user.username === username);

        if (user && user.role) {
          if (user.role === 'admin') {
            router.push('/dashboard'); // Redirect admin
          } else if (user.role === 'user') {
            router.push('/report'); // Redirect user
          } else {
            throw new Error('Invalid user role');
          }
        } else {
          throw new Error('User not found');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred during login');
      }
    })();
  };

  return (
    <div className="p-16 bg-red-800 min-h-screen flex justify-center items-center">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <LoginModule
        onLoginSuccess={(username: string, password: string) =>
          onLoginSuccess(username, password)
        }
      />
    </div>
  );
};

export default LoginPage;