import {
    Box,
    Button,
    Container,
    Divider,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { DateTimePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationPicker from '../../components/LocationPicker';
import axios from '../../utils/axiosConfig';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    eventType: 'distribution', // distribution, collection, awareness
    expectedAttendees: '',
    foodRequirements: [{
      type: '',
      quantity: '',
      unit: 'kg'
    }],
    schedule: {
      setup: {
        start: new Date(),
        end: new Date()
      },
      main: {
        start: new Date(),
        end: new Date()
      },
      cleanup: {
        start: new Date(),
        end: new Date()
      }
    },
    location: {
      address: '',
      street: '',
      city: '',
      state: '',
      zipCode: '',
      coordinates: [0, 0]
    },
    contactInfo: {
      name: '',
      phone: '',
      email: ''
    },
    additionalDetails: {
      volunteersNeeded: 0,
      parkingAvailable: false,
      specialInstructions: ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLocationSelect = (location) => {
    setEventData(prev => ({
      ...prev,
      location
    }));
  };

  const handleFoodRequirementChange = (index, field, value) => {
    const updatedRequirements = [...eventData.foodRequirements];
    updatedRequirements[index] = {
      ...updatedRequirements[index],
      [field]: value
    };
    setEventData(prev => ({
      ...prev,
      foodRequirements: updatedRequirements
    }));
  };

  const addFoodRequirement = () => {
    setEventData(prev => ({
      ...prev,
      foodRequirements: [
        ...prev.foodRequirements,
        { type: '', quantity: '', unit: 'kg' }
      ]
    }));
  };

  const removeFoodRequirement = (index) => {
    setEventData(prev => ({
      ...prev,
      foodRequirements: prev.foodRequirements.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/events', eventData);
      navigate('/event-manager');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event');
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4 }}>
          <Typography variant="h5" gutterBottom>
            Create New Event
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Basic Information
                </Typography>
                <TextField
                  fullWidth
                  label="Event Title"
                  name="title"
                  value={eventData.title}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Description"
                  name="description"
                  value={eventData.description}
                  onChange={handleChange}
                  required
                  sx={{ mb: 2 }}
                />
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Event Type</InputLabel>
                  <Select
                    name="eventType"
                    value={eventData.eventType}
                    onChange={handleChange}
                    required
                  >
                    <MenuItem value="distribution">Food Distribution</MenuItem>
                    <MenuItem value="collection">Food Collection</MenuItem>
                    <MenuItem value="awareness">Awareness Program</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  fullWidth
                  type="number"
                  label="Expected Attendees"
                  name="expectedAttendees"
                  value={eventData.expectedAttendees}
                  onChange={handleChange}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Schedule
                </Typography>
                <Grid container spacing={2}>
                  {/* Setup Time */}
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="Setup Start Time"
                      value={eventData.schedule.setup.start}
                      onChange={(newValue) => {
                        setEventData(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            setup: {
                              ...prev.schedule.setup,
                              start: newValue
                            }
                          }
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <DateTimePicker
                      label="Setup End Time"
                      value={eventData.schedule.setup.end}
                      onChange={(newValue) => {
                        setEventData(prev => ({
                          ...prev,
                          schedule: {
                            ...prev.schedule,
                            setup: {
                              ...prev.schedule.setup,
                              end: newValue
                            }
                          }
                        }));
                      }}
                      renderInput={(params) => <TextField {...params} fullWidth />}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Food Requirements */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Food Requirements
                </Typography>
                {eventData.foodRequirements.map((req, index) => (
                  <Box key={index} sx={{ mb: 2, display: 'flex', gap: 2 }}>
                    <TextField
                      label="Food Type"
                      value={req.type}
                      onChange={(e) => handleFoodRequirementChange(index, 'type', e.target.value)}
                      sx={{ flex: 2 }}
                    />
                    <TextField
                      type="number"
                      label="Quantity"
                      value={req.quantity}
                      onChange={(e) => handleFoodRequirementChange(index, 'quantity', e.target.value)}
                      sx={{ flex: 1 }}
                    />
                    <FormControl sx={{ flex: 1 }}>
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={req.unit}
                        onChange={(e) => handleFoodRequirementChange(index, 'unit', e.target.value)}
                      >
                        <MenuItem value="kg">Kilograms</MenuItem>
                        <MenuItem value="items">Items</MenuItem>
                        <MenuItem value="plates">Plates</MenuItem>
                      </Select>
                    </FormControl>
                    <Button
                      color="error"
                      onClick={() => removeFoodRequirement(index)}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button onClick={addFoodRequirement}>
                  Add Food Requirement
                </Button>
              </Grid>

              {/* Location */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Event Location
                </Typography>
                <LocationPicker onLocationSelect={handleLocationSelect} />
              </Grid>

              {/* Contact Information */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contact Name"
                      name="contactInfo.name"
                      value={eventData.contactInfo.name}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contact Phone"
                      name="contactInfo.phone"
                      value={eventData.contactInfo.phone}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Contact Email"
                      name="contactInfo.email"
                      value={eventData.contactInfo.email}
                      onChange={handleChange}
                      required
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  sx={{
                    mt: 3,
                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                    boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
                  }}
                >
                  Create Event
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default CreateEvent; 