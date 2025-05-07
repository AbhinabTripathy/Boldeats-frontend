import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Notifications, CheckCircle, Error, Info } from '@mui/icons-material';
import { motion } from 'framer-motion';
import Footer from './Footer';

const MotionPaper = motion(Paper);

const NotificationsScreen = () => {
  const notifications = [
    {
      id: 1,
      type: 'success',
      title: 'New Order Received',
      message: 'Order #12345 has been placed successfully',
      time: '2 minutes ago',
      icon: <CheckCircle color="success" />
    },
    {
      id: 2,
      type: 'error',
      title: 'Payment Failed',
      message: 'Payment for order #12346 has failed',
      time: '1 hour ago',
      icon: <Error color="error" />
    },
    {
      id: 3,
      type: 'info',
      title: 'New User Registration',
      message: 'A new user has registered on the platform',
      time: '3 hours ago',
      icon: <Info color="info" />
    },
  ];

  return (
    <Box sx={{ 
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Box sx={{ 
        p: 3, 
        mt: '100px',
        maxWidth: '1200px',
        margin: '100px auto 0',
        mb: '80px',
        flex: 1,
      }}>
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          mb: 4,
          gap: 2,
          pl: 2
        }}>
          <Notifications sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {notifications.map((notification, index) => (
            <MotionPaper
              key={notification.id}
              elevation={3}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ 
                duration: 0.5,
                delay: index * 0.2,
                type: "spring",
                stiffness: 100
              }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                transition: { duration: 0.2 }
              }}
              sx={{ 
                borderRadius: '16px',
                overflow: 'hidden',
                backgroundColor: 'white',
              }}
            >
              <Box sx={{ 
                p: 3,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 3
              }}>
                <Box sx={{ 
                  p: 2,
                  borderRadius: '12px',
                  backgroundColor: notification.type === 'success' ? 'rgba(76, 175, 80, 0.1)' : 
                                  notification.type === 'error' ? 'rgba(244, 67, 54, 0.1)' : 
                                  'rgba(33, 150, 243, 0.1)',
                }}>
                  {React.cloneElement(notification.icon, { 
                    sx: { fontSize: 28 }
                  })}
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" sx={{ 
                    mb: 1,
                    fontWeight: 600,
                    color: 'text.primary'
                  }}>
                    {notification.title}
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: 'text.secondary',
                    mb: 1
                  }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" sx={{ 
                    color: 'text.disabled',
                    display: 'block'
                  }}>
                    {notification.time}
                  </Typography>
                </Box>
              </Box>
            </MotionPaper>
          ))}
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default NotificationsScreen; 