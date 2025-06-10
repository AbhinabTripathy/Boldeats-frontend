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
  Tooltip,
  useTheme,
  useMediaQuery,
  Stack
} from '@mui/material';
import { differenceInDays, addDays, parseISO } from 'date-fns';
import { Visibility } from '@mui/icons-material';
import VendorActiveUserDetails from './VendorActiveUserDetails';
import axios from 'axios';

const VendorActiveUsers = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [activeUsers, setActiveUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const fetchActiveUsers = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('vendorToken');
        const vendorUser = JSON.parse(localStorage.getItem('vendorUser'));
        const vendorId = vendorUser?.id;
        if (!token || !vendorId) throw new Error('No authentication token or vendor ID found');
        const response = await axios.get(`https://api.boldeats.in/api/vendors/active-users/${vendorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        setActiveUsers(response.data.data || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch active users');
        setActiveUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchActiveUsers();
  }, []);

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
        sx={{ minWidth: '40px', fontWeight: 'bold', fontSize: '0.9rem' }}
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

  // Calculate countdown (days left)
  const calculateCountdown = (startDate, duration) => {
    const today = new Date();
    const start = typeof startDate === 'string' ? parseISO(startDate) : new Date(startDate);
    const cycleEndDate = addDays(start, duration);
    const daysRemaining = differenceInDays(cycleEndDate, today);
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  return (
    <Box sx={{ 
      padding: { xs: 1, sm: 2, md: 3 },
      mt: { xs: 7, sm: 8 }
    }}>
      <Typography 
        variant="h4" 
        gutterBottom
        sx={{ fontSize: { xs: '1.5rem', sm: '2rem' }, mb: { xs: 2, sm: 3 } }}
      >
        Active Users
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: { xs: 350, sm: 440 } }}>
              <Table 
                stickyHeader 
                aria-label="active users table"
                sx={{ '& .MuiTableCell-root': { padding: { xs: '8px', sm: '16px' }, fontSize: { xs: '0.75rem', sm: '0.875rem' } } }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>User ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                      Subscription Type
                    </TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      Start Date
                    </TableCell>
                    <TableCell>Balance</TableCell>
                    <TableCell>Days Left</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {activeUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell>{user.userId || user.id}</TableCell>
                        <TableCell>
                          <Stack 
                            direction="row" 
                            alignItems="center" 
                            spacing={1}
                            sx={{ minWidth: { xs: '120px', sm: '150px' } }}
                          >
                            {user.profilePic && (
                              <img 
                                src={user.profilePic} 
                                alt={user.name} 
                                style={{ width: isMobile ? 24 : 30, height: isMobile ? 24 : 30, borderRadius: '50%', objectFit: 'cover' }} 
                              />
                            )}
                            <Typography 
                              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                            >
                              {user.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>
                          {renderSubscriptionDurationChip(user.duration || 30)}
                        </TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                          {formatDate(user.subscriptionDate || user.startDate)}
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}>
                            {user.pendingBalance || user.balance || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {renderCountdownChip(user.countdown !== undefined ? user.countdown : calculateCountdown(user.subscriptionDate || user.startDate, user.duration || 30))}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="View Details">
                            <IconButton
                              onClick={() => handleViewMore(user)}
                              size={isMobile ? "small" : "medium"}
                              sx={{ color: 'primary.main', '&:hover': { backgroundColor: 'rgba(25, 118, 210, 0.04)' } }}
                            >
                              <Visibility fontSize={isMobile ? "small" : "medium"} />
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
              sx={{
                '.MuiTablePagination-select': { fontSize: { xs: '0.75rem', sm: '0.875rem' } },
                '.MuiTablePagination-displayedRows': { fontSize: { xs: '0.75rem', sm: '0.875rem' } }
              }}
            />
          </>
        )}
      </Paper>
      <VendorActiveUserDetails
        open={modalOpen}
        onClose={handleCloseModal}
        user={selectedUser}
      />
    </Box>
  );
};

export default VendorActiveUsers; 