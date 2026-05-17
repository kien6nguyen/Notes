import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const echo = new Echo({
  broadcaster: 'reverb',
  key: 'finalwebkey',
  wsHost: 'localhost',
  wsPort: 8085,
  wssPort: 8085,
  forceTLS: false,
  enabledTransports: ['ws'],
  authEndpoint: 'http://localhost:8000/api/broadcasting/auth',
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
