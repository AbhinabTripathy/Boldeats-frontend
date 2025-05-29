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
  Chip,
  Alert
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
    email: '',
    password: '',
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
    businessYear: '',
    menuType: '',
    mealType: '',
    menuSections: [{ 
      menuType: '', 
      mealType: '', 
      menuItems: [],
      menuPhotos: [] 
    }],
  });

  // For file previews
  const [logoPreview, setLogoPreview] = useState(null);
  const [gstinFilePreview, setGstinFilePreview] = useState(null);
  const [fssaiFilePreview, setFssaiFilePreview] = useState(null);
  const [menuPhotosPreviews, setMenuPhotosPreviews] = useState([[]]);

  // State for menu item form
  const [menuItem, setMenuItem] = useState('');
  const [menuItemPrice, setMenuItemPrice] = useState('');

  // State for loading when fetching bank details
  const [ifscLoading, setIfscLoading] = useState(false);
  
  // State for loading when fetching GST details
  const [gstLoading, setGstLoading] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});

  // Calculate years in business
  const calculateYearsInBusiness = (establishmentYear) => {
    if (!establishmentYear) return '';
    const currentYear = new Date().getFullYear();
    const years = currentYear - parseInt(establishmentYear, 10);
    return years > 0 ? `${years} years in business` : 'Established this year';
  };

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

  // Add new menu section
  const addMenuSection = () => {
    setFormData({
      ...formData,
      menuSections: [...formData.menuSections, { 
        menuType: '', 
        mealType: '', 
        menuItems: [],
        menuPhotos: []
      }]
    });
    setMenuPhotosPreviews([...menuPhotosPreviews, []]);
  };

  // Remove menu section
  const removeMenuSection = (index) => {
    const updatedSections = formData.menuSections.filter((_, i) => i !== index);
    const updatedPreviews = menuPhotosPreviews.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
    setMenuPhotosPreviews(updatedPreviews);
  };

  // Update menu section
  const updateMenuSection = (index, field, value) => {
    const updatedSections = [...formData.menuSections];
    updatedSections[index] = {
      ...updatedSections[index],
      [field]: value
    };
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
  };

  // Handle file input change for section-specific photos
  const handleSectionFileChange = (e, sectionIndex) => {
    const file = e.target.files[0];
    if (!file) return;

    const updatedSections = [...formData.menuSections];
    updatedSections[sectionIndex].menuPhotos = [...updatedSections[sectionIndex].menuPhotos, file];
    
    const updatedPreviews = [...menuPhotosPreviews];
    updatedPreviews[sectionIndex] = [...updatedPreviews[sectionIndex], URL.createObjectURL(file)];
    
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
    setMenuPhotosPreviews(updatedPreviews);
  };

  // Remove menu photo from specific section
  const removeMenuPhotoFromSection = (sectionIndex, photoIndex) => {
    const updatedSections = [...formData.menuSections];
    updatedSections[sectionIndex].menuPhotos = updatedSections[sectionIndex].menuPhotos.filter((_, i) => i !== photoIndex);
    
    const updatedPreviews = [...menuPhotosPreviews];
    URL.revokeObjectURL(updatedPreviews[sectionIndex][photoIndex]);
    updatedPreviews[sectionIndex] = updatedPreviews[sectionIndex].filter((_, i) => i !== photoIndex);
    
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
    setMenuPhotosPreviews(updatedPreviews);
  };

  // Add menu item to specific section with day-wise food items
  const addMenuItemToSection = (sectionIndex) => {
    const newItem = {
      monday: '',
      tuesday: '',
      wednesday: '',
      thursday: '',
      friday: '',
      saturday: '',
      sunday: ''
    };
    const updatedSections = [...formData.menuSections];
    updatedSections[sectionIndex].menuItems = [
      ...updatedSections[sectionIndex].menuItems,
      newItem
    ];
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
  };

  // Remove menu item from specific section
  const removeMenuItemFromSection = (sectionIndex, itemIndex) => {
    const updatedSections = [...formData.menuSections];
    updatedSections[sectionIndex].menuItems = updatedSections[sectionIndex].menuItems.filter((_, i) => i !== itemIndex);
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
  };

  // Update day-wise food item
  const updateDayFood = (sectionIndex, itemIndex, day, value) => {
    const updatedSections = [...formData.menuSections];
    updatedSections[sectionIndex].menuItems[itemIndex][day] = value;
    setFormData({
      ...formData,
      menuSections: updatedSections
    });
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
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    if (!formData.logo) newErrors.logo = 'Logo is required';
    if (!formData.fssai) newErrors.fssai = 'FSSAI number is required';
    if (!formData.fssaiFile) newErrors.fssaiFile = 'FSSAI certificate is required';
    if (!formData.accountName) newErrors.accountName = 'Account holder name is required';
    if (!formData.accountNumber) newErrors.accountNumber = 'Account number is required';
    if (!formData.ifscCode) newErrors.ifscCode = 'IFSC code is required';
    if (formData.menuSections.length === 0) newErrors.menuSections = 'At least one menu section is required';
    if (!formData.openingTime) newErrors.openingTime = 'Opening time is required';
    if (!formData.closingTime) newErrors.closingTime = 'Closing time is required';
    if (!formData.menuType) newErrors.menuType = 'Menu type is required';
    if (!formData.mealType) newErrors.mealType = 'Meal type is required';
    
    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }
    
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
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const handleSubmit = async () => {
    if (validateForm()) {
      setSubmitLoading(true);
      setSubmitError('');
      
      try {
        // Get auth token from localStorage
        const token = localStorage.getItem('adminToken');
        
        if (!token) {
          throw new Error('Authentication token not found. Please log in again.');
        }

        console.log('Using token for vendor submission:', token);
        
        // Create FormData object to handle file uploads
        const formDataToSend = new FormData();
        
        // Add form fields to FormData in the required format
        formDataToSend.append('name', formData.name);
        formDataToSend.append('email', formData.email);
        formDataToSend.append('password', formData.password);
        formDataToSend.append('contactNumber', formData.contactNumber);
        formDataToSend.append('address', formData.address);
        formDataToSend.append('logo', formData.logo);
        formDataToSend.append('gstin', formData.gstin || '');
        formDataToSend.append('fssaiNumber', formData.fssai);
        formDataToSend.append('fssaiCertificate', formData.fssaiFile);
        formDataToSend.append('accountHolderName', formData.accountName);
        formDataToSend.append('accountNumber', formData.accountNumber);
        formDataToSend.append('ifscCode', formData.ifscCode);
        formDataToSend.append('bankName', formData.bankName);
        formDataToSend.append('branch', formData.branch);
        
        // Format time values properly
        const formatTime = (date) => {
          if (!date) return '';
          return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        };
        
        formDataToSend.append('openingTime', formatTime(formData.openingTime));
        formDataToSend.append('closingTime', formatTime(formData.closingTime));
        formDataToSend.append('subscriptionPriceMonthly', formData.monthlyPrice);
        formDataToSend.append('menuType', formData.menuType);
        formDataToSend.append('mealType', formData.mealType);
        
        // Calculate years in business for API submission
        const currentYear = new Date().getFullYear();
        const yearsInBusiness = formData.businessYear ? (currentYear - parseInt(formData.businessYear, 10)) : 0;
        formDataToSend.append('yearsInBusiness', yearsInBusiness.toString());
        
        // Add menu sections as JSON string
        formDataToSend.append('menuSections', JSON.stringify(formData.menuSections));
        
        // Add menu photos
        if (formData.menuPhotos.length > 0) {
          formData.menuPhotos.forEach((photo, index) => {
            formDataToSend.append('menuPhotos', photo);
          });
        }
        
        // If GSTIN file is provided, add it
        if (formData.gstinFile) {
          formDataToSend.append('gstinCertificate', formData.gstinFile);
        }
        
        // For debugging - log all form data being sent
        console.log('Submitting form data:');
        for (let [key, value] of formDataToSend.entries()) {
          console.log(`${key}: ${value instanceof File ? value.name : value}`);
        }
        
        // Make POST request to API
        const response = await fetch('https://api.boldeats.in/api/vendors/add', {
          method: 'POST',
          headers: {
            // Do not set Content-Type header when using FormData
            // The browser will automatically set the correct Content-Type with boundary
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });
        
        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Response data:', data);
        
        if (!response.ok) {
          if (response.status === 401) {
            // Handle expired or invalid token
            localStorage.removeItem('adminToken');
            localStorage.removeItem('isAuthenticated');
            throw new Error('Your session has expired. Please log in again.');
          }
          throw new Error(data.message || 'Failed to add vendor');
        }
        
        // Log successful response
        console.log('Vendor added successfully:', data);
        
        // Show success message
        setSubmitSuccess(true);
        
        // Close dialog after short delay
        setTimeout(() => {
          handleClose();
        }, 2000);
      } catch (error) {
        console.error('Error adding vendor:', error);
        setSubmitError(error.message || 'Failed to add vendor. Please try again.');
      } finally {
        setSubmitLoading(false);
      }
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
        {submitSuccess && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Vendor added successfully!
          </Alert>
        )}
        {submitError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {submitError}
          </Alert>
        )}
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
              label="Email ID"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={!!errors.email}
              helperText={errors.email}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password || "Minimum 8 characters"}
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
            <TextField
              fullWidth
              label="Establishment Year"
              name="businessYear"
              type="number"
              placeholder="e.g., 2015"
              value={formData.businessYear}
              onChange={handleChange}
              inputProps={{ min: 1900, max: new Date().getFullYear() }}
              helperText={formData.businessYear ? calculateYearsInBusiness(formData.businessYear) : "Year when business was established"}
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
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                Menu Information
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={addMenuSection}
                size="small"
              >
                Add Menu Section
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
          </Grid>

          {formData.menuSections.map((section, sectionIndex) => (
            <Grid item xs={12} key={sectionIndex}>
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="subtitle2">
                    Menu Section {sectionIndex + 1}
                  </Typography>
                  {sectionIndex > 0 && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => removeMenuSection(sectionIndex)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Menu Type</InputLabel>
                      <Select
                        value={section.menuType || ''}
                        onChange={(e) => updateMenuSection(sectionIndex, 'menuType', e.target.value)}
                        label="Menu Type"
                        error={!!errors.menuType}
                      >
                        <MenuItem value="veg">Veg</MenuItem>
                        <MenuItem value="non-veg">Non-Veg</MenuItem>
                        <MenuItem value="both">Both</MenuItem>
                      </Select>
                      {errors.menuType && (
                        <FormHelperText error>{errors.menuType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Meal Type</InputLabel>
                      <Select
                        value={section.mealType || ''}
                        onChange={(e) => updateMenuSection(sectionIndex, 'mealType', e.target.value)}
                        label="Meal Type"
                        error={!!errors.mealType}
                      >
                        <MenuItem value="breakfast">Breakfast</MenuItem>
                        <MenuItem value="lunch">Lunch</MenuItem>
                        <MenuItem value="dinner">Dinner</MenuItem>
                      </Select>
                      {errors.mealType && (
                        <FormHelperText error>{errors.mealType}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="subtitle2">
                        Menu Items *
                      </Typography>
                      <Button 
                        variant="contained" 
                        startIcon={<Add />}
                        onClick={() => addMenuItemToSection(sectionIndex)}
                        size="small"
                      >
                        Add Menu Item
                      </Button>
                    </Box>
                    {errors.menuItems && (
                      <FormHelperText error>{errors.menuItems}</FormHelperText>
                    )}
                    
                    {section.menuItems.length > 0 && (
                      <Paper variant="outlined" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                          {section.menuItems.map((item, itemIndex) => (
                            <Grid item xs={12} key={itemIndex}>
                              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                  <Typography variant="subtitle2">
                                    Menu Item {itemIndex + 1}
                                  </Typography>
                                  <IconButton 
                                    size="small" 
                                    color="error" 
                                    onClick={() => removeMenuItemFromSection(sectionIndex, itemIndex)}
                                  >
                                    <Delete fontSize="small" />
                                  </IconButton>
                                </Box>
                                <Grid container spacing={2}>
                                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                                    <Grid item xs={12} sm={6} md={4} key={day}>
                                      <TextField
                                        fullWidth
                                        label={day.charAt(0).toUpperCase() + day.slice(1)}
                                        value={item[day]}
                                        onChange={(e) => updateDayFood(sectionIndex, itemIndex, day, e.target.value)}
                                        size="small"
                                        placeholder={`Enter food for ${day}`}
                                      />
                                    </Grid>
                                  ))}
                                </Grid>
                              </Paper>
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
                        onChange={(e) => handleSectionFileChange(e, sectionIndex)} 
                      />
                    </UploadButton>
                    
                    {menuPhotosPreviews[sectionIndex]?.length > 0 && (
                      <Box display="flex" flexWrap="wrap" mt={2}>
                        {menuPhotosPreviews[sectionIndex].map((preview, photoIndex) => (
                          <Box key={photoIndex} position="relative" m={1}>
                            <img 
                              src={preview} 
                              alt={`Menu preview ${photoIndex + 1}`} 
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
                              onClick={() => removeMenuPhotoFromSection(sectionIndex, photoIndex)}
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          ))}
          
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
        <Button onClick={handleClose} disabled={submitLoading}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={submitLoading}
          startIcon={submitLoading && <CircularProgress size={20} color="inherit" />}
        >
          {submitLoading ? 'Saving...' : 'Save Vendor'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddVendorForm; 