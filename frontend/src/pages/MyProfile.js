import React, { useState } from 'react';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Avatar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser, clearUser } from '../store/userSlice';
import axios from 'axios';

const MyProfile = () => {
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);
    const [form, setForm] = useState({ username: user.username, bio: user.bio || '' });
    const [password, setPassword] = useState('');
    const [avatar, setAvatar] = useState(null); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [openDelete, setOpenDelete] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file); 
        }
    };

    const handleUpdate = async () => {
        try {
            setError('');
            setSuccess('');
            const formData = new FormData();

            if (form.username) formData.append('username', form.username);
            if (password) formData.append('password', password);
            if (avatar) formData.append('avatar', avatar);
            if (form.bio) formData.append('bio', form.bio);

            const token = localStorage.getItem('token'); 

            const response = await axios.put(
                `${process.env.REACT_APP_API_URL}/api/user/update`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );

            if (response.data.user) {
                dispatch(updateUser(response.data.user)); 
                setSuccess('Profile updated successfully');
                setPassword(''); 
                setAvatar(null); 
            } else {
                setError('Update failed');
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError(err.response?.data?.message || 'Update failed');
        }
    };

    const handleRemoveAvatar = async () => {
        try {
            const token = localStorage.getItem('token'); 

            const response = await axios.delete(
                `${process.env.REACT_APP_API_URL}/api/user/remove-avatar`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (response.data.user) {
                dispatch(updateUser(response.data.user)); 
                setSuccess('Avatar removed successfully');
            } else {
                setError('Failed to remove avatar');
            }
        } catch (err) {
            console.error('Error removing avatar:', err);
            setError(err.response?.data?.message || 'Failed to remove avatar');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            const token = localStorage.getItem('token'); 
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/user/delete`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            dispatch(clearUser()); 
        } catch (err) {
            console.error('Error deleting account:', err);
            setError(err.response?.data?.message || 'Deletion failed');
        }
    };

    return (
        <Container maxWidth="sm">
            <Box mt={4} p={4} boxShadow={3} borderRadius={2}>
                <Typography variant="h5" gutterBottom>
                    My Profile
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box display="flex" alignItems="center" mb={2}>
                    <Avatar
                        src={
                            avatar
                                ? URL.createObjectURL(avatar) 
                                : user.avatar
                                ? `${process.env.REACT_APP_API_URL}${user.avatar}`
                                : '/default-avatar.png' 
                        }
                        sx={{ width: 80, height: 80, mr: 2 }}
                    />
                    <Button variant="contained" component="label" sx={{ mr: 2 }}>
                        Change Avatar
                        <input type="file" hidden accept="image/*" onChange={handleAvatarChange} />
                    </Button>
                    <Button
                        variant="outlined"
                        color="error"
                        onClick={handleRemoveAvatar}
                        disabled={!user.avatar} 
                    >
                        Remove Avatar
                    </Button>
                </Box>
                <TextField
                    label="Username"
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                />
                <TextField
                    label="Bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    fullWidth
                    margin="normal"
                    multiline
                    rows={3}
                />
                <TextField
                    label="New Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    fullWidth
                    margin="normal"
                    helperText="Leave blank if you don't want to change the password"
                />
                <Box display="flex" justifyContent="space-between" mt={3}>
                    <Button variant="contained" color="primary" onClick={handleUpdate}>
                        Update Profile
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => setOpenDelete(true)}>
                        Delete Account
                    </Button>
                </Box>
            </Box>

            <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
                <DialogTitle>Delete Account</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete your account? This action is irreversible.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDelete(false)}>Cancel</Button>
                    <Button onClick={handleDeleteAccount} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default MyProfile;
