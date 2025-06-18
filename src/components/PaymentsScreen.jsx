import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress, Button, Snackbar, Alert } from '@mui/material';
import { GridOn, Refresh, FileUpload, Visibility, ImageNotSupported } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';

const PaymentsScreen = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState({});
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Fetch payment data from API
  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://api.boldeats.in/api/admin/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch payments');
      }

      const responseData = await response.json();
      console.log('API Response:', responseData);

      const data = responseData.data || responseData;
      
      if (!Array.isArray(data)) {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid data format received from API');
      }
      
      // Transform the data to match our table structure
      const transformedPayments = data.map((payment, index) => ({
        id: payment.id || index + 1,
        slNo: index + 1,
        paymentId: payment.paymentId || `PAY${String(index + 1).padStart(6, '0')}`,
        userId: payment.userId,
        customerName: payment.customerName || payment.userName,
        vendorId: payment.vendorId,
        vendorName: payment.vendorName,
        paymentAmount: `₹${payment.amount || 0}`,
        paymentMethod: payment.paymentMethod || 'UPI',
        paymentStatus: payment.status === 'Completed' ? 'Approved' : 
                      payment.status === 'Failed' ? 'Rejected' : 
                      payment.status || 'Pending',
        paymentScreenshot: payment.screenshot || null,
        adminPaymentProof: payment.adminProof || null,
        createdAt: payment.createdAt || new Date().toISOString()
      }));

      setPayments(transformedPayments);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching payments:', err);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

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
      render: (row) => row.paymentMethod
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
            <MenuItem value="Approved" sx={{ color: 'success.main' }}>Approved</MenuItem>
            <MenuItem value="Pending" sx={{ color: 'warning.main' }}>Pending</MenuItem>
            <MenuItem value="Rejected" sx={{ color: 'error.main' }}>Rejected</MenuItem>
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
      case 'Approved':
        return 'success.main';
      case 'Pending':
        return 'warning.main';
      case 'Rejected':
        return 'error.main';
      default:
        return 'text.primary';
    }
  };

  const handlePaymentStatusChange = async (paymentId, newStatus) => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Find the payment to get its paymentId
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      const response = await fetch(`https://api.boldeats.in/api/payment/approve/${payment.paymentId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.message || 'Failed to update payment status');
      }

      // Update local state only after successful API call
      setPayments(prevPayments => 
        prevPayments.map(payment => 
          payment.id === paymentId 
            ? { ...payment, paymentStatus: newStatus }
            : payment
        )
      );

      // Show success message based on the status
      let successMessage = '';
      if (newStatus === 'Approved') {
        successMessage = 'Payment approved and subscription created successfully';
      } else if (newStatus === 'Rejected') {
        successMessage = 'Payment rejected successfully';
      }

      setSnackbar({
        open: true,
        message: successMessage,
        severity: 'success'
      });

      // Refresh the payments list after a short delay
      setTimeout(() => {
        fetchPayments();
      }, 2000);

    } catch (err) {
      console.error('Error updating payment status:', err);
      setSnackbar({
        open: true,
        message: err.message || 'Failed to update payment status',
        severity: 'error'
      });
    }
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
    fetchPayments();
  };

  // Add handleCloseSnackbar function
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
            <IconButton onClick={refreshData} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <Refresh />}
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
              disabled={loading}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Payments Table (${filteredData.length} payments)`}
        loading={loading}
      />
      
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PaymentsScreen;