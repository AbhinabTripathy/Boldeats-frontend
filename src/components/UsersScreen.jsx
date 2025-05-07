import React from 'react';
import { Box, Typography } from '@mui/material';
import AnimatedTable from './AnimatedTable';

const UsersScreen = () => {
  const columns = [
    { id: 'slNo', label: 'Sl No' },
    { id: 'userId', label: 'User ID' },
    { id: 'userName', label: 'User Name' },
    { id: 'phoneNumber', label: 'Phone Number' },
    { id: 'address', label: 'Address' },
    { id: 'email', label: 'Email' },
  ];

  // Sample data with Indian context
  const data = [
    {
      id: 1,
      slNo: 1,
      userId: 'BIND001',  // BoldEats INDia user ID format
      userName: 'Rajesh Kumar',
      phoneNumber: '+91 98765-43210',
      address: '42, Nehru Street, Chennai, Tamil Nadu',
      email: 'rajesh.kumar@gmail.com',
    },
    {
      id: 2,
      slNo: 2,
      userId: 'BIND002',
      userName: 'Priya Sharma',
      phoneNumber: '+91 87654-32109',
      address: '15, MG Road, Bangalore, Karnataka',
      email: 'priya.sharma@gmail.com',
    },
    {
      id: 3,
      slNo: 3,
      userId: 'BIND003',
      userName: 'Amit Patel',
      phoneNumber: '+91 76543-21098',
      address: '78, Civil Lines, New Delhi',
      email: 'amit.patel@gmail.com',
    },
    {
      id: 4,
      slNo: 4,
      userId: 'BIND004',
      userName: 'Sneha Reddy',
      phoneNumber: '+91 95432-10987',
      address: '23, Jubilee Hills, Hyderabad, Telangana',
      email: 'sneha.reddy@gmail.com',
    },
    {
      id: 5,
      slNo: 5,
      userId: 'BIND005',
      userName: 'Arun Verma',
      phoneNumber: '+91 84321-09876',
      address: '56, Park Street, Kolkata, West Bengal',
      email: 'arun.verma@gmail.com',
    }
  ];

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Users
      </Typography>
      <AnimatedTable
        columns={columns}
        data={data}
        title="Users Table"
      />
    </Box>
  );
};

export default UsersScreen; 