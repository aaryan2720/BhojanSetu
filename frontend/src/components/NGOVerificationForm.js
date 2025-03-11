import { CloudUpload } from '@mui/icons-material';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Grid,
    Paper,
    Typography
} from '@mui/material';
import React, { useState } from 'react';
import axios from '../utils/axiosConfig';

const NGOVerificationForm = () => {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('document', file);
    formData.append('type', 'registration');

    try {
      const response = await axios.post('/users/ngo/verification/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setDocuments(prev => [...prev, response.data]);
      setSuccess('Document uploaded successfully');
    } catch (error) {
      setError(error.response?.data?.message || 'Error uploading document');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        NGO Verification Documents
      </Typography>

      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Please upload the following documents for verification:
        </Typography>
        <ul>
          <li>NGO Registration Certificate</li>
          <li>Tax Exemption Certificate</li>
          <li>Annual Reports</li>
        </ul>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Button
            variant="outlined"
            component="label"
            startIcon={<CloudUpload />}
            disabled={uploading}
            fullWidth
          >
            Upload Document
            <input
              type="file"
              hidden
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
            />
          </Button>
        </Grid>

        {uploading && (
          <Grid item xs={12}>
            <Box display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          </Grid>
        )}

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {success && (
          <Grid item xs={12}>
            <Alert severity="success">{success}</Alert>
          </Grid>
        )}

        {documents.map((doc, index) => (
          <Grid item xs={12} key={index}>
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid #ddd', 
                borderRadius: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography>{doc.originalName}</Typography>
              <Button 
                href={doc.url} 
                target="_blank"
                size="small"
              >
                View
              </Button>
            </Box>
          </Grid>
        ))}
      </Grid>
    </Paper>
  );
};

export default NGOVerificationForm; 