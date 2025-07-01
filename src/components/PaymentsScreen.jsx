import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Stack, Tooltip, Select, MenuItem, FormControl, InputLabel, CircularProgress, Button, Snackbar, Alert, Dialog, DialogContent, DialogTitle, DialogActions, DialogContentText } from '@mui/material';
import { GridOn, Refresh, FileUpload, Visibility, ImageNotSupported, Close } from '@mui/icons-material';
import AnimatedTable from './AnimatedTable';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import { handleApiResponse } from '../utils/auth';

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
  const [imageDialog, setImageDialog] = useState({
    open: false,
    imageUrl: null,
    title: '',
    loading: false
  });
  const [uploadConfirmDialog, setUploadConfirmDialog] = useState({
    open: false,
    file: null,
    paymentId: null
  });
  const [correctFieldName, setCorrectFieldName] = useState('file'); // Store the correct field name

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

      const responseData = await handleApiResponse(response);
      if (!responseData) return; // Token expired, handleApiResponse already handled the redirect

      console.log('API Response:', responseData);

      const data = responseData.data || responseData;
      
      if (!Array.isArray(data)) {
        console.error('Unexpected API response format:', data);
        throw new Error('Invalid data format received from API');
      }
      
      // Debug: Log the first payment to see its structure
      if (data.length > 0) {
        console.log('First payment structure:', data[0]);
        console.log('Available fields in payment:', Object.keys(data[0]));
      }
      
      // Transform the data to match our table structure
      const transformedPayments = data.map((payment, index) => {
        // Check for admin payment proof in various possible field names
        const adminPaymentProof = payment.adminProof || 
                                 payment.adminPaymentProof || 
                                 payment.receipt ||
                                 payment.adminReceipt ||
                                 null;
        
        // If it's a relative path, construct the full URL
        let adminPaymentProofUrl = adminPaymentProof;
        if (adminPaymentProof && !adminPaymentProof.startsWith('data:image/') && !adminPaymentProof.startsWith('http')) {
          adminPaymentProofUrl = `https://api.boldeats.in/${adminPaymentProof}`;
        }
        
        return {
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
          adminPaymentProof: adminPaymentProofUrl,
          createdAt: payment.createdAt || new Date().toISOString()
        };
      });

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

  // Test function to check API connectivity
  const testApiConnectivity = async () => {
    console.log('Testing API connectivity...');
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      console.log('No token found');
      return;
    }

    try {
      // Test the payments endpoint
      const response = await fetch('https://api.boldeats.in/api/admin/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Payments API test - Status:', response.status);
      const data = await response.json();
      console.log('Payments API test - Response:', data);
      
      // Check if there are any payments with adminPaymentProof field
      if (data.data && Array.isArray(data.data)) {
        const paymentsWithAdminProof = data.data.filter(p => p.adminProof || p.adminPaymentProof);
        console.log('Payments with admin proof:', paymentsWithAdminProof);
      }

      console.log('✅ API connectivity test completed successfully');
      
    } catch (error) {
      console.error('API connectivity test failed:', error);
    }
  };

  // Call test function on component mount
  useEffect(() => {
    testApiConnectivity();
  }, []);

  // Monitor upload confirmation dialog state changes
  useEffect(() => {
    console.log('Upload confirmation dialog state changed:', uploadConfirmDialog);
  }, [uploadConfirmDialog]);

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
    console.log('File input change triggered for payment ID:', paymentId);
    console.log('Selected file:', file);
    
    if (file) {
      console.log('Admin payment file selected:', file.name, file.type, file.size);
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        console.log('Invalid file type:', file.type);
        setSnackbar({
          open: true,
          message: 'Please select an image file',
          severity: 'error'
        });
        return;
      }

      // Validate file size (max 10MB before compression)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        console.log('File too large:', file.size);
        setSnackbar({
          open: true,
          message: 'File size should be less than 10MB. The image will be compressed automatically.',
          severity: 'warning'
        });
        // Don't return, let it proceed with compression
      }

      // Show confirmation dialog with file info
      console.log('Setting upload confirmation dialog state...');
      setUploadConfirmDialog({
        open: true,
        file: file,
        paymentId: paymentId
      });
      console.log('Upload confirmation dialog state set. Current state:', {
        open: true,
        file: file.name,
        paymentId: paymentId
      });
    } else {
      console.log('No file selected');
    }
  };

  const handleConfirmUpload = async () => {
    const { file, paymentId } = uploadConfirmDialog;
    
    console.log('Confirming upload for payment ID:', paymentId);
    console.log('File to upload:', file.name, file.type, file.size);
    
    try {
      setUploadLoading(prev => ({ ...prev, [paymentId]: true }));
      
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Find the payment to get its paymentId
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      console.log('Payment found:', payment);
      console.log('Payment ID for API:', payment.paymentId);

      // Compress the image to reduce file size
      const compressedFile = await compressImage(file);
      console.log('Original file size:', file.size, 'bytes');
      console.log('Compressed file size:', compressedFile.size, 'bytes');
      console.log('Compression ratio:', ((1 - compressedFile.size / file.size) * 100).toFixed(1) + '%');

      const formData = new FormData();
      // Include all required fields as specified by the API
      formData.append('receipt', compressedFile);
      formData.append('paymentId', payment.paymentId);
      formData.append('vendorId', payment.vendorId || '');
      formData.append('amount', payment.paymentAmount.replace('₹', '') || '0');
      formData.append('userId', payment.userId || '');

      console.log('Sending API request to upload admin payment proof...');
      console.log('FormData contents:');
      for (let pair of formData.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Use the correct API endpoint for admin payment proof upload
      console.log('Using endpoint: /api/payment/vendor-payment-receipt');
      const response = await fetch('https://api.boldeats.in/api/payment/vendor-payment-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData
      });

      console.log('Upload response status:', response.status);
      console.log('Upload response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload failed with status:', response.status);
        console.error('Error response:', errorText);
        
        // Try to parse the error response to understand what's wrong
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed error data:', errorData);
          
          if (errorData.message === 'Unexpected field') {
            console.error('The API does not recognize the field name. Expected fields might be different.');
            console.error('Try checking the API documentation for the correct field name.');
            console.error('Current field name being used:', correctFieldName);
            
            // Try to suggest alternative field names
            const alternativeFields = ['file', 'image', 'screenshot', 'receipt', 'paymentReceipt', 'adminProof', 'adminPaymentProof'];
            console.error('Try these alternative field names:', alternativeFields);
            
            throw new Error(`API does not recognize field name '${correctFieldName}'. Please try a different field name.`);
          }
        } catch (parseError) {
          console.error('Could not parse error response:', parseError);
        }
        
        if (response.status === 413) {
          throw new Error('File size too large. Please try a smaller image or compress it further.');
        } else if (response.status === 0) {
          throw new Error('CORS error: Unable to connect to the server. Please check your network connection.');
        } else if (response.status === 400) {
          throw new Error('Bad request: Please check the file format and try again.');
        } else {
          throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
        }
      }

      const responseData = await handleApiResponse(response);
      if (!responseData) {
        throw new Error('No response data received');
      }

      console.log('Upload API Response:', responseData);

      if (responseData.success) {
        // Log the full response structure for debugging
        console.log('Full API response structure:', JSON.stringify(responseData, null, 2));
        
        // Update local state with the uploaded image URL
        let adminPaymentUrl = responseData.data?.receipt
          ? `https://api.boldeats.in/${responseData.data.receipt}`
          : undefined;
        
        console.log('Admin payment URL from API:', adminPaymentUrl);
        
        if (!adminPaymentUrl) {
          console.warn('No image URL found in API response. Available fields:', Object.keys(responseData.data || {}));
          throw new Error('No image URL received from server');
        }
        
        setPayments(prevPayments =>
          prevPayments.map(payment =>
            payment.id === paymentId
              ? { ...payment, adminPaymentProof: adminPaymentUrl }
              : payment
          )
        );
        
        setSnackbar({
          open: true,
          message: 'Admin payment proof uploaded successfully',
          severity: 'success'
        });

        // Refresh the payments list after a short delay
        setTimeout(() => {
          fetchPayments();
        }, 1000);
      } else {
        throw new Error(responseData.message || 'Failed to upload admin payment proof');
      }

    } catch (err) {
      console.error('Error uploading admin payment proof:', err);
      
      // Show specific error message based on error type
      let errorMessage = err.message;
      if (err.message.includes('CORS')) {
        errorMessage = 'Server connection error. Please try again later.';
      } else if (err.message.includes('413')) {
        errorMessage = 'File too large. Please select a smaller image.';
      }
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
      
      // Don't update local state on error - let the user try again
    } finally {
      setUploadLoading(prev => ({ ...prev, [paymentId]: false }));
      setUploadConfirmDialog({ open: false, file: null, paymentId: null });
    }
  };

  // Function to compress image
  const compressImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 800;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob with compression
          canvas.toBlob((blob) => {
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          }, 'image/jpeg', 0.7); // 70% quality
        };
      };
    });
  };

  const handleCancelUpload = () => {
    console.log('Upload cancelled');
    setUploadConfirmDialog({ open: false, file: null, paymentId: null });
  };

  const handleViewScreenshot = (screenshot) => {
    if (screenshot) {
      console.log('Opening screenshot:', screenshot);
      
      // Handle relative URLs by constructing the full URL
      let imageUrl = screenshot;
      if (screenshot && !screenshot.startsWith('data:image/') && !screenshot.startsWith('http')) {
        // It's a relative path, construct the full URL
        imageUrl = `https://api.boldeats.in/${screenshot}`;
        console.log('Constructed full screenshot URL:', imageUrl);
      }
      
      setImageDialog({
        open: true,
        imageUrl: imageUrl,
        title: 'Payment Screenshot',
        loading: true
      });
    }
  };
  
  const handleViewAdminPayment = (adminPaymentProof) => {
    if (adminPaymentProof) {
      console.log('Opening admin payment proof:', adminPaymentProof);
      
      // Handle relative URLs by constructing the full URL
      let imageUrl = adminPaymentProof;
      if (adminPaymentProof && !adminPaymentProof.startsWith('data:image/') && !adminPaymentProof.startsWith('http')) {
        // It's a relative path, construct the full URL
        imageUrl = `https://api.boldeats.in/${adminPaymentProof}`;
        console.log('Constructed full admin payment URL:', imageUrl);
      }
      
      // Check if it's a valid URL or base64 data
      if (imageUrl.startsWith('data:image/') || imageUrl.startsWith('http')) {
        setImageDialog({
          open: true,
          imageUrl: imageUrl,
          title: 'Admin Payment Proof',
          loading: true
        });
      } else {
        console.error('Invalid image URL format:', adminPaymentProof);
        setSnackbar({
          open: true,
          message: 'Invalid image format. Please try uploading again.',
          severity: 'error'
        });
      }
    }
  };

  const handleCloseImageDialog = () => {
    console.log('Closing image dialog');
    setImageDialog({
      open: false,
      imageUrl: null,
      title: '',
      loading: false
    });
  };

  const handleImageError = (event) => {
    console.error('Image failed to load:', event.target.src);
    setSnackbar({
      open: true,
      message: 'Failed to load image. The image may have been deleted or the URL is invalid.',
      severity: 'error'
    });
    handleCloseImageDialog();
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
          ) : row.adminPaymentProof ? (
            <Tooltip title="View Admin Payment Proof">
              <IconButton
                size="small"
                onClick={() => handleViewAdminPayment(row.adminPaymentProof)}
                sx={{ color: 'success.main' }}
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

      const responseData = await handleApiResponse(response);
      if (!responseData) return; // Token expired, handleApiResponse already handled the redirect

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

  // Function to manually test field names
  const testFieldNames = async () => {
    console.log('Testing API connectivity and field names...');
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      setSnackbar({
        open: true,
        message: 'No authentication token found',
        severity: 'error'
      });
      return;
    }

    try {
      // Test the payments endpoint
      const response = await fetch('https://api.boldeats.in/api/admin/payments', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Payments API test - Status:', response.status);
      const data = await response.json();
      console.log('Payments API test - Response:', data);
      
      setSnackbar({
        open: true,
        message: `API connectivity test successful. Correct field name is: ${correctFieldName}`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('API test failed:', error);
      setSnackbar({
        open: true,
        message: 'API connectivity test failed. Check console for details.',
        severity: 'error'
      });
    }
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
          <Button 
            variant="outlined" 
            onClick={testApiConnectivity}
            sx={{ mr: 2 }}
          >
            Test API
          </Button>
          <Button 
            variant="outlined" 
            onClick={testFieldNames}
            sx={{ mr: 2 }}
          >
            Test Field Names
          </Button>
          <Typography variant="body2" color="text.secondary">
            Field: {correctFieldName}
          </Typography>
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

      {/* Upload Confirmation Dialog */}
      <Dialog
        open={uploadConfirmDialog.open}
        onClose={handleCancelUpload}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirm Upload</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to upload "{uploadConfirmDialog.file?.name}" as admin payment proof?
            <br />
            <strong>File Size:</strong> {(uploadConfirmDialog.file?.size / 1024 / 1024).toFixed(2)} MB
            <br />
            <strong>File Type:</strong> {uploadConfirmDialog.file?.type}
            <br />
            <strong>Payment ID:</strong> {uploadConfirmDialog.paymentId}
            <br />
            <strong>Note:</strong> The image will be automatically compressed to reduce file size and improve upload speed.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelUpload} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmUpload} variant="contained" color="primary">
            Upload
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Dialog */}
      <Dialog
        open={imageDialog.open}
        onClose={handleCloseImageDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {imageDialog.title}
          <IconButton
            aria-label="close"
            onClick={handleCloseImageDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {imageDialog.loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <CircularProgress />
            </Box>
          )}
          {imageDialog.imageUrl && (
            <Box
              component="img"
              src={imageDialog.imageUrl}
              alt={imageDialog.title}
              sx={{
                width: '100%',
                height: 'auto',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: imageDialog.loading ? 'none' : 'block'
              }}
              onLoad={() => setImageDialog(prev => ({ ...prev, loading: false }))}
              onError={handleImageError}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseImageDialog}>Close</Button>
        </DialogActions>
      </Dialog>
      
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