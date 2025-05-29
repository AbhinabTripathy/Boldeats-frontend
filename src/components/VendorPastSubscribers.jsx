import React from 'react';
import { Box, Typography, Stack, useTheme, useMediaQuery } from '@mui/material';
import AnimatedTable from './AnimatedTable';
import { format, isValid } from 'date-fns';

const VendorPastSubscribers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return isValid(date) ? format(date, 'dd/MM/yyyy') : '-';
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const columns = [
    { 
      id: 'userId', 
      label: 'User ID',
      width: 120,
      minWidth: 100
    },
    { 
      id: 'name', 
      label: 'Name',
      width: 200,
      minWidth: 150,
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.profilePic && (
            <img 
              src={row.profilePic} 
              alt={row.name} 
              style={{ 
                width: isMobile ? 24 : 30, 
                height: isMobile ? 24 : 30, 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
          )}
          <Typography 
            sx={{ 
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {row.name}
          </Typography>
        </Box>
      )
    },
    { 
      id: 'subscriptionType', 
      label: 'Subscription Type',
      width: 150,
      minWidth: 120,
      hide: isMobile
    },
    { 
      id: 'startDate', 
      label: 'Start Date',
      width: 120,
      minWidth: 100,
      hide: isTablet,
      render: (row) => formatDate(row.startDate)
    },
    { 
      id: 'endDate', 
      label: 'End Date',
      width: 120,
      minWidth: 100,
      render: (row) => formatDate(row.endDate)
    },
    { 
      id: 'totalAmount', 
      label: 'Total Amount',
      width: 120,
      minWidth: 100,
      render: (row) => {
        try {
          return `₹${Number(row.totalAmount).toLocaleString('en-IN')}`;
        } catch (error) {
          console.error('Error formatting amount:', error);
          return '₹0';
        }
      }
    }
  ].filter(col => !col.hide);

  // Sample data - replace with actual data from your backend
  const data = [
    {
      id: 1,
      userId: 'USER001',
      name: 'John Doe',
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      subscriptionType: 'Monthly',
      totalAmount: 1499
    },
    {
      id: 2,
      userId: 'USER002',
      name: 'Jane Smith',
      startDate: '2023-02-15',
      endDate: '2023-11-30',
      subscriptionType: 'Quarterly',
      totalAmount: 3999
    },
    {
      id: 3,
      userId: 'USER003',
      name: 'Rajesh Kumar',
      startDate: '2023-03-01',
      endDate: '2023-10-31',
      subscriptionType: 'Monthly',
      totalAmount: 1499
    },
    {
      id: 4,
      userId: 'USER004',
      name: 'Priya Sharma',
      startDate: '2023-04-15',
      endDate: '2023-09-30',
      subscriptionType: 'Quarterly',
      totalAmount: 3999
    },
    {
      id: 5,
      userId: 'USER005',
      name: 'Amit Patel',
      startDate: '2023-05-01',
      endDate: '2023-08-31',
      subscriptionType: 'Monthly',
      totalAmount: 1499
    },
  ];

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 7, sm: 8 }
    }}>
      <Stack 
        direction="row" 
        justifyContent="space-between" 
        alignItems="center" 
        sx={{ 
          mb: { xs: 2, sm: 3 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}
      >
        <Typography 
          variant="h4"
          sx={{
            fontSize: { xs: '1.5rem', sm: '2rem' }
          }}
        >
          Past Subscribers
        </Typography>
      </Stack>
      <AnimatedTable
        columns={columns}
        data={data}
        title={`Past Subscribers Table (${data.length} subscribers)`}
        sx={{
          '& .MuiTableCell-root': {
            padding: { xs: '8px', sm: '16px' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}
      />
    </Box>
  );
};

export default VendorPastSubscribers; 