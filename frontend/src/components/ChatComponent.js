import React, { useEffect, useState } from "react";
import socket from "../socket/socket";
import {
  Snackbar,
  Alert,
} from "@mui/material";

const ChatComponent = () => {
  const [alertOpen, setAlertOpen] = useState(false);
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    socket.on("newUser", (user) => {
      setNewUsername(user.username);
      setAlertOpen(true);
    });

    return () => {
      socket.off("newUser");
    };
  }, []);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <div>
      <Snackbar
        open={alertOpen}
        autoHideDuration={4000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }} 
      >
        <Alert onClose={handleClose} severity="info" sx={{ width: '100%' }}>
          {newUsername} has joined the chat!
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChatComponent;
