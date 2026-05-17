import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

// Parse Host and Protocol dynamically from VITE_API_URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
let wsHost = 'localhost';
let wsPort = 8085;
let wssPort = 8085;
let forceTLS = false;
let authHost = 'http://localhost:8000';

try {
  const url = new URL(API_URL);
  wsHost = url.hostname;
  authHost = url.origin;

  if (url.protocol === 'https:') {
    forceTLS = true;
    wsPort = 443;
    wssPort = 443;
  } else {
    // Local / Dev setup fallback
    if (wsHost !== 'localhost' && wsHost !== '127.0.0.1') {
      wsPort = 80;
      wssPort = 443;
    } else {
      wsPort = 8085;
      wssPort = 8085;
    }
  }
} catch (e) {
  console.error('Failed to parse VITE_API_URL for Reverb setup', e);
}

// Match the backend Reverb App Key (defaults to finalwebkey in both local and production unless overridden)
const reverbKey = import.meta.env.VITE_REVERB_APP_KEY || 'finalwebkey';

const echo = new Echo({
  broadcaster: 'reverb',
  key: reverbKey,
  wsHost: wsHost,
  wsPort: wsPort,
  wssPort: wssPort,
  forceTLS: forceTLS,
  enabledTransports: forceTLS ? ['ws', 'wss'] : ['ws'],
  authEndpoint: `${authHost}/api/broadcasting/auth`,
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
  },
});

// Update auth token dynamically
export const updateEchoAuth = () => {
  const token = localStorage.getItem('token');
  if (token) {
    echo.connector.options.auth.headers.Authorization = `Bearer ${token}`;
  }
};

export default echo;
