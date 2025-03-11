import { CheckCircle, Error, Info, Warning } from '@mui/icons-material';
import {
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    Grid,
    LinearProgress,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from '../utils/axiosConfig';

const RequirementTracker = ({ eventId }) => {
  const [requirements, setRequirements] = useState([]);
  const [donors, setDonors] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    fetchRequirements();
    if (socket) {
      socket.on(`requirement_update_${eventId}`, handleRequirementUpdate);
      return () => socket.off(`requirement_update_${eventId}`);
    }
  }, [eventId, socket]);

  const fetchRequirements = async () => {
    try {
      const [reqResponse, donorResponse] = await Promise.all([
        axios.get(`/events/${eventId}/requirements/status`),
        axios.get(`/events/${eventId}/donors`)
      ]);
      setRequirements(reqResponse.data);
      setDonors(donorResponse.data);
    } catch (error) {
      console.error('Error fetching requirements:', error);
    }
  };

  const handleRequirementUpdate = (update) => {
    setRequirements(prev => 
      prev.map(req => 
        req.type === update.type ? { ...req, ...update } : req
      )
    );
  };

  const getStatusColor = (fulfillmentRate) => {
    if (fulfillmentRate >= 100) return 'success';
    if (fulfillmentRate >= 75) return 'info';
    if (fulfillmentRate >= 50) return 'warning';
    return 'error';
  };

  const getStatusIcon = (fulfillmentRate) => {
    if (fulfillmentRate >= 100) return <CheckCircle />;
    if (fulfillmentRate >= 75) return <Info />;
    if (fulfillmentRate >= 50) return <Warning />;
    return <Error />;
  };

  const handleNotifyDonors = async (requirementType) => {
    try {
      await axios.post(`/events/${eventId}/requirements/notify`, {
        type: requirementType
      });
    } catch (error) {
      console.error('Error notifying donors:', error);
    }
  };

  return (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Requirement Status
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Required</TableCell>
                  <TableCell>Fulfilled</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {requirements.map((req) => {
                  const fulfillmentRate = (req.fulfilled / req.required) * 100;
                  const statusColor = getStatusColor(fulfillmentRate);
                  return (
                    <TableRow key={req.type}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          {getStatusIcon(fulfillmentRate)}
                          {req.type}
                        </Box>
                      </TableCell>
                      <TableCell>{req.required} {req.unit}</TableCell>
                      <TableCell>{req.fulfilled} {req.unit}</TableCell>
                      <TableCell>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={Math.min(fulfillmentRate, 100)}
                            color={statusColor}
                          />
                          <Typography variant="body2" color="text.secondary" align="right">
                            {fulfillmentRate.toFixed(1)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleNotifyDonors(req.type)}
                          disabled={fulfillmentRate >= 100}
                        >
                          Notify Donors
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Donor Commitments
            </Typography>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Donor</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Expected Delivery</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {donors.map((donor) => (
                  <TableRow key={donor._id}>
                    <TableCell>{donor.name}</TableCell>
                    <TableCell>{donor.foodType}</TableCell>
                    <TableCell>{donor.quantity} {donor.unit}</TableCell>
                    <TableCell>
                      <Chip
                        label={donor.status}
                        color={donor.status === 'confirmed' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(donor.expectedDelivery).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default RequirementTracker; 