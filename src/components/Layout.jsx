import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      <Header />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: '100px',
          mb: '80px',
          backgroundColor: '#f5f5f5',
          minHeight: 'calc(100vh - 180px)',
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout; 