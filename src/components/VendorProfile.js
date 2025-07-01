import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  CircularProgress,
  Alert,
} from '@mui/material';
import axios from 'axios';

const VendorProfile = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [vendorData, setVendorData] = useState(null);

  // Function to transform meal type display
  const getDisplayMealType = (mealType) => {
    if (mealType === 'both') {
      return 'Regular';
    }
    return mealType;
  };

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get token from localStorage
      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setError('Please login to view vendor details');
        return;
      }

      // Get vendor ID from vendorUser in localStorage
      const vendorUser = JSON.parse(localStorage.getItem('vendorUser'));
      if (!vendorUser || !vendorUser.id) {
        setError('Vendor ID not found');
        return;
      }

      const response = await axios.get(`https://api.boldeats.in/api/vendors/${vendorUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success === "true") {
        setVendorData(response.data.data);
      } else {
        setError('Failed to fetch vendor details');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
          // Clear auth data
          localStorage.removeItem('vendorToken');
          localStorage.removeItem('vendorUser');
          localStorage.removeItem('isVendorAuthenticated');
        } else {
          setError(err.response.data.message || 'Failed to fetch vendor details');
        }
      } else {
        setError('Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!vendorData) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No vendor data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vendor Profile
        </Typography>
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Basic Information <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Vendor Name *"
              value={vendorData.name}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email *"
              value={vendorData.email}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Phone Number *"
              value={vendorData.phoneNumber}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address *"
              value={vendorData.address}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Years in Business *"
              value={vendorData.yearsInBusiness}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Legal Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Legal Information <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GSTIN *"
              value={vendorData.gstin}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="FSSAI Number *"
              value={vendorData.fssaiNumber}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              FSSAI Certificate
            </Typography>
            <Box
              component="img"
              src={`https://api.boldeats.in/${vendorData.fssaiCertificate}`}
              alt="FSSAI Certificate"
              sx={{
                maxWidth: '300px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                p: 1,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Bank Account Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Bank Account Details <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Holder Name *"
              value={vendorData.accountHolderName}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number *"
              value={vendorData.accountNumber}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="IFSC Code *"
              value={vendorData.ifscCode}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name *"
              value={vendorData.bankName}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Branch *"
              value={vendorData.branch}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Business Hours & Pricing */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Business Hours & Pricing <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Opening Time *"
              value={vendorData.openingTime}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Closing Time *"
              value={vendorData.closingTime}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="15 Days Subscription Price *"
              value={vendorData.subscriptionPrice15Days}
              InputProps={{ readOnly: true }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Subscription Price *"
              value={vendorData.subscriptionPriceMonthly}
              InputProps={{ readOnly: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Menu Sections */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Menu Sections
        </Typography>
        {vendorData.menu && vendorData.menu.map((section) => (
          <Box key={section.id} sx={{ mb: 4 }}>
            <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
              {section.sectionName} ({section.menuType} - {getDisplayMealType(section.mealType)})
            </Typography>
            <Grid container spacing={2}>
              {section.menuItems && section.menuItems.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      {item.dayOfWeek}
                    </Typography>
                    <Typography variant="body2">
                      {item.items && item.items.join(', ')}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Paper>

      {/* Menu Photos */}
      {vendorData.menuPhotos && vendorData.menuPhotos.length > 0 && (
        <Paper sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Menu Photos
          </Typography>
          <Grid container spacing={2}>
            {vendorData.menuPhotos.map((photo) => (
              <Grid item xs={12} sm={6} md={4} key={photo.id}>
                <Box
                  component="img"
                  src={`https://api.boldeats.in/${photo.photoUrl}`}
                  alt="Menu Photo"
                  sx={{
                    width: '100%',
                    height: '200px',
                    objectFit: 'cover',
                    borderRadius: '4px',
                  }}
                />
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default VendorProfile;