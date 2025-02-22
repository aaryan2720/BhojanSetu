import { Box, Button, Container, Grid, Typography } from '@mui/material';
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { token } = useAuth();

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 8, mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom>
          Food Share Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Connecting food donors with NGOs to reduce food waste and help those in need
        </Typography>
        {!token && (
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                color="primary"
                size="large"
              >
                Get Started
              </Button>
            </Grid>
            <Grid item>
              <Button
                component={RouterLink}
                to="/login"
                variant="outlined"
                color="primary"
                size="large"
              >
                Login
              </Button>
            </Grid>
          </Grid>
        )}
      </Box>
    </Container>
  );
};

export default Home; 