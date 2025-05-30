import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  Divider,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const VendorProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({
    basicInfo: {
      fullName: 'Nikita pradhan',
      contactNumber: '9632147853',
      establishmentYear: '2011',
      address: 'Mancheswar',
    },
    legalInfo: {
      gstin: 'VIT564165',
      fssaiNumber: '165465167549B',
      fssaiCertificate: '/path/to/certificate.pdf',
    },
    bankDetails: {
      accountHolderName: 'Nikita pradhan',
      accountNumber: '1344 1524 1235 1321',
      ifscCode: 'SBIN0033658745',
      bankName: 'SBI',
      branch: 'Rasulgarh',
    },
    menuInfo: {
      menuType: 'Veg',
      mealType: 'Breakfast',
      menuPhoto: '/path/to/menu-image.jpg',
      menuItems: {
        monday: 'Idli',
        tuesday: 'Vada',
        wednesday: 'Dosa',
        thursday: 'Dosa',
        friday: 'Dosa',
        saturday: 'Dosa',
        sunday: 'Dosa',
      },
    },
    businessHours: {
      openingTime: '10 AM',
      closingTime: '11 PM',
      subscriptionPrice15Days: '₹ 1500',
      subscriptionPriceMonthly: '₹ 2500',
    },
  });

  // Static vendor data
  const vendorData = {
    basicInfo: {
      fullName: 'Nikita pradhan',
      contactNumber: '9632147853',
      establishmentYear: '2011',
      address: 'Mancheswar',
    },
    legalInfo: {
      gstin: 'VIT564165',
      fssaiNumber: '165465167549B',
      fssaiCertificate: '/path/to/certificate.pdf',
    },
    bankDetails: {
      accountHolderName: 'Nikita pradhan',
      accountNumber: '1344 1524 1235 1321',
      ifscCode: 'SBIN0033658745',
      bankName: 'SBI',
      branch: 'Rasulgarh',
    },
    menuInfo: {
      menuType: 'Veg',
      mealType: 'Breakfast',
      menuPhoto: '/path/to/menu-image.jpg',
      menuItems: {
        monday: 'Idli',
        tuesday: 'Vada',
        wednesday: 'Dosa',
        thursday: 'Dosa',
        friday: 'Dosa',
        saturday: 'Dosa',
        sunday: 'Dosa',
      },
    },
    businessHours: {
      openingTime: '10 AM',
      closingTime: '11 PM',
      subscriptionPrice15Days: '₹ 1500',
      subscriptionPriceMonthly: '₹ 2500',
    },
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Here you would typically make an API call to save the changes
    console.log('Saving changes:', editedData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset the edited data to original data
    setEditedData(vendorData);
    setIsEditing(false);
  };

  const handleChange = (section, field, value) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleMenuItemChange = (day, value) => {
    setEditedData(prev => ({
      ...prev,
      menuInfo: {
        ...prev.menuInfo,
        menuItems: {
          ...prev.menuInfo.menuItems,
          [day]: value
        }
      }
    }));
  };

  return (
    <Box sx={{ p: 3, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Vendor Profile
        </Typography>
        {isEditing ? (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<SaveIcon />}
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<CancelIcon />}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={handleEdit}
            sx={{ backgroundColor: '#1976d2' }}
          >
            Edit
          </Button>
        )}
      </Box>

      {/* Basic Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Basic Information <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Full Name *"
              value={editedData.basicInfo.fullName}
              onChange={(e) => handleChange('basicInfo', 'fullName', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.basicInfo.fullName}
              helperText={isEditing && !editedData.basicInfo.fullName ? 'Full Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Contact Number *"
              value={editedData.basicInfo.contactNumber}
              onChange={(e) => handleChange('basicInfo', 'contactNumber', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.basicInfo.contactNumber}
              helperText={isEditing && !editedData.basicInfo.contactNumber ? 'Contact Number is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Establishment Year *"
              value={editedData.basicInfo.establishmentYear}
              onChange={(e) => handleChange('basicInfo', 'establishmentYear', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              helperText={isEditing && !editedData.basicInfo.establishmentYear ? 'Establishment Year is required' : 'Year when business was established'}
              required
              error={isEditing && !editedData.basicInfo.establishmentYear}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Address *"
              value={editedData.basicInfo.address}
              onChange={(e) => handleChange('basicInfo', 'address', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.basicInfo.address}
              helperText={isEditing && !editedData.basicInfo.address ? 'Address is required' : ''}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Legal Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Legal Information <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="GSTIN *"
              value={editedData.legalInfo.gstin}
              onChange={(e) => handleChange('legalInfo', 'gstin', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.legalInfo.gstin}
              helperText={isEditing && !editedData.legalInfo.gstin ? 'GSTIN is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="FSSAI Number *"
              value={editedData.legalInfo.fssaiNumber}
              onChange={(e) => handleChange('legalInfo', 'fssaiNumber', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.legalInfo.fssaiNumber}
              helperText={isEditing && !editedData.legalInfo.fssaiNumber ? 'FSSAI Number is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              FSSAI Certificate
            </Typography>
            <Box
              component="img"
              src="/path/to/fssai-certificate.jpg"
              alt="FSSAI Certificate"
              sx={{
                maxWidth: '300px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                p: 1,
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Bank Account Details */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Bank Account Details <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Holder Name *"
              value={editedData.bankDetails.accountHolderName}
              onChange={(e) => handleChange('bankDetails', 'accountHolderName', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.bankDetails.accountHolderName}
              helperText={isEditing && !editedData.bankDetails.accountHolderName ? 'Account Holder Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Account Number *"
              value={editedData.bankDetails.accountNumber}
              onChange={(e) => handleChange('bankDetails', 'accountNumber', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.bankDetails.accountNumber}
              helperText={isEditing && !editedData.bankDetails.accountNumber ? 'Account Number is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="IFSC Code *"
              value={editedData.bankDetails.ifscCode}
              onChange={(e) => handleChange('bankDetails', 'ifscCode', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.bankDetails.ifscCode}
              helperText={isEditing && !editedData.bankDetails.ifscCode ? 'IFSC Code is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Bank Name *"
              value={editedData.bankDetails.bankName}
              onChange={(e) => handleChange('bankDetails', 'bankName', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.bankDetails.bankName}
              helperText={isEditing && !editedData.bankDetails.bankName ? 'Bank Name is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Branch *"
              value={editedData.bankDetails.branch}
              onChange={(e) => handleChange('bankDetails', 'branch', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.bankDetails.branch}
              helperText={isEditing && !editedData.bankDetails.branch ? 'Branch is required' : ''}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Menu Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Menu Information <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Menu Type *"
              value={editedData.menuInfo.menuType}
              onChange={(e) => handleChange('menuInfo', 'menuType', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.menuInfo.menuType}
              helperText={isEditing && !editedData.menuInfo.menuType ? 'Menu Type is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Meal Type *"
              value={editedData.menuInfo.mealType}
              onChange={(e) => handleChange('menuInfo', 'mealType', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.menuInfo.mealType}
              helperText={isEditing && !editedData.menuInfo.mealType ? 'Meal Type is required' : ''}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Menu Photo
            </Typography>
            <Box
              component="img"
              src={editedData.menuInfo.menuPhoto}
              alt="Menu"
              sx={{
                maxWidth: '400px',
                width: '100%',
                height: 'auto',
                border: '1px solid #ddd',
                borderRadius: '4px',
                p: 1,
                mb: 3,
                objectFit: 'contain',
                backgroundColor: '#f5f5f5',
              }}
            />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Menu Items
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(editedData.menuInfo.menuItems).map(([day, item]) => (
                <Grid item xs={12} sm={6} md={4} key={day}>
                  <TextField
                    fullWidth
                    label={`${day.charAt(0).toUpperCase() + day.slice(1)} *`}
                    value={item}
                    onChange={(e) => handleMenuItemChange(day, e.target.value)}
                    InputProps={{ readOnly: !isEditing }}
                    required
                    error={isEditing && !item}
                    helperText={isEditing && !item ? `${day.charAt(0).toUpperCase() + day.slice(1)} is required` : ''}
                  />
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Grid>
      </Paper>

      {/* Business Hours & Pricing */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
          Business Hours & Pricing <span style={{ color: 'red', marginLeft: 4 }}>*</span>
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Opening Time *"
              value={editedData.businessHours.openingTime}
              onChange={(e) => handleChange('businessHours', 'openingTime', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.businessHours.openingTime}
              helperText={isEditing && !editedData.businessHours.openingTime ? 'Opening Time is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Closing Time *"
              value={editedData.businessHours.closingTime}
              onChange={(e) => handleChange('businessHours', 'closingTime', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.businessHours.closingTime}
              helperText={isEditing && !editedData.businessHours.closingTime ? 'Closing Time is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="15 Days Subscription Price *"
              value={editedData.businessHours.subscriptionPrice15Days}
              onChange={(e) => handleChange('businessHours', 'subscriptionPrice15Days', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.businessHours.subscriptionPrice15Days}
              helperText={isEditing && !editedData.businessHours.subscriptionPrice15Days ? '15 Days Subscription Price is required' : ''}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Monthly Subscription Price *"
              value={editedData.businessHours.subscriptionPriceMonthly}
              onChange={(e) => handleChange('businessHours', 'subscriptionPriceMonthly', e.target.value)}
              InputProps={{ readOnly: !isEditing }}
              required
              error={isEditing && !editedData.businessHours.subscriptionPriceMonthly}
              helperText={isEditing && !editedData.businessHours.subscriptionPriceMonthly ? 'Monthly Subscription Price is required' : ''}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default VendorProfile;