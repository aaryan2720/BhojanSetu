import { Cancel, CheckCircle, CloudDownload, Pending, Search, Visibility } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    IconButton,
    Paper,
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
import axios from '../utils/axiosConfig';

const AdminDashboard = () => {
  const [pendingNGOs, setPendingNGOs] = useState([]);
  const [allNGOs, setAllNGOs] = useState([]);
  const [selectedNGO, setSelectedNGO] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [viewDocuments, setViewDocuments] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  useEffect(() => {
    fetchPendingVerifications();
    fetchAllNGOs();
    fetchStats();
  }, []);

  const fetchAllNGOs = async () => {
    try {
      const response = await axios.get('/api/admin/ngos');
      setAllNGOs(response.data);
    } catch (error) {
      console.error('Error fetching NGOs:', error);
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      const response = await axios.get('/api/admin/verifications/pending');
      setPendingNGOs(response.data);
    } catch (error) {
      console.error('Error fetching pending verifications:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/admin/verifications/stats');
      const statsData = response.data.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleVerification = async (userId, status) => {
    try {
      await axios.post('/api/admin/verifications/process', {
        userId,
        status,
        notes: verificationNotes
      });
      setSelectedNGO(null);
      setVerificationNotes('');
      fetchPendingVerifications();
      fetchAllNGOs();
      fetchStats();
    } catch (error) {
      console.error('Error processing verification:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (status) => {
    const statusProps = {
      pending: { icon: <Pending />, color: 'warning', label: 'Pending' },
      approved: { icon: <CheckCircle />, color: 'success', label: 'Approved' },
      rejected: { icon: <Cancel />, color: 'error', label: 'Rejected' }
    };
    const { icon, color, label } = statusProps[status] || statusProps.pending;
    return (
      <Chip
        icon={icon}
        label={label}
        color={color}
        size="small"
      />
    );
  };

  const handleViewDocuments = (documents) => {
    setSelectedDocuments(documents);
    setViewDocuments(true);
  };

  const filteredNGOs = allNGOs.filter(ngo => 
    ngo.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ngo.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderNGOTable = () => (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Organization</TableCell>
          <TableCell>Contact Person</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Request Date</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Documents</TableCell>
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
              <TableCell>
                {ngo.verificationRequest?.requestDate 
                  ? new Date(ngo.verificationRequest.requestDate).toLocaleDateString()
                  : 'Not submitted'}
              </TableCell>
              <TableCell>{getStatusChip(ngo.verificationStatus)}</TableCell>
              <TableCell>
                {ngo.verificationRequest?.documents?.length > 0 && (
                  <Tooltip title="View Documents">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDocuments(ngo.verificationRequest.documents)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedNGO(ngo)}
                >
                  Review
                </Button>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );

  const DocumentsDialog = () => (
    <Dialog
      open={viewDocuments}
      onClose={() => setViewDocuments(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>Verification Documents</DialogTitle>
      <DialogContent>
        <Grid container spacing={2}>
          {selectedDocuments.map((doc, index) => (
            <Grid item xs={12} key={index}>
              <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
                <CloudDownload />
                <Typography sx={{ flexGrow: 1 }}>Document {index + 1}</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  component="a"
                  href={doc}
                  target="_blank"
                >
                  View
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setViewDocuments(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderNGODialog = () => (
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
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>Organization Details:</Typography>
          <Typography>Name: {selectedNGO?.organization}</Typography>
          <Typography>Contact Person: {selectedNGO?.name}</Typography>
          <Typography>Email: {selectedNGO?.email}</Typography>
          <Typography>Phone: {selectedNGO?.phone}</Typography>
          <Typography>Address: {selectedNGO?.address?.street}, {selectedNGO?.address?.city}</Typography>
          <Typography>Status: {selectedNGO?.verificationStatus}</Typography>
          
          {selectedNGO?.verificationRequest && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 2 }} gutterBottom>
                Verification Request:
              </Typography>
              <Typography>
                Submitted: {new Date(selectedNGO.verificationRequest.requestDate).toLocaleString()}
              </Typography>
              <Typography>Message: {selectedNGO.verificationRequest.message}</Typography>
            </>
          )}
          
          {selectedNGO?.verificationNotes && (
            <Typography>Notes: {selectedNGO.verificationNotes}</Typography>
          )}
        </Box>
        {selectedNGO?.verificationStatus === 'pending' && (
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Verification Notes"
            value={verificationNotes}
            onChange={(e) => setVerificationNotes(e.target.value)}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setSelectedNGO(null)}>Close</Button>
        {selectedNGO?.verificationStatus === 'pending' && (
          <>
            <Button 
              color="error" 
              onClick={() => handleVerification(selectedNGO?._id, 'rejected')}
            >
              Reject
            </Button>
            <Button 
              color="success"
              onClick={() => handleVerification(selectedNGO?._id, 'approved')}
            >
              Approve
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Pending color="warning" />
                <Typography variant="h6" sx={{ ml: 1 }}>Pending</Typography>
              </Box>
              <Typography variant="h4">{stats.pending || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CheckCircle color="success" />
                <Typography variant="h6" sx={{ ml: 1 }}>Approved</Typography>
              </Box>
              <Typography variant="h4">{stats.approved || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Cancel color="error" />
                <Typography variant="h6" sx={{ ml: 1 }}>Rejected</Typography>
              </Box>
              <Typography variant="h4">{stats.rejected || 0}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Paper sx={{ p: 2 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="All NGOs" />
            <Tab label="Pending Verifications" />
          </Tabs>
        </Box>

        {/* Search Bar */}
        <Box sx={{ mb: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search NGOs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <Search color="action" sx={{ mr: 1 }} />
            }}
          />
        </Box>

        {tabValue === 0 ? (
          // All NGOs Table
          <>
            {renderNGOTable()}
            <TablePagination
              component="div"
              count={filteredNGOs.length}
              page={page}
              onPageChange={handleChangePage}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        ) : (
          // Pending Verifications Table
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Organization</TableCell>
                <TableCell>Contact Person</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Phone</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {pendingNGOs.map((ngo) => (
                <TableRow key={ngo._id}>
                  <TableCell>{ngo.organization}</TableCell>
                  <TableCell>{ngo.name}</TableCell>
                  <TableCell>{ngo.email}</TableCell>
                  <TableCell>{ngo.phone}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() => setSelectedNGO(ngo)}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>

      {renderNGODialog()}
      <DocumentsDialog />
    </Container>
  );
};

export default AdminDashboard; 