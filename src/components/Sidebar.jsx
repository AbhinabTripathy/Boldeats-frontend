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
  IconButton,
} from '@mui/material';
import {
  Dashboard,
  Payment,
  ShoppingCart,
  People,
  Subscriptions,
  Store,
  ChevronLeft
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

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
    [theme.breakpoints.down('md')]: {
      marginTop: 0,
      height: '100vh',
      borderRadius: 0,
    }
  },
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  justifyContent: 'flex-end',
  minHeight: '64px',
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

const Sidebar = ({ mobileOpen, onDrawerToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const menuItems = [
    { text: 'Dashboard', icon: <Dashboard />, path: '/' },
    { text: 'Payments', icon: <Payment />, path: '/payments' },
    { text: 'Orders', icon: <ShoppingCart />, path: '/orders' },
    { text: 'Users', icon: <People />, path: '/users' },
    { text: 'Subscribed Users', icon: <Subscriptions />, path: '/subscribed-users' },
    { text: 'Vendors', icon: <Store />, path: '/vendors' },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onDrawerToggle();
    }
  };

  const drawer = (
    <>
      <Toolbar />
      {isMobile && (
        <DrawerHeader>
          <IconButton onClick={onDrawerToggle} sx={{ color: 'white' }}>
            <ChevronLeft />
          </IconButton>
        </DrawerHeader>
      )}
      <Box sx={{ mt: isMobile ? 0 : 3 }}>
        <List sx={{ padding: '8px' }}>
          {menuItems.map((item) => (
            <StyledListItem
              component="div"
              key={item.text}
              onClick={() => handleNavigation(item.path)}
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
    <>
      {/* Mobile drawer */}
      {isMobile ? (
        <StyledDrawer
          variant="temporary"
          open={mobileOpen}
          onClose={onDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
        >
          {drawer}
        </StyledDrawer>
      ) : (
        /* Desktop drawer */
        <StyledDrawer variant="permanent" open>
          {drawer}
        </StyledDrawer>
      )}
    </>
  );
};

export default Sidebar; 