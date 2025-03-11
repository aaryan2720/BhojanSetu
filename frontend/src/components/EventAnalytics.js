import { Assessment, People, RestaurantMenu, Storage } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Grid,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from 'recharts';
import axios from '../utils/axiosConfig';

const EventAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    overview: {
      totalEvents: 0,
      activeEvents: 0,
      totalDonors: 0,
      totalFoodCollected: 0
    },
    foodDistribution: [],
    donorParticipation: [],
    storageUtilization: [],
    requirementFulfillment: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get('/events/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const StatCard = ({ icon, title, value, subtitle }) => (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="h4" gutterBottom>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Assessment color="primary" />}
            title="Total Events"
            value={analytics.overview.totalEvents}
            subtitle="All time"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<People color="primary" />}
            title="Active Donors"
            value={analytics.overview.totalDonors}
            subtitle="Currently participating"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<RestaurantMenu color="primary" />}
            title="Food Collected"
            value={`${analytics.overview.totalFoodCollected}kg`}
            subtitle="Total quantity"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <StatCard
            icon={<Storage color="primary" />}
            title="Storage Usage"
            value={`${analytics.overview.storageUtilization}%`}
            subtitle="Current utilization"
          />
        </Grid>

        {/* Food Distribution Trends */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Food Distribution Trends
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.foodDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="quantity" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Donor Participation */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Donor Participation
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.donorParticipation}
                    dataKey="value"
                    nameKey="name"
                    fill="#8884d8"
                  />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Requirement Fulfillment */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Requirement Fulfillment Rate
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.requirementFulfillment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="required" fill="#8884d8" />
                  <Bar dataKey="fulfilled" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EventAnalytics; 