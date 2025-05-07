import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  CircularProgress,
  Divider,
  Paper,
  FormHelperText,
  Chip
} from '@mui/material';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { CloudUpload, Close, Add, Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Styled component for file upload
const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
}));

const AddVendorForm = ({ open, handleClose }) => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    contactNumber: '',
    logo: null,
    gstin: '',
    gstinFile: null,
    fssai: '',
    fssaiFile: null,
    accountName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
    menuItems: [],
    menuPhotos: [],
    openingTime: null,
    closingTime: null,
    weeklyPrice: '',
    monthlyPrice: '',
  });

  // For file previews
  const [logoPreview, setLogoPreview] = useState(null);
  const [gstinFilePreview, setGstinFilePreview] = useState(null);
  const [fssaiFilePreview, setFssaiFilePreview] = useState(null);
  const [menuPhotosPreviews, setMenuPhotosPreviews] = useState([]);

  // State for menu item form
  const [menuItem, setMenuItem] = useState('');
  const [menuItemPrice, setMenuItemPrice] = useState('');

  // State for loading when fetching bank details
  const [ifscLoading, setIfscLoading] = useState(false);
  
  // State for loading when fetching GST details
  const [gstLoading, setGstLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Clear validation error when field is edited
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  // Handle file input change
  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (!file) return;

    // Update state based on file type
    if (fileType === 'logo') {
      setFormData({ ...formData, logo: file });
      setLogoPreview(URL.createObjectURL(file));
    } else if (fileType === 'gstin') {
      setFormData({ ...formData, gstinFile: file });
      setGstinFilePreview(URL.createObjectURL(file));
    } else if (fileType === 'fssai') {
      setFormData({ ...formData, fssaiFile: file });
      setFssaiFilePreview(URL.createObjectURL(file));
    } else if (fileType === 'menuPhotos') {
      const newPhotos = [...formData.menuPhotos, file];
      setFormData({ ...formData, menuPhotos: newPhotos });
      setMenuPhotosPreviews([...menuPhotosPreviews, URL.createObjectURL(file)]);
    }
  };

  // Remove menu photo
  const removeMenuPhoto = (index) => {
    const updatedPhotos = [...formData.menuPhotos];
    updatedPhotos.splice(index, 1);
    
    const updatedPreviews = [...menuPhotosPreviews];
    URL.revokeObjectURL(updatedPreviews[index]);
    updatedPreviews.splice(index, 1);
    
    setFormData({ ...formData, menuPhotos: updatedPhotos });
    setMenuPhotosPreviews(updatedPreviews);
  };

  // Add menu item
  const addMenuItem = () => {
    if (menuItem && menuItemPrice) {
      const newItem = { name: menuItem, price: menuItemPrice };
      setFormData({ ...formData, menuItems: [...formData.menuItems, newItem] });
      setMenuItem('');
      setMenuItemPrice('');
    }
  };

  // Remove menu item
  const removeMenuItem = (index) => {
    const updatedItems = [...formData.menuItems];
    updatedItems.splice(index, 1);
    setFormData({ ...formData, menuItems: updatedItems });
  };

  // Fetch bank details based on IFSC code
  const fetchBankDetails = async () => {
    const ifscCode = formData.ifscCode.trim();
    if (ifscCode) {
      setIfscLoading(true);
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${ifscCode}`);
        
        if (!response.ok) {
          throw new Error('Invalid IFSC code or server error');
        }
        
        const bankData = await response.json();
        
        setFormData({
          ...formData,
          bankName: bankData.BANK,
          branch: bankData.BRANCH
        });
        setIfscLoading(false);
      } catch (error) {
        console.error('Error fetching bank details:', error);
        setIfscLoading(false);
        setErrors({
          ...errors,
          ifscCode: 'Unable to fetch bank details. Please check the IFSC code.'
        });
      }
    }
  };

  // Fetch vendor details based on GST number
  const fetchGstDetails = async () => {
    const gstNumber = formData.gstin.trim();
    // GST number should be 15 characters
    if (gstNumber && gstNumber.length === 15) {
      setGstLoading(true);
      try {
        // In a real application, this would be a call to your backend API
        // For demo purposes, we're simulating a delay and response
        
        // Simulate API call with setTimeout
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Extract state code from GST (first 2 digits)
        const stateCode = gstNumber.substring(0, 2);
        
        // Map of state codes to state names (simplified version)
        const stateMap = {
          '01': 'Jammu & Kashmir', '02': 'Himachal Pradesh', '03': 'Punjab', 
          '04': 'Chandigarh', '05': 'Uttarakhand', '06': 'Haryana',
          '07': 'Delhi', '08': 'Rajasthan', '09': 'Uttar Pradesh',
          '10': 'Bihar', '11': 'Sikkim', '12': 'Arunachal Pradesh',
          '13': 'Nagaland', '14': 'Manipur', '15': 'Mizoram',
          '16': 'Tripura', '17': 'Meghalaya', '18': 'Assam',
          '19': 'West Bengal', '20': 'Jharkhand', '21': 'Odisha',
          '22': 'Chhattisgarh', '23': 'Madhya Pradesh', '24': 'Gujarat',
          '27': 'Maharashtra', '29': 'Karnataka', '30': 'Goa',
          '32': 'Kerala', '33': 'Tamil Nadu', '34': 'Puducherry',
          '36': 'Telangana', '37': 'Andhra Pradesh'
        };
        
        // Generate a business name based on GST number for simulation
        // In reality, this would come from the API response
        const businessType = gstNumber.charAt(3) === 'P' ? 'Private Limited' : 'Limited';
        const randomName = `${stateMap[stateCode] || ''} Foods ${businessType}`;
        
        // Update vendor name with the fetched data
        setFormData({
          ...formData,
          name: randomName
        });
        
        setGstLoading(false);
      } catch (error) {
        console.error('Error fetching GST details:', error);
        setGstLoading(false);
        setErrors({
          ...errors,
          gstin: 'Unable to fetch vendor details. Please check the GST number.'
        });
      }
    }
  };

  // Handle IFSC code blur
  const handleIfscBlur = () => {
    if (formData.ifscCode && formData.ifscCode.trim() !== '') {
      fetchBankDetails();
    }
  };
  
  // Handle GST number blur
  const handleGstBlur = () => {
    if (formData.gstin && formData.gstin.trim() !== '') {
      fetchGstDetails();
    }
  };

  // Handle time change
  const handleTimeChange = (newTime, timeType) => {
    setFormData({ ...formData, [timeType]: newTime });
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    // Required fields validation
    if (!formData.name) newErrors.name = 'Vendor name is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.logo) newErrors.logo = 'Logo is required';
    if (!formData.fssai) newErrors.fssai = 'FSSAI number is required';
    if (!formData.fssaiFile) newErrors.fssaiFile = 'FSSAI certificate is required';
    if (!formData.accountName) newErrors.accountName = 'Account holder name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (formData.menuItems.length === 0) newErrors.menuItems = 'At least one menu item is required';
    if (!formData.openingTime) newErrors.openingTime = 'Opening time is required';
    if (!formData.closingTime) newErrors.closingTime = 'Closing time is required';
    if (!formData.weeklyPrice) newErrors.weeklyPrice = '15 days subscription price is required';
    if (!formData.monthlyPrice) newErrors.monthlyPrice = 'Monthly subscription price is required';
    
    // Phone number validation
    if (formData.contactNumber && !/^\d{10}$/.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid 10-digit phone number';
    }
    
    // IFSC code validation
    if (formData.ifscCode && !/^[A-Z]{4}\d{6,7}$/.test(formData.ifscCode)) {
      newErrors.ifscCode = 'Please enter a valid IFSC code (e.g., SBIN0001234)';
    }
    
    // GST number validation (if provided)
    if (formData.gstin && !/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/.test(formData.gstin)) {
      newErrors.gstin = 'Please enter a valid GST number (e.g., 29AABCX0892R1ZK)';
    }
    
    // Account number validation
    if (formData.accountNumber && !/^\d{9,18}$/.test(formData.accountNumber)) {
      newErrors.accountNumber = 'Please enter a valid account number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = () => {
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Here you would actually send the data to your backend
      handleClose();
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ style: { maxHeight: '90vh', overflowY: 'auto' } }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Add New Vendor</Typography>
          <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={3}>
          {/* Basic Information */}
          <Grid item xs={12}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Basic Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Vendor Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={!!errors.name}
              helperText={errors.name || (formData.gstin && formData.name ? "Auto-filled from GST" : "")}
              InputProps={{
                endAdornment: gstLoading && <CircularProgress size={20} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Contact Number"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              error={!!errors.contactNumber}
              helperText={errors.contactNumber}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              required
              label="Address"
              name="address"
              multiline
              rows={2}
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography variant="body2" gutterBottom>
              Vendor Logo *
            </Typography>
            <UploadButton
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              fullWidth
              error={!!errors.logo}
            >
              Upload Logo
              <VisuallyHiddenInput 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'logo')} 
              />
            </UploadButton>
            {errors.logo && (
              <FormHelperText error>{errors.logo}</FormHelperText>
            )}
            {logoPreview && (
              <Box mt={1} position="relative" display="inline-block">
                <img 
                  src={logoPreview} 
                  alt="Logo Preview" 
                  style={{ width: 100, height: 100, objectFit: 'contain' }} 
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    URL.revokeObjectURL(logoPreview);
                    setLogoPreview(null);
                    setFormData({ ...formData, logo: null });
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Grid>
          
          {/* Legal Information */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Legal Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="GSTIN (if available)"
              name="gstin"
              value={formData.gstin}
              onChange={handleChange}
              onBlur={handleGstBlur}
              InputProps={{
                endAdornment: gstLoading && <CircularProgress size={20} />,
              }}
              error={!!errors.gstin}
              helperText={errors.gstin}
            />
            {formData.gstin && (
              <>
                <Typography variant="body2" gutterBottom mt={1}>
                  GSTIN Document
                </Typography>
                <UploadButton
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  size="small"
                >
                  Upload GSTIN Document
                  <VisuallyHiddenInput 
                    type="file" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, 'gstin')} 
                  />
                </UploadButton>
                {gstinFilePreview && (
                  <Box mt={1} position="relative" display="inline-block">
                    <img 
                      src={gstinFilePreview} 
                      alt="GSTIN Preview" 
                      style={{ width: 100, height: 100, objectFit: 'contain' }} 
                    />
                    <IconButton
                      size="small"
                      sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                      onClick={() => {
                        URL.revokeObjectURL(gstinFilePreview);
                        setGstinFilePreview(null);
                        setFormData({ ...formData, gstinFile: null });
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </>
            )}
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="FSSAI Number"
              name="fssai"
              value={formData.fssai}
              onChange={handleChange}
              error={!!errors.fssai}
              helperText={errors.fssai}
            />
            <Typography variant="body2" gutterBottom mt={1}>
              FSSAI Certificate *
            </Typography>
            <UploadButton
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
              size="small"
              error={!!errors.fssaiFile}
            >
              Upload FSSAI Certificate
              <VisuallyHiddenInput 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => handleFileChange(e, 'fssai')} 
              />
            </UploadButton>
            {errors.fssaiFile && (
              <FormHelperText error>{errors.fssaiFile}</FormHelperText>
            )}
            {fssaiFilePreview && (
              <Box mt={1} position="relative" display="inline-block">
                <img 
                  src={fssaiFilePreview} 
                  alt="FSSAI Preview" 
                  style={{ width: 100, height: 100, objectFit: 'contain' }} 
                />
                <IconButton
                  size="small"
                  sx={{ position: 'absolute', top: 0, right: 0, bgcolor: 'rgba(255,255,255,0.7)' }}
                  onClick={() => {
                    URL.revokeObjectURL(fssaiFilePreview);
                    setFssaiFilePreview(null);
                    setFormData({ ...formData, fssaiFile: null });
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Box>
            )}
          </Grid>
          
          {/* Bank Account Details */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Bank Account Details
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Account Holder Name"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              error={!!errors.accountName}
              helperText={errors.accountName}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Account Number"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              error={!!errors.accountNumber}
              helperText={errors.accountNumber}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="IFSC Code"
              name="ifscCode"
              value={formData.ifscCode}
              onChange={handleChange}
              onBlur={handleIfscBlur}
              error={!!errors.ifscCode}
              helperText={errors.ifscCode}
              InputProps={{
                endAdornment: ifscLoading && <CircularProgress size={20} />,
              }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              disabled
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Branch"
              name="branch"
              value={formData.branch}
              disabled
            />
          </Grid>
          
          {/* Menu Information */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Menu Information
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Menu Items *
            </Typography>
            {errors.menuItems && (
              <FormHelperText error>{errors.menuItems}</FormHelperText>
            )}
            
            <Box display="flex" alignItems="flex-start" mb={2}>
              <TextField
                label="Item Name"
                value={menuItem}
                onChange={(e) => setMenuItem(e.target.value)}
                size="small"
                sx={{ mr: 1, flex: 2 }}
              />
              <TextField
                label="Price (₹)"
                value={menuItemPrice}
                onChange={(e) => setMenuItemPrice(e.target.value)}
                type="number"
                size="small"
                sx={{ mr: 1, flex: 1 }}
              />
              <Button 
                variant="contained" 
                startIcon={<Add />}
                onClick={addMenuItem}
                disabled={!menuItem || !menuItemPrice}
              >
                Add
              </Button>
            </Box>
            
            {formData.menuItems.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Added Menu Items
                </Typography>
                <Grid container spacing={1}>
                  {formData.menuItems.map((item, index) => (
                    <Grid item xs={12} key={index}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" p={1} borderBottom="1px solid #eee">
                        <Typography variant="body2">{item.name}</Typography>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body2" color="text.secondary" mr={1}>
                            ₹{item.price}
                          </Typography>
                          <IconButton size="small" color="error" onClick={() => removeMenuItem(index)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            )}
          </Grid>
          
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Menu Photos
            </Typography>
            <UploadButton
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
            >
              Upload Menu Photos
              <VisuallyHiddenInput 
                type="file" 
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'menuPhotos')} 
              />
            </UploadButton>
            
            {menuPhotosPreviews.length > 0 && (
              <Box display="flex" flexWrap="wrap" mt={2}>
                {menuPhotosPreviews.map((preview, index) => (
                  <Box key={index} position="relative" m={1}>
                    <img 
                      src={preview} 
                      alt={`Menu preview ${index + 1}`} 
                      style={{ width: 100, height: 100, objectFit: 'cover', borderRadius: 4 }} 
                    />
                    <IconButton
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: -10, 
                        right: -10, 
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        '&:hover': { bgcolor: 'background.paper' }
                      }}
                      onClick={() => removeMenuPhoto(index)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ))}
              </Box>
            )}
          </Grid>
          
          {/* Business Hours & Pricing */}
          <Grid item xs={12} mt={2}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Business Hours & Pricing
            </Typography>
            <Divider sx={{ mb: 2 }} />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Opening Time *"
                value={formData.openingTime}
                onChange={(newTime) => handleTimeChange(newTime, 'openingTime')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.openingTime,
                    helperText: errors.openingTime
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TimePicker
                label="Closing Time *"
                value={formData.closingTime}
                onChange={(newTime) => handleTimeChange(newTime, 'closingTime')}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    error: !!errors.closingTime,
                    helperText: errors.closingTime
                  }
                }}
              />
            </LocalizationProvider>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="15 days Subscription Price (₹)"
              name="weeklyPrice"
              type="number"
              value={formData.weeklyPrice}
              onChange={handleChange}
              error={!!errors.weeklyPrice}
              helperText={errors.weeklyPrice}
              InputProps={{ startAdornment: '₹' }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Monthly Subscription Price (₹)"
              name="monthlyPrice"
              type="number"
              value={formData.monthlyPrice}
              onChange={handleChange}
              error={!!errors.monthlyPrice}
              helperText={errors.monthlyPrice}
              InputProps={{ startAdornment: '₹' }}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
        >
          Save Vendor
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVendorForm; 