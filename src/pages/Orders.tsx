import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ShoppingCart as ShoppingCartIcon,
  LocalShipping as LocalShippingIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useApi } from '../contexts/ApiContext';

interface Order {
  id: number;
  order_type: string;
  supplier: string;
  order_date: string;
  delivery_date?: string;
  status: string;
  total_cost?: number;
  notes?: string;
  created_by: number;
  created_at: string;
  updated_at?: string;
}

interface OrderItem {
  id: number;
  order_id: number;
  item_id: number;
  quantity: number;
  unit_price?: number;
  total_price?: number;
  notes?: string;
  created_at: string;
  item?: {
    id: number;
    name: string;
    unit: string;
  };
}

interface Item {
  id: number;
  name: string;
  category: string;
  unit: string;
}

const Orders: React.FC = () => {
  const { api } = useApi();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [open, setOpen] = useState(false);
  const [itemsOpen, setItemsOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [formData, setFormData] = useState({
    order_type: 'weekly',
    supplier: '',
    order_date: dayjs(),
    delivery_date: dayjs().add(1, 'week'),
    total_cost: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [ordersRes, itemsRes] = await Promise.all([
        api.get('/orders/'),
        api.get('/items/'),
      ]);
      setOrders(ordersRes.data);
      setItems(itemsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderItems = async (orderId: number) => {
    try {
      const response = await api.get(`/order-items/?order_id=${orderId}`);
      setOrderItems(response.data);
    } catch (error) {
      console.error('Error fetching order items:', error);
    }
  };

  const handleOpen = (order?: Order) => {
    if (order) {
      setEditingOrder(order);
      setFormData({
        order_type: order.order_type,
        supplier: order.supplier,
        order_date: dayjs(order.order_date),
        delivery_date: order.delivery_date ? dayjs(order.delivery_date) : dayjs().add(1, 'week'),
        total_cost: order.total_cost || 0,
        notes: order.notes || '',
      });
    } else {
      setEditingOrder(null);
      setFormData({
        order_type: 'weekly',
        supplier: '',
        order_date: dayjs(),
        delivery_date: dayjs().add(1, 'week'),
        total_cost: 0,
        notes: '',
      });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingOrder(null);
  };

  const handleItemsOpen = async (order: Order) => {
    setSelectedOrder(order);
    await fetchOrderItems(order.id);
    setItemsOpen(true);
  };

  const handleItemsClose = () => {
    setItemsOpen(false);
    setSelectedOrder(null);
    setOrderItems([]);
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        order_date: formData.order_date.toISOString(),
        delivery_date: formData.delivery_date.toISOString(),
        total_cost: formData.total_cost || null,
        created_by: 1, // TODO: Get from current user
      };

      if (editingOrder) {
        await api.put(`/orders/${editingOrder.id}`, submitData);
      } else {
        await api.post('/orders/', submitData);
      }
      fetchData();
      handleClose();
    } catch (error) {
      console.error('Error saving order:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.delete(`/orders/${id}`);
        fetchData();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'default';
      case 'confirmed':
        return 'info';
      case 'delivered':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getOrderTypeColor = (type: string) => {
    switch (type) {
      case 'weekly':
        return 'primary';
      case 'monthly':
        return 'secondary';
      case 'quarterly':
        return 'success';
      case 'hygiene':
        return 'warning';
      case 'special':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
        <Typography>Loading orders...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Orders & Supplies</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Create Order
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Type</TableCell>
              <TableCell>Supplier</TableCell>
              <TableCell>Order Date</TableCell>
              <TableCell>Delivery Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Total Cost</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  <Chip
                    label={order.order_type.toUpperCase()}
                    color={getOrderTypeColor(order.order_type)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{order.supplier}</TableCell>
                <TableCell>{dayjs(order.order_date).format('MMM DD, YYYY')}</TableCell>
                <TableCell>
                  {order.delivery_date ? dayjs(order.delivery_date).format('MMM DD, YYYY') : '-'}
                </TableCell>
                <TableCell>
                  <Chip
                    label={order.status.toUpperCase()}
                    color={getStatusColor(order.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {order.total_cost ? `€${order.total_cost.toFixed(2)}` : '-'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleItemsOpen(order)}>
                    <ViewIcon />
                  </IconButton>
                  <IconButton onClick={() => handleOpen(order)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDelete(order.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Form Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingOrder ? 'Edit Order' : 'Create New Order'}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Order Type</InputLabel>
                  <Select
                    value={formData.order_type}
                    onChange={(e) => setFormData({ ...formData, order_type: e.target.value })}
                  >
                    <MenuItem value="weekly">Weekly</MenuItem>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="hygiene">Hygiene Items</MenuItem>
                    <MenuItem value="special">Special Items</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Supplier"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Order Date"
                  value={formData.order_date}
                  onChange={(newValue) => setFormData({ ...formData, order_date: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Delivery Date"
                  value={formData.delivery_date}
                  onChange={(newValue) => setFormData({ ...formData, delivery_date: newValue || dayjs() })}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Total Cost"
                  type="number"
                  value={formData.total_cost}
                  onChange={(e) => setFormData({ ...formData, total_cost: parseFloat(e.target.value) || 0 })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Notes"
                  multiline
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          </LocalizationProvider>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingOrder ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Order Items Dialog */}
      <Dialog open={itemsOpen} onClose={handleItemsClose} maxWidth="lg" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <ShoppingCartIcon />
            Order Items - {selectedOrder?.supplier} ({selectedOrder?.order_type.toUpperCase()})
          </Box>
        </DialogTitle>
        <DialogContent>
          {orderItems.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography variant="h6" color="textSecondary">
                No items in this order
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Add items to create a complete order
              </Typography>
            </Box>
          ) : (
            <List>
              {orderItems.map((item, index) => (
                <React.Fragment key={item.id}>
                  <ListItem>
                    <ListItemText
                      primary={`${item.item?.name || 'Unknown Item'}`}
                      secondary={`${item.quantity} ${item.item?.unit || ''} @ €${item.unit_price || 0} = €${item.total_price || 0}`}
                    />
                    {item.notes && (
                      <Typography variant="caption" color="textSecondary">
                        {item.notes}
                      </Typography>
                    )}
                  </ListItem>
                  {index < orderItems.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleItemsClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Orders;
