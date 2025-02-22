import { Box, FormControl, InputLabel, MenuItem, Select, Slider, TextField, Typography } from '@mui/material';
import React from 'react';

const SearchFilters = ({ filters, setFilters }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search"
          variant="outlined"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          sx={{ flex: 1 }}
        />
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Sort By</InputLabel>
          <Select
            value={filters.sortBy}
            label="Sort By"
            onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
          >
            <MenuItem value="expiryDate">Expiry Date</MenuItem>
            <MenuItem value="quantity">Quantity</MenuItem>
            <MenuItem value="createdAt">Date Added</MenuItem>
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography>Distance (km):</Typography>
        <Slider
          value={filters.distance}
          onChange={(e, newValue) => setFilters(prev => ({ ...prev, distance: newValue }))}
          valueLabelDisplay="auto"
          min={1}
          max={50}
          sx={{ maxWidth: 200 }}
        />
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Food Type</InputLabel>
          <Select
            value={filters.foodType}
            label="Food Type"
            onChange={(e) => setFilters(prev => ({ ...prev, foodType: e.target.value }))}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="fresh">Fresh Produce</MenuItem>
            <MenuItem value="prepared">Prepared Meals</MenuItem>
            <MenuItem value="packaged">Packaged Food</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default SearchFilters; 