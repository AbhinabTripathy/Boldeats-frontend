import React, { useEffect, useState } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import AnimatedTable from './AnimatedTable';
import { format } from 'date-fns';
import { handleApiResponse } from '../utils/auth';

const PastSubscribersScreen = () => {
  const columns = [
    { id: 'userId', label: 'User ID' },
    { id: 'name', label: 'Name' },
    { id: 'vendorId', label: 'Vendor ID' },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
  ];

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) throw new Error('No authentication token found. Please login again.');
      const response = await fetch('https://api.boldeats.in/api/admin/users/past-subscribers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const result = await handleApiResponse(response);
      if (!result) return; // Token expired, handleApiResponse already handled the redirect
      
      // Assuming result is an array of users
      const formatted = result.map(item => ({
        ...item,
        startDate: item.startDate ? format(new Date(item.startDate), 'dd/MM/yyyy') : '-',
        endDate: item.endDate ? format(new Date(item.endDate), 'dd/MM/yyyy') : '-',
      }));
      setData(formatted);
    } catch (err) {
      setError(err.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Past Subscribers
        </Typography>
      </Stack>
      <AnimatedTable
        columns={columns}
        data={data}
        title="Past Subscribers Table"
      />
    </Box>
  );
};

export default PastSubscribersScreen; 