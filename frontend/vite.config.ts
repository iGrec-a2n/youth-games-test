import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      '71d4-185-226-32-80.ngrok-free.app', // Add your ngrok domain here
      'localhost', // You can also allow localhost for local development
    ],
  },
});
