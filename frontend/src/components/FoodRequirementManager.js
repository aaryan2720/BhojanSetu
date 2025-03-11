import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import {
    Button,
    Card,
    CardContent,
    Grid,
    IconButton,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from '@mui/material';
import React, { useState } from 'react';

const FoodRequirementManager = ({ requirements, onUpdate }) => {
  const [newRequirement, setNewRequirement] = useState({
    type: '',
    quantity: '',
    unit: 'kg'
  });

  const foodTypes = [
    'Rice', 'Dal', 'Vegetables', 'Bread', 'Fruits',
    'Milk Products', 'Snacks', 'Prepared Meals'
  ];

  const units = ['kg', 'liters', 'pieces', 'packets', 'servings'];

  const handleAdd = () => {
    if (!newRequirement.type || !newRequirement.quantity) return;

    onUpdate([...requirements, newRequirement]);
    setNewRequirement({ type: '', quantity: '', unit: 'kg' });
  };

  const handleDelete = (index) => {
    const updatedRequirements = requirements.filter((_, i) => i !== index);
    onUpdate(updatedRequirements);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Food Requirements
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Food Type"
              value={newRequirement.type}
              onChange={(e) => setNewRequirement({
                ...newRequirement,
                type: e.target.value
              })}
            >
              {foodTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              type="number"
              fullWidth
              label="Quantity"
              value={newRequirement.quantity}
              onChange={(e) => setNewRequirement({
                ...newRequirement,
                quantity: e.target.value
              })}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="Unit"
              value={newRequirement.unit}
              onChange={(e) => setNewRequirement({
                ...newRequirement,
                unit: e.target.value
              })}
            >
              {units.map((unit) => (
                <MenuItem key={unit} value={unit}>
                  {unit}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAdd}
              fullWidth
              sx={{ height: '100%' }}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Food Type</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Unit</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requirements.map((req, index) => (
              <TableRow key={index}>
                <TableCell>{req.type}</TableCell>
                <TableCell>{req.quantity}</TableCell>
                <TableCell>{req.unit}</TableCell>
                <TableCell>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default FoodRequirementManager; 