import { Add, Assessment, Event, Storage } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    IconButton,
    Paper,
    Tab,
    Tabs,
    Typography,
    useTheme
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventScheduler from '../../components/EventScheduler';
import FoodRequirementManager from '../../components/FoodRequirementManager';
import RequirementTracker from '../../components/RequirementTracker';
import StorageBooking from '../../components/StorageBooking';
import StorageBookingNotification from '../../components/StorageBookingNotification';
import { useNotifications } from '../../hooks/useNotifications';
import axios from '../../utils/axiosConfig';
import EventAnalytics from './EventAnalytics';

const EventManagerDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const { notifications, clearNotification } = useNotifications('storage_booking');
  const [stats, setStats] = useState({
    totalEvents: 0,
    activeEvents: 0,
    upcomingEvents: 0,
    totalDonations: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, eventsResponse] = await Promise.all([
        axios.get('/events/stats'),
        axios.get('/events/manager')
      ]);
      setStats(statsResponse.data);
      setEvents(eventsResponse.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleFoodRequirementsUpdate = async (requirements) => {
    try {
      await axios.put(`/events/${selectedEvent._id}/requirements`, { requirements });
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating requirements:', error);
    }
  };

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%', bgcolor: color, color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon}
          <Box>
            <Typography variant="h4" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2">{title}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const QuickActionCard = ({ icon, title, description, onClick }) => (
    <Paper 
      sx={{ 
        p: 2, 
        cursor: 'pointer',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[4]
        }
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
        {icon}
        <Typography variant="h6">{title}</Typography>
      </Box>
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Event Manager Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/event-manager/create-event')}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          Create New Event
        </Button>
      </Box>

      <Paper sx={{ mb: 4 }}>
        <Tabs value={activeTab} onChange={handleTabChange}>
          <Tab label="Events" />
          <Tab label="Food Requirements" />
          <Tab label="Storage Management" />
          <Tab label="Analytics" />
        </Tabs>
      </Paper>

      {/* Events Tab */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {events.map((event) => (
            <Grid item xs={12} md={6} key={event._id}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6">{event.title}</Typography>
                <EventScheduler
                  schedule={event.schedule}
                  onUpdate={(schedule) => handleScheduleUpdate(event._id, schedule)}
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Food Requirements Tab */}
      {activeTab === 1 && selectedEvent && (
        <FoodRequirementManager
          requirements={selectedEvent.foodRequirements}
          onUpdate={handleFoodRequirementsUpdate}
        />
      )}

      {/* Storage Management Tab */}
      {activeTab === 2 && selectedEvent && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <StorageBooking
              event={selectedEvent}
              onBookingComplete={fetchDashboardData}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <StorageBookingReports eventId={selectedEvent._id} />
          </Grid>
        </Grid>
      )}

      {/* Analytics Tab */}
      {activeTab === 3 && (
        <EventAnalytics events={events} />
      )}

      {/* Notifications */}
      {notifications.map((notification) => (
        <StorageBookingNotification
          key={notification.id}
          notification={notification}
          onClose={() => clearNotification(notification.id)}
        />
      ))}

      {/* Requirement Tracker */}
      {activeTab === 1 && selectedEvent && (
        <RequirementTracker eventId={selectedEvent._id} />
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Event fontSize="large" />}
            title="Total Events"
            value={stats.totalEvents}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Event fontSize="large" />}
            title="Active Events"
            value={stats.activeEvents}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Event fontSize="large" />}
            title="Upcoming Events"
            value={stats.upcomingEvents}
            color={theme.palette.info.main}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Storage fontSize="large" />}
            title="Total Donations"
            value={stats.totalDonations}
            color={theme.palette.warning.main}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                icon={<Add color="primary" fontSize="large" />}
                title="Create Event"
                description="Set up a new food distribution event"
                onClick={() => navigate('/event-manager/create-event')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                icon={<Storage color="primary" fontSize="large" />}
                title="Manage Storage"
                description="View and manage storage bookings"
                onClick={() => navigate('/event-manager/storage')}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <QuickActionCard
                icon={<Assessment color="primary" fontSize="large" />}
                title="View Analytics"
                description="Check event statistics and reports"
                onClick={() => navigate('/event-manager/analytics')}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h5" gutterBottom>
            Recent Events
          </Typography>
          <Grid container spacing={2}>
            {events.slice(0, 3).map((event) => (
              <Grid item xs={12} md={4} key={event._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {event.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {new Date(event.date).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                      <Button
                        size="small"
                        onClick={() => navigate(`/event-manager/events/${event._id}`)}
                      >
                        View Details
                      </Button>
                      <IconButton size="small">
                        <Event />
                      </IconButton>
                    </Box>
                  </CardContent>
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