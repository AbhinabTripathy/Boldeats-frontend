import React, { useState } from 'react';
import { 
  Box, 
  IconButton, 
  Stack,
  Chip,
  Paper,
  Tabs,
  Tab,
  Tooltip,
  Button
} from '@mui/material';
import { 
  CalendarToday,
  PictureAsPdf,
  GridOn,
  InsertDriveFile,
} from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import AnimatedTable from './AnimatedTable';
import { format, subDays, startOfDay, isToday, isYesterday } from 'date-fns';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

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
  const vendorIds = ['V001', 'V002', 'V003', 'V004', 'V005']; // Add vendor IDs

  let sampleData = [];
  let id = 1;

  // Generate 15 orders for each of the last 7 days
  for (let day = 0; day < 7; day++) {
    for (let i = 0; i < 15; i++) {
      // For demonstration, randomly assign some orders as already accepted/rejected
      const randomStatus = day === 0 ? 'Pending' : statuses[Math.floor(Math.random() * statuses.length)];
      
      sampleData.push({
        id: id++,
        orderId: `ORD${String(id).padStart(3, '0')}`,
        vendorId: vendorIds[Math.floor(Math.random() * vendorIds.length)], // Add vendor ID
        customerName: names[Math.floor(Math.random() * names.length)],
        address: addresses[Math.floor(Math.random() * addresses.length)],
        paymentMode: paymentModes[Math.floor(Math.random() * paymentModes.length)],
        price: formatIndianCurrency(prices[Math.floor(Math.random() * prices.length)]),
        status: randomStatus,
        date: subDays(new Date(), day)
      });
    }
  }

  return sampleData;
};

const OrdersScreen = () => {
  // Initialize orders from localStorage, merging with new orders if needed
  const [orders, setOrders] = useState(() => {
    const savedOrders = localStorage.getItem('orders');
    if (savedOrders) {
      const parsedOrders = JSON.parse(savedOrders);
      // Convert stored date strings back to Date objects
      return parsedOrders.map(order => ({
        ...order,
        date: new Date(order.date)
      }));
    }
    // If no saved orders, generate new sample data
    const newOrders = generateSampleData();
    localStorage.setItem('orders', JSON.stringify(newOrders));
    return newOrders;
  });

  // Save orders to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('orders', JSON.stringify(orders));
  }, [orders]);

  const [dateRange, setDateRange] = useState({
    from: null,
    to: null
  });
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setDateRange({ from: null, to: null }); // Reset date range when tab changes
  };

  // Export functions
  const exportToCSV = () => {
    const filteredOrders = filterDataByDate(orders, activeTab);
    const csvData = filteredOrders.map(order => ({
      'Order ID': order.orderId,
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

    const tableColumn = ['Order ID', 'Customer', 'Status', 'Date'];
    const tableRows = filteredOrders.map(order => [
      order.orderId,
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
        1: { cellWidth: 40 }, // Customer
        2: { cellWidth: 30 }, // Status
        3: { cellWidth: 30 } // Date
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
      // Save to localStorage immediately after update
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
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
      // Save to localStorage immediately after update
      localStorage.setItem('orders', JSON.stringify(updatedOrders));
      return updatedOrders;
    });
  };

  const columns = [
    { 
      id: 'orderId', 
      label: 'Order ID',
      width: 120
    },
    { 
      id: 'vendorId', 
      label: 'Vendor ID',
      width: 100
    },
    { 
      id: 'customerName', 
      label: 'Customer Name',
      width: 150
    },
    { 
      id: 'address', 
      label: 'Address',
      width: 200
    },
    { 
      id: 'status', 
      label: 'Status',
      width: 120,
      render: (row) => (
        <Chip 
          label={row.status} 
          color={
            row.status === 'Pending' ? 'warning' : 
            row.status === 'Accepted' ? 'success' : 
            row.status === 'Rejected' ? 'error' : 
            'default'
          }
          size="small"
        />
      )
    },
    {
      id: 'actions',
      label: 'Actions',
      width: 200,
      align: 'center',
      render: (row) => {
        if (row.status === 'Pending') {
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="contained"
                size="small"
                onClick={() => handleAccept(row.orderId)}
                sx={{
                  bgcolor: '#4caf50',
                  '&:hover': {
                    bgcolor: '#388e3c'
                  },
                  minWidth: '70px',
                  height: '30px'
                }}
              >
                Accept
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={() => handleReject(row.orderId)}
                sx={{
                  bgcolor: '#f44336',
                  '&:hover': {
                    bgcolor: '#d32f2f'
                  },
                  minWidth: '70px',
                  height: '30px'
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
  ];

  const getTabLabel = (index) => {
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

    const today = startOfDay(new Date());
    
    switch(tabIndex) {
      case 0: // Today
        return data.filter(order => isToday(new Date(order.date)));
      case 1: // Yesterday
        return data.filter(order => isYesterday(new Date(order.date)));
      default: // Other days
        const targetDate = startOfDay(subDays(today, tabIndex));
        return data.filter(order => 
          startOfDay(new Date(order.date)).getTime() === targetDate.getTime()
        );
    }
  };

  return (
    <Box sx={{ p: 3, mt: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box /> {/* Empty box for spacing */}
        <Stack direction="row" spacing={1}>
          <Tooltip title="Export to CSV">
            <IconButton 
              onClick={exportToCSV}
              sx={{
                backgroundColor: '#E3F2FD',
                '&:hover': {
                  backgroundColor: '#BBDEFB',
                },
                width: 40,
                height: 40
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
                width: 40,
                height: 40
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
                width: 40,
                height: 40
              }}
            >
              <GridOn color="success" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Date Filter Section */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From Date"
              value={dateRange.from}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, from: newValue }));
                setActiveTab(-1); // Deselect tabs when using date range
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
            <DatePicker
              label="To Date"
              value={dateRange.to}
              onChange={(newValue) => {
                setDateRange(prev => ({ ...prev, to: newValue }));
                setActiveTab(-1); // Deselect tabs when using date range
              }}
              slotProps={{ textField: { size: 'small' } }}
            />
          </LocalizationProvider>
        </Stack>

        {/* Date Tabs */}
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {Array.from({ length: 7 }, (_, i) => (
            <Tab 
              key={i} 
              label={getTabLabel(i)}
              icon={i === 0 ? <CalendarToday fontSize="small" /> : null}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Paper>

      {/* Orders Table */}
      <AnimatedTable
        columns={columns}
        data={filterDataByDate(orders, activeTab)}
        title="Orders Table"
      />
    </Box>
  );
};

export default OrdersScreen; 