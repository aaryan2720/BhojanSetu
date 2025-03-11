import {
    Box,
    Button,
    Card,
    CardContent,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Select,
    TextField,
    Typography
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

const StorageBookingForm = ({ event, onBookingComplete }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [selectedStorage, setSelectedStorage] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create booking and get client secret
      const { data } = await axios.post('/storage/book', {
        eventId: event._id,
        storageOptionId: selectedStorage,
        startTime,
        endTime,
        quantity
      });

      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        // Confirm booking with backend
        await axios.post('/storage/confirm-payment', {
          bookingId: data.booking._id,
          paymentIntentId: result.paymentIntent.id
        });

        onBookingComplete();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Error processing booking');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Book Storage Space
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Storage Type</InputLabel>
                <Select
                  value={selectedStorage}
                  onChange={(e) => setSelectedStorage(e.target.value)}
                  required
                >
                  {event.storageOptions.map((option) => (
                    <MenuItem 
                      key={option._id} 
                      value={option._id}
                      disabled={!option.available}
                    >
                      {option.type} - ₹{option.pricePerHour}/hour
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="Start Time"
                value={startTime}
                onChange={setStartTime}
                minDateTime={event.schedule.setup.start}
                required
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <DateTimePicker
                label="End Time"
                value={endTime}
                onChange={setEndTime}
                minDateTime={startTime}
                maxDateTime={event.schedule.cleanup.end}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                type="number"
                label="Quantity (L/kg)"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <CardElement />
            </Grid>

            {error && (
              <Grid item xs={12}>
                <Typography color="error">{error}</Typography>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading || !stripe}
              >
                {loading ? 'Processing...' : 'Book Storage'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

const StorageBooking = (props) => (
  <Elements stripe={stripePromise}>
    <StorageBookingForm {...props} />
  </Elements>
);

export default StorageBooking; 