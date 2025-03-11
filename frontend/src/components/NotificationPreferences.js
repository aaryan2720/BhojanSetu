import { Email, NotificationsActive, Phone } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Divider,
    FormControlLabel,
    Grid,
    Switch,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from '../utils/axiosConfig';

const NotificationPreferences = () => {
  const [preferences, setPreferences] = useState({
    email: {
      eventReminders: true,
      storageUpdates: true,
      requirementUpdates: true
    },
    push: {
      eventReminders: true,
      storageUpdates: true,
      requirementUpdates: true
    },
    sms: {
      eventReminders: false,
      storageUpdates: false,
      requirementUpdates: false
    }
  });

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data } = await axios.get('/users/notification-preferences');
      setPreferences(data);
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const handlePreferenceChange = async (channel, type) => {
    try {
      const newPreferences = {
        ...preferences,
        [channel]: {
          ...preferences[channel],
          [type]: !preferences[channel][type]
        }
      };

      await axios.put('/users/notification-preferences', newPreferences);
      setPreferences(newPreferences);
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const PreferenceSection = ({ title, icon, channel }) => (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        {icon}
        <Typography variant="h6" sx={{ ml: 1 }}>
          {title}
        </Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences[channel].eventReminders}
                onChange={() => handlePreferenceChange(channel, 'eventReminders')}
              />
            }
            label="Event Reminders"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences[channel].storageUpdates}
                onChange={() => handlePreferenceChange(channel, 'storageUpdates')}
              />
            }
            label="Storage Updates"
          />
        </Grid>
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Switch
                checked={preferences[channel].requirementUpdates}
                onChange={() => handlePreferenceChange(channel, 'requirementUpdates')}
              />
            }
            label="Requirement Updates"
          />
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>
          Notification Preferences
        </Typography>
        <PreferenceSection
          title="Push Notifications"
          icon={<NotificationsActive color="primary" />}
          channel="push"
        />
        <Divider sx={{ my: 2 }} />
        <PreferenceSection
          title="Email Notifications"
          icon={<Email color="primary" />}
          channel="email"
        />
        <Divider sx={{ my: 2 }} />
        <PreferenceSection
          title="SMS Notifications"
          icon={<Phone color="primary" />}
          channel="sms"
        />
      </CardContent>
    </Card>
  );
};

export default NotificationPreferences; 