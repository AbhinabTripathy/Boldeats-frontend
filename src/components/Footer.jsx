import React from 'react';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useLocation } from 'react-router-dom';

const Footer = ({ isMobile }) => {
  const location = useLocation();
  const theme = useTheme();
  const isNotificationsPage = location.pathname === '/notifications';

  return (
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: isMobile || isNotificationsPage ? 0 : '240px',
        width: isMobile || isNotificationsPage ? '100%' : 'calc(100% - 240px)',
        marginRight: 0,
        py: { xs: 1.5, sm: 2 },
        px: { xs: 1.5, sm: 2 },
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderTop: '1px solid',
        borderColor: 'divider',
        borderRadius: isMobile || isNotificationsPage ? '0' : '8px 8px 0 0',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <Typography 
        variant="body2" 
        color="text.secondary" 
        align="center"
        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
      >
        © {new Date().getFullYear()} BoldEats Admin Panel. All rights reserved.
      </Typography>
    </Box>
  );
};

export default Footer; 