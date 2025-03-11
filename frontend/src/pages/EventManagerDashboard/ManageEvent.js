import { Box, Container, Grid, Paper, Tab, Tabs, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import EventScheduler from '../../components/EventScheduler';
import FoodRequirementManager from '../../components/FoodRequirementManager';
import RequirementTracker from '../../components/RequirementTracker';
import StorageBookingManager from '../../components/StorageBookingManager';
import axios from '../../utils/axiosConfig';

const ManageEvent = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const response = await axios.get(`/events/${eventId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event details:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (!event) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {event.title}
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Schedule" />
            <Tab label="Requirements" />
            <Tab label="Storage" />
            <Tab label="Donors" />
          </Tabs>
        </Box>

        <Grid container spacing={3}>
          {activeTab === 0 && (
            <Grid item xs={12}>
              <EventScheduler
                schedule={event.schedule}
                onUpdate={async (schedule) => {
                  try {
                    await axios.put(`/events/${eventId}/schedule`, { schedule });
                    fetchEventDetails();
                  } catch (error) {
                    console.error('Error updating schedule:', error);
                  }
                }}
              />
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid item xs={12}>
              <FoodRequirementManager
                requirements={event.foodRequirements}
                onUpdate={async (requirements) => {
                  try {
                    await axios.put(`/events/${eventId}/requirements`, { requirements });
                    fetchEventDetails();
                  } catch (error) {
                    console.error('Error updating requirements:', error);
                  }
                }}
              />
              <Box sx={{ mt: 3 }}>
                <RequirementTracker eventId={eventId} />
              </Box>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid item xs={12}>
              <StorageBookingManager eventId={eventId} />
            </Grid>
          )}

          {activeTab === 3 && (
            <Grid item xs={12}>
              {/* Donor list and management component will go here */}
              <Typography>Donor management coming soon...</Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ManageEvent; 