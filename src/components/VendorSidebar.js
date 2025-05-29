import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  styled,
  Box,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Payment as PaymentIcon,
  ShoppingCart as OrdersIcon,
  People as ActiveUsersIcon,
  History as PastSubscribersIcon,
  Person as ProfileIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const drawerWidth = 240;
const drawerHeight = 840;
const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  height: drawerHeight,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    height: drawerHeight,
    boxSizing: 'border-box',
    backgroundColor: '#64B5F6',
    color: 'white',
    height: 'calc(100vh - 20px)',
    marginTop: '20px',
    borderRadius: '0 15px 0 0',
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      height: '100vh',
      borderRadius: 0,
    }
  },
}));

const StyledListItem = styled(ListItem)(({ theme, active }) => ({
  margin: '16px 16px',
  borderRadius: '12px',
  padding: '12px 16px',
  transition: 'all 0.3s ease',
  position: 'relative',
  backgroundColor: active ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    transform: 'translateY(-3px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)',
  },
  '& .MuiListItemIcon-root': {
    color: 'white',
    minWidth: '45px',
    marginRight: '8px',
  },
  '& .MuiListItemText-primary': {
    fontSize: '1rem',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  [theme.breakpoints.down('sm')]: {
    margin: '8px 12px',
    padding: '8px 16px',
  }
}));

const VendorSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/vendor' },
    { text: 'Payments', icon: <PaymentIcon />, path: '/vendor/payments' },
    { text: 'Orders', icon: <OrdersIcon />, path: '/vendor/orders' },
    { text: 'Active Users', icon: <ActiveUsersIcon />, path: '/vendor/active-users' },
    { text: 'Past Subscribers', icon: <PastSubscribersIcon />, path: '/vendor/past-subscribers' },
    { text: 'Profile', icon: <ProfileIcon />, path: '/vendor/profile' },
  ];

  const drawer = (
    <>
      <Toolbar />
      <Box sx={{ mt: isMobile ? 0 : 3 }}>
        <List sx={{ padding: '8px' }}>
          {menuItems.map((item) => (
            <StyledListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              active={location.pathname === item.path ? 1 : 0}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
      </Box>
    </>
  );

  return (
    <StyledDrawer variant="permanent" open>
      {drawer}
    </StyledDrawer>
  );
};

export default VendorSidebar; 