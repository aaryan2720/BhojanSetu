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
    Box,
    Button,
    Card,
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import axios from '../../utils/axiosConfig';

const NGOManagement = () => {
  const [ngos, setNgos] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNGOs();
  }, []);

  const fetchNGOs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/admin/ngos');
      setNgos(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch NGOs');
      console.error('Error fetching NGOs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ngoId, newStatus) => {
    try {
      await axios.put(`/api/admin/ngos/${ngoId}/status`, { status: newStatus });
      fetchNGOs();
    } catch (error) {
      console.error('Error updating NGO status:', error);
    }
  };

  const handleDeleteNGO = async (ngoId) => {
    if (window.confirm('Are you sure you want to delete this NGO?')) {
      try {
        await axios.delete(`/api/admin/ngos/${ngoId}`);
        fetchNGOs();
      } catch (error) {
        console.error('Error deleting NGO:', error);
      }
    }
  };

  const filteredNGOs = ngos.filter(ngo => {
    const matchesSearch = 
      ngo.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ngo.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || ngo.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

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
          NGO Management
        </Typography>
        <Typography color="textSecondary">
          Manage and monitor all registered NGOs in the system
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Total NGOs</Typography>
            <Typography variant="h3">{ngos.length}</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Active NGOs</Typography>
            <Typography variant="h3">
              {ngos.filter(ngo => ngo.status === 'active').length}
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6">Suspended NGOs</Typography>
            <Typography variant="h3">
              {ngos.filter(ngo => ngo.status === 'suspended').length}
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              placeholder="Search NGOs..."
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
                <MenuItem value="all">All NGOs</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="suspended">Suspended</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* NGOs Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Organization</TableCell>
              <TableCell>Contact Person</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNGOs
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((ngo) => (
                <TableRow key={ngo._id}>
                  <TableCell>{ngo.organization}</TableCell>
                  <TableCell>{ngo.name}</TableCell>
                  <TableCell>{ngo.email}</TableCell>
                  <TableCell>{ngo.phone}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getStatusIcon(ngo.status)}
                      {ngo.status}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton 
                          size="small"
                          onClick={() => setSelectedNGO(ngo)}
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
                          onClick={() => handleDeleteNGO(ngo._id)}
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
          count={filteredNGOs.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(event, newPage) => setPage(newPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>

      {/* NGO Details Dialog */}
      <Dialog
        open={Boolean(selectedNGO)}
        onClose={() => setSelectedNGO(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          NGO Details - {selectedNGO?.organization}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Organization Info</Typography>
              <Typography>Name: {selectedNGO?.organization}</Typography>
              <Typography>Status: {selectedNGO?.status}</Typography>
              <Typography>Registration Date: {new Date(selectedNGO?.createdAt).toLocaleDateString()}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom>Contact Details</Typography>
              <Typography>Contact Person: {selectedNGO?.name}</Typography>
              <Typography>Email: {selectedNGO?.email}</Typography>
              <Typography>Phone: {selectedNGO?.phone}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>Address</Typography>
              <Typography>
                {selectedNGO?.address?.street}, {selectedNGO?.address?.city}, {selectedNGO?.address?.state} {selectedNGO?.address?.zipCode}
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedNGO(null)}>Close</Button>
          <Button 
            color={selectedNGO?.status === 'active' ? 'error' : 'success'}
            onClick={() => handleStatusChange(
              selectedNGO?._id, 
              selectedNGO?.status === 'active' ? 'suspended' : 'active'
            )}
          >
            {selectedNGO?.status === 'active' ? 'Suspend NGO' : 'Activate NGO'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default NGOManagement; 