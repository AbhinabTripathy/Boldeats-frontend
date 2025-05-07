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
} from '@mui/material';
import {
  Dashboard,
  Payment,
  ShoppingCart,
  People,
  Subscriptions,
  Store
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
    background: 'linear-gradient(180deg, #2196F3 0%, #1976D2 100%)',
    color: 'white',
    height: 'calc(100vh - 20px)',
    marginTop: '20px',
    borderRadius: '0 15px 0 0',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  margin: '16px 16px',
  borderRadius: '12px',
  padding: '12px 16px',
  transition: 'all 0.3s ease',
  position: 'relative',
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
}));

const Sidebar = () => {
  const navigate = useNavigate();

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Subscribed Users', icon: <Subscriptions />, path: '/subscribed-users' },
    { text: 'Vendors', icon: <Store />, path: '/vendors' },
  ];

  return (
    <StyledDrawer variant="permanent">
      <Toolbar />
      <Box sx={{ mt: 3 }}>
        <List sx={{ padding: '8px' }}>
          {menuItems.map((item) => (
            <StyledListItem
              component="div"
              key={item.text}
              onClick={() => navigate(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </StyledListItem>
          ))}
        </List>
      </Box>
    </StyledDrawer>
  );
};

export default Sidebar; 