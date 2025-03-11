import { Restaurant } from '@mui/icons-material';
import { Alert, Typography } from '@mui/material';
import React from 'react';

const CutleryNotification = ({ requirement }) => {
  const getMessage = () => {
    switch (requirement) {
      case 'bring-own':
        return 'Please bring your own cutlery to help reduce waste!';
      case 'provided':
        return 'Cutlery will be provided at the event';
      case 'optional':
        return 'You may bring your own cutlery or use provided disposables';
      default:
        return '';
    }
  };

  return (
    <Alert 
      icon={<Restaurant />}
      severity={requirement === 'bring-own' ? 'warning' : 'info'}
      sx={{ mb: 2 }}
    >
      <Typography variant="body1">
        {getMessage()}
      </Typography>
    </Alert>
  );
};

export default CutleryNotification; 