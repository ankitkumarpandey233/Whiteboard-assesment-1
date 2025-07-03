const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Simple fetch wrapper with error handling
const fetchAPI = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

export const joinRoom = async (roomCode) => {
  return fetchAPI('/rooms/join', {
    method: 'POST',
    body: JSON.stringify({ roomCode }),
  });
};

export const createRoom = async () => {
  return fetchAPI('/rooms/create', {
    method: 'POST',
    body: JSON.stringify({}),
  });
};

export const getRoomInfo = async (roomCode) => {
  return fetchAPI(`/rooms/${roomCode}`);
};