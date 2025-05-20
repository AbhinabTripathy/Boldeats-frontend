import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Paper
} from '@mui/material';
import { format, addDays, isSameDay } from 'date-fns';

const SubscriptionDetailsModal = ({ open, onClose, user }) => {
  if (!user) return null;

  // Calculate subscription end date
  const startDate = new Date(user.subscriptionDate);
  const endDate = addDays(startDate, user.duration);

  // Mock data for order history - replace with actual data from your backend
  const orderHistory = [
    { date: '2024-03-01', status: 'delivered' },
    { date: '2024-03-02', status: 'delivered' },
    { date: '2024-03-03', status: 'missed' },
    { date: '2024-03-04', status: 'delivered' },
    { date: '2024-03-05', status: 'delivered' },
    // Add more dates as needed
  ];

  // Calculate adjusted end date based on missed days
  const missedDays = orderHistory.filter(order => order.status === 'missed').length;
  const adjustedEndDate = addDays(endDate, missedDays);

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'missed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'delivered':
        return 'Order Delivered';
      case 'missed':
        return 'Order Missed';
      default:
        return status;
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Subscription Details
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">User Information</Typography>
                <Typography variant="body1">{user.name}</Typography>
                <Typography variant="body2" color="text.secondary">ID: {user.userId}</Typography>
                <Typography variant="body2" color="text.secondary">Vendor ID: {user.vendorId}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">Subscription Summary</Typography>
                <Typography variant="body1">Duration: {user.duration} days</Typography>
                <Typography variant="body1">Amount Paid: {user.pendingBalance}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>Subscription Period</Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">Original Dates</Typography>
                <Typography variant="body1">
                  Start: {format(startDate, 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1">
                  End: {format(endDate, 'dd/MM/yyyy')}
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                <Typography variant="subtitle2" color="text.secondary">Adjusted Dates</Typography>
                <Typography variant="body1">
                  Start: {format(startDate, 'dd/MM/yyyy')}
                </Typography>
                <Typography variant="body1" color={missedDays > 0 ? 'error.main' : 'success.main'}>
                  End: {format(adjustedEndDate, 'dd/MM/yyyy')}
                  {missedDays > 0 && ` (+${missedDays} days)`}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box>
          <Typography variant="h6" gutterBottom>Order History</Typography>
          <List>
            {orderHistory.map((order, index) => (
              <ListItem
                key={index}
                sx={{
                  bgcolor: 'background.default',
                  mb: 1,
                  borderRadius: 1
                }}
              >
                <ListItemText
                  primary={format(new Date(order.date), 'dd/MM/yyyy')}
                  secondary={getStatusLabel(order.status)}
                />
                <Chip
                  label={getStatusLabel(order.status)}
                  color={getStatusColor(order.status)}
                  size="small"
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDetailsModal; 