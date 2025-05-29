import React from 'react';
import { Box, Typography, useTheme, useMediaQuery, Toolbar, IconButton, Button } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LogoutIcon from '@mui/icons-material/Logout';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

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

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('isVendorAuthenticated');
    localStorage.removeItem('vendorUser');
    navigate('/login');
  };

  return (
    <StyledHeader>
      <Toolbar sx={{ height: '100%', px: isSmall ? 1 : 2, display: 'flex', justifyContent: 'space-between' }}>
        <LogoContainer>
          <RestaurantIcon 
            sx={{ 
              fontSize: isSmall ? 28 : 32, 
              color: '#1976d2',
              position: 'relative',
              top: '2px'
            }} 
          />
          <Typography
            variant="h6"
            component="div"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              fontSize: isSmall ? '1.1rem' : '1.25rem',
              position: 'relative',
              top: '2px'
            }}
          >
            BoldEats Vendor
          </Typography>
        </LogoContainer>

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