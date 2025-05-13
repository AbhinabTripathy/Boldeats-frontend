import React from 'react';
import { Box, Grid, Paper, Typography, Container, useMediaQuery, useTheme } from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { CurrencyRupee, ShoppingCart, People, Store } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  height: '220px',
  justifyContent: 'center',
  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
  color: 'white',
  cursor: 'pointer',
  transition: 'transform 0.3s ease-in-out',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
  },
  [theme.breakpoints.down('sm')]: {
    height: '180px',
    padding: theme.spacing(2),
  }
}));

const MotionBox = styled(motion.div)({
  width: '100%',
});

// Function to format number to Indian currency format
const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Ensure proper ₹ symbol display by replacing the default INR symbol
  return formatter.replace('INR', '₹').replace('₹ ', '₹');
};

const Dashboard = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const cards = [
    {
      title: 'Total Orders',
      value: '1,234',
      icon: <ShoppingCart sx={{ fontSize: isMobile ? 36 : 48 }} />,
      color: 'linear-gradient(45deg, #FF6B6B 30%, #FF8E53 90%)',
      path: '/orders'
    },
    {
      title: 'Total Revenue',
      value: formatIndianCurrency(4567800),
      icon: <CurrencyRupee sx={{ fontSize: isMobile ? 36 : 48 }} />,
      color: 'linear-gradient(45deg, #4CAF50 30%, #81C784 90%)',
      path: '/payments'
    },
    {
      title: 'Total Users',
      value: '890',
      icon: <People sx={{ fontSize: isMobile ? 36 : 48 }} />,
      color: 'linear-gradient(45deg, #9C27B0 30%, #BA68C8 90%)',
      path: '/users'
    },
    {
      title: 'Total Vendors',
      value: '45',
      icon: <Store sx={{ fontSize: isMobile ? 36 : 48 }} />,
      color: 'linear-gradient(45deg, #FF9800 30%, #FFCC80 90%)',
      path: '/vendors'
    },
  ];

  const handleCardClick = (path) => {
    navigate(path);
  };

  return (
    <Box 
      sx={{ 
        flexGrow: 1, 
        p: { xs: 2, sm: 3 }, 
        mt: { xs: 6, sm: 8 },
        display: 'flex',
        minHeight: 'calc(100vh - 64px - 48px)',
        alignItems: 'center',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, sm: 3, md: 4 }} justifyContent="center">
          {cards.map((card, index) => (
            <Grid item xs={12} sm={6} lg={3} key={card.title}>
              <MotionBox
                initial="hidden"
                animate="visible"
                variants={cardVariants}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                onClick={() => handleCardClick(card.path)}
                style={{ cursor: 'pointer' }}
              >
                <StyledPaper
                  elevation={3}
                  sx={{ background: card.color }}
                >
                  {card.icon}
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      mt: 2, 
                      fontWeight: 500,
                      fontSize: { xs: '1rem', sm: '1.25rem' } 
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      mt: 1, 
                      fontWeight: 'bold',
                      fontSize: { xs: '1.5rem', sm: '2rem' } 
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

export default Dashboard; 