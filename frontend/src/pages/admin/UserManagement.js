import {
    Block,
    CheckCircle,
    Delete,
    Edit,
    FilterList,
    Search,
    Visibility
} from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    byType: {}
  });

  const userTypes = ['all', 'ngo', 'donor', 'seeker', 'eventManager'];

  useEffect(() => {
    const initializeData = async () => {
      try {
        await Promise.all([
          fetchUsers(selectedTab),
          fetchStats()
        ]);
      } catch (error) {
        console.error('Error initializing data:', error);
      }
    };

    initializeData();
  }, []);

  const fetchUsers = async (type = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching users for type:', type);
      
      const response = await axios.get('/admin/users', {
        params: { userType: type }
      });
      
      console.log('API Response:', response.data);
      
      if (Array.isArray(response.data)) {
        setUsers(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError('Invalid data received from server');
      }
    } catch (err) {
      console.error('Error details:', err.response || err);
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await axios.put(`/api/admin/users/${userId}/status`, { status: newStatus });
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/api/admin/users/${userId}`);
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    fetchUsers(newValue);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.organization?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    const matchesType = selectedTab === 'all' || user.userType === selectedTab;
    
    return matchesSearch && matchesFilter && matchesType;
  });

  const getUserTypeCount = (type) => {
    return type === 'all' 
      ? users.length 
      : users.filter(user => user.userType === type).length;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle color="success" />;
      case 'suspended':
        return <Block color="error" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          User Management
        </Typography>
        <Typography color="textSecondary">
          Manage and monitor all users in the system
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} lg={3}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{stats.total}</Typography>
          </Card>
        </Grid>
        {Object.entries(stats.byType).map(([type, typeStats]) => (
          <Grid item xs={12} sm={6} lg={3} key={type}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                {type}s
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body1" color="textSecondary">
                  Total: {typeStats.total}
                </Typography>
                <Typography variant="body1" color="success.main">
                  Active: {typeStats.active}
                </Typography>
                {typeStats.suspended > 0 && (
                  <Typography variant="body1" color="error.main">
                    Suspended: {typeStats.suspended}
                  </Typography>
                )}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* User Type Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label={`All Users (${stats.total})`}
            value="all"
          />
          {Object.entries(stats.byType).map(([type, typeStats]) => (
            <Tab 
              key={type}
              label={`${type} (${typeStats.total})`}
              value={type}
              sx={{ textTransform: 'capitalize' }}
            />
          ))}
        </Tabs>
      </Paper>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Filter by Status</InputLabel>
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                startAdornment={<FilterList sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Show loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Show error state */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={() => fetchUsers(selectedTab)}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      {/* Show empty state */}
      {!loading && !error && users.length === 0 && (
        <Alert severity="info">No users found</Alert>
      )}

      {/* Users Table */}
      {!loading && !error && users.length > 0 && (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>User Type</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip 
                        label={user.userType}
                        size="small"
                        color="primary"
                        sx={{ textTransform: 'capitalize' }}
                      />
                    </TableCell>
                    <TableCell>{user.organization || '-'}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getStatusIcon(user.status)}
                        {user.status}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton 
                            size="small"
                            onClick={() => setSelectedUser(user)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton 
                            size="small"
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton 
                            size="small"
                            color="error"
                            onClick={() => handleDeleteUser(user._id)}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredUsers.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(event, newPage) => setPage(newPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(parseInt(event.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      )}

      {/* User Details Dialog */}
      <Dialog
        open={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          User Details - {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Basic Info</Typography>
              <Typography>Name: {selectedUser?.name}</Typography>
              <Typography>Email: {selectedUser?.email}</Typography>
              <Typography>User Type: {selectedUser?.userType}</Typography>
              <Typography>Status: {selectedUser?.status}</Typography>
              <Typography>Joined: {new Date(selectedUser?.createdAt).toLocaleDateString()}</Typography>
            </Grid>
            {selectedUser?.organization && (
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom>Organization Details</Typography>
                <Typography>Name: {selectedUser?.organization}</Typography>
                <Typography>Phone: {selectedUser?.phone}</Typography>
              </Grid>
            )}
            {selectedUser?.address && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Address</Typography>
                <Typography>
                  {selectedUser?.address?.street}, {selectedUser?.address?.city}, 
                  {selectedUser?.address?.state} {selectedUser?.address?.zipCode}
                </Typography>
              </Grid>
            )}
            {selectedUser?.userType === 'ngo' && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>Verification Status</Typography>
                <Typography>Status: {selectedUser?.verificationStatus}</Typography>
                {selectedUser?.verificationNotes && (
                  <Typography>Notes: {selectedUser?.verificationNotes}</Typography>
                )}
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedUser(null)}>Close</Button>
          <Button 
            color={selectedUser?.status === 'active' ? 'error' : 'success'}
            onClick={() => handleStatusChange(
              selectedUser?._id, 
              selectedUser?.status === 'active' ? 'suspended' : 'active'
            )}
          >
            {selectedUser?.status === 'active' ? 'Suspend User' : 'Activate User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default UserManagement; 