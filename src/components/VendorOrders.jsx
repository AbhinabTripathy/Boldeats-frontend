import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  IconButton, 
  Stack,
  Chip,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Button,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { 
  CalendarToday,
  PictureAsPdf,
  GridOn,
  InsertDriveFile,
  ViewList
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AnimatedTable from './AnimatedTable';
import { format, subDays, startOfDay, isToday, isYesterday } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useUsers } from '../contexts/UserContext';
import { useVendors } from '../contexts/VendorContext';

// Function to format number to Indian currency format
const formatIndianCurrency = (amount) => {
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
  
  // Ensure proper ₹ symbol display by replacing the default INR symbol
  return formatter.replace('INR', '₹').replace('₹ ', '₹');
};

const generateSampleData = () => {
  const names = ['John Doe', 'Jane Smith', 'Raj Patel', 'Priya Sharma', 'Amit Kumar', 'Sarah Wilson', 'Mike Ross', 'Rachel Green', 'Ross Geller', 'Monica Geller'];
  const addresses = [
    '42, Park Street, Mumbai, Maharashtra - 400001',
    '15, MG Road, Bangalore, Karnataka - 560001',
    '78, Civil Lines, New Delhi - 110001',
    '23, Anna Salai, Chennai, Tamil Nadu - 600002',
    '56, Salt Lake, Kolkata, West Bengal - 700064',
    '89, Baner Road, Pune, Maharashtra - 411045',
    '34, Jubilee Hills, Hyderabad, Telangana - 500033',
    '67, Gomti Nagar, Lucknow, Uttar Pradesh - 226010',
    '12, C.G. Road, Ahmedabad, Gujarat - 380009',
    '45, M.I. Road, Jaipur, Rajasthan - 302001'
  ];
  const paymentModes = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card', 'Cash on Delivery'];
  const prices = [1499, 2499, 3499, 4999, 6999, 8999, 999, 1999, 2999, 5999];
  const statuses = ['Pending', 'Accepted', 'Rejected']; // Add different statuses
  
  // Define vendors with both ID and name properties
  const vendors = [
    { id: 'V001', name: 'Restaurant A' },
    { id: 'V002', name: 'Restaurant B' },
    { id: 'V003', name: 'Restaurant C' },
    { id: 'V004', name: 'Restaurant D' },
    { id: 'V005', name: 'Restaurant E' }
  ];
  
  console.log('Sample vendors:', vendors);

  let sampleData = [];
  let id = 1;

  // Generate 15 orders for each of the last 7 days
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < 15; i++) {
      // For demonstration, randomly assign some orders as already accepted/rejected
      const randomStatus = day === 0 ? 'Pending' : statuses[Math.floor(Math.random() * statuses.length)];
      const vendor = vendors[Math.floor(Math.random() * vendors.length)];
      
      sampleData.push({
        id: id++,
        orderId: `ORD${String(id).padStart(3, '0')}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        customerName: names[Math.floor(Math.random() * names.length)],
        address: addresses[Math.floor(Math.random() * addresses.length)],
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        price: formatIndianCurrency(prices[Math.floor(Math.random() * prices.length)]),
        status: randomStatus,
        date: subDays(new Date(), day)
      });
    }
  }

  // Debug log a sample of orders
  console.log('Sample of generated orders with vendor IDs:', sampleData.slice(0, 3));
  
  return sampleData;
};

const VendorOrders = () => {
  const { users, loading: usersLoading } = useUsers();
  const { vendors, loading: vendorsLoading } = useVendors();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Generate orders based on user and vendor data
  const generateOrdersFromUsersAndVendors = useCallback((userList, vendorList) => {
    const paymentModes = ['Credit Card', 'UPI', 'Net Banking', 'Debit Card', 'Cash on Delivery'];
    const prices = [1499, 2499, 3499, 4999, 6999, 8999, 999, 1999, 2999, 5999];
    const statuses = ['Pending', 'Accepted', 'Rejected'];

    // Ensure vendors list has proper ID and name properties
    const validVendors = vendorList.filter(v => v && v.id);
    
    // Fallback vendors if vendor list is empty or invalid
    const fallbackVendors = [
      { id: 'V001', name: 'Restaurant A' },
      { id: 'V002', name: 'Restaurant B' },
      { id: 'V003', name: 'Restaurant C' },
      { id: 'V004', name: 'Restaurant D' },
      { id: 'V005', name: 'Restaurant E' }
    ];
    
    // Use validVendors if available, otherwise use fallbackVendors
    const vendors = validVendors.length > 0 ? validVendors : fallbackVendors;
    
    console.log('Using vendors for orders:', vendors.map(v => `${v.id}: ${v.name || 'Unknown'}`));

    let ordersData = [];
    let id = 1;

    // Generate 3-5 orders for each user
    userList.forEach(user => {
      // Get user-specific data
      const orderCount = Math.floor(Math.random() * 3) + 3; // 3-5 orders per user
      
      for (let i = 0; i < orderCount; i++) {
        // For demonstration, randomly assign some orders as already accepted/rejected
        const randomStatus = i === 0 ? 'Pending' : statuses[Math.floor(Math.random() * statuses.length)];
        
        const orderId = `ORD${String(id).padStart(3, '0')}`;
        
        // Check if this order ID exists in the user's orders array (from user data)
        const isKnownOrder = user.orders && user.orders.includes(orderId);
        
        // Use actual vendor data, with fallback
        const vendorIndex = Math.floor(Math.random() * vendors.length);
        const randomVendor = vendors[vendorIndex];
        
        // Ensure vendor has an ID and name
        const vendorId = randomVendor.id || `V${String(vendorIndex+1).padStart(3, '0')}`;
        const vendorName = randomVendor.name || `Vendor ${vendorIndex+1}`;
        
        console.log(`Creating order for ${user.name} with vendorId: ${vendorId}, vendorName: ${vendorName}`);
        
        ordersData.push({
          id: id++,
          orderId: orderId,
          vendorId: vendorId,
          vendorName: vendorName,
          userId: user.id,
          customerName: user.name,
          address: user.address,
          paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
          price: formatIndianCurrency(prices[Math.floor(Math.random() * prices.length)]),
          status: isKnownOrder ? 'Pending' : randomStatus, // Keep known orders pending for demo
          date: subDays(new Date(), Math.floor(Math.random() * 7)) // Random date in the last week
        });
      }
    });

    console.log('Sample of generated orders with vendorIds:', 
      ordersData.slice(0, 3).map(o => ({ 
        orderId: o.orderId, 
        vendorId: o.vendorId, 
        vendorName: o.vendorName 
      })));
      
    return ordersData;
  }, []);
  
  // Initialize orders from localStorage, merging with new orders if needed
  const [orders, setOrders] = useState(() => {
    try {
      const savedOrders = localStorage.getItem('orders');
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        // Clear localStorage to force regeneration of orders with proper vendor IDs
        localStorage.removeItem('orders');
        console.log('Cleared localStorage to regenerate orders with vendor IDs');
        // We'll generate new orders below
      }
    } catch (error) {
      console.error("Error loading orders from localStorage:", error);
    }
    
    // Generate new sample data with user and vendor info
    console.log('Generating new orders with vendor IDs');
    console.log('Users loaded:', users.length);
    console.log('Vendors loaded:', vendors.length);
    
    const newOrders = (users.length > 0 && vendors.length > 0) ? 
      generateOrdersFromUsersAndVendors(users, vendors) : 
      generateSampleData();
    
    console.log('New orders generated with vendor IDs check:', 
      newOrders.slice(0, 3).map(o => ({ id: o.id, vendorId: o.vendorId })));
    return newOrders;
  });

  // Update orders when user and vendor data is available
  useEffect(() => {
    if (users.length > 0 && vendors.length > 0 && orders.length === 0) {
      console.log('Generating orders with updated user/vendor data');
      const newOrders = generateOrdersFromUsersAndVendors(users, vendors);
      console.log('New orders generated, first 3 vendor IDs:', 
        newOrders.slice(0, 3).map(o => o.vendorId));
      setOrders(newOrders);
    }
  }, [users, vendors, orders.length, generateOrdersFromUsersAndVendors]);

  // After initializing, verify orders have vendor IDs
  useEffect(() => {
    console.log('Current orders count:', orders.length);
    if (orders.length > 0) {
      console.log('First few orders vendor IDs:', 
        orders.slice(0, 5).map(o => o.vendorId || 'missing'));
    }
  }, [orders]);

  // Save orders to localStorage whenever they change
  React.useEffect(() => {
    try {
      localStorage.setItem('orders', JSON.stringify(orders));
    } catch (error) {
      console.error("Error saving orders to localStorage:", error);
    }
  }, [orders]);

  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [activeTab, setActiveTab] = useState(-1); // Set default to -1 for All Orders

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setDateRange({ from: null, to: null }); // Reset date range when tab changes
  };

  // Export functions
  const exportToCSV = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const csvData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Vendor ID': order.vendorId,
      'Customer Name': order.customerName,
      'Address': order.address,
      'Status': order.status,
      'Date': format(order.date, 'dd/MM/yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(csvData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'orders.csv');
  };

  const exportToPDF = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const doc = new jsPDF();

    // Add Unicode font support for ₹ symbol
    doc.addFont('https://fonts.gstatic.com/s/roboto/v29/KFOmCnqEu92Fr1Mu4mxP.ttf', 'Roboto', 'normal');
    doc.setFont('Roboto');

    const tableColumn = ['Order ID', 'Vendor ID', 'Customer', 'Status', 'Date'];
    const tableRows = filteredOrders.map(order => [
      order.orderId,
      order.vendorId,
      order.customerName,
      order.status,
      format(order.date, 'dd/MM/yyyy')
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
      theme: 'grid',
      styles: {
        font: 'Roboto',
        fontSize: 10,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Order ID
        1: { cellWidth: 30 }, // Vendor ID
        2: { cellWidth: 40 }, // Customer
        3: { cellWidth: 30 }, // Status
        4: { cellWidth: 30 } // Date
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 11,
        fontStyle: 'bold'
      }
    });

    doc.save(`orders_${format(new Date(), 'dd-MM-yyyy')}.pdf`);
  };

  const exportToExcel = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const excelData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
      'Vendor ID': order.vendorId,
      'Customer Name': order.customerName,
      'Address': order.address,
      'Status': order.status,
      'Date': format(order.date, 'dd/MM/yyyy')
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Orders');
    XLSX.writeFile(workbook, 'orders.xlsx');
  };

  const handleAccept = (orderId) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        // Only change status if it's currently Pending
        if (order.orderId === orderId && order.status === 'Pending') {
          return { ...order, status: 'Accepted' };
        }
        return order;
      });
      return updatedOrders;
    });
  };

  const handleReject = (orderId) => {
    setOrders(prevOrders => {
      const updatedOrders = prevOrders.map(order => {
        // Only change status if it's currently Pending
        if (order.orderId === orderId && order.status === 'Pending') {
          return { ...order, status: 'Rejected' };
        }
        return order;
      });
      return updatedOrders;
    });
  };

  const columns = [
    { 
      id: 'orderId', 
      label: 'Order ID',
      width: 120,
      minWidth: 100
    },
    { 
      id: 'customerName', 
      label: 'Customer Name',
      width: 150,
      minWidth: 120
    },
    { 
      id: 'address', 
      label: 'Address',
      width: 200,
      minWidth: 150,
      hide: isMobile // Hide address on mobile
    },
    { 
      id: 'status', 
      label: 'Status',
      width: 120,
      minWidth: 100,
      render: (row) => (
        <Chip 
          label={row.status} 
          color={
            row.status === 'Pending' ? 'warning' : 
            row.status === 'Accepted' ? 'success' : 
            row.status === 'Rejected' ? 'error' : 
            'default'
          }
          size={isMobile ? "small" : "medium"}
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 200,
      minWidth: 150,
      align: 'center',
      render: (row) => {
        if (row.status === 'Pending') {
          return (
            <Stack 
              direction={isMobile ? "column" : "row"} 
              spacing={1} 
              justifyContent="center"
            >
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                onClick={() => handleAccept(row.orderId)}
                sx={{
                  bgcolor: '#4caf50',
                  '&:hover': {
                    bgcolor: '#388e3c'
                  },
                  minWidth: isMobile ? '60px' : '70px',
                  height: isMobile ? '24px' : '30px'
                }}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                onClick={() => handleReject(row.orderId)}
                sx={{
                  bgcolor: '#f44336',
                  '&:hover': {
                    bgcolor: '#d32f2f'
                  },
                  minWidth: isMobile ? '60px' : '70px',
                  height: isMobile ? '24px' : '30px'
                }}
              >
                Reject
              </Button>
            </Stack>
          );
        }
        return null;
      }
    }
  ].filter(col => !col.hide); // Filter out hidden columns

  const getTabLabel = (index) => {
    if (index === -1) return 'All Orders';
    switch(index) {
      case 0:
        return 'Today';
      case 1:
        return 'Yesterday';
      default:
        return format(subDays(new Date(), index), 'dd MMM yyyy');
    }
  };

  const filterDataByDate = (data, tabIndex) => {
    // If no data, return empty array to prevent errors
    if (!data || data.length === 0) {
      return [];
    }

    // If date range is selected, use that instead of tabs
    if (dateRange.from && dateRange.to) {
      // Ensure both dates are valid and create proper interval
      const start = startOfDay(new Date(dateRange.from));
      const end = startOfDay(new Date(dateRange.to));
      
      // Make sure we have a valid interval (start date is before or equal to end date)
      if (start > end) {
        return data; // Return all data if interval is invalid
      }

      return data.filter(order => {
        const orderDate = startOfDay(new Date(order.date));
        return orderDate >= start && orderDate <= end;
      });
    }

    // If All Orders tab is selected (-1), return all orders
    if (tabIndex === -1) {
      return data;
    }

    // For day-specific tabs
    try {
      const today = startOfDay(new Date());
      
      switch(tabIndex) {
        case 0: // Today
          return data.filter(order => {
            const orderDate = new Date(order.date);
            return isToday(orderDate);
          });
        case 1: // Yesterday
          return data.filter(order => {
            const orderDate = new Date(order.date);
            return isYesterday(orderDate);
          });
        default: // Other days
          const targetDate = startOfDay(subDays(today, tabIndex));
          return data.filter(order => {
            const orderDate = startOfDay(new Date(order.date));
            return orderDate.getTime() === targetDate.getTime();
          });
      }
    } catch (error) {
      console.error("Error filtering orders by date:", error);
      return data; // Return all data in case of error
    }
  };

  // Ensure we have data to display
  const filteredData = filterDataByDate(orders, activeTab);

  // Show loading state when users or vendors data is loading
  if ((usersLoading || vendorsLoading) && orders.length === 0) {
    return (
      <Box sx={{ p: 3, mt: 8, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      p: { xs: 1, sm: 2, md: 3 }, 
      mt: { xs: 7, sm: 8 }
    }}>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        justifyContent="space-between" 
        alignItems={{ xs: 'stretch', sm: 'center' }} 
        sx={{ mb: { xs: 2, sm: 3 } }}
        spacing={2}
      >
        <Box /> {/* Empty box for spacing */}
        <Stack 
          direction="row" 
          spacing={1}
          sx={{
            flexWrap: 'wrap',
            gap: 1,
            justifyContent: { xs: 'center', sm: 'flex-end' }
          }}
        >
          <Tooltip title="Export to CSV">
            <IconButton 
              onClick={exportToCSV}
              sx={{
                backgroundColor: '#E3F2FD',
                '&:hover': {
                  backgroundColor: '#BBDEFB',
                },
                width: { xs: 35, sm: 40 },
                height: { xs: 35, sm: 40 }
              }}
            >
              <InsertDriveFile color="primary" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to PDF">
            <IconButton 
              onClick={exportToPDF}
              sx={{
                backgroundColor: '#FFEBEE',
                '&:hover': {
                  backgroundColor: '#FFCDD2',
                },
                width: { xs: 35, sm: 40 },
                height: { xs: 35, sm: 40 }
              }}
            >
              <PictureAsPdf color="error" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export to Excel">
            <IconButton 
              onClick={exportToExcel}
              sx={{
                backgroundColor: '#E8F5E9',
                '&:hover': {
                  backgroundColor: '#C8E6C9',
                },
                width: { xs: 35, sm: 40 },
                height: { xs: 35, sm: 40 }
              }}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Date Filter Section */}
      <Paper sx={{ mb: { xs: 2, sm: 3 }, p: { xs: 1, sm: 2 } }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          spacing={2} 
          alignItems="center" 
          mb={2}
        >
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={dateRange.from}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, from: newValue }));
                setActiveTab(-1);
              }}
              slotProps={{ 
                textField: { 
                  size: isMobile ? "small" : "medium",
                  fullWidth: isMobile
                } 
              }}
            />
            <DatePicker
              label="To Date"
              value={dateRange.to}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, to: newValue }));
                setActiveTab(-1);
              }}
              slotProps={{ 
                textField: { 
                  size: isMobile ? "small" : "medium",
                  fullWidth: isMobile
                } 
              }}
            />
          </LocalizationProvider>
        </Stack>

        {/* Date Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ 
            borderBottom: 1, 
            borderColor: 'divider',
            '.MuiTab-root': {
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              minHeight: { xs: 40, sm: 48 },
              padding: { xs: '6px 12px', sm: '12px 16px' }
            }
          }}
        >
          <Tab 
            value={-1} 
            label="All Orders"
            icon={<ViewList fontSize={isMobile ? "small" : "medium"} />}
            iconPosition="start"
          />
          {Array.from({ length: 7 }, (_, i) => (
            <Tab 
              key={i} 
              value={i}
              label={getTabLabel(i)}
              icon={i === 0 ? <CalendarToday fontSize={isMobile ? "small" : "medium"} /> : null}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Orders Table */}
      <AnimatedTable
        columns={columns}
        data={filteredData}
        title={`Orders Table (${filteredData.length} orders)`}
        sx={{
          '& .MuiTableCell-root': {
            padding: { xs: '8px', sm: '16px' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' }
          }
        }}
      />
    </Box>
  );
};

export default VendorOrders; 