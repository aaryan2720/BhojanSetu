import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import React, { useState } from 'react';

const CreateEventForm = ({ onSubmit }) => {
  const [eventData, setEventData] = useState({
    title: '',
    description: '',
    expectedAttendees: '',
    location: {
      address: '',
      coordinates: [0, 0]
    },
    schedule: {
      setup: { start: null, end: null },
      distribution: { start: null, end: null },
      cleanup: { start: null, end: null }
    },
    cutleryRequirement: 'bring-own',
    storageOptions: [],
    foodRequirements: []
  });

  const [storageOption, setStorageOption] = useState({
    type: 'refrigerated',
    pricePerHour: '',
    capacity: ''
  });

  const handleAddStorageOption = () => {
    setEventData(prev => ({
      ...prev,
      storageOptions: [...prev.storageOptions, storageOption]
    }));
    setStorageOption({
      type: 'refrigerated',
      pricePerHour: '',
      capacity: ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(eventData);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>Create New Event</Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Event Title"
              name="title"
              value={eventData.title}
              onChange={(e) => setEventData({...eventData, title: e.target.value})}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              name="description"
              value={eventData.description}
              onChange={(e) => setEventData({...eventData, description: e.target.value})}
              required
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Schedule</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <DateTimePicker
                  label="Setup Start"
                  value={eventData.schedule.setup.start}
                  onChange={(date) => setEventData({
                    ...eventData,
                    schedule: {
                      ...eventData.schedule,
                      setup: { ...eventData.schedule.setup, start: date }
                    }
                  })}
                />
              </Grid>
              {/* Add similar DateTimePicker components for other schedule times */}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cutlery Requirement</InputLabel>
              <Select
                value={eventData.cutleryRequirement}
                onChange={(e) => setEventData({...eventData, cutleryRequirement: e.target.value})}
              >
                <MenuItem value="bring-own">Bring Your Own Cutlery</MenuItem>
                <MenuItem value="provided">Cutlery Provided</MenuItem>
                <MenuItem value="optional">Optional</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>Storage Options</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Storage Type</InputLabel>
                  <Select
                    value={storageOption.type}
                    onChange={(e) => setStorageOption({...storageOption, type: e.target.value})}
                  >
                    <MenuItem value="refrigerated">Refrigerated</MenuItem>
                    <MenuItem value="room-temperature">Room Temperature</MenuItem>
                    <MenuItem value="heated">Heated</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Price per Hour"
                  value={storageOption.pricePerHour}
                  onChange={(e) => setStorageOption({...storageOption, pricePerHour: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  type="number"
                  label="Capacity (L/kg)"
                  value={storageOption.capacity}
                  onChange={(e) => setStorageOption({...storageOption, capacity: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="outlined" onClick={handleAddStorageOption}>
                  Add Storage Option
                </Button>
              </Grid>
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
            >
              Create Event
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};

export default CreateEventForm; 