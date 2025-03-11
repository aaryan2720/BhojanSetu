import { CheckCircle, Error, Warning } from '@mui/icons-material';
import {
    Box,
    Card,
    CardContent,
    Grid,
    LinearProgress,
    Typography
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import axios from '../utils/axiosConfig';

const RequirementFulfillment = ({ eventId }) => {
  const [requirements, setRequirements] = useState([]);
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
      const { data } = await axios.get(`/events/${eventId}/requirements/status`);
      setRequirements(data);
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

  const getStatusIcon = (fulfillmentRate) => {
    if (fulfillmentRate >= 100) return <CheckCircle color="success" />;
    if (fulfillmentRate >= 50) return <Warning color="warning" />;
    return <Error color="error" />;
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Requirement Fulfillment Status
        </Typography>
        <Grid container spacing={2}>
          {requirements.map((req) => {
            const fulfillmentRate = (req.fulfilled / req.required) * 100;
            return (
              <Grid item xs={12} key={req.type}>
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getStatusIcon(fulfillmentRate)}
                    <Typography variant="subtitle1" sx={{ ml: 1 }}>
                      {req.type}
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 'auto' }}>
                      {fulfillmentRate.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(fulfillmentRate, 100)}
                    sx={{ height: 8, borderRadius: 4 }}
                  />
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {req.fulfilled} / {req.required} {req.unit}
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default RequirementFulfillment; 