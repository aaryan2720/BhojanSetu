import { Add, AdminPanelSettings, Assessment, Dashboard, Event, Person, Settings } from '@mui/icons-material';
import { AppBar, Avatar, Box, Button, Container, IconButton, Menu, MenuItem, Toolbar, Typography } from '@mui/material';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleClose();
  };

  // Render Admin Navigation
  const renderAdminNav = () => {
    if (user?.userType === 'admin') {
      return (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/admin"
            color="inherit"
            startIcon={<Dashboard />}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/admin/users"
            color="inherit"
            startIcon={<Person />}
          >
            User Management
          </Button>
          <Button
            component={Link}
            to="/admin/analytics"
            color="inherit"
            startIcon={<Assessment />}
          >
            Analytics
          </Button>
          <Button
            component={Link}
            to="/admin/settings"
            color="inherit"
            startIcon={<Settings />}
          >
            Settings
          </Button>
        </Box>
      );
    }
    return null;
  };

  // Render Event Manager Navigation
  const renderEventManagerNav = () => {
    if (user?.userType === 'eventManager') {
      return (
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            component={Link}
            to="/event-manager"
            color="inherit"
            startIcon={<Event />}
          >
            Dashboard
          </Button>
          <Button
            component={Link}
            to="/event-manager/create-event"
            color="inherit"
            startIcon={<Add />}
          >
            Create Event
          </Button>
          <Button
            component={Link}
            to="/event-manager/analytics"
            color="inherit"
            startIcon={<Assessment />}
          >
            Analytics
          </Button>
        </Box>
      );
    }
    return null;
  };

  // Render Donor/NGO Navigation
  const renderDonorNav = () => {
    if (user?.userType === 'donor' || user?.userType === 'ngo') {
      return (
        <Button
          component={Link}
          to="/create-listing"
          color="inherit"
          startIcon={<Add />}
        >
          Add Listing
        </Button>
      );
    }
    return null;
  };

  return (
    <AppBar position="static">
      <Container maxWidth="lg">
        <Toolbar>
          <Box
            component={Link}
            to="/"
            sx={{
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none',
              color: 'inherit'
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                color: '#FFFFFF',
                fontWeight: 600
              }}
            >
              BhojanSetu
            </Typography>
          </Box>

          {user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {renderAdminNav()}
              {renderEventManagerNav()}
              {renderDonorNav()}
              
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                  {user.userType === 'admin' ? (
                    <AdminPanelSettings />
                  ) : (
                    user.name?.charAt(0) || <Person />
                  )}
                </Avatar>
              </IconButton>
              
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                <MenuItem component={Link} to="/profile" onClick={handleClose}>
                  Profile
                </MenuItem>
                
                {user.userType === 'admin' && (
                  <>
                    <MenuItem component={Link} to="/admin" onClick={handleClose}>
                      Admin Dashboard
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/users" onClick={handleClose}>
                      User Management
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/analytics" onClick={handleClose}>
                      Analytics
                    </MenuItem>
                    <MenuItem component={Link} to="/admin/settings" onClick={handleClose}>
                      Settings
                    </MenuItem>
                  </>
                )}

                {user.userType === 'eventManager' && (
                  <>
                    <MenuItem component={Link} to="/event-manager" onClick={handleClose}>
                      Event Dashboard
                    </MenuItem>
                    <MenuItem component={Link} to="/event-manager/create-event" onClick={handleClose}>
                      Create Event
                    </MenuItem>
                  </>
                )}

                {['donor', 'ngo'].includes(user.userType) && (
                  <MenuItem component={Link} to="/my-listings" onClick={handleClose}>
                    My Listings
                  </MenuItem>
                )}

                <MenuItem onClick={handleLogout}>
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/register">
                Register
              </Button>
            </Box>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 