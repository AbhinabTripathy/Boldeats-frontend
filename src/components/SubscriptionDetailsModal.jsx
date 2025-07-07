import React, { useEffect, useState } from 'react';
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
import { FileDownload as FileDownloadIcon } from '@mui/icons-material';
import { format, addDays, isSameDay } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { getCurrentToken, handleApiResponse } from '../utils/auth';

const SubscriptionDetailsModal = ({ open, onClose, user }) => {
  const [orderHistory, setOrderHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open || !user) return;
    const fetchOrderHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const { token } = getCurrentToken() || {};
        
        // Extract numeric subscription ID if possible
        let subscriptionId;
        
        // First check if user has a subscriptionId property
        if (user.subscriptionId) {
          subscriptionId = user.subscriptionId;
        }
        // Check if user has a numeric id that could be used
        else if (user.id && !isNaN(parseInt(user.id))) {
          subscriptionId = parseInt(user.id);
        }
        // Check if userId is numeric
        else if (user.userId && !isNaN(parseInt(user.userId))) {
          subscriptionId = parseInt(user.userId);
        }
        // If we have a subscription field that might contain a numeric ID
        else if (user.subscription && user.subscription.id) {
          subscriptionId = user.subscription.id;
        }
        // Last resort: try to extract numeric part from userId if it's a string
        else if (user.userId && typeof user.userId === 'string') {
          const numericPart = user.userId.match(/\d+/);
          if (numericPart) {
            subscriptionId = numericPart[0];
          } else {
            throw new Error('Could not find a valid subscription ID');
          }
        } else {
          throw new Error('Could not find a valid subscription ID');
        }
        
        const res = await fetch(`https://api.boldeats.in/api/daily-orders/subscription/${subscriptionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        const data = await handleApiResponse(res);
        setOrderHistory(Array.isArray(data) ? data : (data.orders || []));
      } catch (err) {
        setError(err.message || 'Failed to fetch order history');
        setOrderHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrderHistory();
  }, [open, user]);

  if (!user) return null;

  // Calculate subscription end date
  const startDate = new Date(user.startDate);
  const endDate = addDays(startDate, user.duration);

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
  
  // Function to generate and download PDF
  const downloadPDF = () => {
    const doc = new jsPDF();
    
    // Add Unicode font support
    doc.addFont('https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');
    
    // Title
    doc.setFontSize(18);
    doc.text('Subscription Details', 14, 20);
    
    // User Information
    doc.setFontSize(14);
    doc.text('User Information', 14, 30);
    doc.setFontSize(12);
    doc.text(`Name: ${user.name}`, 14, 40);
    doc.text(`User ID: ${user.userId}`, 14, 46);
    doc.text(`Vendor ID: ${user.vendorId}`, 14, 52);
    
    // Subscription Summary
    doc.setFontSize(14);
    doc.text('Subscription Summary', 14, 62);
    doc.setFontSize(12);
    doc.text(`Duration: ${user.duration} days`, 14, 72);
    doc.text(`Amount Paid: ${user.pendingBalance}`, 14, 78);
    
    // Subscription Period
    doc.setFontSize(14);
    doc.text('Subscription Period', 14, 88);
    doc.setFontSize(12);
    doc.text(`Original Start: ${format(startDate, 'dd/MM/yyyy')}`, 14, 98);
    doc.text(`Original End: ${format(endDate, 'dd/MM/yyyy')}`, 14, 104);
    doc.text(`Adjusted End: ${format(adjustedEndDate, 'dd/MM/yyyy')}${missedDays > 0 ? ` (+${missedDays} days)` : ''}`, 14, 110);
    
    // Order History
    doc.setFontSize(14);
    doc.text('Order History', 14, 120);
    
    const tableColumn = ['Date', 'Status'];
    const tableRows = orderHistory.map(order => [
      format(new Date(order.date), 'dd/MM/yyyy'),
      getStatusLabel(order.status)
    ]);
    
    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 125,
      theme: 'grid',
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      }
    });
    
    // Save the PDF
    doc.save(`subscription_details_${user.userId}_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
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
          {loading ? (
            <Typography variant="body2" color="text.secondary">Loading order history...</Typography>
          ) : error ? (
            <Typography variant="body2" color="error">{error}</Typography>
          ) : orderHistory.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No order history found.</Typography>
          ) : (
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
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<FileDownloadIcon />} 
          onClick={downloadPDF}
          sx={{ mr: 1 }}
        >
          Download PDF
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubscriptionDetailsModal;