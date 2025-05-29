import React from 'react';
import { Box, Grid, Paper, Typography, Container, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { CurrencyRupee, ShoppingCart, People } from '@mui/icons-material';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '200px',
  justifyContent: 'center',
  background: 'white',
  color: theme.palette.primary.main,
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out',
  borderRadius: '16px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.15)',
  },
}));

const MotionBox = styled(motion.div)({
  width: '100%',
});

const IconWrapper = styled(Box)(({ theme, color }) => ({
  backgroundColor: color,
  borderRadius: '50%',
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  color: 'white',
  '& svg': {
    fontSize: '2rem',
  },
}));

// Function to format number to Indian currency format
const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  return formatter.replace('INR', '₹').replace('₹ ', '₹');
};

const VendorDashboard = () => {
  const theme = useTheme();

  // Static data for one vendor
  const dashboardData = {
    totalOrders: 120,
    totalRevenue: 85000,
    activeUsers: 34
  };

  const cards = [
    {
      title: 'Total Orders',
      value: dashboardData.totalOrders.toString(),
      icon: <ShoppingCart />,
      color: '#FF6B6B',
    },
    {
      title: 'Total Revenue',
      value: formatIndianCurrency(dashboardData.totalRevenue),
      icon: <CurrencyRupee />,
      color: '#4CAF50',
    },
    {
      title: 'Active Users',
      value: dashboardData.activeUsers.toString(),
      icon: <People />,
      color: '#2196F3',
    },
  ];

  return (
    <Box sx={{ py: 4 }}>
      <Container maxWidth="lg">
        <Typography 
          variant="h4" 
          sx={{ 
            mb: 4, 
            fontWeight: 600,
            color: theme.palette.text.primary 
          }}
        >
          Dashboard Overview
        </Typography>

        <Grid container spacing={3}>
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} md={4} key={card.title}>
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <StyledPaper elevation={0}>
                  <IconWrapper color={card.color}>
                    {card.icon}
                  </IconWrapper>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mb: 1,
                      fontWeight: 500,
                      color: theme.palette.text.secondary
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 600,
                      color: theme.palette.text.primary
                    }}
                  >
                    {card.value}
                  </Typography>
                </StyledPaper>
              </MotionBox>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default VendorDashboard; 