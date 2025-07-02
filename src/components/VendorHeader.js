import React, { useState, useEffect } from 'react';
import { Box, Typography, useTheme, useMediaQuery, Toolbar, IconButton, Button, Avatar, CircularProgress, Menu, MenuItem, ListItemIcon, ListItemText, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import LogoutIcon from '@mui/icons-material/Logout';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DescriptionIcon from '@mui/icons-material/Description';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const StyledHeader = styled(Box)(({ theme }) => ({
  background: 'linear-gradient(90deg, #E8EAF6 0%, #F5F5F5 100%)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  height: '80px',
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  zIndex: theme.zIndex.drawer + 1,
  width: '100%',
  [theme.breakpoints.down('sm')]: {
    height: '70px',
  }
}));

const LogoContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  height: '100%',
  [theme.breakpoints.down('sm')]: {
    gap: theme.spacing(0.5),
  }
}));

const StyledLogoutButton = styled(Button)(({ theme }) => ({
  color: theme.palette.primary.main,
  borderColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
  },
  [theme.breakpoints.down('sm')]: {
    minWidth: 'unset',
    padding: theme.spacing(1),
  }
}));

const VendorHeader = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const [vendorData, setVendorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [policyDialog, setPolicyDialog] = useState({
    open: false,
    title: '',
    content: ''
  });

  useEffect(() => {
    fetchVendorDetails();
  }, []);

  const fetchVendorDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('vendorToken');
      if (!token) {
        setError('Please login to view vendor details');
        return;
      }

      const vendorUser = JSON.parse(localStorage.getItem('vendorUser'));
      if (!vendorUser || !vendorUser.id) {
        setError('Vendor ID not found');
        return;
      }

      const response = await axios.get(`https://api.boldeats.in/api/vendors/${vendorUser.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success === "true") {
        setVendorData(response.data.data);
      } else {
        setError('Failed to fetch vendor details');
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('vendorToken');
          localStorage.removeItem('vendorUser');
          localStorage.removeItem('isVendorAuthenticated');
          navigate('/login');
        } else {
          setError(err.response.data.message || 'Failed to fetch vendor details');
        }
      } else {
        setError('Failed to connect to server');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('isVendorAuthenticated');
    localStorage.removeItem('vendorUser');
    navigate('/login');
  };

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handlePolicyClick = (policyType) => {
    handleMenuClose();
    
    switch (policyType) {
      case 'privacy':
        setPolicyDialog({
          open: true,
          title: 'Privacy Policy (Vendors)',
          content: `Effective Date: 1st July 2025
Last Updated: 1st July 2025

At BoldEats, we are committed to protecting the privacy of all vendors who partner with us. This Privacy Policy outlines how we collect, use, and protect your personal and business information.

Information We Collect:
• Business Name, FSSAI License, PAN/GST
• Owner/Representative Name, Contact Info
• Bank account details for payouts
• Menu, Pricing, and Operating Hours
• Performance metrics (order volume, ratings, etc.)

How We Use Your Information:
• To enable vendor registration and onboarding
• For order processing, billing, and settlements
• To contact you about operational matters
• To promote your business within our platform (optional opt-in)
• To comply with legal and tax requirements

Data Protection:
• Data is stored securely and shared only with authorized employees.
• No sensitive information is sold to third parties.
• We may share limited data with payment gateways, logistics partners, or legal entities (as required).

Your Rights:
• You can request access, update, or deletion of your data by contacting support@boldeats.in
• We retain data only for as long as required by law or operational necessity.`
        });
        break;
      case 'terms':
        setPolicyDialog({
          open: true,
          title: 'Terms & Conditions (Updated with Pricing & Onboarding Fees)',
          content: `Effective Date: 1st July 2025
Last Updated: 1st July 2025

These Terms and Conditions ("Agreement") govern the relationship between BoldEats (operated by BoldTribe Innovations Pvt. Ltd.) and the Vendor ("You") regarding the listing, sale, and delivery of food items via the BoldEats platform.

1. Onboarding & Registration
• Vendors must provide valid legal documents (FSSAI License, GST, PAN, etc.).
• BoldEats will verify your kitchen and hygiene standards before onboarding.

Onboarding Fee:
• ₹0 for the first 3 to 6 months as part of our launch promotion.
• Post-launch, a one-time onboarding fee between ₹500 to ₹2,000 may be applicable depending on region, volume, and type of engagement.

2. Pricing & Subscription Tiers
BoldEats follows a subscription-based commission model tied to your monthly order/user volume.

• The first 30 subscriptions/orders per month per user are free — no commission is charged.

After the free tier:
• 1% commission for up to 250 users
• 0.75% commission for 251 to 500 users
• 0.5% commission for 501+ users

This commission applies per user per subscription.

Note: Vendors will have access to a dashboard to track user count, order volume, and applicable tier dynamically.

3. Service Expectations
• Orders must be accepted promptly and prepared with consistency and hygiene.
• Any deviation from listed menu, delays, or recurring customer complaints may result in review or suspension.

4. Settlements & Deductions
• Weekly or bi-weekly settlements are made to the vendor's registered bank account.
• Invoices and transaction breakdowns (including tier commission and refunds) will be made available in the dashboard.
• Any refund due to vendor-side error (e.g. wrong order, hygiene issue) will be adjusted in the next payout.

5. Cancellation & Refund
• BoldEats reserves the right to apply penalties or recover losses in case of repeated order cancellations or poor service.
• Refunds initiated by customers (due to vendor fault) will be deducted from the vendor's next settlement.

6. Intellectual Property
• Vendors retain rights to their business and product IP but grant BoldEats a non-exclusive license to use brand assets for listings, promotions, and order facilitation.

7. Termination
• Either party may terminate the agreement with a 30-day written notice.
• Immediate suspension or termination may apply in cases of fraud, legal violations, or breach of service terms.`
        });
        break;
      case 'refund':
        setPolicyDialog({
          open: true,
          title: 'Refund & Cancellation Policy (With Note on Free Tier & Commission Deductions)',
          content: `Effective Date: 1st July 2025
Last Updated: 1st July 2025

Order Cancellations
• Vendor-Initiated: Frequent cancellations post-confirmation may lead to warnings or temporary deactivation.
• Customer-Initiated: If cancelled before preparation, full refund will be processed. If food is in progress/delivered, decisions will be made case-by-case.

Refunds
For incorrect, spoiled, or incomplete orders:
• A full or partial refund may be issued to the customer.
• The refunded amount will be adjusted from your next settlement, even if under the free-tier count.

Free Tier Exception:
• If an order is refunded or cancelled under the free 30 subscription/user quota, it will not count toward your monthly tier limit. Only successful completed orders will be counted for commission calculation.

Dispute Resolution
• Vendors may write to support@boldeats.in within 48 hours of refund adjustment.
• BoldEats will review the case and revert within 2 working days.

Let me know if you want:
• This broken down into Google Docs or downloadable format
• A version for vendors vs a lighter version for customers
• A digital signature + checkbox version for the Vendor onboarding portal/CRM

Also, happy to create a dashboard layout where vendors can view their:
1. Order count
2. Free-tier balance
3. Tier slab
4. Pending settlements`
        });
        break;
      default:
        break;
    }
  };

  const handleClosePolicyDialog = () => {
    setPolicyDialog({
      open: false,
      title: '',
      content: ''
    });
  };

  if (loading) {
    return (
      <StyledHeader>
        <Toolbar sx={{ height: '100%', display: 'flex', justifyContent: 'center' }}>
          <CircularProgress size={24} />
        </Toolbar>
      </StyledHeader>
    );
  }

  return (
    <StyledHeader>
      <Toolbar sx={{ 
        height: '100%', 
        px: isSmall ? 1 : 2, 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Left side - Vendor Logo and Name */}
        <LogoContainer>
          {vendorData?.logo ? (
            <Avatar
              src={`https://api.boldeats.in/${vendorData.logo}`}
              alt={vendorData.name}
              sx={{ 
                width: isSmall ? 40 : 48, 
                height: isSmall ? 40 : 48,
                border: '2px solid #1976d2'
              }}
            />
          ) : (
            <RestaurantIcon 
              sx={{ 
                fontSize: isSmall ? 28 : 32, 
                color: '#1976d2',
                position: 'relative',
                top: '2px'
              }} 
            />
          )}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: '#1976d2',
              fontSize: isSmall ? '0.9rem' : '1.1rem',
              display: { xs: 'none', sm: 'block' }
            }}
          >
            {vendorData?.name || 'Vendor Panel'}
          </Typography>
        </LogoContainer>

        {/* Right side - Logout Button and Menu */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={handleMenuClick}
            sx={{
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
              }
            }}
          >
            <MoreVertIcon />
          </IconButton>
          <StyledLogoutButton
            variant="outlined"
            startIcon={!isSmall && <LogoutIcon />}
            onClick={handleLogout}
          >
            {isSmall ? <LogoutIcon /> : 'Logout'}
          </StyledLogoutButton>
        </Box>
      </Toolbar>

      {/* Policy Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            mt: 1,
            minWidth: 200,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
            borderRadius: 2,
          }
        }}
      >
        <MenuItem onClick={() => handlePolicyClick('privacy')}>
          <ListItemIcon>
            <PrivacyTipIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Privacy Policy" />
        </MenuItem>
        <MenuItem onClick={() => handlePolicyClick('terms')}>
          <ListItemIcon>
            <DescriptionIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Terms & Conditions" />
        </MenuItem>
        <MenuItem onClick={() => handlePolicyClick('refund')}>
          <ListItemIcon>
            <CancelIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Refund & Cancellation Policy" />
        </MenuItem>
      </Menu>

      {/* Policy Dialog */}
      <Dialog
        open={policyDialog.open}
        onClose={handleClosePolicyDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '80vh'
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #e0e0e0'
        }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1976d2' }}>
            {policyDialog.title}
          </Typography>
          <IconButton
            onClick={handleClosePolicyDialog}
            sx={{
              color: '#666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              }
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Typography 
            variant="body1" 
            sx={{ 
              whiteSpace: 'pre-line',
              lineHeight: 1.8,
              color: '#333',
              '& strong': {
                fontWeight: 600,
                color: '#1976d2'
              }
            }}
          >
            {policyDialog.content}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={handleClosePolicyDialog}
            variant="contained"
            sx={{
              backgroundColor: '#1976d2',
              '&:hover': {
                backgroundColor: '#1565c0',
              }
            }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </StyledHeader>
  );
};

export default VendorHeader; 