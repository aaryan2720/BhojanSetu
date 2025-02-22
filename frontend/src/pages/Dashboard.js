import { FilterList, Search } from '@mui/icons-material';
import { Box, Container, Grid, IconButton, InputAdornment, Menu, MenuItem, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FoodListing from '../components/FoodListing';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const [listings, setListings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [sortBy, setSortBy] = useState('recent');
  const { token, user } = useAuth();

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings', {
          headers: { 'x-auth-token': token }
        });
        setListings(response.data);
      } catch (error) {
        console.error('Error fetching listings:', error);
      }
    };

    fetchListings();
  }, [token]);

  const handleReserve = async (listingId) => {
    try {
      await axios.put(
        `http://localhost:5000/api/listings/${listingId}/reserve`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      // Refresh listings
      const response = await axios.get('http://localhost:5000/api/listings', {
        headers: { 'x-auth-token': token }
      });
      setListings(response.data);
    } catch (error) {
      console.error('Error reserving listing:', error);
    }
  };

  const filteredListings = listings
    .filter(listing => 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'expiringSoon':
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        case 'quantity':
          return b.quantity - a.quantity;
        default:
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

  const renderWelcomeMessage = () => {
    switch (user?.userType) {
      case 'donor':
        return "Share your surplus food with those in need";
      case 'ngo':
        return "Connect with donors and help distribute food";
      case 'seeker':
        return "Find available food donations near you";
      default:
        return "Welcome to Food Share Platform";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {renderWelcomeMessage()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            fullWidth
            placeholder="Search food listings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
          />
          <IconButton onClick={(e) => setFilterAnchor(e.currentTarget)}>
            <FilterList />
          </IconButton>
          <Menu
            anchorEl={filterAnchor}
            open={Boolean(filterAnchor)}
            onClose={() => setFilterAnchor(null)}
          >
            <MenuItem onClick={() => { setSortBy('recent'); setFilterAnchor(null); }}>
              Most Recent
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('expiringSoon'); setFilterAnchor(null); }}>
              Expiring Soon
            </MenuItem>
            <MenuItem onClick={() => { setSortBy('quantity'); setFilterAnchor(null); }}>
              Highest Quantity
            </MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {filteredListings.map((listing) => (
          <Grid item xs={12} sm={6} md={4} key={listing._id}>
            <FoodListing
              listing={listing}
              onReserve={() => handleReserve(listing._id)}
              showActions={user?.userType === 'ngo' || user?.userType === 'seeker'}
            />
          </Grid>
        ))}
        {filteredListings.length === 0 && (
          <Box sx={{ width: '100%', textAlign: 'center', mt: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No available listings found
            </Typography>
          </Box>
        )}
      </Grid>
    </Container>
  );
};

export default Dashboard; 