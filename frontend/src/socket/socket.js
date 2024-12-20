import { io } from "socket.io-client";

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL; 

const token = localStorage.getItem("token"); 

const socket = io(SOCKET_SERVER_URL, {
  auth: {
    token: token ? token : "",
  },
});

socket.on("connect_error", (err) => {
  console.error("Connection Error:", err.message);
});

export default socket;
