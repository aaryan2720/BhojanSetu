import { Delete, Edit } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from '../utils/axiosConfig';

const StorageBookingManager = ({ eventId }) => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    fetchBookings();
    
    if (socket) {
      socket.on(`storage_booking_${eventId}`, handleBookingUpdate);
      return () => socket.off(`storage_booking_${eventId}`);
    }
  }, [eventId, socket]);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get(`/events/${eventId}/storage/bookings`);
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const handleBookingUpdate = (update) => {
    setBookings(prev => 
      prev.map(booking => 
        booking._id === update._id ? { ...booking, ...update } : booking
      )
    );
  };

  const handleStatusChange = async (bookingId, status) => {
    try {
      await axios.put(`/storage/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  const handleDelete = async (bookingId) => {
    try {
      await axios.delete(`/storage/bookings/${bookingId}`);
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Storage Bookings
        </Typography>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking._id}>
                <TableCell>{booking.user.name}</TableCell>
                <TableCell>{booking.storageOption.type}</TableCell>
                <TableCell>
                  {format(new Date(booking.startTime), 'PPp')} -
                  {format(new Date(booking.endTime), 'PPp')}
                </TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>{booking.paymentStatus}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsDialogOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(booking._id)}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
          <DialogTitle>Update Booking Status</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="success"
                fullWidth
                sx={{ mb: 1 }}
                onClick={() => handleStatusChange(selectedBooking?._id, 'confirmed')}
              >
                Confirm Booking
              </Button>
              <Button
                variant="contained"
                color="error"
                fullWidth
                onClick={() => handleStatusChange(selectedBooking?._id, 'cancelled')}
              >
                Cancel Booking
              </Button>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default StorageBookingManager; 