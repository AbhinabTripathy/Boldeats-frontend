import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { GridOn, Refresh } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useUsers } from '../contexts/UserContext';
import { useVendors } from '../contexts/VendorContext';

const PaymentsScreen = () => {
  const { users, loading: usersLoading } = useUsers();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate payment data based on user and vendor data
  useEffect(() => {
    if (users.length > 0 && vendors.length > 0) {
      setLoading(true);
      
      // Create payments based on user data
      const generatedPayments = [];
      let id = 1;
      
      users.forEach(user => {
        // Check if user has payments
        if (user.payments && user.payments.length > 0) {
          // Create a payment for each payment ID
          user.payments.forEach(paymentId => {
            // Generate random payment details
            const paymentMethods = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card'];
            const amounts = [1499, 2499, 3499, 4999, 6999];
            
            // Get a random vendor from the vendors list
            const randomVendor = vendors[Math.floor(Math.random() * vendors.length)];
            
            generatedPayments.push({
              id: id,
              slNo: id,
              paymentId: paymentId,
              userId: user.id,
              customerName: user.name,
              vendorId: randomVendor.id,
              vendorName: randomVendor.name,
              paymentAmount: `₹${amounts[Math.floor(Math.random() * amounts.length)]}`,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              paymentStatus: Math.random() > 0.2 ? 'Completed' : (Math.random() > 0.5 ? 'Pending' : 'Failed'),
            });
            id++; // Increment id after using it
          });
        }
      });
      
      setPayments(generatedPayments);
      setLoading(false);
    }
  }, [users, vendors]);

  const columns = [
    { id: 'slNo', label: 'Serial Number' },
    { id: 'paymentId', label: 'Payment ID' },
    { id: 'userId', label: 'User ID' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'vendorId', label: 'Vendor ID' },
    { id: 'paymentAmount', label: 'Payment Amount', align: 'right' },
    { id: 'paymentMethod', label: 'Payment Method' },
    { 
      id: 'paymentStatus', 
      label: 'Payment Status',
      render: (row) => (
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={row.paymentStatus}
            onChange={(e) => handlePaymentStatusChange(row.id, e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                color: getStatusColor(row.paymentStatus),
                fontWeight: 'medium'
              }
            }}
          >
            <MenuItem value="Completed" sx={{ color: 'success.main' }}>Completed</MenuItem>
            <MenuItem value="Pending" sx={{ color: 'warning.main' }}>Pending</MenuItem>
            <MenuItem value="Failed" sx={{ color: 'error.main' }}>Failed</MenuItem>
          </Select>
        </FormControl>
      )
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'success.main';
      case 'Pending':
        return 'warning.main';
      case 'Failed':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const handlePaymentStatusChange = (paymentId, newStatus) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, paymentStatus: newStatus }
          : payment
      )
    );
  };

  const filteredData = selectedPaymentMethod === 'all' 
    ? payments 
    : payments.filter(payment => payment.paymentMethod === selectedPaymentMethod);

  // Export to Excel function
  const exportToExcel = () => {
    const excelData = filteredData.map(payment => ({
      'Serial Number': payment.slNo,
      'Payment ID': payment.paymentId,
      'User ID': payment.userId,
      'Customer Name': payment.customerName,
      'Vendor ID': payment.vendorId,
      'Payment Amount': payment.paymentAmount,
      'Payment Method': payment.paymentMethod,
      'Payment Status': payment.paymentStatus,
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    
    const fileName = `payments_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const refreshData = () => {
    setLoading(true);
    // Simulate a refresh by waiting a bit then resetting the loading state
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4">
          Payments
        </Typography>
        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="payment-method-label">Payment Method</InputLabel>
            <Select
              labelId="payment-method-label"
              id="payment-method-select"
              value={selectedPaymentMethod}
              label="Payment Method"
              onChange={handlePaymentMethodChange}
            >
              <MenuItem value="all">All Methods</MenuItem>
              <MenuItem value="Credit Card">Credit Card</MenuItem>
              <MenuItem value="UPI">UPI</MenuItem>
              <MenuItem value="Net Banking">Net Banking</MenuItem>
              <MenuItem value="Debit Card">Debit Card</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} disabled={loading || usersLoading || vendorsLoading}>
              {loading || usersLoading || vendorsLoading ? (
                <CircularProgress size={24} />
              ) : (
                <Refresh />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Excel">
            <IconButton 
              onClick={exportToExcel}
              sx={{
                backgroundColor: '#E8F5E9',
                '&:hover': {
                  backgroundColor: '#C8E6C9',
                },
                width: 40,
                height: 40
              }}
              disabled={loading || usersLoading || vendorsLoading}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Payments Table (${filteredData.length} payments)`}
        loading={loading || usersLoading || vendorsLoading}
      />
    </Box>
  );
};

export default PaymentsScreen;