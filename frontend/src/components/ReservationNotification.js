import { Box, Button, Paper, Typography } from '@mui/material';
import React from 'react';

const ReservationNotification = ({ reservation }) => {
  return (
    <Paper sx={{ p: 2, mb: 2, bgcolor: '#e3f2fd' }}>
      <Typography variant="h6" gutterBottom>
        New Reservation!
      </Typography>
      <Typography>
        <strong>{reservation.reservedBy.name}</strong> from {reservation.reservedBy.organization} 
        has reserved your listing "{reservation.title}"
      </Typography>
      <Box sx={{ mt: 2 }}>
        <Typography variant="body2">
          Contact: {reservation.reservedBy.phone}
        </Typography>
      </Box>
      <Button 
        variant="contained" 
        sx={{ mt: 2 }}
        href={`tel:${reservation.reservedBy.phone}`}
      >
        Call Seeker
      </Button>
    </Paper>
  );
};

export default ReservationNotification; 