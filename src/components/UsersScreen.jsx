import React, { useState } from 'react';
import { Box, Typography, CircularProgress, Alert, Chip, IconButton, Tooltip } from '@mui/material';
import { Refresh, Person } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import { useUsers } from '../contexts/UserContext';
import { format } from 'date-fns';

const UsersScreen = () => {
  const { users, loading, error, fetchUsers } = useUsers();
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const handleRefresh = async () => {
    await fetchUsers();
    setLastRefresh(new Date());
  };

  const columns = [
    { id: 'id', label: 'User ID' },
    { 
      id: 'name', 
      label: 'User Name',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {row.profilePic ? (
            <img 
              src={row.profilePic} 
              alt={row.name} 
              style={{ 
                width: 30, 
                height: 30, 
                borderRadius: '50%',
                objectFit: 'cover'
              }} 
            />
          ) : (
            <Person fontSize="small" />
          )}
          {row.name}
        </Box>
      )
    },
    { id: 'phone', label: 'Phone Number' },
    { id: 'address', label: 'Address' },
    { id: 'email', label: 'Email' },
    { 
      id: 'joinDate', 
      label: 'Join Date',
      render: (row) => format(new Date(row.joinDate), 'dd/MM/yyyy')
    }
  ];

  if (loading && users.length === 0) {
    return (
      <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Users
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </Typography>
          <Tooltip title="Refresh Data">
            <IconButton onClick={handleRefresh} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <Refresh />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <AnimatedTable
        columns={columns}
        data={users}
        title={`Users Table (${users.length} users)`}
      />
    </Box>
  );
};

export default UsersScreen; 