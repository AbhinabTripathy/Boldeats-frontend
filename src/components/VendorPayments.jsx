import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { GridOn, Refresh, Visibility, ImageNotSupported } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { useUsers } from '../contexts/UserContext';
import { useVendors } from '../contexts/VendorContext';

const VendorPayments = () => {
  const { users, loading: usersLoading } = useUsers();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate payment data based on user and vendor data
  useEffect(() => {
    if (users.length > 0 && vendors.length > 0) {
      setLoading(true);
      const generatedPayments = [];
      let id = 1;
      users.forEach(user => {
        if (user.payments && user.payments.length > 0) {
          user.payments.forEach(paymentId => {
            const paymentMethods = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card'];
            const amounts = [1499, 2499, 3499, 4999, 6999];
            const paymentAmount = amounts[Math.floor(Math.random() * amounts.length)];
            // Random split for admin and vendor
            const adminShare = Math.floor(paymentAmount * (Math.random() * 0.3 + 0.1)); // 10%-40% for admin
            const vendorShare = paymentAmount - adminShare;
            generatedPayments.push({
              id: id,
              slNo: id,
              paymentId: paymentId,
              userId: user.id,
              customerName: user.name,
              paymentAmount: `₹${paymentAmount}`,
              paymentForAdmin: `₹${adminShare}`,
              paymentForVendor: `₹${vendorShare}`,
              paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
              paymentStatus: Math.random() > 0.2 ? 'Completed' : (Math.random() > 0.5 ? 'Pending' : 'Failed'),
              paymentScreenshot: user.paymentScreenshot || (Math.random() > 0.5 ? `https://source.unsplash.com/random/300x200?payment&sig=${id}` : null), // Simulate payment screenshots
            });
            id++;
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
    { id: 'paymentAmount', label: 'Payment Amount', align: 'right' },
    { 
      id: 'paymentMethod', 
      label: 'Payment Method',
      render: (row) => row.paymentMethod
    },
    { 
      id: 'paymentStatus', 
      label: 'Payment Status',
      render: (row) => row.paymentStatus
    },
    {
      id: 'paymentScreenshot',
      label: 'Payment Screenshot',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {row.paymentScreenshot ? (
            <Tooltip title="View Screenshot">
              <IconButton
                size="small"
                onClick={() => handleViewScreenshot(row.paymentScreenshot)}
                sx={{ color: 'primary.main' }}
              >
                <Visibility />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip title="No Screenshot Available">
              <ImageNotSupported color="disabled" />
            </Tooltip>
          )}
        </Stack>
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

  const handlePaymentMethodRowChange = (paymentId, newMethod) => {
    setPayments(prevPayments => 
      prevPayments.map(payment => 
        payment.id === paymentId 
          ? { ...payment, paymentMethod: newMethod }
          : payment
      )
    );
  };

  const handleViewScreenshot = (screenshot) => {
    if (screenshot) {
      window.open(screenshot, '_blank');
    }
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
      'Payment Amount': payment.paymentAmount,
      'Payment Method': payment.paymentMethod,
      'Payment Status': payment.paymentStatus,
      'Payment Screenshot': payment.paymentScreenshot ? 'Available' : 'Not Available',
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

  const handleConfirmUpload = (event) => {
    const formData = new FormData();
    const compressedFile = event.target.files[0];
    const payment = payments.find(p => p.id === event.target.id);
    if (compressedFile && payment) {
      formData.append('receipt', compressedFile);
      formData.append('vendorId', payment.vendorId);
      formData.append('amount', payment.paymentAmount.replace('₹', ''));
      formData.append('userId', payment.userId);
      formData.append('paymentId', payment.paymentId);
      // Handle the form submission
    }
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

export default VendorPayments;