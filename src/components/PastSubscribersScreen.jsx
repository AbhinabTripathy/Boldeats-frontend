import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import AnimatedTable from './AnimatedTable';
import { format } from 'date-fns';

const PastSubscribersScreen = () => {
  const columns = [
    { id: 'userId', label: 'User ID' },
    { id: 'name', label: 'Name' },
    { id: 'vendorId', label: 'Vendor ID' },
    { id: 'startDate', label: 'Start Date' },
    { id: 'endDate', label: 'End Date' },
  ];

  // Sample data - replace with actual data from your backend
  const data = [
    {
      id: 1,
      userId: 'USER001',
      name: 'John Doe',
      vendorId: 'VEND001',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
    },
    {
      id: 2,
      userId: 'USER002',
      name: 'Jane Smith',
      vendorId: 'VEND002',
      startDate: '2023-02-15',
      endDate: '2023-11-30',
    },
    {
      id: 3,
      userId: 'USER003',
      name: 'Rajesh Kumar',
      vendorId: 'VEND003',
      startDate: '2023-03-01',
      endDate: '2023-10-31',
    },
    {
      id: 4,
      userId: 'USER004',
      name: 'Priya Sharma',
      vendorId: 'VEND004',
      startDate: '2023-04-15',
      endDate: '2023-09-30',
    },
    {
      id: 5,
      userId: 'USER005',
      name: 'Amit Patel',
      vendorId: 'VEND005',
      startDate: '2023-05-01',
      endDate: '2023-08-31',
    },
  ];

  // Format dates in the data
  const formattedData = data.map(item => ({
    ...item,
    startDate: format(new Date(item.startDate), 'dd/MM/yyyy'),
    endDate: format(new Date(item.endDate), 'dd/MM/yyyy'),
  }));

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Past Subscribers
        </Typography>
      </Stack>
      <AnimatedTable
        columns={columns}
        data={formattedData}
        title="Past Subscribers Table"
      />
    </Box>
  );
};

export default PastSubscribersScreen; 