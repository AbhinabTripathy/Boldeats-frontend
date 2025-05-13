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
  DialogContentText
} from '@mui/material';
import { Add, Edit, Delete, Visibility, MoreVert, ToggleOn, ToggleOff } from '@mui/icons-material';
import AddVendorForm from './AddVendorForm';

const VendorScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddForm, setOpenAddForm] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);
  
  // Confirmation dialog state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState(null);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { id: 1, name: 'Fresh Farms', phoneNumber: '9876543210', joinedDate: '2023-01-10', status: 'Active', ordersCount: 23, paymentStatus: 'Paid' },
        { id: 2, name: 'Organic Meals', phoneNumber: '8765432109', joinedDate: '2023-02-15', status: 'Active', ordersCount: 16, paymentStatus: 'Unpaid' },
        { id: 3, name: 'Spice World', phoneNumber: '7654321098', joinedDate: '2023-03-05', status: 'Inactive', ordersCount: 32, paymentStatus: 'Paid' },
        { id: 4, name: 'Healthy Choices', phoneNumber: '6543210987', joinedDate: '2023-01-25', status: 'Active', ordersCount: 18, paymentStatus: 'Unpaid' },
        { id: 5, name: 'Gourmet Delights', phoneNumber: '5432109876', joinedDate: '2023-02-08', status: 'Inactive', ordersCount: 9, paymentStatus: 'Paid' },
      ];
      setVendors(mockData);
      setLoading(false);
    }, 1000);
  }, []);

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
    
    const updatedVendors = vendors.map(vendor => {
      if (vendor.id === selectedVendor.id) {
        const newStatus = vendor.status === 'Active' ? 'Inactive' : 'Active';
        return { ...vendor, status: newStatus };
      }
      return vendor;
    });
    
    setVendors(updatedVendors);
    handleMenuClose();
    
    // In production, make API call to update vendor status
    console.log(`Toggled status of vendor ${selectedVendor.id} to ${selectedVendor.status === 'Active' ? 'Inactive' : 'Active'}`);
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
    
    // In production, make API call to delete vendor
    const updatedVendors = vendors.filter(vendor => vendor.id !== vendorToDelete.id);
    setVendors(updatedVendors);
    
    console.log('Deleted vendor:', vendorToDelete);
    handleDeleteConfirmClose();
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Vendors
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleOpenAddForm}>
          Add New Vendor
        </Button>
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
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Phone Number</TableCell>
                    <TableCell>Joined Date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Orders</TableCell>
                    <TableCell>Payment Status</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vendors
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((vendor) => (
                      <TableRow hover key={vendor.id}>
                        <TableCell>{vendor.id}</TableCell>
                        <TableCell>{vendor.name}</TableCell>
                        <TableCell>{vendor.phoneNumber}</TableCell>
                        <TableCell>{vendor.joinedDate}</TableCell>
                        <TableCell>{getStatusChip(vendor.status)}</TableCell>
                        <TableCell>{vendor.ordersCount}</TableCell>
                        <TableCell>{getPaymentStatusChip(vendor.paymentStatus)}</TableCell>
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
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Delete Vendor?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete the vendor "{vendorToDelete?.name}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteConfirmClose}>Cancel</Button>
          <Button onClick={handleDeleteVendor} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default VendorScreen; 