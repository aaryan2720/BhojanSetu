import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { addHours } from 'date-fns';
import React from 'react';

const EventScheduler = ({ schedule, onUpdate }) => {
  const handleTimeChange = (phase, type, newValue) => {
    onUpdate({
      ...schedule,
      [phase]: {
        ...schedule[phase],
        [type]: newValue
      }
    });
  };

  // Auto-adjust end times based on start times
  const handleStartTimeChange = (phase, newValue) => {
    const defaultDurations = {
      setup: 1,
      distribution: 2,
      cleanup: 1
    };

    onUpdate({
      ...schedule,
      [phase]: {
        start: newValue,
        end: addHours(new Date(newValue), defaultDurations[phase])
      }
    });
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Event Schedule
        </Typography>

        <Grid container spacing={3}>
          {/* Setup Phase */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Setup Phase
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateTimePicker
                label="Setup Start"
                value={schedule.setup.start}
                onChange={(newValue) => handleStartTimeChange('setup', newValue)}
                sx={{ flex: 1 }}
              />
              <DateTimePicker
                label="Setup End"
                value={schedule.setup.end}
                onChange={(newValue) => handleTimeChange('setup', 'end', newValue)}
                minDateTime={schedule.setup.start}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>

          {/* Distribution Phase */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Distribution Phase
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateTimePicker
                label="Distribution Start"
                value={schedule.distribution.start}
                onChange={(newValue) => handleStartTimeChange('distribution', newValue)}
                minDateTime={schedule.setup.end}
                sx={{ flex: 1 }}
              />
              <DateTimePicker
                label="Distribution End"
                value={schedule.distribution.end}
                onChange={(newValue) => handleTimeChange('distribution', 'end', newValue)}
                minDateTime={schedule.distribution.start}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>

          {/* Cleanup Phase */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Cleanup Phase
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <DateTimePicker
                label="Cleanup Start"
                value={schedule.cleanup.start}
                onChange={(newValue) => handleStartTimeChange('cleanup', newValue)}
                minDateTime={schedule.distribution.end}
                sx={{ flex: 1 }}
              />
              <DateTimePicker
                label="Cleanup End"
                value={schedule.cleanup.end}
                onChange={(newValue) => handleTimeChange('cleanup', 'end', newValue)}
                minDateTime={schedule.cleanup.start}
                sx={{ flex: 1 }}
              />
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default EventScheduler; 