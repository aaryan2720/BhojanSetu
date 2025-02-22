import { Box, Button, Container, Grid, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FoodListing from '../components/FoodListing';
import { useAuth } from '../context/AuthContext';

const MyListings = () => {
  const [listings, setListings] = useState([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings/my-listings', {
          headers: { 'x-auth-token': token }
        });
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchMyListings();
  }, [token]);

  const handleComplete = async (listingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/listings/${listingId}/complete`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      // Refresh listings
      const response = await axios.get('http://localhost:5000/api/listings/my-listings', {
        headers: { 'x-auth-token': token }
      });
      setListings(response.data);
    } catch (error) {
      console.error('Error completing listing:', error);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          My Listings
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/create-listing')}
        >
          Create New Listing
        </Button>
      </Box>

      <Grid container spacing={3}>
        {listings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing._id}>
            <FoodListing
              listing={listing}
              onComplete={() => handleComplete(listing._id)}
              showActions={listing.status === 'reserved'}
              isOwner={true}
            />
          </Grid>
        ))}
        {listings.length === 0 && (
          <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              You haven't created any listings yet
            </Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
};

export default MyListings; 