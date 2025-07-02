import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert } from '@mui/material';
import { GridOn, Refresh, Visibility, ImageNotSupported } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { getCurrentToken, handleApiResponse } from '../utils/auth';

const VendorPayments = () => {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch vendor payments from API
  const fetchVendorPayments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const tokenData = getCurrentToken();
      if (!tokenData || tokenData.type !== 'vendor') {
        setError('Vendor authentication required');
        setLoading(false);
        return;
      }

      const response = await fetch('https://api.boldeats.in/api/payment/vendor-payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${tokenData.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await handleApiResponse(response);
      if (data) {
        // Handle different response formats
        let paymentsArray = [];
        
        // Check if data is an array
        if (Array.isArray(data)) {
          paymentsArray = data;
        }
        // Check if data has a payments property (common API pattern)
        else if (data.payments && Array.isArray(data.payments)) {
          paymentsArray = data.payments;
        }
        // Check if data has a data property (common API pattern)
        else if (data.data && Array.isArray(data.data)) {
          paymentsArray = data.data;
        }
        // Check if data has a results property (common API pattern)
        else if (data.results && Array.isArray(data.results)) {
          paymentsArray = data.results;
        }
        // If data is an object but not an array, try to extract payments
        else if (typeof data === 'object' && data !== null) {
          // Try to find any array property that might contain payments
          const arrayKeys = Object.keys(data).filter(key => Array.isArray(data[key]));
          if (arrayKeys.length > 0) {
            paymentsArray = data[arrayKeys[0]];
          }
        }
        
        console.log('API Response:', data);
        console.log('Payments Array:', paymentsArray);
        
        // Transform API data to match our table structure
        const transformedPayments = paymentsArray.map((payment, index) => ({
          id: payment.id || index + 1,
          slNo: index + 1,
          paymentId: payment.paymentId || payment.id,
          userId: payment.userId || payment.user?.id,
          customerName: payment.customerName || payment.user?.name || 'Unknown Customer',
          paymentAmount: `₹${payment.amount || payment.paymentAmount || 0}`,
          paymentForAdmin: `₹${payment.adminShare || payment.paymentForAdmin || 0}`,
          paymentForVendor: `₹${payment.vendorShare || payment.paymentForVendor || 0}`,
          paymentMethod: payment.paymentMethod || 'Unknown',
          paymentStatus: payment.status || payment.paymentStatus || 'Pending',
          paymentScreenshot: payment.screenshot || payment.paymentScreenshot || null,
          paymentDate: payment.createdAt || payment.paymentDate,
          orderId: payment.orderId,
          description: payment.description,
        }));
        
        setPayments(transformedPayments);
        
        // If no payments found, show a message
        if (transformedPayments.length === 0) {
          setError('No payments found for this vendor.');
        }
      } else {
        setError('No data received from the server.');
      }
    } catch (err) {
      console.error('Error fetching vendor payments:', err);
      setError(err.message || 'Failed to fetch payments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Load payments on component mount
  useEffect(() => {
    fetchVendorPayments();
  }, []);

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
      render: (row) => (
        <Typography
          variant="body2"
          sx={{
            color: getStatusColor(row.paymentStatus),
            fontWeight: 'medium',
            textTransform: 'capitalize'
          }}
        >
          {row.paymentStatus}
        </Typography>
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
  ];

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'success':
        return 'success.main';
      case 'pending':
        return 'warning.main';
      case 'failed':
      case 'cancelled':
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
      'Payment Date': payment.paymentDate ? format(new Date(payment.paymentDate), 'dd/MM/yyyy HH:mm') : 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor Payments');
    
    const fileName = `vendor_payments_${format(new Date(), 'dd-MM-yyyy')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const handlePaymentMethodChange = (event) => {
    setSelectedPaymentMethod(event.target.value);
  };

  const refreshData = () => {
    fetchVendorPayments();
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
          Vendor Payments
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
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
          <Tooltip title="Refresh Data">
            <IconButton onClick={refreshData} disabled={loading}>
              {loading ? (
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
              disabled={loading || payments.length === 0}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Vendor Payments (${filteredData.length} payments)`}
        loading={loading}
      />
    </Box>
  );
};

export default VendorPayments;