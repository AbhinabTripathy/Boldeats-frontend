import React, { useState } from 'react';
import { 
  AppBar, 
  Toolbar, 
  IconButton, 
  Box, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  useTheme,
  useMediaQuery,
  Tooltip
} from '@mui/material';
import { 
  AccountCircle, 
  Notifications, 
  Settings,
  Person,
  ManageAccounts,
  Logout,
  Menu as MenuIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/BoldTribe Logo-2.svg';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  height: '80px',
  [theme.breakpoints.down('sm')]: {
    height: '70px',
  }
}));

const LogoImage = styled('img')(({ theme }) => ({
  height: '150px',
  marginRight: '16px',
  marginTop: '-50px',
  cursor: 'pointer',
  position: 'relative',
  top: '20px',
  [theme.breakpoints.down('sm')]: {
    height: '120px',
    marginTop: '-40px',
  }
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    marginTop: '8px',
    minWidth: '200px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
  },
  '& .MuiMenuItem-root': {
    padding: '12px 24px',
    '&:hover': {
      backgroundColor: 'rgba(0, 0, 0, 0.04)',
    },
  },
}));

const Header = ({ onDrawerToggle }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    // Redirect to login page
    navigate('/login');
    handleClose();
  };

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const menuItems = [
    {
      text: 'Profile',
      icon: <Person />,
      onClick: handleClose
    },
    {
      text: 'Account Settings',
      icon: <ManageAccounts />,
      onClick: handleClose
    },
    {
      text: 'Logout',
      icon: <Logout />,
      onClick: handleLogout,
      divider: true
    }
  ];

  return (
    <StyledAppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar sx={{ height: '100%', px: isSmall ? 1 : 2 }}>
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={onDrawerToggle}
            sx={{ mr: 1 }}
          >
            <MenuIcon />
          </IconButton>
        )}
        
        <Box sx={{ display: 'flex', alignItems: 'flex-start', flexGrow: 1 }}>
          <LogoImage
            src={logo}
            alt="BoldTribe Logo"
            onClick={handleLogoClick}
          />
        </Box>
        
        <Box sx={{ display: 'flex', gap: isSmall ? '4px' : '8px' }}>
          <IconButton 
            color="inherit"
            onClick={handleNotificationsClick}
            size={isSmall ? "small" : "medium"}
          >
            <Notifications />
          </IconButton>
          
          <IconButton 
            color="inherit"
            size={isSmall ? "small" : "medium"}
          >
            <Settings />
          </IconButton>
          
          <IconButton
            color="inherit"
            onClick={handleClick}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
            size={isSmall ? "small" : "medium"}
          >
            <AccountCircle />
          </IconButton>
        </Box>
        
        <StyledMenu
          id="account-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          onClick={handleClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
        >
          {menuItems.map((item, index) => (
            <MenuItem
              key={item.text}
              onClick={item.onClick}
              sx={{
                borderBottom: item.divider ? '1px solid rgba(0, 0, 0, 0.12)' : 'none',
                color: item.text === 'Logout' ? 'error.main' : 'inherit'
              }}
            >
              <ListItemIcon sx={{ 
                color: item.text === 'Logout' ? 'error.main' : 'inherit',
                minWidth: '35px'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText primary={item.text} />
            </MenuItem>
          ))}
        </StyledMenu>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header; 