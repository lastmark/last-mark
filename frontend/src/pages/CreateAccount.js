import React, { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import axios from "axios";
import {useSelector } from 'react-redux';
const CreateAccount = () => {
  const user = useSelector((state) => state.user);
  const [form, setForm] = useState({
    username: "",
    password: "",
    admin: false,
  });
  // const [avatar, setAvatar] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleCheckboxChange = (e) => {
    setForm({ ...form, admin: e.target.checked });
  };

  // const handleFileChange = (e) => {
  //   setAvatar(e.target.files[0]);
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const data = {
        username: form.username,
        admin: form.admin,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/admin/create-user`,
        data,
        { headers: { "Content-Type": "application/json" } }
      );

      setSuccess("User account created successfully!");
      setForm({ username: "", password: "", admin: false });
      // setAvatar(null);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };
  if(user.admin!=true){
    window.location.href="/"
  }
  return (
    <Container maxWidth="sm">
      <Box mt={5} p={3} boxShadow={3} borderRadius={2}>
        <Typography variant="h5" align="center" gutterBottom>
          Create User Account
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
        <form onSubmit={handleSubmit}>
          <TextField
            label="Username"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          />
          {/* <TextField
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            fullWidth
            margin="normal"
            required
          /> */}
          <FormControlLabel
            control={
              <Checkbox
                checked={form.admin}
                onChange={handleCheckboxChange}
                color="primary"
              />
            }
            label="Admin User"
          />
          {/* <Typography variant="body2" color="textSecondary" gutterBottom>
            Upload Avatar (optional)
          </Typography> */}
          {/* <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ marginBottom: "1rem" }}
            /> */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Create Account
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default CreateAccount;
