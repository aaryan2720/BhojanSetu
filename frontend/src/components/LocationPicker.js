import { Box, Button, TextField } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import React, { useEffect, useRef, useState } from 'react';

const LocationPicker = ({ onLocationSelect }) => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [address, setAddress] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    latitude: 20.5937,
    longitude: 78.9629,
    location: {
      type: 'Point',
      coordinates: [78.9629, 20.5937]
    }
  });

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    try {
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
      });

      const map = L.map(mapRef.current).setView([address.latitude, address.longitude], 5);
      mapInstanceRef.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);

      const marker = L.marker([address.latitude, address.longitude]).addTo(map);
      markerRef.current = marker;

      map.on('click', handleMapClick);

    } catch (error) {
      console.error('Error initializing map:', error);
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleMapClick = async (e) => {
    const { lat, lng } = e.latlng;
    await updateLocationFromCoordinates(lat, lng);
  };

  const updateLocationFromCoordinates = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
      );
      const data = await response.json();

      const newAddress = {
        street: data.address.road || data.address.street || 'Unknown Street',
        city: data.address.city || data.address.town || data.address.village || 'Unknown City',
        state: data.address.state || 'Unknown State',
        zipCode: data.address.postcode || 'Unknown Postal',
        latitude: lat,
        longitude: lng,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        }
      };

      setAddress(newAddress);
      onLocationSelect && onLocationSelect(newAddress);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([lat, lng], 16);
      }
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleAddressSearch = async () => {
    if (!address.street || !address.city || !address.state) {
      return;
    }

    const searchQuery = `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon } = data[0];
        await updateLocationFromCoordinates(parseFloat(lat), parseFloat(lon));
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    const newAddress = { ...address, [name]: value };
    setAddress(newAddress);
    onLocationSelect && onLocationSelect(newAddress);
  };

  return (
    <Box>
      <Box
        ref={mapRef}
        sx={{
          height: '300px',
          width: '100%',
          mb: 2,
          borderRadius: 1,
          overflow: 'hidden'
        }}
      />
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
        <TextField
          label="Street"
          name="street"
          value={address.street}
          onChange={handleAddressChange}
          fullWidth
          required
          error={!address.street}
          helperText={!address.street ? 'Street is required' : ''}
        />
        <TextField
          label="City"
          name="city"
          value={address.city}
          onChange={handleAddressChange}
          required
          error={!address.city}
          helperText={!address.city ? 'City is required' : ''}
        />
        <TextField
          label="State"
          name="state"
          value={address.state}
          onChange={handleAddressChange}
          required
          error={!address.state}
          helperText={!address.state ? 'State is required' : ''}
        />
        <TextField
          label="ZIP Code"
          name="zipCode"
          value={address.zipCode}
          onChange={handleAddressChange}
          required
          error={!address.zipCode}
          helperText={!address.zipCode ? 'ZIP Code is required' : ''}
        />
      </Box>
      <Button 
        variant="contained" 
        onClick={handleAddressSearch}
        fullWidth
        disabled={!address.street || !address.city || !address.state}
      >
        Search Location
      </Button>
    </Box>
  );
};

export default LocationPicker; 