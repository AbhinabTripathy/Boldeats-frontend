import React, { useState, useEffect } from 'react';
import { Box, Typography, Stack, useTheme, useMediaQuery, CircularProgress } from '@mui/material';
import AnimatedTable from './AnimatedTable';
import { format, isValid, parseISO } from 'date-fns';
import axios from 'axios';

const VendorPastSubscribers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to safely format dates
  const formatDate = (dateString) => {
    try {
      if (!dateString) return '-';
      const date = typeof dateString === 'string' ? parseISO(dateString) : dateString;
      return isValid(date) ? format(date, 'dd/MM/yyyy') : '-';
    } catch (error) {
      return '-';
    }
  };

  useEffect(() => {
    const fetchPastSubscribers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('vendorToken');
        const vendorUser = JSON.parse(localStorage.getItem('vendorUser'));
        const vendorId = vendorUser?.id;
        if (!token || !vendorId) throw new Error('No authentication token or vendor ID found');
        const response = await axios.get(`https://api.boldeats.in/api/vendors/past-subscribers/${vendorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setData(response.data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch past subscribers');
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPastSubscribers();
  }, []);

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
          return '₹0';
        }
      }
    }
  ].filter(col => !col.hide);

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
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <Typography color="error">{error}</Typography>
        </Box>
      ) : (
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
      )}
    </Box>
  );
};

export default VendorPastSubscribers; 