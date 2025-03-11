import {
    Box,
    Card,
    CardContent,
    Table,
    TableBody,
    TableCell,
    TableRow,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import axios from '../utils/axiosConfig';

const StorageBookingReports = ({ eventId }) => {
  const [analytics, setAnalytics] = useState({
    totalBookings: 0,
    revenue: 0,
    utilizationRate: 0,
    bookingsByType: [],
    revenueByDay: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [eventId]);

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/events/${eventId}/storage/analytics`);
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Storage Analytics
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Overview
          </Typography>
          <Table size="small">
            <TableBody>
              <TableRow>
                <TableCell>Total Bookings</TableCell>
                <TableCell align="right">{analytics.totalBookings}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Total Revenue</TableCell>
                <TableCell align="right">₹{analytics.revenue}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Utilization Rate</TableCell>
                <TableCell align="right">{analytics.utilizationRate}%</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        <Box sx={{ height: 300, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Bookings by Storage Type
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.bookingsByType}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ height: 300 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            Daily Revenue
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="revenue" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StorageBookingReports; 