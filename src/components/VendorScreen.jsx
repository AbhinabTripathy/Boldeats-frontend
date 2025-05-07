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
  Chip
} from '@mui/material';
import { Add, Edit, Delete, Visibility } from '@mui/icons-material';
import AddVendorForm from './AddVendorForm';

const VendorScreen = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openAddForm, setOpenAddForm] = useState(false);

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { id: 1, name: 'Fresh Farms', email: 'info@freshfarms.com', joinedDate: '2023-01-10', status: 'Active', ordersCount: 23, paymentStatus: 'Paid' },
        { id: 2, name: 'Organic Meals', email: 'contact@organicmeals.com', joinedDate: '2023-02-15', status: 'Active', ordersCount: 16, paymentStatus: 'Unpaid' },
        { id: 3, name: 'Spice World', email: 'sales@spiceworld.com', joinedDate: '2023-03-05', status: 'Inactive', ordersCount: 32, paymentStatus: 'Paid' },
        { id: 4, name: 'Healthy Choices', email: 'support@healthychoices.com', joinedDate: '2023-01-25', status: 'Active', ordersCount: 18, paymentStatus: 'Unpaid' },
        { id: 5, name: 'Gourmet Delights', email: 'orders@gourmetdelights.com', joinedDate: '2023-02-08', status: 'Inactive', ordersCount: 9, paymentStatus: 'Paid' },
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
                    <TableCell>Email</TableCell>
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
                        <TableCell>{vendor.email}</TableCell>
                        <TableCell>{vendor.joinedDate}</TableCell>
                        <TableCell>{getStatusChip(vendor.status)}</TableCell>
                        <TableCell>{vendor.ordersCount}</TableCell>
                        <TableCell>{getPaymentStatusChip(vendor.paymentStatus)}</TableCell>
                        <TableCell>
                          <IconButton size="small" color="primary">
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="primary">
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" color="error">
                            <Delete fontSize="small" />
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
    </Box>
  );
};

export default VendorScreen; 