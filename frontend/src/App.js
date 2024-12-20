import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import GroupChat from './pages/GroupChat';
import MyProfile from './pages/MyProfile';
import CreateAccount from './pages/CreateAccount';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './pages/Navbar'; 
import PrivateRoute from './pages/PrivateRoute';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './store';
import { ThemeProvider } from './contexts/ThemeContext';
import { CssBaseline, Box } from '@mui/material';
import ChatComponent from "./components/ChatComponent";
import LoadingExample from './components/loadingComponent';

const App = () => {
  return (
    <Router>
      <Provider store={store}>
        <PersistGate loading={<LoadingExample/>} persistor={persistor}>
          <ThemeProvider>
            <CssBaseline />
            <AuthProvider>
              <Navbar />
              <Box
                sx={{
                  minHeight: 'calc(100vh - 64px)', 
                  backgroundColor: 'background.default',
                  padding: 2,
                }}
              >
                <ChatComponent/>
                <Routes>
                  <Route path="/" element={<Login />} />

                  <Route
                    path="/chat"
                    element={
                      <PrivateRoute>
                        <GroupChat />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <PrivateRoute>
                        <MyProfile />
                      </PrivateRoute>
                    }
                  />

                  <Route
                    path="/admin/create-account"
                    element={
                      <PrivateRoute>
                        <CreateAccount />
                      </PrivateRoute>
                    }
                  />

                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </AuthProvider>
          </ThemeProvider>
        </PersistGate>
      </Provider>
    </Router>
  );
};

export default App;
