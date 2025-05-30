import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress, Button } from '@mui/material';
import { GridOn, Refresh, FileUpload, Visibility, ImageNotSupported } from '@mui/icons-material';
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
  const [uploadLoading, setUploadLoading] = useState({});

  // Generate payment data based on user and vendor data
  useEffect(() => {
    if (users.length > 0 && vendors.length > 0) {
      setLoading(true);
      
      // Create payments based on user data
      const generatedPayments = [];
      let id = 1;
      
      users.forEach(user => {
        if (user.payments && user.payments.length > 0) {
          user.payments.forEach(paymentId => {
            const paymentMethods = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card'];
            const amounts = [1499, 2499, 3499, 4999, 6999];
            
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
              paymentScreenshot: user.paymentScreenshot || null, // Get screenshot from user data
              adminPaymentProof: null // New field for admin uploaded payment proof
            });
            id++;
          });
        }
      });
      
      setPayments(generatedPayments);
      setLoading(false);
    }
  }, [users, vendors]);

  const handleScreenshotUpload = (paymentId) => (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment.id === paymentId
              ? { ...payment, paymentScreenshot: e.target.result }
              : payment
          )
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAdminPaymentUpload = (paymentId) => (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadLoading(prev => ({ ...prev, [paymentId]: true }));
      const reader = new FileReader();
      reader.onload = (e) => {
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment.id === paymentId
              ? { ...payment, adminPaymentProof: e.target.result }
              : payment
          )
        );
        setUploadLoading(prev => ({ ...prev, [paymentId]: false }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleViewScreenshot = (screenshot) => {
    if (screenshot) {
      window.open(screenshot, '_blank');
    }
  };
  
  const handleViewAdminPayment = (adminPaymentProof) => {
    if (adminPaymentProof) {
      window.open(adminPaymentProof, '_blank');
    }
  };

  const columns = [
    { id: 'slNo', label: 'Serial Number' },
    { id: 'paymentId', label: 'Payment ID' },
    { id: 'userId', label: 'User ID' },
    { id: 'customerName', label: 'Customer Name' },
    { id: 'vendorId', label: 'Vendor ID' },
    { id: 'paymentAmount', label: 'Payment Amount', align: 'right' },
    { 
      id: 'paymentMethod', 
      label: 'Payment Method',
      render: (row) => (
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <Select
            value={row.paymentMethod}
            onChange={(e) => handlePaymentMethodRowChange(row.id, e.target.value)}
            sx={{
              '& .MuiSelect-select': {
                padding: '8px 12px'
              }
            }}
          >
            <MenuItem value="Credit Card">Credit Card</MenuItem>
            <MenuItem value="UPI">UPI</MenuItem>
            <MenuItem value="Net Banking">Net Banking</MenuItem>
            <MenuItem value="Debit Card">Debit Card</MenuItem>
          </Select>
        </FormControl>
      )
    },
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
    {
      id: 'adminPaymentProof',
      label: 'Payment by Admin',
      render: (row) => (
        <Stack direction="row" spacing={1} alignItems="center">
          {row.adminPaymentProof ? (
            <>
              <Tooltip title="View Admin Payment Proof">
                <IconButton
                  size="small"
                  onClick={() => handleViewAdminPayment(row.adminPaymentProof)}
                  sx={{ color: 'primary.main' }}
                >
                  <Visibility />
                </IconButton>
              </Tooltip>
              <label htmlFor={`admin-payment-upload-${row.id}`}>
                <input
                  accept="image/*"
                  id={`admin-payment-upload-${row.id}`}
                  type="file"
                  style={{ display: 'none' }}
                  onChange={handleAdminPaymentUpload(row.id)}
                />
                <Tooltip title="Replace Admin Payment Proof">
                  <IconButton
                    component="span"
                    size="small"
                    color="primary"
                    disabled={uploadLoading[row.id]}
                  >
                    {uploadLoading[row.id] ? <CircularProgress size={20} /> : <FileUpload />}
                  </IconButton>
                </Tooltip>
              </label>
            </>
          ) : (
            <label htmlFor={`admin-payment-upload-${row.id}`}>
              <input
                accept="image/*"
                id={`admin-payment-upload-${row.id}`}
                type="file"
                style={{ display: 'none' }}
                onChange={handleAdminPaymentUpload(row.id)}
              />
              <Tooltip title="Upload Admin Payment Proof">
                <IconButton
                  component="span"
                  size="small"
                  color="primary"
                  disabled={uploadLoading[row.id]}
                >
                  {uploadLoading[row.id] ? <CircularProgress size={20} /> : <FileUpload />}
                </IconButton>
              </Tooltip>
            </label>
          )}
        </Stack>
      )
    }
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
      'Admin Payment': payment.adminPaymentProof ? 'Uploaded' : 'Not Uploaded',
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