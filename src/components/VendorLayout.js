import React from 'react';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import VendorSidebar from './VendorSidebar';
import VendorHeader from './VendorHeader';

const VendorLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <Box sx={{ display: 'flex' }}>
      <VendorSidebar />
      <VendorHeader />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1, sm: 2, md: 3 },
          minHeight: '100vh',
          backgroundColor: '#f5f5f5',
          marginLeft: { xs: 0, md: '164px' },
          marginTop: { xs: '70px', sm: '196px' },
          marginBottom: '164px',
          marginRight: '169px',
          width: { xs: '100%', md: `calc(100% - 240px)` },
          transition: 'margin-left 0.3s ease-in-out',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default VendorLayout; 