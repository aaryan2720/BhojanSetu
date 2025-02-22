import { Add, Assessment, PeopleAlt } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Grid, Paper, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const DonorDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalDonations: 0,
    activeDonations: 0,
    totalBeneficiaries: 0,
    recentActivity: []
  });

  useEffect(() => {
    // Fetch donor statistics
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/listings/stats', {
          headers: { 'x-auth-token': token }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [token]);

  const StatCard = ({ icon, title, value, color }) => (
    <Card sx={{ height: '100%', backgroundColor: color, color: 'white' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {icon}
          <Box>
            <Typography variant="h6" fontWeight="bold">
              {value}
            </Typography>
            <Typography variant="body2">{title}</Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4">Donor Dashboard</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => navigate('/create-listing')}
          sx={{ 
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          Create New Listing
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<Assessment fontSize="large" />}
            title="Total Donations"
            value={stats.totalDonations}
            color={theme.palette.primary.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<Add fontSize="large" />}
            title="Active Donations"
            value={stats.activeDonations}
            color={theme.palette.success.main}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <StatCard
            icon={<PeopleAlt fontSize="large" />}
            title="Total Beneficiaries"
            value={stats.totalBeneficiaries}
            color={theme.palette.info.main}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Donation Activity
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="donations" fill={theme.palette.primary.main} />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Interest by Location
            </Typography>
            <Box sx={{ mt: 2 }}>
              {stats.locationStats?.map((location) => (
                <Box key={location.area} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">{location.area}</Typography>
                    <Typography variant="body2" color="primary">
                      {location.interested} interested
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      mt: 1,
                      width: '100%',
                      height: 8,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      overflow: 'hidden'
                    }}
                  >
                    <Box
                      sx={{
                        width: `${(location.interested / stats.totalBeneficiaries) * 100}%`,
                        height: '100%',
                        bgcolor: 'primary.main',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DonorDashboard; 