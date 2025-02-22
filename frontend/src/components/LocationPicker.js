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
    // Default coordinates for India
    latitude: 20.5937,
    longitude: 78.9629
  });

  useEffect(() => {
    if (!mapRef.current) return;

    // Custom marker icon
    const customIcon = L.icon({
      iconUrl: '/marker-icon.png', // Add this icon to your public folder
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Center map on India
    mapInstanceRef.current = L.map(mapRef.current).setView([address.latitude, address.longitude], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstanceRef.current);

    // Add initial marker
    markerRef.current = L.marker([address.latitude, address.longitude], { icon: customIcon }).addTo(mapInstanceRef.current);

    mapInstanceRef.current.on('click', handleMapClick);

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
        street: data.address.road || '',
        city: data.address.city || data.address.town || '',
        state: data.address.state || '',
        zipCode: data.address.postcode || '',
        latitude: lat,
        longitude: lng
      };

      setAddress(newAddress);
      onLocationSelect(newAddress);
      
      // Update marker position
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      }
      
      // Center map on new location
      mapInstanceRef.current.setView([lat, lng], 16);
    } catch (error) {
      console.error('Error getting address:', error);
    }
  };

  const handleAddressSearch = async () => {
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
    setAddress(prev => ({ ...prev, [name]: value }));
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
        />
        <TextField
          label="City"
          name="city"
          value={address.city}
          onChange={handleAddressChange}
          required
        />
        <TextField
          label="State"
          name="state"
          value={address.state}
          onChange={handleAddressChange}
          required
        />
        <TextField
          label="ZIP Code"
          name="zipCode"
          value={address.zipCode}
          onChange={handleAddressChange}
          required
        />
      </Box>
      <Button 
        variant="contained" 
        onClick={handleAddressSearch}
        fullWidth
      >
        Search Location
      </Button>
    </Box>
  );
};

export default LocationPicker; 