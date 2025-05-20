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
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import { differenceInDays, addDays, parseISO } from 'date-fns';
import { Visibility } from '@mui/icons-material';
import SubscriptionDetailsModal from './SubscriptionDetailsModal';
import { useUsers } from '../contexts/UserContext';
import { useVendors } from '../contexts/VendorContext';

const ActiveUsersScreen = () => {
  const { users, loading: usersLoading } = useUsers();
  const { vendors, loading: vendorsLoading } = useVendors();
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Function to calculate countdown
  const calculateCountdown = (subscriptionDate, duration) => {
    const today = new Date();
    const startDate = typeof subscriptionDate === 'string' 
      ? parseISO(subscriptionDate) 
      : new Date(subscriptionDate);
    const cycleEndDate = addDays(startDate, duration);
    
    // Calculate days remaining
    const daysRemaining = differenceInDays(cycleEndDate, today);
    
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  // Transform user data into active subscribers
  useEffect(() => {
    if (users.length > 0 && vendors.length > 0) {
      setLoading(true);
      
      // Filter active subscribers
      const subscribers = users
        .filter(user => user.subscriptionStatus === 'active')
        .map(user => {
          // Generate random subscription details
          const durations = [15, 30];
          const duration = durations[Math.floor(Math.random() * durations.length)];
          
          // Use join date as subscription date
          const subscriptionDate = user.joinDate;
          
          // Random pending balance
          const pendingBalances = ['₹1,499', '₹1,999', '₹2,499', '₹2,999'];
          const pendingBalance = pendingBalances[Math.floor(Math.random() * pendingBalances.length)];
          
          // Get a random active vendor
          const activeVendors = vendors.filter(v => v.status === 'Active');
          const randomVendor = activeVendors.length > 0 
            ? activeVendors[Math.floor(Math.random() * activeVendors.length)] 
            : vendors[0];
          
          return {
            id: user.id,
            userId: user.id,
            name: user.name,
            vendorId: randomVendor.id,
            vendorName: randomVendor.name,
            duration: duration,
            subscriptionDate: subscriptionDate,
            pendingBalance: pendingBalance,
            countdown: calculateCountdown(subscriptionDate, duration),
            email: user.email,
            phone: user.phone,
            address: user.address,
            profilePic: user.profilePic
          };
        });
      
      setActiveUsers(subscribers);
      setLoading(false);
    }
  }, [users, vendors]);

  // Function to render countdown chip with appropriate color
  const renderCountdownChip = (countdown) => {
    let color = 'success';
    
    if (countdown <= 3) {
      color = 'error';
    } else if (countdown <= 7) {
      color = 'warning';
    }
    
    return (
      <Chip 
        label={countdown > 0 ? countdown : '0'} 
        color={color}
        size="small"
        sx={{
          minWidth: '40px',
          fontWeight: 'bold',
          fontSize: '0.9rem'
        }}
      />
    );
  };

  // Function to render subscription duration chip
  const renderSubscriptionDurationChip = (duration) => {
    const color = duration === 30 ? 'primary' : 'secondary';
    return (
      <Chip 
        label={`${duration} days`}
        color={color}
        size="small"
      />
    );
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewMore = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedUser(null);
  };

  // Format date for display
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Active Users
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {(loading || usersLoading || vendorsLoading) ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="active users table">
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Vendor ID</TableCell>
                    <TableCell>Subscription Type</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>Pending Balance</TableCell>
                    <TableCell>Countdown</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell>{user.userId}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {user.profilePic && (
                              <img 
                                src={user.profilePic} 
                                alt={user.name} 
                                style={{ 
                                  width: 30, 
                                  height: 30, 
                                  borderRadius: '50%',
                                  objectFit: 'cover'
                                }} 
                              />
                            )}
                            {user.name}
                          </Box>
                        </TableCell>
                        <TableCell>{user.vendorId}</TableCell>
                        <TableCell>{renderSubscriptionDurationChip(user.duration)}</TableCell>
                        <TableCell>{formatDate(user.subscriptionDate)}</TableCell>
                        <TableCell>{user.pendingBalance}</TableCell>
                        <TableCell>{renderCountdownChip(user.countdown)}</TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewMore(user)}
                              size="small"
                              sx={{
                                color: 'primary.main',
                                '&:hover': {
                                  backgroundColor: 'rgba(25, 118, 210, 0.04)',
                                },
                              }}
                            >
                              <Visibility />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={activeUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      <SubscriptionDetailsModal
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </Box>
  );
};

export default ActiveUsersScreen; 