import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Toolbar, IconButton, Button, Avatar, CircularProgress } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StyledHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #E8EAF6 0%, #F5F5F5 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  height: '80px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: '70px',
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.5),
  }
}));

const StyledLogoutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'unset',
    padding: theme.spacing(1),
  }
}));

const VendorHeader = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setError('Please login to view vendor details');
        return;
      }

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
          localStorage.removeItem('vendorToken');
          localStorage.removeItem('vendorUser');
          localStorage.removeItem('isVendorAuthenticated');
          navigate('/login');
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

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('isVendorAuthenticated');
    localStorage.removeItem('vendorUser');
    navigate('/login');
  };

  if (loading) {
    return (
      <StyledHeader>
        <Toolbar sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Toolbar>
      </StyledHeader>
    );
  }

  return (
    <StyledHeader>
      <Toolbar sx={{ 
        height: '100%', 
        px: isSmall ? 1 : 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left side - Vendor Logo and Name */}
        <LogoContainer>
          {vendorData?.logo ? (
            <Avatar
              src={`https://api.boldeats.in/${vendorData.logo}`}
              alt={vendorData.name}
              sx={{ 
                width: isSmall ? 40 : 48, 
                height: isSmall ? 40 : 48,
                border: '2px solid #1976d2'
              }}
            />
          ) : (
            <RestaurantIcon 
              sx={{ 
                fontSize: isSmall ? 28 : 32, 
                color: '#1976d2',
                position: 'relative',
                top: '2px'
              }} 
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              fontSize: isSmall ? '0.9rem' : '1.1rem',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {vendorData?.name || 'Vendor Panel'}
          </Typography>
        </LogoContainer>

        {/* Right side - Logout Button */}
        <StyledLogoutButton
          variant="outlined"
          startIcon={!isSmall && <LogoutIcon />}
          onClick={handleLogout}
        >
          {isSmall ? <LogoutIcon /> : 'Logout'}
        </StyledLogoutButton>
      </Toolbar>
    </StyledHeader>
  );
};

export default VendorHeader; 