import { Container, Grid, Tab, Tabs, Typography } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import FoodListing from '../components/FoodListing';
import { useAuth } from '../context/AuthContext';

const ReservationHistory = () => {
  const [reservations, setReservations] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const { token } = useAuth();

  const fetchReservations = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/listings/my-reservations', {
        headers: { 'x-auth-token': token }
      });
      setReservations(response.data);
    } catch (error) {
      console.error('Error fetching reservations:', error);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, [token]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const filteredReservations = reservations.filter(reservation => {
    switch (tabValue) {
      case 0: // Active
        return reservation.status === 'reserved';
      case 1: // Completed
        return reservation.status === 'completed';
      default:
        return true;
    }
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Reservations
      </Typography>

      <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Active" />
        <Tab label="Completed" />
      </Tabs>

      <Grid container spacing={3}>
        {filteredReservations.map((reservation) => (
          <Grid item xs={12} md={6} key={reservation._id}>
            <FoodListing
              listing={reservation}
              showReservationDetails={true}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default ReservationHistory; 