import { Storage } from '@mui/icons-material';
import { Alert, Box, Button, Snackbar, Typography } from '@mui/material';
import React from 'react';

const StorageBookingNotification = ({ notification, onClose }) => {
  return (
    <Snackbar
      open={true}
      autoHideDuration={6000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert
        icon={<Storage />}
        severity={notification.status === 'confirmed' ? 'success' : 'info'}
        onClose={onClose}
      >
        <Typography variant="subtitle2">
          {notification.title}
        </Typography>
        <Typography variant="body2">
          {notification.message}
        </Typography>
        {notification.actionUrl && (
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              color="inherit"
              href={notification.actionUrl}
            >
              View Details
            </Button>
          </Box>
        )}
      </Alert>
    </Snackbar>
  );
};

export default StorageBookingNotification; 