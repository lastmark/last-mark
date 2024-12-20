import React, { useContext } from 'react';
import { AppBar, Toolbar, Typography, Button, Avatar, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const { logout } = useContext(AuthContext);
    const user = useSelector((state) => state.user);

    return (
        <AppBar position="static">
            <Toolbar>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Chat App
                </Typography>

                {user.token? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Button color="inherit" component={Link} to="/chat">
                            Chat
                        </Button>
                        <Button color="inherit" component={Link} to="/profile">
                            Profile
                        </Button>
                        {user.admin === true && (
                            <Button color="inherit" component={Link} to="/admin/create-account">
                                Admin
                            </Button>
                        )}
                        <Avatar
                            src={user?.avatar ? `${process.env.REACT_APP_API_URL}${user.avatar}` : ''}
                            sx={{ ml: 2, mr: 2 }}
                        />
                        <Button color="inherit" onClick={logout}>
                            Logout
                        </Button>
                        <ThemeToggle />
                    </Box>
                ) : (
                    <>
                        <Button color="inherit" component={Link} to="/">
                            Login
                        </Button>
                        <ThemeToggle />
                    </>

                )}
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
