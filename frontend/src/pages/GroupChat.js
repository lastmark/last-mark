import React, { useState, useEffect, useContext, useRef } from "react";
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    List,
    ListItem,
    ListItemText,
    Avatar,
    ListItemAvatar,
    Modal,
    IconButton,
    Snackbar,
    Alert,
    Tooltip,
} from "@mui/material";
import { AuthContext } from "../contexts/AuthContext"; 
import socket from "../socket/socket"; 
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";

const HIGHLIGHT_DURATION = 2000; 

const GroupChat = () => {
    const { user, logout } = useContext(AuthContext);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isReplying, setIsReplying] = useState(false);
    const [messageBeingRepliedTo, setMessageBeingRepliedTo] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [messageBeingEdited, setMessageBeingEdited] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [error, setError] = useState(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);

    const messagesEndRef = useRef(null);
    const messageRefs = useRef({}); 
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    };

    useEffect(() => {
        if (user && user.token) {
            socket.auth = { token: user.token };
            socket.connect();
        }

        socket.on("chatHistory", (history) => {
            const updatedMessages = history.map((msg) => ({
                ...msg,
                sender: msg.sender || { username: "Unknown", avatar: "/default-avatar.png" },
                replyTo: msg.replyTo || null,
            }));
            setMessages(updatedMessages);
        });

        socket.on("receiveMessage", (msg) => {
            const updatedMsg = {
                ...msg,
                sender: msg.sender || { username: "Unknown", avatar: "/default-avatar.png" },
                replyTo: msg.replyTo || null,
            };
            setMessages((prev) => [...prev, updatedMsg]);
        });

        socket.on("messageEdited", (editedMsg) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === editedMsg._id ? editedMsg : msg))
            );
        });

        socket.on("messageDeleted", (deletedMsgId) => {
            setMessages((prev) => prev.filter((msg) => msg._id !== deletedMsgId));
        });

        socket.on("connect_error", (err) => {
            console.error("Connection error:", err.message);
            setError("Connection error: " + err.message);
        });

        return () => {
            socket.off("chatHistory");
            socket.off("receiveMessage");
            socket.off("messageEdited");
            socket.off("messageDeleted");
            socket.off("connect_error");
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = () => {
        if (input.trim() === "") return;

        const newMessage = {
            content: input,
            replyTo: messageBeingRepliedTo ? messageBeingRepliedTo._id : null,
        };

        socket.emit("sendMessage", newMessage, (response) => {
            if (response.status === "success") {
                setInput("");
                setIsReplying(false);
                setMessageBeingRepliedTo(null);
            } else {
                console.error("Message failed:", response.error);
                setError(response.error);
            }
        });
    };

    const handleEditMessage = (msg) => {
        setIsEditing(true);
        setMessageBeingEdited(msg);
        setInput(msg.content);
    };

    const submitEdit = () => {
        if (input.trim() === "") return;

        const updatedMessage = {
            id: messageBeingEdited._id,
            content: input,
        };

        socket.emit("editMessage", updatedMessage, (response) => {
            if (response.status === "success") {
                setIsEditing(false);
                setMessageBeingEdited(null);
                setInput("");
            } else {
                console.error("Message edit failed:", response.error);
                setError(response.error);
            }
        });
    };

    const handleDeleteMessage = (msgId) => {
        socket.emit("deleteMessage", msgId, (response) => {
            if (response.status !== "success") {
                console.error("Message deletion failed:", response.error);
                setError(response.error);
            }
        });
    };

    const handleOpenModal = (user) => {
        setSelectedUser(user);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedUser(null);
    };

    const scrollToOriginalMessage = (replyToMessage) => {
        if (!replyToMessage || !replyToMessage._id) return;
        const originalMessageElement = messageRefs.current[replyToMessage._id];
        if (originalMessageElement) {
            originalMessageElement.scrollIntoView({ behavior: "smooth", block: "center" });
            setHighlightedMessageId(replyToMessage._id);
            setTimeout(() => {
                setHighlightedMessageId(null);
            }, HIGHLIGHT_DURATION);
        }
    };

    return (
        <Container maxWidth="xl">
            <Box mt={4} mb={2} display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">Group Chat</Typography>
                <Button variant="outlined" color="secondary" onClick={logout}>
                    Logout
                </Button>
            </Box>
            <Box
                sx={{
                    height: "70vh",
                    overflowY: "scroll",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    padding: "16px",
                    mb: 2,
                }}
            >
                <List>
                    {messages.map((msg) => {
                        const isHighlighted = highlightedMessageId === msg._id;
                        return (
                            <ListItem
                                key={msg._id}
                                alignItems="flex-start"
                                ref={(el) => {
                                    if (el) {
                                        messageRefs.current[msg._id] = el;
                                    }
                                }}
                                sx={{
                                    backgroundColor: isHighlighted ? "rgba(255, 255, 0, 0.3)" : "transparent",
                                    transition: "background-color 0.5s ease",
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        src={`${process.env.REACT_APP_API_URL}${msg.sender.avatar}`}
                                        alt={msg.sender.username}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => handleOpenModal(msg.sender)}
                                    />
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <span
                                            style={{ cursor: "pointer", color: "blue" }}
                                            onClick={() => handleOpenModal(msg.sender)}
                                        >
                                            {`${msg.sender.username} • ${new Date(msg.timestamp).toLocaleTimeString()}`}
                                        </span>
                                    }
                                    secondary={
                                        <>
                                            {msg.replyTo && msg.replyTo.content && (
                                                <Box
                                                    sx={{ fontStyle: "italic", color: "gray", cursor: "pointer" }}
                                                    onClick={() => scrollToOriginalMessage(msg.replyTo)}
                                                >
                                                    Replying to: {msg.replyTo.content}
                                                </Box>
                                            )}
                                            {msg.content}
                                        </>
                                    }
                                />
                                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                                    {msg.sender._id === user.id && (
                                        <Tooltip title="Edit Message" arrow>
                                            <IconButton onClick={() => handleEditMessage(msg)}>
                                                <EditIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    {msg.sender._id === user.id && (
                                        <Tooltip title="Delete Message" arrow>
                                            <IconButton onClick={() => handleDeleteMessage(msg._id)}>
                                                <DeleteIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                    <Tooltip title="Reply to Message" arrow>
                                        <IconButton
                                            onClick={() => {
                                                setIsReplying(true);
                                                setMessageBeingRepliedTo(msg);
                                                setInput(`@${msg.sender.username} `);
                                            }}
                                        >
                                            <ReplyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </ListItem>
                        );
                    })}
                </List>
                <div ref={messagesEndRef} />
            </Box>

            {isReplying && messageBeingRepliedTo && (
                <Box
                    sx={{
                        mb: 2,
                        padding: "8px",
                        backgroundColor: "#f1f1f1",
                        borderRadius: "4px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="subtitle2">
                        Replying to:{input} {messageBeingRepliedTo.content}
                    </Typography>
                    <Button
                        size="small"
                        onClick={() => {
                            setIsReplying(false);
                            setMessageBeingRepliedTo(null);
                            setInput("");
                        }}
                    >
                        Cancel
                    </Button>
                </Box>
            )}

            <Box display="flex">
                <TextField
                    label="Type your message..."
                    variant="outlined"
                    fullWidth
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                            isEditing ? submitEdit() : sendMessage();
                        }
                    }}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={isEditing ? submitEdit : sendMessage}
                    sx={{ ml: 2 }}
                >
                    {isEditing ? "Save" : "Send"}
                </Button>
            </Box>

            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                aria-labelledby="user-modal-title"
                aria-describedby="user-modal-description"
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        bgcolor: "background.paper",
                        // border: "2px solid #000",
                        boxShadow: 24,
                        p: 4,
                        textAlign: "center",
                        borderRadius: "10px",
                        width: 300,
                    }}
                >
                    {selectedUser && (
                        <>
                            <Avatar
                                src={`${process.env.REACT_APP_API_URL}${selectedUser.avatar}`}
                                alt={selectedUser.username}
                                sx={{ width: 100, height: 100, margin: "0 auto", mb: 2 }}
                            />
                            <Typography id="user-modal-title" variant="h6">
                                Bio: {selectedUser.bio || "No bio available"}
                            </Typography>
                            <Typography variant="h6">
                                Username: {selectedUser.username}
                            </Typography>
                        </>
                    )}
                </Box>
            </Modal>

            <Snackbar
                open={Boolean(error)}
                autoHideDuration={6000}
                onClose={() => setError(null)}
            >
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
        </Container>
    );
};

export default GroupChat;
