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
  Chip
} from '@mui/material';
import { differenceInDays, addDays, parseISO } from 'date-fns';

const SubscribedUsersScreen = () => {
  const [subscribedUsers, setSubscribedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Function to calculate countdown
  const calculateCountdown = (subscriptionDate, duration) => {
    const today = new Date();
    const startDate = parseISO(subscriptionDate);
    const cycleEndDate = addDays(startDate, duration);
    
    // Calculate days remaining
    const daysRemaining = differenceInDays(cycleEndDate, today);
    
    return daysRemaining > 0 ? daysRemaining : 0;
  };

  // Mock data - replace with actual API call
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockData = [
        { id: 1, name: 'John Doe', email: 'john@example.com', subscriptionDate: '2023-06-10', duration: 30 },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', subscriptionDate: '2023-06-15', duration: 15 },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com', subscriptionDate: '2023-06-05', duration: 30 },
        { id: 4, name: 'Emily Wilson', email: 'emily@example.com', subscriptionDate: '2023-06-01', duration: 15 },
        { id: 5, name: 'Michael Brown', email: 'michael@example.com', subscriptionDate: '2023-06-18', duration: 30 },
      ];
      
      // Add countdown to each user
      const usersWithCountdown = mockData.map(user => {
        return {
          ...user,
          countdown: calculateCountdown(user.subscriptionDate, user.duration)
        };
      });
      
      setSubscribedUsers(usersWithCountdown);
      setLoading(false);
    }, 1000);
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
        label={countdown > 0 ? `${countdown} days` : 'Expired'} 
        color={color}
        size="small"
      />
    );
  };

  // Function to render duration chip
  const renderDurationChip = (duration) => {
    return (
      <Chip 
        label={`${duration} days`}
        color="primary"
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

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Subscribed Users
      </Typography>
      
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer sx={{ maxHeight: 440 }}>
              <Table stickyHeader aria-label="subscribed users table">
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Subscription Date</TableCell>
                    <TableCell>Duration</TableCell>
                    <TableCell>Countdown</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {subscribedUsers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((user) => (
                      <TableRow hover key={user.id}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell>{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.subscriptionDate}</TableCell>
                        <TableCell>{renderDurationChip(user.duration)}</TableCell>
                        <TableCell>{renderCountdownChip(user.countdown)}</TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={subscribedUsers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default SubscribedUsersScreen; 