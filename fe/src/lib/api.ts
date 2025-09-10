/**
 * A wrapper around the native fetch function that automatically adds the
 * JWT Authorization header to requests. This is the central place for all
 * authenticated API calls.
 *
 * @param {string} url The API endpoint to call.
 * @param {object} [options={}] Optional fetch options (method, body, etc.).
 * @returns {Promise<Response>} The fetch Response object.
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 1. Get the JWT token from the browser's localStorage
  const token = localStorage.getItem('token');

  // 2. Prepare the request headers
  // --- THIS IS THE FIX ---
  // We change the type from HeadersInit to a more specific Record<string, string>
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // 3. If a token exists, add the Authorization header
  if (token) {
    // This line will no longer show an error
    headers['Authorization'] = `Bearer ${token}`;
  }

  // 4. Perform the actual fetch call with the original options and the new headers
  const response = await fetch(url, {
    ...options,
    headers,
  });

  // 5. Handle automatic logout if the token is expired or invalid
  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    
    window.location.href = '/'; 
    
    throw new Error('Session expired. Please log in again.');
  }

  // 6. If the request was successful, return the response
  return response;
};

