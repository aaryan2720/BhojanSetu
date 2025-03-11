import { AccessTime, Event, LocationOn } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardActions,
    CardContent,
    Chip,
    Container,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosConfig';

const EventManagerDashboard = () => {
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    totalDonations: 0
  });

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/manager');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/events/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4">Event Manager Dashboard</Typography>
            <Button variant="contained" color="primary">
              Create New Event
            </Button>
          </Box>
        </Grid>

        {/* Stats Cards */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Events</Typography>
            <Typography variant="h3">{stats.totalEvents}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Active Events</Typography>
            <Typography variant="h3">{stats.activeEvents}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6">Total Donations</Typography>
            <Typography variant="h3">{stats.totalDonations}</Typography>
          </Paper>
        </Grid>

        {/* Events List */}
        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Upcoming Events
          </Typography>
          <Grid container spacing={2}>
            {events.map((event) => (
              <Grid item xs={12} md={6} key={event._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{event.title}</Typography>
                    <Box sx={{ mt: 2 }}>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <Event color="action" />
                        <Typography variant="body2">
                          {new Date(event.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <LocationOn color="action" />
                        <Typography variant="body2">{event.location}</Typography>
                      </Box>
                      <Box display="flex" alignItems="center" gap={1}>
                        <AccessTime color="action" />
                        <Typography variant="body2">{event.time}</Typography>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Chip 
                        label={event.status} 
                        color={event.status === 'active' ? 'success' : 'default'}
                      />
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small">View Details</Button>
                    <Button size="small">Edit Event</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default EventManagerDashboard; 