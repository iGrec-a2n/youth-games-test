import { io } from "socket.io-client";

const socket = io("http://127.0.0.1:5001"); // URL de ton backend Flask

export default socket;
