import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Paper,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StoreIcon from '@mui/icons-material/Store';

// Static vendor data for testing
const STATIC_VENDORS = [
  {
    phone: '9876543210',
    password: 'vendor123',
    vendorData: {
      id: 'V001',
      name: 'Test Vendor',
      businessName: 'Food Corner',
      email: 'vendor@test.com',
      phone: '9876543210',
      address: '123 Food Street, City',
      businessType: 'Restaurant',
      description: 'Serving delicious meals since 2020'
    }
  },
  {
    phone: '9876543211',
    password: 'vendor456',
    vendorData: {
      id: 'V002',
      name: 'Sample Vendor',
      businessName: 'Tasty Bites',
      email: 'vendor2@test.com',
      phone: '9876543211',
      address: '456 Food Avenue, City',
      businessType: 'Bakery',
      description: 'Fresh baked goods daily'
    }
  }
];

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    phone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    setFormData({
      email: '',
      password: '',
      phone: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 0) {
        // Admin login - using existing API
        const response = await fetch('https://api.boldeats.in/api/admin/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Login failed');
        }

        const token = data.data && data.data.token;
        if (!token) {
          throw new Error('No authentication token received from server');
        }

        localStorage.setItem('adminToken', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.data && data.data.admin || {}));
        navigate('/');
      } else {
        // Vendor login - using static data
        const vendor = STATIC_VENDORS.find(v => 
          v.phone === formData.phone && v.password === formData.password
        );

        if (!vendor) {
          throw new Error('Invalid phone number or password');
        }

        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Store vendor data
        localStorage.setItem('vendorToken', 'static-vendor-token-' + vendor.vendorData.id);
        localStorage.setItem('isVendorAuthenticated', 'true');
        localStorage.setItem('vendorUser', JSON.stringify(vendor.vendorData));
        navigate('/vendor');
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            backgroundColor: 'white',
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
            BoldEats Login
          </Typography>

          <Tabs 
            value={activeTab} 
            onChange={handleTabChange} 
            sx={{ 
              mb: 3, 
              width: '100%',
              '& .MuiTabs-flexContainer': {
                gap: '20px',
                justifyContent: 'center'
              },
              '& .MuiTab-root': {
                borderRadius: '8px',
                border: '1px solid #e0e0e0',
                minWidth: '160px',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: '#f5f5f5',
                },
                '&.Mui-selected': {
                  backgroundColor: '#1976d2',
                  color: 'white',
                  '& .MuiSvgIcon-root': {
                    color: 'white'
                  }
                }
              }
            }}
          >
            <Tab 
              icon={<AdminPanelSettingsIcon />} 
              iconPosition="start" 
              label="Admin Login" 
              sx={{ 
                minHeight: '48px',
                '& .MuiTab-iconWrapper': {
                  marginRight: '8px',
                }
              }}
            />
            <Tab 
              icon={<StoreIcon />} 
              iconPosition="start" 
              label="Vendor Login" 
              sx={{ 
                minHeight: '48px',
                '& .MuiTab-iconWrapper': {
                  marginRight: '8px',
                }
              }}
            />
          </Tabs>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {activeTab === 0 ? (
              // Admin Login Form
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </>
            ) : (
              // Vendor Login Form
              <>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  autoFocus
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                  helperText="Try: 9876543210 (password: vendor123)"
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
              </>
            )}
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : `Sign In as ${activeTab === 0 ? 'Admin' : 'Vendor'}`}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login; 