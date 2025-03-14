import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  transports: ["websocket", "polling"],  // Mode de transport
  reconnectionAttempts: 5,               // Limite les tentatives de reconnexion
  reconnectionDelay: 1000,               // Délai entre les tentatives de reconnexion
  timeout: 20000,                        // Temps avant de considérer que la connexion a échoué
});

export default socket;
