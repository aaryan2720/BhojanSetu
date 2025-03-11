import { PhotoCamera } from '@mui/icons-material';
import { Box, Button, Container, FormControl, Grid, InputLabel, MenuItem, Paper, Select, TextField, Typography } from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../components/LocationPicker';
import { useAuth } from '../context/AuthContext';

const CreateListing = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    quantity: '',
    unit: '',
    category: '',
    expiryDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    pickupTimeWindow: {
      start: new Date(),
      end: new Date(Date.now() + 4 * 60 * 60 * 1000) // 4 hours from now
    },
    pickupAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      location: {
        coordinates: [0, 0]
      }
    },
    priceType: 'free', // Add default price type
    originalPrice: '',
    discountedPrice: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setFormData(prev => ({
      ...prev,
      pickupAddress: {
        street: location.street || '',
        city: location.city || '',
        state: location.state || '',
        zipCode: location.zipCode || '',
        location: {
          type: 'Point',
          coordinates: location.location?.coordinates || [location.longitude || 78.9629, location.latitude || 20.5937]
        }
      }
    }));
  };

  const handleImageChange = (e) => {
    if (e.target.files[0]) {
      setFormData(prev => ({
        ...prev,
        image: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Validate required fields
      if (!formData.pickupAddress?.street || 
          !formData.pickupAddress?.city || 
          !formData.pickupAddress?.state || 
          !formData.pickupAddress?.zipCode) {
        setError('Please select a complete address using the map');
        return;
      }

      // Add all fields to FormData
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('quantity', formData.quantity);
      formDataToSend.append('unit', formData.unit);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('expiryDate', formData.expiryDate.toISOString());
      formDataToSend.append('priceType', formData.priceType);
      
      if (formData.priceType === 'discounted') {
        formDataToSend.append('originalPrice', formData.originalPrice);
        formDataToSend.append('discountedPrice', formData.discountedPrice);
      }

      formDataToSend.append('pickupTimeWindow', JSON.stringify({
        start: formData.pickupTimeWindow.start,
        end: formData.pickupTimeWindow.end
      }));

      formDataToSend.append('pickupAddress', JSON.stringify(formData.pickupAddress));

      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await axios.post('http://localhost:5000/api/listings', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });

      navigate('/my-listings');
    } catch (err) {
      console.error('Error creating listing:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error creating listing');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create Food Listing
          </Typography>

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  multiline
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Unit</InputLabel>
                  <Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    label="Unit"
                  >
                    <MenuItem value="kg">Kilograms (kg)</MenuItem>
                    <MenuItem value="servings">Servings</MenuItem>
                    <MenuItem value="pieces">Pieces</MenuItem>
                    <MenuItem value="packets">Packets</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    label="Category"
                  >
                    <MenuItem value="vegetables">Vegetables</MenuItem>
                    <MenuItem value="fruits">Fruits</MenuItem>
                    <MenuItem value="grains">Grains</MenuItem>
                    <MenuItem value="prepared">Prepared Food</MenuItem>
                    <MenuItem value="bakery">Bakery Items</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Expiry Date"
                  value={formData.expiryDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      expiryDate: newValue
                    }));
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <DateTimePicker
                  label="Pickup Available Until"
                  value={formData.pickupTimeWindow.end}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      pickupTimeWindow: {
                        ...prev.pickupTimeWindow,
                        end: newValue
                      }
                    }));
                  }}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Pickup Location
                </Typography>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </Grid>

              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoCamera />}
                  fullWidth
                >
                  Upload Food Image
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Button>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Price Type</InputLabel>
                  <Select
                    name="priceType"
                    value={formData.priceType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="free">Free</MenuItem>
                    <MenuItem value="discounted">Discounted</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {formData.priceType === 'discounted' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Original Price"
                      name="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Discounted Price"
                      name="discountedPrice"
                      type="number"
                      value={formData.discountedPrice}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </>
              )}

              {error && (
                <Grid item xs={12}>
                  <Typography color="error">
                    {error}
                  </Typography>
                </Grid>
              )}

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Create Listing
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateListing; 