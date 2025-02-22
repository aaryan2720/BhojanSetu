import { AccessTime, LocationOn, Person } from '@mui/icons-material';
import { Box, Button, Card, CardActions, CardContent, CardMedia, Chip, Divider, Typography } from '@mui/material';
import axios from 'axios';
import { format, formatDistanceToNow } from 'date-fns';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LocationMap from './LocationMap';
import RatingDialog from './RatingDialog';

const FoodListing = ({ listing, onReserve, onComplete, showActions, isOwner }) => {
  const { token } = useAuth();
  const [showRatingDialog, setShowRatingDialog] = useState(false);

  const {
    title,
    description,
    quantity,
    unit,
    expiryDate,
    status,
    image,
    pickupTimeWindow,
    pickupAddress,
    donor,
    createdAt
  } = listing;

  const handleReserve = async () => {
    try {
      const config = {
        headers: {
          'x-auth-token': token,
        },
      };
      await axios.put(
        `http://localhost:5000/api/listings/${listing._id}/reserve`,
        {},
        config
      );
      onReserve();
    } catch (error) {
      console.error('Error reserving listing:', error);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'available':
        return 'success';
      case 'reserved':
        return 'warning';
      case 'completed':
        return 'info';
      case 'expired':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Card elevation={3}>
      {image?.url && (
        <CardMedia
          component="img"
          height="200"
          image={image.url}
          alt={title}
          sx={{
            objectFit: 'cover',
            objectPosition: 'center'
          }}
        />
      )}
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {title}
          </Typography>
          <Chip
            label={status.toUpperCase()}
            color={getStatusColor()}
            size="small"
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {description}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Food Details
          </Typography>
          <Typography variant="body2">
            Quantity: {quantity} {unit}
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccessTime fontSize="small" />
            Expires: {format(new Date(expiryDate), 'PPP')}
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Pickup Details
          </Typography>
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LocationOn fontSize="small" />
            {pickupAddress.street}, {pickupAddress.city}, {pickupAddress.state} {pickupAddress.zipCode}
          </Typography>
          <Typography variant="body2">
            Available for pickup: {format(new Date(pickupTimeWindow.start), 'PPp')} - {format(new Date(pickupTimeWindow.end), 'PPp')}
          </Typography>
        </Box>

        <LocationMap coordinates={pickupAddress.location.coordinates} />

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Person fontSize="small" />
            Donor Information
          </Typography>
          <Typography variant="body2">
            Organization: {donor?.organization}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Posted {formatDistanceToNow(new Date(createdAt))} ago
          </Typography>
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ padding: 2, borderTop: '1px solid rgba(0,0,0,0.12)' }}>
          {isOwner ? (
            <Button
              color="primary"
              onClick={onComplete}
              disabled={status !== 'reserved'}
              fullWidth
              variant="contained"
              sx={{
                background: status === 'reserved' ? 
                  'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 
                  'inherit'
              }}
            >
              Mark as Completed
            </Button>
          ) : (
            <Button
              color="primary"
              onClick={handleReserve}
              disabled={status !== 'available'}
              fullWidth
              variant="contained"
              sx={{
                background: status === 'available' ? 
                  'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' : 
                  'inherit'
              }}
            >
              Reserve Food
            </Button>
          )}
        </CardActions>
      )}
      {status === 'completed' && !listing.rated && (
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setShowRatingDialog(true)}
          sx={{ mt: 1 }}
        >
          Rate Transaction
        </Button>
      )}
      <RatingDialog
        open={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        listing={listing}
        userToRate={listing.donor}
        onRatingSubmitted={() => {
          // Handle rating submission
        }}
      />
    </Card>
  );
};

export default FoodListing; 