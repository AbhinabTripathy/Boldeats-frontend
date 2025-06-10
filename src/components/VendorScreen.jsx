import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  CircularProgress,
  Button,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem as MuiMenuItem
} from '@mui/material';
import { Add, Edit, Delete, Visibility, MoreVert, ToggleOn, ToggleOff, Refresh } from '@mui/icons-material';
import AddVendorForm from './AddVendorForm';
import { format } from 'date-fns';

const VendorScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddForm, setOpenAddForm] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  const [openEditForm, setOpenEditForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    address: '',
    gstin: '',
    fssaiNumber: '',
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    bankName: '',
    branch: '',
    openingTime: '',
    closingTime: '',
    subscriptionPrice15Days: '',
    subscriptionPriceMonthly: '',
    yearsInBusiness: '',
    menuType: '',
    mealTypes: []
  });

  const fetchVendors = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('adminToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('https://api.boldeats.in/api/vendors/list', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }

      const responseData = await response.json();
      
      if (responseData.success && responseData.data) {
        setVendors(responseData.data);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleRefresh = async () => {
    await fetchVendors();
    setLastRefresh(new Date());
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusChip = (isActive) => {
    const status = isActive ? 'Active' : 'Inactive';
    const color = isActive ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

  const handleOpenAddForm = () => {
    setOpenAddForm(true);
  };

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
  };

  const handleVendorAdded = async () => {
    // Refresh the vendors list
    await fetchVendors();
  };
  
  // Menu handlers
  const handleMenuOpen = (event, vendor) => {
    setAnchorEl(event.currentTarget);
    setSelectedVendor(vendor);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedVendor(null);
  };
  
  // Toggle vendor status
  const handleToggleStatus = async () => {
    if (!selectedVendor) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://api.boldeats.in/api/vendors/toggle-status/${selectedVendor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor status');
      }

      // Refresh the vendors list
      await fetchVendors();
      handleMenuClose();
    } catch (err) {
      setError(err.message);
      console.error('Error updating vendor status:', err);
    }
  };
  
  // Edit vendor
  const handleEditVendor = async () => {
    if (!selectedVendor) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://api.boldeats.in/api/vendors/${selectedVendor.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vendor details');
      }

      const responseData = await response.json();
      
      if (!responseData.success || !responseData.data) {
        throw new Error('Invalid response format');
      }

      const data = responseData.data;
      setEditingVendor(data);
      setEditFormData({
        name: data.name || '',
        email: data.email || '',
        phoneNumber: data.phoneNumber || '',
        address: data.address || '',
        gstin: data.gstin || '',
        fssaiNumber: data.fssaiNumber || '',
        accountHolderName: data.accountHolderName || '',
        accountNumber: data.accountNumber || '',
        ifscCode: data.ifscCode || '',
        bankName: data.bankName || '',
        branch: data.branch || '',
        openingTime: data.openingTime || '',
        closingTime: data.closingTime || '',
        subscriptionPrice15Days: data.subscriptionPrice15Days || '',
        subscriptionPriceMonthly: data.subscriptionPriceMonthly || '',
        yearsInBusiness: data.yearsInBusiness || '',
        menuType: data.menuType || '',
        mealTypes: data.mealTypes || []
      });
      setOpenEditForm(true);
      handleMenuClose();
    } catch (err) {
      setError(err.message);
      console.error('Error fetching vendor details:', err);
    }
  };

  const handleEditFormClose = () => {
    setOpenEditForm(false);
    setEditingVendor(null);
    setEditFormData({
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      gstin: '',
      fssaiNumber: '',
      accountHolderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: '',
      branch: '',
      openingTime: '',
      closingTime: '',
      subscriptionPrice15Days: '',
      subscriptionPriceMonthly: '',
      yearsInBusiness: '',
      menuType: '',
      mealTypes: []
    });
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://api.boldeats.in/api/vendors/${editingVendor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      });

      if (!response.ok) {
        throw new Error('Failed to update vendor');
      }

      // Refresh the vendors list
      await fetchVendors();
      handleEditFormClose();
    } catch (err) {
      setError(err.message);
      console.error('Error updating vendor:', err);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Delete confirmation
  const handleDeleteConfirmOpen = () => {
    setVendorToDelete(selectedVendor);
    setDeleteConfirmOpen(true);
    handleMenuClose();
  };
  
  const handleDeleteConfirmClose = () => {
    setDeleteConfirmOpen(false);
    setVendorToDelete(null);
  };
  
  // Delete vendor
  const handleDeleteVendor = async () => {
    if (!vendorToDelete) return;
    
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`https://api.boldeats.in/api/vendors/delete/${vendorToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete vendor');
      }

      const responseData = await response.json();
      
      if (!responseData.success) {
        throw new Error(responseData.message || 'Failed to delete vendor');
      }

      // Refresh the vendors list
      await fetchVendors();
      handleDeleteConfirmClose();
    } catch (err) {
      setError(err.message);
      console.error('Error deleting vendor:', err);
    }
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return format(d, 'yyyy-MM-dd');
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Vendors
        </Typography>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body2" color="text.secondary">
            Last updated: {format(lastRefresh, 'HH:mm:ss')}
          </Typography>
          <IconButton onClick={handleRefresh} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : <Refresh />}
          </IconButton>
          <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddForm}>
            Add New Vendor
          </Button>
        </Box>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          Error: {error}
        </Typography>
      )}
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="vendors table">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold' }}>SI No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Vendor ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Email ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Phone Number</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Joined Date</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((vendor, index) => (
                      <TableRow hover key={vendor.id}>
                        <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                        <TableCell>{vendor.id}</TableCell>
                        <TableCell>{vendor.name}</TableCell>
                        <TableCell>{vendor.email || 'N/A'}</TableCell>
                        <TableCell>{vendor.phoneNumber || 'N/A'}</TableCell>
                        <TableCell>{formatDate(vendor.createdAt)}</TableCell>
                        <TableCell>{getStatusChip(vendor.isActive)}</TableCell>
                        <TableCell>
                          <IconButton 
                            size="small"
                            aria-label="more"
                            aria-controls="vendor-menu"
                            aria-haspopup="true"
                            onClick={(e) => handleMenuOpen(e, vendor)}
                          >
                            <MoreVert />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={vendors.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Add Vendor Form Dialog */}
      <AddVendorForm 
        open={openAddForm} 
        handleClose={handleCloseAddForm}
        onVendorAdded={handleVendorAdded}
      />
      
      {/* Vendor Action Menu */}
      <Menu
        id="vendor-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleToggleStatus}>
          <ListItemIcon>
            {selectedVendor && selectedVendor.isActive ? <ToggleOff color="error" /> : <ToggleOn color="success" />}
          </ListItemIcon>
          <ListItemText primary={selectedVendor && selectedVendor.isActive ? 'Mark as Inactive' : 'Mark as Active'} />
        </MenuItem>
        <MenuItem onClick={handleEditVendor}>
          <ListItemIcon>
            <Edit fontSize="small" color="primary" />
          </ListItemIcon>
          <ListItemText primary="Edit Vendor" />
        </MenuItem>
        <MenuItem onClick={handleDeleteConfirmOpen}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText primary="Delete Vendor" />
        </MenuItem>
      </Menu>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={handleDeleteConfirmClose}
      >
        <DialogTitle>Delete Vendor</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete vendor "{vendorToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteVendor} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Vendor Form Dialog */}
      <Dialog 
        open={openEditForm} 
        onClose={handleEditFormClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Vendor</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleEditFormSubmit} sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Name"
                  name="name"
                  value={editFormData.name}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={editFormData.email}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={editFormData.phoneNumber}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Address"
                  name="address"
                  value={editFormData.address}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="GSTIN"
                  name="gstin"
                  value={editFormData.gstin}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="FSSAI Number"
                  name="fssaiNumber"
                  value={editFormData.fssaiNumber}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Holder Name"
                  name="accountHolderName"
                  value={editFormData.accountHolderName}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Account Number"
                  name="accountNumber"
                  value={editFormData.accountNumber}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="IFSC Code"
                  name="ifscCode"
                  value={editFormData.ifscCode}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Bank Name"
                  name="bankName"
                  value={editFormData.bankName}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Branch"
                  name="branch"
                  value={editFormData.branch}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Opening Time"
                  name="openingTime"
                  value={editFormData.openingTime}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Closing Time"
                  name="closingTime"
                  value={editFormData.closingTime}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="15 Days Subscription Price"
                  name="subscriptionPrice15Days"
                  type="number"
                  value={editFormData.subscriptionPrice15Days}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Monthly Subscription Price"
                  name="subscriptionPriceMonthly"
                  type="number"
                  value={editFormData.subscriptionPriceMonthly}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Years in Business"
                  name="yearsInBusiness"
                  type="number"
                  value={editFormData.yearsInBusiness}
                  onChange={handleEditFormChange}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Menu Type</InputLabel>
                  <Select
                    name="menuType"
                    value={editFormData.menuType}
                    onChange={handleEditFormChange}
                    label="Menu Type"
                    required
                  >
                    <MuiMenuItem value="veg">Veg</MuiMenuItem>
                    <MuiMenuItem value="non-veg">Non-Veg</MuiMenuItem>
                    <MuiMenuItem value="both">Both</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Meal Types</InputLabel>
                  <Select
                    multiple
                    name="mealTypes"
                    value={editFormData.mealTypes}
                    onChange={handleEditFormChange}
                    label="Meal Types"
                    required
                  >
                    <MuiMenuItem value="breakfast">Breakfast</MuiMenuItem>
                    <MuiMenuItem value="lunch">Lunch</MuiMenuItem>
                    <MuiMenuItem value="dinner">Dinner</MuiMenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditFormClose}>Cancel</Button>
          <Button onClick={handleEditFormSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorScreen; 