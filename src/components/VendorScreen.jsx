import React, { useState } from 'react';
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
  DialogContentText
} from '@mui/material';
import { Add, Edit, Delete, Visibility, MoreVert, ToggleOn, ToggleOff, Refresh } from '@mui/icons-material';
import AddVendorForm from './AddVendorForm';
import { useVendors } from '../contexts/VendorContext';
import { format } from 'date-fns';

const VendorScreen = () => {
  const { vendors, loading, error, fetchVendors, toggleVendorStatus, deleteVendor } = useVendors();
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

  const getStatusChip = (status) => {
    const color = status === 'Active' ? 'success' : 'error';
    return <Chip label={status} color={color} size="small" />;
  };

  const getPaymentStatusChip = (paymentStatus) => {
    let color = paymentStatus === 'Paid' ? 'success' : 'error';
    return <Chip label={paymentStatus} color={color} size="small" />;
  };

  const handleOpenAddForm = () => {
    setOpenAddForm(true);
  };

  const handleCloseAddForm = () => {
    setOpenAddForm(false);
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
  const handleToggleStatus = () => {
    if (!selectedVendor) return;
    
    toggleVendorStatus(selectedVendor.id);
    handleMenuClose();
  };
  
  // Edit vendor
  const handleEditVendor = () => {
    // In production, open edit form with selectedVendor data
    console.log('Edit vendor:', selectedVendor);
    handleMenuClose();
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
  const handleDeleteVendor = () => {
    if (!vendorToDelete) return;
    
    deleteVendor(vendorToDelete.id);
    handleDeleteConfirmClose();
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
                    <TableCell>SI No.</TableCell>
                    <TableCell>Vendor ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>No. of Active Orders</TableCell>
                    <TableCell>Actions</TableCell>
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
                        <TableCell>{vendor.phoneNumber}</TableCell>
                        <TableCell>{formatDate(vendor.joinedDate)}</TableCell>
                        <TableCell>{getStatusChip(vendor.status)}</TableCell>
                        <TableCell>{vendor.ordersCount}</TableCell>
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
            {selectedVendor && selectedVendor.status === 'Active' ? <ToggleOff color="error" /> : <ToggleOn color="success" />}
          </ListItemIcon>
          <ListItemText primary={selectedVendor && selectedVendor.status === 'Active' ? 'Mark as Inactive' : 'Mark as Active'} />
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
    </Box>
  );
};

export default VendorScreen; 