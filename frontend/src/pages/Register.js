import { Box, Button, Container, FormControl, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: '',
    organization: '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    verificationDocument: null
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Log the data being sent
    console.log('Sending registration data:', formData);

    try {
      const response = await axios.post('http://localhost:5000/api/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        phone: formData.phone,
        city: formData.address.city,    // Make sure these are being extracted correctly
        state: formData.address.state,  // from the address object
        // For donors/NGOs only
        organization: formData.organization,
        street: formData.address.street,
        zipCode: formData.address.zipCode
      });

      login(response.data.token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      verificationDocument: e.target.files[0]
    }));
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Register
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            margin="normal"
            required
          />
          <TextField
            fullWidth
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>User Type</InputLabel>
            <Select
              name="userType"
              value={formData.userType}
              onChange={handleChange}
              required
            >
              <MenuItem value="donor">Food Donor</MenuItem>
              <MenuItem value="ngo">NGO</MenuItem>
              <MenuItem value="seeker">Food Seeker</MenuItem>
              <MenuItem value="eventManager">Event Manager</MenuItem>
            </Select>
          </FormControl>

          {(formData.userType === 'donor' || 
            formData.userType === 'ngo' || 
            formData.userType === 'eventManager') && (
            <TextField
              fullWidth
              label="Organization Name"
              name="organization"
              value={formData.organization}
              onChange={handleChange}
              margin="normal"
              required
            />
          )}

          {formData.userType === 'ngo' && (
            <Box sx={{ mt: 2 }}>
              <input
                type="file"
                accept="image/*,.pdf"
                id="verification-doc"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
              <label htmlFor="verification-doc">
                <Button variant="outlined" component="span" fullWidth>
                  Upload NGO Registration Document
                </Button>
              </label>
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                Please upload your organization's registration certificate or legal documents
              </Typography>
            </Box>
          )}

          {/* Simple address form for all users */}
          <TextField
            fullWidth
            label="Street Address"
            name="address.street"
            value={formData.address.street}
            onChange={handleChange}
            margin="normal"
            required={formData.userType !== 'seeker'}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="City"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              label="State"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              margin="normal"
              required
            />
            <TextField
              label="ZIP Code"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              margin="normal"
              required={formData.userType !== 'seeker'}
            />
          </Box>
          <TextField
            fullWidth
            label="Phone Number"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            margin="normal"
            required
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ 
              mt: 3,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
            }}
          >
            Register
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 