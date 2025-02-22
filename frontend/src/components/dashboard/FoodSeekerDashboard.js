import { LocationOn, RestaurantMenu, Timer } from '@mui/icons-material';
import { Avatar, Box, Card, CardContent, Chip, Grid, Paper, Typography } from '@mui/material';
import { format } from 'date-fns';
import React from 'react';
import LocationMap from '../LocationMap';

const FoodSeekerDashboard = ({ listings }) => {
  const getNearbyListings = () => {
    // Implementation for getting nearby listings based on user's location
    return listings.slice(0, 3);
  };

  const getExpiringListings = () => {
    return listings
      .filter(listing => listing.status === 'available')
      .sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate))
      .slice(0, 3);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Available Food Near You
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Nearby Donations
            </Typography>
            <LocationMap
              coordinates={[/* center coordinates */]}
              markers={listings.map(listing => ({
                position: listing.pickupAddress.location.coordinates,
                title: listing.title
              }))}
              height="400px"
            />
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Expiring Soon
            </Typography>
            {getExpiringListings().map(listing => (
              <Card key={listing._id} sx={{ mb: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <RestaurantMenu />
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle1">{listing.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {listing.quantity} {listing.unit}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Timer fontSize="small" color="action" />
                    <Typography variant="body2" color="error">
                      Expires {format(new Date(listing.expiryDate), 'PPP')}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {listing.pickupAddress.city}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            ))}
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Available Food Categories
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Vegetables', 'Fruits', 'Grains', 'Prepared Food', 'Bakery'].map(category => (
                <Chip
                  key={category}
                  label={category}
                  onClick={() => {/* Filter by category */}}
                  sx={{
                    bgcolor: 'primary.light',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.main',
                    },
                  }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FoodSeekerDashboard; 