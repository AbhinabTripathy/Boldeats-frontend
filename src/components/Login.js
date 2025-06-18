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
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import StorefrontIcon from '@mui/icons-material/Storefront';
import { Visibility, VisibilityOff } from '@mui/icons-material';

const Login = () => {
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState('vendor');
  const [formData, setFormData] = useState({
    email: '',
    phoneNumber: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLoginTypeChange = (event, newType) => {
    if (newType !== null) {
      setLoginType(newType);
      setFormData({
        email: '',
        phoneNumber: '',
        password: '',
      });
      setError('');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const endpoint = loginType === 'admin'
        ? 'https://api.boldeats.in/api/admin/login'
        : 'https://api.boldeats.in/api/vendors/login';

      const requestBody = loginType === 'admin'
        ? {
          email: formData.email,
          password: formData.password
        }
        : {
          phoneNumber: formData.phoneNumber,
          password: formData.password
        };

      console.log('Sending request to:', endpoint);
      console.log('Request body:', requestBody);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('API Response:', data);

      if (!response.ok) {
        const errorMessage = data.message || data.error || 'Login failed';
        console.error('Login Error:', errorMessage);
        throw new Error(errorMessage);
      }

      const token = data.data?.token;
      if (!token) {
        console.error('No token in response:', data);
        throw new Error('No authentication token received from server');
      }

      // Store authentication data
      if (loginType === 'admin') {
        localStorage.setItem('adminToken', token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.data?.admin || {}));
        navigate('/');
      } else {
        localStorage.setItem('vendorToken', token);
        localStorage.setItem('isVendorAuthenticated', 'true');
        localStorage.setItem('vendorUser', JSON.stringify(data.data?.vendor || {}));
        navigate('/vendor');
      }
    } catch (err) {
      console.error('Login Error Details:', err);
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
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            {loginType === 'admin' ? (
              <AdminPanelSettingsIcon sx={{ mr: 1, fontSize: 28 }} />
            ) : (
              <StorefrontIcon sx={{ mr: 1, fontSize: 28 }} />
            )}
            <Typography component="h1" variant="h5">
              {loginType === 'admin' ? 'BoldEats Admin Login' : 'BoldEats Vendor Login'}
            </Typography>
          </Box>

          <ToggleButtonGroup
            value={loginType}
            exclusive
            onChange={handleLoginTypeChange}
            sx={{ mb: 3 }}
          >
            <ToggleButton value="vendor">
              Vendor
            </ToggleButton>
            <ToggleButton value="admin">
              Admin
            </ToggleButton>
          </ToggleButtonGroup>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
            {loginType === 'admin' ? (
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
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                  }
                }}  
              />
            ) : (
              <TextField
                margin="normal"
                required
                fullWidth
                id="phoneNumber"
                label="Phone Number"
                name="phoneNumber"
                autoComplete="tel"
                autoFocus
                value={formData.phoneNumber}
                onChange={handleChange}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === ' ') {
                    e.preventDefault();
                  }
                }}
              />
            )}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              onKeyDown={(e) => {
                if (e.key === ' ') {
                  e.preventDefault();
                }
              }} 
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                      disabled={loading}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;