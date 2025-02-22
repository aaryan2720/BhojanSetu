import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating, TextField, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const RatingDialog = ({ open, onClose, listing, userToRate, onRatingSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSubmit = async () => {
    try {
      await axios.post(
        'http://localhost:5000/api/ratings',
        {
          listingId: listing._id,
          rating,
          feedback
        },
        {
          headers: { 'x-auth-token': token }
        }
      );
      onRatingSubmitted();
      onClose();
    } catch (error) {
      setError('Failed to submit rating');
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Rate {userToRate.organization}</DialogTitle>
      <DialogContent>
        <Box sx={{ my: 2 }}>
          <Typography component="legend">Rating</Typography>
          <Rating
            value={rating}
            onChange={(event, newValue) => {
              setRating(newValue);
            }}
            size="large"
          />
        </Box>
        <TextField
          fullWidth
          label="Feedback"
          multiline
          rows={4}
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          margin="normal"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={!rating}>
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RatingDialog; 